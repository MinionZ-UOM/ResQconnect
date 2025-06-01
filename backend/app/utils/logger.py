import logging
import os
from datetime import datetime

class ModulePathFilter(logging.Filter):
    """
    Custom logging filter to inject the relative module path into the log record.
    """
    def filter(self, record):
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        relative_path = os.path.relpath(record.pathname, project_root)
        record.module_path = relative_path.replace(os.sep, '/')
        return True

def get_logger(name: str = None) -> logging.Logger:
    """
    Get a configured logger with console and daily rotating file handler.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)

        # Create logs directory if it doesn't exist
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        logs_dir = os.path.join(project_root, 'logs')
        os.makedirs(logs_dir, exist_ok=True)

        # Define the log filename with the date
        log_date = datetime.now().strftime('%d_%m_%Y')
        log_filename = os.path.join(logs_dir, f"{log_date}_logs.txt")

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)

        # File handler
        file_handler = logging.FileHandler(log_filename, mode='a', encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # Formatter
        formatter = logging.Formatter(
            fmt='[%(asctime)s] [%(module_path)s] [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        file_handler.setFormatter(formatter)

        # Filter to add module_path
        module_filter = ModulePathFilter()
        console_handler.addFilter(module_filter)
        file_handler.addFilter(module_filter)

        # Add handlers to logger
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger