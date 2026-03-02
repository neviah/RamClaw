// Tab navigation
const navBtns = document.querySelectorAll('nav button');
navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    navBtns.forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---- Run Task ----
const logEl = document.getElementById('log');
const taskEl = document.getElementById('task');
const runBtn = document.getElementById('run');

function appendLog(text) {
  logEl.textContent += text;
  logEl.scrollTop = logEl.scrollHeight;
}

async function executeTask(task) {
  runBtn.disabled = true;
  logEl.textContent = '';
  try {
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
  } catch (err) {
    appendLog(`\n[error] ${err.message}`);
  }
  runBtn.disabled = false;
  loadHistory();
  loadStatus();
}

runBtn.addEventListener('click', () => {
  const task = taskEl.value.trim();
  if (!task) return;
  executeTask(task);
});

// ---- Status / LM badge ----
let cachedStatus = null;

async function loadStatus() {
  const badge = document.getElementById('lm-badge');
  badge.className = 'checking';
  badge.textContent = 'LM Studio …';
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    cachedStatus = data;
    const { lmStudio, metrics } = data;
    if (lmStudio.reachable) {
      badge.className = 'ok';
      badge.textContent = '✔ LM Studio';
    } else {
      badge.className = 'err';
      badge.textContent = '✘ LM Studio';
    }
    updateLLMTab(lmStudio);
    updateMetricsTab(lmStudio, metrics);
  } catch (err) {
    badge.className = 'err';
    badge.textContent = '✘ LM Studio';
  }
}

function updateLLMTab(lmStudio) {
  document.getElementById('llm-endpoint').textContent = lmStudio.endpoint || '—';
  const statusEl = document.getElementById('llm-status-text');
  if (lmStudio.reachable) {
    statusEl.innerHTML = '<span style="color:#6ee7b7;font-weight:700;">Connected ✔</span>';
  } else {
    statusEl.innerHTML = '<span style="color:#fca5a5;font-weight:700;">Unreachable ✘</span> — start LM Studio and enable its local API server.';
  }
  const listEl = document.getElementById('model-list');
  if (lmStudio.models && lmStudio.models.length > 0) {
    listEl.innerHTML = lmStudio.models.map((m) => `<li>${m}</li>`).join('');
  } else {
    listEl.innerHTML = '<li style="color:#64748b">No models loaded in LM Studio</li>';
  }
}

function updateMetricsTab(lmStudio, metrics) {
  document.getElementById('m-tasks').textContent = metrics.taskCount ?? '—';
  document.getElementById('m-errors').textContent = metrics.errorCount ?? '—';
  if (metrics.lastRunAt) {
    const d = new Date(metrics.lastRunAt);
    document.getElementById('m-last').textContent = d.toLocaleTimeString();
  } else {
    document.getElementById('m-last').textContent = 'Never';
  }
  document.getElementById('m-lm').textContent = lmStudio.reachable ? '✔' : '✘';
  document.getElementById('m-lm').style.color = lmStudio.reachable ? '#6ee7b7' : '#fca5a5';
}

document.getElementById('refresh-llm').addEventListener('click', loadStatus);
document.getElementById('refresh-metrics').addEventListener('click', loadStatus);

// ---- History ----
async function loadHistory() {
  const tbody = document.getElementById('history-tbody');
  try {
    const res = await fetch('/api/history');
    const history = await res.json();
    if (history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:#64748b;text-align:center;">No tasks yet</td></tr>';
      return;
    }
    tbody.innerHTML = history.map((h, i) => {
      const d = new Date(h.startedAt);
      const exitBadge = h.exitCode === 0
        ? '<span class="badge badge-ok">OK</span>'
        : `<span class="badge badge-err">Exit ${h.exitCode ?? '?'}</span>`;
      const taskText = escapeHtml(h.task || '');
      return `<tr>
        <td><span class="task-text" title="${taskText}">${taskText}</span></td>
        <td style="white-space:nowrap;font-size:0.8rem;">${d.toLocaleString()}</td>
        <td>${exitBadge}</td>
        <td><button class="btn btn-secondary btn-sm" data-rerun="${i}">Re-run</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('[data-rerun]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const entry = history[parseInt(btn.dataset.rerun, 10)];
        taskEl.value = entry.task;
        // Switch to Run Task tab
        navBtns.forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        document.querySelector('[data-tab="tab-task"]').classList.add('active');
        document.getElementById('tab-task').classList.add('active');
        executeTask(entry.task);
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:#fca5a5;">Failed to load history: ${err.message}</td></tr>`;
  }
}

document.getElementById('refresh-history').addEventListener('click', loadHistory);
document.getElementById('clear-history').addEventListener('click', async () => {
  if (!confirm('Clear all task history?')) return;
  await fetch('/api/history', { method: 'DELETE' });
  loadHistory();
  loadStatus();
});

// ---- Settings ----
document.getElementById('load-key').addEventListener('click', async () => {
  const out = document.getElementById('pub-key-output');
  try {
    const res = await fetch('/api/public-key');
    const text = await res.text();
    out.textContent = text;
    out.style.display = 'block';
  } catch (err) {
    out.textContent = `Error: ${err.message}`;
    out.style.display = 'block';
  }
});

// ---- Helpers ----
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Init ----
loadStatus();
loadHistory();
