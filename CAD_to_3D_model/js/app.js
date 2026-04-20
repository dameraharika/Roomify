/**
 * Main Application Logic
 * Handles UI events, file uploads, and DOM manipulation
 */

// Initialize converter
const converter = new Blueprint3DConverter();

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const previewBtn = document.getElementById('previewBtn');
const clearBtn = document.getElementById('clearBtn');
const jsonPreview = document.getElementById('jsonPreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileType = document.getElementById('fileType');
const fileInfo = document.getElementById('fileInfo');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

let currentJSON = null;
let currentFile = null;

// Update statistics display
function updateStats() {
    const stats = converter.getStats();
    document.getElementById('cornerCount').textContent = stats.corners;
    document.getElementById('wallCount').textContent = stats.walls;
    document.getElementById('itemCount').textContent = stats.items;
}

// Update progress bar
function updateProgress(percent) {
    progressBar.classList.add('show');
    progressFill.style.width = percent + '%';
    if (percent >= 100) {
        setTimeout(() => {
            progressBar.classList.remove('show');
        }, 500);
    }
}

// Show status message
function showStatus(message, type, target = 'outputStatus') {
    const statusDiv = document.getElementById(target);
    statusDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        if (statusDiv.firstChild) statusDiv.removeChild(statusDiv.firstChild);
    }, 3000);
}

// Display file information
function displayFileInfo(file) {
    fileName.textContent = file.name;
    fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
    fileType.textContent = file.type || file.name.split('.').pop().toUpperCase();
    fileInfo.classList.add('show');
    convertBtn.disabled = false;
}

// Process uploaded file
async function processFile(file) {
    currentFile = file;
    const ext = file.name.split('.').pop().toLowerCase();
    converter.scaleFactor = parseFloat(document.getElementById('scaleFactor').value);
    converter.simplifyTolerance = parseFloat(document.getElementById('simplifyTolerance').value);
    
    try {
        showStatus('Processing file... ⏳', 'info', 'uploadStatus');
        
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            currentJSON = await converter.processImage(file, updateProgress);
            showStatus('✅ Image processed successfully!', 'success', 'uploadStatus');
        } else if (ext === 'dxf') {
            currentJSON = await converter.processDXF(file, updateProgress);
            showStatus('✅ DXF processed successfully!', 'success', 'uploadStatus');
        } else if (ext === 'pdf') {
            currentJSON = await converter.processPDF(file, updateProgress);
            showStatus('✅ PDF processed successfully!', 'success', 'uploadStatus');
        } else {
            showStatus('❌ Unsupported file type: ' + ext, 'error', 'uploadStatus');
            return;
        }
        
        updateStats();
        downloadBtn.disabled = false;
        copyBtn.disabled = false;
        previewBtn.disabled = false;
        showStatus('✅ Ready to download JSON!', 'success', 'outputStatus');
        
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'error', 'uploadStatus');
    }
}

// Download JSON file
function downloadJSON() {
    if (currentJSON) {
        const dataStr = JSON.stringify(currentJSON, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blueprint3d_design.json';
        a.click();
        URL.revokeObjectURL(url);
        showStatus('✅ JSON downloaded successfully!', 'success', 'outputStatus');
    }
}

// Copy JSON to clipboard
async function copyToClipboard() {
    if (currentJSON) {
        const dataStr = JSON.stringify(currentJSON, null, 2);
        await navigator.clipboard.writeText(dataStr);
        showStatus('📋 JSON copied to clipboard!', 'success', 'outputStatus');
    }
}

// Preview JSON
function previewJSON() {
    if (currentJSON) {
        const dataStr = JSON.stringify(currentJSON, null, 2);
        jsonPreview.textContent = dataStr;
        jsonPreview.classList.add('show');
        showStatus('👁️ JSON preview displayed', 'success', 'outputStatus');
    }
}

// Clear all data
function clearAll() {
    converter.clear();
    currentJSON = null;
    currentFile = null;
    updateStats();
    jsonPreview.classList.remove('show');
    fileInfo.classList.remove('show');
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    previewBtn.disabled = true;
    convertBtn.disabled = true;
    fileInput.value = '';
    showStatus('🗑️ All data cleared', 'success', 'outputStatus');
}

// Initialize sample data
function initSampleData() {
    const sampleCorners = [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 400 },
        { x: 0, y: 400 }
    ];
    converter.createWallsFromCorners(sampleCorners);
    converter.addSampleItems(500, 400);
    currentJSON = converter.getBlueprintJSON();
    updateStats();
    downloadBtn.disabled = false;
    copyBtn.disabled = false;
    previewBtn.disabled = false;
    showStatus('🎉 Sample layout loaded! Upload your file or download this sample.', 'info', 'outputStatus');
}

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        displayFileInfo(file);
        await processFile(file);
    }
});

fileInput.addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        displayFileInfo(e.target.files[0]);
        await processFile(e.target.files[0]);
    }
});

convertBtn.addEventListener('click', async () => {
    if (currentFile) {
        await processFile(currentFile);
    } else {
        showStatus('Please select a file first', 'error', 'uploadStatus');
    }
});

downloadBtn.addEventListener('click', downloadJSON);
copyBtn.addEventListener('click', copyToClipboard);
previewBtn.addEventListener('click', previewJSON);
clearBtn.addEventListener('click', clearAll);

// Scale factor change handler
document.getElementById('scaleFactor').addEventListener('change', () => {
    if (currentFile) {
        showStatus('Scale factor updated. Re-convert to apply changes.', 'info', 'uploadStatus');
    }
});

// Initialize sample on load
setTimeout(initSampleData, 500);