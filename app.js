// DOM Elements
const dropZone = document.getElementById('drop-zone');
const folderInput = document.getElementById('folder-input');
const folderSelectBtn = document.getElementById('folder-select-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const downloadContainer = document.getElementById('download-container');
const downloadLink = document.getElementById('download-link');

// Constants
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const FACE_DETECTION_SIZE = 512; // Resize images to this size for face detection
const FACE_SIMILARITY_THRESHOLD = 0.4; // Adjusted threshold for better grouping (lower = more strict)
const MIN_FACE_CONFIDENCE = 0.7; // Minimum confidence score for face detection

// State
let isModelLoaded = false;
let processedImages = [];
let faceDescriptors = [];

// Initialize face-api.js
async function initFaceApi() {
    try {
        // Wait for faceapi to be defined
        if (typeof faceapi === 'undefined') {
            updateStatus('Waiting for face-api.js to load...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (typeof faceapi === 'undefined') {
                throw new Error('face-api.js failed to load');
            }
        }

        const modelBaseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
        await faceapi.nets.tinyFaceDetector.load(modelBaseUrl);
        await faceapi.nets.faceLandmark68Net.load(modelBaseUrl);
        await faceapi.nets.faceRecognitionNet.load(modelBaseUrl);
        isModelLoaded = true;
        updateStatus('Models loaded successfully. Ready to process images.');
    } catch (error) {
        console.error('Error loading models:', error);
        updateStatus('Error loading face detection models. Please refresh and try again.');
    }
}

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const items = e.dataTransfer.items;
    const files = [];
    
    for (let item of items) {
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                await readEntryContent(entry, files);
            }
        }
    }
    
    processFiles(files);
});

folderSelectBtn.addEventListener('click', () => {
    folderInput.click();
});

folderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).filter(file => 
        VALID_IMAGE_TYPES.includes(file.type)
    );
    processFiles(files);
});

// File Processing Functions
async function readEntryContent(entry, files) {
    if (entry.isFile) {
        const file = await new Promise((resolve) => entry.file(resolve));
        if (VALID_IMAGE_TYPES.includes(file.type)) {
            files.push(file);
        }
    } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await new Promise((resolve) => reader.readEntries(resolve));
        for (let entry of entries) {
            await readEntryContent(entry, files);
        }
    }
}

async function processFiles(files) {
    if (!isModelLoaded) {
        updateStatus('Loading face detection models...');
        await initFaceApi();
    }

    if (files.length === 0) {
        updateStatus('No valid image files found.');
        return;
    }

    updateStatus(`Processing ${files.length} images...`);
    progressContainer.style.display = 'block';
    downloadContainer.style.display = 'none';

    try {
        // Process each image
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            updateProgress((i / files.length) * 100);
            updateStatus(`Processing image ${i + 1} of ${files.length}`);
            
            const imageData = await processImage(file);
            if (imageData) {
                processedImages.push(imageData);
            }
        }

        // Group faces and create zip
        updateStatus('Grouping similar faces...');
        const groups = groupSimilarFaces();
        await createAndDownloadZip(groups, files);
        
        updateStatus('Processing complete! Click the download button to get your organized photos.');
        downloadContainer.style.display = 'block';
    } catch (error) {
        console.error('Error processing files:', error);
        updateStatus('An error occurred while processing the images.');
    }
}

async function processImage(file) {
    try {
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Resize image for face detection
        const scale = FACE_DETECTION_SIZE / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Detect faces with minimum confidence
        const detections = await faceapi.detectAllFaces(
            canvas, 
            new faceapi.TinyFaceDetectorOptions({ minConfidence: MIN_FACE_CONFIDENCE })
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

        if (detections.length > 0) {
            return {
                file: file,
                descriptors: detections.map(d => Array.from(d.descriptor))
            };
        }
    } catch (error) {
        console.error('Error processing image:', file.name, error);
    }
    return null;
}

function groupSimilarFaces() {
    const groups = [];
    const usedDescriptors = new Set();

    // First, sort images by number of faces (more faces first)
    const sortedImages = [...processedImages].sort((a, b) => 
        b.descriptors.length - a.descriptors.length
    );

    sortedImages.forEach((image, imageIndex) => {
        image.descriptors.forEach((descriptor, descIndex) => {
            const descriptorKey = `${imageIndex}-${descIndex}`;
            if (usedDescriptors.has(descriptorKey)) return;

            const group = {
                images: new Set([image.file]),
                descriptors: [descriptor]
            };
            usedDescriptors.add(descriptorKey);

            // Find similar faces in other images
            sortedImages.forEach((otherImage, otherImageIndex) => {
                if (imageIndex === otherImageIndex) return; // Skip same image

                otherImage.descriptors.forEach((otherDescriptor, otherDescIndex) => {
                    const otherKey = `${otherImageIndex}-${otherDescIndex}`;
                    if (usedDescriptors.has(otherKey)) return;

                    const distance = faceapi.euclideanDistance(descriptor, otherDescriptor);
                    if (distance < FACE_SIMILARITY_THRESHOLD) {
                        group.images.add(otherImage.file);
                        group.descriptors.push(otherDescriptor);
                        usedDescriptors.add(otherKey);
                    }
                });
            });

            // Only add groups that have more than one image or one very confident face
            if (group.images.size > 1) {
                groups.push(group);
            }
        });
    });

    return groups;
}

async function createAndDownloadZip(groups, files) {
    const zip = new JSZip();

    groups.forEach((group, index) => {
        const folderName = `Person_${index + 1}`;
        const folder = zip.folder(folderName);

        Array.from(group.images).forEach((file, fileIndex) => {
            folder.file(`image_${fileIndex + 1}${getFileExtension(file.name)}`, file);
        });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = 'organized_photos.zip';
}

// Utility Functions
function updateStatus(message) {
    statusText.textContent = message;
}

function updateProgress(percent) {
    progressFill.style.width = `${percent}%`;
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1);
}

// Initialize the application
initFaceApi(); 