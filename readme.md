# Photo Face Segregator

A client-side web application that organizes photos by detecting and grouping faces across multiple images. The app uses face recognition to identify unique individuals and creates separate folders for each person's photos.

## Features

- Drag and drop folder support
- Client-side face detection and recognition
- Automatic grouping of similar faces
- Progress indicators for all operations
- Downloadable ZIP file with organized photos
- Fully client-side (no server required)
- Modern and responsive UI

## How to Use

1. Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge recommended)
2. Wait for the face detection models to load
3. Either:
   - Drag and drop a folder containing photos onto the drop zone
   - Click the "Select Folder" button and choose a folder
4. Wait for the processing to complete:
   - Face detection
   - Face recognition
   - Photo grouping
5. Click the "Download Processed Images" button to get your organized photos

## Supported Image Types

- JPEG (.jpg, .jpeg)
- PNG (.png)

## Technical Details

The application uses the following technologies:

- face-api.js for face detection and recognition
- JSZip for creating downloadable ZIP files
- Modern JavaScript (ES6+)
- HTML5 File and Directory APIs
- Canvas API for image processing

## Privacy

All processing is done entirely in your browser. No photos are uploaded to any server, making this application completely private and secure.

## Browser Compatibility

The application requires a modern browser with support for:
- ES6+ JavaScript
- HTML5 File and Directory APIs
- Canvas API
- WebAssembly (used by face-api.js)

## Development

To modify or enhance the application:

1. Clone this repository
2. Make sure the face-api.js models are in the `/models` directory
3. Modify the source files:
   - `index.html` - Main HTML structure
   - `styles.css` - Styling
   - `app.js` - Application logic
4. Test with different sets of photos

## License

MIT License - Feel free to use, modify, and distribute this code.
