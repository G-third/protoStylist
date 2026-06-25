const sizeSuffixes = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
window.getVariantName = function(groupKey, index, total) {
    const baseName = groupKey === 'paragraph' ? 'body' : groupKey;
    if (total === 1) return `${baseName}-md`;
    const midIndex = Math.floor(sizeSuffixes.length / 2);
    const suffixIndex = midIndex - Math.floor(total / 2) + index;
    const suffix = sizeSuffixes[suffixIndex] || `var${index + 1}`;
    return `${baseName}-${suffix}`;
}

const escapeAttr = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

window.extractGoogleFontUrl = function(input) {
    if (!input) return '';
    const str = input.trim();
    
    // Decode common HTML entities that might arise from input escaping or pasting
    const decoded = str
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&');

    // 1. Check for <link> tag href (support css2 or css)
    const linkMatch = decoded.match(/<link[^>]*\bhref=["'](https?:\/\/fonts\.googleapis\.com\/(?:css2|css)[^"']+)["']/i);
    if (linkMatch) {
        return linkMatch[1];
    }

    // 2. Check for @import statement URL (support css2 or css)
    const importMatch = decoded.match(/@import\s+(?:url\s*\()?\s*['"]?(https?:\/\/fonts\.googleapis\.com\/(?:css2|css)[^'"\)]+)['"]?\s*\)?/i);
    if (importMatch) {
        return importMatch[1];
    }

    // 3. Check for any raw URL pointing to google fonts (support css2 or css)
    const urlMatch = decoded.match(/(https?:\/\/fonts\.googleapis\.com\/(?:css2|css)[^\s"'>)]+)/i);
    if (urlMatch) {
        return urlMatch[1];
    }

    // 4. Check for Google Fonts specimen page URL (e.g. from address bar)
    const specimenMatch = decoded.match(/fonts\.google\.com\/specimen\/([^/?#\s]+)/i);
    if (specimenMatch) {
        const name = specimenMatch[1].replace(/[+_]+/g, ' ').trim();
        if (name) {
            return `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        }
    }

    // 5. Check if it contains CSS rules (like font-family: ...)
    const familyMatch = decoded.match(/font-family:\s*['"]?([^,'";\n]+)['"]?/i);
    if (familyMatch) {
        const name = familyMatch[1].replace(/['"]+/g, '').trim();
        if (name) {
            return `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        }
    }

    // 6. If it is a simple alphanumeric string (and not a URL / HTML / CSS), treat it as a font name and construct URL
    if (!decoded.includes('<') && !decoded.includes('{') && !decoded.includes(':') && decoded.length < 50) {
        const name = decoded.replace(/['"]+/g, '').trim();
        if (name) {
            return `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        }
    }

    return '';
};


window.standardFontData = {
    "'Roboto', sans-serif": {
        weights: [100, 300, 400, 500, 700, 900],
        urlPart: 'Roboto:wght@100;300;400;500;700;900'
    },
    "'Inter', sans-serif": {
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        urlPart: 'Inter:wght@100..900'
    },
    "'Lato', sans-serif": {
        weights: [100, 300, 400, 700, 900],
        urlPart: 'Lato:wght@100;300;400;700;900'
    },
    "'Montserrat', sans-serif": {
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        urlPart: 'Montserrat:wght@100..900'
    },
    "'Noto Serif', serif": {
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        urlPart: 'Noto+Serif:wght@100..900'
    },
    "'Playfair Display', serif": {
        weights: [400, 500, 600, 700, 800, 900],
        urlPart: 'Playfair+Display:wght@400..900'
    },
    "'Prata', serif": {
        weights: [400],
        urlPart: 'Prata'
    },
    "Georgia, serif": {
        weights: [400, 700],
        urlPart: null // System font, no import needed
    },
};

function parseGoogleFont(input) {
    if (!input) return { name: null, weights: [400, 700] };
    
    const url = window.extractGoogleFontUrl(input);
    if (!url) {
        // Fallback: treat the raw input string directly as the font family name
        return { name: input.trim(), weights: [400, 700] };
    }
    
    try {
        const urlObj = new URL(url);
        const familyParam = urlObj.searchParams.get('family');
        if (!familyParam) return { name: null, weights: [400, 700] };

        const fontNameWithStuff = familyParam.split('&')[0];
        
        let fontName = fontNameWithStuff;
        let weightsStr = '';
        if (fontNameWithStuff.includes(':ital,wght@')) {
            const parts = fontNameWithStuff.split(':ital,wght@');
            fontName = parts[0];
            weightsStr = parts[1];
        } else if (fontNameWithStuff.includes(':wght@')) {
            const parts = fontNameWithStuff.split(':wght@');
            fontName = parts[0];
            weightsStr = parts[1];
        } else if (fontNameWithStuff.includes(':')) {
            const parts = fontNameWithStuff.split(':');
            fontName = parts[0];
            weightsStr = parts[1];
        }
        
        const name = fontName.replace(/\+/g, ' ');
        let weights = [400, 700];
        if (weightsStr) {
            if (weightsStr.includes('..')) {
                weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
            } else {
                const parsedWeights = weightsStr.split(/[,;]+/).map(w => parseInt(w, 10)).filter(w => !isNaN(w) && w >= 100 && w <= 1000);
                if (parsedWeights.length > 0) {
                    weights = Array.from(new Set(parsedWeights));
                }
            }
        }
        return { name, weights };
    } catch (e) {
        // Fallback: treat the raw input string directly as the font family name
        return { name: input.trim(), weights: [400, 700] };
    }
}

window.typographyView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const createGroupPreview = (groupKey, groupState) => {
            const marginClass = 'mb-20';
            const headingStyle = state.colors.darkMode ? 'style="color: #888888;" font-family: var(--pst-shell-font);' : 'font-family: var(--pst-shell-font);';
            let html = `<div class="${marginClass}"><h3 class="pst-preview-heading mb-4 pb-2" ${headingStyle}>${groupKey}s</h3><div class="flex flex-col gap-6 w-full">`;
            groupState.variants.forEach((variant, index) => {
                let previewText = groupState.placeholderText || 'The quick brown fox jumps over the lazy dog.';
                if (groupKey === 'quote') {
                    if (!previewText.startsWith('“') && !previewText.startsWith('"')) {
                        previewText = `“${previewText}”`;
                    }
                }
                const variantName = getVariantName(groupKey, index, groupState.variants.length);
                const tokenName = `--font-size-${variantName}`;
                const typographyTestColor = state.typography.testColor;
                let textColorStyle;

                if (typographyTestColor) {
                    textColorStyle = `color: var(${typographyTestColor});`;
                } else {
                    textColorStyle = state.colors.darkMode ? 'color: #ffffff;' : 'color: #111827;';
                }
                html += `
                    <div class="flex flex-col items-start w-full">
                        <div style="${textColorStyle}" class="w-full mb-1">
                            <p class="text-${variantName} text-left">${previewText}</p>
                        </div>
                        <span class="text-xs text-zinc-500 dark:text-zinc-400 font-mono select-all">${tokenName}</span>
                    </div>
                `;
            });
            html += `</div></div>`;
            return html;
        };
        return `
            ${createGroupPreview('heading', state.typography.groups.heading)}
            ${createGroupPreview('paragraph', state.typography.groups.paragraph)}
            ${createGroupPreview('label', state.typography.groups.label)}
            ${createGroupPreview('quote', state.typography.groups.quote)}
        `;
    },
    getControlsHTML: (state) => {
        const createGroupControls = (groupKey, groupState, limits) => {
            const fontOptions = Object.keys(window.standardFontData);
            fontOptions.push('custom');
            fontOptions.push('local');

            const optionsHTML = fontOptions.map(font => {
                const isCustom = font === 'custom';
                const isLocal = font === 'local';
                let fontName;
                if (isCustom) fontName = 'Custom Google Font...';
                else if (isLocal) fontName = 'Local System Font...';
                else fontName = font.split(',')[0].replace(/'/g, '');
                
                const value = isCustom ? 'custom' : (isLocal ? 'local' : font);
                return `<option value="${value}" ${groupState.fontFamilySelection === value ? 'selected' : ''}>${fontName}</option>`
            }).join('');

            const variantsHTML = groupState.variants.map((variant, index) => {
                const variantName = getVariantName(groupKey, index, groupState.variants.length);

                // Define min/max for font size based on group
                let sizeMin, sizeMax;
                switch (groupKey) {
                    case 'heading':
                        sizeMin = 16;
                        sizeMax = 640;
                        break;
                    case 'paragraph':
                    case 'label':
                        sizeMin = 12;
                        sizeMax = 32;
                        break;
                    default:
                        sizeMin = 8;
                        sizeMax = 128;
                }
                const textTransformControl = (groupKey === 'heading' || groupKey === 'label') ? `
                    <div class="pst-control-item">
                        <label>Text Transform</label>
                        <select data-state-key="typography.groups.${groupKey}.variants.${index}.textTransform" class="w-32 bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            <option value="none" ${variant.textTransform === 'none' ? 'selected' : ''}>None</option>
                            <option value="uppercase" ${variant.textTransform === 'uppercase' ? 'selected' : ''}>Uppercase</option>
                            <option value="lowercase" ${variant.textTransform === 'lowercase' ? 'selected' : ''}>Lowercase</option>
                            <option value="capitalize" ${variant.textTransform === 'capitalize' ? 'selected' : ''}>Capitalize</option>
                        </select>
                    </div>
                ` : '';
                
                const fontWeightOptions = groupState.availableWeights.map(w =>
                    `<option value="${w}" ${variant.fontWeight == w ? 'selected' : ''}>${w}</option>`
                ).join('');

                const fontWeightControl = `
                    <div class="pst-control-item">
                        <label>Font Weight</label>
                        <select data-state-key="typography.groups.${groupKey}.variants.${index}.fontWeight" class="w-32 bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">${fontWeightOptions}</select>
                    </div>`;

                const italicActive = variant.fontStyle === 'italic';
                const underlineActive = !!variant.underline;
                const strikethroughActive = !!variant.strikethrough;

                const formatControl = `
                    <div class="pst-control-item">
                        <label>Style</label>
                        <div class="flex items-center space-x-1 border border-zinc-200 dark:border-zinc-850 rounded-md p-0.5 bg-zinc-50 dark:bg-zinc-900">
                            <!-- Italic Toggle -->
                            <button type="button" 
                                    data-format-toggle="fontStyle" 
                                    data-state-key="typography.groups.${groupKey}.variants.${index}.fontStyle" 
                                    class="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors ${italicActive ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80' : 'border border-transparent'}"
                                    title="Italic">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <line x1="19" y1="4" x2="10" y2="4"></line>
                                    <line x1="14" y1="20" x2="5" y2="20"></line>
                                    <line x1="15" y1="4" x2="9" y2="20"></line>
                                </svg>
                            </button>
                            <!-- Underline Toggle -->
                            <button type="button" 
                                    data-format-toggle="underline" 
                                    data-state-key="typography.groups.${groupKey}.variants.${index}.underline" 
                                    class="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors ${underlineActive ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80' : 'border border-transparent'}"
                                    title="Underline">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                                    <line x1="4" y1="21" x2="20" y2="21"></line>
                                </svg>
                            </button>
                            <!-- Strikethrough Toggle -->
                            <button type="button" 
                                    data-format-toggle="strikethrough" 
                                    data-state-key="typography.groups.${groupKey}.variants.${index}.strikethrough" 
                                    class="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors ${strikethroughActive ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80' : 'border border-transparent'}"
                                    title="Strikethrough">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M5 12h14"></path>
                                    <path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 6 8 8C8 11 16 10 16 13C16 15 14.5 17 12 17C9.5 17 8 15 8 15"></path>
                                </svg>
                            </button>
                        </div>
                    </div>`;

                return `
                <div class="pst-control-subgroup pst-control-group">
                    <div class="pst-control-item"><label class="font-semibold text-zinc-700 dark:text-zinc-300">${variantName}</label></div>
                    <div class="pst-control-item">
                        <label class="pst-scrubbable" data-scrub-min="${sizeMin}" data-scrub-max="${sizeMax}" data-scrub-step="1">Size (px)</label>
                        <div class="flex items-center space-x-2 flex-grow justify-end max-w-[180px]">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.size" type="range" value="${variant.size}" min="${sizeMin}" max="${sizeMax}" step="1" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.size" type="number" value="${variant.size}" min="${sizeMin}" max="${sizeMax}" step="1" class="w-20 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    <div class="pst-control-item">
                        <label class="pst-scrubbable" data-scrub-min="0.8" data-scrub-max="2.5" data-scrub-step="0.05">Line Height</label>
                        <div class="flex items-center space-x-2 flex-grow justify-end max-w-[180px]">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.lineHeight" type="range" value="${variant.lineHeight}" min="0.8" max="2.5" step="0.05" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.lineHeight" type="number" value="${variant.lineHeight}" min="0.8" max="2.5" step="0.05" class="w-20 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    <div class="pst-control-item">
                        <label class="pst-scrubbable" data-scrub-min="-30" data-scrub-max="30" data-scrub-step="0.1">Letter Spacing (px)</label>
                        <div class="flex items-center space-x-2 flex-grow justify-end max-w-[180px]">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.letterSpacing" type="range" value="${variant.letterSpacing}" min="-30" max="30" step="0.1" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.letterSpacing" type="number" value="${variant.letterSpacing}" min="-30" max="30" step="0.1" class="w-20 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    ${textTransformControl}
                    ${fontWeightControl}
                    ${formatControl}
                </div>`;
            }).join('');

            return `
            <div class="pst-control-accordion mt-6">
                <button class="pst-control-accordion-toggle">
                    <span>${groupKey}s</span>
                    <svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="pst-control-accordion-content">
                    <div class="pst-control-group">
                        <div class="pst-control-item">
                            <label>Font Family</label>
                            <select data-state-key="typography.groups.${groupKey}.fontFamilySelection" class="w-44 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">${optionsHTML}</select>
                        </div>
                        
                        ${groupState.fontFamilySelection === 'custom' ? `
                        <div class="pst-control-item pst-control-item-col">
                            <label class="font-semibold text-xs text-zinc-500">Google Font Link / Embed Tag</label>
                            <input data-state-key="typography.groups.${groupKey}.fontFamilyLink" type="text" value="${escapeAttr(groupState.fontFamilyLink || '')}" placeholder="Paste URL, &lt;link&gt; tag, or @import..." class="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-2 py-1 text-xs font-mono">
                            <p class="pst-help-text">Extracts family name from Google Fonts raw link, link tag, or CSS import statements automatically.</p>
                        </div>
                        ` : ''}

                        ${groupState.fontFamilySelection === 'local' ? `
                        <div class="pst-control-item pst-control-item-col">
                            <label class="font-semibold text-xs text-zinc-500">Local System Font</label>
                            <input data-state-key="typography.groups.${groupKey}.fontFamilyLink" list="local-fonts-list-${groupKey}" type="text" value="${escapeAttr(groupState.fontFamilyLink || '')}" placeholder="Search installed fonts..." class="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-2 py-1 text-sm pst-local-font-input">
                            <datalist id="local-fonts-list-${groupKey}" class="pst-local-fonts-datalist"></datalist>
                            <p class="pst-warning-text font-medium">Warning: Local fonts will not render for external users. You must package and distribute the font files separately when exporting code.</p>
                        </div>
                        ` : ''}


                        <div class="pst-control-item">
                            <label>Variants</label>
                            <input data-state-key="typography.groups.${groupKey}.count" type="number" value="${groupState.count}" min="${limits.min}" max="${limits.max}" class="w-20 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                        <div class="pst-control-item">
                            <label>Preview Text</label>
                            <input data-state-key="typography.groups.${groupKey}.placeholderText" type="text" value="${groupState.placeholderText || ''}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                        ${variantsHTML}
                    </div>
                </div>
            </div>`;
        };

        return `
    <div class="pst-control-group">
        <h3 class="pst-control-group-heading">Global Setting</h3>
        <div class="pst-control-item">
            <label class="pst-scrubbable" data-scrub-min="0.5" data-scrub-max="2.0" data-scrub-step="0.05">Size Scale</label>
            <div class="flex items-center space-x-2 flex-grow justify-end max-w-[180px]">
                <input data-state-key="typography.scale" type="range" value="${state.typography.scale}" min="0.5" max="2.0" step="0.05" class="flex-grow">
                <input data-state-key="typography.scale" type="number" value="${state.typography.scale}" min="0.5" max="2.0" step="0.05" class="w-20 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
            </div>
        </div>
        <div class="pst-control-item">
            <label>Test Font Colour</label>
            ${createColorSelectWithSwatch('typography.testColor', state.typography.testColor, state, { includeAuto: true })}
        </div>
    </div>
            ${createGroupControls('heading', state.typography.groups.heading, {min: 3, max: 6})}
            ${createGroupControls('paragraph', state.typography.groups.paragraph, {min: 1, max: 6})}
            ${createGroupControls('label', state.typography.groups.label, {min: 0, max: 6})}
            ${createGroupControls('quote', state.typography.groups.quote, {min: 0, max: 6})}
            <div class="mt-6 pt-4 border-t border-zinc-200">
                <button id="reset-typography-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};