import csv
import json
import ast
from datetime import datetime
from collections import defaultdict

INPUT_CSV = 'public/data.csv'
OUTPUT_JSON = 'public/processed_data/steam_timeline.json'


def parse_owners(owners_str):
    # Format: '10000000 - 20000000'
    try:
        parts = owners_str.replace(',', '').split('-')
        if len(parts) == 2:
            low = int(parts[0].strip())
            high = int(parts[1].strip())
            return int((low + high) / 2)
        return int(parts[0].strip())
    except Exception:
        return None

def parse_list_field(field):
    try:
        val = ast.literal_eval(field)
        if isinstance(val, list):
            return val
        return []
    except Exception:
        return []

def parse_screenshots(field):
    shots = parse_list_field(field)
    return shots[:3] if shots else []

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, '%Y-%m-%d')
    except Exception:
        return None

def main():
    print("[DEBUG] Starting process_steam_timeline.py (downsampled)")
    games_by_year = defaultdict(list)
    total = 0
    skipped = 0
    skipped_date = 0
    skipped_parse = 0
    with open(INPUT_CSV, encoding='utf-8') as f:
        print("[DEBUG] Opened CSV file")
        reader = csv.DictReader(f)
        first_row = next(reader, None)
        if first_row:
            print(f"[DEBUG] First row keys: {list(first_row.keys())}")
            print(f"[DEBUG] First row values: {list(first_row.values())}")
            # Rewind to process all rows
            f.seek(0)
            reader = csv.DictReader(f)
        else:
            print("[DEBUG] No rows in CSV file!")
        for row in reader:
            total += 1
            release_date = parse_date(row['release_date'])
            if not release_date:
                skipped += 1
                skipped_date += 1
                continue
            try:
                entry = {
                    'appid': row['appid'],
                    'name': row['name'],
                    'release_date': row['release_date'],
                    'release_year': release_date.year,
                    'positive': int(row['positive']) if row['positive'].isdigit() else 0,
                    'estimated_owners': parse_owners(row['estimated_owners']),
                    'genre': parse_list_field(row['genres'])[0] if row['genres'] else None,
                    'genres': parse_list_field(row['genres']),
                    'detailed_description': row['detailed_description'],
                    'short_description': row['short_description'],
                    'header_image': row['header_image'],
                    'screenshots': parse_screenshots(row['screenshots']),
                    'developers': parse_list_field(row['developers']),
                    'publishers': parse_list_field(row['publishers']),
                    'avg_review_score': float(row['pct_pos_total']) if row.get('pct_pos_total') not in (None, '', 'null') else None,
                }
                games_by_year[release_date.year].append(entry)
            except Exception as e:
                skipped += 1
                skipped_parse += 1
                print(f"[SKIP] Parse error on row {total}: {e}")
                continue
    # Downsample: keep only top 40 games per year by positive ratings
    timeline = []
    for year, games in games_by_year.items():
        top_games = sorted(games, key=lambda x: x['positive'] if x['positive'] is not None else 0, reverse=True)[:40]
        timeline.extend(top_games)
    # Sort by release_date
    timeline.sort(key=lambda x: x['release_date'])
    print(f"Total rows: {total}")
    print(f"Rows skipped: {skipped}")
    print(f"  - Skipped due to invalid/missing date: {skipped_date}")
    print(f"  - Skipped due to parse error: {skipped_parse}")
    print(f"Rows included (after downsampling): {len(timeline)}")
    if timeline:
        print("Sample entry:")
        print(json.dumps(timeline[0], indent=2))
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(timeline, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main() 