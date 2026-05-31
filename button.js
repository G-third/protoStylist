const buttonView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const buttonState = state.buttons;
        const iconLibrary = state.icons.library !== 'none' ? window.iconLibraries[state.icons.library] : null;

        const getIconName = (baseName) => {
            if (!iconLibrary) return '';
            // This helper maps generic icon concepts to library-specific names
            switch (state.icons.library) {
                case 'bootstrap': return baseName === 'plus' ? 'plus' : 'chevron-right';
                case 'fontawesome': return baseName === 'plus' ? 'plus' : 'chevron-right';
                case 'material': return baseName === 'plus' ? 'add' : 'chevron_right';
                case 'remix': return baseName === 'plus' ? 'add-line' : 'arrow-right-s-line';
                default: return '';
            }
        };

        const createIconHTML = (iconName) => {
            if (!iconLibrary) return '';
            const iconClass = iconLibrary.classPattern.replace('{{name}}', iconName);
            // Icon size is same as font size, so it inherits from button's font-size.
            // The mr-2 is for label+icon buttons.
            return `<i class="${iconClass} mr-2"></i>`; 
        };

        const variantsHTML = buttonState.variants.map((variant, index) => {
            const tokenName = `.btn-variant-${index}`;
            const sizes = ['xl', 'lg', 'md', 'sm'];

            if (variant.name === 'Pair') {
                const leftVariantIndex = buttonState.variants.findIndex(v => v.name === variant.leftVariant);
                const rightVariantIndex = buttonState.variants.findIndex(v => v.name === variant.rightVariant);
                const leftVariantClass = `btn-variant-${leftVariantIndex}`;
                const rightVariantClass = `btn-variant-${rightVariantIndex}`;
                const labelLeft = variant.labelLeft || 'Cancel';
                const labelRight = variant.labelRight || 'Proceed';

                const pairPreviews = sizes.map(size => `
                    <div class="btn-pair flex items-center">
                        <button class="btn btn-${size} ${leftVariantClass}">${labelLeft}</button>
                        <button class="btn btn-${size} ${rightVariantClass}">${labelRight}</button>
                    </div>
                `).join('<div class="h-4"></div>');

                return `
                    <div class="mb-12">
                        <h3 class="pst-preview-heading pb-2">${variant.name}</h3>
                        <div class="text-right mt-3 mb-4">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.btn-pair</span>
                        </div>
                        <div style="width: 80%;">${pairPreviews}</div>
                    </div>
                `;
            }

            const label = buttonState.global.defaultLabel;
            const variantClass = `btn-variant-${index}`;
            
            const showAllTypes = ['Primary', 'Secondary', 'Tertiary'].includes(variant.name);

            const previews = sizes.map(size => {
                const sizeTokenName = `.btn-${size}`;
                const labelOnly = `<button class="btn btn-${size} ${variantClass}">${label}</button>`;
                const labelIcon = (iconLibrary && showAllTypes) ? `<button class="btn btn-${size} ${variantClass} inline-flex items-center">${createIconHTML(getIconName('plus'))}${label}</button>` : '';
                const iconOnly = (iconLibrary && showAllTypes) ? `<button class="btn btn-${size} ${variantClass} btn-square">${createIconHTML(getIconName('chevron-right')).replace(' mr-2', '')}</button>` : '';
                return `
                    <div class="flex items-center">
                        <div class="flex items-center space-x-4" style="width: 80%;">${labelOnly}${labelIcon}${iconOnly}</div>
                        <div class="flex-grow text-right"><span class="text-xs text-gray-400 ml-4 font-mono">${sizeTokenName}</span></div>
                    </div>
                `;
            }).join('<div class="h-8"></div>'); // Increased spacer between sizes

            return `
                <div class="mb-12">
                    <h3 class="pst-preview-heading pb-2">${variant.name}</h3>
                    <div class="text-right mt-3 mb-4">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">${tokenName}</span>
                    </div>
                    <div class="w-full">${previews}</div>
                </div>
            `;
        }).join('');

        return `
            <div id="button-preview-wrapper" style="--button-scale: ${buttonState.global.scale};">
                ${variantsHTML}
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const buttonState = state.buttons;

        // Create border-radius options
        let borderRadiusOptionsHTML = '';
        if (state.curves && state.curves.variants) {
            state.curves.variants.forEach((variant, index) => {
                const tokenName = `--border-radius-${index + 1}`;
                borderRadiusOptionsHTML += `<option value="${tokenName}">${tokenName} (${variant.radius}px)</option>`;
            });
        }

        // Create border options for dropdowns
        let borderOptionsHTML = `<option value="none">None</option>`;
        if (state.borders && state.borders.variants) {
            state.borders.variants.forEach((variant, index) => {
                const tokenName = `--border-${index + 1}`;
                borderOptionsHTML += `<option value="${tokenName}">${tokenName}</option>`;
            });
        }

        // Create label style options
        let labelStyleOptionsHTML = '';
        const labelGroup = state.typography.groups.label;
        labelGroup.variants.forEach((v, i) => {
            const tokenName = `text-${getVariantName('label', i, labelGroup.variants.length)}`;
            labelStyleOptionsHTML += `<option value="${tokenName}">${tokenName}</option>`;
        });

        const createVariantControls = (variant, index) => {
            if (variant.name === 'Pair') {
                const variantOptions = buttonState.variants
                    .filter(v => v.name !== 'Pair')
                    .map(v => `<option value="${v.name}">${v.name}</option>`)
                    .join('');
                
                return `
                    <div class="pst-control-accordion mt-8">
                        <button class="pst-control-accordion-toggle"><span>${variant.name}</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                        <div class="pst-control-accordion-content">
                            <div class="pst-control-group">
                                <div class="pst-control-item">
                                    <label>Left Button</label>
                                    <select data-state-key="buttons.variants.${index}.leftVariant" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                        ${variantOptions.replace(`value="${variant.leftVariant}"`, `value="${variant.leftVariant}" selected`)}
                                    </select>
                                </div>
                                <div class="pst-control-item">
                                    <label>Right Button</label>
                                    <select data-state-key="buttons.variants.${index}.rightVariant" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                                        ${variantOptions.replace(`value="${variant.rightVariant}"`, `value="${variant.rightVariant}" selected`)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="pst-control-accordion mt-8">
                    <button class="pst-control-accordion-toggle"><span>${variant.name}</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <div class="pst-control-accordion-content">
                        <div class="pst-control-group">
                            <div class="pst-control-item">
                                <label>Background Color</label>
                                ${createColorSelectWithSwatch(`buttons.variants.${index}.backgroundColor`, variant.backgroundColor, state)}
                            </div>
                            <div class="pst-control-item">
                                <label>Border</label>
                                <select data-state-key="buttons.variants.${index}.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                    ${borderOptionsHTML.replace(`value="${variant.border}"`, `value="${variant.border}" selected`)}
                                </select>
                            </div>
                            <div class="pst-control-item">
                                <label>Border Color</label>
                                ${createColorSelectWithSwatch(`buttons.variants.${index}.borderColor`, variant.borderColor, state, { includeAuto: true, includeTransparent: true })}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const variantsControlsHTML = buttonState.variants.map(createVariantControls).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Button Settings</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Core styles like colors and borders defined in 'Baseline Styles' are available for each button variant.</p>
                </div>
                <h3 class="pst-control-group-heading">Global</h3>
                <div class="pst-control-item">
                    <label title="Globally scale all button sizes.">Size Scale</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="buttons.global.scale" type="range" value="${buttonState.global.scale}" min="0.5" max="2.0" step="0.05" class="flex-grow">
                        <input data-state-key="buttons.global.scale" type="number" value="${buttonState.global.scale}" min="0.5" max="2.0" step="0.05" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                 <div class="pst-control-item">
                    <label title="Globally set the border radius for all buttons.">Border Radius</label>
                    <select data-state-key="buttons.global.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptionsHTML.replace(`value="${buttonState.global.borderRadius}"`, `value="${buttonState.global.borderRadius}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label title="Globally set the font style for all button labels.">Label Style</label>
                    <select data-state-key="buttons.global.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${labelStyleOptionsHTML.replace(`value="${buttonState.global.labelToken}"`, `value="${buttonState.global.labelToken}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Focus Ring Color</label>
                    ${createColorSelectWithSwatch('textInput.focusRingColor', state.textInput.focusRingColor, state, { includeAuto: true })}
                </div>
                <div class="pst-control-item">
                    <label title="Enter custom text to preview on buttons.">Preview Label</label>
                    <input data-state-key="buttons.global.defaultLabel" type="text" value="${buttonState.global.defaultLabel}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Hover Effect</label>
                    <select data-state-key="buttons.global.hoverEffect" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        <option value="light" ${buttonState.global.hoverEffect === 'light' ? 'selected' : ''}>Light</option>
                        <option value="regular" ${buttonState.global.hoverEffect === 'regular' ? 'selected' : ''}>Regular</option>
                        <option value="medium" ${buttonState.global.hoverEffect === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="heavy" ${buttonState.global.hoverEffect === 'heavy' ? 'selected' : ''}>Heavy</option>
                    </select>
                </div>
            </div>

            ${variantsControlsHTML}

            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-buttons-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};