import abc
from typing import Iterable, Dict, Any


class ProviderError(Exception):
    """Raised when a provider encounters a fatal error."""


class BaseProvider(abc.ABC):
    name = "base"

    @abc.abstractmethod
    def complete(self, messages: Iterable[Dict[str, Any]], tools: Dict[str, Any] | None = None) -> Iterable[str]:
        """Return a stream of text chunks for the given conversation."""

    @abc.abstractmethod
    def supports_tools(self) -> bool:
        """Return True when function/tool calling is supported."""
