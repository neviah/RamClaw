const logEl = document.getElementById('log');
const taskEl = document.getElementById('task');
const runBtn = document.getElementById('run');
const keyBtn = document.getElementById('showKey');
const workspaceLink = document.getElementById('workspaceLink');

workspaceLink.href = '/workspace';

function appendLog(text) {
  logEl.textContent += text;
  logEl.scrollTop = logEl.scrollHeight;
}

runBtn.addEventListener('click', async () => {
  const task = taskEl.value.trim();
  if (!task) return;
  runBtn.disabled = true;
  logEl.textContent = '';
  const res = await fetch('/api/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task })
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    appendLog(decoder.decode(value));
  }
  runBtn.disabled = false;
});

keyBtn.addEventListener('click', async () => {
  const res = await fetch('/api/public-key');
  const text = await res.text();
  appendLog(`\nPublic key:\n${text}\n`);
});
