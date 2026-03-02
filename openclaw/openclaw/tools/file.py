from pathlib import Path


class FileTool:
    def write(self, path: str, content: str):
        Path(path).write_text(content)

    def read(self, path: str) -> str:
        return Path(path).read_text()

    def run(self, action: str, path: str, content: str | None = None):
        if action == 'write' and content is not None:
            return self.write(path, content)
        if action == 'read':
            return self.read(path)
        raise ValueError('Unsupported file action')
