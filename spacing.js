window.spacingSizeSuffixes = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl', '11xl'];

window.getSpacingName = function(index) {
    return window.spacingSizeSuffixes[index] || `var${index + 1}`;
}

const spacingView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        if (!state.spacing || state.spacing.variants.length === 0) {
            return '<div class="pst-system-feedback">No spacing settings defined.</div>';
        }

        const variantsHTML = state.spacing.variants.map((variant, index) => {
            const tokenName = `--spacing-${getSpacingName(index)}`;
            return `
                <div class="flex flex-col items-start mb-6">
                    <div style="width: 120px; height: ${variant.value}px; background-color: #d1d5db; border-radius: 2px;"></div>
                    <span class="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">${tokenName} (${variant.value}px)</span>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-20">
                <h3 class="pst-preview-heading mb-4 pb-2">Spacing</h3>
                <div class="flex flex-col gap-6">
                    ${variantsHTML}
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const variantsHTML = state.spacing.variants.map((variant, index) => {
            const tokenName = getSpacingName(index);
            return `
                <div class="pst-control-item">
                    <label>Spacing ${tokenName} (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="spacing.variants.${index}.value" type="range" value="${variant.value}" min="1" max="720" step="1" class="flex-grow">
                        <input data-state-key="spacing.variants.${index}.value" type="number" value="${variant.value}" min="1" max="720" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Global</h3>
                <div class="pst-control-item">
                    <label title="This feature is not yet implemented.">TBD</label>
                    <div class="flex items-center">
                        <input type="checkbox" data-state-key="spacing.tbd" ${state.spacing.tbd ? 'checked' : ''} class="pst-app-checkbox h-4 w-4 text-gray-600 rounded-sm border-gray-300 focus:ring-indigo-500">
                    </div>
                </div>
            </div>

            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Spacing Scale</h3>
                <div class="pst-control-item">
                    <label title="Number of spacing steps to generate.">Variants</label>
                    <input data-state-key="spacing.count" type="number" value="${state.spacing.count}" min="2" max="16" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="mt-8">${variantsHTML}</div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-spacing-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};