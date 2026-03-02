import sys
from pathlib import Path
from typing import Dict, Any, Iterable, Generator

from .config import load_config, AppConfig
from .provider import LMStudioProvider
from .sandbox_fs import assert_path_allowed, SandboxViolation
from .tools import TOOLS


class Agent:
    def __init__(self, config: AppConfig):
        self.config = config
        self.provider = LMStudioProvider(
            endpoint=config.llm.endpoint,
            model=config.llm.model,
        )
        self.tools = TOOLS

    def _system_message(self) -> Dict[str, Any]:
        return {
            "role": "system",
            "content": (
                "You are RamClaw. You run fully locally, use LM Studio only, never call cloud models. "
                "All file writes must remain inside /sandbox/workspace."
            ),
        }

    def _apply_tool_guard(self, name: str, args: Dict[str, Any]) -> Any:
        if name == "file":
            # Enforce filesystem sandboxing
            path = args.get("path") or args.get("file") or args.get("target")
            if not path:
                raise SandboxViolation("File path missing")
            write = args.get("action") == "write" or args.get("content") is not None
            assert_path_allowed(path, self.config.sandbox.allowed_read_roots, self.config.sandbox.allowed_write_root, write=write)
        tool = self.tools.get(name)
        if not tool:
            raise ValueError(f"Tool {name} is not available")
        if hasattr(tool, "run"):
            return tool.run(**args)
        raise ValueError(f"Tool {name} has no run method")

    def run_task(self, prompt: str) -> Generator[str, None, None]:
        messages: Iterable[Dict[str, Any]] = [self._system_message(), {"role": "user", "content": prompt}]
        for chunk in self.provider.complete(messages):
            yield chunk

    def cli(self, prompt: str):
        for chunk in self.run_task(prompt):
            sys.stdout.write(chunk)
            sys.stdout.flush()


def main():
    config = load_config()
    agent = Agent(config)
    if len(sys.argv) > 1:
        task = " ".join(sys.argv[1:])
    else:
        task = input("Enter task: ")
    agent.cli(task)


if __name__ == "__main__":
    main()
