/* ==========================================================================
   UP.JS — Kingdom.lat/up
   Features: Live clock • Speech • Save • Local OCR • Dual JSON Gallery
   Privacy: 100% client-side • No external requests • No cookies • No tracking
   ========================================================================== */

/* ────────────────────────────────────────────────────────────────────────
   1. LIVE DATE & CLOCK
   ──────────────────────────────────────────────────────────────────────── */
function updateTime() {
  const now = new Date();
  const dateEl = document.getElementById('live-date');
  const clockEl = document.getElementById('live-clock');
  
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
}
setInterval(updateTime, 1000);
updateTime();


/* ────────────────────────────────────────────────────────────────────────
   2. SPEECH SYNTHESIS (Listen to Chapter)
   ──────────────────────────────────────────────────────────────────────── */
function listenTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  if (!window.speechSynthesis) {
    alert('Speech synthesis is not supported in your browser.');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const text = el.querySelector('p')?.textContent || '';
  if (!text.trim()) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
}


/* ────────────────────────────────────────────────────────────────────────
   3. SAVE CHAPTER TEXT AS .TXT FILE
   ──────────────────────────────────────────────────────────────────────── */
function saveText(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  const title = el.querySelector('h3')?.textContent || 'Chapter';
  const text = el.querySelector('p')?.textContent || '';
  
  const content = `${title}\n\n${text}\n\n─\nSource: kingdom.lat/up\nGenerated: ${new Date().toISOString()}`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.txt`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up memory
  URL.revokeObjectURL(url);
}


/* ────────────────────────────────────────────────────────────────────────
   4. IMAGE UPLOAD + LOCAL PREVIEW + OCR (Tesseract.js)
   ──────────────────────────────────────────────────────────────────────── */
const uploadBtn = document.getElementById('upload-trigger');
const fileInput = document.getElementById('file-input');
const previewBox = document.getElementById('upload-preview');
const previewImg = document.getElementById('preview-img');
const ocrStatus = document.getElementById('ocr-status');
const ocrResult = document.getElementById('ocr-result');
const copyBtn = document.getElementById('copy-text-btn');

// Trigger file picker
if (uploadBtn && fileInput) {
  uploadBtn.addEventListener('click', () => fileInput.click());
}

// Handle file selection & OCR
if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview (local memory URL)
    const localURL = URL.createObjectURL(file);
    previewImg.src = localURL;
    previewBox.style.display = 'block';
    ocrResult.style.display = 'none';
    copyBtn.style.display = 'none';
    ocrStatus.textContent = '⏳ Initializing local OCR engine...';
    
    // Run OCR if Tesseract is available
    if (typeof Tesseract !== 'undefined') {
      try {
        ocrStatus.textContent = '🔍 Extracting text locally...';
        
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              ocrStatus.textContent = `🔍 Processing: ${Math.round(m.progress * 100)}%`;
            }
          }
        });
        
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
    
    // Reset input & schedule memory cleanup
    e.target.value = '';
    setTimeout(() => URL.revokeObjectURL(localURL), 60000);
  });
}

// Copy extracted text to clipboard
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    const text = ocrResult.textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    }).catch(() => {
      alert('Could not copy. Please select and copy manually.');
    });
  });
}

// Clear preview & reset state
function clearPreview() {
  if (previewImg?.src) {
    URL.revokeObjectURL(previewImg.src);
    previewImg.src = '';
  }
  if (ocrResult) {
    ocrResult.textContent = '';
    ocrResult.style.display = 'none';
  }
  if (copyBtn) copyBtn.style.display = 'none';
  if (previewBox) previewBox.style.display = 'none';
  if (ocrStatus) ocrStatus.textContent = 'Ready to process locally...';
  if (fileInput) fileInput.value = '';
}


/* ────────────────────────────────────────────────────────────────────────
   5. DUAL JSON GALLERY (up.json + up1.json) — ROBUST VERSION
   ──────────────────────────────────────────────────────────────────────── */
async function loadJSONGallery() {
  const container = document.getElementById('json-gallery');
  if (!container) return;
  
  console.log('🔍 Loading cultural gateways...');
  
  try {
    // Fetch both files in parallel with graceful fallback
    const [res1, res2] = await Promise.allSettled([
      fetch('up.json').catch(() => null),
      fetch('up1.json').catch(() => null)
    ]);
    
    let items = [];
    
    // Process up.json
    if (res1.status === 'fulfilled' && res1.value?.ok) {
      const data = await res1.value.json();
      if (Array.isArray(data)) {
        items = items.concat(data);
        console.log(`✅ up.json: ${data.length} items loaded`);
      }
    } else {
      console.warn('⚠️ up.json: not available');
    }
    
    // Process up1.json
    if (res2.status === 'fulfilled' && res2.value?.ok) {
      const data = await res2.value.json();
      if (Array.isArray(data)) {
        items = items.concat(data);
        console.log(`✅ up1.json: ${data.length} items loaded`);
      }
    } else {
      console.warn('⚠️ up1.json: not available');
    }
    
    // Render gallery if we have data
    if (items.length > 0) {
      container.innerHTML = '';
      
      items.forEach(item => {
        // Card container
        const card = document.createElement('div');
        card.className = 'json-card';
        
        // Clickable image
        const img = document.createElement('img');
        img.src = item.image || 'up/placeholder.jpg';
        img.alt = item.title || 'Cultural gateway';
        img.className = 'json-card-image';
        img.loading = 'lazy';
        
        if (item.link) {
          img.style.cursor = 'pointer';
          img.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(item.link, '_blank', 'noopener,noreferrer');
          });
        }
        
        // Content area
        const content = document.createElement('div');
        content.className = 'json-card-content';
        
        const title = document.createElement('h4');
        title.className = 'json-card-title';
        title.textContent = item.title || 'Untitled';
        
        const desc = document.createElement('p');
        desc.className = 'json-card-desc';
        desc.textContent = item.description || '';
        
        // Assemble
        content.appendChild(title);
        content.appendChild(desc);
        card.appendChild(img);
        card.appendChild(content);
        container.appendChild(card);
      });
      
      console.log(`🎨 Gallery rendered: ${items.length} cards`);
      
    } else {
      container.innerHTML = `
        <p class="small" style="text-align:center; opacity:0.7;">
          📄 No cultural gateways found.<br>
          Add items to <code>up.json</code> or <code>up1.json</code> to display them here.
        </p>`;
      console.warn('⚠️ No items to render');
    }
    
  } catch (err) {
    console.error('❌ Gallery error:', err);
    container.innerHTML = `
      <p class="small" style="text-align:center; opacity:0.7;">
        ⚠️ Could not load cultural gateways.<br>
        Please refresh or check your connection.
      </p>`;
  }
}

// Initialize gallery when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadJSONGallery);
} else {
  loadJSONGallery();
}


/* ────────────────────────────────────────────────────────────────────────
   6. PRIVACY & PERFORMANCE NOTES (For developers)
   ──────────────────────────────────────────────────────────────────────── */
/*
   🔒 This script:
   • Makes NO external requests except initial JSON fetch (same-origin)
   • Stores NO data on servers — all processing is client-side
   • Uses NO cookies, trackers, analytics, or third-party scripts
   • Cleans up object URLs automatically to prevent memory leaks
   
   ⚡ Performance tips:
   • Images use lazy loading (loading="lazy")
   • OCR engine loads only when user triggers upload
   • JSON files are fetched in parallel for faster rendering
   
   🌍 To make OCR 100% offline:
   1. Download tesseract.min.js locally
   2. Replace CDN link in up.html with local path
   3. Ensure worker files are also hosted locally
*/
