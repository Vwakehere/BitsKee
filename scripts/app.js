/**
 * BitsKee - Main Application
 * Handles UI interactions and coordinates modules.
 */

const App = {
    currentMode: 'pixelate',
    currentAscii: '',
    loadedImage: null,

    /**
     * Initialize the application.
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initDrawCanvas();
        this.setStatus('READY');
    },

    /**
     * Cache DOM elements for performance.
     */
    cacheElements() {
        // Navigation
        this.btnPixelate = document.getElementById('btn-pixelate');
        this.btnDraw = document.getElementById('btn-draw');

        // Panels
        this.panelPixelate = document.getElementById('panel-pixelate');
        this.panelDraw = document.getElementById('panel-draw');

        // Pixelate mode elements
        this.uploadZone = document.getElementById('upload-zone');
        this.uploadPrompt = document.getElementById('upload-prompt');
        this.imageInput = document.getElementById('image-input');
        this.previewCanvas = document.getElementById('preview-canvas');
        this.pixelSizeSlider = document.getElementById('pixel-size-slider');
        this.pixelSizeValue = document.getElementById('pixel-size-value');
        this.colorModeSelect = document.getElementById('color-mode-select');
        this.gridCheckbox = document.getElementById('grid-checkbox');

        // Draw mode elements
        this.drawContainer = document.getElementById('draw-grid-container');
        this.charInput = document.getElementById('char-input');
        this.canvasWidth = document.getElementById('canvas-width');
        this.canvasHeight = document.getElementById('canvas-height');
        this.clearCanvasBtn = document.getElementById('clear-canvas-btn');
        this.asciiKeyboard = document.getElementById('ascii-keyboard');

        // Output
        this.outputContent = document.getElementById('output-content');
        this.outputCanvas = document.getElementById('output-canvas');
        this.outputText = document.getElementById('output-text');
        this.copyBtn = document.getElementById('copy-btn');
        this.downloadBtn = document.getElementById('download-btn');

        // Status
        this.statusText = document.getElementById('status-text');
    },

    /**
     * Bind event listeners.
     */
    bindEvents() {
        // Mode switching
        this.btnPixelate.addEventListener('click', () => this.switchMode('pixelate'));
        this.btnDraw.addEventListener('click', () => this.switchMode('draw'));

        // File upload
        this.uploadZone.addEventListener('click', (e) => {
            if (e.target === this.uploadZone || e.target.closest('.upload-prompt')) {
                this.imageInput.click();
            }
        });
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });
        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('drag-over');
        });
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.processImage(files[0]);
            }
        });

        // Pixelate controls
        this.pixelSizeSlider.addEventListener('input', () => {
            this.pixelSizeValue.textContent = this.pixelSizeSlider.value + 'px';
            if (this.loadedImage) {
                this.pixelateImage();
            }
        });
        this.colorModeSelect.addEventListener('change', () => {
            if (this.loadedImage) {
                this.pixelateImage();
            }
        });
        this.gridCheckbox.addEventListener('change', () => {
            if (this.loadedImage) {
                this.pixelateImage();
            }
        });

        // Draw mode controls
        this.charInput.addEventListener('input', () => {
            DrawingCanvas.setChar(this.charInput.value);
            this.updateKeyboardSelection();
        });
        this.canvasWidth.addEventListener('change', () => this.resizeDrawCanvas());
        this.canvasHeight.addEventListener('change', () => this.resizeDrawCanvas());
        this.clearCanvasBtn.addEventListener('click', () => {
            DrawingCanvas.clear();
        });

        // ASCII Keyboard
        this.asciiKeyboard.addEventListener('click', (e) => {
            if (e.target.classList.contains('key-btn')) {
                const char = e.target.dataset.char || e.target.textContent;
                this.charInput.value = char;
                DrawingCanvas.setChar(char);
                this.updateKeyboardSelection(e.target);
            }
        });

        // Output actions
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.download());
    },

    /**
     * Update ASCII keyboard selection visual.
     */
    updateKeyboardSelection(activeBtn = null) {
        // Remove active from all
        this.asciiKeyboard.querySelectorAll('.key-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (activeBtn) {
            activeBtn.classList.add('active');
        } else {
            // Find matching button
            const currentChar = this.charInput.value;
            this.asciiKeyboard.querySelectorAll('.key-btn').forEach(btn => {
                const btnChar = btn.dataset.char || btn.textContent;
                if (btnChar === currentChar) {
                    btn.classList.add('active');
                }
            });
        }
    },

    /**
     * Switch between pixelate and draw modes.
     * @param {string} mode - 'pixelate' or 'draw'
     */
    switchMode(mode) {
        this.currentMode = mode;

        // Update nav buttons
        this.btnPixelate.classList.toggle('active', mode === 'pixelate');
        this.btnDraw.classList.toggle('active', mode === 'draw');

        // Update panels
        this.panelPixelate.classList.toggle('active', mode === 'pixelate');
        this.panelDraw.classList.toggle('active', mode === 'draw');

        // Update output display
        if (mode === 'draw') {
            this.outputCanvas.classList.add('hidden');
            this.outputText.classList.remove('hidden');
            this.updateDrawOutput();
        } else {
            this.outputText.classList.add('hidden');
            this.outputCanvas.classList.remove('hidden');
        }

        this.setStatus(mode === 'pixelate' ? 'PIXELATE MODE' : 'DRAW MODE');
    },

    /**
     * Handle file selection from input.
     * @param {Event} e - Change event.
     */
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file);
        }
    },

    /**
     * Process an image file for pixelation.
     * @param {File} file - Image file.
     */
    async processImage(file) {
        this.setStatus('LOADING IMAGE...');

        try {
            this.loadedImage = await Pixelator.loadImage(file);

            // Show preview canvas, hide upload prompt
            this.uploadPrompt.classList.add('hidden');
            this.previewCanvas.classList.remove('hidden');

            // Draw original to preview
            this.previewCanvas.width = Math.min(this.loadedImage.width, 300);
            this.previewCanvas.height = (this.loadedImage.height / this.loadedImage.width) * this.previewCanvas.width;
            const ctx = this.previewCanvas.getContext('2d');
            ctx.drawImage(this.loadedImage, 0, 0, this.previewCanvas.width, this.previewCanvas.height);

            this.pixelateImage();
            this.setStatus('IMAGE LOADED');
        } catch (error) {
            console.error('Error loading image:', error);
            this.setStatus('ERROR: ' + error.message);
        }
    },

    /**
     * Pixelate the loaded image.
     */
    pixelateImage() {
        if (!this.loadedImage) return;

        this.setStatus('PIXELATING...');

        const options = {
            pixelSize: parseInt(this.pixelSizeSlider.value, 10),
            colorMode: this.colorModeSelect.value,
            showGrid: this.gridCheckbox.checked
        };

        try {
            Pixelator.pixelate(this.loadedImage, options, this.outputCanvas);
            this.setStatus('PIXELATION COMPLETE');
        } catch (error) {
            console.error('Pixelation error:', error);
            this.setStatus('ERROR: Pixelation failed');
        }
    },

    /**
     * Initialize the drawing canvas with appropriate size for screen.
     */
    initDrawCanvas() {
        // Set mobile-friendly defaults based on screen width
        const isMobile = window.innerWidth <= 600;
        this.canvasWidth.value = isMobile ? 20 : 40;
        this.canvasHeight.value = isMobile ? 15 : 20;
        DrawingCanvas.width = parseInt(this.canvasWidth.value, 10);
        DrawingCanvas.height = parseInt(this.canvasHeight.value, 10);
        DrawingCanvas.init(this.drawContainer);
        this.updateKeyboardSelection();
    },

    /**
     * Resize the drawing canvas.
     */
    resizeDrawCanvas() {
        const width = parseInt(this.canvasWidth.value, 10) || 60;
        const height = parseInt(this.canvasHeight.value, 10) || 30;
        DrawingCanvas.resize(width, height);
        this.updateDrawOutput();
    },

    /**
     * Update output from drawing canvas.
     */
    updateDrawOutput() {
        if (this.currentMode === 'draw') {
            this.currentAscii = DrawingCanvas.getAscii();
            this.outputText.textContent = this.currentAscii;
        }
    },

    /**
     * Copy to clipboard (ASCII text or canvas image).
     */
    async copyToClipboard() {
        try {
            if (this.currentMode === 'draw') {
                if (!this.currentAscii) {
                    this.setStatus('NOTHING TO COPY');
                    return;
                }
                await navigator.clipboard.writeText(this.currentAscii);
                this.setStatus('ASCII COPIED');
            } else {
                // Copy canvas as image
                const blob = await new Promise(resolve => {
                    this.outputCanvas.toBlob(resolve, 'image/png');
                });
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                this.setStatus('IMAGE COPIED');
            }

            // Visual feedback
            this.copyBtn.style.borderColor = 'var(--color-primary)';
            this.copyBtn.style.color = 'var(--color-primary)';
            setTimeout(() => {
                this.copyBtn.style.borderColor = '';
                this.copyBtn.style.color = '';
            }, 1000);
        } catch (error) {
            console.error('Copy failed:', error);
            this.setStatus('COPY FAILED');
        }
    },

    /**
     * Download (ASCII as TXT or canvas as PNG).
     */
    download() {
        if (this.currentMode === 'draw') {
            if (!this.currentAscii) {
                this.setStatus('NOTHING TO DOWNLOAD');
                return;
            }
            const blob = new Blob([this.currentAscii], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bitskee-ascii-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.setStatus('TXT DOWNLOADED');
        } else {
            // Download canvas as PNG
            const a = document.createElement('a');
            a.href = this.outputCanvas.toDataURL('image/png');
            a.download = `bitskee-pixel-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.setStatus('PNG DOWNLOADED');
        }
    },

    /**
     * Set the status text.
     * @param {string} text - Status message.
     */
    setStatus(text) {
        this.statusText.textContent = text;
    }
};

// Make App globally accessible for modules
window.App = App;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
