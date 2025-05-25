# Debugging Guide for Photo Face Segregator

## Setup for Debugging

1. Open the application in Chrome/Edge (recommended for best developer tools):
   - Right-click on `index.html` and open with Chrome/Edge
   - Or start a local server and navigate to the page

2. Open Developer Tools:
   - Press `F12` or
   - Right-click anywhere on the page and select "Inspect"
   - Or press `Ctrl + Shift + I` (Windows/Linux) or `Cmd + Option + I` (Mac)

3. Navigate to Sources Panel:
   - Click on the "Sources" tab in Developer Tools
   - In the file navigator (left pane), find `app.js`
   - If you don't see it, refresh the page with DevTools open

## Setting Breakpoints

### Key Points for Breakpoints:

1. Initial Loading:
   ```javascript
   // Line ~20: Model loading
   async function initFaceApi() {
   ```

2. File Input Handling:
   ```javascript
   // Line ~70: File selection handling
   folderInput.addEventListener('change', (e) => {
   ```

3. Drag and Drop:
   ```javascript
   // Line ~50: Drop event handling
   dropZone.addEventListener('drop', async (e) => {
   ```

4. Image Processing:
   ```javascript
   // Line ~100: Main processing function
   async function processFiles(files) {

   // Line ~140: Individual image processing
   async function processImage(file) {
   ```

5. Face Grouping:
   ```javascript
   // Line ~170: Face grouping algorithm
   function groupSimilarFaces() {
   ```

## Using Debug Controls

### Debug Control Shortcuts:
- `F8` or `Ctrl + \`: Continue execution
- `F10` or `Ctrl + '`: Step over next function call
- `F11` or `Ctrl + ;`: Step into next function call
- `Shift + F11` or `Ctrl + Shift + ;`: Step out of current function
- `F9`: Toggle breakpoint on current line

### Watch Expressions
Add these useful watch expressions in the debugger:
```javascript
processedImages.length
files.length
isModelLoaded
```

## Debugging Specific Features

### 1. Model Loading
```javascript
// Add this at the start of initFaceApi
console.log('Starting model loading');
debugger;  // Will pause here when DevTools is open
```

### 2. Face Detection
```javascript
// In processImage function
console.log('Processing image:', file.name);
console.log('Image dimensions:', img.width, 'x', img.height);
debugger;
```

### 3. Face Grouping
```javascript
// In groupSimilarFaces
console.log('Total processed images:', processedImages.length);
console.log('Starting face grouping');
debugger;
```

## Common Debugging Scenarios

### 1. Model Loading Fails
Check:
- Network tab for failed requests
- Console for error messages
- `isModelLoaded` variable state
- URL construction in `initFaceApi()`

### 2. Image Processing Issues
Monitor:
- Canvas creation and sizing
- Face detection results
- Memory usage in Performance tab
- File types and sizes in Console

### 3. Face Grouping Problems
Inspect:
- Face descriptors array contents
- Distance calculations
- Group formation logic
- Memory usage during grouping

## Performance Monitoring

1. Open Performance Tab:
   - Use Performance tab in DevTools
   - Click record before processing images
   - Stop recording after completion

2. Memory Profile:
   - Use Memory tab in DevTools
   - Take heap snapshot before and after processing
   - Compare snapshots to find leaks

## Console Debugging Tips

Add these debug logs for better visibility:
```javascript
// Add to app.js for debugging
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[PhotoSegregator]', ...args);
    }
}

// Usage examples:
debugLog('Processing started', { fileCount: files.length });
debugLog('Face detected', { confidence: detection.score });
debugLog('Group created', { size: group.images.size });
```

## Common Issues and Solutions

1. Memory Issues:
   - Monitor heap size in Performance panel
   - Check for large image processing batches
   - Watch for uncleared object URLs

2. Processing Delays:
   - Use Performance timeline to identify bottlenecks
   - Check async operation timing
   - Monitor CPU usage during processing

3. Face Detection Accuracy:
   - Verify image scaling calculations
   - Check face confidence scores
   - Monitor similarity threshold effects

## Remote Debugging

For testing on other devices:
1. Enable remote debugging:
   - Chrome: `chrome://inspect`
   - Edge: `edge://inspect`
2. Connect device/open remote tab
3. Use same debugging tools as local 