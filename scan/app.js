// ============================================================
// ACCESSIBILITY CHECKER - Local Scan Engine
// 100% Client-Side | Zero Tracking | Zero External Requests
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const htmlInput = document.getElementById('htmlInput');
    const checkBtn = document.getElementById('checkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsFrame = document.getElementById('resultsFrame');
    const resultsList = document.getElementById('resultsList');

    // ========================================================
    // EVENT LISTENERS
    // ========================================================

    checkBtn.addEventListener('click', runScan);
    clearBtn.addEventListener('click', clearAll);

    // Allow Ctrl+Enter to trigger scan
    htmlInput.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'Enter') {
            runScan();
        }
    });

    // ========================================================
    // MAIN SCAN FUNCTION
    // ========================================================

    function runScan() {
        const rawHTML = htmlInput.value.trim();

        if (!rawHTML) {
            showResults([
                {
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Empty Input',
                    message: 'Please paste HTML code in the text area before scanning.',
                    fix: 'Copy the page source (Ctrl+U) and paste it into the scan area.'
                }
            ]);
            return;
        }

        // Parse HTML safely using DOMParser (no external requests)
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHTML, 'text/html');

        const issues = [];

        // Run all 10 rules
        checkImages(doc, issues);
        checkHeadings(doc, issues);
        checkButtons(doc, issues);
        checkLinks(doc, issues);
        checkFormInputs(doc, issues);
        checkPageLanguage(doc, rawHTML, issues);
        checkPageTitle(doc, issues);
        checkTables(doc, issues);
        checkVideos(doc, issues);
        checkAriaAttributes(doc, issues);

        // Show results
        if (issues.length === 0) {
            showResults([
                {
                    type: 'success',
                    icon: '✅',
                    title: 'No Issues Found!',
                    message: 'The scanned HTML passed all 10 accessibility checks.',
                    fix: 'Keep in mind that automated checks cover basic rules only. Manual review is still recommended for full WCAG compliance.'
                }
            ]);
        } else {
            showResults(issues);
        }
    }

    // ========================================================
    // RULE 1: Images without alt text
    // ========================================================

    function checkImages(doc, issues) {
        const images = doc.querySelectorAll('img');
        let missingAlt = 0;
        let emptyAlt = 0;

        images.forEach(function (img) {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            } else if (img.getAttribute('alt').trim() === '') {
                emptyAlt++;
            }
        });

        if (missingAlt > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Images Missing Alt Text (' + missingAlt + ' found)',
                message: missingAlt + ' image(s) do not have an "alt" attribute. Screen readers cannot describe these images to visually impaired users.',
                fix: 'Add a descriptive alt attribute to every <img> tag. Example: <img src="photo.jpg" alt="A sunset over the ocean">. If the image is purely decorative, use alt="".'
            });
        }

        if (emptyAlt > 0 && missingAlt === 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Images with Empty Alt Text (' + emptyAlt + ' found)',
                message: emptyAlt + ' image(s) have an empty alt attribute (alt=""). This is acceptable only for decorative images.',
                fix: 'If the image conveys meaning, add a descriptive alt text. If it is purely decorative, alt="" is correct.'
            });
        }
    }

    // ========================================================
    // RULE 2: Heading order (H1-H6)
    // ========================================================

    function checkHeadings(doc, issues) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

        if (headings.length === 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'No Headings Found',
                message: 'The page has no heading elements (H1-H6). Headings help screen reader users navigate the page structure.',
                fix: 'Add at least one <h1> for the main title, then use <h2>, <h3>, etc. for subsections in logical order.'
            });
            return;
        }

        // Check for multiple H1 tags
        const h1Count = doc.querySelectorAll('h1').length;
        if (h1Count > 1) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Multiple H1 Tags (' + h1Count + ' found)',
                message: 'The page has ' + h1Count + ' <h1> elements. Best practice is to have only one <h1> per page.',
                fix: 'Use a single <h1> for the main page title. Use <h2> and below for subsections.'
            });
        }

        // Check heading order (skipping levels)
        let previousLevel = 0;
        let skippedLevels = 0;

        headings.forEach(function (heading) {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            if (previousLevel > 0 && currentLevel > previousLevel + 1) {
                skippedLevels++;
            }
            previousLevel = currentLevel;
        });

        if (skippedLevels > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Skipped Heading Levels (' + skippedLevels + ' found)',
                message: 'Heading levels are not in sequential order. For example, jumping from <h2> directly to <h4> confuses screen reader users.',
                fix: 'Ensure headings follow a logical order: H1 → H2 → H3 → H4. Do not skip levels.'
            });
        }
    }

    // ========================================================
    // RULE 3: Buttons without accessible text
    // ========================================================

    function checkButtons(doc, issues) {
        const buttons = doc.querySelectorAll('button');
        let emptyButtons = 0;

        buttons.forEach(function (btn) {
            const text = btn.textContent.trim();
            const ariaLabel = btn.getAttribute('aria-label');
            const ariaLabelledBy = btn.getAttribute('aria-labelledby');

            if (!text && !ariaLabel && !ariaLabelledBy) {
                emptyButtons++;
            }
        });

        if (emptyButtons > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Buttons Without Text (' + emptyButtons + ' found)',
                message: emptyButtons + ' button(s) have no visible text or aria-label. Screen reader users will hear "button" with no description.',
                fix: 'Add descriptive text inside the button, or use aria-label. Example: <button aria-label="Close menu">✕</button>.'
            });
        }
    }

    // ========================================================
    // RULE 4: Links without accessible text
    // ========================================================

    function checkLinks(doc, issues) {
        const links = doc.querySelectorAll('a[href]');
        let emptyLinks = 0;

        links.forEach(function (link) {
            const text = link.textContent.trim();
            const ariaLabel = link.getAttribute('aria-label');
            const ariaLabelledBy = link.getAttribute('aria-labelledby');
            const title = link.getAttribute('title');
            const imgAlt = link.querySelector('img') ? link.querySelector('img').getAttribute('alt') : null;

            if (!text && !ariaLabel && !ariaLabelledBy && !title && !imgAlt) {
                emptyLinks++;
            }
        });

        if (emptyLinks > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Links Without Text (' + emptyLinks + ' found)',
                message: emptyLinks + ' link(s) have no accessible text. Screen reader users will hear "link" with no description of the destination.',
                fix: 'Add descriptive text inside the <a> tag, or use aria-label. Avoid generic text like "click here" or "read more".'
            });
        }
    }

    // ========================================================
    // RULE 5: Form inputs without labels
    // ========================================================

    function checkFormInputs(doc, issues) {
        const inputs = doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea');
        let unlabeledInputs = 0;

        inputs.forEach(function (input) {
            const id = input.getAttribute('id');
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');
            const title = input.getAttribute('title');
            const placeholder = input.getAttribute('placeholder');

            // Check if there is a <label> linked to this input
            let hasLabel = false;
            if (id) {
                const label = doc.querySelector('label[for="' + id + '"]');
                if (label) hasLabel = true;
            }

            // Check if input is wrapped inside a <label>
            if (input.closest('label')) {
                hasLabel = true;
            }

            if (!hasLabel && !ariaLabel && !ariaLabelledBy && !title) {
                unlabeledInputs++;
            }
        });

        if (unlabeledInputs > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Form Inputs Without Labels (' + unlabeledInputs + ' found)',
                message: unlabeledInputs + ' form input(s) have no associated <label>, aria-label, or title. Screen reader users cannot understand the purpose of these fields.',
                fix: 'Add a <label> element linked to each input using the "for" attribute. Example: <label for="email">Email</label> <input id="email" type="email">.'
            });
        }
    }

    // ========================================================
    // RULE 6: Page language not set
    // ========================================================

    function checkPageLanguage(doc, rawHTML, issues) {
        const htmlTag = doc.querySelector('html');
        const lang = htmlTag ? htmlTag.getAttribute('lang') : null;

        if (!lang || lang.trim() === '') {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Page Language Not Set',
                message: 'The <html> tag does not have a "lang" attribute. Screen readers use this to determine the correct pronunciation and language rules.',
                fix: 'Add a lang attribute to the <html> tag. Example: <html lang="en"> for English, <html lang="ar"> for Arabic.'
            });
        }
    }

    // ========================================================
    // RULE 7: Empty or missing page title
    // ========================================================

    function checkPageTitle(doc, issues) {
        const title = doc.querySelector('title');

        if (!title || title.textContent.trim() === '') {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Empty or Missing Page Title',
                message: 'The page does not have a <title> element, or it is empty. The title is the first thing screen readers announce and is critical for browser tabs and bookmarks.',
                fix: 'Add a descriptive <title> inside the <head> section. Example: <title>Accessibility Checker | kingdom.lat</title>.'
            });
        }
    }

    // ========================================================
    // RULE 8: Tables without headers
    // ========================================================

    function checkTables(doc, issues) {
        const tables = doc.querySelectorAll('table');
        let tablesWithoutHeaders = 0;

        tables.forEach(function (table) {
            const thElements = table.querySelectorAll('th');
            const caption = table.querySelector('caption');

            if (thElements.length === 0 && !caption) {
                tablesWithoutHeaders++;
            }
        });

        if (tablesWithoutHeaders > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Tables Without Headers (' + tablesWithoutHeaders + ' found)',
                message: tablesWithoutHeaders + ' table(s) have no <th> elements or <caption>. Screen reader users cannot understand the table structure or data relationships.',
                fix: 'Add <th> elements for column and row headers, and a <caption> to describe the table purpose. Example: <caption>Monthly Sales Data</caption>.'
            });
        }
    }

    // ========================================================
    // RULE 9: Videos without captions or tracks
    // ========================================================

    function checkVideos(doc, issues) {
        const videos = doc.querySelectorAll('video');
        let videosWithoutCaptions = 0;

        videos.forEach(function (video) {
            const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
            if (tracks.length === 0) {
                videosWithoutCaptions++;
            }
        });

        if (videosWithoutCaptions > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Videos Without Captions (' + videosWithoutCaptions + ' found)',
                message: videosWithoutCaptions + ' video(s) do not have caption or subtitle tracks. Deaf and hard-of-hearing users cannot access the audio content.',
                fix: 'Add a <track> element inside each <video>. Example: <track kind="captions" src="captions.vtt" srclang="en" label="English">.'
            });
        }
    }

    // ========================================================
    // RULE 10: Missing ARIA landmarks
    // ========================================================

    function checkAriaAttributes(doc, issues) {
        const main = doc.querySelector('main, [role="main"]');
        const nav = doc.querySelector('nav, [role="navigation"]');
        const banner = doc.querySelector('header, [role="banner"]');
        const contentinfo = doc.querySelector('footer, [role="contentinfo"]');

        const missingLandmarks = [];
        if (!main) missingLandmarks.push('<main>');
        if (!nav) missingLandmarks.push('<nav>');
        if (!banner) missingLandmarks.push('<header>');
        if (!contentinfo) missingLandmarks.push('<footer>');

        if (missingLandmarks.length > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Missing Page Landmarks (' + missingLandmarks.length + ' missing)',
                message: 'The page is missing these landmark elements: ' + missingLandmarks.join(', ') + '. Landmarks help screen reader users jump between major sections quickly.',
                fix: 'Use semantic HTML elements: <main> for primary content, <nav> for navigation, <header> for the top section, and <footer> for the bottom section.'
            });
        }
    }

    // ========================================================
    // DISPLAY RESULTS
    // ========================================================

    function showResults(issues) {
        resultsList.innerHTML = '';

        // Count errors and warnings
        let errorCount = 0;
        let warningCount = 0;
        let successCount = 0;

        issues.forEach(function (issue) {
            if (issue.type === 'error') errorCount++;
            else if (issue.type === 'warning') warningCount++;
            else if (issue.type === 'success') successCount++;
        });

        // Summary bar
        const summary = document.createElement('div');
        summary.className = 'results-summary';
        summary.setAttribute('role', 'status');
        summary.setAttribute('aria-live', 'polite');

        if (successCount > 0) {
            summary.innerHTML = '<span class="summary-success">✅ ' + successCount + ' Passed</span>';
        } else {
            summary.innerHTML =
                '<span class="summary-error">❌ ' + errorCount + ' Error' + (errorCount !== 1 ? 's' : '') + '</span>' +
                '<span class="summary-warning">⚠️ ' + warningCount + ' Warning' + (warningCount !== 1 ? 's' : '') + '</span>' +
                '<span class="summary-total">📋 ' + issues.length + ' Total Issue' + (issues.length !== 1 ? 's' : '') + '</span>';
        }

        resultsList.appendChild(summary);

        // Individual issue cards
        issues.forEach(function (issue, index) {
            const card = document.createElement('div');
            card.className = 'issue-card issue-' + issue.type;
            card.setAttribute('role', 'listitem');

            card.innerHTML =
                '<div class="issue-header">' +
                    '<span class="issue-icon">' + issue.icon + '</span>' +
                    '<span class="issue-title">' + escapeHTML(issue.title) + '</span>' +
                    '<span class="issue-badge badge-' + issue.type + '">' + issue.type.toUpperCase() + '</span>' +
                '</div>' +
                '<p class="issue-message">' + escapeHTML(issue.message) + '</p>' +
                '<div class="issue-fix">' +
                    '<strong>💡 How to fix:</strong> ' + escapeHTML(issue.fix) +
                '</div>';

            resultsList.appendChild(card);
        });

        // Show results frame
        resultsFrame.hidden = false;
        resultsFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Announce to screen readers
        announceToScreenReader('Scan complete. Found ' + errorCount + ' errors and ' + warningCount + ' warnings.');
    }

    // ========================================================
    // CLEAR ALL
    // ========================================================

    function clearAll() {
        htmlInput.value = '';
        resultsFrame.hidden = true;
        resultsList.innerHTML = '<p class="placeholder-text">Waiting to start scan...</p>';
        htmlInput.focus();
        announceToScreenReader('Scan area cleared.');
    }

    // ========================================================
    // HELPER: Escape HTML to prevent XSS
    // ========================================================

    function escapeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ========================================================
    // HELPER: Announce to screen readers
    // ========================================================

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(function () {
            document.body.removeChild(announcement);
        }, 3000);
    }

});
    // ========================================================
    // SCROLL TO TOP FUNCTIONALITY
    // ========================================================
    
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function () {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top on click
    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
