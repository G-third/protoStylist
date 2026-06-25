const bordersView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        if (!state.borders || state.borders.variants.length === 0) {
            return '<div class="pst-system-feedback">No border settings defined.</div>';
        }

        const variantsHTML = state.borders.variants.map((variant, index) => {
            const tokenName = `--border-${index + 1}`;
            const resolvedColor = variant.color ? (variant.color.startsWith('--') ? `var(${variant.color})` : variant.color) : (state.colors.darkMode ? '#ffffff' : '#111827');
            const borderStyle = `${variant.thickness}px ${variant.style} ${resolvedColor}`;
            
            return `
                <div class="flex flex-col items-start mb-8 w-full">
                    <div style="width: 200px;" class="mb-3">
                        <div class="w-24 h-24 bg-transparent mb-4" style="border: ${borderStyle};"></div>
                        <div class="w-full" style="border-top: ${borderStyle};"></div>
                    </div>
                    <span class="text-xs text-zinc-500 dark:text-zinc-400 font-mono">${tokenName} (${variant.thickness}px)</span>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-20">
                <h3 class="pst-preview-heading mb-4 pb-2">Borders</h3>
                <div class="flex flex-col gap-6">
                    ${variantsHTML}
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const variantsHTML = state.borders.variants.map((variant, index) => {
            return `
                <div class="pst-control-subgroup pst-control-group">
                    <div class="pst-control-item"><label class="font-semibold">Border ${index + 1}</label></div>
                    <div class="pst-control-item">
                        <label>Thickness (px)</label>
                        <div class="flex items-center space-x-2">
                            <input data-state-key="borders.variants.${index}.thickness" type="range" value="${variant.thickness}" min="1" max="100" step="1" class="flex-grow">
                            <input data-state-key="borders.variants.${index}.thickness" type="number" value="${variant.thickness}" min="1" max="100" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        </div>
                    </div>
                    <div class="pst-control-item">
                        <label>Style</label>
                        <select data-state-key="borders.variants.${index}.style" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                            <option value="solid" ${variant.style === 'solid' ? 'selected' : ''}>Solid</option>
                            <option value="dashed" ${variant.style === 'dashed' ? 'selected' : ''}>Dashed</option>
                            <option value="dotted" ${variant.style === 'dotted' ? 'selected' : ''}>Dotted</option>
                            <option value="double" ${variant.style === 'double' ? 'selected' : ''}>Double</option>
                            <option value="groove" ${variant.style === 'groove' ? 'selected' : ''}>Groove</option>
                            <option value="ridge" ${variant.style === 'ridge' ? 'selected' : ''}>Ridge</option>
                            <option value="inset" ${variant.style === 'inset' ? 'selected' : ''}>Inset</option>
                            <option value="outset" ${variant.style === 'outset' ? 'selected' : ''}>Outset</option>
                        </select>
                    </div>
                    <div class="pst-control-item">
                        <label>Test with Color</label>
                        ${createColorSelectWithSwatch(`borders.variants.${index}.color`, variant.color, state, { includeAuto: true })}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Border Settings</h3>
                <div class="pst-control-item">
                    <label title="Number of border styles to generate.">Variants</label>
                    <input data-state-key="borders.count" type="number" value="${state.borders.count}" min="1" max="8" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                ${variantsHTML}
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-borders-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};