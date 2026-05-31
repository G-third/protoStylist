const modalView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { modal: m } = state;
        const headerTokenClass = m.headerToken;
        const contentTokenClass = m.contentToken;
        const iconLibrary = state.icons.library !== 'none' ? window.iconLibraries[state.icons.library] : null;
        let closeIconHTML = `&times;`;
        if (iconLibrary) {
            const iconName = iconLibrary.samples[6] || 'close'; // Use a close icon
            const iconClass = iconLibrary.isText ? iconLibrary.prefix : iconLibrary.classPattern.replace('{{name}}', iconName);
            if (iconLibrary.isText) {
                closeIconHTML = `<span class="${iconClass}">${iconName}</span>`;
            } else {
                closeIconHTML = `<i class="${iconClass}"></i>`;
            }
        }

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Modal</h3>
                <p class="text-sm text-gray-500 mb-4">The modal is shown below as a static preview. The overlay is simulated.</p>
                <div class="modal-overlay" style="position: relative; height: 400px;">
                    <div class="modal-container">
                        <button class="modal-close-btn">${closeIconHTML}</button>
                        <div class="modal-header">
                            <h4 class="${headerTokenClass}">${m.placeholderHeading}</h4>
                        </div>
                        <div class="modal-body">
                            <p class="${contentTokenClass}">${m.placeholderContent}</p>
                        </div>
                        <div class="modal-footer">
                            <div class="btn-pair">
                                <button class="btn btn-${m.buttonSize || 'md'} btn-variant-1">${m.placeholderButtonLeft || 'Cancel'}</button>
                                <button class="btn btn-${m.buttonSize || 'md'} btn-variant-0">${m.placeholderButtonRight || 'Confirm'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    getControlsHTML: (state) => {
        const { modal: m } = state;
        // Re-use helper functions
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
        const boxShadowOptions = createOptions(state.curves.elevation.variants, i => `--elevation-${i + 1}`, true);
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const buttonSizeOptions = ['sm', 'md', 'lg', 'xl'];

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Modal Dialog Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Description lorem ipsum dolor sit amet conseteur.</p>
                </div>
                <h3 class="pst-control-group-heading">Box & Borders</h3>
                <div class="pst-control-item">
                    <label>Overlay BG Color</label>
                    <input data-state-key="modal.overlayBgColor" type="text" value="${m.overlayBgColor}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Background Color</label>
                    <select data-state-key="modal.backgroundColor" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${colorOptions.replace(`value="${m.backgroundColor}"`, `value="${m.backgroundColor}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Padding</label>
                    <select data-state-key="modal.padding" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${m.padding}"`, `value="${m.padding}" selected`)}
                    </select>
                </div>
                 <div class="pst-control-item">
                    <label>Content Spacing</label>
                    <select data-state-key="modal.contentSpacing" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${m.contentSpacing}"`, `value="${m.contentSpacing}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Border</label>
                    <select data-state-key="modal.border" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderOptions.replace(`value="${m.border}"`, `value="${m.border}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Border Color</label>
                    <select data-state-key="modal.borderColor" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        <option value="transparent">Transparent</option>
                        <option value="">Auto</option>
                        ${colorOptions.replace(`value="${m.borderColor}"`, `value="${m.borderColor}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Border Radius</label>
                    <select data-state-key="modal.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptions.replace(`value="${m.borderRadius}"`, `value="${m.borderRadius}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Box Shadow</label>
                    <select data-state-key="modal.boxShadow" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${boxShadowOptions.replace(`value="${m.boxShadow}"`, `value="${m.boxShadow}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Max Width</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="modal.maxWidth" type="range" value="${m.maxWidth}" min="300" max="1200" step="10" class="flex-grow">
                        <input data-state-key="modal.maxWidth" type="number" value="${m.maxWidth}" min="300" max="1200" step="10" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Alignment</label>
                    <select data-state-key="modal.align" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        <option value="left" ${m.align === 'left' ? 'selected' : ''}>Left</option>
                        <option value="center" ${m.align === 'center' ? 'selected' : ''}>Center</option>
                        <option value="right" ${m.align === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Close Icon Size (px)</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="modal.closeIconSize" type="range" value="${m.closeIconSize}" min="12" max="48" step="1" class="flex-grow">
                        <input data-state-key="modal.closeIconSize" type="number" value="${m.closeIconSize}" min="12" max="48" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            </div>
            <div class="pst-control-group mt-4">
                <h4 class="pst-control-group-heading pt-4 border-t border-gray-200">Labels & Content</h4>
                <div class="pst-control-item">
                    <label>Heading</label>
                    <select data-state-key="modal.headerToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${headingTokens.map(t => `<option value="${t}" ${m.headerToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Heading Placeholder</label>
                    <input data-state-key="modal.placeholderHeading" type="text" value="${m.placeholderHeading}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Content</label>
                    <select data-state-key="modal.contentToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${paragraphTokens.map(t => `<option value="${t}" ${m.contentToken === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Text Content Color</label>
                    ${createColorSelectWithSwatch('modal.contentTextColor', m.contentTextColor, state, { includeTransparent: true, includeAuto: false })}
                </div>
                <div class="pst-control-item">
                    <label>Content Placeholder</label>
                    <textarea data-state-key="modal.placeholderContent" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm" rows="3">${m.placeholderContent}</textarea>
                </div>
                <div class="pst-control-item">
                    <label>Button Size</label>
                    <select data-state-key="modal.buttonSize" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        ${buttonSizeOptions.map(s => `<option value="${s}" ${m.buttonSize === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Left Button Label</label>
                    <input data-state-key="modal.placeholderButtonLeft" type="text" value="${m.placeholderButtonLeft}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Right Button Label</label>
                    <input data-state-key="modal.placeholderButtonRight" type="text" value="${m.placeholderButtonRight}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-modal-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};