import pandas as pd
import json
import os

# --- Configuration ---
CSV_PATH = "public/data.csv"
OUTPUT_DIR = "public/processed_data"
OUTPUT_FILENAME = "carousel_data.json"

# This is the hand-picked list of games and their 24h peak players
# from the user's provided text, sorted from smallest to largest.
GAMES_DATA = [
    ("Cast n Chill", 3292),
    ("Parcel Simulator", 3617),
    ("BitCraft Online", 3737),
    ("Tower Wizard", 5390),
    ("Three Kingdoms Mushouden", 6033),
    ("Soulstone Survivors", 6629),
    ("Supermarket Simulator", 7580),
    ("美女，请别影响我成仙", 13040),
    ("Len's Island", 15264),
    ("Broken Arrow", 38753),
    ("SCUM", 45257),
    ("情感反诈模拟器", 88695),
    ("REMATCH", 91839),
    ("PEAK", 102799),
    ("Grand Theft Auto V", 106756),  # Simplified name for matching
    ("Bongo Cat", 185410),
    ("Apex Legends", 193630),
    ("Dota 2", 632375),
    ("PUBG: BATTLEGROUNDS", 756455),
    ("Counter-Strike 2", 1584464),
]


def main():
    print("Starting data processing with the user's hand-picked list...")
    # --- Load Data ---
    try:
        df = pd.read_csv(CSV_PATH)
        print("Successfully loaded main CSV data.")
    except FileNotFoundError:
        print(f"ERROR: Could not find {CSV_PATH}")
        return

    # Create a mapping of lowercase game names to header images for robust matching
    df["name_lower"] = df["name"].str.lower()
    image_map = df.set_index("name_lower")["header_image"].to_dict()

    # --- Prepare Final Data ---
    final_data = []
    for game_name, players in GAMES_DATA:
        # Try to find a matching header image using a case-insensitive lookup
        header_image = image_map.get(game_name.lower(), "")
        if not header_image:
            print(f"Warning: Could not find header image for '{game_name}'.")

        final_data.append(
            {
                "name": game_name,
                "estimated_owners": f"{players} - {players}",  # Use player count
                "header_image": header_image,
            }
        )

    # --- Save Output ---
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

    try:
        with open(output_path, "w") as f:
            json.dump(final_data, f, indent=4)
        print(f"Successfully created {output_path} with data for {len(final_data)} games.")
    except Exception as e:
        print(f"ERROR: Could not save final JSON file: {e}")


if __name__ == "__main__":
    main() 