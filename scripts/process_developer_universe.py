import pandas as pd
import json
import os

def process_developer_universe(input_path, output_path):
    print(f"Reading data from {input_path}...")
    
    # Read the dataset
    df = pd.read_csv(input_path, usecols=['developers', 'publishers', 'estimated_owners', 'positive', 'negative'])
    print(f"CSV Columns: {df.columns.tolist()}")

    # Initialize dictionaries for nodes and a set for links
    nodes = {}
    links = set()

    print("Processing developer and publisher universe...")
    # Iterate over each game in the dataframe
    for _, row in df.iterrows():
        try:
            developers = json.loads(row['developers'].replace("'", '"')) if pd.notna(row['developers']) else []
            publishers = json.loads(row['publishers'].replace("'", '"')) if pd.notna(row['publishers']) else []
        except (json.JSONDecodeError, TypeError):
            continue

        # Process developers
        for dev in developers:
            if dev not in nodes:
                nodes[dev] = {'type': 'developer', 'game_count': 0, 'total_owners': 0, 'review_scores': []}
            nodes[dev]['game_count'] += 1
            if pd.notna(row['estimated_owners']):
                nodes[dev]['total_owners'] += int(row['estimated_owners'].split(' - ')[0])
            if pd.notna(row['positive']) and pd.notna(row['negative']):
                total_reviews = row['positive'] + row['negative']
                if total_reviews > 0:
                    nodes[dev]['review_scores'].append((row['positive'] / total_reviews) * 100)
        
        # Process publishers
        for pub in publishers:
            if pub not in nodes:
                nodes[pub] = {'type': 'publisher', 'game_count': 0, 'total_owners': 0, 'review_scores': []}
            nodes[pub]['game_count'] += 1
            if pd.notna(row['estimated_owners']):
                nodes[pub]['total_owners'] += int(row['estimated_owners'].split(' - ')[0])
            if pd.notna(row['positive']) and pd.notna(row['negative']):
                total_reviews = row['positive'] + row['negative']
                if total_reviews > 0:
                    nodes[pub]['review_scores'].append((row['positive'] / total_reviews) * 100)

        # Create links between all developers and publishers of the same game
        for dev in developers:
            for pub in publishers:
                if dev != pub:
                    # Add links in a consistent order to avoid duplicates
                    link = tuple(sorted((dev, pub)))
                    links.add(link)

    # Finalize node data and create list
    all_nodes = []
    for name, data in nodes.items():
        avg_review_score = sum(data['review_scores']) / len(data['review_scores']) if data['review_scores'] else 0
        all_nodes.append({
            'id': name,
            'type': data['type'],
            'game_count': data['game_count'],
            'total_owners': data['total_owners'],
            'avg_review_score': round(avg_review_score, 2)
        })

    # Stage 1: Filter nodes to only include more significant ones
    print(f"Total nodes before filtering: {len(all_nodes)}")
    initially_filtered_nodes = [
        node for node in all_nodes
        if node['game_count'] > 5 or node['total_owners'] > 250000
    ]
    print(f"Nodes after initial filtering: {len(initially_filtered_nodes)}")

    # Create a set of IDs from the initially filtered nodes for quick lookup
    initially_filtered_node_ids = {node['id'] for node in initially_filtered_nodes}

    # Filter links to only include connections between these nodes
    filtered_links = [
        {'source': source, 'target': target} for source, target in links
        if source in initially_filtered_node_ids and target in initially_filtered_node_ids
    ]

    # Stage 2: Remove nodes that have no connections after filtering
    connected_node_ids = set()
    for link in filtered_links:
        connected_node_ids.add(link['source'])
        connected_node_ids.add(link['target'])
    
    final_nodes = [
        node for node in initially_filtered_nodes
        if node['id'] in connected_node_ids
    ]
    print(f"Nodes after removing orphans: {len(final_nodes)}")
    
    output_data = {'nodes': final_nodes, 'links': filtered_links}

    print(f"Writing output to {output_path}...")
    # Write the JSON output
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=4)

    print("Processing complete.")

if __name__ == '__main__':
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define the relative paths for input and output
    input_csv_path = os.path.join(script_dir, '..', 'public', 'data.csv')
    output_json_path = os.path.join(script_dir, '..', 'public', 'processed_data', 'developer_universe.json')
    
    # Run the processing function
    process_developer_universe(input_csv_path, output_json_path) 