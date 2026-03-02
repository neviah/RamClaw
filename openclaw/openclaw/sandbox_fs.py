from pathlib import Path
from typing import Iterable


class SandboxViolation(Exception):
    pass


def assert_path_allowed(path: str | Path, allowed_read_roots: Iterable[Path], allowed_write_root: Path | None = None, write: bool = False) -> Path:
    target = Path(path).resolve()
    if write:
        if allowed_write_root is None:
            raise SandboxViolation("No write root configured")
        if not target.is_relative_to(allowed_write_root):  # type: ignore[attr-defined]
            if allowed_write_root not in target.parents:
                raise SandboxViolation(f"Write outside allowed root: {target}")
        return target

    for root in allowed_read_roots:
        root_resolved = Path(root).resolve()
        if target == root_resolved or root_resolved in target.parents:
            return target
    raise SandboxViolation(f"Read outside allowed roots: {target}")
