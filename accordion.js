const accordionView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { accordion: a, typography } = state;
        const titleClass = a.titleToken;
        const iconLibrary = state.icons.library !== 'none' ? window.iconLibraries[state.icons.library] : null;
        let iconHTML = `<svg class="accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`; // Chevron Up
        if (iconLibrary) {
            let iconName;
            switch(state.icons.library) {
                case 'bootstrap': iconName = 'chevron-up'; break;
                case 'fontawesome': iconName = 'chevron-up'; break;
                case 'material': iconName = 'expand_less'; break;
                case 'remix': iconName = 'arrow-up-s-line'; break;
                default: iconName = 'chevron-up'; // fallback
            }
            const iconClass = iconLibrary.isText ? iconLibrary.prefix : iconLibrary.classPattern.replace('{{name}}', iconName);
            if (iconLibrary.isText) {
                iconHTML = `<span class="${iconClass} accordion-icon">${iconName}</span>`;
            } else {
                iconHTML = `<i class="${iconClass} accordion-icon"></i>`;
            }
        }

        const accordionCount = a.count || 2;
        const itemsHTML = Array.from({ length: accordionCount }, (_, i) => {
            const isOpen = i === 0; // First item is open by default in the preview
            return `
                <div class="accordion-item">
                    <button class="accordion-toggle ${isOpen ? 'is-open' : ''}">
                        <span class="accordion-title ${titleClass}">${a.placeholderTitle} ${i + 1}</span>
                        ${iconHTML}
                    </button>
                    <div class="accordion-content-wrapper" ${isOpen ? 'style="max-height: 500px;"' : ''}>
                        <div class="accordion-content-inner">
                            <p class="${a.contentToken || 'text-body-md'}">${a.placeholderText}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Accordion</h3>
                <div class="w-full md:w-4/5">
                    ${itemsHTML}
                </div>
            </div>
        `;
    },
    getControlsHTML: (state) => {
        const { accordion: a } = state;
        // Re-use helper functions
        const createOptions = (items, nameFormatter, includeNone = false) => {
            let html = includeNone ? '<option value="none">None</option>' : '';
            if (!items) return html;
            html += items.map((item, index) => {
                const tokenName = nameFormatter(index);
                return `<option value="${tokenName}">${tokenName}</option>`;
            }).join('');
            return html;
        };

        const spacingOptions = createOptions(state.spacing.variants, i => `--spacing-${getSpacingName(i)}`);
        const borderOptions = createOptions(state.borders.variants, i => `--border-${i + 1}`, true);
        const borderRadiusOptions = createOptions(state.curves.variants, i => `--border-radius-${i + 1}`, true);
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Accordion Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Core styles like colors and borders defined in 'Baseline Styles' are available in the controls below.</p>
                </div>
                <h3 class="pst-control-group-heading">Box & Borders</h3>
                <div class="pst-control-item">
                    <label>Number of Accordions</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="accordion.count" type="range" value="${a.count}" min="1" max="8" step="1" class="flex-grow">
                        <input data-state-key="accordion.count" type="number" value="${a.count}" min="1" max="8" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Heading Padding Y</label>
                    <select data-state-key="accordion.paddingY" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${a.paddingY}"`, `value="${a.paddingY}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Heading Padding X</label>
                    <select data-state-key="accordion.paddingX" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${a.paddingX}"`, `value="${a.paddingX}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Content Padding</label>
                    <select data-state-key="accordion.contentPadding" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${a.contentPadding}"`, `value="${a.contentPadding}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Background Color</label>
                    ${createColorSelectWithSwatch('accordion.backgroundColor', a.backgroundColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Border</label>
                    <select data-state-key="accordion.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderOptions.replace(`value="${a.border}"`, `value="${a.border}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Border Color</label>
                    ${createColorSelectWithSwatch('accordion.borderColor', a.borderColor, state, { includeAuto: true })}
                </div>
                <div class="pst-control-item">
                    <label>Separator</label>
                    <select data-state-key="accordion.divider" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderOptions.replace(`value="${a.divider}"`, `value="${a.divider}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Separator Color</label>
                    ${createColorSelectWithSwatch('accordion.dividerColor', a.dividerColor, state, { includeAuto: true })}
                </div>
                <div class="pst-control-item">
                    <label>Curves</label>
                    <select data-state-key="accordion.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptions.replace(`value="${a.borderRadius}"`, `value="${a.borderRadius}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Icon Position</label>
                    <select data-state-key="accordion.iconPosition" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        <option value="right" ${a.iconPosition === 'right' ? 'selected' : ''}>Right</option>
                        <option value="left" ${a.iconPosition === 'left' ? 'selected' : ''}>Left</option>
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Icon Size (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="accordion.iconSize" type="range" value="${a.iconSize}" min="12" max="32" step="1" class="flex-grow">
                        <input data-state-key="accordion.iconSize" type="number" value="${a.iconSize}" min="12" max="32" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Icon Color</label>
                    ${createColorSelectWithSwatch('accordion.iconColor', a.iconColor, state)}
                </div>
            </div>
            <div class="pst-control-group mt-4">
                <h4 class="pst-control-group-heading pt-4 border-t border-gray-200">Labels & Content</h4>
                <div class="pst-control-item">
                    <label>Heading</label>
                    <select data-state-key="accordion.titleToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${allTextTokens.map(t => `<option value="${t}" ${a.titleToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Heading Color</label>
                    ${createColorSelectWithSwatch('accordion.headingColor', a.headingColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Content</label>
                    <select data-state-key="accordion.contentToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${paragraphTokens.map(t => `<option value="${t}" ${a.contentToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Content Color</label>
                    ${createColorSelectWithSwatch('accordion.contentColor', a.contentColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Heading Placeholder</label>
                    <input data-state-key="accordion.placeholderTitle" type="text" value="${a.placeholderTitle}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Content Placeholder</label>
                    <textarea data-state-key="accordion.placeholderText" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm" rows="4">${a.placeholderText}</textarea>
                </div>
            </div>

            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-accordion-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};