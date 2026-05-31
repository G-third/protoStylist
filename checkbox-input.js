const checkboxInputView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { checkboxInput: checkState } = state;
        const labelClass = checkState.labelToken;

        const states = [
            { title: 'Unchecked', checked: false, disabled: false },
            { title: 'Checked', checked: true, disabled: false },
            { title: 'Unchecked Disabled', checked: false, disabled: true },
            { title: 'Checked Disabled', checked: true, disabled: true },
        ];

        const previewsHTML = states.map(s => {
            let tokenName = `.form-checkbox`;
            if (s.checked) tokenName += ':checked';
            if (s.disabled) tokenName += ':disabled';

            return `
                <div class="mb-4 flex items-center">
                    <div style="width: 80%;" class="flex items-center">
                        <label class="inline-flex items-center ${s.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}">
                            <input type="checkbox" class="form-checkbox" ${s.checked ? 'checked' : ''} ${s.disabled ? 'disabled' : ''} />
                            <span class="${labelClass} ml-2">${checkState.labelText || s.title}</span>
                        </label>
                    </div>
                    <div class="flex-grow text-right">
                        <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">${tokenName}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Checkbox</h3>
                ${previewsHTML}
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const { checkboxInput: checkState } = state;
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        let colorOptions = '';
        Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
            group.variants.forEach((variant, index) => {
                const tokenName = `--${groupKey}-${index + 1}`;
                colorOptions += `<option value="${tokenName}" ${checkState.color === tokenName ? 'selected' : ''}>${tokenName}</option>`;
            });
        });

        // Create border options for dropdowns
        let borderOptionsHTML = `<option value="none">None</option>`;
        if (state.borders && state.borders.variants) {
            state.borders.variants.forEach((variant, index) => {
                const tokenName = `--border-${index + 1}`;
                borderOptionsHTML += `<option value="${tokenName}" ${checkState.borderToken === tokenName ? 'selected' : ''}>${tokenName}</option>`;
            });
        }

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Checkbox Styles</h3>
                <div class="pst-control-item pb-8">
                     <p class="text-xs text-gray-500">Customize the appearance of checkbox elements.</p>
                </div>
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
                        ${borderOptionsHTML}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Label</label>
                    <select data-state-key="checkboxInput.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${allTextTokens.map(t => `<option value="${t}" ${checkState.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Content</h3>
                <div class="pst-control-item">
                    <label>Preview Label</label>
                    <input data-state-key="checkboxInput.labelText" type="text" value="${checkState.labelText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-checkbox-input-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};