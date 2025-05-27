import csv
import json
import os

def process_csv():
    header_images = []
    try:
        with open("public/data.csv", mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            if "header_image" not in reader.fieldnames:
                print("Error: 'header_image' column not found.")
                return

            for row in reader:
                image_url = row.get("header_image")
                if image_url:
                    header_images.append(image_url)
    except FileNotFoundError:
        print("Error: data.csv not found.")
        return
    except Exception as e:
        print(f"An error occurred: {e}")
        return

    output_dir = "public/processed_data"
    os.makedirs(output_dir, exist_ok=True) # Ensure directory exists

    try:
        with open(os.path.join(output_dir, "header_images.json"), "w", encoding="utf-8") as outfile:
            json.dump(header_images, outfile, indent=2)
        print("Successfully created header_images.json")
    except Exception as e:
        print(f"Error writing JSON file: {e}")

if __name__ == "__main__":
    process_csv()
