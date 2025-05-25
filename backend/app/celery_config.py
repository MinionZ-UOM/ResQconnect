import os
import sys
from celery import Celery, shared_task
from redis import ConnectionPool, Redis

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# -------------------------------------------------------------------
# Shared Redis pool for any app-side Redis usage
# -------------------------------------------------------------------
REDIS_HOST     = "redis-16819.c212.ap-south-1-1.ec2.redns.redis-cloud.com"
REDIS_PORT     = 16819
REDIS_USERNAME = "default"
REDIS_PASSWORD = "VC5QOip29LYyzGgsPyFmFeyG38Amprc4"

_pool = ConnectionPool(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    max_connections=5,            # limit app’s own connections
)
shared_redis = Redis(connection_pool=_pool)

celery_app = Celery(
    'backend',
    broker=f'redis://default:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}',
    backend=None,              
)

celery_app.conf.update(
    result_expires=3600,
    timezone="UTC",
    broker_connection_timeout=30,
    task_time_limit=300,

    broker_pool_limit=5,           
    broker_transport_options={
        'max_connections': 5,
        'visibility_timeout': 3600,
    },

    # Worker concurrency & prefetch
    worker_concurrency=2,          
    worker_prefetch_multiplier=1,    

    task_acks_late=True,
    task_acks_on_failure_or_timeout=True,
    task_ignore_result=True,
)

from app.agent.core.manager import Manager

@shared_task(bind=True, name='agent_flow', max_retries=3, default_retry_delay=10)
def run_agentic_workflow(self, agent_payload: dict):
    """
    This task runs the agentic workflow asynchronously.
    """
    try:
        manager = Manager()
        response = manager.run(agent_payload)
        return response
    except Exception as e:
        print(f"[ERROR] Agentic workflow failed: {e}")
        raise self.retry(exc=e)
