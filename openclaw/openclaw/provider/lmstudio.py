import json
from typing import Iterable, Dict, Any, Generator
import requests

from .base import BaseProvider, ProviderError


class LMStudioProvider(BaseProvider):
    name = "lmstudio"

    def __init__(self, endpoint: str, model: str, timeout: int = 60, headers: Dict[str, str] | None = None):
        self.endpoint = endpoint.rstrip('/')
        self.model = model
        self.timeout = timeout
        self.headers = headers or {}

    def _build_payload(self, messages: Iterable[Dict[str, Any]], tools: Dict[str, Any] | None) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": list(messages),
            "stream": True,
        }
        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"
        return payload

    def complete(self, messages: Iterable[Dict[str, Any]], tools: Dict[str, Any] | None = None) -> Generator[str, None, None]:
        url = f"{self.endpoint}/chat/completions"
        payload = self._build_payload(messages, tools)
        try:
            resp = requests.post(url, json=payload, headers=self.headers, stream=True, timeout=self.timeout)
        except Exception as exc:  # pragma: no cover - network error
            raise ProviderError(f"Failed to reach LM Studio at {self.endpoint}: {exc}") from exc

        if resp.status_code != 200:
            raise ProviderError(f"LM Studio returned status {resp.status_code}: {resp.text}")

        for line in resp.iter_lines():
            if not line:
                continue
            if line.startswith(b"data: "):
                line = line[len(b"data: "):]
            if line == b"[DONE]":
                break
            try:
                data = json.loads(line)
                delta = data.get("choices", [{}])[0].get("delta", {})
                if "content" in delta and delta["content"]:
                    yield delta["content"]
                elif delta.get("tool_calls"):
                    # Forward raw tool call JSON to the agent for execution
                    yield json.dumps({"tool_calls": delta["tool_calls"]})
            except json.JSONDecodeError:
                continue

    def supports_tools(self) -> bool:
        return True


__all__ = ["LMStudioProvider", "ProviderError"]
