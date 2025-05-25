import os
import sys
from celery import Celery, shared_task

# Ensure Python can find 'app' module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Celery configuration for Redis Cloud
celery_app = Celery(
    'backend',
    broker='redis://default:2XerYGBfqv7m5sgeYIA97SW4uK14zf1D@redis-10106.crce182.ap-south-1-1.ec2.redns.redis-cloud.com:10106',
    backend='redis://default:2XerYGBfqv7m5sgeYIA97SW4uK14zf1D@redis-10106.crce182.ap-south-1-1.ec2.redns.redis-cloud.com:10106',
)

celery_app.conf.update(
    result_expires=3600,
    timezone="UTC",
    broker_connection_timeout=30,
    task_time_limit=300,
    broker_transport_options={
        'max_retries': 5,
        'visibility_timeout': 3600
    },
)

# Import  internal logic directly here
from app.agent.core.manager import Manager

# Define your task in the same file
@shared_task(bind=True, name='app.agent.tasks.agentic_tasks.run_agentic_workflow')
def run_agentic_workflow(self, agent_payload: dict):
    """
    This task runs the agentic workflow asynchronously.
    """
    try:
        manager = Manager()
        response = manager.run(agent_payload)
        return response
    except Exception as e:
        self.retry(exc=e)
