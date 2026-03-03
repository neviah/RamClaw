from pathlib import Path
import json


class FileTool:
    def write(self, path: str, content: str):
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding='utf-8')
        return f"Wrote {len(content)} bytes to {target}"

    def read(self, path: str) -> str:
        return Path(path).read_text(encoding='utf-8')

    def append(self, path: str, content: str):
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('a', encoding='utf-8') as stream:
            stream.write(content)
        return f"Appended {len(content)} bytes to {target}"

    def mkdir(self, path: str):
        target = Path(path)
        target.mkdir(parents=True, exist_ok=True)
        return f"Created directory {target}"

    def list(self, path: str) -> str:
        target = Path(path)
        if not target.exists():
            raise FileNotFoundError(f"Path does not exist: {target}")
        items = sorted([entry.name for entry in target.iterdir()])
        return json.dumps(items)

    def run(self, action: str, path: str, content: str | None = None):
        if action == 'write' and content is not None:
            return self.write(path, content)
        if action == 'read':
            return self.read(path)
        if action == 'append' and content is not None:
            return self.append(path, content)
        if action == 'mkdir':
            return self.mkdir(path)
        if action == 'list':
            return self.list(path)
        raise ValueError('Unsupported file action')
