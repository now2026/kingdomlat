/**
 * 🧊 Kingdom.js — Privacy-First Local Logic
 * Features: Listen · Save · Real-time clock/date · Optional Local AI
 * Zero tracking · Zero cookies · Zero external requests (after model load)
 */

(() => {
  'use strict';

  // 🔧 Configuration
  const CONFIG = {
    PAGE_CREATED: '2026-05-28', // YYYY-MM-DD
    MODEL_PATH: 'models/qwen-0.5b.gguf', // Local model path
    MODEL_SIZE_MB: 500,
    SYSTEM_PROMPT: `You are Kingdom Assistant, a local AI helper running 100% in the user's browser.
Rules:
1. You only translate text or answer simple questions about the page content.
2. Be honest, concise, and direct. If unsure, say "I'm not certain."
3. Never invent information or add unsolicited commentary.
4. Do not mention you are an AI unless explicitly asked.
5. Keep responses under 3 sentences when possible.`,
    LANGUAGES: ['en', 'ar', 'de', 'nl', 'no', 'is', 'zh', 'ru', 'fr', 'pt']
  };

  // 🎯 DOM Elements
  const els = {
    realtimeDate: document.getElementById('realtime-date'),
    liveClock: document.getElementById('live-clock'),
    pageCreated: document.getElementById('page-created'),
    btnListen: document.getElementById('btn-listen'),
    btnSave: document.getElementById('btn-save'),
    btnActivateAI: document.getElementById('btn-activate-ai'),
    aiStatus: document.getElementById('ai-status'),
    aiChat: document.getElementById('ai-chat'),
    aiMessages: document.getElementById('ai-messages'),
    aiForm: document.getElementById('ai-form'),
    aiInput: document.getElementById('ai-input'),
    mainExplanation: document.getElementById('main-explanation')
  };

  // 🕐 Real-time date & clock
  function updateDateTime() {
    const now = new Date();
    
    // Real-time date at top: "Thu, 28 May 2026"
    if (els.realtimeDate) {
      els.realtimeDate.dateTime = now.toISOString();
      els.realtimeDate.textContent = now.toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
      });
    }
    
    // Live clock at bottom: "14:23:45 UTC"
    if (els.liveClock) {
      els.liveClock.dateTime = now.toISOString();
      els.liveClock.textContent = now.toUTCString().split(' ')[4] + ' UTC';
    }
    
    // Page created date
    if (els.pageCreated) {
      els.pageCreated.dateTime = CONFIG.PAGE_CREATED;
      els.pageCreated.textContent = new Date(CONFIG.PAGE_CREATED).toLocaleDateString('en-GB', {
        year: 'numeric', month: 'short', day: '2-digit'
      });
    }
  }
  
  // Update immediately and then every second
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // 🔊 Listen button (Web Speech API — local, no external requests)
  if (els.btnListen && els.mainExplanation) {
    els.btnListen.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        alert('🔊 Text-to-speech not supported in this browser.');
        return;
      }
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const text = els.mainExplanation.innerText;
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to pick a voice that matches user's language preference
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        navigator.language && v.lang?.startsWith(navigator.language.slice(0, 2))
      ) || voices[0];
      
      if (preferred) utterance.voice = preferred;
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
      
      // Visual feedback
      els.btnListen.textContent = '🔊 Speaking...';
      utterance.onend = () => { els.btnListen.textContent = '🔊 Listen'; };
      utterance.onerror = () => { els.btnListen.textContent = '🔊 Listen'; };
    });
  }

  // 💾 Save button (Blob download — 100% local, no server)
  if (els.btnSave && els.mainExplanation) {
    els.btnSave.addEventListener('click', () => {
      const text = `Kingdom Assistant — Explanation\n${'='.repeat(40)}\n\n${els.mainExplanation.innerText}\n\n---\nSaved from: ${window.location.href}\nDate: ${new Date().toISOString()}`;
      
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kingdom-explanation-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Visual feedback
      const original = els.btnSave.textContent;
      els.btnSave.textContent = '💾 Saved!';
      setTimeout(() => { els.btnSave.textContent = original; }, 2000);
    });
  }

  // 🤖 Local AI (Optional — only activates on explicit user click)
  let aiModule = null; // Will hold the AI module if loaded
  
  if (els.btnActivateAI) {
    els.btnActivateAI.addEventListener('click', async () => {
      // Show status
      els.aiStatus.classList.remove('hidden');
      els.aiStatus.innerHTML = `⏳ Downloading local model (~${CONFIG.MODEL_SIZE_MB}MB) from your domain...<br><small>This happens once. All processing stays on your device.</small>`;
      els.btnActivateAI.disabled = true;
      
      try {
        // 🧠 Load Transformers.js (hosted locally for privacy)
        // Note: In production, host @xenova/transformers locally too
        if (!window.transformers) {
          const script = document.createElement('script');
          script.src = 'lib/transformers.min.js'; // Host this file locally
          script.integrity = 'sha384-PUT_YOUR_HASH_HERE'; // Add integrity for security
          script.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        // 🤖 Initialize pipeline (this downloads the model)
        const { pipeline } = window.transformers;
        aiModule = await pipeline('text-generation', CONFIG.MODEL_PATH, {
          // Local-only settings
          device: 'webgpu', // Prefer GPU if available
          progress_callback: (progress) => {
            if (progress.status === 'progress') {
              const pct = Math.round(progress.progress * 100);
              els.aiStatus.innerHTML = `⏳ Loading model: ${pct}%...`;
            }
          }
        });
        
        // Success: show chat interface
        els.aiStatus.innerHTML = '✅ Local assistant ready. Ask for translation or simple help.';
        els.aiChat.classList.remove('hidden');
        els.aiInput.focus();
        
      } catch (err) {
        console.error('AI load error:', err);
        els.aiStatus.innerHTML = `❌ Could not load local assistant.<br><small>${err.message || 'Check console for details'}</small>`;
      } finally {
        els.btnActivateAI.disabled = false;
      }
    });
  }

  // 📤 AI Form submission
  if (els.aiForm && els.aiInput && els.aiMessages) {
    els.aiForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userMsg = els.aiInput.value.trim();
      if (!userMsg || !aiModule) return;
      
      // Add user message to UI
      addMessage(userMsg, 'user');
      els.aiInput.value = '';
      addMessage('🔄 Thinking...', 'ai', true);
      
      try {
        // Run inference locally
        const result = await aiModule(userMsg, {
          max_new_tokens: 150,
          temperature: 0.3,
          do_sample: true
        });
        
        // Remove loading state
        const loading = els.aiMessages.querySelector('.loading');
        if (loading) loading.remove();
        
        const reply = result[0]?.generated_text?.trim() || 'Sorry, I couldn\'t generate a response.';
        addMessage(reply, 'ai');
        
      } catch (err) {
        console.error('AI inference error:', err);
        const loading = els.aiMessages.querySelector('.loading');
        if (loading) loading.remove();
        addMessage('❌ Local processing error. Try a simpler question.', 'ai');
      }
    });
  }

  // 🎨 Helper: Add message to AI chat UI
  function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    const isUser = sender === 'user';
    div.style.cssText = `margin: 6px 0; display: flex; ${isUser ? 'justify-content: flex-end' : ''};`;
    div.innerHTML = `
      <div style="
        background: ${isUser ? '#f8f9fa' : 'rgba(248,249,250,0.1)'};
        color: ${isUser ? '#0a1929' : '#f8f9fa'};
        padding: 8px 12px; 
        border-radius: ${isUser ? '12px 12px 0 12px' : '12px 12px 12px 0'};
        max-width: 85%; 
        font-size: 0.95rem;
        line-height: 1.4;
        ${isLoading ? 'opacity: 0.7; font-style: italic;' : ''}
        ${isLoading ? 'class="loading"' : ''}
      ">${text}</div>
    `;
    els.aiMessages.appendChild(div);
    els.aiMessages.scrollTop = els.aiMessages.scrollHeight;
  }

  // ⌨️ Enter key support for AI input
  if (els.aiInput) {
    els.aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        els.aiForm.requestSubmit();
      }
    });
  }

  // 🧹 Cleanup: Cancel speech when page unloads
  window.addEventListener('beforeunload', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  });

  // 🌐 Preload voices for speech synthesis (improves UX)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {}; // Trigger voice list load
  }

})();
