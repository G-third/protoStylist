const checkboxRadioView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        // --- Checkbox Preview ---
        const { checkboxInput: checkState } = state;
        const checkLabelClass = checkState.labelToken;
        const checkStates = [
            { title: 'Unchecked', checked: false, disabled: false },
            { title: 'Checked', checked: true, disabled: false },
            { title: 'Unchecked Disabled', checked: false, disabled: true },
            { title: 'Checked Disabled', checked: true, disabled: true },
        ];
        const checkboxPreviewsHTML = checkStates.map(s => {
            let tokenName = `.form-checkbox`;
            if (s.checked) tokenName += ':checked';
            if (s.disabled) tokenName += ':disabled';
            return `
                <div class="mb-4 flex items-center">
                    <div style="width: 80%;" class="flex items-center">
                        <label class="inline-flex items-center ${s.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}">
                            <input type="checkbox" class="form-checkbox" ${s.checked ? 'checked' : ''} ${s.disabled ? 'disabled' : ''} />
                            <span class="${checkLabelClass} ml-2">${checkState.labelText || s.title}</span>
                        </label>
                    </div>
                    <div class="flex-grow text-right">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">${tokenName}</span>
                    </div>
                </div>
            `;
        }).join('');

        // --- Radio Preview ---
        const { radioInput: radioState } = state;
        const radioLabelClass = radioState.labelToken;
        const radioPreviewsHTML = `
            <div role="radiogroup">
                <div class="mb-4 flex items-start">
                    <div style="width: 80%;">
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="radio" class="form-radio" name="radio-preview" checked />
                            <span class="${radioLabelClass} ml-2">${radioState.labelText || 'Selected'}</span>
                        </label>
                    </div>
                    <div class="flex-grow text-right">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-radio:checked</span>
                    </div>
                </div>
                <div class="mb-4 flex items-start">
                    <div style="width: 80%;">
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="radio" class="form-radio" name="radio-preview" />
                            <span class="${radioLabelClass} ml-2">${radioState.labelText || 'Unselected'}</span>
                        </label>
                    </div>
                    <div class="flex-grow text-right">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-radio</span>
                    </div>
                </div>
                <div class="mb-4 flex items-start">
                    <div style="width: 80%;">
                        <label class="inline-flex items-center opacity-50 cursor-not-allowed">
                            <input type="radio" class="form-radio" name="radio-preview-disabled" disabled />
                            <span class="${radioLabelClass} ml-2">${radioState.labelText || 'Disabled'}</span>
                        </label>
                    </div>
                    <div class="flex-grow text-right">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-radio:disabled</span>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="mb-12">
                <h4 class="pst-preview-heading mb-4 mt-8 text-sm font-semibold">Checkbox</h4>
                ${checkboxPreviewsHTML}
                <h4 class="pst-preview-heading mb-4 mt-8 text-sm font-semibold">Radio Button</h4>
                ${radioPreviewsHTML}
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const { checkboxInput: checkState, radioInput: radioState } = state;
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        let borderOptionsHTML = `<option value="none">None</option>`;
        if (state.borders && state.borders.variants) {
            state.borders.variants.forEach((variant, index) => {
                const tokenName = `--border-${index + 1}`;
                borderOptionsHTML += `<option value="${tokenName}">${tokenName}</option>`;
            });
        }

        const checkboxControls = `
            <div class="pst-control-accordion mt-8">
                <button class="pst-control-accordion-toggle"><span>Checkbox Styles</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                <div class="pst-control-accordion-content">
                    <div class="pst-control-group">
                        <div class="pst-control-item">
                            <label>Size (px)</label>
                            <div class="flex items-center space-x-2">
                                <input data-state-key="checkboxInput.size" type="range" value="${checkState.size}" min="10" max="40" step="1" class="flex-grow">
                                <input data-state-key="checkboxInput.size" type="number" value="${checkState.size}" min="10" max="40" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            </div>
                        </div>
                        <div class="pst-control-item">
                            <label>Selected Color</label>
                            ${createColorSelectWithSwatch('checkboxInput.color', checkState.color, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Focus Ring Color</label>
                            ${createColorSelectWithSwatch('textInput.focusRingColor', state.textInput.focusRingColor, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Border</label>
                            <select data-state-key="checkboxInput.borderToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                ${borderOptionsHTML.replace(`value="${checkState.borderToken}"`, `value="${checkState.borderToken}" selected`)}
                            </select>
                        </div>
                        <div class="pst-control-item">
                            <label>Border Color</label>
                            ${createColorSelectWithSwatch('checkboxInput.borderColor', checkState.borderColor, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Label</label>
                            <select data-state-key="checkboxInput.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                ${allTextTokens.map(t => `<option value="${t}" ${checkState.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="pst-control-item">
                            <label>Preview Label</label>
                            <input data-state-key="checkboxInput.labelText" type="text" value="${checkState.labelText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                </div>
            </div>
        `;

        const radioControls = `
            <div class="pst-control-accordion mt-8">
                <button class="pst-control-accordion-toggle"><span>Radio Button Styles</span><svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                <div class="pst-control-accordion-content">
                    <div class="pst-control-group">
                        <div class="pst-control-item">
                            <label>Size (px)</label>
                            <div class="flex items-center space-x-2">
                                <input data-state-key="radioInput.size" type="range" value="${radioState.size}" min="10" max="40" step="1" class="flex-grow">
                                <input data-state-key="radioInput.size" type="number" value="${radioState.size}" min="10" max="40" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            </div>
                        </div>
                        <div class="pst-control-item">
                            <label>Selected Color</label>
                            ${createColorSelectWithSwatch('radioInput.color', radioState.color, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Focus Ring Color</label>
                            ${createColorSelectWithSwatch('textInput.focusRingColor', state.textInput.focusRingColor, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Border</label>
                            <select data-state-key="radioInput.borderToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                ${borderOptionsHTML.replace(`value="${radioState.borderToken}"`, `value="${radioState.borderToken}" selected`)}
                            </select>
                        </div>
                        <div class="pst-control-item">
                            <label>Border Color</label>
                            ${createColorSelectWithSwatch('radioInput.borderColor', radioState.borderColor, state, { includeAuto: true })}
                        </div>
                        <div class="pst-control-item">
                            <label>Label</label>
                            <select data-state-key="radioInput.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                                ${allTextTokens.map(t => `<option value="${t}" ${radioState.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="pst-control-item">
                            <label>Preview Label</label>
                            <input data-state-key="radioInput.labelText" type="text" value="${radioState.labelText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Checkbox & Radio Styles</h3>
                <div class="pst-control-item pb-8">
                     <p class="text-xs text-gray-500">Customize the appearance of checkbox and radio button elements.</p>
                </div>
            </div>
            ${checkboxControls}
            ${radioControls}
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-checkbox-radio-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};