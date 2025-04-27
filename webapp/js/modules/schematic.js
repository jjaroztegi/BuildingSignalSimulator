/**
 * Manages the schematic editor canvas, including drawing components,
 * handling user interactions (pan, zoom, clicks), and managing component data per floor.
 */
import { fetchComponentsByModel } from "./servlet.js";
import { componentFields } from "./forms.js";

export class SchematicEditor {
    /**
     * Creates an instance of SchematicEditor.
     * @param {string} canvasId - The ID of the HTML canvas element.
     * @param {object} componentModels - An object containing arrays of available component models (e.g., { cables: [], derivadores: [], ... }).
     */
    constructor(canvasId, componentModels) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas element not found:", canvasId);
            return; // Prevent further initialization
        }
        this.ctx = this.canvas.getContext("2d");

        // --- State ---
        this.currentFloor = null; // Start with no floor selected
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false; // Is the mouse button currently down?
        this.dragStarted = false; // Did the mouse move significantly after mousedown?
        this.startX = 0; // Mousedown X coordinate
        this.startY = 0; // Mousedown Y coordinate
        this.lastX = 0; // Previous mousemove X
        this.lastY = 0; // Previous mousemove Y
        this.firstRender = true; // Flag for initial view centering
        this.resizeObserver = null;

        // --- Component Data ---
        // Map<floorNumber, { derivador: string|null, distribuidores: [string|null, string|null], tomasLeft: string[], tomasRight: string[] }>
        this.floorComponents = new Map();
        this.componentModels = this._validateModels(componentModels);
        this.selectedCable = this.componentModels.cables[0] || null; // Default cable

        // --- Layout Constants ---
        this.LAYOUT = {
            GRID_SIZE: 20,
            COMPONENT_SIZE: 40, // Visual size on canvas
            CLICK_AREA_SIZE: 45, // Slightly larger click area
            FLOOR_SPACING: 240,
            DE_X: 0,
            DI_X_OFFSET: 100,
            BT_X_OFFSET_FROM_DI: 80,
            BT_VERTICAL_SPACING: 45,
            CABLE_DE_DI: "10m",
            CABLE_DI_BT: "5m",
            CABLE_INTERFLOOR: "3m",
            PLACEHOLDER_ALPHA: 0.3,
            CONNECTION_LINE_WIDTH: 1.5, // Slightly thinner lines
            COMPONENT_BORDER_WIDTH: 1,
            FONT_SIZE_TYPE: 11, // Adjusted font sizes
            FONT_SIZE_MODEL: 9,
            FONT_SIZE_LABEL: 10,
            FONT_SIZE_FLOOR: 13,
            DRAG_THRESHOLD: 5, // Increased threshold
        };

        // --- Colors ---
        this.COLORS = {
            bt: { light: "#4CAF50", dark: "#66BB6A" }, // Green
            di: { light: "#2196F3", dark: "#42A5F5" }, // Blue
            de: { light: "#FFC107", dark: "#FFCA28" }, // Amber
            cable: { light: "#757575", dark: "#9E9E9E" }, // Adjusted gray
            textLightBg: { light: "#FFFFFF", dark: "#FFFFFF" }, // White text on components
            textDarkBg: { light: "#424242", dark: "#E0E0E0" }, // Darker text on light bg
            placeholderStroke: { light: "#BDBDBD", dark: "#757575" },
            placeholderFill: { light: "rgba(224, 224, 224, 0.1)", dark: "rgba(97, 97, 97, 0.1)" },
            componentStroke: { light: "rgba(0, 0, 0, 0.3)", dark: "rgba(255, 255, 255, 0.2)" },
            grid: { light: "rgba(0, 0, 0, 0.08)", dark: "rgba(255, 255, 255, 0.08)" },
            tempMessageBg: { light: "#FFF9C4", dark: "#424242" }, // Lighter Yellow / Dark Grey
            tempMessageBorder: { light: "#FBC02D", dark: "#616161" },
            tempMessageText: { light: "#5D4037", dark: "#CFD8DC" },
        };

        requestAnimationFrame(() => {
            this.initializeCanvas();
            this.setupEventListeners();
            this.render();
        });
    }

    // --- Helper Methods ---

    /** Validates and ensures component models are arrays. */
    _validateModels(models) {
        const validated = { cables: [], derivadores: [], distribuidores: [], tomas: [] };
        for (const key in validated) {
            if (models && Array.isArray(models[key])) {
                validated[key] = models[key];
            } else {
                console.warn(`Component models for '${key}' are missing or not an array.`);
            }
        }
        return validated;
    }

    /** Gets the appropriate color based on the current theme. */
    _getColor(name, theme) {
        const themeKey = theme || (document.documentElement.classList.contains("dark") ? "dark" : "light");
        return this.COLORS[name]?.[themeKey] || "#CCCCCC"; // Fallback color
    }

    /** Creates a default structure for storing components on a floor. */
    _createEmptyFloorData() {
        return {
            derivador: null,
            distribuidores: [null, null], // [Left, Right]
            tomasLeft: [],
            tomasRight: [],
        };
    }

    /** (Re)Initializes the schematic editor models */
    updateModels(newModels) {
        this.componentModels = this._validateModels(newModels);
        // Update selected cable if the current one is no longer valid
        if (!this.componentModels.cables.includes(this.selectedCable)) {
            this.selectedCable = this.componentModels.cables[0] || null;
        }
        console.log("Schematic models updated:", this.componentModels);
        // Optional: Force a re-render if model changes should immediately affect visuals
        // this.render();
    }

    /** Initializes canvas size, DPR, and ResizeObserver. */
    initializeCanvas() {
        const updateCanvasSize = () => {
            if (!this.canvas || !this.canvas.parentElement) return;
            const rect = this.canvas.parentElement.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return; // Skip if hidden

            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.resetTransform();
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;

            if (this.firstRender) {
                this.resetView();
                this.firstRender = false;
            }
            this.render(); // Render after size update
        };

        updateCanvasSize(); // Initial call

        if (!this.resizeObserver && this.canvas.parentElement) {
            this.resizeObserver = new ResizeObserver(updateCanvasSize);
            this.resizeObserver.observe(this.canvas.parentElement);
        }
    }

    /** Sets up event listeners. */
    setupEventListeners() {
        if (!this.canvas) return;
        // Use bound methods for listeners to ensure correct 'this' context
        this.canvas.addEventListener("mousedown", this._handleMouseDown);
        window.addEventListener("mousemove", this._handleMouseMove); // Use window to capture moves outside canvas
        window.addEventListener("mouseup", this._handleMouseUp); // Use window to capture mouseup outside canvas
        this.canvas.addEventListener("mouseleave", this._handleMouseLeave); // Reset cursor if mouse leaves
        this.canvas.style.cursor = "grab";
        this.canvas.addEventListener("wheel", this._handleWheel, { passive: false }); // Prevent page scroll
    }

    // --- Event Handlers (Bound methods using arrow functions for correct 'this') ---
    _handleMouseDown = (e) => {
        // console.log("Schematic MouseDown");
        if (e.button !== 0) return; // Only react to left mouse button
        this.isDragging = true; // Mouse button is down
        this.dragStarted = false; // Drag hasn't started yet
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvas.style.cursor = "grabbing";
    };

    _handleMouseMove = (e) => {
        if (this.isDragging) {
            // Only consider it a drag if moved beyond a threshold *after* mousedown
            if (
                !this.dragStarted &&
                (Math.abs(e.clientX - this.startX) > this.LAYOUT.DRAG_THRESHOLD ||
                    Math.abs(e.clientY - this.startY) > this.LAYOUT.DRAG_THRESHOLD)
            ) {
                this.dragStarted = true; // Mark as dragged
                // console.log("Schematic Dragging Started");
            }

            // If dragging has started, perform pan
            if (this.dragStarted) {
                const deltaX = e.clientX - this.lastX;
                const deltaY = e.clientY - this.lastY;
                this.offsetX += deltaX;
                this.offsetY += deltaY;
                this.render(); // Re-render during pan
            }

            // Always update last position for next delta calculation
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        }
    };

    _handleMouseUp = (e) => {
        // console.log(`Schematic MouseUp. isDragging: ${this.isDragging}, dragStarted: ${this.dragStarted}`);
        if (e.button !== 0) return; // Only react to left mouse button release

        // Check if the mouseup event occurred over the canvas itself
        let isOverCanvas = false;
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            isOverCanvas =
                e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        }

        if (this.isDragging) {
            // Only process as a click if mouseup is over the canvas AND it wasn't a significant drag
            if (isOverCanvas && !this.dragStarted) {
                // console.log("Processing as Click");
                this._handleClick(e);
            } else {
                // console.log("Ending Drag or Click Outside Canvas");
            }
        }
        // Reset dragging state regardless of where mouseup occurred
        this.isDragging = false;
        this.dragStarted = false;
        if (this.canvas) this.canvas.style.cursor = "grab"; // Reset cursor if canvas exists
    };

    _handleMouseLeave = () => {
        // Reset cursor if mouse leaves the canvas
        if (this.canvas) this.canvas.style.cursor = "grab";
    };

    _handleWheel = (e) => {
        // console.log("Schematic Wheel");
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        const zoomFactor = 1.1;
        const zoom = delta > 0 ? zoomFactor : 1 / zoomFactor;
        this._zoomTowardsPoint(zoom, e.clientX, e.clientY);
    };

    /** Handles click events on the canvas to detect component clicks. */
    _handleClick = (e) => {
        // console.log("Executing _handleClick");
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        // Calculate click coordinates in canvas world space
        const clickX = (e.clientX - rect.left - this.offsetX) / this.scale;
        const clickY = (e.clientY - rect.top - this.offsetY) / this.scale;
        // console.log(`Click Coordinates (World): x=${clickX.toFixed(1)}, y=${clickY.toFixed(1)}`);

        const sortedFloors = this._getSortedFloorNumbers();
        // console.log(`Sorted floors: [${sortedFloors.join(', ')}]`);
        for (let i = 0; i < sortedFloors.length; i++) {
            const floor = sortedFloors[i];
            const floorY = this._getFloorCenterY(i);
            const clickableAreas = this._getClickableAreas(floor, floorY);
            // console.log(`Checking Floor ${floor} (Index ${i}, Y=${floorY.toFixed(1)}) with ${clickableAreas.length} areas.`);

            for (const area of clickableAreas) {
                if (this._isPointInArea(clickX, clickY, area)) {
                    // console.log(`--> Hit detected on Floor ${floor}, Area Type: ${area.type}, Position: ${area.positionIndex}`);
                    // console.log(`    Current Active Floor in Editor: ${this.currentFloor}`);

                    // *** Floor Activation Check ***
                    if (this.currentFloor === null) {
                        console.warn("Interaction prevented: No floor selected in the UI.");
                        this._showTemporaryMessage(
                            "Seleccione un piso en el panel izquierdo para editar.",
                            e.clientX,
                            e.clientY,
                        );
                        return; // Prevent interaction
                    }
                    if (this.currentFloor !== floor) {
                        console.warn(
                            `Interaction prevented: Clicked on Floor ${floor}, but active floor is ${this.currentFloor}.`,
                        );
                        this._showTemporaryMessage(
                            `Seleccione el Piso ${this.currentFloor} para editarlo, o cambie al Piso ${floor}.`,
                            e.clientX,
                            e.clientY,
                        );
                        return; // Prevent interaction
                    }

                    // If checks pass, show the selector
                    // console.log(`Proceeding to show selector for Type: ${area.type}, Floor: ${floor}, Position: ${area.positionIndex}`);
                    this._showComponentSelector(area.type, floor, area.positionIndex, e, area.slotIndex);
                    return; // Stop after finding the first hit
                }
            }
        }
        // console.log("No component area hit.");
    };

    // --- Zoom/Pan Helpers ---
    _zoomTowardsPoint(factor, clientX, clientY) {
        if (!this.canvas) return;
        const newScale = this.scale * factor;
        if (newScale < 0.1 || newScale > 5) return; // Clamp zoom

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left; // Mouse position relative to canvas element
        const mouseY = clientY - rect.top;

        // Adjust offset to keep the point under the mouse stationary
        this.offsetX = mouseX - (mouseX - this.offsetX) * factor;
        this.offsetY = mouseY - (mouseY - this.offsetY) * factor;
        this.scale = newScale;
        this.render();
    }

    /** Resets the view (zoom and pan) to the default centered state. */
    resetView() {
        if (!this.canvas) return;
        this.scale = 1;
        const rect = this.canvas.getBoundingClientRect();
        // Center horizontally, position vertically near the top
        this.offsetX = rect.width / 2;
        this.offsetY = this.LAYOUT.COMPONENT_SIZE * 2; // Initial vertical offset
        this.render();
    }

    /** Clears all components from the schematic and resets the view. */
    clearSchematic() {
        this.floorComponents.clear();
        this.currentFloor = null;
        this.resetView();

        // Re-render the empty schematic
        this.render();

        console.log("Schematic cleared");
    }

    /** Applies a zoom factor centered on the canvas view. */
    zoom(factor) {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this._zoomTowardsPoint(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    // --- Component Management ---

    /** Sets the currently active floor. Ensures floor data exists. */
    setCurrentFloor(floor) {
        // Allow setting to null
        if (floor === null) {
            this.currentFloor = null;
            console.log("Current floor set to null (no floor selected)");
            return;
        }
        // Validate if it's a number
        if (typeof floor === "number" && floor > 0) {
            this.currentFloor = floor;
            // Ensure floor data object exists when a floor is selected
            if (!this.floorComponents.has(floor)) {
                this.floorComponents.set(floor, this._createEmptyFloorData());
                // Re-render if adding a floor structure changed the layout needs
                this.render();
            }
            console.log("Current floor set to:", this.currentFloor);
        } else {
            console.warn("Invalid floor number provided:", floor);
            // Optionally reset currentFloor if invalid value received?
            // this.currentFloor = null;
        }
    }

    /** Sets the cable type. */
    setCableType(type) {
        if (this.componentModels.cables.includes(type)) {
            this.selectedCable = type;
            console.log("Selected cable type:", this.selectedCable);
        } else if (type === null || type === undefined || type === "") {
            this.selectedCable = null; // Allow clearing cable selection
            console.log("Cable type cleared.");
        } else {
            console.warn(`Invalid cable type ${type} provided.`);
        }
    }

    _setComponentValue(floor, type, positionIndex, model) {
        if (floor === null || !this.floorComponents.has(floor)) {
            console.error("Cannot set component: Floor data not found for", floor);
            return false;
        }
        // Allow model to be null (for removal)
        if (model !== null) {
            // Validate model exists for the given type
            const validModels = {
                DE: this.componentModels.derivadores,
                DI: this.componentModels.distribuidores,
            }[type];
            if (!validModels || !validModels.includes(model)) {
                console.error(`Invalid model '${model}' for type '${type}'.`);
                return false;
            }
        }

        const floorData = this.floorComponents.get(floor);
        let changed = false;

        switch (type) {
            case "DE":
                if (floorData.derivador !== model) {
                    floorData.derivador = model;
                    changed = true;
                    console.log(`Set Floor ${floor} DE to: ${model}`);
                }
                break;
            case "DI":
                if (positionIndex === 0 || positionIndex === 1) {
                    if (floorData.distribuidores[positionIndex] !== model) {
                        floorData.distribuidores[positionIndex] = model;
                        // Clear associated tomas if DI is removed
                        if (model === null) {
                            if (positionIndex === 0 && floorData.tomasLeft.length > 0) {
                                floorData.tomasLeft = [];
                                console.log(`Cleared Floor ${floor} Left Tomas due to DI removal.`);
                            } else if (positionIndex === 1 && floorData.tomasRight.length > 0) {
                                floorData.tomasRight = [];
                                console.log(`Cleared Floor ${floor} Right Tomas due to DI removal.`);
                            }
                        }
                        changed = true;
                        console.log(`Set Floor ${floor} DI[${positionIndex}] to: ${model}`);
                    }
                } else {
                    console.error(`Invalid positionIndex ${positionIndex} for DI.`);
                    return false;
                }
                break;
            case "BT":
                console.error("_setComponentValue should not be called directly for BT type. Use _setSingleTomaModel.");
                return false;
            default:
                console.error("Unknown component type:", type);
                return false;
        }

        if (changed) {
            this.render();
        }
        return changed;
    }

    /** Sets or removes the model for a single Toma at a specific slot. */
    _setSingleTomaModel(floor, sideIndex, slotIndex, model) {
        if (!this.floorComponents.has(floor)) {
            console.error(`Cannot set toma: Floor ${floor} data not found.`);
            return false;
        }
        if (slotIndex < 0 || slotIndex > 3) {
            console.error(`Invalid toma slotIndex: ${slotIndex}. Must be 0-3.`);
            return false;
        }
        if (model !== null && !this.componentModels.tomas.includes(model)) {
            console.error(`Invalid toma model: ${model}`);
            return false;
        }

        const floorData = this.floorComponents.get(floor);
        const tomasArray = sideIndex === 0 ? floorData.tomasLeft : floorData.tomasRight;

        // Pad array with nulls if necessary
        while (tomasArray.length <= slotIndex) {
            tomasArray.push(null);
        }

        // Set the model (or null to remove)
        if (tomasArray[slotIndex] !== model) {
            tomasArray[slotIndex] = model;
            console.log(`Set Floor ${floor} ${sideIndex === 0 ? "Left" : "Right"} Toma[${slotIndex}] to: ${model}`);

            // Trim trailing nulls for accurate length tracking
            while (tomasArray.length > 0 && tomasArray[tomasArray.length - 1] === null) {
                tomasArray.pop();
            }
            console.log(` -> Updated Tomas Array (${sideIndex === 0 ? "Left" : "Right"}):`, tomasArray);

            this.render();
            return true;
        }
        return false; // No change
    }

    /** Retrieves component data for a specific floor. */
    getFloorComponents(floor) {
        return this.floorComponents.get(floor);
    }

    /** Retrieves all component data, formatted for simulation. */
    getAllComponents() {
        const floorsData = {};
        for (const [floor, data] of this.floorComponents.entries()) {
            // Only include floors that have *any* component placed
            if (
                data.derivador ||
                data.distribuidores.some((d) => d !== null) ||
                data.tomasLeft.length > 0 ||
                data.tomasRight.length > 0
            ) {
                floorsData[floor] = {
                    // Ensure all keys exist, even if null/empty, for consistent structure
                    derivador: data.derivador || null,
                    distribuidores: data.distribuidores, // Keep as [model|null, model|null]
                    tomasLeft: data.tomasLeft,
                    tomasRight: data.tomasRight,
                };
            }
        }
        return {
            cable: this.selectedCable, // Include the selected cable type
            floors: floorsData,
        };
    }

    // --- Click Handling and Component Selection ---

    /** Gets the Y coordinate for the center of a floor based on its index. */
    _getFloorCenterY(index) {
        // Ensure floors are drawn top-down, index 0 is the highest floor visually
        return index * this.LAYOUT.FLOOR_SPACING;
    }

    /** Gets the X coordinate for DI components. */
    _getDiX(positionIndex) {
        // 0 for left, 1 for right
        const sign = positionIndex === 0 ? -1 : 1;
        return this.LAYOUT.DE_X + sign * this.LAYOUT.DI_X_OFFSET;
    }

    /** Gets the X coordinate for the center of a BT group. */
    _getBtGroupX(positionIndex) {
        // 0 for left, 1 for right
        const diX = this._getDiX(positionIndex);
        const sign = positionIndex === 0 ? -1 : 1;
        return diX + sign * this.LAYOUT.BT_X_OFFSET_FROM_DI;
    }

    /** Calculates clickable areas for a floor, including individual BT slots. */
    _getClickableAreas(floor, floorY) {
        const areas = [];
        const { COMPONENT_SIZE, DE_X } = this.LAYOUT;

        // Derivador (DE)
        areas.push({ type: "DE", x: DE_X, y: floorY, floor: floor, positionIndex: 0, size: COMPONENT_SIZE });

        // Distribuidores (DI) - Left and Right
        for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
            // sideIndex = 0 (Left), sideIndex = 1 (Right)
            const diX = this._getDiX(sideIndex);
            areas.push({ type: "DI", x: diX, y: floorY, floor: floor, positionIndex: sideIndex, size: COMPONENT_SIZE });

            // Tomas (BT) - Create 4 distinct areas per side
            const btGroupX = this._getBtGroupX(sideIndex);
            for (let slotIndex = 0; slotIndex < 4; slotIndex++) {
                const btSlotY = this._getBtSlotY(floorY, slotIndex);
                areas.push({
                    type: "BT",
                    x: btGroupX,
                    y: btSlotY,
                    floor: floor,
                    positionIndex: sideIndex, // 0=Left, 1=Right
                    slotIndex: slotIndex, // 0, 1, 2, 3
                    size: COMPONENT_SIZE,
                });
            }
        }
        return areas;
    }

    /** Calculates the Y coordinate for a specific BT slot index */
    _getBtSlotY(floorY, slotIndex) {
        // Calculate center of the 4-slot stack (midpoint between slot 1 and 2)
        const stackCenterY = floorY;
        // Calculate offset from the center based on slot index (0-3) and spacing
        // Indices 0, 1, 2, 3 correspond to offsets -1.5, -0.5, +0.5, +1.5 times the spacing
        const offsetMultiplier = slotIndex - 1.5;
        return stackCenterY + offsetMultiplier * this.LAYOUT.BT_VERTICAL_SPACING;
    }

    /** Checks if a point is within a component's clickable area. */
    _isPointInArea(px, py, area) {
        const halfSize = (area.size || this.LAYOUT.COMPONENT_SIZE) / 2; // Use specific size if provided
        return px >= area.x - halfSize && px <= area.x + halfSize && py >= area.y - halfSize && py <= area.y + halfSize;
    }

    /** Displays the appropriate component selection popup. Handles individual BTs now. */
    _showComponentSelector(type, floor, positionOrSideIndex, event, slotIndex = null) {
        this.removeExistingPopups();

        const popup = document.createElement("div");
        popup.id = "component-selector-popup";
        popup.className =
            "fixed z-50 p-4 bg-white rounded-lg shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
        popup.style.left = `${event.clientX + 10}px`;
        popup.style.top = `${event.clientY + 5}px`;
        popup.style.minWidth = "200px";

        let titleText = "";
        let models = [];
        let currentModel = null;
        let modelSetter = null;
        let removalHandler = null;
        let apiType = "";

        const floorData = this.floorComponents.get(floor);
        if (!floorData) {
            console.error("Cannot show selector: Floor data missing for floor", floor);
            return;
        }

        switch (type) {
            case "DE":
                titleText = "Seleccionar Derivador";
                models = this.componentModels.derivadores;
                currentModel = floorData.derivador;
                modelSetter = (model) => this._setComponentValue(floor, "DE", 0, model);
                removalHandler = () => this._setComponentValue(floor, "DE", 0, null);
                apiType = "derivador";
                break;
            case "DI":
                const sideLabelDI = positionOrSideIndex === 0 ? "Izquierda" : "Derecha";
                titleText = `Seleccionar Distribuidor (${sideLabelDI})`;
                models = this.componentModels.distribuidores;
                currentModel = floorData.distribuidores[positionOrSideIndex];
                modelSetter = (model) => this._setComponentValue(floor, "DI", positionOrSideIndex, model);
                removalHandler = () => this._setComponentValue(floor, "DI", positionOrSideIndex, null);
                apiType = "distribuidor";
                break;
            case "BT":
                if (slotIndex === null || slotIndex < 0 || slotIndex > 3) {
                    console.error("Invalid slotIndex for BT selector:", slotIndex);
                    return;
                }
                const sideIndex = positionOrSideIndex;
                const sideLabelBT = sideIndex === 0 ? "Izquierda" : "Derecha";
                titleText = `Seleccionar Toma (${sideLabelBT}, Slot ${slotIndex + 1})`; // User-friendly 1-based index
                models = this.componentModels.tomas;
                const currentTomasArray = sideIndex === 0 ? floorData.tomasLeft : floorData.tomasRight;
                currentModel = currentTomasArray[slotIndex] || null; // Get model at specific index, or null
                modelSetter = (model) => this._setSingleTomaModel(floor, sideIndex, slotIndex, model);
                removalHandler = () => this._setSingleTomaModel(floor, sideIndex, slotIndex, null); // Set to null to remove
                apiType = "toma";
                break;
            default:
                console.error("Unknown component type for selector:", type);
                return;
        }

        // --- Build Popup DOM ---
        const title = document.createElement("h3");
        title.className = "text-lg font-medium mb-3 text-gray-900 dark:text-white";
        title.textContent = titleText;
        popup.appendChild(title);

        const list = document.createElement("div");
        list.className = "max-h-60 overflow-y-auto mb-2 -mr-2 pr-2";

        if (!models || models.length === 0) {
            const message = document.createElement("p");
            message.className = "text-sm text-gray-500 dark:text-gray-400 px-3 py-1";
            message.textContent = "No hay modelos disponibles.";
            list.appendChild(message);
        } else {
            models.forEach((model) => {
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "flex items-center mb-1";

                const button = document.createElement("button");
                button.type = "button";
                button.className = `flex-grow text-left px-3 py-1.5 text-sm rounded-l transition-colors duration-150 ${
                    model === currentModel
                        ? "bg-primary-100 dark:bg-primary-700 font-medium text-primary-700 dark:text-primary-100"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`;
                button.textContent = model;
                button.onclick = () => {
                    if (modelSetter) modelSetter(model);
                    this.removeExistingPopups();
                };

                const infoButton = document.createElement("button");
                infoButton.type = "button";
                infoButton.className = `p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-r transition-colors duration-150 ${
                    model === currentModel
                        ? "bg-primary-100 dark:bg-primary-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`;
                infoButton.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`;

                // Handle info button click
                infoButton.onclick = async (e) => {
                    e.stopPropagation();
                    try {
                        const componentData = await fetchComponentsByModel(apiType, model);
                        this._showComponentDetails(componentData, type, model, e);
                    } catch (error) {
                        console.error("Error fetching component details:", error);
                    }
                };

                buttonContainer.appendChild(button);
                buttonContainer.appendChild(infoButton);
                list.appendChild(buttonContainer);
            });
        }
        popup.appendChild(list);

        // --- Add Remove/Cancel Buttons ---
        const buttonContainer = document.createElement("div");
        buttonContainer.className =
            "flex justify-between items-center pt-3 mt-1 border-t border-gray-200 dark:border-gray-700";

        if (currentModel !== null && removalHandler) {
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Quitar";
            removeButton.className =
                "text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30";
            removeButton.onclick = () => {
                removalHandler();
                this.removeExistingPopups();
            };
            buttonContainer.appendChild(removeButton);
        } else {
            buttonContainer.appendChild(document.createElement("div")); // Placeholder
        }

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancelar";
        cancelButton.className =
            "text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1 rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500";
        cancelButton.onclick = () => this.removeExistingPopups();
        buttonContainer.appendChild(cancelButton);

        popup.appendChild(buttonContainer);

        document.body.appendChild(popup);
        this._addOutsideClickListener();
    }

    /** Shows component details in a popup */
    _showComponentDetails(componentData, type, model, event) {
        const detailsPopup = document.createElement("div");
        detailsPopup.id = "component-details-popup";
        detailsPopup.className =
            "fixed z-50 p-4 bg-white rounded-lg shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700";

        // Position the popup to the right of the info button
        detailsPopup.style.left = `${event.clientX + 30}px`;
        detailsPopup.style.top = `${event.clientY - 10}px`;
        detailsPopup.style.minWidth = "220px";

        // Title
        const title = document.createElement("h3");
        title.className = "text-base font-medium mb-3 text-gray-900 dark:text-white flex items-center justify-between";
        title.innerHTML = `
            <span>Detalles de ${model}</span>
            <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" onclick="this.closest('#component-details-popup').remove()">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        detailsPopup.appendChild(title);

        // Details content
        const content = document.createElement("div");
        content.className = "space-y-2 text-sm";

        // Add cost (common to all components)
        content.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Costo:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">${componentData.costo?.toFixed(2) ?? "-"} €</span>
            </div>
        `;

        // Get the API type based on the internal type
        const apiType =
            type === "DE" ? "derivador" : type === "DI" ? "distribuidor" : type === "BT" ? "toma" : "coaxial";

        // Add component-specific properties using componentFields
        if (componentFields[apiType]) {
            componentFields[apiType].forEach((field) => {
                content.innerHTML += `
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-gray-400">${field.label.replace(" (dB)", "").replace(" (dB/100m)", "")}:</span>
                        <span class="font-medium text-gray-800 dark:text-gray-200">
                            ${componentData[field.name]?.toFixed(field.step === "0.01" ? 2 : 1) ?? "-"}
                            ${field.label.includes("dB/100m") ? " dB/100m" : field.label.includes("dB") ? " dB" : ""}
                        </span>
                    </div>
                `;
            });
        }

        detailsPopup.appendChild(content);
        document.body.appendChild(detailsPopup);

        // Add click outside listener for this popup
        const handleOutsideClick = (e) => {
            if (!detailsPopup.contains(e.target) && !e.target.closest('button[type="button"]')) {
                detailsPopup.remove();
                document.removeEventListener("click", handleOutsideClick);
            }
        };

        // Delay adding the listener to prevent immediate closing
        setTimeout(() => {
            document.addEventListener("click", handleOutsideClick);
        }, 0);
    }

    /** Adds a listener to close popups when clicking outside. */
    _addOutsideClickListener() {
        // Use timeout to prevent the initiating click from closing the popup
        setTimeout(() => {
            // Use a named function reference for easy removal
            document.addEventListener("click", this._handleOutsideClick, { capture: true, once: true });
        }, 0);
    }

    /** Event handler for clicks outside the popup. */
    _handleOutsideClick = (event) => {
        const popup1 = document.getElementById("component-selector-popup");
        const tempMsg = document.getElementById("schematic-temp-message");
        let clickedInsidePopup = false;

        if (popup1 && popup1.contains(event.target)) clickedInsidePopup = true;
        if (tempMsg && tempMsg.contains(event.target)) clickedInsidePopup = true; // Ignore clicks on temp message

        if (!clickedInsidePopup) {
            this.removeExistingPopups();
        } else {
            // If click was inside, re-add the listener for the *next* click outside
            document.addEventListener("click", this._handleOutsideClick, { capture: true, once: true });
        }
    };

    /** Removes any active component selection popups and temporary messages. */
    removeExistingPopups() {
        ["component-selector-popup", "component-details-popup", "schematic-temp-message"].forEach((id) => {
            document.getElementById(id)?.remove();
        });
        // Clean up the outside click listener just in case it's still attached
        document.removeEventListener("click", this._handleOutsideClick, { capture: true });
    }

    /** Helper to show a temporary message near the click */
    _showTemporaryMessage(message, x, y) {
        this.removeExistingPopups(); // Remove other popups first
        const msgDiv = document.createElement("div");
        msgDiv.id = "schematic-temp-message";
        msgDiv.style.position = "fixed";
        msgDiv.style.left = `${x + 15}px`;
        msgDiv.style.top = `${y + 5}px`;
        msgDiv.style.padding = "8px 12px";
        msgDiv.style.background = this._getColor("tempMessageBg");
        msgDiv.style.color = this._getColor("tempMessageText");
        msgDiv.style.border = `1px solid ${this._getColor("tempMessageBorder")}`;
        msgDiv.style.borderRadius = "4px";
        msgDiv.style.fontSize = "12px";
        msgDiv.style.zIndex = "100"; // Ensure it's on top
        msgDiv.style.pointerEvents = "none"; // Don't let it interfere with future clicks
        msgDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        msgDiv.textContent = message;
        document.body.appendChild(msgDiv);

        // Remove after a few seconds
        setTimeout(() => {
            // Check if it still exists before removing (might have been removed by another action)
            document.getElementById("schematic-temp-message")?.remove();
        }, 2500); // Remove after 2.5 seconds
    }

    // --- Drawing Methods ---

    /** Draws a component or its placeholder. */
    _drawComponent(type, x, y, model = null, isActiveFloor = false) {
        this.ctx.save();
        const { COMPONENT_SIZE, COMPONENT_BORDER_WIDTH, FONT_SIZE_TYPE, FONT_SIZE_MODEL } = this.LAYOUT;
        const halfSize = COMPONENT_SIZE / 2;
        const scaledLineWidth = Math.max(0.5, COMPONENT_BORDER_WIDTH / this.scale); // Ensure minimum line width
        const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";

        this.ctx.lineWidth = scaledLineWidth;

        // Highlight if it's on the active floor
        if (isActiveFloor) {
            this.ctx.shadowColor = theme === "dark" ? "rgba(56, 189, 248, 0.7)" : "rgba(2, 132, 199, 0.5)"; // primary-400 / primary-600 based glow
            this.ctx.shadowBlur = 8 / this.scale; // Adjust blur with scale
        }

        if (model) {
            this.ctx.fillStyle = this._getColor(type.toLowerCase(), theme);
            this.ctx.strokeStyle = this._getColor("componentStroke", theme);

            this.ctx.beginPath();
            this.ctx.rect(x - halfSize, y - halfSize, COMPONENT_SIZE, COMPONENT_SIZE);
            this.ctx.fill();
            this.ctx.stroke();

            // Reset shadow after drawing the main shape if applied
            if (isActiveFloor) {
                this.ctx.shadowColor = "transparent";
                this.ctx.shadowBlur = 0;
            }

            // Draw text
            this.ctx.fillStyle = this._getColor("textLightBg", theme);
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            const typeFontSize = FONT_SIZE_TYPE / this.scale;
            const modelFontSize = FONT_SIZE_MODEL / this.scale;

            this.ctx.font = `bold ${typeFontSize}px sans-serif`;
            this.ctx.fillText(type, x, y - typeFontSize * 0.35);
            this.ctx.font = `${modelFontSize}px sans-serif`;
            const maxTextWidth = COMPONENT_SIZE * 0.9;
            let displayText = model;
            if (this.ctx.measureText(displayText).width > maxTextWidth && model.length > 6) {
                displayText = model.substring(0, 5) + "...";
            }
            this.ctx.fillText(displayText, x, y + typeFontSize * 0.45);
        } else {
            this.ctx.strokeStyle = this._getColor("placeholderStroke", theme);
            this.ctx.fillStyle = this._getColor("placeholderFill", theme);
            this.ctx.setLineDash([3 / this.scale, 3 / this.scale]);

            this.ctx.beginPath();
            this.ctx.rect(x - halfSize, y - halfSize, COMPONENT_SIZE, COMPONENT_SIZE);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Reset shadow after drawing the placeholder shape if applied
            if (isActiveFloor) {
                this.ctx.shadowColor = "transparent";
                this.ctx.shadowBlur = 0;
            }

            this.ctx.font = `bold ${FONT_SIZE_TYPE / this.scale}px sans-serif`;
            this.ctx.fillStyle = this._getColor("placeholderStroke", theme);
            this.ctx.globalAlpha = 0.6;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(type, x, y);
            this.ctx.globalAlpha = 1.0;
        }
        this.ctx.restore();
    }

    /** Draws all elements for a single floor. */
    _drawFloor(floor, floorY, floorData, isCurrentActive) {
        if (!floorData) return;

        const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        const { DE_X, FONT_SIZE_FLOOR, COMPONENT_SIZE } = this.LAYOUT;
        const leftDIX = this._getDiX(0);
        const rightDIX = this._getDiX(1);
        const leftBTGroupX = this._getBtGroupX(0);
        const rightBTGroupX = this._getBtGroupX(1);

        // Draw Components (DE, DI)
        this._drawComponent("DE", DE_X, floorY, floorData.derivador, isCurrentActive);
        this._drawComponent("DI", leftDIX, floorY, floorData.distribuidores[0], isCurrentActive);
        this._drawComponent("DI", rightDIX, floorY, floorData.distribuidores[1], isCurrentActive);

        // Draw Tomas (BT) - 4 vertical slots per side
        this._drawTomasSide(leftBTGroupX, floorY, floorData.tomasLeft, isCurrentActive);
        this._drawTomasSide(rightBTGroupX, floorY, floorData.tomasRight, isCurrentActive);

        // Draw Connections
        this._drawFloorConnections(leftDIX, rightDIX, floorY, floorData, isCurrentActive);

        // Draw Floor Label
        this.ctx.save();
        const labelFontSize = FONT_SIZE_FLOOR / this.scale;
        this.ctx.font = `bold ${labelFontSize}px sans-serif`;
        this.ctx.fillStyle = this._getColor("textDarkBg", theme);
        this.ctx.textAlign = "right";
        this.ctx.textBaseline = "middle";
        const labelX = leftBTGroupX - COMPONENT_SIZE / 2 - 15 / this.scale;
        this.ctx.fillText(`Piso ${floor}`, labelX, floorY);
        this.ctx.restore();
    }

    /** Draws the 4 possible Tomas slots vertically for one side. */
    _drawTomasSide(groupX, floorY, tomas, isCurrentActive) {
        // Draw all 4 potential slots
        for (let i = 0; i < 4; i++) {
            const slotY = this._getBtSlotY(floorY, i);
            const model = tomas[i] || null; // Get model if exists, else null
            this._drawComponent("BT", groupX, slotY, model, isCurrentActive);
        }
    }

    /** Draws connection lines within a floor using edge-to-edge logic. */
    _drawFloorConnections(leftDIX, rightDIX, floorY, floorData, isCurrentActive) {
        const { DE_X, COMPONENT_SIZE, CABLE_DE_DI, CABLE_DI_BT } = this.LAYOUT;
        const halfSize = COMPONENT_SIZE / 2;

        // DE <-> DI Connections (same as before)
        if (floorData.distribuidores[0] && floorData.derivador) {
            this._drawCable(leftDIX + halfSize, floorY, DE_X - halfSize, floorY, CABLE_DE_DI, isCurrentActive);
        }
        if (floorData.distribuidores[1] && floorData.derivador) {
            this._drawCable(rightDIX - halfSize, floorY, DE_X + halfSize, floorY, CABLE_DE_DI, isCurrentActive);
        }

        // --- DI <-> BT Connections (Connect DI to each *active* BT slot) ---
        const leftBTGroupX = this._getBtGroupX(0);
        const rightBTGroupX = this._getBtGroupX(1);

        // Left DI to Left BTs
        if (floorData.distribuidores[0]) {
            for (let i = 0; i < 4; i++) {
                if (floorData.tomasLeft[i]) {
                    // Only draw if toma exists at this slot
                    const btSlotY = this._getBtSlotY(floorY, i);
                    this._drawCable(
                        leftDIX - halfSize,
                        floorY,
                        leftBTGroupX + halfSize,
                        btSlotY,
                        CABLE_DI_BT,
                        isCurrentActive,
                    );
                }
            }
        }

        // Right DI to Right BTs
        if (floorData.distribuidores[1]) {
            for (let i = 0; i < 4; i++) {
                if (floorData.tomasRight[i]) {
                    // Only draw if toma exists at this slot
                    const btSlotY = this._getBtSlotY(floorY, i);
                    this._drawCable(
                        rightDIX + halfSize,
                        floorY,
                        rightBTGroupX - halfSize,
                        btSlotY,
                        CABLE_DI_BT,
                        isCurrentActive,
                    );
                }
            }
        }
    }

    /** Draws vertical connections between floors (DE to DE). */
    _drawInterFloorConnections(sortedFloorNumbers) {
        const { DE_X, COMPONENT_SIZE, CABLE_INTERFLOOR } = this.LAYOUT;
        const halfSize = COMPONENT_SIZE / 2;

        for (let i = 0; i < sortedFloorNumbers.length - 1; i++) {
            const floor1 = sortedFloorNumbers[i];
            const floor2 = sortedFloorNumbers[i + 1];
            const floorData1 = this.floorComponents.get(floor1);
            const floorData2 = this.floorComponents.get(floor2);

            // Only draw if both floors have a DE
            if (floorData1?.derivador && floorData2?.derivador) {
                const y1 = this._getFloorCenterY(i); // Center Y of floor at index i
                const y2 = this._getFloorCenterY(i + 1); // Center Y of floor at index i+1

                // Connect bottom of DE on floor i to top of DE on floor i+1
                this._drawCable(DE_X, y1 + halfSize, DE_X, y2 - halfSize, CABLE_INTERFLOOR, true); // Dashed line
            }
        }
    }

    /** Draws a cable line with optional length label and dashing. */
    _drawCable(x1, y1, x2, y2, lengthLabel = null, dashed = false, isCurrentActive = false) {
        this.ctx.save();
        this.ctx.strokeStyle = this._getColor("cable", isCurrentActive ? "dark" : "light");
        this.ctx.lineWidth = this.LAYOUT.CONNECTION_LINE_WIDTH / this.scale;
        if (dashed) {
            this.ctx.setLineDash([5 / this.scale, 5 / this.scale]);
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Reset dash
        if (dashed) {
            this.ctx.setLineDash([]);
        }

        // Draw length label
        if (lengthLabel) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const labelFontSize = this.LAYOUT.FONT_SIZE_LABEL / this.scale;

            this.ctx.translate(midX, midY);
            this.ctx.rotate(angle);
            // Rotate text slightly differently if line is vertical for readability
            if (Math.abs(angle) > Math.PI / 2 - 0.1 && Math.abs(angle) < Math.PI / 2 + 0.1) {
                // No flip needed if textBaseline is 'bottom' or 'top'
                // If using 'middle', might need rotation
            }

            this.ctx.font = `${labelFontSize}px sans-serif`;
            this.ctx.fillStyle = this._getColor("cable", isCurrentActive ? "dark" : "light"); // Use cable color for label
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "bottom";
            const textOffset = -4 / this.scale; // Offset above the line
            // Background rectangle for text legibility (optional)
            // const textWidth = this.ctx.measureText(lengthLabel).width;
            // this.ctx.fillStyle = this._getColor('background', theme) + 'CC'; // Semi-transparent background
            // this.ctx.fillRect(-textWidth/2 - 2/this.scale, textOffset - labelFontSize - 2/this.scale, textWidth + 4/this.scale, labelFontSize + 4/this.scale);
            // this.ctx.fillStyle = this._getColor('cable'); // Reset fill for text

            this.ctx.fillText(lengthLabel, 0, textOffset);
        }

        this.ctx.restore();
    }

    /** Draws the background grid. */
    _drawGrid(viewWidth, viewHeight) {
        this.ctx.save();
        this.ctx.lineWidth = 0.5 / this.scale;
        this.ctx.strokeStyle = this._getColor("grid");

        const viewLeft = -this.offsetX / this.scale;
        const viewTop = -this.offsetY / this.scale;
        const viewRight = (viewWidth - this.offsetX) / this.scale;
        const viewBottom = (viewHeight - this.offsetY) / this.scale;
        const gridSize = this.LAYOUT.GRID_SIZE;

        const startX = Math.floor(viewLeft / gridSize) * gridSize;
        const startY = Math.floor(viewTop / gridSize) * gridSize;
        const endX = Math.ceil(viewRight / gridSize) * gridSize;
        const endY = Math.ceil(viewBottom / gridSize) * gridSize;

        this.ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    /** Gets sorted array of floor numbers currently in the map. */
    _getSortedFloorNumbers() {
        // Sort numerically
        return Array.from(this.floorComponents.keys()).sort((a, b) => a - b);
    }

    /** Main render loop. */
    render() {
        if (!this.ctx || !this.canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = this.canvas.width / dpr;
        const logicalHeight = this.canvas.height / dpr;

        this.ctx.save();
        // Use clearRect for background
        this.ctx.clearRect(0, 0, logicalWidth, logicalHeight);

        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        // Draw grid
        this._drawGrid(logicalWidth, logicalHeight);

        // Draw Floors and Connections
        const sortedFloors = this._getSortedFloorNumbers();

        if (sortedFloors.length > 0) {
            sortedFloors.forEach((floor, index) => {
                const floorY = this._getFloorCenterY(index);
                const floorData = this.floorComponents.get(floor);
                if (floorData) {
                    // Check if this floor is the currently selected one
                    const isCurrentActive = this.currentFloor === floor;
                    this._drawFloor(floor, floorY, floorData, isCurrentActive); // Pass active status
                }
            });
            if (sortedFloors.length > 1) {
                this._drawInterFloorConnections(sortedFloors);
            }
        } else {
            // Draw placeholder message if no floors configured
            this.ctx.save();
            const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = this._getColor("textDarkBg", theme);
            this.ctx.font = `italic ${14 / this.scale}px sans-serif`; // Slightly larger italic font
            const viewCenterX = (logicalWidth / 2 - this.offsetX) / this.scale;
            const viewCenterY = (logicalHeight / 2 - this.offsetY) / this.scale;
            this.ctx.fillText(
                "Seleccione una configuración y un piso para comenzar el diseño",
                viewCenterX,
                viewCenterY,
            );
            this.ctx.restore();
        }
        this.ctx.restore(); // Restore transformations
    }

    // --- Cleanup ---
    destroy() {
        // Remove event listeners attached to canvas
        if (this.canvas) {
            this.canvas.removeEventListener("mousedown", this._handleMouseDown);
            this.canvas.removeEventListener("wheel", this._handleWheel);
            this.canvas.removeEventListener("mouseleave", this._handleMouseLeave);
        }
        // Remove listeners attached to window *that were added by this instance*
        window.removeEventListener("mousemove", this._handleMouseMove);
        window.removeEventListener("mouseup", this._handleMouseUp);

        // Remove any existing popups and the outside click listener
        this.removeExistingPopups();

        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        console.log("SchematicEditor destroyed");
    }
}
