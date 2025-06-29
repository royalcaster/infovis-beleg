import pandas as pd
import json
import os

def process_game_dna(input_path, output_path):
    print(f"Reading data from {input_path}...")
    
    # Read the dataset
    df = pd.read_csv(input_path)
    
    # Ensure 'genres' and 'categories' are strings
    df['genres'] = df['genres'].astype(str)
    df['categories'] = df['categories'].astype(str)

    print("Processing Game DNA data...")

    # Extract all unique genres and categories
    all_genres = set()
    all_categories = set()

    for _, row in df.iterrows():
        try:
            genres = json.loads(row['genres'].replace("'", '"'))
            all_genres.update(genres)
        except (json.JSONDecodeError, TypeError):
            pass  # Ignore if parsing fails

        try:
            categories = [cat['description'] for cat in json.loads(row['categories'].replace("'", '"'))]
            all_categories.update(categories)
        except (json.JSONDecodeError, TypeError):
            pass # Ignore if parsing fails

    # Create the hierarchical structure
    game_dna = {
        "name": "Game DNA",
        "children": [
            {
                "name": "Genres",
                "children": [{"name": genre, "value": 1} for genre in sorted(list(all_genres))]
            },
            {
                "name": "Categories",
                "children": [{"name": category, "value": 1} for category in sorted(list(all_categories))]
            }
        ]
    }

    print(f"Writing output to {output_path}...")
    # Write the JSON output
    with open(output_path, 'w') as f:
        json.dump(game_dna, f, indent=4)

    print("Processing complete.")

if __name__ == '__main__':
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the relative paths for input and output
    input_csv_path = os.path.join(script_dir, '..', 'public', 'data.csv')
    output_json_path = os.path.join(script_dir, '..', 'public', 'processed_data', 'game_dna.json')
    
    # Run the processing function
    process_game_dna(input_csv_path, output_json_path) 