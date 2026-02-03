/**
 * BitsKee - Drawing Canvas Module
 * Handles freehand ASCII drawing functionality.
 */

const DrawingCanvas = {
    container: null,
    grid: null,
    width: 20,
    height: 20,
    currentChar: '@',
    isDrawing: false,
    cells: [],
    cellWidth: 12,

    /**
     * Initialize the drawing canvas.
     * @param {HTMLElement} container - Container element for the grid.
     */
    init(container) {
        this.container = container;
        this.createGrid();
        this.addEventListeners();
    },

    /**
     * Create the drawing grid.
     */
    createGrid() {
        this.container.innerHTML = '';
        this.cells = [];

        // Calculate cell width based on screen size
        this.cellWidth = window.innerWidth <= 600 ? 14 : 12;

        this.grid = document.createElement('div');
        this.grid.className = 'draw-grid';
        this.grid.style.gridTemplateColumns = `repeat(${this.width}, ${this.cellWidth}px)`;

        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'draw-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.textContent = ' ';
                this.grid.appendChild(cell);
                row.push(cell);
            }
            this.cells.push(row);
        }

        this.container.appendChild(this.grid);
    },

    /**
     * Add event listeners for drawing.
     * Uses event delegation on container to survive grid recreation.
     */
    addEventListeners() {
        // Use event delegation on container - listeners survive grid recreation
        this.container.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('draw-cell')) {
                this.isDrawing = true;
                this.drawCell(e.target);
            }
        });

        this.container.addEventListener('mousemove', (e) => {
            if (this.isDrawing && e.target.classList.contains('draw-cell')) {
                this.drawCell(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        // Touch support with passive: false for preventDefault
        this.container.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.classList.contains('draw-cell')) {
                e.preventDefault();
                this.isDrawing = true;
                this.drawCell(target);
            }
        }, { passive: false });

        this.container.addEventListener('touchmove', (e) => {
            if (this.isDrawing) {
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && target.classList.contains('draw-cell')) {
                    e.preventDefault();
                    this.drawCell(target);
                }
            }
        }, { passive: false });

        this.container.addEventListener('touchend', () => {
            this.isDrawing = false;
        });

        this.container.addEventListener('touchcancel', () => {
            this.isDrawing = false;
        });
    },

    /**
     * Draw a character on a cell.
     * @param {HTMLElement} cell - Target cell element.
     */
    drawCell(cell) {
        cell.textContent = this.currentChar;
        if (this.currentChar !== ' ') {
            cell.classList.add('filled');
        } else {
            cell.classList.remove('filled');
        }
        // Trigger output update
        if (window.App && window.App.updateDrawOutput) {
            window.App.updateDrawOutput();
        }
    },

    /**
     * Set the current drawing character.
     * @param {string} char - Character to draw with.
     */
    setChar(char) {
        this.currentChar = char || ' ';
    },

    /**
     * Resize the canvas.
     * @param {number} width - New width.
     * @param {number} height - New height.
     */
    resize(width, height) {
        this.width = Math.max(10, Math.min(200, width));
        this.height = Math.max(5, Math.min(100, height));
        this.createGrid();
    },

    /**
     * Clear the canvas.
     */
    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y] && this.cells[y][x]) {
                    this.cells[y][x].textContent = ' ';
                    this.cells[y][x].classList.remove('filled');
                }
            }
        }
        if (window.App && window.App.updateDrawOutput) {
            window.App.updateDrawOutput();
        }
    },

    /**
     * Get the current ASCII art from the canvas.
     * @returns {string} ASCII art string.
     */
    getAscii() {
        let ascii = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y] && this.cells[y][x]) {
                    ascii += this.cells[y][x].textContent || ' ';
                }
            }
            ascii += '\n';
        }
        return ascii;
    }
};

// Export for use in other modules
window.DrawingCanvas = DrawingCanvas;
