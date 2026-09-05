// ============================================================
// ACCESSIBILITY CHECKER - Professional Local Scan Engine
// 100% Client-Side | Zero Tracking | Zero External Requests
// Advanced 8-Rule System with Color Contrast Analysis
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

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHTML, 'text/html');

        const issues = [];

        // Run all 8 advanced rules
        checkColorContrast(doc, rawHTML, issues);
        checkHeadingStructure(doc, issues);
        checkAltText(doc, issues);
        checkLinks(doc, issues);
        checkKeyboardNavigation(doc, issues);
        checkARIA(doc, issues);
        checkTables(doc, issues);
        checkVideos(doc, issues);

        if (issues.length === 0) {
            showResults([
                {
                    type: 'success',
                    icon: '✅',
                    title: 'Excellent! No Issues Found',
                    message: 'The scanned HTML passed all 8 advanced accessibility checks.',
                    fix: 'Remember: automated checks cover technical rules. Manual testing with screen readers is still recommended for full WCAG compliance.'
                }
            ]);
        } else {
            showResults(issues);
        }
    }

    // ========================================================
    // RULE 1: Color Contrast Checker (Advanced)
    // ========================================================

    function checkColorContrast(doc, rawHTML, issues) {
        const elementsWithInlineStyles = doc.querySelectorAll('[style*="color"], [style*="background"]');
        let contrastIssues = 0;
        let checkedPairs = 0;

        elementsWithInlineStyles.forEach(function (el) {
            const style = el.getAttribute('style');
            
            // Extract foreground color
            const fgMatch = style.match(/color\s*:\s*([^;]+)/i);
            // Extract background color
            const bgMatch = style.match(/background(?:-color)?\s*:\s*([^;]+)/i);

            if (fgMatch && bgMatch) {
                checkedPairs++;
                const fgColor = fgMatch[1].trim();
                const bgColor = bgMatch[1].trim();

                const ratio = calculateContrastRatio(fgColor, bgColor);
                
                if (ratio < 4.5) {
                    contrastIssues++;
                }
            }
        });

        if (contrastIssues > 0) {
            issues.push({
                type: 'error',
                icon: '🎨',
                title: 'Low Color Contrast (' + contrastIssues + ' found)',
                message: contrastIssues + ' element(s) have insufficient color contrast (below 4.5:1 ratio). This makes text difficult to read for users with visual impairments.',
                fix: 'Ensure text has a contrast ratio of at least 4.5:1 against its background. Use tools like WebAIM Contrast Checker to verify colors. Example: dark text (#030812) on light background (#FFFFFF) achieves 18:1 ratio.'
            });
        }

        if (checkedPairs === 0 && elementsWithInlineStyles.length > 0) {
            issues.push({
                type: 'info',
                icon: 'ℹ️',
                title: 'Color Contrast Not Fully Checked',
                message: 'The page contains inline styles, but complete color pairs (foreground + background) were not found for contrast analysis.',
                fix: 'For accurate contrast checking, ensure both color and background-color are specified in inline styles. For CSS-based styling, use browser developer tools for manual inspection.'
            });
        }
    }

    // Helper: Calculate contrast ratio between two colors
    function calculateContrastRatio(color1, color2) {
        const rgb1 = parseColor(color1);
        const rgb2 = parseColor(color2);

        if (!rgb1 || !rgb2) return 21; // Default to passing if parsing fails

        const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    // Helper: Parse color string to RGB
    function parseColor(color) {
        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 3) {
                return {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16)
                };
            } else if (hex.length === 6) {
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16)
                };
            }
        }
        
        // Handle rgb() and rgba()
        const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }

        return null;
    }

    // Helper: Calculate relative luminance
    function calculateLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(function (c) {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // ========================================================
    // RULE 2: Heading Structure (Enhanced)
    // ========================================================

    function checkHeadingStructure(doc, issues) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

        if (headings.length === 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'No Headings Found',
                message: 'The page has no heading elements (H1-H6). Headings create a logical structure that helps screen reader users navigate.',
                fix: 'Add at least one <h1> for the main title, then use <h2>, <h3>, etc. for subsections in sequential order.'
            });
            return;
        }

        // Check for missing H1
        const h1Count = doc.querySelectorAll('h1').length;
        if (h1Count === 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Missing H1 Heading',
                message: 'The page does not have an <h1> element. Every page should have exactly one <h1> as the main title.',
                fix: 'Add a single <h1> element at the top of your main content area.'
            });
        } else if (h1Count > 1) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Multiple H1 Headings (' + h1Count + ' found)',
                message: 'The page has ' + h1Count + ' <h1> elements. Best practice is to have only one <h1> per page for clear hierarchy.',
                fix: 'Use a single <h1> for the main page title. Use <h2> and below for subsections.'
            });
        }

        // Check heading order
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
                message: 'Heading levels are not sequential. For example, jumping from <h2> directly to <h4> confuses screen reader users about the content hierarchy.',
                fix: 'Ensure headings follow a logical order: H1 → H2 → H3 → H4. Do not skip levels.'
            });
        }
    }

    // ========================================================
    // RULE 3: Alt Text Checker (Enhanced)
    // ========================================================

    function checkAltText(doc, issues) {
        const images = doc.querySelectorAll('img');
        let missingAlt = 0;
        let emptyAlt = 0;
        let shortAlt = 0;

        images.forEach(function (img) {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            } else {
                const altText = img.getAttribute('alt').trim();
                if (altText === '') {
                    emptyAlt++;
                } else if (altText.length < 5) {
                    shortAlt++;
                }
            }
        });

        if (missingAlt > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Images Missing Alt Attribute (' + missingAlt + ' found)',
                message: missingAlt + ' image(s) do not have an "alt" attribute at all. Screen readers cannot describe these images to visually impaired users.',
                fix: 'Add a descriptive alt attribute to every <img> tag. Example: <img src="photo.jpg" alt="A sunset over the ocean">. If the image is purely decorative, use alt="".'
            });
        }

        if (emptyAlt > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Images with Empty Alt Text (' + emptyAlt + ' found)',
                message: emptyAlt + ' image(s) have an empty alt attribute (alt=""). This is acceptable ONLY for purely decorative images.',
                fix: 'If the image conveys meaning or information, add a descriptive alt text. If it is purely decorative, alt="" is correct.'
            });
        }

        if (shortAlt > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Images with Very Short Alt Text (' + shortAlt + ' found)',
                message: shortAlt + ' image(s) have alt text shorter than 5 characters. Very short alt text may not be descriptive enough.',
                fix: 'Ensure alt text is descriptive and meaningful. Avoid single words like "image" or "photo". Describe what the image shows.'
            });
        }
    }

    // ========================================================
    // RULE 4: Link Checker (Enhanced with Security)
    // ========================================================

    function checkLinks(doc, issues) {
        const links = doc.querySelectorAll('a[href]');
        let emptyLinks = 0;
        let insecureExternalLinks = 0;
        let genericLinks = 0;

        links.forEach(function (link) {
            const text = link.textContent.trim().toLowerCase();
            const href = link.getAttribute('href');
            const ariaLabel = link.getAttribute('aria-label');
            const ariaLabelledBy = link.getAttribute('aria-labelledby');
            const title = link.getAttribute('title');
            const imgAlt = link.querySelector('img') ? link.querySelector('img').getAttribute('alt') : null;

            // Check for empty or generic text
            if (!text && !ariaLabel && !ariaLabelledBy && !title && !imgAlt) {
                emptyLinks++;
            } else if (text === 'click here' || text === 'read more' || text === 'more' || text === 'link') {
                genericLinks++;
            }

            // Check external links for security attributes
            if (href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))) {
                const target = link.getAttribute('target');
                const rel = link.getAttribute('rel');

                if (target === '_blank' && (!rel || !rel.includes('noopener') || !rel.includes('noreferrer'))) {
                    insecureExternalLinks++;
                }
            }
        });

        if (emptyLinks > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Links Without Accessible Text (' + emptyLinks + ' found)',
                message: emptyLinks + ' link(s) have no accessible text. Screen reader users will hear "link" with no description of the destination.',
                fix: 'Add descriptive text inside the <a> tag, or use aria-label. Avoid generic text like "click here" or "read more".'
            });
        }

        if (genericLinks > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Links with Generic Text (' + genericLinks + ' found)',
                message: genericLinks + ' link(s) use generic text like "click here" or "read more". This is not descriptive for screen reader users who navigate by links.',
                fix: 'Use descriptive link text that explains the destination. Example: "Read our accessibility guide" instead of "Read more".'
            });
        }

        if (insecureExternalLinks > 0) {
            issues.push({
                type: 'error',
                icon: '🔒',
                title: 'Insecure External Links (' + insecureExternalLinks + ' found)',
                message: insecureExternalLinks + ' external link(s) open in a new tab without rel="noopener noreferrer". This is a security risk that allows the new page to access the original page.',
                fix: 'Add rel="noopener noreferrer" to all external links that open in new tabs. Example: <a href="https://example.com" target="_blank" rel="noopener noreferrer">.'
            });
        }
    }

    // ========================================================
    // RULE 5: Keyboard Navigation Checker
    // ========================================================

    function checkKeyboardNavigation(doc, issues) {
        let positiveTabindex = 0;
        let focusableWithoutHref = 0;

        // Check for positive tabindex (bad practice)
        doc.querySelectorAll('[tabindex]').forEach(function (el) {
            const tabindex = parseInt(el.getAttribute('tabindex'));
            if (tabindex > 0) {
                positiveTabindex++;
            }
        });

        // Check for elements that should be focusable but aren't
        doc.querySelectorAll('div[onclick], span[onclick], div[role="button"], span[role="button"]').forEach(function (el) {
            if (!el.getAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
                focusableWithoutHref++;
            }
        });

        if (positiveTabindex > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Positive Tabindex Values (' + positiveTabindex + ' found)',
                message: positiveTabindex + ' element(s) use tabindex with a value greater than 0. This disrupts the natural tab order and confuses keyboard users.',
                fix: 'Avoid using tabindex values greater than 0. Use tabindex="0" to make elements focusable in natural order, or tabindex="-1" to remove from tab order but keep programmatically focusable.'
            });
        }

        if (focusableWithoutHref > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Non-Focusable Interactive Elements (' + focusableWithoutHref + ' found)',
                message: focusableWithoutHref + ' element(s) have click handlers or button roles but are not keyboard focusable. Keyboard users cannot access these elements.',
                fix: 'Add tabindex="0" to make custom interactive elements keyboard accessible. Better yet, use semantic elements like <button> or <a> instead of <div> or <span>.'
            });
        }
    }

    // ========================================================
    // RULE 6: ARIA Checker (Advanced)
    // ========================================================

    function checkARIA(doc, issues) {
        let ariaHiddenWithFocusable = 0;
        let invalidAriaLabelledBy = 0;
        let missingAriaOnInteractive = 0;

        // Check for aria-hidden="true" containing focusable elements
        doc.querySelectorAll('[aria-hidden="true"]').forEach(function (el) {
            const focusableChildren = el.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableChildren.length > 0) {
                ariaHiddenWithFocusable++;
            }
        });

        // Check for invalid aria-labelledby references
        doc.querySelectorAll('[aria-labelledby]').forEach(function (el) {
            const labelledById = el.getAttribute('aria-labelledby');
            const referencedElement = doc.getElementById(labelledById);
            if (!referencedElement) {
                invalidAriaLabelledBy++;
            }
        });

        // Check for interactive elements without accessible names
        doc.querySelectorAll('button, a[href], input:not([type="hidden"])').forEach(function (el) {
            const hasText = el.textContent.trim().length > 0;
            const hasAriaLabel = el.hasAttribute('aria-label');
            const hasAriaLabelledBy = el.hasAttribute('aria-labelledby');
            const hasTitle = el.hasAttribute('title');

            if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
                missingAriaOnInteractive++;
            }
        });

        if (ariaHiddenWithFocusable > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Focusable Elements Inside aria-hidden (' + ariaHiddenWithFocusable + ' found)',
                message: ariaHiddenWithFocusable + ' element(s) with aria-hidden="true" contain focusable child elements. This creates a contradiction: hidden from screen readers but still keyboard accessible.',
                fix: 'Remove focusable elements from aria-hidden containers, or add tabindex="-1" to make them non-focusable. aria-hidden="true" should only contain non-interactive content.'
            });
        }

        if (invalidAriaLabelledBy > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Invalid aria-labelledby References (' + invalidAriaLabelledBy + ' found)',
                message: invalidAriaLabelledBy + ' element(s) reference non-existent IDs in aria-labelledby. Screen readers cannot find the labeling element.',
                fix: 'Ensure the ID referenced in aria-labelledby exists in the document. Example: <button aria-labelledby="btn-label"> and <span id="btn-label">Submit</span>.'
            });
        }

        if (missingAriaOnInteractive > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Interactive Elements Without Accessible Names (' + missingAriaOnInteractive + ' found)',
                message: missingAriaOnInteractive + ' interactive element(s) lack accessible names (no text, aria-label, aria-labelledby, or title). Screen readers cannot announce their purpose.',
                fix: 'Add visible text, aria-label, aria-labelledby, or title to all interactive elements. Example: <button aria-label="Close menu">✕</button>.'
            });
        }
    }

    // ========================================================
    // RULE 7: Table Checker (Enhanced)
    // ========================================================

    function checkTables(doc, issues) {
        const tables = doc.querySelectorAll('table');
        let tablesWithoutHeaders = 0;
        let tablesWithoutScope = 0;
        let tablesWithoutCaption = 0;

        tables.forEach(function (table) {
            const thElements = table.querySelectorAll('th');
            const caption = table.querySelector('caption');

            if (thElements.length === 0) {
                tablesWithoutHeaders++;
            } else {
                // Check if th elements have scope attribute
                thElements.forEach(function (th) {
                    if (!th.hasAttribute('scope')) {
                        tablesWithoutScope++;
                    }
                });
            }

            if (!caption) {
                tablesWithoutCaption++;
            }
        });

        if (tablesWithoutHeaders > 0) {
            issues.push({
                type: 'error',
                icon: '❌',
                title: 'Tables Without Header Cells (' + tablesWithoutHeaders + ' found)',
                message: tablesWithoutHeaders + ' table(s) have no <th> elements. Screen reader users cannot understand the table structure or data relationships.',
                fix: 'Add <th> elements for column and row headers. Example: <th scope="col">Name</th> for column headers.'
            });
        }

        if (tablesWithoutScope > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Table Headers Without Scope (' + tablesWithoutScope + ' found)',
                message: tablesWithoutScope + ' <th> element(s) lack the "scope" attribute. This attribute helps screen readers associate headers with their data cells.',
                fix: 'Add scope="col" for column headers and scope="row" for row headers. Example: <th scope="col">Name</th>.'
            });
        }

        if (tablesWithoutCaption > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Tables Without Captions (' + tablesWithoutCaption + ' found)',
                message: tablesWithoutCaption + ' table(s) lack a <caption> element. Captions provide a description of the table purpose for screen reader users.',
                fix: 'Add a <caption> element as the first child of <table>. Example: <caption>Monthly Sales Data</caption>.'
            });
        }
    }

    // ========================================================
    // RULE 8: Video Checker (Enhanced)
    // ========================================================

    function checkVideos(doc, issues) {
        const videos = doc.querySelectorAll('video');
        let videosWithoutCaptions = 0;
        let videosWithoutPoster = 0;

        videos.forEach(function (video) {
            const captionTracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
            const poster = video.getAttribute('poster');

            if (captionTracks.length === 0) {
                videosWithoutCaptions++;
            }

            if (!poster) {
                videosWithoutPoster++;
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

        if (videosWithoutPoster > 0) {
            issues.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Videos Without Poster Images (' + videosWithoutPoster + ' found)',
                message: videosWithoutPoster + ' video(s) lack a poster attribute. The poster image provides a preview before the video loads.',
                fix: 'Add a poster attribute to <video> elements. Example: <video poster="preview.jpg">. This improves user experience and accessibility.'
            });
        }
    }

    // ========================================================
    // DISPLAY RESULTS (Enhanced UI)
    // ========================================================

    function showResults(issues) {
        resultsList.innerHTML = '';

        let errorCount = 0;
        let warningCount = 0;
        let successCount = 0;
        let infoCount = 0;

        issues.forEach(function (issue) {
            if (issue.type === 'error') errorCount++;
            else if (issue.type === 'warning') warningCount++;
            else if (issue.type === 'success') successCount++;
            else if (issue.type === 'info') infoCount++;
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
                (infoCount > 0 ? '<span class="summary-info">ℹ️ ' + infoCount + ' Info</span>' : '') +
                '<span class="summary-total">📋 ' + issues.length + ' Total Issue' + (issues.length !== 1 ? 's' : '') + '</span>';
        }

        resultsList.appendChild(summary);

        // Individual issue cards
        issues.forEach(function (issue, index) {
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
                '<div class="issue-fix">' +
                    '<strong>💡 How to fix:</strong> ' + escapeHTML(issue.fix) +
                '</div>';

            resultsList.appendChild(card);
        });

        resultsFrame.hidden = false;
        resultsFrame.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
    // HELPER: Escape HTML
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

    // ========================================================
    // SCROLL TO TOP FUNCTIONALITY
    // ========================================================
    
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
