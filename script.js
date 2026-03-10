// script.js · quiet, anonymous, alive

(function() {
    'use strict';

    // ========== THEME TOGGLE with localStorage ==========
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '⚪';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.textContent = isDark ? '⚪' : '⚫';
        });
    }

    // ========== LIVE TIMESTAMP (updates every second) ==========
    function updateTimestamps() {
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        }).replace(',', '');

        const liveEl = document.getElementById('liveTimestamp');
        if (liveEl) liveEl.textContent = `⏱️ ${formatted}`;

        const footerEl = document.getElementById('footerTimestamp');
        if (footerEl) footerEl.textContent = formatted;
    }
    updateTimestamps();
    setInterval(updateTimestamps, 1000);

    // ========== ANONYMOUS VISITOR COUNTER (fake but warm) ==========
    const visitorEl = document.getElementById('visitorCount');
    if (visitorEl) {
        let count = localStorage.getItem('visitorCount') ? parseInt(localStorage.getItem('visitorCount')) : 341;
        count = Math.min(count + Math.floor(Math.random() * 3), 999); // slowly drift
        localStorage.setItem('visitorCount', count);
        visitorEl.textContent = count;
    }

    // ========== LOADING WHISPER (for pages that include #loadingSignature) ==========
    const loadingEl = document.getElementById('loadingSignature');
    if (loadingEl) {
        loadingEl.textContent = 'Loading...';
        setTimeout(() => { loadingEl.textContent = 'Done.'; }, 500);
        setTimeout(() => { loadingEl.style.opacity = '0'; }, 2200);
    }

    // ========== UPDATE COUNTDOWNS (if on kingdom page) ==========
    function updateCountdownsUniversal() {
        const maghaEl = document.getElementById('maghaCountdown');
        const hajjEl = document.getElementById('hajjCountdown');
        if (!maghaEl && !hajjEl) return;

        const now = new Date();
        const currentYear = now.getFullYear();

        // Magha Puja — fixed to March 3
        let maghaDate = new Date(currentYear, 2, 3);
        if (now > maghaDate) maghaDate.setFullYear(currentYear + 1);
        const maghaDays = Math.ceil((maghaDate - now) / (1000 * 60 * 60 * 24));
        if (maghaEl) maghaEl.textContent = maghaDays;

        // Hajj season — approximate: Dhul Hijjah 10 (simple moving date)
        let hajjDate = new Date(currentYear, 5, 7); // approx June 7
        if (now > hajjDate) hajjDate.setFullYear(currentYear + 1);
        const hajjDays = Math.ceil((hajjDate - now) / (1000 * 60 * 60 * 24));
        if (hajjEl) hajjEl.textContent = hajjDays;
    }

    updateCountdownsUniversal();
    setInterval(updateCountdownsUniversal, 60 * 60 * 1000); // update hourly

    // ========== SLOW DOWN MESSAGE (for fast scrollers) ==========
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 300) {
                const msg = document.createElement('div');
                msg.textContent = 'You missed nothing. Slow down.';
                msg.style.position = 'fixed';
                msg.style.bottom = '1rem';
                msg.style.right = '1rem';
                msg.style.background = 'var(--fg)';
                msg.style.color = 'var(--bg)';
                msg.style.padding = '0.5rem 1rem';
                msg.style.fontSize = '0.8rem';
                msg.style.zIndex = '999';
                msg.style.opacity = '0.9';
                msg.style.transition = 'opacity 2s';
                document.body.appendChild(msg);
                setTimeout(() => { msg.style.opacity = '0'; }, 3000);
                setTimeout(() => { msg.remove(); }, 5000);
            }
        }, 600);
    });

})();
