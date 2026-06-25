const textContentView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { textContent: tc } = state;
        const variantsHTML = tc.variants.map((variant, index) => {
            const cardClass = `content-card-${index}`;
            
            const textLinesHTML = variant.lines.map((line, lineIndex) => {
                if (line.style === 'none') return '';
                return `<p class="${line.style}">${line.text}</p>`;
            }).join('');

            let buttonHTML = '';
            if (variant.buttonVariant && variant.buttonVariant !== 'none') {
                buttonHTML = `<div><button class="btn btn-${variant.buttonSize || 'md'} ${variant.buttonVariant}">${state.buttons.global.defaultLabel}</button></div>`;
            }

            let cardContentHTML;
            if (variant.columns == 2 && variant.previewWidth !== 'quarter') {
                const col1Lines = variant.lines.slice(0, 3).map(l => l.style !== 'none' ? `<p class="${l.style}">${l.text}</p>` : '').join('');
                const col2Lines = variant.lines.slice(3, 6).map(l => l.style !== 'none' ? `<p class="${l.style}">${l.text}</p>` : '').join('');
                cardContentHTML = `
                    <div class="content-card-col">${col1Lines}</div>
                    <div class="content-card-divider"></div>
                    <div class="content-card-col">${col2Lines}${buttonHTML}</div>
                `;
            } else {
                cardContentHTML = `<div class="content-card-col">${textLinesHTML}${buttonHTML}</div>`;
            }
            
            let previewWidthStyle = 'width: 100%;';
            if (variant.previewWidth === 'three-quarters') {
                previewWidthStyle = 'width: 75%;';
            } else if (variant.previewWidth === 'half') {
                previewWidthStyle = 'width: 50%;';
            } else if (variant.previewWidth === 'quarter') {
                previewWidthStyle = 'width: 25%;';
            }

            return `
                <div class="mb-12">
                    <h3 class="pst-preview-heading pb-2 mb-4">Variant ${index + 1}</h3>
                    <div style="${previewWidthStyle}">
                        <div class="${cardClass}" tabindex="0">${cardContentHTML}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="space-y-12">${variantsHTML}</div>`;
    },

    getControlsHTML: (state) => {
        const { textContent: tc } = state;

        const createOptions = (items, nameFormatter, includeNone = false) => {
            let html = includeNone ? '<option value="none">None</option>' : '';
            if (!items) return html;
            html += items.map((item, index) => {
                const tokenName = nameFormatter(index);
                return `<option value="${tokenName}">${tokenName}</option>`;
            }).join('');
            return html;
        };

        let colorOptions = '';
        Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
            colorOptions += createOptions(group.variants, i => `--${groupKey}-${i + 1}`);
        });

        const spacingOptions = createOptions(state.spacing.variants, i => `--spacing-${getSpacingName(i)}`);
        const borderOptions = createOptions(state.borders.variants, i => `--border-${i + 1}`, true);
        const borderRadiusOptions = createOptions(state.curves.variants, i => `--border-radius-${i + 1}`, true);
        const boxShadowOptions = createOptions(state.curves.elevation.variants, i => `--elevation-${i + 1}`, true);

        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        const buttonOptions = state.buttons.variants
            .map((v, i) => {
                // We store the class name directly, e.g., 'btn-variant-0'
                const value = `btn-variant-${i}`;
                return `<option value="${value}">${v.name}</option>`;
            })
            .join('');

        const variantsHTML = tc.variants.map((variant, index) => {
            const lineControls = variant.lines.map((line, lineIndex) => `
                <div class="pst-control-group mt-4">
                    <h5 class="text-xs font-bold text-gray-600">Line ${lineIndex + 1}</h5>
                    <div class="pst-control-item">
                        <label>Text Style</label>
                        <select data-state-key="textContent.variants.${index}.lines.${lineIndex}.style" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                            <option value="none">None</option>
                            ${allTextTokens.map(t => `<option value="${t}" ${line.style === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="pst-control-item">
                        <label>Preview Text</label>
                        <input data-state-key="textContent.variants.${index}.lines.${lineIndex}.text" type="text" value="${line.text}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            `).join('');

            return `
                <div class="pst-control-accordion mt-8">
                    <button class="pst-control-accordion-toggle"><span>Variant ${index + 1}</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="pst-control-accordion-content">
                        
                        <div class="pst-control-group">
                            <h4 class="pst-control-group-heading">Layout</h4>
                            <div class="pst-control-item">
                                <label>Card Size</label>
                                <select data-state-key="textContent.variants.${index}.previewWidth" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                    <option value="full" ${variant.previewWidth === 'full' ? 'selected' : ''}>Full</option>
                                    <option value="three-quarters" ${variant.previewWidth === 'three-quarters' ? 'selected' : ''}>3/4</option>
                                    <option value="half" ${variant.previewWidth === 'half' ? 'selected' : ''}>1/2</option>
                                    <option value="quarter" ${variant.previewWidth === 'quarter' ? 'selected' : ''}>1/4</option>
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Columns</label>
                                <select data-state-key="textContent.variants.${index}.columns" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                    <option value="1" ${variant.columns == 1 ? 'selected' : ''}>1 Column</option>
                                    <option value="2" ${variant.columns == 2 ? 'selected' : ''}>2 Columns</option>
                                </select>
                            </div>
                            ${variant.columns == 2 ? `
                            <div class="pst-control-item">
                                <label>Divider Border</label>
                                <select data-state-key="textContent.variants.${index}.dividerBorder" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderOptions.replace(`value="${variant.dividerBorder}"`, `value="${variant.dividerBorder}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Divider Color</label>
                                ${createColorSelectWithSwatch(`textContent.variants.${index}.dividerColor`, variant.dividerColor, state, { includeAuto: true, includeTransparent: true })}
                            </div>
                            ` : ''}
                        </div>

                        <div class="pst-control-group mt-4">
                            <h4 class="pst-control-group-heading pt-4 border-t border-gray-200">Box &amp; Borders</h4>
                            <div class="pst-control-item">
                                <label>Background Color</label>
                                ${createColorSelectWithSwatch(`textContent.variants.${index}.backgroundColor`, variant.backgroundColor, state)}
                            </div>
                            <div class="pst-control-item">
                                <label>Text Color</label>
                                ${createColorSelectWithSwatch(`textContent.variants.${index}.textColor`, variant.textColor, state)}
                            </div>
                            <div class="pst-control-item">
                                <label>Border</label>
                                <select data-state-key="textContent.variants.${index}.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderOptions.replace(`value="${variant.border}"`, `value="${variant.border}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Border Color</label>
                                ${createColorSelectWithSwatch(`textContent.variants.${index}.borderColor`, variant.borderColor, state, { includeAuto: true, includeTransparent: true })}
                            </div>
                            <div class="pst-control-item">
                                <label>Border Radius</label>
                                <select data-state-key="textContent.variants.${index}.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderRadiusOptions.replace(`value="${variant.borderRadius}"`, `value="${variant.borderRadius}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Padding Y</label>
                                <select data-state-key="textContent.variants.${index}.paddingY" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${spacingOptions.replace(`value="${variant.paddingY}"`, `value="${variant.paddingY}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Padding X</label>
                                <select data-state-key="textContent.variants.${index}.paddingX" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${spacingOptions.replace(`value="${variant.paddingX}"`, `value="${variant.paddingX}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Content Spacing</label>
                                <select data-state-key="textContent.variants.${index}.contentSpacing" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${spacingOptions.replace(`value="${variant.contentSpacing}"`, `value="${variant.contentSpacing}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Elevation</label>
                                <select data-state-key="textContent.variants.${index}.boxShadow" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${boxShadowOptions.replace(`value="${variant.boxShadow}"`, `value="${variant.boxShadow}" selected`)}
                                </select>
                            </div>
                        </div>

                        <div class="pst-control-group mt-4">
                            <h4 class="pst-control-group-heading pt-4 border-t border-gray-200">Content Lines</h4>
                            ${lineControls}
                            <div class="pst-control-group mt-4">
                                <h5 class="text-xs font-bold text-gray-600">Button</h5>
                                <div class="pst-control-item">
                                    <label>Button</label>
                                    <select data-state-key="textContent.variants.${index}.buttonVariant" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                        <option value="none">None</option>
                                        ${buttonOptions.replace(`value="${variant.buttonVariant}"`, `value="${variant.buttonVariant}" selected`)}
                                    </select>
                                </div>
                                <div class="pst-control-item">
                                    <label>Button Size</label>
                                    <select data-state-key="textContent.variants.${index}.buttonSize" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                        <option value="sm" ${variant.buttonSize === 'sm' ? 'selected' : ''}>Small</option>
                                        <option value="md" ${variant.buttonSize === 'md' ? 'selected' : ''}>Medium</option>
                                        <option value="lg" ${variant.buttonSize === 'lg' ? 'selected' : ''}>Large</option>
                                        <option value="xl" ${variant.buttonSize === 'xl' ? 'selected' : ''}>Extra Large</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Text Content Settings</h3>
                <div class="pst-control-item">
                    <label title="Number of content card styles to generate.">Variants</label>
                    <input data-state-key="textContent.count" type="number" value="${tc.count}" min="1" max="8" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            ${variantsHTML}
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-text-content-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};