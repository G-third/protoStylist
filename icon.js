window.iconLibraries = {
    'none': { name: 'None', cdn: '', prefix: '', samples: [] },
    'bootstrap': {
        name: 'Bootstrap Icons',
        cdn: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
        classPattern: 'bi bi-{{name}}',
        samples: ['arrow-right', 'chevron-right', 'gear', 'person', 'download', 'plus', 'x', 'share', 'house', 'search', 'trash', 'pencil', 'three-dots', 'list', 'grid', 'image', 'calendar', 'bell', 'bookmark', 'heart']
    },
    'fontawesome': {
        name: 'Font Awesome',
        cdn: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        classPattern: 'fa-solid fa-{{name}}',
        samples: ['arrow-right', 'chevron-right', 'gear', 'user', 'download', 'plus', 'xmark', 'share', 'house', 'magnifying-glass', 'trash', 'pen', 'ellipsis', 'bars', 'grip', 'image', 'calendar-days', 'bell', 'bookmark', 'heart']
    },
    'material': {
        name: 'Material Symbols',
        cdn: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
        prefix: 'material-symbols-outlined',
        isText: true,
        samples: ['arrow_forward', 'chevron_right', 'settings', 'person', 'download', 'add', 'close', 'share', 'home', 'search', 'delete', 'edit', 'more_horiz', 'menu', 'apps', 'image', 'calendar_month', 'notifications', 'bookmark', 'favorite']
    },
    'remix': {
        name: 'Remix Icon',
        cdn: 'https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css',
        classPattern: 'ri-{{name}}',
        samples: ['arrow-right-line', 'arrow-right-s-line', 'settings-3-line', 'user-line', 'download-line', 'add-line', 'close-line', 'share-line', 'home-line', 'search-line', 'delete-bin-line', 'edit-line', 'more-line', 'menu-line', 'apps-line', 'image-line', 'calendar-line', 'notification-3-line', 'bookmark-line', 'heart-line']
    }
};

const iconView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const selectedLibraryKey = state.icons.library;
        if (!selectedLibraryKey || selectedLibraryKey === 'none') {
            return '<p class="text-gray-500">Select an icon library from the controls to see a preview.</p>';
        }

        const library = iconLibraries[selectedLibraryKey];
        let testColor = state.icons.testColor || '#000000';
        // If the color is a token, wrap it in var() for CSS.
        if (testColor.startsWith('--')) {
            testColor = `var(${testColor})`;
        }
        
        const iconSamplesHTML = library.samples.slice(0, 32).map(iconName => {
            let smallIcon, mediumIcon, largeIcon;

            if (library.isText) {
                // Material Symbols uses text content
                smallIcon = `<span class="${library.prefix} icon-preview-sm" style="color: ${testColor}; font-family: 'Material Symbols Outlined';">${iconName}</span>`;
                mediumIcon = `<span class="${library.prefix} icon-preview-md" style="color: ${testColor}; font-family: 'Material Symbols Outlined';">${iconName}</span>`;
                largeIcon = `<span class="${library.prefix} icon-preview-lg" style="color: ${testColor}; font-family: 'Material Symbols Outlined';">${iconName}</span>`;
            } else {
                // Other libraries use classes
                const iconClass = library.classPattern.replace('{{name}}', iconName);
                smallIcon = `<i class="${iconClass} icon-preview-sm" style="color: ${testColor};"></i>`;
                mediumIcon = `<i class="${iconClass} icon-preview-md" style="color: ${testColor};"></i>`;
                largeIcon = `<i class="${iconClass} icon-preview-lg" style="color: ${testColor};"></i>`;
            }

            return `
                <div class="flex flex-col items-center text-center">
                    <div class="flex flex-col items-center space-y-6 p-4 border border-gray-100 rounded-sm">
                        ${largeIcon}
                        ${mediumIcon}
                        ${smallIcon}
                    </div>
                    <span class="text-xs text-gray-500 mt-2 font-mono break-all">${iconName}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="mb-12">
                <h3 class="pst-preview-heading mb-4 pb-2">Icons</h3>
                <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-4 gap-y-12">
                    ${iconSamplesHTML}
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        // Create library options
        const libraryOptionsHTML = Object.keys(iconLibraries).map(key => {
            const library = iconLibraries[key];
            return `<option value="${key}" ${state.icons.library === key ? 'selected' : ''}>${library.name}</option>`;
        }).join('');

        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Icon Settings</h3>
                <div class="pst-control-item">
                    <label>Library</label>
                    <select data-state-key="icons.library" class="w-full text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                        ${libraryOptionsHTML}
                    </select>
                </div>
                <div class="pst-control-item">
                    <label>Test with Color</label>
                    ${createColorSelectWithSwatch('icons.testColor', state.icons.testColor, state, { includeTransparent: false, includeAuto: false })}
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-icons-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};