function generateGradientCSS(gradient) {
    if (!gradient || !gradient.stops || gradient.stops.length === 0) return 'none';
    const colors = gradient.stops.map(s => s.value).join(', ');
    if (gradient.type === 'linear') {
        return `linear-gradient(${gradient.angle}deg, ${colors})`;
    } else if (gradient.type === 'conic') {
        return `conic-gradient(from ${gradient.angle}deg, ${colors})`;
    } else { // radial
        return `radial-gradient(circle, ${colors})`;
    }
}

function createColorGroupPreview(groupKey, groupState, darkMode) {
    if (!groupState || groupState.count === 0) return '';
    const headingStyle = darkMode ? 'style="color: #888888;"' : ''; // This is a preview-specific style, not app chrome.
    const swatchBorderClass = darkMode ? 'border-transparent' : 'border-gray-200';

    const groupName = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);

    const swatchesHTML = groupState.variants.map((variant, index) => {
        const tokenName = `--${groupKey}-${index + 1}`;
        let labelHTML;

        if (groupKey === 'neutrals') {
            if (index === 0) {
                labelHTML = `White, ${variant.value}`;
            } else if (index === groupState.variants.length - 1) {
                labelHTML = `Black, ${variant.value}`;
            } else {
                labelHTML = tokenName;
            }
        } else {
            labelHTML = tokenName;
        }

        return `
            <div class="flex flex-col w-[120px] border-t border-r border-b ${swatchBorderClass}">
                <div class="h-24" style="background-color: ${variant.value};"></div>
                <div class="p-2 text-center bg-white border-t border-gray-200">
                    <span class="text-xs text-gray-500 font-mono break-all">${labelHTML}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="mb-12">
            <h3 class="pst-preview-heading mb-4 pb-2 ${swatchBorderClass}" ${headingStyle}>${groupName}</h3>
            <div class="flex flex-row flex-wrap border-l ${swatchBorderClass}">
                ${swatchesHTML}
            </div>
        </div>
    `;
}

function createGradientPreview(gradientState, darkMode) {
    if (!gradientState || gradientState.count === 0) return '';
    const headingStyle = darkMode ? 'style="color: #888888;"' : ''; // Preview-specific
    const swatchBorderClass = darkMode ? 'border-transparent' : 'border-gray-200';

    const gradientSwatches = gradientState.variants.map((grad, index) => {
        const tokenName = `--gradient-${index + 1}`;
        return `
            <div class="flex flex-col w-[120px] border-r border-b ${swatchBorderClass}">
                <div class="h-32" style="background: ${generateGradientCSS(grad)};"></div>
                <div class="p-2 text-center bg-white border-t ${swatchBorderClass}">
                    <span class="text-xs text-gray-500 font-mono break-all">${tokenName}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="mb-12">
            <h3 class="pst-preview-heading mb-4 pb-2 ${swatchBorderClass}" ${headingStyle}>Gradients</h3>
            <div class="flex flex-row flex-wrap border-l ${swatchBorderClass}">${gradientSwatches}</div>
        </div>`;
}

function createColorGroupControls(groupKey, groupState) {
    const groupName = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
    const minCount = groupKey === 'neutrals' ? 2 : 1;

    const variantsHTML = groupState.variants.map((variant, index) => {
        const dataKey = `colors.groups.${groupKey}.variants.${index}.value`;
        return `
            <div class="pst-control-item">
                <label>${groupName} ${index + 1}</label>
                <div class="flex items-center space-x-2 pst-color-input-container">
                    <input data-state-key="${dataKey}" type="text" value="${variant.value}" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                    <input data-state-key="${dataKey}" type="color" value="${variant.value}">
                </div>
            </div>
        `;
    }).join('');

    let modifierControl = '';
    const applicableGroups = ['primary', 'secondary', 'special'];
    if (applicableGroups.includes(groupKey)) {
        const modifier = groupState.modifier || 'none';
        modifierControl = `
            <div class="pst-control-item">
                <label>Apply to Variant</label>
                <select data-state-key="colors.groups.${groupKey}.modifier" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    <option value="none" ${modifier === 'none' ? 'selected' : ''}>None</option>
                    <option value="shades" ${modifier === 'shades' ? 'selected' : ''}>Shades</option>
                    <option value="tints" ${modifier === 'tints' ? 'selected' : ''}>Tints</option>
                </select>
            </div>
        `;
    }

    let temperatureControl = '';
    if (groupKey === 'neutrals') {
        const tempColor = groupState.temperatureColor || '#ffffff'; // Default to white (no effect)
        temperatureControl = `
            <div class="pst-control-item">
                <label>Temperature</label>
                <div class="flex items-center space-x-2 pst-color-input-container">
                    <input data-state-key="colors.groups.neutrals.temperatureColor" type="text" value="${tempColor}" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                    <input data-state-key="colors.groups.neutrals.temperatureColor" type="color" value="${tempColor}">
                </div>
            </div>
        `;
    }

    return `
    <div class="pst-control-accordion mt-8">
        <button class="pst-control-accordion-toggle">
            <span>${groupName}</span>
            <svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <div class="pst-control-accordion-content">
            <div class="pst-control-group">
                <div class="pst-control-item">
                    <label title="Number of ${groupKey} colors to generate.">Variants</label>
                    <input data-state-key="colors.groups.${groupKey}.count" type="number" value="${groupState.count}" min="${minCount}" max="12" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                ${modifierControl}
                ${temperatureControl}
                <div class="mt-8">${variantsHTML}</div>
            </div>
        </div>
    </div>`;
}

function createGradientControls(gradientState) {
    if (!gradientState) return '';

    const gradientVariantsHTML = gradientState.variants.map((grad, gradIndex) => {
        const stopsHTML = grad.stops.map((stop, stopIndex) => {
            const stopDataKey = `colors.gradients.variants.${gradIndex}.stops.${stopIndex}.value`;
            return `
                <div class="pst-control-item">
                    <label>Color ${stopIndex + 1}</label>
                    <div class="flex items-center space-x-2 pst-color-input-container">
                        <input data-state-key="${stopDataKey}" type="text" value="${stop.value}" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        <input data-state-key="${stopDataKey}" type="color" value="${stop.value}">
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="pl-4 mt-8 border-l border-indigo-200">
                <div class="pst-control-item"><label class="font-semibold">Gradient ${gradIndex + 1}</label></div>
                <div class="pst-control-item">
                    <label>Type</label>
                    <select data-state-key="colors.gradients.variants.${gradIndex}.type" class="w-32 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        <option value="linear" ${grad.type === 'linear' ? 'selected' : ''}>Linear</option>
                        <option value="radial" ${grad.type === 'radial' ? 'selected' : ''}>Radial</option>
                        <option value="conic" ${grad.type === 'conic' ? 'selected' : ''}>Conic</option>
                    </select>
                </div>
                ${(grad.type === 'linear' || grad.type === 'conic') ? `
                <div class="pst-control-item">
                    <label>Angle (deg)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="colors.gradients.variants.${gradIndex}.angle" type="range" value="${grad.angle}" min="0" max="360" step="1" class="flex-grow">
                        <input data-state-key="colors.gradients.variants.${gradIndex}.angle" type="number" value="${grad.angle}" min="0" max="360" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                ` : ''}
                ${stopsHTML}
            </div>
        `;
    }).join('');

    return `
        <div class="pst-control-accordion mt-8">
            <button class="pst-control-accordion-toggle">
                <span>Gradients</span>
                <svg class="pst-control-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="pst-control-accordion-content">
                <div class="pst-control-group">
                    <div class="pst-control-item">
                        <label title="Number of gradients to generate.">Variants</label>
                        <input data-state-key="colors.gradients.count" type="number" value="${gradientState.count}" min="0" max="4" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                    ${gradientVariantsHTML}
                </div>
            </div>
        </div>`;
}

window.colorView = {
    rendersOnStateChange: true, // Re-render preview on any color change
    getPreviewHTML: (state) => {
        const groupsHTML = Object.entries(state.colors.groups)
            .map(([groupKey, groupData]) => createColorGroupPreview(groupKey, groupData, state.colors.darkMode))
            .join('');
        const gradientsHTML = createGradientPreview(state.colors.gradients, state.colors.darkMode);
        const content = (groupsHTML + gradientsHTML) || '<p class="text-gray-500">No color groups defined.</p>';
        return content;
    },

    getControlsHTML: (state) => {
        const groupsHTML = Object.entries(state.colors.groups)
            .map(([groupKey, groupData]) => createColorGroupControls(groupKey, groupData))
            .join('');
        const gradientsControlsHTML = createGradientControls(state.colors.gradients);

        return `
            <div class="pst-control-group">
                ${groupsHTML}
                ${gradientsControlsHTML}
            </div>
        `;
    }
};