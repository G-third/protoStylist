const sizeSuffixes = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
window.getVariantName = function(groupKey, index, total) {
    const baseName = groupKey === 'paragraph' ? 'body' : groupKey;
    if (total === 1) return `${baseName}-md`;
    const midIndex = Math.floor(sizeSuffixes.length / 2);
    const suffixIndex = midIndex - Math.floor(total / 2) + index;
    const suffix = sizeSuffixes[suffixIndex] || `var${index + 1}`;
    return `${baseName}-${suffix}`;
}

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

function parseGoogleFont(url) {
    if (!url) return { name: null, weights: [] };
    try {
        const urlObj = new URL(url);
        const familyParam = urlObj.searchParams.get('family');
        if (!familyParam) return { name: null, weights: [] };

        const fontNameWithStuff = familyParam.split('&')[0]; // Get first family if multiple
        const [fontName, weightsStr] = fontNameWithStuff.split(':wght@');
        
        const name = fontName.replace(/\+/g, ' ');
        let weights = [400, 700]; // Default fallback
        if (weightsStr) {
            if (weightsStr.includes('..')) {
                // It's a variable font, provide all weights
                weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
            } else {
                // It's a list of weights like 400;700
                weights = weightsStr.split(';').map(w => parseInt(w, 10)).filter(w => !isNaN(w));
            }
        }
        return { name, weights };
    } catch (e) {
        console.error("Could not parse font URL:", e);
        return { name: null, weights: [400, 700] };
    }
}

window.typographyView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const createGroupPreview = (groupKey, groupState) => {
            const marginClass = 'mb-12';
            const headingStyle = state.colors.darkMode ? 'style="color: #888888;"' : '';
            let html = `<div class="${marginClass}"><h3 class="pst-preview-heading mb-4 pb-2" ${headingStyle}>${groupKey}s</h3>`;
            groupState.variants.forEach((variant, index) => {
                const previewText = groupState.placeholderText || 'The quick brown fox jumps over the lazy dog.';
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
                    <div class="flex items-center mb-4">
                        <div style="width: 80%; ${textColorStyle}">
                            <p class="text-${variantName}">${previewText}</p>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono">${tokenName}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            return html;
        };
        return `
            ${createGroupPreview('heading', state.typography.groups.heading)}
            ${createGroupPreview('paragraph', state.typography.groups.paragraph)}
            ${createGroupPreview('label', state.typography.groups.label)}
        `;
    },
    getControlsHTML: (state) => {
        const createGroupControls = (groupKey, groupState, limits) => {
            const fontOptions = Object.keys(window.standardFontData);
            fontOptions.push('custom');

            const optionsHTML = fontOptions.map(font => {
                const isCustom = font === 'custom';
                const fontName = isCustom ? 'Custom from Link...' : font.split(',')[0].replace(/'/g, '');
                const value = isCustom ? 'custom' : font;
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
                    default: // Fallback for any other groups
                        sizeMin = 8;
                        sizeMax = 128;
                }
                const textTransformControl = (groupKey === 'heading' || groupKey === 'label') ? `
            <div class="pst-control-item">
                        <label>Text Transform</label>
                        <select data-state-key="typography.groups.${groupKey}.variants.${index}.textTransform" class="w-32 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
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
                        <select data-state-key="typography.groups.${groupKey}.variants.${index}.fontWeight" class="w-32 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">${fontWeightOptions}</select>
                    </div>`;

                return `
                <div class="pl-4 mt-8">
                    <div class="pst-control-item"><label class="font-semibold">${variantName}</label></div>
                    <div class="pst-control-item">
                        <label>Size (px)</label>
                        <div class="flex items-center space-x-2">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.size" type="range" value="${variant.size}" min="${sizeMin}" max="${sizeMax}" step="1" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.size" type="number" value="${variant.size}" min="${sizeMin}" max="${sizeMax}" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    <div class="pst-control-item">
                        <label>Line Height</label>
                        <div class="flex items-center space-x-2">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.lineHeight" type="range" value="${variant.lineHeight}" min="0.8" max="2.5" step="0.05" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.lineHeight" type="number" value="${variant.lineHeight}" min="0.8" max="2.5" step="0.05" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    <div class="pst-control-item">
                        <label>Letter Spacing (px)</label>
                        <div class="flex items-center space-x-2">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.letterSpacing" type="range" value="${variant.letterSpacing}" min="-30" max="30" step="0.1" class="flex-grow">
                            <input data-state-key="typography.groups.${groupKey}.variants.${index}.letterSpacing" type="number" value="${variant.letterSpacing}" min="-30" max="30" step="0.1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    ${textTransformControl}
                    ${fontWeightControl}
                </div>`;
            }).join('');

            return `
            <div class="pst-control-accordion mt-8">
                <button class="pst-control-accordion-toggle">
                    <span>${groupKey}s</span>
                    <svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="pst-control-accordion-content">
                    <div class="pst-control-group">
                        <div class="pst-control-item">
                            <label title="Select a font or provide a link to a custom one.">Font Family</label>
                            <select data-state-key="typography.groups.${groupKey}.fontFamilySelection" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">${optionsHTML}</select>
                        </div>
                        ${groupState.fontFamilySelection === 'custom' ? `
                        <div class="pst-control-item">
                            <label title="Choose your font provider, choose the font and variants, then paste the URL here. URLs from Google Fonts for example look like this: https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap">
                                Font Link
                                <span class="inline-block align-middle ml-1 cursor-help" title="Choose your font provider, choose the font and variants, then paste the URL here. URLs from Google fonts for example look like this: https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="text-gray-400" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/></svg>
                                </span>
                            </label>
                            <input data-state-key="typography.groups.${groupKey}.fontFamilyLink" type="text" value="${groupState.fontFamilyLink}" placeholder="https://fonts.googleapis.com/..." class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                        ` : ''}
                        <div class="pst-control-item">
                            <label title="Number of ${groupKey} styles to generate.">Variants</label>
                            <input data-state-key="typography.groups.${groupKey}.count" type="number" value="${groupState.count}" min="${limits.min}" max="${limits.max}" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                        <div class="pst-control-item">
                            <label title="Enter custom text to preview your fonts.">Preview Text</label>
                            <input data-state-key="typography.groups.${groupKey}.placeholderText" type="text" value="${groupState.placeholderText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                        ${variantsHTML}
                    </div>
                </div>
            </div>`;
        };

        return `
    <div class="pst-control-group">
        <h3 class="pst-control-group-heading">Global</h3>
        <div class="pst-control-item">
            <label title="Globally scale all font sizes.">Size Scale</label>
            <div class="flex items-center space-x-2">
                <input data-state-key="typography.scale" type="range" value="${state.typography.scale}" min="0.5" max="2.0" step="0.05" class="flex-grow">
                <input data-state-key="typography.scale" type="number" value="${state.typography.scale}" min="0.5" max="2.0" step="0.05" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
            </div>
        </div>
        <div class="pst-control-item">
            <label>Test with Color</label>
            ${createColorSelectWithSwatch('typography.testColor', state.typography.testColor, state, { includeAuto: true })}
        </div>
    </div>
            ${createGroupControls('heading', state.typography.groups.heading, {min: 3, max: 6})}
            ${createGroupControls('paragraph', state.typography.groups.paragraph, {min: 1, max: 6})}
            ${createGroupControls('label', state.typography.groups.label, {min: 0, max: 6})}
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-typography-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};