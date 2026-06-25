const sampler = {
    handleGenerateSample: async (styleState) => {
        const outputArea = document.getElementById('sampler-output-content');
        const generateBtn = document.getElementById('generate-sample-btn');
        if (!outputArea || !generateBtn) return;

        // --- AI sample generation temporarily disabled (no Gemini API key configured) ---
        // Short-circuits before any network call so nothing hits /api/generate or 500s.
        // To re-enable: set GEMINI_API_KEY in Vercel and remove this block.
        outputArea.innerHTML = `<div class="p-6"><p class="text-center text-gray-500">AI sample generation is currently disabled.</p></div>`;
        return;

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        outputArea.innerHTML = `<div class="p-6"><p class="text-center text-gray-500">AI is thinking... please wait.</p></div>`;

        // 1. Gather user selections from the dropdowns
        const selections = {
            industry: document.getElementById('sampler-select-industry').value,
            content: document.getElementById('sampler-select-content').value,
            style: document.getElementById('sampler-select-style').value,
            mood: document.getElementById('sampler-select-mood').value,
            density: document.getElementById('sampler-select-density').value,
            header: document.getElementById('sampler-select-header').value,
            layout: document.getElementById('sampler-select-layout').value,
            pageBackground: document.getElementById('sampler-select-page-background').value,
            pageBackgroundColor: null,
            pageBackgroundImage: null,
        };
        if (selections.pageBackground === 'Color') selections.pageBackgroundColor = document.getElementById('sampler-color-token-select').value;
        if (selections.pageBackground === 'Image') selections.pageBackgroundImage = document.getElementById('sampler-image-description-input').value;

        // 2. Create a summary of the design tokens.
        let tokenSummary = ":root {\n";
        Object.entries(styleState.colors.groups).forEach(([groupKey, group]) => {
            group.variants.forEach((v, i) => {
                tokenSummary += `  --${groupKey}-${i + 1}: ${v.value};\n`;
            });
        });
        styleState.spacing.variants.forEach((v, i) => {
            tokenSummary += `  --spacing-${getSpacingName(i)}: ${v.value}px;\n`;
        });
        styleState.curves.variants.forEach((v, i) => {
            tokenSummary += `  --border-radius-${i + 1}: ${v.radius}px;\n`;
        });
        Object.entries(styleState.typography.groups).forEach(([groupKey, group]) => {
            group.variants.forEach((variant, index) => {
                const variantName = getVariantName(groupKey, index, group.variants.length);
                tokenSummary += `  /* .text-${variantName} is available */\n`;
            });
        });
        tokenSummary += "}\n";

        // 3. Construct the background instruction for the prompt
        let backgroundInstruction = '';
        if (selections.pageBackground === 'Color' && selections.pageBackgroundColor) {
            backgroundInstruction = `- Page Background: Use the color token var(${selections.pageBackgroundColor}) for the main page background. Determine if text should be light or dark for contrast.`;
        } else if (selections.pageBackground === 'Image' && selections.pageBackgroundImage) {
            backgroundInstruction = `- Page Background: Use a full-page background image that fits the description: "${selections.pageBackgroundImage}". Apply a semi-transparent dark overlay (e.g., linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))) to the image to ensure text is readable. All text on the page should be a light color (e.g., var(--neutrals-1)).`;
        } else { // Follow Mood & Style
            backgroundInstruction = `- Page Background: Choose a background color that fits the selected mood and visual style.`;
        }

        // 3. Construct the prompt for the LLM
        const prompt = `
You are an expert web designer. Your task is to generate the HTML for a sample webpage based on the user's criteria and a provided set of CSS custom properties (design tokens) and utility classes.

**User Criteria:**
- Industry/Topic: ${selections.industry}
- Content Focus: ${selections.content}
- Visual Style: ${selections.style}
- Color Mood: ${selections.mood}
- Information Density: ${selections.density}
- Header Style: ${selections.header}
- Page Layout: ${selections.layout}
${backgroundInstruction}

**Available Design Tokens & Classes:**
You have access to the following CSS variables and classes. Use them to style the page.
\`\`\`css
${tokenSummary}
\`\`\`

**Instructions:**
- Generate ONLY the HTML for the content. Do not include <html>, <head>, or <body> tags.
- The HTML should be structured semantically (e.g., <header>, <main>, <section>, <footer>).
- Use the provided CSS custom properties (e.g., var(--primary-1), var(--spacing-lg)) for all inline styling.
- Use the generated typography classes (e.g., .text-heading-xl, .text-body-md).
- Use the generated button classes (e.g., .btn, .btn-lg, .btn-variant-0).
- Use the generated container/card classes (e.g., .container-variant-0).
- Create a visually appealing and coherent sample page that reflects the user's criteria.
- Use placeholder text (lorem ipsum) and placeholder images (e.g., from unsplash or placeholder.com) where appropriate.
        `;

        // 4. Make the API call (THIS IS A PLACEHOLDER)
        try {
            // Relative path: served by the Vercel function in /api (and by `vercel dev` locally).
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                // Try to get more detailed error from the server's JSON response
                try {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.error || response.statusText}`);
                } catch (e) {
                    // If the response isn't JSON, use the status text
                    throw new Error(`API Error: ${response.statusText}`);
                }
            }

            // The server streams plain text, so we read it as such.
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let generatedHtml = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                generatedHtml += decoder.decode(value, { stream: true });
                outputArea.innerHTML = generatedHtml; // Update in real-time
            }

            outputArea.innerHTML = generatedHtml;

            // Show the fullscreen button now that there's content
            document.getElementById('fullscreen-toggle-btn')?.classList.remove('hidden');

        } catch (error) {
            console.error('Error generating sample:', error);
            let errorMessage = "An unknown error occurred.";
            let errorDetails = "Please check the browser console and server logs for more information.";

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                errorMessage = "Could not connect to the local server.";
                errorDetails = "Please ensure the server is running on port 3000. You may need to stop a previous server process if it's blocking the port (see terminal error EADDRINUSE).";
            } else if (error.message.startsWith('API Error:')) {
                errorMessage = error.message.replace('API Error:', '').trim();
                errorDetails = "This is an error from the AI service, often related to billing or API quota. Please check your Google Cloud project settings and the server console.";
            } else {
                errorMessage = error.message;
            }
            outputArea.innerHTML = `<div class="p-8 text-center"><p class="text-lg font-bold text-red-600">Error Generating Sample</p><p class="mt-2 text-sm text-red-500 bg-red-50 p-3 rounded-sm">${errorMessage}</p><p class="mt-4 text-xs text-gray-500">${errorDetails}</p></div>`;
            document.getElementById('fullscreen-toggle-btn')?.classList.add('hidden');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Sample';
        }
    },
    getHTML: (state) => {
        const categories = {
            industry: { label: 'Industry', options: ['Product Marketing', 'Creative Portfolio', 'E-commerce', 'Financial Services', 'Tech Saas', 'General Services', 'Government', 'Any Industry'] },
            content: { label: 'Content Focus', options: ['Landing Page', 'Product Showcase', 'Image Gallery', 'Dashboard', 'Blog Post or News Article', 'Content Page', 'Sign-up Form', 'Long Form', 'Pricing Table', 'Data Table'] },
            style: { label: 'Visual Style', options: ['Minimalist', 'Brutalist', 'Corporate', 'Neumorphic', 'Flat Design', 'WCAG 2.0 AA', 'Decide for Me'] },
            mood: { label: 'Mood', options: ['Professional', 'Playful', 'Serene', 'Dark & Moody', 'Energetic', 'Decide for Me'] },
            density: { label: 'Density', options: ['Compact', 'Comfortable', 'Spacious'] },
            header: { label: 'Header Style', options: ['Minimal', 'Standard Nav', 'Large & Bold', 'Centered'] },
            layout: { label: 'Page Layout', options: ['Single Column', 'Two-Column', 'Grid Based', 'Hero Section Focus'] },
            'page-background': { label: 'Page Background', options: ['Follow Mood & Style', 'Color', 'Image'] }
        };

        const selectsHTML = Object.entries(categories).map(([key, value]) => `
            <div class="flex-1 min-w-[150px]">
                <label for="sampler-select-${key}" class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">${value.label}</label>
                <div class="relative">
                    <select id="sampler-select-${key}" class="appearance-none block w-full bg-transparent pl-3 pr-8 py-2 text-base border-b border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 sm:text-sm rounded-none h-[38px]">
                        ${value.options.map(opt => `<option>${opt}</option>`).join('')}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
        `).join('');

        // Create options for the conditional color token dropdown
        let colorTokenOptions = '';
        if (state && state.colors && state.colors.groups) {
            Object.entries(state.colors.groups).forEach(([groupKey, group]) => {
                group.variants.forEach((v, i) => {
                    const tokenName = `--${groupKey}-${i + 1}`;
                    colorTokenOptions += `<option value="${tokenName}">${tokenName} (${v.value})</option>`;
                });
            });
        }

        const colorSelectHTML = `
            <div id="sampler-color-select-wrapper" class="flex-1 min-w-[150px] hidden">
                <label for="sampler-color-token-select" class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Select Color</label>
                <div class="relative">
                    <select id="sampler-color-token-select" class="appearance-none block w-full bg-transparent pl-3 pr-8 py-2 text-base border-b border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 sm:text-sm rounded-none h-[38px]">
                        ${colorTokenOptions}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>`;

        const imageInputHTML = `
            <div id="sampler-image-input-wrapper" class="flex-1 min-w-[150px] hidden">
                <label for="sampler-image-description-input" class="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Image Description</label>
                <input id="sampler-image-description-input" type="text" placeholder="e.g., 'serene mountain landscape'" class="block w-full bg-transparent pl-3 py-2 text-base border-b border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 sm:text-sm rounded-none h-[38px]">
            </div>`;

        return `
            <div class="p-6">
                <div class="flex flex-wrap items-end gap-4">
                    ${selectsHTML}
                    ${colorSelectHTML}
                    ${imageInputHTML}
                    <button id="generate-sample-btn" class="bg-gray-800 text-white font-semibold py-2 px-4 rounded-sm hover:bg-gray-700 transition-colors text-sm h-[38px]">Generate Sample</button>
                </div>
            </div>
            <div id="sampler-preview-container" class="relative">
                <button id="fullscreen-toggle-btn" class="absolute top-4 right-4 bg-gray-700 text-white rounded-sm p-2 hover:bg-gray-900 transition z-20 hidden" title="Toggle Fullscreen (Esc to exit)"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 4l-5-5" /></svg></button>
                <div id="sampler-output-content" class="sampler-content-block">
                    <div class="text-center py-20 px-6">
                        <h3 class="text-lg font-bold text-gray-700">AI-Powered Page Sampler</h3>
                        <p class="mt-2 text-sm text-gray-500">Select your desired page characteristics above and click 'Generate Sample'.<br>The AI will create a sample layout using your current design tokens.</p>
                    </div>
                </div>
            </div>
        `;
    }
};