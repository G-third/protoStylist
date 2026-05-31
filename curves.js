const curvesView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        if (!state.curves || state.curves.variants.length === 0) {
            return '<p class="text-gray-500">No curve or elevation settings defined.</p>';
        }

        const curvesVariantsHTML = state.curves.variants.map((variant, index) => {
            const tokenName = `--border-radius-${index + 1}`;
            return `
                <div class="flex flex-col w-[200px]">
                    <div class="flex items-center justify-center h-[200px]">
                        <div class="w-3/4 h-3/4" style="background-color: none; border: 2px solid #9ca3af; border-radius: ${variant.radius}px;"></div>
                    </div>
                    <div class="p-2 text-center">
                        <span class="text-xs text-gray-500 font-mono break-all">${tokenName}</span>
                    </div>
                </div>
            `;
        }).join('');

        const maxRadius = state.curves.variants.reduce((max, v) => Math.max(max, v.radius), 0);
        let testBgColor = state.curves.elevation.testBackgroundColor || '#ffffff';
        // If the color is a token, wrap it in var() for CSS.
        if (testBgColor.startsWith('--')) {
            testBgColor = `var(${testBgColor})`;
        }
        const elevationVariantsHTML = state.curves.elevation.variants.map((variant, index) => {
            const tokenName = `--elevation-${index + 1}`;
            const inset = variant.inset ? 'inset ' : '';

            let shadowColor = 'rgba(0,0,0,0)';
            if (variant.color && variant.color.startsWith('#')) {
                let hex = variant.color.substring(1);
                if (hex.length === 3) {
                    hex = hex.split('').map(c => c + c).join('');
                }
                if (hex.length === 6) {
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    shadowColor = `rgba(${r}, ${g}, ${b}, ${variant.alpha})`;
                }
            }
            const shadowStyle = `${inset}${variant.hOffset}px ${variant.vOffset}px ${variant.blur}px ${variant.spread}px ${shadowColor}`;
            return `
                <div class="flex flex-col w-[200px]">
                    <div class="flex items-center justify-center h-[200px]">
                        <div class="w-3/4 h-3/4" style="background-color: ${testBgColor}; border-radius: ${maxRadius}px; box-shadow: ${shadowStyle};"></div>
                    </div>
                    <div class="p-2 text-center">
                        <span class="text-xs text-gray-500 font-mono break-all">${tokenName}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Curves</h3>
                <div class="flex flex-row flex-wrap gap-4">
                    ${curvesVariantsHTML}
                </div>
            </div>
            ${elevationVariantsHTML ? `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Elevation</h3>
                <div class="flex flex-row flex-wrap gap-20">
                    ${elevationVariantsHTML}
                </div>
            </div>
            ` : ''}
        `;
    },

    getControlsHTML: (state) => {
        const curvesVariantsHTML = state.curves.variants.map((variant, index) => {
            return `
                <div class="pst-control-item">
                    <label>Radius ${index + 1} (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.variants.${index}.radius" type="range" value="${variant.radius}" min="0" max="100" step="1" class="flex-grow">
                        <input data-state-key="curves.variants.${index}.radius" type="number" value="${variant.radius}" min="0" max="100" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            `;
        }).join('');

        const elevationVariantsHTML = state.curves.elevation.variants.map((variant, index) => {
            return `
                <div class="pst-control-item"><label class="font-semibold">Shadow ${index + 1}</label></div>
                <div class="pst-control-item">
                    <label>H-Offset (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.elevation.variants.${index}.hOffset" type="range" value="${variant.hOffset}" min="-50" max="50" step="1" class="flex-grow">
                        <input data-state-key="curves.elevation.variants.${index}.hOffset" type="number" value="${variant.hOffset}" min="-50" max="50" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>V-Offset (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.elevation.variants.${index}.vOffset" type="range" value="${variant.vOffset}" min="-50" max="50" step="1" class="flex-grow">
                        <input data-state-key="curves.elevation.variants.${index}.vOffset" type="number" value="${variant.vOffset}" min="-50" max="50" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Blur (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.elevation.variants.${index}.blur" type="range" value="${variant.blur}" min="0" max="100" step="1" class="flex-grow">
                        <input data-state-key="curves.elevation.variants.${index}.blur" type="number" value="${variant.blur}" min="0" max="100" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Spread (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.elevation.variants.${index}.spread" type="range" value="${variant.spread}" min="-50" max="50" step="1" class="flex-grow">
                        <input data-state-key="curves.elevation.variants.${index}.spread" type="number" value="${variant.spread}" min="-50" max="50" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Color</label>
                    <div class="flex items-center space-x-2 pst-color-input-container">
                        <input data-state-key="curves.elevation.variants.${index}.color" type="text" value="${variant.color || '#000000'}" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        <input data-state-key="curves.elevation.variants.${index}.color" type="color" value="${variant.color || '#000000'}">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Transparency</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="curves.elevation.variants.${index}.alpha" type="range" value="${variant.alpha !== undefined ? variant.alpha : 1}" min="0" max="1" step="0.01" class="flex-grow">
                        <input data-state-key="curves.elevation.variants.${index}.alpha" type="number" value="${variant.alpha !== undefined ? variant.alpha : 1}" min="0" max="1" step="0.01" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Inset</label>
                    <div class="flex items-center">
                        <input data-state-key="curves.elevation.variants.${index}.inset" type="checkbox" ${variant.inset ? 'checked' : ''} class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Global</h3>
                <div class="pst-control-item">
                    <label title="This feature is not yet implemented.">Apply to all elements</label>
                    <div class="flex items-center">
                        <input type="checkbox" data-state-key="curves.applyToAll" ${state.curves.applyToAll ? 'checked' : ''} class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                    </div>
                </div>
            </div>

            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Radius Settings</h3>
                <div class="pst-control-item">
                    <label title="Number of border radius styles to generate.">Variants</label>
                    <input data-state-key="curves.count" type="number" value="${state.curves.count}" min="1" max="6" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="mt-8">${curvesVariantsHTML}</div>
            </div>

            <div class="pst-control-group mt-8" >
                <h3 class="pst-control-group-heading">Elevation Settings</h3>
                <div class="pst-control-item">
                    <label title="Number of box-shadow styles to generate.">Variants</label>
                    <input data-state-key="curves.elevation.count" type="number" value="${state.curves.elevation.count}" min="0" max="6" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Test with Color</label>
                    ${createColorSelectWithSwatch('curves.elevation.testBackgroundColor', state.curves.elevation.testBackgroundColor, state, { includeTransparent: false, includeAuto: false })}
                </div>
                <div class="mt-8">${elevationVariantsHTML}</div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-curves-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};