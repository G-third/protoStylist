const selectInputView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { textInput: inputState } = state;
        const labelClass = inputState.labelToken;
        const inputClass = `form-select`;
        const helperTextHTML = inputState.helperText ? `<span class="${inputState.helperToken} form-helper-text">${inputState.helperText}</span>` : '';
        const errorTextHTML = inputState.errorText ? `<span class="${inputState.helperToken} form-helper-text form-error-text">${inputState.errorText}</span>` : '';

        return `
            <div class="mb-12">
                <div class="w-full">
                    <div class="mb-8">
                        <h4 class="pst-preview-heading mb-2">Default</h4>
                        <div class="flex items-start">
                            <div style="width: 80%;">
                                <label class="${labelClass}">${inputState.labelText}</label>
                                <select class="${inputClass}">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                    <option>Option 3</option>
                                </select>
                                ${helperTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-select</span>
                            </div>
                        </div>
                    </div>
                     <div class="mb-8">
                        <h4 class="pst-preview-heading mb-2">Disabled</h4>
                        <div class="flex items-start">
                            <div style="width: 80%;">
                                <label class="${labelClass}">${inputState.labelText}</label>
                                <select class="${inputClass}" disabled>
                                    <option>Option 1</option>
                                </select>
                                ${helperTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-select:disabled</span>
                            </div>
                        </div>
                    </div>
                     <div class="mb-8">
                        <h4 class="pst-preview-heading mb-2">Error</h4>
                        <div class="flex items-start">
                            <div style="width: 80%;">
                                <label class="${labelClass}">${inputState.labelText}</label>
                                <select class="${inputClass} is-error">
                                    <option>Option 1</option>
                                </select>
                                ${errorTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-select.is-error</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Select Input Styles</h3>
                 <div class="pst-control-item">
                    <p class="text-xs text-gray-500">The Select dropdown shares all global styles with the Text Input component. You can edit those styles in the 'Text' component view.</p>
                </div>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500" mt-4">The dropdown arrow icon is automatically inherited from the chosen icon set.</p>
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-400">No specific controls to reset.</p>
            </div>
        `;
    }
};