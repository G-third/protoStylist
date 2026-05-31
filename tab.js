const tabView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { tab: t } = state;
        const tabTokenClass = t.tabToken;
        const contentTokenClass = t.contentToken || 'text-body-md';
        const tabCount = t.count || 3;
        const tabLabel = t.placeholderLabel || 'Tab';

        const tabLinksHTML = Array.from({ length: tabCount }, (_, i) => {
            const isActive = i === 0 ? 'is-active' : '';
            return `<button class="tab-link ${isActive} ${tabTokenClass}">${tabLabel} ${i + 1}</button>`;
        }).join('');

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Tabs</h3>
                <div class="w-full">
                    <div class="tab-nav">
                        ${tabLinksHTML}
                    </div>
                    <div class="tab-content">
                        <p class="${contentTokenClass}">Content for ${tabLabel} 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Vivamus quis elit eget ex egestas scelerisque.</p>
                    </div>
                </div>
            </div>
        `;
    },
    getControlsHTML: (state) => {
        const { tab: t } = state;
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

        const spacingOptions = createOptions(state.spacing.variants, i => `--spacing-${getSpacingName(i)}`);
        const borderOptions = createOptions(state.borders.variants, i => `--border-${i + 1}`, true);
        const borderRadiusOptions = createOptions(state.curves.variants, i => `--border-radius-${i + 1}`, true);
        const headingTokens = state.typography.groups.heading.variants.map((v, i) => `text-${getVariantName('heading', i, state.typography.groups.heading.variants.length)}`);
        const paragraphTokens = state.typography.groups.paragraph.variants.map((v, i) => `text-${getVariantName('paragraph', i, state.typography.groups.paragraph.variants.length)}`);
        const labelTokens = state.typography.groups.label.variants.map((v, i) => `text-${getVariantName('label', i, state.typography.groups.label.variants.length)}`);
        const allTextTokens = [...headingTokens, ...paragraphTokens, ...labelTokens];

        const thicknessOptions = ['1px', '2px', '3px', '4px', '5px', '6px'].map(val => `<option value="${val}" ${t.activeIndicatorThickness === val ? 'selected' : ''}>${val}</option>`).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Tab Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Core styles like colors, fonts, and borders defined in 'Baseline Styles' are available in the controls below.</p>
                </div>
                <h3 class="pst-control-group-heading">Box & Borders</h3>
                <div class="pst-control-item">
                    <label>Number of Tabs</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="tab.count" type="range" value="${t.count}" min="2" max="8" step="1" class="flex-grow">
                        <input data-state-key="tab.count" type="number" value="${t.count}" min="2" max="8" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
                <div class="pst-control-item">
                    <label>Tab Label</label>
                    <input data-state-key="tab.placeholderLabel" type="text" value="${t.placeholderLabel}" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                </div>
                <div class="pst-control-item">
                    <label>Tab Padding Y</label>
                    <select data-state-key="tab.paddingY" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${t.paddingY}"`, `value="${t.paddingY}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Tab Padding X</label>
                    <select data-state-key="tab.paddingX" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${t.paddingX}"`, `value="${t.paddingX}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Bottom Border</label>
                    <select data-state-key="tab.navBorderBottom" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderOptions.replace(`value="${t.navBorderBottom}"`, `value="${t.navBorderBottom}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Bottom Border Color</label>
                    ${createColorSelectWithSwatch('tab.navBorderBottomColor', t.navBorderBottomColor, state, { includeAuto: true, includeTransparent: true })}
                </div>
                <div class="pst-control-item">
                    <label>Content Padding</label>
                    <select data-state-key="tab.panelPadding" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${spacingOptions.replace(`value="${t.panelPadding}"`, `value="${t.panelPadding}" selected`)}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Content Area BG</label>
                    ${createColorSelectWithSwatch('tab.contentBgColor', t.contentBgColor, state, { includeTransparent: true })}
                </div>
                <div class="pst-control-item">
                    <label>Curves</label>
                    <select data-state-key="tab.borderRadius" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${borderRadiusOptions.replace(`value="${t.borderRadius}"`, `value="${t.borderRadius}" selected`)}
                    </select>
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Active Tabs</h3>
                <div class="pst-control-item">
                    <label>Active Label Color</label>
                    ${createColorSelectWithSwatch('tab.activeLabelColor', t.activeLabelColor, state, { includeTransparent: true })}
                </div>
                <div class="pst-control-item">
                    <label>Active Tab BG</label>
                    ${createColorSelectWithSwatch('tab.activeTabBg', t.activeTabBg, state, { includeTransparent: true })}
                </div>
                <div class="pst-control-item">
                    <label>Active Indicator Thickness</label>
                    <select data-state-key="tab.activeIndicatorThickness" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${thicknessOptions}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Active Indicator Color</label>
                    ${createColorSelectWithSwatch('tab.activeIndicatorColor', t.activeIndicatorColor, state, { includeTransparent: true })}
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Inactive Tabs</h3>
                <div class="pst-control-item">
                    <label>Inactive Label Color</label>
                    ${createColorSelectWithSwatch('tab.inactiveLabelColor', t.inactiveLabelColor, state, { includeTransparent: true })}
                </div>
                <div class="pst-control-item">
                    <label>Inactive Tab BG</label>
                    ${createColorSelectWithSwatch('tab.inactiveTabBg', t.inactiveTabBg, state, { includeTransparent: true })}
                </div>
            </div>
            <div class="pst-control-group mt-8">
                <h3 class="pst-control-group-heading">Labels & Content</h3>
                <div class="pst-control-item">
                    <label>Tab Labels Style</label>
                    <select data-state-key="tab.tabToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${allTextTokens.map(token => `<option value="${token}" ${t.tabToken === token ? 'selected' : ''}>${token}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Content Style</label>
                    <select data-state-key="tab.contentToken" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm font-mono">
                        ${paragraphTokens.map(token => `<option value="${token}" ${t.contentToken === token ? 'selected' : ''}>${token}</option>`).join('')}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Content Color</label>
                    ${createColorSelectWithSwatch('tab.contentTextColor', t.contentTextColor, state, { includeTransparent: true })}
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-tab-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};