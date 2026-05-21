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

  const localURL = URL.createObjectURL(file);
  previewImg.src = localURL;
  previewBox.style.display = 'block';
  ocrResult.style.display = 'none';
  copyBtn.style.display = 'none';
  ocrStatus.textContent = '⏳ Initializing local OCR engine... (One-time load)';

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

// Fetch and Display Dual JSON Gallery
async function loadJSONGallery() {
  const container = document.getElementById('json-gallery');
  
  try {
    // Fetch both files in parallel
    const [res1, res2] = await Promise.all([
      fetch('up.json').catch(() => null),
      fetch('up1.json').catch(() => null)
    ]);
    
    let data = [];
    
    // Parse up.json if exists
    if (res1 && res1.ok) {
      const json1 = await res1.json();
      if (Array.isArray(json1)) data = data.concat(json1);
    }
    
    // Parse up1.json if exists
    if (res2 && res2.ok) {
      const json2 = await res2.json();
      if (Array.isArray(json2)) data = data.concat(json2);
    }
    
    if (data.length === 0) throw new Error('No valid data found');
    
    container.innerHTML = ''; // Clear loading state
    
    data.forEach((item) => {
      // Create card container
      const card = document.createElement('div');
      card.className = 'json-card';
      
      // Create clickable image
      const img = document.createElement('img');
      img.src = item.image || 'up/placeholder.jpg';
      img.alt = item.title || 'Cultural gateway';
      img.className = 'json-card-image';
      img.onclick = () => { if (item.link) window.open(item.link, '_blank'); };
      
      // Create content area
      const content = document.createElement('div');
      content.className = 'json-card-content';
      
      // Create title
      const title = document.createElement('h4');
      title.className = 'json-card-title';
      title.textContent = item.title || 'Untitled';
      
      // Create description
      const desc = document.createElement('p');
      desc.className = 'json-card-desc';
      desc.textContent = item.description || '';
      
      // Assemble card
      content.appendChild(title);
      content.appendChild(desc);
      card.appendChild(img);
      card.appendChild(content);
      container.appendChild(card);
    });
    
  } catch (err) {
    container.innerHTML = '<p class="small" style="text-align:center; opacity:0.7;">📄 up.json or up1.json not found. Add your cultural gateways to display them here.</p>';
    console.error('JSON Load Error:', err);
  }
}

// Initialize gallery on load
document.addEventListener('DOMContentLoaded', loadJSONGallery);
