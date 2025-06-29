import pandas as pd
import json
import os

def process_steam_timeline(input_path, output_path):
    print(f"Reading data from {input_path}...")
    
    # Read the dataset
    df = pd.read_csv(input_path, usecols=['release_date', 'genres'])
    
    # Convert release_date to datetime objects
    df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')
    df.dropna(subset=['release_date'], inplace=True)
    
    # Extract year from release_date
    df['year'] = df['release_date'].dt.year

    print("Processing Steam timeline data...")

    # Initialize a dictionary to hold the yearly genre counts
    yearly_genre_counts = {}

    # Iterate over each game in the dataframe
    for _, row in df.iterrows():
        year = row['year']
        try:
            genres = json.loads(row['genres'].replace("'", '"')) if pd.notna(row['genres']) else []
        except (json.JSONDecodeError, TypeError):
            continue

        if year not in yearly_genre_counts:
            yearly_genre_counts[year] = {}

        for genre in genres:
            if genre not in yearly_genre_counts[year]:
                yearly_genre_counts[year][genre] = 0
            yearly_genre_counts[year][genre] += 1

    # Format the data for the timeline chart
    timeline_data = []
    all_genres = sorted(list(set(genre for year_data in yearly_genre_counts.values() for genre in year_data.keys())))
    
    for year in sorted(yearly_genre_counts.keys()):
        year_data = {'year': int(year)}
        for genre in all_genres:
            year_data[genre] = yearly_genre_counts[year].get(genre, 0)
        timeline_data.append(year_data)

    output = {
        'timeline': timeline_data,
        'genres': all_genres
    }

    print(f"Writing output to {output_path}...")
    # Write the JSON output
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=4)

    print("Processing complete.")

if __name__ == '__main__':
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the relative paths for input and output
    input_csv_path = os.path.join(script_dir, '..', 'public', 'data.csv')
    output_json_path = os.path.join(script_dir, '..', 'public', 'processed_data', 'steam_timeline.json')
    
    # Run the processing function
    process_steam_timeline(input_csv_path, output_json_path) 