// ============================================================
// ACCESSIBILITY CHECKER - Professional 10-Rule Engine
// 100% Client-Side | Zero Tracking | WCAG 2.1 Compliant
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const htmlInput = document.getElementById('htmlInput');
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const resultsFrame = document.getElementById('resultsFrame');
    const resultsList = document.getElementById('resultsList');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Event Listeners
    checkBtn.addEventListener('click', runScan);
    clearBtn.addEventListener('click', clearAll);
    loadSampleBtn.addEventListener('click', loadSampleHTML);

    htmlInput.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') runScan();
    });

    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================================================
    // MAIN SCAN FUNCTION
    // ========================================================

    function runScan() {
        const rawHTML = htmlInput.value.trim();

        if (!rawHTML) {
            showResults([{
                type: 'warning', icon: '⚠️',
                title: 'Empty Input',
                message: 'Please paste HTML code before scanning.',
                fix: 'Copy page source (Ctrl+U) and paste it here. Or click "Load Sample" to try the tool.'
            }]);
            return;
        }

        const doc = new DOMParser().parseFromString(rawHTML, 'text/html');
        const issues = [];

        // Run 10 Advanced Rules
        checkColorContrast(doc, issues);
        checkHeadingStructure(doc, issues);
        checkAltText(doc, issues);
        checkLinks(doc, issues);
        checkKeyboardNavigation(doc, issues);
        checkARIA(doc, issues);
        checkTables(doc, issues);
        checkVideos(doc, issues);
        checkPageTitle(doc, issues);
        checkDuplicateIDs(doc, issues);

        if (issues.length === 0) {
            showResults([{
                type: 'success', icon: '🏆',
                title: 'Perfect Score! No Issues Found',
                message: 'Your HTML passed all 10 advanced accessibility checks.',
                fix: 'Excellent work! Manual testing with screen readers is still recommended for full WCAG compliance.'
            }]);
        } else {
            // Sort: errors first, then warnings, then info
            const order = { error: 1, warning: 2, info: 3 };
            issues.sort((a, b) => order[a.type] - order[b.type]);
            showResults(issues);
        }
    }

    // ========================================================
    // RULE 1: Color Contrast
    // ========================================================
    function checkColorContrast(doc, issues) {
        const elements = doc.querySelectorAll('[style*="color"], [style*="background"]');
        let lowContrastCount = 0;

        elements.forEach(function (el) {
            const style = el.getAttribute('style');
            const fgMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
            const bgMatch = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);

            if (fgMatch && bgMatch) {
                const ratio = calculateContrastRatio(fgMatch[1].trim(), bgMatch[1].trim());
                if (ratio < 4.5) lowContrastCount++;
            }
        });

        if (lowContrastCount > 0) {
            issues.push({
                type: 'error', icon: '🎨',
                title: 'Low Color Contrast (' + lowContrastCount + ' elements)',
                message: 'Found ' + lowContrastCount + ' element(s) with contrast ratio below 4.5:1 (WCAG AA requirement). This makes text difficult for visually impaired users.',
                fix: 'Ensure text has at least 4.5:1 contrast against its background. Large text (18px+ bold or 24px+ regular) needs 3:1. Use browser dev tools or contrast checkers to verify.'
            });
        }
    }

    function calculateContrastRatio(c1, c2) {
        const rgb1 = parseColor(c1), rgb2 = parseColor(c2);
        if (!rgb1 || !rgb2) return 21;
        const l1 = luminance(rgb1), l2 = luminance(rgb2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function parseColor(color) {
        if (color.startsWith('#')) {
            let hex = color.slice(1);
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length === 6) {
                return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
            }
        }
        const m = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
    }

    function luminance({ r, g, b }) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // ========================================================
    // RULE 2: Heading Structure
    // ========================================================
    function checkHeadingStructure(doc, issues) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            issues.push({ type: 'warning', icon: '📋', title: 'No Headings Found',
                message: 'The page has no headings. Screen reader users rely on headings to navigate content structure.',
                fix: 'Add <h1> for the main title, then <h2>, <h3>, etc. for subsections.' });
            return;
        }
        const h1Count = doc.querySelectorAll('h1').length;
        if (h1Count === 0) {
            issues.push({ type: 'error', icon: '❌', title: 'Missing H1 Heading',
                message: 'Every page should have exactly one <h1> as the main title.',
                fix: 'Add a single <h1> element for the page\'s primary title.' });
        } else if (h1Count > 1) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Multiple H1 Headings (' + h1Count + ')',
                message: 'Found ' + h1Count + ' <h1> elements. Best practice: one <h1> per page.',
                fix: 'Keep only one <h1>. Convert extras to <h2> or <h3>.' });
        }
        let prevLevel = 0, skipped = 0;
        headings.forEach(h => {
            const level = parseInt(h.tagName.charAt(1));
            if (prevLevel > 0 && level > prevLevel + 1) skipped++;
            prevLevel = level;
        });
        if (skipped > 0) {
            issues.push({ type: 'error', icon: '❌', title: 'Skipped Heading Levels (' + skipped + ')',
                message: 'Heading levels are not sequential (e.g., H2 → H4). This breaks navigation for screen reader users.',
                fix: 'Ensure headings follow logical order: H1 → H2 → H3 → H4. Never skip levels.' });
        }
    }

    // ========================================================
    // RULE 3: Alt Text
    // ========================================================
    function checkAltText(doc, issues) {
        const imgs = doc.querySelectorAll('img');
        let missing = 0, empty = 0, short = 0;
        imgs.forEach(img => {
            if (!img.hasAttribute('alt')) missing++;
            else {
                const alt = img.getAttribute('alt').trim();
                if (alt === '') empty++;
                else if (alt.length < 5) short++;
            }
        });
        if (missing > 0) {
            issues.push({ type: 'error', icon: '🖼️', title: 'Images Missing Alt (' + missing + ')',
                message: missing + ' image(s) have no alt attribute. Screen readers cannot describe these.',
                fix: 'Add descriptive alt text. Example: <img alt="Sunset over ocean">. Use alt="" only for decorative images.' });
        }
        if (empty > 0) {
            issues.push({ type: 'info', icon: 'ℹ️', title: 'Decorative Images (' + empty + ')',
                message: empty + ' image(s) have empty alt. Acceptable only for purely decorative images.',
                fix: 'Verify these are decorative. If meaningful, add descriptive alt text.' });
        }
        if (short > 0) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Short Alt Text (' + short + ')',
                message: short + ' image(s) have alt text under 5 characters. May not be descriptive enough.',
                fix: 'Provide meaningful descriptions. Avoid generic words like "image" or "photo".' });
        }
    }

    // ========================================================
    // RULE 4: Links (Text + Security)
    // ========================================================
    function checkLinks(doc, issues) {
        const links = doc.querySelectorAll('a[href]');
        let empty = 0, generic = 0, insecure = 0;
        const genericTexts = ['click here', 'read more', 'more', 'link', 'here', 'click'];

        links.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            const ariaLabel = link.getAttribute('aria-label');
            const title = link.getAttribute('title');
            const imgAlt = link.querySelector('img')?.getAttribute('alt');

            if (!text && !ariaLabel && !title && !imgAlt) empty++;
            else if (genericTexts.includes(text)) generic++;

            const href = link.getAttribute('href');
            if (href && (href.startsWith('http') || href.startsWith('//'))) {
                const target = link.getAttribute('target');
                const rel = link.getAttribute('rel') || '';
                if (target === '_blank' && (!rel.includes('noopener') || !rel.includes('noreferrer'))) {
                    insecure++;
                }
            }
        });

        if (empty > 0) {
            issues.push({ type: 'error', icon: '🔗', title: 'Links Without Text (' + empty + ')',
                message: empty + ' link(s) have no accessible name. Screen readers announce only "link".',
                fix: 'Add descriptive text, aria-label, or title. Example: <a aria-label="Read full article">...' });
        }
        if (generic > 0) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Generic Link Text (' + generic + ')',
                message: generic + ' link(s) use generic text like "click here". Not descriptive for navigation.',
                fix: 'Use descriptive text. "Download accessibility guide" instead of "Click here".' });
        }
        if (insecure > 0) {
            issues.push({ type: 'error', icon: '🔒', title: 'Insecure External Links (' + insecure + ')',
                message: insecure + ' external link(s) open in new tab without rel="noopener noreferrer". Security risk.',
                fix: 'Add rel="noopener noreferrer" to all target="_blank" external links.' });
        }
    }

    // ========================================================
    // RULE 5: Keyboard Navigation
    // ========================================================
    function checkKeyboardNavigation(doc, issues) {
        let positiveTab = 0, nonFocusable = 0;
        doc.querySelectorAll('[tabindex]').forEach(el => {
            const v = parseInt(el.getAttribute('tabindex'));
            if (v > 0) positiveTab++;
        });
        doc.querySelectorAll('div[onclick], span[onclick], div[role="button"], span[role="button"]').forEach(el => {
            if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') nonFocusable++;
        });
        if (positiveTab > 0) {
            issues.push({ type: 'error', icon: '⌨️', title: 'Positive Tabindex Values (' + positiveTab + ')',
                message: positiveTab + ' element(s) use tabindex > 0. This breaks natural keyboard tab order.',
                fix: 'Use tabindex="0" to add to natural order, or tabindex="-1" for programmatic focus. Avoid positive values.' });
        }
        if (nonFocusable > 0) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Non-Focusable Clickables (' + nonFocusable + ')',
                message: nonFocusable + ' custom interactive element(s) cannot be reached via keyboard.',
                fix: 'Add tabindex="0" and keyboard event handlers. Prefer <button> or <a> elements.' });
        }
    }

    // ========================================================
    // RULE 6: ARIA
    // ========================================================
    function checkARIA(doc, issues) {
        let hiddenFocusable = 0, invalidLabelledBy = 0;

        doc.querySelectorAll('[aria-hidden="true"]').forEach(el => {
            if (el.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')) hiddenFocusable++;
        });

        doc.querySelectorAll('[aria-labelledby]').forEach(el => {
            const ids = el.getAttribute('aria-labelledby').split(/\s+/);
            ids.forEach(id => {
                if (!doc.getElementById(id)) invalidLabelledBy++;
            });
        });

        if (hiddenFocusable > 0) {
            issues.push({ type: 'error', icon: '🎭', title: 'Focusable Inside aria-hidden (' + hiddenFocusable + ')',
                message: hiddenFocusable + ' aria-hidden="true" container(s) contain focusable elements. Contradicts accessibility.',
                fix: 'Remove focusable elements from aria-hidden, or add tabindex="-1" to them.' });
        }
        if (invalidLabelledBy > 0) {
            issues.push({ type: 'error', icon: '❌', title: 'Invalid aria-labelledby References (' + invalidLabelledBy + ')',
                message: invalidLabelledBy + ' reference(s) to non-existent IDs in aria-labelledby.',
                fix: 'Ensure all IDs in aria-labelledby exist in the document.' });
        }
    }

    // ========================================================
    // RULE 7: Tables
    // ========================================================
    function checkTables(doc, issues) {
        const tables = doc.querySelectorAll('table');
        let noHeaders = 0, noScope = 0, noCaption = 0;
        tables.forEach(table => {
            const ths = table.querySelectorAll('th');
            if (ths.length === 0) noHeaders++;
            else {
                ths.forEach(th => { if (!th.hasAttribute('scope')) noScope++; });
            }
            if (!table.querySelector('caption')) noCaption++;
        });
        if (noHeaders > 0) {
            issues.push({ type: 'error', icon: '📊', title: 'Tables Without Headers (' + noHeaders + ')',
                message: noHeaders + ' table(s) have no <th> elements. Data relationships unclear to screen readers.',
                fix: 'Add <th> elements for headers. Use scope="col" for column headers.' });
        }
        if (noScope > 0) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Headers Without Scope (' + noScope + ')',
                message: noScope + ' <th>(s) lack scope attribute. Helps screen readers associate headers with cells.',
                fix: 'Add scope="col" or scope="row" to all <th> elements.' });
        }
        if (noCaption > 0) {
            issues.push({ type: 'warning', icon: '⚠️', title: 'Tables Without Caption (' + noCaption + ')',
                message: noCaption + ' table(s) lack <caption> describing their purpose.',
                fix: 'Add <caption> as first child of <table> describing the data.' });
        }
    }

    // ========================================================
    // RULE 8: Videos
    // ========================================================
    function checkVideos(doc, issues) {
        const videos = doc.querySelectorAll('video');
        let noCaptions = 0, noPoster = 0;
        videos.forEach(v => {
            if (!v.querySelector('track[kind="captions"], track[kind="subtitles"]')) noCaptions++;
            if (!v.hasAttribute('poster')) noPoster++;
        });
        if (noCaptions > 0) {
            issues.push({ type: 'error', icon: '🎬', title: 'Videos Without Captions (' + noCaptions + ')',
                message: noCaptions + ' video(s) lack captions. Inaccessible to deaf and hard-of-hearing users.',
                fix: 'Add <track kind="captions" src="captions.vtt" srclang="en" label="English"> inside <video>.' });
        }
        if (noPoster > 0) {
            issues.push({ type: 'info', icon: 'ℹ️', title: 'Videos Without Poster (' + noPoster + ')',
                message: noPoster + ' video(s) lack poster attribute. No preview shown before loading.',
                fix: 'Add poster="preview.jpg" to <video> for better UX.' });
        }
    }

    // ========================================================
    // RULE 9: Page Title (WCAG 2.4.2)
    // ========================================================
    function checkPageTitle(doc, issues) {
        const title = doc.querySelector('title');
        if (!title || !title.textContent.trim()) {
            issues.push({ type: 'error', icon: '📑', title: 'Missing or Empty Page Title (WCAG 2.4.2)',
                message: 'The <title> element is missing or empty. This is the first thing announced by screen readers and vital for browser tabs and bookmarks.',
                fix: 'Add a descriptive <title> inside <head>. Example: <title>Accessibility Checker | kingdom.lat</title>' });
        }
    }

    // ========================================================
    // RULE 10: Duplicate IDs
    // ========================================================
    function checkDuplicateIDs(doc, issues) {
        const ids = {};
        doc.querySelectorAll('[id]').forEach(el => {
            const id = el.id;
            if (id) ids[id] = (ids[id] || 0) + 1;
        });
        const duplicates = Object.entries(ids).filter(([_, c]) => c > 1);
        if (duplicates.length > 0) {
            const example = duplicates.slice(0, 3).map(([id, c]) => `"${id}" (${c}x)`).join(', ');
            issues.push({ type: 'error', icon: '🔁', title: 'Duplicate IDs (' + duplicates.length + ')',
                message: 'Found ' + duplicates.length + ' duplicate ID(s): ' + example + '. This breaks <label for="...">, aria-labelledby, and anchor navigation.',
                fix: 'Ensure every ID is unique. IDs must be unique across the entire document.' });
        }
    }

    // ========================================================
    // DISPLAY RESULTS
    // ========================================================
    function showResults(issues) {
        resultsList.innerHTML = '';

        const counts = { error: 0, warning: 0, info: 0, success: 0 };
        issues.forEach(i => counts[i.type]++);

        // Summary
        const summary = document.createElement('div');
        summary.className = 'results-summary';
        summary.setAttribute('role', 'status');
        summary.setAttribute('aria-live', 'polite');

        if (counts.success > 0) {
            summary.innerHTML = '<span class="summary-success">🏆 Perfect Score! Passed All 10 Checks</span>';
        } else {
            let html = '';
            if (counts.error > 0) html += '<span class="summary-error">❌ ' + counts.error + ' Error' + (counts.error !== 1 ? 's' : '') + '</span>';
            if (counts.warning > 0) html += '<span class="summary-warning">⚠️ ' + counts.warning + ' Warning' + (counts.warning !== 1 ? 's' : '') + '</span>';
            if (counts.info > 0) html += '<span class="summary-info">ℹ️ ' + counts.info + ' Info</span>';
            html += '<span class="summary-total">📋 ' + issues.length + ' Total</span>';
            summary.innerHTML = html;
        }
        resultsList.appendChild(summary);

        // Issue Cards
        issues.forEach(issue => {
            const card = document.createElement('div');
            card.className = 'issue-card issue-' + issue.type;
            card.setAttribute('role', 'listitem');
            card.setAttribute('tabindex', '0');
            card.innerHTML =
                '<div class="issue-header">' +
                    '<span class="issue-icon">' + issue.icon + '</span>' +
                    '<span class="issue-title">' + escapeHTML(issue.title) + '</span>' +
                    '<span class="issue-badge badge-' + issue.type + '">' + issue.type.toUpperCase() + '</span>' +
                '</div>' +
                '<p class="issue-message">' + escapeHTML(issue.message) + '</p>' +
                '<div class="issue-fix"><strong>💡 How to fix:</strong> ' + escapeHTML(issue.fix) + '</div>';
            resultsList.appendChild(card);
        });

        resultsFrame.hidden = false;
        resultsFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announce('Scan complete. ' + counts.error + ' errors, ' + counts.warning + ' warnings.');
    }

    // ========================================================
    // SAMPLE HTML
    // ========================================================
    function loadSampleHTML() {
        htmlInput.value = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Sample Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <h3>Skipped H2 (Issue)</h3>
    <img src="photo.jpg">
    <img src="decorative.jpg" alt="">
    <a href="https://example.com" target="_blank">Click here</a>
    <button>✓ Good Button</button>
    <button aria-label="Close">✕</button>
    <table>
        <tr><td>Name</td><td>Age</td></tr>
    </table>
    <div id="box1">Box 1</div>
    <div id="box1">Box 2 (Duplicate ID)</div>
    <div style="color: #888; background-color: #aaa;">Low contrast text</div>
    <div aria-hidden="true">
        <button>Hidden focusable</button>
    </div>
    <video controls src="video.mp4"></video>
</body>
</html>`;
        htmlInput.focus();
        announce('Sample HTML loaded. Click "Start Local Scan" to see the results.');
    }

    function clearAll() {
        htmlInput.value = '';
        resultsFrame.hidden = true;
        htmlInput.focus();
        announce('Scan area cleared.');
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function announce(message) {
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'assertive');
        el.className = 'visually-hidden';
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => document.body.removeChild(el), 3000);
    }
});
