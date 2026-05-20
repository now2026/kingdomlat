// Real-time Date (Top) & Clock (Bottom)
function updateTime() {
  const now = new Date();
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('live-date');
  const clockEl = document.getElementById('live-clock');
  
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', optionsDate);
  if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateTime, 1000);
updateTime();

// Listen Function (Web Speech API - Client Side Only)
function listenTo(chapterId) {
  const chapter = document.getElementById(chapterId);
  if (!chapter || !window.speechSynthesis) {
    alert('Speech synthesis is not supported in your browser.');
    return;
  }
  
  window.speechSynthesis.cancel(); // Stop previous
  const text = chapter.querySelector('p').textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

// Save Function (Generates .txt locally)
function saveText(chapterId) {
  const chapter = document.getElementById(chapterId);
  if (!chapter) return;
  
  const title = chapter.querySelector('h3').textContent;
  const text = chapter.querySelector('p').textContent;
  const content = `${title}\n\n${text}\n\nSaved from Kingdom.lat/up.html`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
