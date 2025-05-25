import yaml
import importlib
from langgraph.graph import StateGraph, START, END

from app.agent.schemas.state import State

class Manager:
    def __init__(self, config_path: str = "app/agent/config/agents_config.yaml"):
        self.config_path = config_path
        self.graph = self._build_graph_from_config()
        self.app = self.graph.compile()

    def _load_class(self, dotted_path: str):
        module_path, class_name = dotted_path.rsplit('.', 1)
        module = importlib.import_module(module_path)
        return getattr(module, class_name)

    def _build_graph_from_config(self) -> StateGraph:
        with open(self.config_path, "r") as file:
            config = yaml.safe_load(file)

        graph = StateGraph(State)

        # Add nodes
        for node in config["nodes"]:
            cls = self._load_class(node["module"])
            graph.add_node(node["name"], cls())

        # Add edges
        for edge in config["edges"]:
            edge_type = edge["type"]
            if edge_type == "direct":
                from_node = START if edge["from"] == "start" else edge["from"]
                to_node = END if edge["to"] == "__end__" else edge["to"]
                graph.add_edge(from_node, to_node)
            elif edge_type == "conditional":
                route_cls = self._load_class(edge["route"])
                from_node = edge["from"]
                to_mapping = {
                    k: (END if v == "__end__" else v)
                    for k, v in edge["to"].items()
                }
                graph.add_conditional_edges(from_node, route_cls(), to_mapping)
            else:
                raise ValueError(f"Unsupported edge type: {edge_type}")

        return graph

    def run(self, state: State) -> State:
        return self.app.invoke(state)
