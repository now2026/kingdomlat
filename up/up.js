// Live Date & Clock
function updateTime() {
  const now = new Date();
  const dateEl = document.getElementById('live-date');
  const clockEl = document.getElementById('live-clock');
  
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
setInterval(updateTime, 1000);
updateTime();

// Listen Function (Native Speech API)
function listenTo(id) {
  const el = document.getElementById(id);
  if (!el || !window.speechSynthesis) return alert('Speech synthesis not supported.');
  window.speechSynthesis.cancel();
  const text = el.querySelector('p').textContent;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

// Save Function (Local .txt download)
function saveText(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const title = el.querySelector('h3').textContent;
  const text = el.querySelector('p').textContent;
  const blob = new Blob([`${title}\n\n${text}\n\nSource: kingdom.lat/up`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Upload Trigger (Client-side only)
document.getElementById('upload-trigger').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    // In a full OCR implementation, FileReader + WebAssembly would process here.
    // For now, this confirms local selection without cloud upload.
    alert(`Selected: ${file.name}\nProcessing locally. Your image never leaves this device.`);
    e.target.value = ''; // Reset
  }
});

// Fetch up.json
async function loadJSON() {
  const container = document.getElementById('json-display');
  try {
    const res = await fetch('up.json');
    if (!res.ok) throw new Error('File not found');
    const data = await res.text();
    // Try to parse as JSON, fallback to raw text
    try {
      const parsed = JSON.parse(data);
      container.textContent = JSON.stringify(parsed, null, 2);
    } catch {
      container.textContent = data;
    }
  } catch (err) {
    container.textContent = '⚠️ up.json not found or inaccessible. Create this file in the same folder to display its content here.';
  }
}
loadJSON();
