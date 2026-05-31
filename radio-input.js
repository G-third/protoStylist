const radioInputView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { radioInput: radioState } = state;
        const labelClass = radioState.labelToken;

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Radio Button</h3>
                <div role="radiogroup">
                    <div class="mb-4 flex items-start">
                        <div style="width: 80%;">
                            <label class="inline-flex items-center cursor-pointer">
                                <input type="radio" class="form-radio" name="radio-preview" checked />
                                <span class="${labelClass} ml-2">${radioState.labelText || 'Selected'}</span>
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
                                <span class="${labelClass} ml-2">${radioState.labelText || 'Unselected'}</span>
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
                                <span class="${labelClass} ml-2">${radioState.labelText || 'Disabled'}</span>
                            </label>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-radio:disabled</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const { radioInput: radioState } = state;
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        let colorOptions = '';
        Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
            group.variants.forEach((variant, index) => {
                const tokenName = `--${groupKey}-${index + 1}`;
                colorOptions += `<option value="${tokenName}" ${radioState.color === tokenName ? 'selected' : ''}>${tokenName}</option>`;
            });
        });

        // Create border options for dropdowns
        let borderOptionsHTML = `<option value="none">None</option>`;
        if (state.borders && state.borders.variants) {
            state.borders.variants.forEach((variant, index) => {
                const tokenName = `--border-${index + 1}`;
                borderOptionsHTML += `<option value="${tokenName}" ${radioState.borderToken === tokenName ? 'selected' : ''}>${tokenName}</option>`;
            });
        }

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Radio Button Styles</h3>
                <div class="pst-control-item pb-8">
                     <p class="text-xs text-gray-500">Customize the appearance of radio button elements.</p>
                </div>
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
                        ${borderOptionsHTML}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Label</label>
                    <select data-state-key="radioInput.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${allTextTokens.map(t => `<option value="${t}" ${radioState.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Content</h3>
                <div class="pst-control-item">
                    <label>Preview Label</label>
                    <input data-state-key="radioInput.labelText" type="text" value="${radioState.labelText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-radio-input-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};