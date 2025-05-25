# Photo Face Segregator - Data Flow Documentation

## Initial Load Flow

1. Browser loads `index.html`
2. External Dependencies Loading:
   - face-api.js from CDN (`https://cdn.jsdelivr.net/npm/face-api.js`)
   - JSZip from CDN (`https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`)
   - Application CSS (`styles.css`)
   - Application JavaScript (`app.js`)

3. Application Initialization:
   - DOM elements are cached
   - Event listeners are attached
   - `initFaceApi()` is called automatically
     ```
     initFaceApi()
     ├── Load TinyFaceDetector model from CDN
     ├── Load FaceLandmark68Net model from CDN
     └── Load FaceRecognitionNet model from CDN
     ```

## User Interaction Flow

### Folder Selection Path
1. User clicks "Select Folder" button
   ```
   folderSelectBtn.click()
   └── folderInput.click()
   ```

2. User selects folder via system dialog
   ```
   folderInput.change event
   ├── Filter files (VALID_IMAGE_TYPES)
   └── processFiles()
   ```

### Drag and Drop Path
1. User drags folder over drop zone
   ```
   dropZone.dragover event
   └── Add 'drag-over' class
   ```

2. User drops folder
   ```
   dropZone.drop event
   ├── Prevent default behavior
   ├── Remove 'drag-over' class
   ├── Extract items from DataTransfer
   ├── readEntryContent() for each entry
   │   ├── If file: check type and add to files array
   │   └── If directory: recursively process contents
   └── processFiles()
   ```

## Image Processing Flow

### Main Processing Pipeline
```
processFiles(files)
├── Check model loading status
├── Validate files array
├── Show progress container
├── For each file:
│   ├── Update progress UI
│   ├── processImage()
│   │   ├── Create ImageBitmap
│   │   ├── Create canvas and resize
│   │   ├── Detect faces (face-api.js)
│   │   └── Return file and face descriptors
│   └── Store processed data
├── Group similar faces
└── Create and prepare download
```

### Face Grouping Algorithm
```
groupSimilarFaces()
├── Initialize groups array
├── Track used descriptors
├── For each image's face descriptors:
│   ├── Create new group if descriptor unused
│   ├── Find similar faces in other images
│   │   ├── Calculate euclidean distance
│   │   └── Group if distance < FACE_SIMILARITY_THRESHOLD
│   └── Mark descriptors as used
└── Return groups
```

### ZIP Creation and Download
```
createAndDownloadZip(groups, files)
├── Create new JSZip instance
├── For each group:
│   ├── Create folder (Person_N)
│   └── Add images to folder
├── Generate ZIP blob
├── Create object URL
└── Update download link
```

## Constants and Thresholds

- `VALID_IMAGE_TYPES`: ['image/jpeg', 'image/png', 'image/jpg']
- `FACE_DETECTION_SIZE`: 512 pixels (max dimension for processing)
- `FACE_SIMILARITY_THRESHOLD`: 0.6 (lower = stricter matching)

## Error Handling

1. Model Loading Errors:
   - Caught in `initFaceApi()`
   - Updates UI with error message
   - Logs error to console

2. Image Processing Errors:
   - Caught per image in `processImage()`
   - Logs specific error to console
   - Continues with next image

3. General Processing Errors:
   - Caught in `processFiles()`
   - Updates UI with error message
   - Logs error to console

## UI Updates

- Status Messages: via `updateStatus()`
- Progress Bar: via `updateProgress()`
- Download Button: Shown/hidden based on processing state
- Drag/Drop Visual Feedback: CSS classes

## Memory Management

- Images are processed sequentially to manage memory usage
- Object URLs are created only when needed for download
- Face descriptors are stored as arrays rather than TypedArrays
- Sets are used to track unique images and used descriptors
