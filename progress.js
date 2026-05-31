const progressView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { progress: p } = state;
        const labelClass = p.labelToken || 'text-label-sm';

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Progress Bar</h3>
                <div class="w-full md:w-2/3">
                    <div class="mb-8 flex items-center">
                        <div style="width: 80%;">
                            <div class="${labelClass} mb-1">25%</div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill" style="width: 25%;"></div>
                            </div>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.progress-bar</span>
                        </div>
                    </div>
                    <div class="mb-8 flex items-center">
                        <div style="width: 80%;">
                            <div class="${labelClass} mb-1">75%</div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill" style="width: 75%;"></div>
                            </div>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.progress-bar</span>
                        </div>
                    </div>
                    <div class="mb-8 flex items-center">
                        <div style="width: 80%;">
                            <div class="${labelClass} mb-1">${p.placeholderText}</div>
                            <div class="progress-bar">
                                <div class="progress-bar-fill" style="width: 50%;"></div>
                            </div>
                        </div>
                        <div class="flex-grow text-right">
                            <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.progress-bar</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    getControlsHTML: (state) => {
        const { progress: p } = state;
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
        const borderRadiusOptions = createOptions(state.curves.variants, i => `--border-radius-${i + 1}`, true);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Progress Bar Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Core styles like colors and borders defined in 'Baseline Styles' are available in the controls below.</p>
                </div>
                <div class="pst-control-item">
                    <label>Height (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="progress.height" type="range" value="${p.height}" min="4" max="32" step="1" class="flex-grow">
                        <input data-state-key="progress.height" type="number" value="${p.height}" min="4" max="32" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Border Radius</label>
                    <select data-state-key="progress.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptions.replace(`value="${p.borderRadius}"`, `value="${p.borderRadius}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Track Color</label>
                    ${createColorSelectWithSwatch('progress.trackColor', p.trackColor, state, { includeTransparent: false, includeAuto: false })}
                </div>
                <div class="pst-control-item">
                    <label>Fill Color</label>
                    ${createColorSelectWithSwatch('progress.fillColor', p.fillColor, state)}
                </div>
                <div class="pst-control-item">
                    <label>Label Style</label>
                    <select data-state-key="progress.labelToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${labelTokens.map(t => `<option value="${t}" ${p.labelToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Placeholder Text</label>
                    <input data-state-key="progress.placeholderText" type="text" value="${p.placeholderText}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-progress-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};