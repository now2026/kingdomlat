/* ==========================================================================
   POEM.JS — Kingdom.lat/poem
   Features: Live clock • Speech • Save • Local OCR • Dual JSON Gallery
   Privacy: 100% client-side • No external requests • No cookies • No tracking
   ========================================================================== */

function updateTime() {
  const now = new Date();
  const dateEl = document.getElementById('live-date');
  const clockEl = document.getElementById('live-clock');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

function listenTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.speechSynthesis) return alert('Speech synthesis not supported.');
  window.speechSynthesis.cancel();
  const text = el.innerText || el.textContent;
  if (!text.trim()) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US'; utter.rate = 0.85; // Slightly slower for poetry
  window.speechSynthesis.speak(utter);
}

function saveText(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const title = el.querySelector('h3')?.textContent || 'Poem';
  const text = el.querySelector('[id$="-text"]')?.textContent || el.querySelector('p')?.textContent || '';
  const content = `${title}\n\n${text}\n\n─\nSource: kingdom.lat/poem\nGenerated: ${new Date().toISOString()}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

const uploadBtn = document.getElementById('upload-trigger');
const fileInput = document.getElementById('file-input');
const previewBox = document.getElementById('upload-preview');
const previewImg = document.getElementById('preview-img');
const ocrStatus = document.getElementById('ocr-status');
const ocrResult = document.getElementById('ocr-result');
const copyBtn = document.getElementById('copy-text-btn');

uploadBtn?.addEventListener('click', () => fileInput?.click());
fileInput?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const localURL = URL.createObjectURL(file);
  previewImg.src = localURL;
  previewBox.style.display = 'block';
  ocrResult.style.display = 'none';
  copyBtn.style.display = 'none';
  ocrStatus.textContent = '⏳ Initializing local OCR engine...';
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
        ocrStatus.textContent = '✅ Text extracted. 100% on-device.';
      } else {
        ocrStatus.textContent = '⚠️ No clear text detected. Try a clearer image.';
      }
    } catch (err) {
      console.error('OCR Error:', err);
      ocrStatus.textContent = '❌ Processing failed. Try a standard JPG/PNG.';
    }
  } else {
    ocrStatus.textContent = '⚠️ OCR engine not loaded. Check connection for first setup.';
  }
  e.target.value = '';
  setTimeout(() => URL.revokeObjectURL(localURL), 60000);
});

copyBtn?.addEventListener('click', () => {
  const text = ocrResult.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => { copyBtn.textContent = original; }, 2000);
  });
});

function clearPreview() {
  if (previewImg?.src) { URL.revokeObjectURL(previewImg.src); previewImg.src = ''; }
  if (ocrResult) { ocrResult.textContent = ''; ocrResult.style.display = 'none'; }
  if (copyBtn) copyBtn.style.display = 'none';
  if (previewBox) previewBox.style.display = 'none';
  if (ocrStatus) ocrStatus.textContent = 'Ready to process locally...';
  if (fileInput) fileInput.value = '';
}

async function loadJSONGallery() {
  const container = document.getElementById('json-gallery');
  if (!container) return;
  try {
    const [res1, res2] = await Promise.allSettled([
      fetch('poem.json').catch(() => null),
      fetch('poem1.json').catch(() => null)
    ]);
    let items = [];
    if (res1.status === 'fulfilled' && res1.value?.ok) { const d = await res1.value.json(); if(Array.isArray(d)) items = items.concat(d); }
    if (res2.status === 'fulfilled' && res2.value?.ok) { const d = await res2.value.json(); if(Array.isArray(d)) items = items.concat(d); }
    if (items.length > 0) {
      container.innerHTML = '';
      items.forEach(item => {
        const card = document.createElement('div'); card.className = 'json-card';
        const img = document.createElement('img'); img.src = item.image || 'poem/placeholder.jpg'; img.alt = item.title || 'Gateway'; img.className = 'json-card-image'; img.loading = 'lazy';
        if (item.link) { img.style.cursor = 'pointer'; img.onclick = (e) => { e.preventDefault(); window.open(item.link, '_blank', 'noopener,noreferrer'); }; }
        const content = document.createElement('div'); content.className = 'json-card-content';
        const title = document.createElement('h4'); title.className = 'json-card-title'; title.textContent = item.title || 'Untitled';
        const desc = document.createElement('p'); desc.className = 'json-card-desc'; desc.textContent = item.description || '';
        content.appendChild(title); content.appendChild(desc); card.appendChild(img); card.appendChild(content); container.appendChild(card);
      });
    } else { container.innerHTML = '<p class="small" style="text-align:center; opacity:0.7;">📄 No poetic gateways found. Add items to poem.json to display them here.</p>'; }
  } catch (err) { console.error('Gallery error:', err); container.innerHTML = '<p class="small" style="text-align:center; opacity:0.7;">⚠️ Could not load poetic gateways.</p>'; }
}

document.addEventListener('DOMContentLoaded', loadJSONGallery);
