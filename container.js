const containerView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        if (!state.container || state.container.variants.length === 0) {
            return '<p class="text-gray-500">No container settings defined.</p>';
        }

        const variantsHTML = state.container.variants.map((variant, index) => {
            const tokenName = `.container-variant-${index}`;
            const contentSpacing = variant.contentSpacing || '--spacing-sm';
            
            // Get visible content items, excluding the background image, and sort them by order
            const contentItems = Object.entries(variant.content)
                .filter(([key, item]) => item.visible && key !== 'image')
                .sort(([, a], [, b]) => a.order - b.order);

            const contentHTML = contentItems.map(([key, item]) => {
                const itemStyle = `margin-bottom: var(${contentSpacing});`;
                const type = key.replace(/\d/g, ''); // 'text1' -> 'text'

                switch (type) {
                    case 'icon':
                        if (state.icons.library !== 'none') {
                            const iconLibrary = window.iconLibraries[state.icons.library];
                            const iconName = item.icon || (iconLibrary.samples ? iconLibrary.samples[0] : 'star');
                            const iconClass = iconLibrary.isText ? iconLibrary.prefix : iconLibrary.classPattern.replace('{{name}}', iconName);
                            if (iconLibrary.isText) {
                                return `<span class="${iconClass} text-4xl" style="${itemStyle}">${iconName}</span>`;
                            }
                            return `<i class="${iconClass} text-4xl" style="${itemStyle}"></i>`;
                        }
                        return '';
                    case 'text':
                        return `<p class="${item.variant}" style="${itemStyle}">${item.text || 'Sample Text'}</p>`;
                    case 'button':
                        return `<button class="btn btn-${item.size || 'lg'} ${item.variant}" style="${itemStyle}">${item.text || 'Action'}</button>`;
                    default:
                        return '';
                }
            }).join('');

            let containerStyle = '';
            const imageItem = variant.content.image;
            if (imageItem && imageItem.visible && imageItem.url) {
                containerStyle = `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imageItem.url}'); background-size: cover; background-position: center;`;
            }

            return `
                <div class="mb-12">
                    <h3 class="pst-preview-heading pb-2 mb-4">Container Variant ${index + 1}</h3>
                    <div class="flex items-start">
                        <div style="width: 80%;">
                            <div class="container-variant-${index}" style="${containerStyle}">${contentHTML}</div>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">${tokenName}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return variantsHTML;
    },

    getControlsHTML: (state) => {
        const containerState = state.container;

        // Helper to create dropdown options from tokens
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

        const buttonVariantTokens = state.buttons.variants.filter(v => v.name !== 'Pair').map((v, i) => `btn-variant-${i}`);
        const buttonSizeOptions = ['sm', 'md', 'lg', 'xl'];

        const iconSamples = state.icons.library !== 'none' ? window.iconLibraries[state.icons.library].samples : [];
        const hasIcons = state.icons.library !== 'none' && iconSamples.length > 0;

        const variantsHTML = containerState.variants.map((variant, index) => {
            
            const createContentItemControls = (itemKey, itemData) => {
                const itemType = itemKey.replace(/\d/g, '');
                const itemTitle = itemKey.charAt(0).toUpperCase() + itemKey.slice(1).replace(/(\d)/, ' $1'); // text1 -> Text 1

                const orderOptions = Array.from({ length: 6 }, (_, i) => i + 1)
                    .map(num => `<option value="${num}" ${itemData.order == num ? 'selected' : ''}>${num}</option>`)
                    .join('');

                let specificControls = '';
                let isDisabled = false;

                switch (itemType) {
                    case 'image':
                        specificControls = `
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Image URL</label>
                                <input data-state-key="container.variants.${index}.content.${itemKey}.url" type="text" value="${itemData.url || ''}" placeholder="https://..." class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            </div>`;
                        // Special case for image: no order dropdown
                        return `
                            <div class="pl-4 mt-4 border-l border-gray-200">
                                <div class="pst-control-item">
                                    <label>${itemTitle}</label>
                                    <input data-state-key="container.variants.${index}.content.${itemKey}.visible" type="checkbox" ${(itemData.visible && !isDisabled) ? 'checked' : ''} title="Visible" class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                                </div>
                                ${(itemData.visible && !isDisabled) ? specificControls : ''}
                            </div>
                        `;
                    case 'icon':
                        if (!hasIcons) {
                            isDisabled = true;
                        }
                        specificControls = `
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Icon</label>
                                <select data-state-key="container.variants.${index}.content.${itemKey}.icon" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono" ${isDisabled ? 'disabled' : ''}>
                                    ${iconSamples.map(i => `<option value="${i}" ${itemData.icon === i ? 'selected' : ''}>${i}</option>`).join('')}
                                </select>
                            </div>`;
                        break;
                    case 'text':
                        specificControls = `
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Style</label>
                                <select data-state-key="container.variants.${index}.content.${itemKey}.variant" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${allTextTokens.map(t => `<option value="${t}" ${itemData.variant === t ? 'selected' : ''}>${t}</option>`).join('')}
                                </select>
                            </div>
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Preview Text</label>
                                <input data-state-key="container.variants.${index}.content.${itemKey}.text" type="text" value="${itemData.text || ''}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            </div>`;
                        break;
                    case 'button':
                        specificControls = `
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Variant</label>
                                <select data-state-key="container.variants.${index}.content.${itemKey}.variant" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${buttonVariantTokens.map(t => `<option value="${t}" ${itemData.variant === t ? 'selected' : ''}>${t}</option>`).join('')}
                                </select>
                            </div>
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Size</label>
                                <select data-state-key="container.variants.${index}.content.${itemKey}.size" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                    ${buttonSizeOptions.map(s => `<option value="${s}" ${itemData.size === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                                </select>
                            </div>
                            <div class="pst-control-item mt-2">
                                <label class="text-xs">Label Text</label>
                                <input data-state-key="container.variants.${index}.content.${itemKey}.text" type="text" value="${itemData.text || ''}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            </div>`;
                        break;
                }

                return `
                    <div class="pl-4 mt-4 border-l border-gray-200">
                        <div class="pst-control-item">
                            <label>${itemTitle}</label>
                            <div class="flex items-center space-x-4">
                                <select data-state-key="container.variants.${index}.content.${itemKey}.order" title="Stack Order" class="w-16 text-center bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                    ${orderOptions}
                                </select>
                                <input data-state-key="container.variants.${index}.content.${itemKey}.visible" type="checkbox" ${(itemData.visible && !isDisabled) ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} title="Visible" class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                            </div>
                        </div>
                        ${(itemData.visible && !isDisabled) ? specificControls : ''}
                    </div>
                `;
            };

            const contentControls = Object.entries(variant.content)
                .sort(([, a], [, b]) => a.order - b.order) // Display controls in current order
                .map(([key, data]) => createContentItemControls(key, data))
                .join('');

            return `
                <div class="pst-control-accordion mt-8">
                    <button class="pst-control-accordion-toggle"><span>Variant ${index + 1}</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="pst-control-accordion-content">
                        <div class="pst-control-group">
                            <div class="pst-control-item">
                                <label>Background Color</label>
                                <select data-state-key="container.variants.${index}.backgroundColor" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${colorOptions.replace(`value="${variant.backgroundColor}"`, `value="${variant.backgroundColor}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label title="Unchecked for dark text, checked for light text.">Text Content Color</label>
                                <input data-state-key="container.variants.${index}.lightText" type="checkbox" ${variant.lightText ? 'checked' : ''} class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                            </div>
                            <div class="pst-control-item">
                                <label>Padding</label>
                                <select data-state-key="container.variants.${index}.padding" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${spacingOptions.replace(`value="${variant.padding}"`, `value="${variant.padding}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Border</label>
                                <select data-state-key="container.variants.${index}.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderOptions.replace(`value="${variant.border}"`, `value="${variant.border}" selected`)}
                                </select>
                            </div>
                             <div class="pst-control-item">
                                <label>Border Radius</label>
                                <select data-state-key="container.variants.${index}.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderRadiusOptions.replace(`value="${variant.borderRadius}"`, `value="${variant.borderRadius}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Box Shadow</label>
                                <select data-state-key="container.variants.${index}.boxShadow" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${boxShadowOptions.replace(`value="${variant.boxShadow}"`, `value="${variant.boxShadow}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Alignment</label>
                                <select data-state-key="container.variants.${index}.align" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                    <option value="left" ${variant.align === 'left' ? 'selected' : ''}>Left</option>
                                    <option value="center" ${variant.align === 'center' ? 'selected' : ''}>Center</option>
                                    <option value="right" ${variant.align === 'right' ? 'selected' : ''}>Right</option>
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Content Spacing</label>
                                <select data-state-key="container.variants.${index}.contentSpacing" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${spacingOptions.replace(`value="${variant.contentSpacing}"`, `value="${variant.contentSpacing}" selected`)}
                                </select>
                            </div>
                        </div>
                        <div class="pst-control-group mt-4">
                            <h4 class="pst-control-group-heading pt-4 border-t border-gray-200">Content Stack</h4>
                            ${contentControls}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Container Settings</h3>
                <div class="pst-control-item">
                    <label title="Number of container styles to generate.">Variants</label>
                    <input data-state-key="container.count" type="number" value="${containerState.count}" min="1" max="8" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            ${variantsHTML}
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-container-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};