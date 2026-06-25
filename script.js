/**
 * Creates a custom select dropdown with color swatches for color token selection.
 * @param {string} dataKey - The state key to bind to the select element.
 * @param {string} selectedValue - The currently selected color token.
 * @param {object} state - The global style state.
 * @param {object} [options={}] - Optional parameters.
 * @param {boolean} [options.includeTransparent=false] - Whether to include a 'transparent' option.
 * @param {boolean} [options.includeAuto=false] - Whether to include an 'Auto' (empty value) option.
 * @returns {string} The HTML for the custom select component.
 */
function createColorSelectWithSwatch(dataKey, selectedValue, state, options = {}) {
    const { includeTransparent = false, includeAuto = false } = options;
    let optionsHTML = '';
    let selectOptionsHTML = '';
    const colorMap = {};

    if (includeAuto) {
        optionsHTML += `<div class="pst-custom-select-option" data-value=""><span>Auto</span></div>`;
        selectOptionsHTML += `<option value="">Auto</option>`;
    }
    if (includeTransparent) {
        optionsHTML += `<div class="pst-custom-select-option" data-value="transparent"><span>transparent</span><span class="w-4 h-4 rounded-sm border border-gray-300 inline-block ml-2 bg-transparent"></span></div>`;
        selectOptionsHTML += `<option value="transparent">Transparent</option>`;
    }

    Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
        group.variants.forEach((variant, index) => {
            const tokenName = `--${groupKey}-${index + 1}`;
            colorMap[tokenName] = variant.value;
            optionsHTML += `
                <div class="pst-custom-select-option" data-value="${tokenName}">
                    <span>${tokenName}</span>
                    <span class="w-4 h-4 rounded-sm border border-gray-300 inline-block ml-2" style="background-color: ${variant.value};"></span>
                </div>`;
            selectOptionsHTML += `<option value="${tokenName}">${tokenName}</option>`;
        });
    });

    const selectedColorHex = colorMap[selectedValue] || selectedValue;
    const selectedLabel = selectedValue || (includeAuto ? 'Auto' : 'None');

    return `
        <div class="pst-custom-select-container">
            <select data-state-key="${dataKey}" class="hidden">${selectOptionsHTML.replace(`value="${selectedValue}"`, `value="${selectedValue}" selected`)}</select>
            <button type="button" class="pst-custom-select-toggle">
                <span class="flex items-center justify-end w-full">
                    <span>${selectedLabel}</span>
                    <span class="w-4 h-4 rounded-sm border border-gray-300 inline-block ml-2" style="background-color: ${selectedColorHex};"></span>
                </span>
            </button>
            <div class="pst-custom-select-options">${optionsHTML}</div>
        </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Scrollbar style on scroll ---
    let scrollTimer;
    // Listen for scroll events on any element in the window (using capture).
    window.addEventListener('scroll', () => {
        // When scrolling, add a class to the body.
        document.body.classList.add('is-scrolling');

        // Reset the timer to remove the class.
        clearTimeout(scrollTimer);

        // After scrolling stops for 1 second, remove the class.
        scrollTimer = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 1000);
    }, true);

    let lastLoadedVersionIndex = 0;

    // --- DOM Element Selectors ---
    const mainGrid = document.getElementById('main-grid');
    const leftPanel = document.getElementById('left-panel');
    const leftPanelContent = document.getElementById('left-panel-content');
    const navContainer = document.getElementById('main-nav');
    const previewArea = document.getElementById('preview-area');
    const previewHeading = document.getElementById('preview-heading');
    const controlsArea = document.getElementById('controls-area');
    const dynamicStyles = document.getElementById('dynamic-styles');
    const saveBtn = document.getElementById('save-btn');
    const aboutBtn = document.getElementById('about-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
    const versionControls = document.getElementById('pst-menu-versions-list');
    const exportCssBtn = document.getElementById('export-css-btn');
    const exportJsBtn = document.getElementById('export-js-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const importJsonBtn = document.getElementById('import-json-btn');
    const importJsonInput = document.getElementById('import-json-input');
    const shareLinkBtn = document.getElementById('share-link-btn');
    const aboutModalOverlay = document.getElementById('about-modal-overlay');
    const aboutModalCloseBtn = document.getElementById('about-modal-close-btn');

    // Overwrite Modal
    const overwriteModalOverlay = document.getElementById('overwrite-modal-overlay');
    const overwriteCancelBtn = document.getElementById('overwrite-cancel-btn');
    const overwriteConfirmBtn = document.getElementById('overwrite-confirm-btn');

    // AI Generator elements
    const aiGeneratorBtn = document.getElementById('ai-generator-btn');
    const aiGeneratorModalOverlay = document.getElementById('ai-generator-modal-overlay');
    const aiModalCloseBtn = document.getElementById('ai-modal-close-btn');
    const aiSetupForm = document.getElementById('ai-setup-form');
    const aiLoadingView = document.getElementById('ai-loading-view');
    const aiDiffView = document.getElementById('ai-diff-view');
    const aiIndustry = document.getElementById('ai-industry');
    const aiMood = document.getElementById('ai-mood');
    const aiSeedColor = document.getElementById('ai-seed-color');
    const aiSeedHex = document.getElementById('ai-seed-hex');
    const aiGenerateRunBtn = document.getElementById('ai-generate-run-btn');
    const aiDiffTableBody = document.getElementById('ai-diff-table-body');
    const aiLivePreviewCard = document.getElementById('ai-live-preview-card');
    const aiPreviewTitle = document.getElementById('ai-preview-title');
    const aiPreviewText = document.getElementById('ai-preview-text');
    const aiPreviewBtn = document.getElementById('ai-preview-btn');
    const aiDiffBackBtn = document.getElementById('ai-diff-back-btn');
    const aiDiffApplyBtn = document.getElementById('ai-diff-apply-btn');

    /**
     * Determines if a color is light or dark and returns the appropriate text color (black or white).
     * @param {string} hex - The hex color of the background.
     * @returns {string} '#ffffff' for dark backgrounds, '#111827' for light backgrounds.
     */
    function getTextColorForBackground(hex) {
        if (!hex) return '#111827';

        let tokenName = null;
        if (hex.startsWith('var(--')) {
            tokenName = hex.replace(/var\((--[a-zA-Z0-9-]+)\)/, '$1');
        } else if (hex.startsWith('--')) {
            tokenName = hex;
        }

        // If the color is a CSS variable, try to resolve it from the state
        if (tokenName) {
            let foundColor = null;
            for (const [groupKey, group] of Object.entries(styleState.colors.groups)) {
                const colorVariant = group.variants.find((v, i) => `--${groupKey}-${i + 1}` === tokenName);
                if (colorVariant) {
                    foundColor = colorVariant.value;
                    break;
                }
            }
            hex = foundColor || '#ffffff'; // Fallback to white if token not found
        }

        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (hex.length !== 6) return '#111827';

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Using the YIQ formula to determine luminance
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#111827' : '#ffffff';
    }

    function resolveColorToken(token) {
        if (!token) return null;
        // It's likely already a hex/rgb value, not a token
        if (!token.startsWith('--')) return token;

        for (const [groupKey, group] of Object.entries(styleState.colors.groups)) {
            // Find the variant in the group that matches the token name
            const variant = group.variants.find((v, i) => `--${groupKey}-${i + 1}` === token);
            if (variant) {
                return variant.value;
            }
        }
        // Fallback if the token isn't found in the state
        return null;
    }

    // --- Global Color Conversion Helpers ---
    const hexToRgb = (hex) => {
        if (!hex) return { r: 0, g: 0, b: 0 };
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return { r, g, b };
    };

    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    };

    const hslToRgb = (h, s, l) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: r * 255, g: g * 255, b: b * 255 };
    };

    const rgbToHex = (r, g, b) => {
        const toHex = (c) => ('0' + Math.round(c).toString(16)).slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const hexToHsl = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        return rgbToHsl(r, g, b);
    };

    /**
     * Generates an array of color variants (shades or tints) based on a base color.
     * @param {string} baseColorHex - The starting color in hex format (e.g., '#RRGGBB').
     * @param {number} count - The number of variants to generate.
     * @param {string} type - The type of scale to generate, either 'shades' or 'tints'.
     * @returns {Array<{value: string}>} An array of color variant objects.
     */
    function generateColorScale(baseColorHex, count, type) {
        if (count <= 1) return [{ value: baseColorHex }];

        const baseRgb = hexToRgb(baseColorHex);
        const variants = [{ value: baseColorHex }];

        // Determine the target color (black for shades, white for tints)
        let targetRgb;
        if (type === 'shades') {
            // Target an "almost black" version of the color by scaling it down
            targetRgb = { r: baseRgb.r * 0.1, g: baseRgb.g * 0.1, b: baseRgb.b * 0.1 };
        } else { // tints
            // Target an "almost white" version by interpolating 95% of the way to white
            targetRgb = { r: baseRgb.r + (255 - baseRgb.r) * 0.95, g: baseRgb.g + (255 - baseRgb.g) * 0.95, b: baseRgb.b + (255 - baseRgb.b) * 0.95 };
        }

        // The number of steps to interpolate over is count - 1
        const steps = count - 1;

        for (let i = 1; i < count; i++) {
            // The interpolation factor, from 0 to 1
            const factor = i / steps;

            // Linear interpolation (lerp) for each color channel
            const r = baseRgb.r + factor * (targetRgb.r - baseRgb.r);
            const g = baseRgb.g + factor * (targetRgb.g - baseRgb.g);
            const b = baseRgb.b + factor * (targetRgb.b - baseRgb.b);

            variants.push({ value: rgbToHex(r, g, b) });
        }

        return variants;
    }

    /**
     * Generates a scale of neutral gray colors between white and black.
     * @param {number} count - The total number of variants, including white and black.
     * @param {string} tempColorHex - The color to take the hue from for temperature.
     * @returns {Array<{value: string}>} An array of color variant objects.
     */
    function generateNeutralScale(count, tempColorHex = '#ffffff') {
        if (count < 2) count = 2;

        const tempHsl = hexToHsl(tempColorHex);
        const targetHue = tempHsl.h;
        // Use a low saturation to keep the colors neutral, but allow some temperature
        const targetSaturation = tempHsl.s > 0.02 ? 0.10 : 0;

        const variants = [];

        const steps = count - 1;

        for (let i = 0; i <= steps; i++) {
            // Interpolate lightness from 1 (white) to 0 (black)
            const lightness = 1 - (i / steps);

            // For the very first and last items, force pure white/black
            if (i === 0) {
                variants.push({ value: '#ffffff' });
            } else if (i === steps) {
                variants.push({ value: '#000000' });
            } else {
                const newRgb = hslToRgb(targetHue, targetSaturation, lightness);
                variants.push({ value: rgbToHex(newRgb.r, newRgb.g, newRgb.b) });
            }
        }

        return variants;
    }

    // --- Helper Functions ---
    function updateFontLink(url, groupKey) {
        const linkId = `custom-font-link-${groupKey}`;
        let customFontLink = document.getElementById(linkId);

        let cleanUrl = '';
        if (url) {
            cleanUrl = window.extractGoogleFontUrl ? window.extractGoogleFontUrl(url) : '';
            if (!cleanUrl && (url.startsWith('https://') || url.startsWith('http://'))) {
                cleanUrl = url;
            }
        }

        if (!cleanUrl) {
            if (customFontLink) {
                customFontLink.href = '';
            }
            return;
        }
        if (!customFontLink) {
            customFontLink = document.createElement('link');
            customFontLink.id = linkId;
            customFontLink.rel = 'stylesheet';
            document.head.appendChild(customFontLink);
        }
        customFontLink.href = cleanUrl;
    }

    function updateIconLibraryLink(libraryKey) {
        const linkId = 'icon-library-link';
        let iconLink = document.getElementById(linkId);

        // Find the CDN URL from the icon.js data structure
        const library = window.iconLibraries ? window.iconLibraries[libraryKey] : null;
        const url = library ? library.cdn : '';

        if (!url) {
            if (iconLink) {
                iconLink.href = ''; // Or remove it: iconLink.remove()
            }
            return;
        }
        if (!iconLink) {
            iconLink = document.createElement('link');
            iconLink.id = linkId;
            iconLink.rel = 'stylesheet';
            document.head.appendChild(iconLink);
        }
        iconLink.href = url;
    }

    // --- State Management ---
    const LOCAL_STORAGE_KEY = 'myStylist-versionHistory';
    const MAX_VERSIONS = 10;
    let activeView = 'typography'; // This could also be saved/loaded
    const defaultStyleState = {
        colors: {
            darkMode: false,
            groups: {
                primary: {
                    count: 1,
                    variants: [{ value: '#391797' }],
                    modifier: 'none'
                },
                secondary: {
                    count: 0,
                    variants: [],
                    modifier: 'none'
                },
                neutrals: {
                    count: 2,
                    modifier: 'none',
                    temperatureColor: '#ffffff',
                    variants: [ // Neutrals are a special case, often manually set
                        { value: '#ffffff' }, { value: '#000000' }
                    ]
                },
                stoplight: {
                    count: 3,
                    variants: [
                        { value: '#4CBB17' }, // green
                        { value: '#FF7800' }, // orange
                        { value: '#E60000' }  // red
                    ]
                },
                special: {
                    count: 1,
                    variants: [{ value: '#e5e7eb' }],
                    modifier: 'none'
                }
            },
            gradients: {
                count: 0,
                variants: []
            },
        },
        typography: {
            scale: 1.0,
            testColor: '',
            groups: {
                heading: {
                    fontFamily: "'Roboto', sans-serif",
                    fontFamilySelection: "'Roboto', sans-serif",
                    fontFamilyLink: '',
                    availableWeights: [100, 300, 400, 500, 700, 900],
                    count: 3,
                    placeholderText: "Tiny but Mighty",
                    variants: [
                        { size: 32, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false },
                        { size: 24, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false },
                        { size: 18, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false }
                    ]
                },
                paragraph: {
                    fontFamily: "'Roboto', sans-serif",
                    fontFamilySelection: "'Roboto', sans-serif",
                    fontFamilyLink: '',
                    availableWeights: [100, 300, 400, 500, 700, 900],
                    count: 1,
                    placeholderText: "This is some sample text to show how paragraphs will look. Nothing fancy, just words on a page doing their job. Sometimes you need a little more text to test spacing. This is one of those times, so here’s a slightly longer sentence to fill the gap.",
                    variants: [
                        { size: 16, lineHeight: 1.6, letterSpacing: 0, fontWeight: 400, fontStyle: 'normal', underline: false, strikethrough: false }
                    ]
                },
                label: {
                    fontFamily: "'Roboto', sans-serif",
                    fontFamilySelection: "'Roboto', sans-serif",
                    fontFamilyLink: '',
                    availableWeights: [100, 300, 400, 500, 700, 900],
                    count: 1,
                    placeholderText: "Save",
                    variants: [
                        { size: 12, lineHeight: 1.1, letterSpacing: 0.5, textTransform: 'none', fontWeight: 500, fontStyle: 'normal', underline: false, strikethrough: false }
                    ]
                },
                quote: {
                    fontFamily: "Georgia, serif",
                    fontFamilySelection: "Georgia, serif",
                    fontFamilyLink: '',
                    availableWeights: [400, 700],
                    count: 1,
                    placeholderText: "“I'm not arguing, I'm just explaining why I'm right.”",
                    variants: [
                        { size: 18, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none', fontWeight: 400, fontStyle: 'normal', underline: false, strikethrough: false }
                    ]
                }
            }
        },
        spacing: {
            tbd: false,
            count: 8,
            variants: [
                { value: 4 }, { value: 8 }, { value: 16 }, { value: 32 },
                { value: 64 }, { value: 96 }, { value: 128 }, { value: 256 }
            ]
        },
        curves: {
            applyToAll: false,
            count: 1,
            variants: [
                { radius: 0 }
            ],
            elevation: {
                count: 0,
                variants: [],
                testBackgroundColor: '#ffffff'
            }
        },
        borders: {
            count: 1,
            variants: [
                { thickness: 1, style: 'solid', color: '' }
            ]
        },
        icons: {
            library: 'none',
            testColor: '#111827',
            // Future controls: sizes, etc.
        },
        buttons: {
            global: {
                scale: 1.0,
                borderRadius: '--border-radius-1',
                labelToken: 'text-label-sm',
                defaultLabel: 'Save',
                hoverEffect: 'regular'
            },
            variants: [
                {
                    name: 'Primary',
                    backgroundColor: '--primary-1',
                    border: 'none',
                    borderColor: ''
                },
                {
                    name: 'Secondary',
                    backgroundColor: '--neutrals-1',
                    border: '--border-1',
                    borderColor: '--primary-1'
                },
                {
                    name: 'Tertiary',
                    backgroundColor: '--neutrals-1',
                    border: 'none',
                    borderColor: ''
                },
                {
                    name: 'Destructive',
                    backgroundColor: '--stoplight-3',
                    border: 'none',
                    borderColor: ''
                },
                { name: 'Positive', backgroundColor: '--stoplight-1', border: 'none', borderColor: '' },
                { name: 'Pair', leftVariant: 'Secondary', rightVariant: 'Primary', labelLeft: 'Cancel', labelRight: 'Proceed' },
            ]
        },
        textInput: {
            labelToken: 'text-label-md',
            inputToken: 'text-body-md',
            paddingY: '--spacing-xs',
            paddingX: '--spacing-sm',
            focusRingColor: '',
            borderRadius: '--border-radius-1',
            border: '--border-1',
            borderColor: '',
            backgroundColor: '--neutrals-1',
            errorBorderColor: '--stoplight-3',
            disabledBorderColor: '--special-1',
            disabledOpacity: 0.5,
            placeholderText: 'Placeholder text...',
            labelText: 'Label',
            helperText: 'This is some helpful text.',
            errorText: 'This field is required.',
            helperToken: 'text-label-sm'
        },
        textAreaInput: {
            rows: 4
        },
        selectInput: {
            // Inherits from textInput
        },
        checkboxInput: {
            labelToken: 'text-body-md',
            size: 16,
            color: '',
            labelText: 'Checkbox Label',
            borderToken: '--border-1',
            borderColor: ''
        },
        radioInput: {
            labelToken: 'text-body-md',
            size: 16,
            color: '',
            labelText: 'Radio Label',
            borderToken: '--border-1',
            borderColor: ''
        },
        accordion: {
            count: 2,
            paddingY: '--spacing-sm',
            paddingX: '--spacing-md',
            backgroundColor: '--neutrals-1',
            border: '--border-1',
            borderColor: '', // New: Color for the main border
            borderRadius: '--border-radius-1',
            titleToken: 'text-body-md',
            contentPadding: '--spacing-md',
            divider: '--border-1', // This is the border token for the divider
            dividerColor: '', // New: Color for the divider border
            contentToken: 'text-body-md',
            headingColor: '--neutrals-2',
            contentColor: '--neutrals-2', // New: Color for the content text
            iconColor: '--neutrals-2',
            iconPosition: 'right',
            iconSize: 20,
            placeholderText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Vivamus quis elit eget ex egestas scelerisque.',
            placeholderTitle: 'Accordion Title'
        },
        tab: {
            count: 3,
            placeholderLabel: 'Tab',
            paddingY: '--spacing-sm',
            paddingX: '--spacing-md',
            borderRadius: '--border-radius-1',
            tabToken: 'text-label-md',
            inactiveLabelColor: '--neutrals-2',
            activeLabelColor: '--neutrals-2',
            inactiveTabBg: 'transparent',
            activeTabBg: 'var(--neutrals-1)',
            activeIndicatorThickness: '2px',
            activeIndicatorColor: 'var(--primary-color)',
            panelPadding: '--spacing-lg',
            contentBgColor: 'transparent',
            contentToken: 'text-body-md',
            contentTextColor: '--neutrals-2',
            navBorderBottom: '--border-1',
            navBorderBottomColor: '',
        },
        modal: {
            overlayBgColor: 'rgba(0, 0, 0, 0.5)',
            backgroundColor: '--neutrals-1',
            padding: '--spacing-lg',
            contentSpacing: '--spacing-md',
            border: 'none',
            borderColor: '',
            borderRadius: '--border-radius-1',
            boxShadow: '--elevation-3',
            maxWidth: 600,
            align: 'left',
            headerToken: 'text-heading-sm',
            contentToken: 'text-body-md',
            contentTextColor: '--neutrals-2',
            placeholderHeading: 'Modal Title',
            placeholderContent: 'This is the main content of the modal. It can contain any information or form elements you need to display to the user.',
            closeIconSize: 24,
            buttonSize: 'md',
            placeholderButtonLeft: 'Cancel',
            placeholderButtonRight: 'Confirm',
        },
        progress: {
            height: 8,
            borderRadius: '--border-radius-1',
            trackColor: '--special-1',
            fillColor: '--primary-color',
            labelToken: 'text-label-sm',
            placeholderText: 'In Progress...',
        }
        ,
        textContent: {
            count: 1,
            variants: [
                {
                    previewWidth: 'full',
                    gutter: '--spacing-md',
                    columns: 1,
                    dividerBorder: 'none',
                    dividerColor: '',
                    backgroundColor: '--neutrals-1',
                    textColor: '--neutrals-2',
                    border: '--border-1',
                    borderColor: '',
                    borderRadius: '--border-radius-1',
                    paddingY: '--spacing-md',
                    paddingX: '--spacing-md',
                    contentSpacing: '--spacing-sm',
                    boxShadow: 'none',
                    hoverBoxShadow: 'none',
                    focusBoxShadow: 'none',
                    buttonVariant: 'none',
                    buttonSize: 'md',
                    lines: Array.from({ length: 6 }, (_, i) => ({
                        style: 'text-body-md',
                        text: `Line ${i + 1}: Tiny, mighty and potentially cranky.`
                    }))
                }
            ]
        }
    };

    function updateVersionUI() {
        const versionsList = document.getElementById('pst-menu-versions-list');
        if (!versionsList) return;
        versionsList.innerHTML = ''; // Clear previous controls
        const historyJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        let history = [];
        if (historyJSON) {
            try {
                const parsed = JSON.parse(historyJSON);
                if (Array.isArray(parsed)) {
                    history = parsed;
                }
            } catch (e) {
                console.error("Failed to parse version history:", e);
            }
        }

        if (history.length === 0) {
            const noVersions = document.createElement('span');
            noVersions.className = 'block px-4 py-2.5 text-xs text-gray-500 italic select-none';
            noVersions.textContent = 'No versions saved';
            versionsList.appendChild(noVersions);
        } else {
            history.forEach((version, index) => {
                const link = document.createElement('a');
                link.href = '#';
                link.dataset.versionIndex = index;
                link.className = 'block px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors';

                const date = new Date(version.savedAt);
                // Standardise date to Australian format: DD/MM/YYYY
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const timeStr = date.toLocaleTimeString('en-AU', { hour12: false });
                const formattedDate = `${day}/${month}/${year} ${timeStr}`;

                if (version.name) {
                    link.textContent = `v${history.length - index}: ${version.name}`;
                } else {
                    link.textContent = `v${history.length - index}: ${formattedDate}`;
                }

                if (index === lastLoadedVersionIndex) {
                    link.classList.add('bg-gray-100', 'font-semibold');
                }
                versionsList.appendChild(link);
            });
        }

        // Add divider and Reset link
        const divider = document.createElement('div');
        divider.className = 'border-t border-gray-100 my-1';
        versionsList.appendChild(divider);

        const resetLink = document.createElement('a');
        resetLink.href = '#';
        resetLink.id = 'reset-all-versions-link';
        resetLink.className = 'block w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors';
        resetLink.textContent = 'Reset All...';
        versionsList.appendChild(resetLink);
    }

    function loadState() {
        const historyJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (historyJSON) {
            try {
                const history = JSON.parse(historyJSON);
                // Ensure it's a non-empty array with the expected structure
                if (Array.isArray(history) && history.length > 0 && history[0].state) {
                    console.log(`Loaded most recent of ${history.length} saved versions.`);
                    let loadedState = history[0].state;

                    // --- MIGRATION: Convert legacy '--neutrals-2' and '#d1d5db' borders to '' (Auto) ---
                    const migrateToAuto = (obj, key) => {
                        if (obj && (obj[key] === '--neutrals-2' || obj[key] === '#d1d5db')) {
                            obj[key] = '';
                        }
                    };



                    if (loadedState.borders && loadedState.borders.variants) {
                        loadedState.borders.variants.forEach(v => migrateToAuto(v, 'color'));
                    }
                    migrateToAuto(loadedState.textInput, 'borderColor');
                    migrateToAuto(loadedState.textInput, 'focusRingColor');
                    migrateToAuto(loadedState.checkboxInput, 'borderColor');
                    migrateToAuto(loadedState.checkboxInput, 'color');
                    migrateToAuto(loadedState.radioInput, 'borderColor');
                    migrateToAuto(loadedState.radioInput, 'color');
                    migrateToAuto(loadedState.accordion, 'borderColor');
                    migrateToAuto(loadedState.accordion, 'dividerColor');
                    migrateToAuto(loadedState.tab, 'navBorderBottomColor');

                    if (loadedState.textContent && loadedState.textContent.variants) {
                        loadedState.textContent.variants.forEach(v => {
                            migrateToAuto(v, 'borderColor');
                            migrateToAuto(v, 'dividerColor');
                        });
                    }

                    return loadedState; // Load the most recent version
                }
            } catch (e) {
                console.error("Could not parse version history, using default.", e);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
            }
        }
        return JSON.parse(JSON.stringify(defaultStyleState));
    }

    let styleState = loadState();

    // --- Data Structure for Views & Navigation ---
    const views = {
        typography: typographyView,
        color: colorView,
        curves: curvesView,
        spacing: spacingView,
        borders: bordersView,
        icon: iconView,
        buttons: buttonView,
        'text-input': textInputView,
        'textarea-input': textAreaInputView,
        'select-input': selectInputView,
        'checkbox-radio': checkboxRadioView,
        accordion: accordionView,
        tab: tabView,
        modal: modalView,
        progress: progressView,
        'text-content': textContentView,
    };

    // --- Menu items, inactive ones hidden ---
    const navItems = [
        { id: 'typography', name: 'Typography', group: 'Baseline Styles' },
        { id: 'color', name: 'Color', group: 'Baseline Styles' },
        { id: 'spacing', name: 'Spacing', group: 'Baseline Styles' },
        { id: 'curves', name: 'Curves & Elevation', group: 'Baseline Styles' },
        { id: 'borders', name: 'Borders', group: 'Baseline Styles' },
        { id: 'icon', name: 'Icon', group: 'Baseline Styles' },
        // { id: 'image', name: 'Image', group: 'Baseline Styles' },
        { id: 'buttons', name: 'Button', group: 'Controls & Input' },
        { id: 'text-input', name: 'Text', group: 'Controls & Input' },
        { id: 'textarea-input', name: 'Text Area', group: 'Controls & Input' },
        { id: 'select-input', name: 'Select', group: 'Controls & Input' },
        { id: 'checkbox-radio', name: 'Checkbox & Radio', group: 'Controls & Input' },
        // { id: 'switch-input', name: 'Switch', group: 'Controls & Input' },
        { id: 'accordion', name: 'Accordion', group: 'Components' },
        { id: 'tab', name: 'Tab', group: 'Components' },
        { id: 'modal', name: 'Modal', group: 'Components' },
        // { id: 'popup', name: 'Popup', group: 'Components' },
        //{ id: 'step', name: 'Step', group: 'Components' },
        { id: 'progress', name: 'Progress', group: 'Components' },
        //{ id: 'rating', name: 'Rating', group: 'Components' },   
        { id: 'text-content', name: 'Text Content', group: 'Content' },
        //{ id: 'header', name: 'Header', group: 'Content' },
        //{ id: 'paragraph', name: 'Paragraph', group: 'Content' },
        //{ id: 'list', name: 'List', group: 'Content' },
        //{ id: 'rail', name: 'Rail', group: 'Content' },
        //{ id: 'notifications', name: 'Notifications', group: 'Content' },
        //{ id: 'segment', name: 'Segment', group: 'Content' },
        //{ id: 'section', name: 'Section', group: 'Content' },
    ];


    function generateCSS() {
        const state = styleState;

        // --- Collect Font Imports ---
        const googleFontParts = new Set();
        const customFontUrls = new Set();

        Object.values(state.typography.groups).forEach(group => {
            if (group.fontFamilySelection === 'custom' && group.fontFamilyLink) {
                let cleanUrl = window.extractGoogleFontUrl ? window.extractGoogleFontUrl(group.fontFamilyLink) : '';
                if (!cleanUrl && (group.fontFamilyLink.startsWith('https://') || group.fontFamilyLink.startsWith('http://'))) {
                    cleanUrl = group.fontFamilyLink;
                }
                if (cleanUrl) {
                    customFontUrls.add(cleanUrl);
                }
            } else if (group.fontFamilySelection !== 'custom' && window.standardFontData) {
                const fontData = window.standardFontData[group.fontFamilySelection];
                if (fontData && fontData.urlPart) {
                    googleFontParts.add(fontData.urlPart);
                }
            }
        });

        let fontImports = '';
        if (googleFontParts.size > 0) {
            const googleFontUrl = `https://fonts.googleapis.com/css2?${Array.from(googleFontParts).map(part => `family=${part}`).join('&')}&display=swap`;
            fontImports += `@import url('${googleFontUrl}');\n`;
        }
        customFontUrls.forEach(url => { fontImports += `@import url('${url}');\n`; });
        if (fontImports) fontImports = `/* --- Font Imports --- */\n${fontImports}\n`;

        const getAutoColor = (val) => {
            if (!val) return state.colors.darkMode ? '#ffffff' : '#111827';
            if (val.startsWith('--')) return `var(${val})`;
            return val;
        };

        let colorVars = '/* Color Tokens */\n';
        Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
            if (group.count === 0) return;
            group.variants.forEach((variant, index) => {
                const tokenName = `--${groupKey}-${index + 1}`;
                colorVars += `  ${tokenName}: ${variant.value};\n`;
            });
            colorVars += '\n';
        });

        let gradientVars = '/* Gradient Tokens */\n';
        const gradientsData = state.colors.gradients;
        if (gradientsData && gradientsData.variants) {
            gradientsData.variants.forEach((grad, index) => {
                const tokenName = `--gradient-${index + 1}`;
                const colors = grad.stops.map(s => s.value).join(', ');
                let gradValue;
                if (grad.type === 'linear') {
                    gradValue = `linear-gradient(${grad.angle}deg, ${colors})`;
                } else if (grad.type === 'conic') {
                    gradValue = `conic-gradient(from ${grad.angle}deg, ${colors})`;
                } else { // radial
                    gradValue = `radial-gradient(circle, ${colors})`;
                }
                gradientVars += `  ${tokenName}: ${gradValue};\n`;
            });
        }

        let curvesVars = '/* Curves / Border Radius Tokens */\n';
        state.curves.variants.forEach((variant, index) => {
            const tokenName = `--border-radius-${index + 1}`;
            curvesVars += `  ${tokenName}: ${variant.radius}px;\n`;
        });

        let elevationVars = '/* Elevation / Box Shadow Tokens */\n';
        if (state.curves.elevation) {
            state.curves.elevation.variants.forEach((variant, index) => {
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
                const shadowValue = `${inset}${variant.hOffset}px ${variant.vOffset}px ${variant.blur}px ${variant.spread}px ${shadowColor}`;
                elevationVars += `  ${tokenName}: ${shadowValue};\n`;
            });
            elevationVars += '\n';
        }

        let bordersVars = '/* Border Tokens */\n';
        if (state.borders) {
            state.borders.variants.forEach((variant, index) => {
                const tokenName = `--border-${index + 1}`;
                const colorValue = getAutoColor(variant.color);
                bordersVars += `  ${tokenName}: ${variant.thickness}px ${variant.style} ${colorValue};\n`;
                // Also create deconstructed variables for overrides
                bordersVars += `  ${tokenName}-width: ${variant.thickness}px;\n`;
                bordersVars += `  ${tokenName}-style: ${variant.style};\n`;
                bordersVars += `  ${tokenName}-color: ${colorValue};\n`;
            });
        }

        let buttonClasses = '\n/* --- Button Components --- */\n';
        const buttonSizes = {
            sm: { height: 24, padding: 10, fontSize: 10 },
            md: { height: 32, padding: 12, fontSize: 13 },
            lg: { height: 36, padding: 14, fontSize: 16 },
            xl: { height: 40, padding: 16, fontSize: 19 },
        };

        // Find the selected label variant from the global button settings
        const btnGlobalState = state.buttons.global;
        const labelToken = btnGlobalState.labelToken; // e.g., "text-label-sm"
        const labelGroupName = 'label';
        const labelGroup = state.typography.groups[labelGroupName];

        // Find the index of the selected variant
        const labelVariantIndex = labelGroup.variants.findIndex((v, i) => {
            const variantName = getVariantName(labelGroupName, i, labelGroup.variants.length);
            return `text-${variantName}` === labelToken;
        });

        // Get the properties of the selected variant, with fallbacks
        const selectedLabelVariant = labelGroup.variants[labelVariantIndex] || labelGroup.variants[0] || {};

        buttonClasses += `
.btn {
  display: inline-block;
  font-family: ${labelGroup.fontFamily};
  font-weight: ${selectedLabelVariant.fontWeight || 500};
  text-transform: ${selectedLabelVariant.textTransform || 'none'};
  border-radius: var(${btnGlobalState.borderRadius}, var(--border-radius, 4px));
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  line-height: 1;
}
.btn-square {
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
`;
        // Add size classes
        for (const [size, props] of Object.entries(buttonSizes)) {
            buttonClasses += `
.btn-${size} {
    height: calc(${props.height}px * var(--button-scale, 1));
    padding: 0 calc(${props.padding}px * var(--button-scale, 1));
    font-size: calc(${props.fontSize}px * var(--button-scale, 1));
}
.btn-${size}.btn-square {
    width: calc(${props.height}px * var(--button-scale, 1));
    padding: 0; /* Explicitly override padding */
}
`;
        }

        const globalHoverEffect = state.buttons.global.hoverEffect;
        state.buttons.variants.forEach((variant, index) => {
            if (variant.name === 'Pair') return;

            const textColor = getTextColorForBackground(variant.backgroundColor);
            const hoverEffects = {
                light: `filter: brightness(97%);`,
                regular: `filter: brightness(95%); transform: translateY(-1px);`,
                medium: `filter: brightness(90%); box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.10); transform: translateY(-2px);`,
                heavy: `filter: brightness(120%); box-shadow: 0px 0px 15px 5px rgba(0, 0, 0, 0.15); transform: translateY(-3px);`
            };

            buttonClasses += `
.btn-variant-${index} {
  background-color: var(${variant.backgroundColor});
  color: ${textColor};
  border: ${variant.border === 'none' ? 'none' : `var(${variant.border})`};
  ${variant.border !== 'none' ? `border-color: ${getAutoColor(variant.borderColor)};` : ''}
}
.btn-variant-${index}:hover {
  ${hoverEffects[globalHoverEffect] || ''}
}
.btn-variant-${index}:focus {
  outline: 3px solid ${getAutoColor(state.textInput.focusRingColor)};
  outline-offset: 1px;
}
`;
        });

        buttonClasses += `

/* --- Button Pair Component --- */
.btn-pair {
  display: flex;
  align-items: center;
  gap: 8px;
}`;

        let formClasses = '\n/* --- Form Control Components --- */\n';
        if (state.textInput) {
            const inputState = state.textInput;
            const labelClass = inputState.labelToken.replace('text-', '.');
            const inputClass = inputState.inputToken.replace('text-', '.');

            const selectArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
            const selectArrowDataUri = `url("data:image/svg+xml,${encodeURIComponent(selectArrowSvg)}")`;

            formClasses += `
.form-label {
  display: block;
  margin-bottom: var(--spacing-xxs, 4px);
}
/* Apply typography token styles to the label */
${labelClass} {
  /* This will be styled by the typography classes */
}

.form-helper-text {
  display: block;
  margin-top: var(--spacing-xxs, 4px);
}

.form-error-text {
  color: var(${inputState.errorBorderColor});
}

.form-input, .form-textarea, .form-select {
  display: block;
  width: 100%;
  padding: var(${inputState.paddingY}) var(${inputState.paddingX});
  background-color: var(${inputState.backgroundColor});
  ${inputState.border === 'none' ? 'border: none;' : `
  border-width: var(${inputState.border}-width, 1px);
  border-style: var(${inputState.border}-style, solid);
  border-color: ${getAutoColor(inputState.borderColor)};
  `}
  border-radius: var(${inputState.borderRadius});
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}
/* Apply typography token styles to the input */
.form-input, .form-textarea, .form-select {
  /* This will be styled by the typography classes, but we can apply them here */
  font-family: ${state.typography.groups[inputState.inputToken.split('-')[1] === 'body' ? 'paragraph' : inputState.inputToken.split('-')[1]].fontFamily};
  font-size: var(--font-size-${inputState.inputToken.replace('text-', '')});
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  /* The border color on focus is now the same as the default state. */
  outline: 3px solid ${getAutoColor(inputState.focusRingColor)};
  outline-offset: 2px;
}

.form-input.is-error, .form-textarea.is-error, .form-select.is-error {
  border-color: var(${inputState.errorBorderColor});
}

.form-input:disabled, .form-textarea:disabled, .form-select:disabled {
  opacity: ${inputState.disabledOpacity};
  cursor: not-allowed;
  background-color: #f9fafb;
  border-color: var(${inputState.disabledBorderColor});
}

.form-textarea {
  resize: vertical;
}

.form-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: ${selectArrowDataUri};
  background-repeat: no-repeat;
  background-position: right var(${inputState.paddingX}) center;
  background-size: 1.5em 1.5em;
  padding-right: calc(var(${inputState.paddingX}) + 2em);
}
.form-checkbox {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: inline-block;
  position: relative;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  ${state.checkboxInput.borderToken === 'none' ? 'border: none;' : `
  border-width: var(${state.checkboxInput.borderToken}-width, 1px);
  border-style: var(${state.checkboxInput.borderToken}-style, solid);
  border-color: ${getAutoColor(state.checkboxInput.borderColor)};
  `}
  border-radius: 2px;
  background-color: transparent;
  transition: all 0.1s ease;
}
.form-checkbox:checked {
  background-color: var(--checkbox-color);
  border-color: var(--checkbox-color);
}
.form-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 40%;
  width: 25%;
  height: 50%;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}
.form-checkbox:disabled {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  cursor: not-allowed;
}
.form-checkbox:checked:disabled {
  background-color: #d1d5db;
  border-color: #d1d5db;
}
.form-checkbox:focus {
  outline: 3px solid ${getAutoColor(inputState.focusRingColor)};
  outline-offset: 1px;
}

.form-radio {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: inline-block;
  position: relative;
  width: var(--radio-size);
  height: var(--radio-size);
  ${state.radioInput.borderToken === 'none' ? 'border: none;' : `
  border-width: var(${state.radioInput.borderToken}-width, 1px);
  border-style: var(${state.radioInput.borderToken}-style, solid);
  border-color: ${getAutoColor(state.radioInput.borderColor)};
  `}
  border-radius: 50%;
  background-color: transparent;
  transition: all 0.1s ease;
}
.form-radio:checked {
  border-color: var(--radio-color);
}
.form-radio:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--radio-size) * 0.5);
  height: calc(var(--radio-size) * 0.5);
  border-radius: 50%;
  background-color: var(--radio-color);
  transform: translate(-50%, -50%);
}
.form-radio:disabled {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  cursor: not-allowed;
}
.form-radio:checked:disabled {
  border-color: #d1d5db;
}
.form-radio:checked:disabled::after {
  background-color: #d1d5db;
}
.form-radio:focus {
  outline: 3px solid ${getAutoColor(inputState.focusRingColor)};
  outline-offset: 1px;
}
`;
        }

        let componentClasses = '\n/* --- Other Components --- */\n';
        if (state.accordion) {
            const a = state.accordion;
            componentClasses += `
/* Note: For the accordion border to apply correctly,
all .accordion-item elements should be direct siblings. */
.accordion-item {
  background-color: var(${a.backgroundColor});
  border-left: var(${a.border});
  border-right: var(${a.border});
  border-bottom: var(${a.divider});
  border-color: ${getAutoColor(a.borderColor)}; /* Apply main border color */
  border-bottom-color: ${getAutoColor(a.dividerColor)};
}
.accordion-item:first-child {
  border-top: var(${a.border});
  border-top-color: ${getAutoColor(a.borderColor)}; /* Apply main border color to top */
  border-top-left-radius: var(${a.borderRadius});
  border-top-right-radius: var(${a.borderRadius});
}
.accordion-item:last-child {
  border-bottom-left-radius: var(${a.borderRadius});
  border-bottom-right-radius: var(${a.borderRadius});
}
.accordion-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(${a.paddingY}) var(${a.paddingX});
  cursor: pointer;
  flex-direction: ${a.iconPosition === 'left' ? 'row-reverse' : 'row'};
}
.accordion-title {
  /* Styled by typography token and explicit color */
  color: var(${a.headingColor});
  flex-grow: 1;
  text-align: left;
  padding-left: ${a.iconPosition === 'left' ? 'var(--spacing-sm)' : '0'};
  padding-right: ${a.iconPosition === 'right' ? 'var(--spacing-sm)' : '0'};
}
.accordion-icon {
  color: var(${a.iconColor});
  transition: transform 0.2s ease;
  width: ${a.iconSize}px;
  height: ${a.iconSize}px;
  font-size: ${a.iconSize}px;
  flex-shrink: 0;
}
.accordion-toggle.is-open .accordion-icon {
  transform: rotate(180deg);
}
.accordion-content-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
}
.accordion-content-inner {
  color: var(${a.contentColor});
  padding: var(${a.contentPadding});
}
`;
        }
        if (state.tab) {
            const t = state.tab;

            let navBorderThickness = '0px';
            let navBorderCSS = `border-bottom: var(${t.navBorderBottom});`;

            if (t.navBorderBottom !== 'none' && t.navBorderBottom.startsWith('--border-')) {
                const borderIndex = parseInt(t.navBorderBottom.slice('--border-'.length), 10) - 1;
                if (state.borders.variants[borderIndex]) {
                    const borderVariant = state.borders.variants[borderIndex];
                    navBorderThickness = `${borderVariant.thickness}px`;

                    // If there's an override color, construct the border manually
                    if (t.navBorderBottomColor || t.navBorderBottomColor === '') {
                        const colorValue = getAutoColor(t.navBorderBottomColor);
                        navBorderCSS = `border-bottom: ${borderVariant.thickness}px ${borderVariant.style} ${colorValue};`;
                    }
                }
            }

            componentClasses += `
.tab-nav {
  display: flex;
  overflow-x: auto;
  ${navBorderCSS}
}
.tab-link {
  padding: var(${t.paddingY}) var(${t.paddingX});
  cursor: pointer;
  white-space: nowrap;
  /* Inactive tabs have a transparent background by default, so the nav border shows through. */
  background-color: ${t.inactiveTabBg.startsWith('--') ? `var(${t.inactiveTabBg})` : t.inactiveTabBg};
  color: var(${t.inactiveLabelColor});
  border-top-left-radius: var(${t.borderRadius});
  border-top-right-radius: var(${t.borderRadius});
}
.tab-link.is-active {
  background-color: var(${t.activeTabBg});
  color: var(${t.activeLabelColor});
  /* This pulls the active tab down to cover the main navigation border, creating the active state effect. */
  margin-bottom: -${navBorderThickness};
  position: relative; /* Needed for the pseudo-element indicator */
}
.tab-link.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${t.activeIndicatorThickness};
  background-color: var(${t.activeIndicatorColor});
}
.tab-content {
  padding: var(${t.panelPadding});
  background-color: ${t.contentBgColor.startsWith('--') ? `var(${t.contentBgColor})` : t.contentBgColor};
  color: var(${t.contentTextColor});
}
`;
        }
        if (state.modal) {
            const m = state.modal;
            componentClasses += `
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: ${m.overlayBgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background-color: var(${m.backgroundColor});
  padding: var(${m.padding});
  border-radius: var(${m.borderRadius});
  border: ${m.border === 'none' ? 'none' : `var(${m.border})`};
  ${m.border !== 'none' ? `border-color: ${getAutoColor(m.borderColor)};` : ''}
  box-shadow: var(${m.boxShadow});
  max-width: ${m.maxWidth}px;
  width: 90%;
  position: relative;
  text-align: ${m.align};
  color: var(${m.contentTextColor});
}
.modal-header {
  padding-right: calc(12px + ${m.closeIconSize}px); /* Space for close button */
}
.modal-body {
  margin-top: var(${m.contentSpacing});
  margin-bottom: var(${m.contentSpacing});
}
.modal-footer {
  /* Alignment handled by justify-content on the flex container */
}
.modal-footer .btn-pair {
  justify-content: ${m.align === 'center' ? 'center' : m.align === 'right' ? 'flex-end' : 'flex-start'};
}
.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: ${m.closeIconSize}px;
  height: ${m.closeIconSize}px;
  font-size: ${m.closeIconSize}px;
  line-height: 1;
  cursor: pointer;
  background: none;
  border: none;
}
`;
        }
        if (state.progress) {
            const p = state.progress;
            componentClasses += `
.progress-bar {
  width: 100%;
  height: ${p.height}px;
  background-color: var(${p.trackColor});
  border-radius: var(${p.borderRadius});
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background-color: var(${p.fillColor});
  border-radius: var(${p.borderRadius});
  transition: width 0.3s ease;
}
`;
        }
        if (state.textContent) {
            state.textContent.variants.forEach((variant, index) => {
                componentClasses += `
.content-card-${index} {
  display: flex;
  flex-direction: ${variant.columns == 2 ? 'row' : 'column'};
  ${variant.columns == 2 ? 'justify-content: space-between;' : ''}
  background-color: var(${variant.backgroundColor});
  color: var(${variant.textColor});
  border: var(${variant.border});
  border-color: ${getAutoColor(variant.borderColor)};
  border-radius: var(${variant.borderRadius});
  box-shadow: var(${variant.boxShadow});
  transition: box-shadow 0.2s ease-out;
}
.content-card-${index}:hover {
  box-shadow: var(${variant.hoverBoxShadow});
}
.content-card-${index}:focus, .content-card-${index}:focus-within {
  box-shadow: var(${variant.focusBoxShadow});
  outline: none;
}
.content-card-${index} .content-card-col { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  gap: var(${variant.contentSpacing}); 
  min-width: 0; 
  padding: var(${variant.paddingY}) var(${variant.paddingX});
}
.content-card-${index} .content-card-divider { 
  border-left-width: var(${variant.dividerBorder}-width, 0px);
  border-left-style: var(${variant.dividerBorder}-style, solid);
  border-left-color: ${getAutoColor(variant.dividerColor)};
 }

@media (max-width: 768px) {
  .content-card-${index} {
    flex-direction: column !important;
  }
  .content-card-${index} .content-card-divider {
    display: none !important;
  }
}
`;
            });
        }

        let spacingVars = '/* Spacing Tokens */\n';
        state.spacing.variants.forEach((variant, index) => {
            const tokenName = `--spacing-${getSpacingName(index)}`;
            spacingVars += `  ${tokenName}: ${variant.value}px;\n`;
        });

        let typographyVars = '/* Typography Tokens */\n';
        let typographyClasses = '\n/* Typography Components */\n';

        Object.entries(state.typography.groups).forEach(([groupKey, group]) => {
            if (group.count === 0) return;

            group.variants.forEach((variant, index) => {
                const variantName = getVariantName(groupKey, index, group.variants.length);
                const tokenName = `--font-size-${variantName}`;
                typographyVars += `  ${tokenName}: calc(${variant.size}px * var(--font-scale-global));\n`;

                let textDec = 'none';
                if (variant.underline && variant.strikethrough) {
                    textDec = 'underline line-through';
                } else if (variant.underline) {
                    textDec = 'underline';
                } else if (variant.strikethrough) {
                    textDec = 'line-through';
                }

                typographyClasses += `
.text-${variantName} {
  font-family: ${group.fontFamily};
  font-size: var(${tokenName});
  line-height: ${variant.lineHeight};
  letter-spacing: ${variant.letterSpacing}px;
  text-transform: ${variant.textTransform || 'none'};
  font-weight: ${variant.fontWeight};
  font-style: ${variant.fontStyle || 'normal'};
  text-decoration: ${textDec};
}\n`;
            });
            typographyVars += '\n';
        });

        return `
/**
 * Generated using proto/Stylist
 *
 * This file contains the foundational design tokens and base component
 * styles for your design system. It is intended to be used as a baseline
 * for web application development.
 *
 * Last generated: ${new Date().toUTCString()}
 */

${fontImports}

/*
 * =====================================================================
 *  DESIGN TOKENS (CSS Custom Properties)
 * =====================================================================
 *
 * These are the core variables of your design system, defined in the :root
 * so they are globally available.
 */
:root {
  /* ------------------------- */
  /* -- Mapped Core Tokens -- */
  /* These provide compatibility for built-in components. */
  /* ------------------------- */
  --primary-color: ${state.colors.groups.primary.variants[0]?.value || '#000'};
  --secondary-color: ${state.colors.groups.secondary.variants[0]?.value || '#777'};
  --accent-color: ${state.colors.groups.special.variants[0]?.value || '#3b82f6'};
  --bg-color: var(--neutrals-1, #ffffff);
  --text-color: var(--neutrals-2, #000000);
  --card-bg-color: #ffffff;
  --input-border-color: ${getAutoColor(state.textInput.borderColor)};
  --font-scale-global: ${state.typography.scale};
  --font-family-base: ${state.typography.groups.paragraph.fontFamily};
  --base-font-size: ${state.typography.baseSize}px;
  --checkbox-size: ${state.checkboxInput.size}px;
  --checkbox-color: ${getAutoColor(state.checkboxInput.color)};
  --radio-size: ${state.radioInput.size}px;
  --radio-color: ${getAutoColor(state.radioInput.color)};
  --border-radius: ${state.curves.variants[0]?.radius || 0}px;
  --border-width: 1px;
  --spacing-3: var(--spacing-sm, 12px);
  --spacing-6: var(--spacing-lg, 24px);
  --spacing-8: var(--spacing-xl, 32px);

  /* ------------------------- */
  /* -- Generated Token Sets -- */
  /* ------------------------- */
${colorVars}
${gradientVars}
${bordersVars}
${elevationVars}
${curvesVars}
${typographyVars}
${spacingVars}
}

/*
 * =====================================================================
 *  BASE COMPONENT STYLES
 * =====================================================================
 *
 * Utility classes and base styles for common components.
 */

/* --- Typography Components --- */
    ${typographyClasses}
/* --- UI Components --- */
${buttonClasses}

${formClasses}
${componentClasses}
/* --- Card Component --- */
.card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-6);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
}
`.trim();
    }

    function generateJS() {
        return `
/**
 * Generated using proto/Stylist
 *
 * This file contains the vanilla JavaScript Web Components
 * for your design system.
 *
 * Last generated: ${new Date().toUTCString()}
 */

// --- Button Component ---
class PstButton extends HTMLElement {
    connectedCallback() {
        const variant = this.getAttribute('variant') || '0';
        const size = this.getAttribute('size') || 'md';
        const label = this.innerHTML || 'Button';
        this.innerHTML = \`<button class="btn btn-\${size} btn-variant-\${variant}">\${label}</button>\`;
    }
}
if (!customElements.get('pst-button')) customElements.define('pst-button', PstButton);

// --- Text Input Component ---
class PstTextInput extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || 'Label';
        const placeholder = this.getAttribute('placeholder') || '';
        const helper = this.getAttribute('helper') || '';
        const error = this.getAttribute('error') || '';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        const isError = this.hasAttribute('error') ? 'is-error' : '';
        
        let html = \`<label class="form-label">\${label}</label>
            <input type="text" class="form-input \${isError}" placeholder="\${placeholder}" \${disabled}>\`;
            
        if (error) {
            html += \`<span class="form-helper-text form-error-text">\${error}</span>\`;
        } else if (helper) {
            html += \`<span class="form-helper-text">\${helper}</span>\`;
        }
            
        this.innerHTML = html;
    }
}
if (!customElements.get('pst-text-input')) customElements.define('pst-text-input', PstTextInput);

// --- Text Area Input Component ---
class PstTextareaInput extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || 'Label';
        const placeholder = this.getAttribute('placeholder') || '';
        const helper = this.getAttribute('helper') || '';
        const error = this.getAttribute('error') || '';
        const rows = this.getAttribute('rows') || '4';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        const isError = this.hasAttribute('error') ? 'is-error' : '';
        
        let html = \`<label class="form-label">\${label}</label>
            <textarea class="form-textarea \${isError}" rows="\${rows}" placeholder="\${placeholder}" \${disabled}></textarea>\`;
            
        if (error) {
            html += \`<span class="form-helper-text form-error-text">\${error}</span>\`;
        } else if (helper) {
            html += \`<span class="form-helper-text">\${helper}</span>\`;
        }
            
        this.innerHTML = html;
    }
}
if (!customElements.get('pst-textarea-input')) customElements.define('pst-textarea-input', PstTextareaInput);

// --- Select Input Component ---
class PstSelectInput extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || 'Label';
        const helper = this.getAttribute('helper') || '';
        const error = this.getAttribute('error') || '';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        const isError = this.hasAttribute('error') ? 'is-error' : '';
        
        const optionsHtml = this.innerHTML || '<option>Option 1</option>';
        
        let html = \`<label class="form-label">\${label}</label>
            <select class="form-select \${isError}" \${disabled}>\${optionsHtml}</select>\`;
            
        if (error) {
            html += \`<span class="form-helper-text form-error-text">\${error}</span>\`;
        } else if (helper) {
            html += \`<span class="form-helper-text">\${helper}</span>\`;
        }
            
        this.innerHTML = html;
    }
}
if (!customElements.get('pst-select-input')) customElements.define('pst-select-input', PstSelectInput);

// --- Checkbox Component ---
class PstCheckbox extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || 'Checkbox';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        const checked = this.hasAttribute('checked') ? 'checked' : '';
        const cursor = this.hasAttribute('disabled') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
        
        this.innerHTML = \`<label class="inline-flex items-center \${cursor}">
            <input type="checkbox" class="form-checkbox" \${checked} \${disabled} />
            <span class="ml-2">\${label}</span>
        </label>\`;
    }
}
if (!customElements.get('pst-checkbox')) customElements.define('pst-checkbox', PstCheckbox);

// --- Radio Component ---
class PstRadio extends HTMLElement {
    connectedCallback() {
        const label = this.getAttribute('label') || 'Radio';
        const name = this.getAttribute('name') || 'radio-group';
        const disabled = this.hasAttribute('disabled') ? 'disabled' : '';
        const checked = this.hasAttribute('checked') ? 'checked' : '';
        const cursor = this.hasAttribute('disabled') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
        
        this.innerHTML = \`<label class="inline-flex items-center \${cursor}">
            <input type="radio" class="form-radio" name="\${name}" \${checked} \${disabled} />
            <span class="ml-2">\${label}</span>
        </label>\`;
    }
}
if (!customElements.get('pst-radio')) customElements.define('pst-radio', PstRadio);

// --- Accordion Component ---
class PstAccordion extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Accordion Title';
        const isOpen = this.hasAttribute('open');
        const content = this.innerHTML;
        
        this.innerHTML = \`<div class="accordion-item">
            <button class="accordion-toggle \${isOpen ? 'is-open' : ''}" onclick="
                const content = this.nextElementSibling;
                const isOpen = this.classList.toggle('is-open');
                content.style.maxHeight = isOpen ? content.scrollHeight + 'px' : null;
            ">
                <span class="accordion-title">\${title}</span>
                <svg class="accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <div class="accordion-content-wrapper" style="\${isOpen ? 'max-height: 500px;' : ''}">
                <div class="accordion-content-inner">
                    \${content}
                </div>
            </div>
        </div>\`;
    }
}
if (!customElements.get('pst-accordion')) customElements.define('pst-accordion', PstAccordion);

// --- Tab Group Component ---
class PstTabGroup extends HTMLElement {
    connectedCallback() {
        const tabs = Array.from(this.querySelectorAll('pst-tab'));
        const navHtml = tabs.map((tab, i) => \`<button class="tab-link \${i === 0 ? 'is-active' : ''}" data-index="\${i}">\${tab.getAttribute('label')}</button>\`).join('');
        const contentHtml = tabs.map((tab, i) => \`<div class="tab-pane" style="display: \${i === 0 ? 'block' : 'none'};" data-index="\${i}">\${tab.innerHTML}</div>\`).join('');
        
        this.innerHTML = \`
            <div class="w-full">
                <div class="tab-nav">\${navHtml}</div>
                <div class="tab-content">\${contentHtml}</div>
            </div>
        \`;
        
        this.querySelectorAll('.tab-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                this.querySelectorAll('.tab-link').forEach(l => l.classList.remove('is-active'));
                e.target.classList.add('is-active');
                this.querySelectorAll('.tab-pane').forEach(p => {
                    p.style.display = p.getAttribute('data-index') === index ? 'block' : 'none';
                });
            });
        });
    }
}
if (!customElements.get('pst-tab-group')) customElements.define('pst-tab-group', PstTabGroup);

// --- Modal Component ---
class PstModal extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Modal Title';
        const open = this.hasAttribute('open');
        const content = this.innerHTML;
        
        this.innerHTML = \`
            <div class="modal-overlay" style="display: \${open ? 'flex' : 'none'};">
                <div class="modal-container">
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').style.display='none'">&times;</button>
                    <div class="modal-header"><h4>\${title}</h4></div>
                    <div class="modal-body">\${content}</div>
                </div>
            </div>
        \`;
    }
    
    open() { this.querySelector('.modal-overlay').style.display = 'flex'; }
    close() { this.querySelector('.modal-overlay').style.display = 'none'; }
}
if (!customElements.get('pst-modal')) customElements.define('pst-modal', PstModal);

// --- Progress Component ---
class PstProgress extends HTMLElement {
    connectedCallback() {
        const value = this.getAttribute('value') || '0';
        const label = this.getAttribute('label') || \`\${value}%\`;
        
        this.innerHTML = \`
            <div>
                <div class="mb-1">\${label}</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: \${value}%;"></div>
                </div>
            </div>
        \`;
    }
}
if (!customElements.get('pst-progress')) customElements.define('pst-progress', PstProgress);

// --- Text Content Component ---
class PstTextContent extends HTMLElement {
    connectedCallback() {
        const variant = this.getAttribute('variant') || '0';
        const content = this.innerHTML;
        
        this.innerHTML = \`
            <div class="content-card-\${variant}">
                <div class="content-card-col">\${content}</div>
            </div>
        \`;
    }
}
if (!customElements.get('pst-text-content')) customElements.define('pst-text-content', PstTextContent);
`.trim();
    }

    const viewSpecs = {
        typography: `
            <h4 class="pst-drawer-heading mb-2">Typography Design Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Base Hierarchy:</strong> T-shirt sizes (xs to 3xl) scaled using the global Scale factor.</li>
                <li><strong>A11y:</strong> Keep contrast ratio above 4.5:1 for standard text and 3:1 for headings.</li>
                <li><strong>Local Fonts:</strong> Local font imports must be packed with the theme assets for distribution.</li>
            </ul>`,
        color: `
            <h4 class="pst-drawer-heading mb-2">Color System Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Contrast Rules:</strong> WCAG AA requires a 4.5:1 ratio for regular text and 3:1 for large text.</li>
                <li><strong>Dark Mode:</strong> Decoupled shell variables maintain UI readability regardless of canvas state.</li>
            </ul>`,
        curves: `
            <h4 class="pst-drawer-heading mb-2">Elevation & Curves Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Border Radius:</strong> 4px for form inputs, 8px for cards, and 16px+ for modals.</li>
                <li><strong>Shadows:</strong> Level 1 for subtle depth, Level 2 for popups/dropdowns, Level 3 for modals.</li>
            </ul>`,
        spacing: `
            <h4 class="pst-drawer-heading mb-2">Spacing & Layout Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Grid Alignment:</strong> Keep spacing values aligned to an 8px or 4px grid.</li>
                <li><strong>Utility Classes:</strong> Apply variables to padding, margin, grid-gap, and flex-gap properties.</li>
            </ul>`,
        borders: `
            <h4 class="pst-drawer-heading mb-2">Border Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Thickness:</strong> 1px for standard divider, 2px for active/focus states.</li>
                <li><strong>A11y:</strong> Make sure borders separating active states satisfy 3:1 contrast ratio.</li>
            </ul>`,
        buttons: `
            <h4 class="pst-drawer-heading mb-2">Button Component Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Keyboard Accessibility:</strong> Buttons must be focusable (tabindex) and triggers on [Enter] or [Space].</li>
                <li><strong>States:</strong> Support Default, Hover, Active, Focus (outline visible), and Disabled (pointer-events: none).</li>
            </ul>`,
        'text-input': `
            <h4 class="pst-drawer-heading mb-2">Text Input Specs</h4>
            <ul class="text-xs text-zinc-500 list-disc list-outside pl-4 space-y-1">
                <li><strong>Label A11y:</strong> Label element must associate with input using the 'for' attribute.</li>
                <li><strong>Error State:</strong> Provide ARIA-invalid="true" and map helper text using aria-describedby.</li>
            </ul>`
    };

    function getActiveViewTokens(viewId, state) {
        let tokens = [];
        if (viewId === 'color') {
            Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
                group.variants.forEach((v, i) => {
                    const token = `--${groupKey}-${i + 1}`;
                    tokens.push({ name: token, value: v.value, type: 'color' });
                });
            });
            if (state.colors.gradients) {
                state.colors.gradients.variants.forEach((grad, i) => {
                    const token = `--gradient-${i + 1}`;
                    tokens.push({ name: token, value: generateGradientCSS(grad), type: 'gradient' });
                });
            }
        } else if (viewId === 'typography') {
            Object.entries(state.typography.groups).forEach(([groupKey, group]) => {
                group.variants.forEach((v, i) => {
                    const variantName = getVariantName(groupKey, i, group.variants.length);
                    tokens.push({ name: `--font-size-${variantName}`, value: `${v.size}px`, type: 'size' });
                    tokens.push({ name: `--line-height-${variantName}`, value: v.lineHeight, type: 'number' });
                    tokens.push({ name: `--letter-spacing-${variantName}`, value: `${v.letterSpacing}px`, type: 'size' });
                });
            });
        } else if (viewId === 'curves') {
            state.curves.variants.forEach((v, i) => {
                tokens.push({ name: `--border-radius-${i + 1}`, value: `${v.radius}px`, type: 'size' });
            });
            if (state.curves.elevation) {
                state.curves.elevation.variants.forEach((v, i) => {
                    tokens.push({ name: `--elevation-${i + 1}`, value: `${v.hOffset}px ${v.vOffset}px ${v.blur}px ${v.spread}px rgba(0,0,0,${v.alpha})`, type: 'shadow' });
                });
            }
        } else if (viewId === 'spacing') {
            state.spacing.variants.forEach((v, i) => {
                tokens.push({ name: `--spacing-${i + 1}`, value: `${v.value}px`, type: 'size' });
            });
        } else if (viewId === 'borders') {
            state.borders.variants.forEach((v, i) => {
                tokens.push({ name: `--border-${i + 1}`, value: `${v.thickness}px ${v.style} ${v.color || 'Auto'}`, type: 'border' });
            });
        } else {
            const compState = state[viewId] || state[viewId.replace('-input', 'Input')] || state[viewId.replace('-radio', 'Input')];
            if (compState) {
                Object.entries(compState).forEach(([key, val]) => {
                    if (typeof val !== 'object') {
                        tokens.push({ name: `Property: ${key}`, value: val, type: 'property' });
                    }
                });
            }
        }

        if (tokens.length === 0) {
            return `<div class="pst-system-feedback">No specific tokens for this section.</div>`;
        }

        const rows = tokens.map(t => {
            let preview = '';
            if (t.type === 'color') {
                preview = `<span class="w-4 h-4 rounded-sm border border-gray-300 inline-block mr-2" style="background-color: ${t.value};"></span>`;
            } else if (t.type === 'gradient') {
                preview = `<span class="w-4 h-4 rounded-sm border border-gray-300 inline-block mr-2" style="background: ${t.value};"></span>`;
            }
            return `
                <tr class="border-b border-zinc-100">
                    <td class="py-2 text-xs font-mono font-semibold text-zinc-600 select-all">${t.name}</td>
                    <td class="py-2 text-xs font-mono text-zinc-500 select-all">${t.value}</td>
                    <td class="py-2 text-left">${preview}</td>
                </tr>
            `;
        }).join('');

        return `
            <table class="w-full table-fixed text-left">
                <thead>
                    <tr class="border-b border-zinc-200 pst-drawer-heading">
                        <th class="pb-2 w-[280px]">Token Name</th>
                        <th class="pb-2 w-[180px]">Value</th>
                        <th class="pb-2">Visual</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    function getActiveViewJS(viewId) {
        const jsCode = generateJS();
        const mapping = {
            'buttons': 'Button',
            'text-input': 'TextInput',
            'textarea-input': 'TextAreaInput',
            'select-input': 'Select',
            'checkbox-radio': 'Checkbox',
            'accordion': 'Accordion',
            'tab': 'Tab',
            'modal': 'Modal',
            'progress': 'Progress',
            'text-content': 'TextContent'
        };
        const suffix = mapping[viewId];
        if (!suffix) return '// No custom Web Component JS needed for this baseline style.';

        const className = `Pst${suffix}`;
        const startIndex = jsCode.indexOf(`class ${className}`);
        if (startIndex === -1) return '// Component JS registration code not found.';

        let endIndex = jsCode.indexOf(`customElements.define`, startIndex);
        if (endIndex === -1) return jsCode.substring(startIndex);

        const lineEnd = jsCode.indexOf('\n', endIndex);
        return jsCode.substring(startIndex, lineEnd !== -1 ? lineEnd : jsCode.length);
    }

    function updateBottomTabs() {
        const tokensTab = document.getElementById('tab-content-tokens');
        if (tokensTab) {
            tokensTab.innerHTML = getActiveViewTokens(activeView, styleState);
        }

        const codeHtml = document.getElementById('code-html');
        const codeJs = document.getElementById('code-js');
        if (codeHtml) {
            const activeViewEl = views[activeView];
            const htmlSnippet = activeViewEl ? activeViewEl.getPreviewHTML(styleState) : '';
            const escapeHtml = (text) => {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            };
            codeHtml.innerHTML = escapeHtml(htmlSnippet);
        }
        if (codeJs) {
            codeJs.textContent = getActiveViewJS(activeView);
        }

        const specsTab = document.getElementById('tab-content-specs');
        if (specsTab) {
            specsTab.innerHTML = viewSpecs[activeView] || `
                <h4 class="pst-drawer-heading mb-2">${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Specs</h4>
                <p class="text-xs text-zinc-500">Component specs, accessibility guidelines, and metadata rules for ${activeView}.</p>
            `;
        }
    }

    function saveState(state) {
        try {
            const historyJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            const history = historyJSON ? JSON.parse(historyJSON) : [];
            const newVersion = {
                savedAt: new Date().toISOString(),
                state: JSON.parse(JSON.stringify(state))
            };
            history.unshift(newVersion);
            if (history.length > MAX_VERSIONS) {
                history.length = MAX_VERSIONS;
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
            lastLoadedVersionIndex = 0;
            updateVersionUI();
        } catch (e) {
            console.error("Failed to save state to localStorage:", e);
        }
    }

    function updateUI() {
        const exportCSS = generateCSS();

        const appPreviewStyles = `
/* --- ICON PREVIEW STYLES --- */
.icon-preview-sm { font-size: 24px; }
.icon-preview-md { font-size: 32px; }
.icon-preview-lg { font-size: 48px; }

/* --- PREVIEW AREA BASE STYLES --- */
.preview-canvas {
  font-size: var(--base-font-size);
  font-family: var(--font-family-base);
  line-height: 1.6;
  padding-top: 0;
  padding-right: 0;
  padding-bottom: 32px;
  padding-left: 0;
  border-radius: var(--border-radius);
}
.pst-preview-heading {
  font-family: monospace, sans-serif !important;
  font-size: 0.75rem !important;
  font-weight: 500;
  text-transform: capitalize;
  text-decoration: underline;
  color: #a1a1aa !important;
  margin-top: 80px;
  margin-bottom: 16px;
}
        `;

        dynamicStyles.textContent = exportCSS + '\n' + appPreviewStyles;
        updateBottomTabs();
    }

    function renderView(viewId, renderControls = true) {
        const view = views[viewId] || {
            getPreviewHTML: () => `<div class="pst-system-feedback">This component preview has not been implemented yet.</div>`,
            getControlsHTML: () => `<div class="pst-system-feedback">There are no controls for this component yet.</div>`
        };

        let openControlAccordions = new Set();
        let scrollContainer, scrollTop;

        if (renderControls) {
            // Before re-rendering, save the open state of control accordions
            controlsArea.querySelectorAll('.pst-control-accordion-toggle.is-open').forEach(toggle => {
                const key = toggle.querySelector('span')?.textContent;
                if (key) {
                    openControlAccordions.add(key);
                }
            });

            // Save scroll position of the controls panel's container
            scrollContainer = controlsArea.parentElement;
            scrollTop = scrollContainer.scrollTop;

            controlsArea.classList.add('pst-no-transition');

            controlsArea.innerHTML = view.getControlsHTML(styleState);

            // Re-apply the open state to the new accordions
            controlsArea.querySelectorAll('.pst-control-accordion-toggle').forEach(toggle => {
                const key = toggle.querySelector('span')?.textContent;
                if (key && openControlAccordions.has(key)) {
                    toggle.classList.add('is-open');
                }
            });

            controlsArea.querySelectorAll('.pst-control-accordion-toggle.is-open').forEach(toggle => {
                const content = toggle.nextElementSibling;
                if (content) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });

            // Restore scroll position to prevent jumping
            scrollContainer.scrollTop = scrollTop;
        }

        const viewHTML = view.getPreviewHTML(styleState);
        previewArea.innerHTML = `<div class="preview-canvas">${viewHTML}</div>`;
        mainGrid.classList.toggle('pst-dark-preview-bg', !!styleState.colors.darkMode);

        // Update breadcrumb
        const navItem = navItems.find(item => item.id === viewId);
        if (previewHeading) {
            if (navItem) {
                previewHeading.textContent = `Preview: ${navItem.group} / ${navItem.name}`;
            } else {
                previewHeading.textContent = 'Preview'; // Reset to default
            }
        }


        // Add event listeners for controls specific to this view
        if (renderControls) {
            if (viewId === 'typography') {
                const resetButton = document.getElementById('reset-typography-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        const defaultTypography = JSON.parse(JSON.stringify(defaultStyleState.typography));
                        styleState.typography = defaultTypography;
                        // Clear all custom font links from DOM
                        Object.keys(defaultTypography.groups).forEach(groupKey => {
                            updateFontLink('', groupKey);
                        });
                        renderView('typography');
                    });
                }
            } else if (viewId === 'color') {
                const resetButton = document.getElementById('reset-color-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.colors = JSON.parse(JSON.stringify(defaultStyleState.colors));
                        renderView('color');
                    });
                }
            } else if (viewId === 'curves') {
                const resetButton = document.getElementById('reset-curves-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.curves = JSON.parse(JSON.stringify(defaultStyleState.curves));
                        renderView('curves');
                    });
                }
            } else if (viewId === 'spacing') {
                const resetButton = document.getElementById('reset-spacing-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.spacing = JSON.parse(JSON.stringify(defaultStyleState.spacing));
                        renderView('spacing');
                    });
                }
            } else if (viewId === 'borders') {
                const resetButton = document.getElementById('reset-borders-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.borders = JSON.parse(JSON.stringify(defaultStyleState.borders));
                        renderView('borders');
                    });
                }
            } else if (viewId === 'icon') {
                const resetButton = document.getElementById('reset-icons-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.icons = JSON.parse(JSON.stringify(defaultStyleState.icons));
                        updateIconLibraryLink('none'); // Unload the CSS
                        renderView('icon');
                    });
                }
            } else if (viewId === 'buttons') {
                const resetButton = document.getElementById('reset-buttons-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.buttons = JSON.parse(JSON.stringify(defaultStyleState.buttons));
                        renderView('buttons');
                    });
                }
            } else if (viewId === 'text-input') {
                const resetButton = document.getElementById('reset-text-input-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.textInput = JSON.parse(JSON.stringify(defaultStyleState.textInput));
                        renderView('text-input');
                    });
                }
            } else if (viewId === 'textarea-input') {
                const resetButton = document.getElementById('reset-textarea-input-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.textAreaInput = JSON.parse(JSON.stringify(defaultStyleState.textAreaInput));
                        renderView('textarea-input');
                    });
                }
            } else if (viewId === 'checkbox-radio') {
                const resetButton = document.getElementById('reset-checkbox-radio-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.checkboxInput = JSON.parse(JSON.stringify(defaultStyleState.checkboxInput));
                        styleState.radioInput = JSON.parse(JSON.stringify(defaultStyleState.radioInput));
                        renderView('checkbox-radio');
                    });
                }
            } else if (viewId === 'accordion') {
                const resetButton = document.getElementById('reset-accordion-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.accordion = JSON.parse(JSON.stringify(defaultStyleState.accordion));
                        renderView('accordion');
                    });
                }
            } else if (viewId === 'tab') {
                const resetButton = document.getElementById('reset-tab-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.tab = JSON.parse(JSON.stringify(defaultStyleState.tab));
                        renderView('tab');
                    });
                }
            } else if (viewId === 'modal') {
                const resetButton = document.getElementById('reset-modal-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.modal = JSON.parse(JSON.stringify(defaultStyleState.modal));
                        renderView('modal');
                    });
                }
            } else if (viewId === 'progress') {
                const resetButton = document.getElementById('reset-progress-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.progress = JSON.parse(JSON.stringify(defaultStyleState.progress));
                        renderView('progress');
                    });
                }
            } else if (viewId === 'text-content') {
                const resetButton = document.getElementById('reset-text-content-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', () => {
                        styleState.textContent = JSON.parse(JSON.stringify(defaultStyleState.textContent));
                        renderView('text-content');
                    });
                }
            }
        }

        document.querySelectorAll('.pst-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewId);
        });

        if (renderControls) {
            // Re-enable transitions after the current frame, so the initial render isn't animated
            // Use a small timeout to ensure styles are applied before re-enabling transitions.
            setTimeout(() => {
                controlsArea.classList.remove('pst-no-transition');
            }, 50);
        }


        updateUI();
    }

    function handleStateChange(e) {
        const keyPath = e.target.dataset.stateKey;
        if (!keyPath) return;
        const keys = keyPath.split('.');
        let currentState = styleState;
        keys.slice(0, -1).forEach(key => { currentState = currentState[key]; });
        const newValue = e.target.type === 'checkbox' ? e.target.checked : (e.target.type === 'number' || e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value);
        currentState[keys[keys.length - 1]] = newValue;

        // Visually sync slider and number input pairs
        if (e.target.type === 'range') {
            const numberInput = e.target.parentElement.querySelector('input[type="number"]');
            if (numberInput) numberInput.value = newValue;
        }
        if (e.target.type === 'number' && e.target.previousElementSibling?.type === 'range') {
            const rangeInput = e.target.previousElementSibling;
            if (rangeInput) rangeInput.value = newValue;
        }

        // Visually sync color text and swatch input pairs
        if (e.target.dataset.stateKey?.startsWith('colors.groups') || e.target.dataset.stateKey?.startsWith('curves.elevation')) {
            const container = e.target.closest('.pst-color-input-container');
            if (container) {
                const textInput = container.querySelector('input[type="text"]');
                const colorInput = container.querySelector('input[type="color"]');
                if (textInput && textInput !== e.target) textInput.value = newValue;
                if (colorInput && colorInput !== e.target) colorInput.value = newValue;
            }
        }

        // --- Post-update logic for specific state changes ---

        if (keyPath.endsWith('.type') && keyPath.includes('gradients.variants')) {
            const variant = currentState;
            if ((newValue === 'linear' || newValue === 'conic') && variant.angle === undefined) {
                variant.angle = 90; // Default angle
            }
            renderView(activeView);
            return;
        }

        if (keyPath === 'icons.library') {
            updateIconLibraryLink(newValue);
            renderView(activeView, false);
            return;
        }


        if (keyPath.startsWith('typography.groups.') && keyPath.endsWith('.fontFamilySelection')) {
            const groupKey = keys[2];
            const groupState = styleState.typography.groups[groupKey];

            if (newValue !== 'custom') {
                groupState.fontFamily = newValue;
                groupState.availableWeights = window.standardFontData[newValue]?.weights || [400, 700];
                updateFontLink('', groupKey); // Clear custom font link if we're not using it
            } else {
                // Switched to custom, re-process the existing link
                updateFontLink(groupState.fontFamilyLink, groupKey);
                const { name: fontName, weights } = parseGoogleFont(groupState.fontFamilyLink);
                if (fontName) {
                    groupState.fontFamily = `'${fontName}', sans-serif`;
                    groupState.availableWeights = weights.length > 0 ? weights : [400, 700];
                }
            }
            // Re-render to show/hide the link input
            renderView(activeView);
            return; // renderView calls updateUI
        }

        if (keyPath.startsWith('typography.groups.') && keyPath.endsWith('.fontFamilyLink')) {
            const groupKey = keys[2];
            const groupState = styleState.typography.groups[groupKey];

            updateFontLink(newValue, groupKey);
            const { name: fontName, weights } = parseGoogleFont(newValue);
            if (fontName) {
                groupState.fontFamily = `'${fontName}', sans-serif`;
                groupState.availableWeights = weights.length > 0 ? weights : [400, 700];
            } else if (!newValue) { // Link was cleared
                // Revert to the dropdown's selection if it's not 'custom'
                if (groupState.fontFamilySelection !== 'custom') {
                    groupState.fontFamily = groupState.fontFamilySelection;
                    groupState.availableWeights = window.standardFontData[groupState.fontFamily]?.weights || [400, 700];
                } else {
                    // Fallback to default if dropdown is on 'custom' but link is empty
                    groupState.fontFamily = "'Roboto', sans-serif";
                    groupState.availableWeights = window.standardFontData["'Roboto', sans-serif"].weights;
                }
            }
            // Re-render to update font weight dropdowns
            renderView(activeView);
            return;
        }

        // --- Consolidated Color Generation Logic ---
        if (keyPath.startsWith('colors.groups.')) {
            const groupKey = keyPath.split('.')[2];
            const group = styleState.colors.groups[groupKey];
            let shouldRegenerate = false;

            if (groupKey === 'neutrals' && (keyPath.endsWith('.count') || keyPath.endsWith('.temperatureColor'))) {
                const count = keyPath.endsWith('.count') ? Math.max(2, Math.min(12, parseInt(newValue, 10) || 2)) : group.count;
                group.variants = generateNeutralScale(count, group.temperatureColor);
                shouldRegenerate = true;
            } else if (groupKey !== 'neutrals' && (keyPath.endsWith('.count') || keyPath.endsWith('.modifier'))) {
                if (group.modifier && group.modifier !== 'none' && group.variants.length > 0) {
                    const baseColor = group.variants[0].value;
                    group.variants = generateColorScale(baseColor, group.count, group.modifier);
                    shouldRegenerate = true;
                }
            }

            if (shouldRegenerate) {
                renderView(activeView);
                return;
            }
        }

        if (keyPath.startsWith('typography.') && keyPath.endsWith('.count')) {
            const groupKey = keyPath.split('.')[2];
            const group = styleState.typography.groups[groupKey];
            const newCount = Math.max(0, parseInt(newValue, 10) || 0);
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    const lastVariant = group.variants[group.variants.length - 1] || { size: styleState.typography.baseSize, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none', fontWeight: 400, fontStyle: 'normal', underline: false, strikethrough: false };
                    const newVariant = { ...lastVariant }; // Copy properties from the last variant
                    newVariant.size = Math.round(newVariant.size / 1.2);
                    group.variants.push(newVariant);
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView); // Re-render view since controls changed
            return;
        }

        if (keyPath.startsWith('colors.groups.') && keyPath.endsWith('.count')) {
            const groupKey = keyPath.split('.')[2];
            const group = styleState.colors.groups[groupKey];
            const minCount = groupKey === 'neutrals' ? 2 : 1;
            const newCount = Math.max(minCount, Math.min(12, parseInt(newValue, 10) || minCount));
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    group.variants.push({ value: '#cccccc' });
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath === 'curves.count') {
            const group = styleState.curves;
            const newCount = Math.max(1, Math.min(6, parseInt(newValue, 10) || 1));
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    const lastRadius = group.variants[group.variants.length - 1]?.radius || 0;
                    group.variants.push({ radius: Math.min(100, lastRadius + 4) });
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath === 'curves.elevation.count') {
            const group = styleState.curves.elevation;
            const newCount = Math.max(0, Math.min(6, parseInt(newValue, 10) || 0));
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    group.variants.push({
                        hOffset: 0,
                        vOffset: 4,
                        blur: 8,
                        spread: 0,
                        color: '#000000',
                        alpha: 0.1,
                        inset: false
                    });
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath === 'borders.count') {
            const group = styleState.borders;
            const newCount = Math.max(1, Math.min(8, parseInt(newValue, 10) || 1));
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    const lastVariant = group.variants[group.variants.length - 1] || { thickness: 1, style: 'solid', color: '' };
                    group.variants.push(JSON.parse(JSON.stringify(lastVariant)));
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath === 'textContent.count') {
            const group = styleState.textContent;
            const newCount = Math.max(1, Math.min(8, parseInt(newValue, 10) || 1));
            const oldCount = group.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    const lastVariant = group.variants[group.variants.length - 1] || defaultStyleState.textContent.variants[0];
                    group.variants.push(JSON.parse(JSON.stringify(lastVariant)));
                }
            } else if (newCount < oldCount) {
                group.variants.length = newCount;
            }
            group.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath.startsWith('textContent.variants.') && keyPath.endsWith('.columns')) {
            renderView(activeView, false);
            return;
        }

        if (keyPath.startsWith('textContent.variants.') && (keyPath.endsWith('Color') || keyPath.endsWith('backgroundColor'))) {
            renderView(activeView, false);
            return;
        }

        if (keyPath === 'icons.testColor') {
            renderView(activeView, false);
            return;
        }

        if (keyPath === 'curves.elevation.testBackgroundColor') {
            renderView(activeView, false);
            return;
        }

        if (keyPath.startsWith('borders.variants.') && keyPath.endsWith('.color')) {
            renderView(activeView, false);
            return;
        }

        if (keyPath.startsWith('textInput.') && (keyPath.endsWith('Color') || keyPath.endsWith('backgroundColor'))) {
            renderView(activeView, false);
            return;
        }

        if (keyPath.startsWith('buttons.variants.')) {
            // A specific variant's property changed, re-render preview/styles but not controls to avoid jumps
            renderView(activeView, false);
            return;
        }


        if (keyPath.startsWith('buttons.global.')) {
            // For global button changes, re-render the preview HTML and update CSS, but not the controls.
            // This prevents the input controls from freezing.
            const view = views[activeView];
            if (view) {
                const viewHTML = view.getPreviewHTML(styleState);
                previewArea.innerHTML = `<div class="preview-canvas">${viewHTML}</div>`;
            }
            updateUI();
            return;
        }

        if (keyPath === 'colors.gradients.count') {
            const gradientGroup = styleState.colors.gradients;
            const newCount = Math.max(0, Math.min(4, parseInt(newValue, 10) || 0));
            const oldCount = gradientGroup.variants.length;

            if (newCount > oldCount) {
                for (let i = 0; i < newCount - oldCount; i++) {
                    // Add a new default gradient, copying the last one if available
                    const lastVariant = gradientGroup.variants[gradientGroup.variants.length - 1] || { type: 'linear', angle: 90, stops: [{ value: '#cccccc' }, { value: '#dddddd' }, { value: '#eeeeee' }] };
                    gradientGroup.variants.push(JSON.parse(JSON.stringify(lastVariant)));
                }
            } else if (newCount < oldCount) {
                gradientGroup.variants.length = newCount;
            }
            gradientGroup.count = newCount;

            renderView(activeView);
            return;
        }

        if (keyPath === 'spacing.count') {
            const group = styleState.spacing;
            const newCount = Math.max(2, Math.min(16, parseInt(newValue, 10) || 2));
            const oldCount = group.variants.length;

            if (newCount !== oldCount) {
                const minVal = Math.max(1, group.variants[0].value);
                const maxVal = group.variants[oldCount - 1].value;
                const newVariants = [];

                if (newCount > 1 && maxVal > minVal) {
                    // Use exponential scaling
                    const ratio = Math.pow(maxVal / minVal, 1 / (newCount - 1));
                    for (let i = 0; i < newCount; i++) {
                        const rawValue = minVal * Math.pow(ratio, i);
                        newVariants.push({ value: Math.round(rawValue) });
                    }
                    // Ensure first and last values are precise to user's input
                    newVariants[0].value = minVal;
                    newVariants[newCount - 1].value = maxVal;
                } else {
                    // Fallback to linear for edge cases (e.g., minVal >= maxVal)
                    const stepSize = newCount > 1 ? (maxVal - minVal) / (newCount - 1) : 0;
                    for (let i = 0; i < newCount; i++) {
                        newVariants.push({ value: Math.round(minVal + (i * stepSize)) });
                    }
                }
                group.variants = newVariants;
            }
            group.count = newCount;
            renderView(activeView);
            return;
        }

        // Only re-render preview HTML if it directly depends on state (e.g., inline styles)
        const view = views[activeView];
        if (view && (view.rendersOnStateChange || keyPath.endsWith('.placeholderText'))) {
            previewArea.innerHTML = `<div class="preview-canvas">${view.getPreviewHTML(styleState)}</div>`;
            mainGrid.classList.toggle('pst-dark-preview-bg', !!styleState.colors.darkMode);
        }
        updateUI();
    }

    function buildNav() {
        const grouped = navItems.reduce((acc, item) => {
            acc[item.group] = acc[item.group] || [];
            acc[item.group].push(item);
            return acc;
        }, {});

        let navHtml = '';
        let firstGroup = true;
        for (const groupName in grouped) {
            const linksHtml = grouped[groupName].map(item =>
                `<a href="#" class="pst-nav-link" data-view="${item.id}">${item.name}</a>`
            ).join('');

            // The first group is open by default.
            const isOpenClass = firstGroup ? 'is-open' : '';
            firstGroup = false;

            navHtml += `
                <div class="pst-nav-accordion">
                    <button class="pst-nav-accordion-toggle ${isOpenClass}">
                        <span>${groupName}</span>
                        <svg class="pst-nav-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="pst-nav-accordion-content">
                        ${linksHtml}
                    </div>
                </div>
            `;
        }
        navContainer.innerHTML = navHtml;

        // Set initial state for open accordions
        navContainer.querySelectorAll('.pst-nav-accordion-toggle.is-open').forEach(toggle => {
            const content = toggle.nextElementSibling;
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }

    function generateSamplerContentHTML() {
        // The sampler object is defined in sampler.js
        return sampler.getHTML(styleState);
    }

    // --- Event Listeners ---
    controlsArea.addEventListener('click', (e) => {
        // Handle clicks on accordion toggles
        const toggle = e.target.closest('.pst-control-accordion-toggle');
        if (toggle) {
            e.preventDefault();
            const content = toggle.nextElementSibling;
            const isOpen = toggle.classList.contains('is-open');

            if (isOpen) {
                content.style.maxHeight = null;
                toggle.classList.remove('is-open');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                toggle.classList.add('is-open');
            }
        }

        // Handle Figma-like format toggle buttons
        const formatBtn = e.target.closest('[data-format-toggle]');
        if (formatBtn) {
            e.preventDefault();
            const keyPath = formatBtn.dataset.stateKey;
            const keys = keyPath.split('.');
            let currentState = styleState;
            keys.slice(0, -1).forEach(key => { currentState = currentState[key]; });
            const lastKey = keys[keys.length - 1];

            const toggleType = formatBtn.dataset.formatToggle;
            if (toggleType === 'fontStyle') {
                currentState[lastKey] = currentState[lastKey] === 'italic' ? 'normal' : 'italic';
            } else {
                currentState[lastKey] = !currentState[lastKey];
            }

            // Sync dynamic preview and controls UI
            const view = views[activeView];
            if (view && view.rendersOnStateChange) {
                previewArea.innerHTML = `<div class="preview-canvas">${view.getPreviewHTML(styleState)}</div>`;
                mainGrid.classList.toggle('pst-dark-preview-bg', !!styleState.colors.darkMode);
            }
            renderView(activeView);
        }
    });

    controlsArea.addEventListener('input', handleStateChange); // Keep this for state changes

    navContainer.addEventListener('click', (e) => {
        // Handle clicks on nav links
        const link = e.target.closest('.pst-nav-link');
        if (link) {
            e.preventDefault();

            // Expand the parent accordion if it's closed
            const accordionContent = link.closest('.pst-nav-accordion-content');
            if (accordionContent) {
                const accordionToggle = accordionContent.previousElementSibling;
                if (accordionToggle && accordionToggle.classList.contains('pst-nav-accordion-toggle') && !accordionToggle.classList.contains('is-open')) {
                    accordionToggle.classList.add('is-open');
                    accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                }
            }

            activeView = link.dataset.view;
            renderView(activeView);
            return;
        }

        // Handle clicks on accordion toggles
        const toggle = e.target.closest('.pst-nav-accordion-toggle');
        if (toggle) {
            e.preventDefault();
            const content = toggle.nextElementSibling;
            const isOpen = toggle.classList.contains('is-open');

            if (isOpen) {
                content.style.maxHeight = null;
                toggle.classList.remove('is-open');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                toggle.classList.add('is-open');
            }
        }
    });

    // --- Custom Dropdown with Color Swatches ---
    document.addEventListener('click', (e) => {
        // Close all custom dropdowns if clicking outside
        document.querySelectorAll('.pst-custom-select-container').forEach(container => {
            if (!container.contains(e.target)) {
                container.classList.remove('is-open');
            }
        });

        const toggle = e.target.closest('.pst-custom-select-toggle');
        if (toggle) {
            const container = toggle.closest('.pst-custom-select-container');
            container.classList.toggle('is-open');
        }

        const option = e.target.closest('.pst-custom-select-option');
        if (option) {
            const container = option.closest('.pst-custom-select-container');
            const hiddenSelect = container.querySelector('select');
            const value = option.dataset.value;

            if (hiddenSelect && hiddenSelect.value !== value) {
                hiddenSelect.value = value;
                // Manually trigger the 'input' event so our state handler picks it up
                const event = new Event('input', { bubbles: true, cancelable: true });
                hiddenSelect.dispatchEvent(event);
            }
            container.classList.remove('is-open');
        }
    });

    function setChromeDarkMode(isDark) {
        document.body.classList.toggle('pst-dark-mode', isDark);
        const sunIcon = document.getElementById('dark-mode-sun-icon');
        const moonIcon = document.getElementById('dark-mode-moon-icon');
        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isChecked = !styleState.colors.darkMode;
            styleState.colors.darkMode = isChecked;
            setChromeDarkMode(isChecked);
            renderView(activeView);
        });
    }

    // Overwrite Modal
    let pendingOverwriteCallback = null;
    function showOverwriteModal(callback) {
        pendingOverwriteCallback = callback;
        if (overwriteModalOverlay) {
            overwriteModalOverlay.classList.remove('hidden');
            overwriteModalOverlay.classList.add('flex');
        }
    }
    function hideOverwriteModal() {
        if (overwriteModalOverlay) {
            overwriteModalOverlay.classList.add('hidden');
            overwriteModalOverlay.classList.remove('flex');
        }
        pendingOverwriteCallback = null;
    }
    if (overwriteCancelBtn) overwriteCancelBtn.addEventListener('click', hideOverwriteModal);
    if (overwriteConfirmBtn) {
        overwriteConfirmBtn.addEventListener('click', () => {
            if (pendingOverwriteCallback) pendingOverwriteCallback();
            hideOverwriteModal();
        });
    }
    function isSessionModified() {
        return JSON.stringify(styleState) !== JSON.stringify(defaultStyleState);
    }

    previewArea.addEventListener('click', (e) => {
        // --- Accordion functionality for preview ---
        const accordionToggle = e.target.closest('.accordion-toggle');
        if (accordionToggle) {
            e.preventDefault();
            const content = accordionToggle.nextElementSibling;
            if (!content || !content.classList.contains('accordion-content-wrapper')) return;

            const isOpen = accordionToggle.classList.contains('is-open');

            if (isOpen) {
                content.style.maxHeight = null;
                accordionToggle.classList.remove('is-open');
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                accordionToggle.classList.add('is-open');
            }
        }

        // --- Tab functionality for preview ---
        const tabLink = e.target.closest('.tab-link');
        if (tabLink) {
            e.preventDefault();
            const tabNav = tabLink.closest('.tab-nav');
            if (!tabNav) return;

            // Deactivate all tabs in the group
            tabNav.querySelectorAll('.tab-link').forEach(link => link.classList.remove('is-active'));

            // Activate the clicked tab
            tabLink.classList.add('is-active');

            // Update content
            const tabContent = tabNav.nextElementSibling;
            if (tabContent && tabContent.classList.contains('tab-content')) {
                tabContent.querySelector('p').textContent = `Content for ${tabLink.textContent}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Vivamus quis elit eget ex egestas scelerisque.`;
            }
        }
    });

    // --- Hamburger Dropdown & Flyout Submenus wiring ---
    const hamburgerBtn = document.getElementById('pst-hamburger-btn');
    const hamburgerMenu = document.getElementById('pst-hamburger-menu');
    const hamburgerContainer = document.getElementById('pst-hamburger-dropdown-container');

    if (hamburgerBtn && hamburgerMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerMenu.classList.toggle('hidden');
        });
    }

    const versionsContainer = document.getElementById('pst-menu-versions-container');
    const versionsSubmenu = document.getElementById('pst-menu-versions-submenu');
    const exportContainer = document.getElementById('pst-menu-export-container');
    const exportSubmenu = document.getElementById('pst-menu-export-submenu');

    if (versionsContainer && versionsSubmenu) {
        versionsContainer.addEventListener('mouseenter', () => {
            versionsSubmenu.classList.remove('hidden');
        });
        versionsContainer.addEventListener('mouseleave', () => {
            versionsSubmenu.classList.add('hidden');
        });
        // Click to toggle on mobile/touch
        const versionsBtn = versionsContainer.querySelector('button');
        if (versionsBtn) {
            versionsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                versionsSubmenu.classList.toggle('hidden');
                if (exportSubmenu) exportSubmenu.classList.add('hidden');
            });
        }
    }

    if (exportContainer && exportSubmenu) {
        exportContainer.addEventListener('mouseenter', () => {
            exportSubmenu.classList.remove('hidden');
        });
        exportContainer.addEventListener('mouseleave', () => {
            exportSubmenu.classList.add('hidden');
        });
        // Click to toggle on mobile/touch
        const exportBtn = exportContainer.querySelector('button');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                exportSubmenu.classList.toggle('hidden');
                if (versionsSubmenu) versionsSubmenu.classList.add('hidden');
            });
        }
    }

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            const target = e.target.closest('button, a');
            if (target) {
                // Determine if it is a submenu trigger button (which has no ID or dataset and has sub-elements)
                const isSubmenuTrigger = (target.closest('#pst-menu-versions-container') && !target.dataset.versionIndex && target.id !== 'reset-all-versions-link') ||
                    (target.closest('#pst-menu-export-container') && !target.id);
                if (!isSubmenuTrigger) {
                    hamburgerMenu.classList.add('hidden');
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (hamburgerMenu && !hamburgerMenu.classList.contains('hidden')) {
            if (hamburgerContainer && !hamburgerContainer.contains(e.target)) {
                hamburgerMenu.classList.add('hidden');
            }
        }
    });

    const versionsList = document.getElementById('pst-menu-versions-list');
    if (versionsList) {
        versionsList.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (!target) return;

            const historyJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            let history = [];
            if (historyJSON) {
                try {
                    const parsed = JSON.parse(historyJSON);
                    if (Array.isArray(parsed)) {
                        history = parsed;
                    }
                } catch (e) {
                    console.error("Failed to parse version history:", e);
                }
            }

            // Handle version loading
            if (target.dataset.versionIndex !== undefined) {
                const selectedIndex = parseInt(target.dataset.versionIndex, 10);
                const selectedVersion = history[selectedIndex];
                if (selectedVersion && confirm(`Load version from ${new Date(selectedVersion.savedAt).toLocaleString()}? Your current unsaved changes will be lost.`)) {
                    styleState = selectedVersion.state;

                    Object.entries(styleState.typography.groups).forEach(([groupKey, groupState]) => {
                        updateFontLink(groupState.fontFamilyLink, groupKey);
                    });
                    renderView(activeView);
                    lastLoadedVersionIndex = selectedIndex;
                    updateVersionUI();
                }
            }

            // Handle reset
            if (target.id === 'reset-all-versions-link') {
                if (confirm('Are you sure you want to reset all styles? This will clear your entire version history in this browser and restore defaults.')) {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    location.reload();
                }
            }
        });
    }

    // --- Dynamic Bottom Tabs switching (Drawer Accordion) ---
    const tabButtons = document.querySelectorAll('.pst-tab-btn');
    const tabPanels = document.querySelectorAll('.pst-tab-panel');
    const tabsDrawer = document.getElementById('pst-tabs-drawer');
    let lastActiveTabId = 'tab-btn-tokens';

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.add('hidden'));

            if (isActive) {
                if (tabsDrawer) tabsDrawer.classList.remove('is-open');
            } else {
                btn.classList.add('active');
                lastActiveTabId = btn.id;
                const targetId = btn.id.replace('tab-btn-', 'tab-content-');
                const targetPanel = document.getElementById(targetId);
                if (targetPanel) targetPanel.classList.remove('hidden');
                if (tabsDrawer) tabsDrawer.classList.add('is-open');
            }
        });
    });




    // --- Global Copy Button Listener ---
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.pst-copy-btn');
        if (!copyBtn) return;

        const targetId = copyBtn.dataset.copyTarget;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        const textToCopy = targetEl.textContent || targetEl.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.disabled = true;
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy text", err);
        });
    });

    // --- Scrubbable Input Label Event Listeners ---
    let activeScrubber = null;
    let startX = 0;
    let startVal = 0;
    let scrubStep = 1;
    let scrubMin = 0;
    let scrubMax = 100;

    controlsArea.addEventListener('mouseover', (e) => {
        const label = e.target.closest('.pst-control-item label');
        if (!label) return;
        const container = label.closest('.pst-control-item');
        if (!container) return;
        const input = container.querySelector('input[type="number"]');
        if (input && !label.classList.contains('pst-scrubbable')) {
            label.classList.add('pst-scrubbable');
            if (!label.dataset.scrubMin && input.min) label.dataset.scrubMin = input.min;
            if (!label.dataset.scrubMax && input.max) label.dataset.scrubMax = input.max;
            if (!label.dataset.scrubStep && input.step) label.dataset.scrubStep = input.step;
        }
    });

    document.addEventListener('mousedown', (e) => {
        const label = e.target.closest('label.pst-scrubbable');
        if (!label) return;
        const container = label.closest('.pst-control-item');
        if (!container) return;
        const input = container.querySelector('input[type="number"]');
        if (!input) return;

        activeScrubber = input;
        startX = e.clientX;
        startVal = parseFloat(input.value) || 0;

        scrubStep = parseFloat(label.dataset.scrubStep) || parseFloat(input.step) || 1;
        scrubMin = parseFloat(label.dataset.scrubMin) || parseFloat(input.min) || 0;
        scrubMax = parseFloat(label.dataset.scrubMax) || parseFloat(input.max) || 100;

        e.preventDefault();
        document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeScrubber) return;
        const deltaX = e.clientX - startX;
        let multiplier = 1;
        if (e.shiftKey) multiplier = 10;
        if (e.altKey) multiplier = 0.1;

        const change = deltaX * scrubStep * multiplier * 0.2;
        let newVal = startVal + change;
        const decimalPlaces = (scrubStep.toString().split('.')[1] || '').length + (multiplier === 0.1 ? 2 : 0);
        newVal = parseFloat(newVal.toFixed(decimalPlaces));

        if (!isNaN(scrubMin) && newVal < scrubMin) newVal = scrubMin;
        if (!isNaN(scrubMax) && newVal > scrubMax) newVal = scrubMax;

        activeScrubber.value = newVal;
        const event = new Event('input', { bubbles: true });
        activeScrubber.dispatchEvent(event);
    });

    document.addEventListener('mouseup', () => {
        if (activeScrubber) {
            activeScrubber = null;
            document.body.style.cursor = '';
        }
    });

    // --- Searchable Local System Fonts Datalists ---
    const fallbackLocalFonts = [
        "Arial", "Arial Black", "Book Antiqua", "Comic Sans MS", "Courier New", "Georgia",
        "Helvetica", "Impact", "Lucida Console", "Lucida Sans Unicode", "Monaco",
        "Palatino Linotype", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"
    ];
    let localFontsLoaded = false;
    let localFontsList = [];
    async function loadLocalFonts() {
        if (localFontsLoaded) return localFontsList;
        if ('queryLocalFonts' in window) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'local-fonts' });
                if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
                    const fonts = await window.queryLocalFonts();
                    const families = Array.from(new Set(fonts.map(f => f.family))).sort();
                    if (families.length > 0) {
                        localFontsList = families;
                        localFontsLoaded = true;
                        return localFontsList;
                    }
                }
            } catch (e) {
                console.warn("Local Font Access API error:", e);
            }
        }
        localFontsList = [...fallbackLocalFonts];
        localFontsLoaded = true;
        return localFontsList;
    }
    document.addEventListener('focusin', async (e) => {
        const input = e.target.closest('.pst-local-font-input');
        if (!input) return;
        const datalistId = input.getAttribute('list');
        if (!datalistId) return;
        const datalist = document.getElementById(datalistId);
        if (!datalist || datalist.children.length > 0) return;
        const fonts = await loadLocalFonts();
        datalist.innerHTML = fonts.map(f => `<option value="${f}"></option>`).join('');
    });

    // --- Shareable URL Link Encoding & Import JSON ---
    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const stateStr = JSON.stringify(styleState);
            const b64 = btoa(unescape(encodeURIComponent(stateStr)));
            const shareUrl = `${window.location.origin}${window.location.pathname}?config=${b64}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("Share link copied to clipboard!");
            }).catch(err => {
                prompt("Copy this shareable link:", shareUrl);
            });
        });
    }

    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
            const stateStr = JSON.stringify(styleState, null, 2);
            const blob = new Blob([stateStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'design-system-session.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    if (importJsonBtn && importJsonInput) {
        importJsonBtn.addEventListener('click', () => importJsonInput.click());
        importJsonInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const importedState = JSON.parse(evt.target.result);
                    if (importedState && importedState.colors && importedState.typography) {
                        if (isSessionModified()) {
                            showOverwriteModal(() => {
                                styleState = importedState;
                                saveState(styleState);
                                renderView(activeView);
                            });
                        } else {
                            styleState = importedState;
                            saveState(styleState);
                            renderView(activeView);
                        }
                    } else {
                        alert("Invalid design system session file.");
                    }
                } catch (err) {
                    alert("Failed to parse JSON file: " + err.message);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
    }

    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const configParam = urlParams.get('config');
        if (!configParam) return;
        try {
            const decodedStr = decodeURIComponent(escape(atob(configParam)));
            const sharedState = JSON.parse(decodedStr);
            if (sharedState && sharedState.colors && sharedState.typography) {
                if (isSessionModified()) {
                    showOverwriteModal(() => {
                        styleState = sharedState;
                        saveState(styleState);
                        renderView(activeView);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    });
                } else {
                    styleState = sharedState;
                    saveState(styleState);
                    renderView(activeView);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } catch (err) {
            console.error("Failed to parse config from URL:", err);
        }
    }

    // --- AI Theme & Token Generator Modal Backend ---
    function generateLocalFallbackTheme(industry, mood, seedColorHex) {
        const seedRgb = hexToRgb(seedColorHex);
        const seedHsl = rgbToHsl(seedRgb.r, seedRgb.g, seedRgb.b);
        const compHue = (seedHsl.h + 0.5) % 1.0;
        const secondaryRgb = hslToRgb(compHue, seedHsl.s, seedHsl.l);
        const secondaryHex = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);

        let neutrals = [];
        if (mood.toLowerCase().includes('dark')) {
            neutrals = [{ value: '#ffffff' }, { value: '#e4e4e7' }, { value: '#52525b' }, { value: '#27272a' }, { value: '#09090b' }];
        } else {
            neutrals = [{ value: '#ffffff' }, { value: '#f4f4f5' }, { value: '#d4d4d8' }, { value: '#3f3f46' }, { value: '#09090b' }];
        }

        let curves = [4, 8, 12];
        if (mood.toLowerCase().includes('playful') || mood.toLowerCase().includes('creative')) {
            curves = [8, 16, 24];
        } else if (mood.toLowerCase().includes('minimalist') || mood.toLowerCase().includes('executive')) {
            curves = [2, 4, 8];
        }

        let headings = [
            { size: 36, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false },
            { size: 28, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false },
            { size: 22, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none', fontWeight: 700, fontStyle: 'normal', underline: false, strikethrough: false }
        ];

        return {
            colors: {
                darkMode: mood.toLowerCase().includes('dark'),
                groups: {
                    primary: { count: 1, variants: [{ value: seedColorHex }], modifier: 'none' },
                    secondary: { count: 1, variants: [{ value: secondaryHex }], modifier: 'none' },
                    neutrals: { count: neutrals.length, modifier: 'none', temperatureColor: '#ffffff', variants: neutrals },
                    stoplight: { count: 3, variants: [{ value: '#10b981' }, { value: '#f59e0b' }, { value: '#ef4444' }] },
                    special: { count: 1, variants: [{ value: mood.toLowerCase().includes('dark') ? '#27272a' : '#f4f4f5' }], modifier: 'none' }
                },
                gradients: {
                    count: 1,
                    variants: [{ type: 'linear', angle: 90, stops: [{ value: seedColorHex }, { value: secondaryHex }] }]
                }
            },
            typography: {
                scale: 1.0,
                testColor: '',
                groups: {
                    heading: {
                        fontFamily: mood.toLowerCase().includes('classic') ? "'Playfair Display', serif" : "'Inter', sans-serif",
                        fontFamilySelection: mood.toLowerCase().includes('classic') ? "'Playfair Display', serif" : "'Inter', sans-serif",
                        fontFamilyLink: '',
                        availableWeights: [400, 700],
                        count: 3,
                        placeholderText: 'Design System heading',
                        variants: headings
                    },
                    paragraph: {
                        fontFamily: "'Inter', sans-serif",
                        fontFamilySelection: "'Inter', sans-serif",
                        fontFamilyLink: '',
                        availableWeights: [400, 700],
                        count: 1,
                        placeholderText: 'The quick brown fox jumps over the lazy dog.',
                        variants: [{ size: 16, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none', fontWeight: 400, fontStyle: 'normal', underline: false, strikethrough: false }]
                    },
                    label: {
                        fontFamily: "'Inter', sans-serif",
                        fontFamilySelection: "'Inter', sans-serif",
                        fontFamilyLink: '',
                        availableWeights: [500, 700],
                        count: 1,
                        placeholderText: 'Label Text',
                        variants: [{ size: 14, lineHeight: 1.4, letterSpacing: 0.5, textTransform: 'none', fontWeight: 500, fontStyle: 'normal', underline: false, strikethrough: false }]
                    },
                    quote: {
                        fontFamily: "Georgia, serif",
                        fontFamilySelection: "Georgia, serif",
                        fontFamilyLink: '',
                        availableWeights: [400, 700],
                        count: 1,
                        placeholderText: "“I'm not arguing, I'm just explaining why I'm right.”",
                        variants: [{ size: 18, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none', fontWeight: 400, fontStyle: 'normal', underline: false, strikethrough: false }]
                    }
                }
            },
            curves: {
                count: curves.length,
                variants: curves.map(c => ({ radius: c })),
                elevation: {
                    count: 2,
                    variants: [
                        { hOffset: 0, vOffset: 2, blur: 4, spread: 0, color: '#000000', alpha: 0.05, inset: false },
                        { hOffset: 0, vOffset: 8, blur: 16, spread: 0, color: '#000000', alpha: 0.08, inset: false }
                    ]
                }
            },
            borders: {
                count: 2,
                variants: [
                    { thickness: 1, style: 'solid', color: '--neutrals-2' },
                    { thickness: 2, style: 'solid', color: '--primary-1' }
                ]
            }
        };
    }

    async function runAIGenerator(industry, mood, seedColorHex) {
        const prompt = `
You are a professional design system designer.
Generate a cohesive set of design system tokens based on the following:
- Target Industry: ${industry}
- Brand Mood/Vibe: ${mood}
- Primary Seed Color: ${seedColorHex}

Return ONLY a valid JSON object matching the following structure. Do NOT wrap the JSON inside markdown blocks (e.g. do not use \`\`\`json) and do not return any preamble or conversational text.

Structure:
{
  "colors": {
    "darkMode": ${mood.toLowerCase().includes('dark')},
    "groups": {
      "primary": {
        "count": 1,
        "variants": [{ "value": "${seedColorHex}" }]
      },
      "secondary": {
        "count": 1,
        "variants": [{ "value": "#complementaryOrAnalogousHex" }]
      },
      "neutrals": {
        "count": 5,
        "variants": [
          { "value": "#ffffff" },
          { "value": "#e4e4e7" },
          { "value": "#52525b" },
          { "value": "#27272a" },
          { "value": "#09090b" }
        ]
      },
      "stoplight": {
        "count": 3,
        "variants": [
          { "value": "#10b981" },
          { "value": "#f59e0b" },
          { "value": "#ef4444" }
        ]
      },
      "special": {
        "count": 1,
        "variants": [{ "value": "#e5e7eb" }]
      }
    }
  },
  "typography": {
    "groups": {
      "heading": {
        "fontFamily": "'Inter', sans-serif",
        "fontFamilySelection": "'Inter', sans-serif",
        "variants": [
          { "size": 32, "lineHeight": 1.2, "letterSpacing": -0.5, "fontWeight": 700 },
          { "size": 24, "lineHeight": 1.2, "letterSpacing": -0.5, "fontWeight": 700 },
          { "size": 18, "lineHeight": 1.2, "letterSpacing": -0.5, "fontWeight": 700 }
        ]
      },
      "paragraph": {
        "fontFamily": "'Inter', sans-serif",
        "fontFamilySelection": "'Inter', sans-serif",
        "variants": [
          { "size": 16, "lineHeight": 1.5, "letterSpacing": 0, "fontWeight": 400 }
        ]
      },
      "label": {
        "fontFamily": "'Inter', sans-serif",
        "fontFamilySelection": "'Inter', sans-serif",
        "variants": [
          { "size": 14, "lineHeight": 1.4, "letterSpacing": 0.5, "fontWeight": 500 }
        ]
      }
    }
  },
  "curves": {
    "count": 3,
    "variants": [
      { "radius": 4 },
      { "radius": 8 },
      { "radius": 16 }
    ]
  }
}
`;
        let generatedState = null;
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (response.ok) {
                const text = await response.text();
                const cleanText = text.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(cleanText);

                generatedState = JSON.parse(JSON.stringify(defaultStyleState));
                if (parsed.colors?.groups?.primary?.variants) {
                    generatedState.colors.groups.primary.variants = parsed.colors.groups.primary.variants;
                    generatedState.colors.groups.primary.count = parsed.colors.groups.primary.variants.length;
                }
                if (parsed.colors?.groups?.secondary?.variants) {
                    generatedState.colors.groups.secondary.variants = parsed.colors.groups.secondary.variants;
                    generatedState.colors.groups.secondary.count = parsed.colors.groups.secondary.variants.length;
                }
                if (parsed.colors?.groups?.neutrals?.variants) {
                    generatedState.colors.groups.neutrals.variants = parsed.colors.groups.neutrals.variants;
                    generatedState.colors.groups.neutrals.count = parsed.colors.groups.neutrals.variants.length;
                }
                if (parsed.curves?.variants) {
                    generatedState.curves.variants = parsed.curves.variants;
                    generatedState.curves.count = parsed.curves.variants.length;
                }
                ['heading', 'paragraph', 'label'].forEach(grp => {
                    if (parsed.typography?.groups?.[grp]) {
                        const parsedGrp = parsed.typography.groups[grp];
                        const targetGrp = generatedState.typography.groups[grp];
                        if (parsedGrp.fontFamily) {
                            targetGrp.fontFamily = parsedGrp.fontFamily;
                            targetGrp.fontFamilySelection = parsedGrp.fontFamilySelection || parsedGrp.fontFamily;
                        }
                        if (parsedGrp.variants) {
                            targetGrp.variants = parsedGrp.variants;
                            targetGrp.count = parsedGrp.variants.length;
                        }
                    }
                });
                if (parsed.colors?.darkMode !== undefined) {
                    generatedState.colors.darkMode = parsed.colors.darkMode;
                }
            }
        } catch (e) {
            console.warn("Gemini generation error, running rule fallback", e);
        }

        if (!generatedState) {
            generatedState = generateLocalFallbackTheme(industry, mood, seedColor);
        }
        return generatedState;
    }

    let aiProposedState = null;

    function renderDiffTable(proposedState) {
        const diffRows = [];
        const currentPrimary = styleState.colors.groups.primary.variants[0]?.value || '';
        const proposedPrimary = proposedState.colors.groups.primary.variants[0]?.value || '';
        diffRows.push({
            name: 'Primary Color',
            current: currentPrimary,
            proposed: proposedPrimary,
            modified: currentPrimary !== proposedPrimary,
            type: 'color'
        });

        const currentSecondary = styleState.colors.groups.secondary.variants[0]?.value || '';
        const proposedSecondary = proposedState.colors.groups.secondary.variants[0]?.value || '';
        diffRows.push({
            name: 'Secondary Color',
            current: currentSecondary,
            proposed: proposedSecondary,
            modified: currentSecondary !== proposedSecondary,
            type: 'color'
        });

        const currentRadius = styleState.curves.variants[0]?.radius || 0;
        const proposedRadius = proposedState.curves.variants[0]?.radius || 0;
        diffRows.push({
            name: 'Corner Radius (Sm)',
            current: `${currentRadius}px`,
            proposed: `${proposedRadius}px`,
            modified: currentRadius !== proposedRadius,
            type: 'value'
        });

        const currentFont = styleState.typography.groups.heading.fontFamily.split(',')[0].replace(/'/g, '');
        const proposedFont = proposedState.typography.groups.heading.fontFamily.split(',')[0].replace(/'/g, '');
        diffRows.push({
            name: 'Heading Font',
            current: currentFont,
            proposed: proposedFont,
            modified: currentFont !== proposedFont,
            type: 'value'
        });

        if (aiDiffTableBody) {
            aiDiffTableBody.innerHTML = diffRows.map(row => {
                const bgClass = row.modified ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-zinc-500';
                let currentVis = '';
                let proposedVis = '';
                if (row.type === 'color') {
                    currentVis = `<span class="w-3 h-3 rounded-full inline-block ml-1 border border-zinc-300" style="background-color: ${row.current};"></span>`;
                    proposedVis = `<span class="w-3 h-3 rounded-full inline-block ml-1 border border-zinc-300" style="background-color: ${row.proposed};"></span>`;
                }
                return `
                    <tr class="${bgClass} border-b border-zinc-200">
                        <td class="py-2 pl-2">${row.name}</td>
                        <td class="py-2 text-center select-all">${row.current} ${currentVis}</td>
                        <td class="py-2 text-right pr-2 select-all">${row.proposed} ${proposedVis}</td>
                    </tr>
                `;
            }).join('');
        }

        if (aiPreviewTitle) {
            aiPreviewTitle.style.fontFamily = proposedState.typography.groups.heading.fontFamily;
            aiPreviewTitle.style.fontSize = `${proposedState.typography.groups.heading.variants[0]?.size || 24}px`;
            aiPreviewTitle.style.fontWeight = proposedState.typography.groups.heading.variants[0]?.fontWeight || 700;
        }
        if (aiPreviewText) {
            aiPreviewText.style.fontFamily = proposedState.typography.groups.paragraph.fontFamily;
            aiPreviewText.style.fontSize = `${proposedState.typography.groups.paragraph.variants[0]?.size || 14}px`;
        }
        if (aiPreviewBtn) {
            aiPreviewBtn.style.backgroundColor = proposedPrimary;
            aiPreviewBtn.style.borderRadius = `${proposedRadius}px`;
        }
        if (aiLivePreviewCard) {
            aiLivePreviewCard.style.borderRadius = `${proposedState.curves.variants[1]?.radius || 8}px`;
        }
    }

    if (aiGeneratorBtn) {
        aiGeneratorBtn.addEventListener('click', () => {
            if (aiGeneratorModalOverlay) {
                aiGeneratorModalOverlay.classList.remove('hidden');
                aiGeneratorModalOverlay.classList.add('flex');
            }
            if (aiSetupForm) aiSetupForm.classList.remove('hidden');
            if (aiLoadingView) aiLoadingView.classList.add('hidden');
            if (aiDiffView) aiDiffView.classList.add('hidden');
        });
    }

    if (aiModalCloseBtn) {
        aiModalCloseBtn.addEventListener('click', () => {
            if (aiGeneratorModalOverlay) {
                aiGeneratorModalOverlay.classList.add('hidden');
                aiGeneratorModalOverlay.classList.remove('flex');
            }
        });
    }

    if (aiSeedColor && aiSeedHex) {
        aiSeedColor.addEventListener('input', () => {
            aiSeedHex.value = aiSeedColor.value;
        });
        aiSeedHex.addEventListener('input', () => {
            const hex = aiSeedHex.value.trim();
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                aiSeedColor.value = hex;
            }
        });
    }

    if (aiGenerateRunBtn) {
        aiGenerateRunBtn.addEventListener('click', async () => {
            if (aiSetupForm) aiSetupForm.classList.add('hidden');
            if (aiLoadingView) aiLoadingView.classList.remove('hidden');

            const industry = aiIndustry ? aiIndustry.value : 'SaaS & Tech Enterprise';
            const mood = aiMood ? aiMood.value : 'Clean & Minimalist';
            const seedColor = aiSeedHex ? aiSeedHex.value : '#4f46e5';

            aiProposedState = await runAIGenerator(industry, mood, seedColor);

            if (aiLoadingView) aiLoadingView.classList.add('hidden');
            if (aiDiffView) aiDiffView.classList.remove('hidden');

            renderDiffTable(aiProposedState);
        });
    }

    if (aiDiffBackBtn) {
        aiDiffBackBtn.addEventListener('click', () => {
            if (aiDiffView) aiDiffView.classList.add('hidden');
            if (aiSetupForm) aiSetupForm.classList.remove('hidden');
        });
    }

    if (aiDiffApplyBtn) {
        aiDiffApplyBtn.addEventListener('click', () => {
            if (aiProposedState) {
                styleState = aiProposedState;
                saveState(styleState);

                Object.entries(styleState.typography.groups).forEach(([groupKey, groupState]) => {
                    updateFontLink(groupState.fontFamilyLink, groupKey);
                });

                renderView(activeView);
            }
            if (aiGeneratorModalOverlay) {
                aiGeneratorModalOverlay.classList.add('hidden');
                aiGeneratorModalOverlay.classList.remove('flex');
            }
        });
    }

    // --- About Modal Listeners ---
    if (aboutBtn && aboutModalOverlay) {
        aboutBtn.addEventListener('click', () => {
            aboutModalOverlay.classList.remove('hidden');
            aboutModalOverlay.classList.add('flex');
        });
    }

    aboutModalCloseBtn.addEventListener('click', () => {
        aboutModalOverlay.classList.add('hidden');
        aboutModalOverlay.classList.remove('flex');
    });

    aboutModalOverlay.addEventListener('click', (e) => {
        // Close if the click is on the overlay itself, not the content
        if (e.target === aboutModalOverlay) {
            aboutModalOverlay.classList.add('hidden');
            aboutModalOverlay.classList.remove('flex');
        }
    });

    exportCssBtn.addEventListener('click', () => {
        const css = generateCSS();
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'design-system-styles.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    if (exportJsBtn) {
        exportJsBtn.addEventListener('click', () => {
            const js = generateJS();
            const blob = new Blob([js], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'design-system-components.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    saveBtn.addEventListener('click', () => {
        try {
            const historyJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            const history = historyJSON ? JSON.parse(historyJSON) : [];

            // Create a deep copy of the current state for saving
            const newVersion = {
                savedAt: new Date().toISOString(),
                state: JSON.parse(JSON.stringify(styleState))
            };

            // Add to the beginning of the history
            history.unshift(newVersion);

            // Trim history to max length
            if (history.length > MAX_VERSIONS) {
                history.length = MAX_VERSIONS;
            }

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));

            // Update the UI to show the new version and reset selection
            lastLoadedVersionIndex = 0;
            updateVersionUI();

            // Visual feedback
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saved!';
            saveBtn.disabled = true;
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
        } catch (e) {
            console.error("Failed to save state to localStorage:", e);
            alert('Could not save styles. Local storage might be full or disabled.');
        }
    });

    // --- Initialisation ---
    buildNav();
    Object.entries(styleState.typography.groups).forEach(([groupKey, groupState]) => {
        updateFontLink(groupState.fontFamilyLink, groupKey);
    });
    updateIconLibraryLink(styleState.icons.library);

    // Set initial state of the global dark mode toggle
    setChromeDarkMode(!!styleState.colors.darkMode);

    // Check URL parameters for shareable config load
    checkUrlParameters();

    renderView(activeView);
    updateVersionUI();
});
