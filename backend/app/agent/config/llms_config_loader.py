import yaml
from pathlib import Path

class LLMConfig:
    def __init__(self, path: str = "app/agent/config/llms_config.yaml"):
        with open(Path(path), "r") as file:
            self.config = yaml.safe_load(file)

    def get_model(self, provider: str, task: str) -> str:
        return self.config[provider][task]
