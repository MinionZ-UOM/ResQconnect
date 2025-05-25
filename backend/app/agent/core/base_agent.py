from abc import ABC, abstractmethod
from app.agent.schemas.state import State

class BaseAgent(ABC):
    def __call__(self, state: State) -> State:
        return self.handle(state)

    @abstractmethod
    def handle(self, state: State) -> State:
        pass