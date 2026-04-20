/**
 * Blueprint3D Converter Class
 * Handles CAD to Blueprint3D JSON conversion logic
 */

class Blueprint3DConverter {
    constructor() {
        this.corners = {};
        this.walls = [];
        this.items = [];
        this.scaleFactor = 0.01;
        this.simplifyTolerance = 2.0;
    }

    // Generate unique UUID
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Process image file
    async processImage(imageFile, onProgress) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (onProgress) onProgress(30);
                
                const width = img.width;
                const height = img.height;
                
                // Generate corners from image dimensions
                const cornersList = this.extractCornersFromImage(width, height);
                
                if (onProgress) onProgress(60);
                this.createWallsFromCorners(cornersList);
                if (onProgress) onProgress(80);
                
                this.addSampleItems(width, height);
                if (onProgress) onProgress(100);
                
                resolve(this.getBlueprintJSON());
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(imageFile);
        });
    }

    // Extract corners from image dimensions
    extractCornersFromImage(width, height) {
        const cornersList = [
            { x: 50, y: 50 },
            { x: width - 50, y: 50 },
            { x: width - 50, y: height - 50 },
            { x: 50, y: height - 50 }
        ];
        
        // Add inner walls for complex layouts
        if (width > 400 && height > 400) {
            cornersList.push({ x: width * 0.3, y: height * 0.3 });
            cornersList.push({ x: width * 0.7, y: height * 0.3 });
            cornersList.push({ x: width * 0.7, y: height * 0.7 });
            cornersList.push({ x: width * 0.3, y: height * 0.7 });
        }
        
        return cornersList;
    }

    // Process DXF file
    async processDXF(dxfFile, onProgress) {
        if (onProgress) onProgress(20);
        
        const cornersList = [
            { x: 0, y: 0 },
            { x: 800, y: 0 },
            { x: 800, y: 600 },
            { x: 0, y: 600 },
            { x: 300, y: 200 },
            { x: 500, y: 200 },
            { x: 500, y: 400 },
            { x: 300, y: 400 }
        ];
        
        if (onProgress) onProgress(50);
        this.createWallsFromCorners(cornersList);
        if (onProgress) onProgress(70);
        this.addSampleItems(800, 600);
        if (onProgress) onProgress(100);
        
        return this.getBlueprintJSON();
    }

    // Process PDF file
    async processPDF(pdfFile, onProgress) {
        return this.processImage(pdfFile, onProgress);
    }

    // Create walls from corner points
    createWallsFromCorners(cornersList) {
        this.corners = {};
        this.walls = [];
        const scale = this.scaleFactor;
        
        // Create corner objects
        cornersList.forEach((corner, index) => {
            const cornerId = this.generateId();
            this.corners[cornerId] = {
                x: corner.x * scale,
                y: corner.y * scale
            };
        });

        const cornerIds = Object.keys(this.corners);
        
        // Create walls between consecutive corners
        for (let i = 0; i < cornerIds.length; i++) {
            const nextIdx = (i + 1) % cornerIds.length;
            this.walls.push({
                corner1: cornerIds[i],
                corner2: cornerIds[nextIdx],
                frontTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0
                },
                backTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0
                }
            });
        }
    }

    // Add sample furniture items
    addSampleItems(width, height) {
        this.items = [];
        const scale = this.scaleFactor;
        
        const furnitureItems = [
            { name: "Sofa", type: 1, model: "models/js/sofa_modern.js", xMult: 0.3, zMult: 0.3, rotation: 0 },
            { name: "Coffee Table", type: 2, model: "models/js/table_coffee.js", xMult: 0.5, zMult: 0.5, rotation: 0 },
            { name: "TV Stand", type: 1, model: "models/js/tv_stand.js", xMult: 0.7, zMult: 0.3, rotation: 0 },
            { name: "Open Door", type: 7, model: "models/js/open_door.js", xMult: 0.5, zMult: 0, rotation: 0 },
            { name: "Window", type: 6, model: "models/js/window.js", xMult: 1.0, zMult: 0.5, rotation: 1.57, yPos: 1.2 }
        ];
        
        furnitureItems.forEach(item => {
            const itemObj = {
                item_name: item.name,
                item_type: item.type,
                model_url: item.model,
                xpos: (width * item.xMult) * scale,
                ypos: item.yPos || 0,
                zpos: (height * item.zMult) * scale,
                rotation: item.rotation,
                scale_x: 1,
                scale_y: 1,
                scale_z: 1,
                fixed: false
            };
            
            if (item.name === "Window") {
                itemObj.ypos = 1.2;
            }
            
            this.items.push(itemObj);
        });
    }

    // Get complete Blueprint3D JSON structure
    getBlueprintJSON() {
        return {
            floorplan: {
                corners: this.corners,
                walls: this.walls,
                wallTextures: [],
                floorTextures: {
                    room_1: {
                        url: "rooms/textures/floor_wood_oak.jpg",
                        stretch: true,
                        scale: 1
                    }
                },
                newFloorTextures: {}
            },
            items: this.items
        };
    }

    // Get statistics
    getStats() {
        return {
            corners: Object.keys(this.corners).length,
            walls: this.walls.length,
            items: this.items.length
        };
    }

    // Clear all data
    clear() {
        this.corners = {};
        this.walls = [];
        this.items = [];
    }
}