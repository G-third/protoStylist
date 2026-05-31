const textInputView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { textInput: inputState, typography } = state;
        const labelClass = inputState.labelToken;
        const inputClass = `form-input`;

        const states = [
            { title: 'Default', placeholder: inputState.placeholderText, value: '', disabled: false, error: false },
            { title: 'With Value', placeholder: '', value: 'example@email.com', disabled: false, error: false },
            { title: 'Disabled', placeholder: 'Cannot edit', value: '', disabled: true, error: false },
            { title: 'Error', placeholder: '', value: 'invalid-email', disabled: false, error: true },
        ];

        const helperTextHTML = inputState.helperText ? `<span class="${inputState.helperToken} form-helper-text">${inputState.helperText}</span>` : '';
        const errorTextHTML = inputState.errorText ? `<span class="${inputState.helperToken} form-helper-text form-error-text">${inputState.errorText}</span>` : '';

        const previewsHTML = states.map(s => {
            let tokenName = `.form-input`;
            if (s.error) tokenName += '.is-error';
            if (s.disabled) tokenName += ':disabled';

            return `
                <div class="mb-12">
                    <h4 class="pst-preview-heading mb-2">${s.title}</h4>
                    <div class="flex items-start">
                        <div style="width: 80%;">
                            <label class="${labelClass}">${inputState.labelText}</label>
                            <input type="text" class="${inputClass} ${s.error ? 'is-error' : ''}" placeholder="${s.placeholder}" value="${s.value}" ${s.disabled ? 'disabled' : ''}>
                            ${s.error ? errorTextHTML : helperTextHTML}
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">${tokenName}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-12">
                
                <div class="w-full">
                    ${previewsHTML}
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const { textInput: inputState } = state;

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

        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const inputAndHelperTokens = [...paragraphTokens, ...labelTokens];

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Text Input Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Core styles like colors and borders defined in 'Baseline Styles' are available in the controls below.</p>
                </div>
                <h3 class="pst-control-group-heading">Input Field</h3>
                <div class="pst-control-item">
                    <label>Padding Y</label>
                    <select data-state-key="textInput.paddingY" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${inputState.paddingY}"`, `value="${inputState.paddingY}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Padding X</label>
                    <select data-state-key="textInput.paddingX" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${inputState.paddingX}"`, `value="${inputState.paddingX}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Background Color</label>
                    ${createColorSelectWithSwatch('textInput.backgroundColor', inputState.backgroundColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Border</label>
                    <select data-state-key="textInput.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono" title="Default color is inherited from the border token in Borders settings.">
                        ${borderOptions.replace(`value="${inputState.border}"`, `value="${inputState.border}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Border Color</label>
                    ${createColorSelectWithSwatch('textInput.borderColor', inputState.borderColor, state, { includeAuto: true })}
                </div>
                <div class="pst-control-item">
                    <label>Focus Ring Color</label>
                    ${createColorSelectWithSwatch('textInput.focusRingColor', inputState.focusRingColor, state, { includeAuto: true })}
                </div>
                <div class="pst-control-item">
                    <label>Border Radius</label>
                    <select data-state-key="textInput.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptions.replace(`value="${inputState.borderRadius}"`, `value="${inputState.borderRadius}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Error Border Color</label>
                    ${createColorSelectWithSwatch('textInput.errorBorderColor', inputState.errorBorderColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Disabled Border Color</label>
                    ${createColorSelectWithSwatch('textInput.disabledBorderColor', inputState.disabledBorderColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Disabled Opacity</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="textInput.disabledOpacity" type="range" value="${inputState.disabledOpacity}" min="0" max="1" step="0.05" class="flex-grow">
                        <input data-state-key="textInput.disabledOpacity" type="number" value="${inputState.disabledOpacity}" min="0" max="1" step="0.05" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Labels & Content</h3>
                <div class="pst-control-item">
                    <label>Label Text</label>
                    <input data-state-key="textInput.labelText" type="text" value="${inputState.labelText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Placeholder Text</label>
                    <input data-state-key="textInput.placeholderText" type="text" value="${inputState.placeholderText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Helper Text</label>
                    <input data-state-key="textInput.helperText" type="text" value="${inputState.helperText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Error Text</label>
                    <input data-state-key="textInput.errorText" type="text" value="${inputState.errorText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Label Text Style</label>
                    <select data-state-key="textInput.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${labelTokens.map(t => `<option value="${t}" ${inputState.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Input Text Style</label>
                    <select data-state-key="textInput.inputToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${inputAndHelperTokens.map(t => `<option value="${t}" ${inputState.inputToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Helper/Error Text Style</label>
                    <select data-state-key="textInput.helperToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${inputAndHelperTokens.map(t => `<option value="${t}" ${inputState.helperToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-text-input-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};