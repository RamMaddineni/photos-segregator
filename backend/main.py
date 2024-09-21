import os
import logging
import face_recognition
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def process_photos(input_folder, output_folder):
    """
    Process photos from the input folder, group them by person, and save to the output folder.

    Args:
    input_folder (str): Path to the folder containing input photos.
    output_folder (str): Path to the folder where grouped photos will be saved.
    """
    try:
        # Create output folder if it doesn't exist
        os.makedirs(output_folder, exist_ok=True)

        # Dictionary to store face encodings and corresponding images
        face_dict = {}

        # Process each image in the input folder
        for filename in os.listdir(input_folder):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_path = os.path.join(input_folder, filename)
                try:
                    image = face_recognition.load_image_file(image_path)
                    face_locations = face_recognition.face_locations(image)
                    face_encodings = face_recognition.face_encodings(image, face_locations)

                    # If faces are found in the image
                    if face_encodings:
                        for face_encoding in face_encodings:
                            # Check if this face matches any known faces
                            matches = []
                            for known_face in face_dict.keys():
                                match = face_recognition.compare_faces([known_face], face_encoding)[0]
                                if match:
                                    matches.append(known_face)

                            if matches:
                                # Add image to all matching face folders
                                for match in matches:
                                    face_dict[match].append(image_path)
                            else:
                                # New face found, create a new entry
                                face_dict[tuple(face_encoding)] = [image_path]
                    else:
                        logging.info(f"No faces found in {filename}")
                except Exception as e:
                    logging.error(f"Error processing {filename}: {str(e)}")

        # Save grouped images to output folders
        for i, (face_encoding, image_paths) in enumerate(face_dict.items()):
            person_folder = os.path.join(output_folder, f"person_{i+1}")
            os.makedirs(person_folder, exist_ok=True)
            for image_path in image_paths:
                try:
                    img = Image.open(image_path)
                    output_path = os.path.join(person_folder, os.path.basename(image_path))
                    img.save(output_path)
                except Exception as e:
                    logging.error(f"Error saving {image_path}: {str(e)}")

        logging.info(f"Processed {len(face_dict)} unique faces")
    except Exception as e:
        logging.error(f"An error occurred during photo processing: {str(e)}")

def main():
    """
    Main function to run the photo processing application.
    """
    input_folder = "inputPhotos"
    output_folder = "outputPhotos"
    logging.info(f"Starting photo processing. Input folder: {input_folder}, Output folder: {output_folder}")
    process_photos(input_folder, output_folder)
    logging.info("Photo processing completed")

if __name__ == "__main__":
    main()