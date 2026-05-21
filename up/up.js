// Live Date & Clock
function updateTime() {
  const now = new Date();
  const dateEl = document.getElementById('live-date');
  const clockEl = document.getElementById('live-clock');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// Listen Function
function listenTo(id) {
  const el = document.getElementById(id);
  if (!el || !window.speechSynthesis) return alert('Speech synthesis not supported in this browser.');
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.querySelector('p').textContent);
  utter.lang = 'en-US'; utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

// Save Function
function saveText(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const title = el.querySelector('h3').textContent;
  const text = el.querySelector('p').textContent;
  const blob = new Blob([`${title}\n\n${text}\n\nSource: kingdom.lat/up`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// Upload, Preview & Local OCR
const uploadBtn = document.getElementById('upload-trigger');
const fileInput = document.getElementById('file-input');
const previewBox = document.getElementById('upload-preview');
const previewImg = document.getElementById('preview-img');
const ocrStatus = document.getElementById('ocr-status');
const ocrResult = document.getElementById('ocr-result');
const copyBtn = document.getElementById('copy-text-btn');

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Show Preview (Local Memory)
  const localURL = URL.createObjectURL(file);
  previewImg.src = localURL;
  previewBox.style.display = 'block';
  ocrResult.style.display = 'none';
  copyBtn.style.display = 'none';
  ocrStatus.textContent = '⏳ Initializing local OCR engine... (One-time load)';

  // 2. Run OCR if Tesseract is available
  if (typeof Tesseract !== 'undefined') {
    try {
      ocrStatus.textContent = '🔍 Extracting text locally...';
      const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: m => {
        if (m.status === 'recognizing text') ocrStatus.textContent = `🔍 Processing: ${Math.round(m.progress * 100)}%`;
      }});
      
      const cleanText = text.trim();
      if (cleanText) {
        ocrResult.textContent = cleanText;
        ocrResult.style.display = 'block';
        copyBtn.style.display = 'inline-block';
        ocrStatus.textContent = '✅ Text extracted successfully. 100% on-device.';
      } else {
        ocrStatus.textContent = '⚠️ No clear text detected. Try a clearer image.';
      }
    } catch (err) {
      ocrStatus.textContent = '❌ Local processing failed. Please try a standard JPG/PNG image.';
      console.error('OCR Error:', err);
    }
  } else {
    ocrStatus.textContent = '⚠️ OCR engine not loaded. Check internet for first-time setup.';
  }

  // Cleanup input
  e.target.value = '';
  setTimeout(() => URL.revokeObjectURL(localURL), 60000);
});

// Copy Extracted Text
copyBtn.addEventListener('click', () => {
  const text = ocrResult.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => copyBtn.textContent = '📋 Copy Text', 2000);
  });
});

// Clear Preview
function clearPreview() {
  previewImg.src = '';
  ocrResult.textContent = '';
  ocrResult.style.display = 'none';
  previewBox.style.display = 'none';
  copyBtn.style.display = 'none';
  ocrStatus.textContent = 'Ready to process locally...';
}

// Fetch up.json
async function loadJSON() {
  const container = document.getElementById('json-display');
  try {
    const res = await fetch('up.json');
    if (!res.ok) throw new Error('Not found');
    const text = await res.text();
    try { container.textContent = JSON.stringify(JSON.parse(text), null, 2); } 
    catch { container.textContent = text; }
  } catch {
    container.textContent = '⚠️ up.json not found. Create it in the same folder to display content here.';
  }
}
loadJSON();
