import logging
import os
import json
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


class JSONFileHandler(logging.FileHandler):
    """
    Custom file handler that writes logs in JSON format.
    """
    def emit(self, record):
        log_entry = self.format(record)
        self.stream.write(log_entry + '\n')
        self.flush()


class JSONFormatter(logging.Formatter):
    """
    Custom formatter that outputs logs as JSON.
    """
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "module_path": getattr(record, 'module_path', ''),
            "message": record.getMessage(),
            "function": record.funcName
        }
        return json.dumps(log_record)


def get_logger(name: str = None) -> logging.Logger:
    """
    Get a configured logger with console and daily rotating JSON file handler.
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
        log_filename = os.path.join(logs_dir, f"{log_date}_logs.json")

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)

        # File handler (JSON)
        file_handler = JSONFileHandler(log_filename, mode='a', encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # Formatter
        json_formatter = JSONFormatter(datefmt='%Y-%m-%d %H:%M:%S')
        console_handler.setFormatter(json_formatter)
        file_handler.setFormatter(json_formatter)

        # Filter to add module_path
        module_filter = ModulePathFilter()
        console_handler.addFilter(module_filter)
        file_handler.addFilter(module_filter)

        # Add handlers to logger
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

    return logger