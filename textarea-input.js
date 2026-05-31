const textAreaInputView = {
    rendersOnStateChange: true,
    getPreviewHTML: (state) => {
        const { textInput: inputState, textAreaInput: areaState } = state;
        const labelClass = inputState.labelToken;
        const inputClass = `form-textarea`;
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
                                <textarea class="${inputClass}" rows="${areaState.rows}" placeholder="${inputState.placeholderText}"></textarea>
                                ${helperTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-textarea</span>
                            </div>
                        </div>
                    </div>
                     <div class="mb-8">
                        <h4 class="pst-preview-heading mb-2">Disabled</h4>
                        <div class="flex items-start">
                            <div style="width: 80%;">
                                <label class="${labelClass}">${inputState.labelText}</label>
                                <textarea class="${inputClass}" rows="${areaState.rows}" placeholder="Cannot edit" disabled></textarea>
                                ${helperTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-textarea:disabled</span>
                            </div>
                        </div>
                    </div>
                     <div class="mb-8">
                        <h4 class="pst-preview-heading mb-2">Error</h4>
                        <div class="flex items-start">
                            <div style="width: 80%;">
                                <label class="${labelClass}">${inputState.labelText}</label>
                                <textarea class="${inputClass} is-error" rows="${areaState.rows}"></textarea>
                                ${errorTextHTML}
                            </div>
                            <div class="flex-grow text-right">
                                <span class="text-xs text-gray-400 ml-4 font-mono whitespace-nowrap">.form-textarea.is-error</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getControlsHTML: (state) => {
        const { textAreaInput: areaState } = state;
        return `
            <div class="pst-control-group">
                <h3 class="pst-control-group-heading">Text Area Styles</h3>
                <div class="pst-control-item pb-8">
                    <p class="text-xs text-gray-500">Text Area shares all global styles with the Text Input component. You can edit those styles in the 'Text' component view.</p>
                </div>
                <div class="pst-control-item">
                    <label>Rows</label>
                    <div class="flex items-center space-x-2">
                        <input data-state-key="textAreaInput.rows" type="range" value="${areaState.rows}" min="2" max="12" step="1" class="flex-grow">
                        <input data-state-key="textAreaInput.rows" type="number" value="${areaState.rows}" min="2" max="12" step="1" class="w-24 text-right bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 text-sm">
                    </div>
                </div>
            </div>
            <div class="mt-8 pt-4 border-t border-gray-200">
                <button id="reset-textarea-input-btn" class="text-sm text-red-600 hover:text-red-800">Reset to Defaults</button>
            </div>
        `;
    }
};