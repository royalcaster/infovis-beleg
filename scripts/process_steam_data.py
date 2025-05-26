import pandas as pd
import duckdb
import json
import os
import ast  # For safely evaluating string representations of lists/dicts
import numpy as np  # For potential NaN handling or more complex stats if needed

# --- Configuration ---
CSV_FILE_PATH = "public/data.csv"
OUTPUT_DIR = "public/processed_data"
TABLE_NAME = "steam_games"
# Choose how to interpret 'estimated_owners' range: 'lower', 'upper', or 'midpoint'
OWNER_ESTIMATE_METHOD = "midpoint"

# --- Helper Functions ---
def safe_literal_eval(val):
    if isinstance(val, str):
        try:
            return ast.literal_eval(val)
        except (ValueError, SyntaxError):
            return val  # Return original string if it's not a valid literal
    return val


def clean_column_name(name):
    return "".join(c if c.isalnum() else "_" for c in str(name)).lower()


def parse_owners_flexible(owner_str, method="midpoint"):
    if isinstance(owner_str, str):
        parts = owner_str.split(" - ")
        try:
            lower = int(parts[0])
            # Handle cases like "0" or just one number if no " - "
            upper = int(parts[1]) if len(parts) > 1 else lower

            if method == "lower":
                return float(lower)
            elif method == "upper":
                return float(upper)
            elif method == "midpoint":
                return (float(lower) + float(upper)) / 2
            else:  # Default to midpoint if method is unknown
                print(
                    f"Warning: Unknown owner estimate method '{method}'. Defaulting to midpoint."
                )
                return (float(lower) + float(upper)) / 2
        except (ValueError, IndexError, TypeError):
            return np.nan  # Error in parsing
    return np.nan  # Not a string or unparseable


# --- Main Processing Logic ---
def main():
    print(f"Processing {CSV_FILE_PATH}...")
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

    try:
        df = pd.read_csv(CSV_FILE_PATH)
        print(f"Successfully loaded {CSV_FILE_PATH} into Pandas DataFrame.")
    except Exception as e:
        print(f"ERROR: Could not read CSV file: {e}")
        return

    df.columns = [clean_column_name(col) for col in df.columns]
    print(f"Cleaned columns: {df.columns.tolist()}")

    # --- Data Type Conversions & Cleaning ---
    print("Performing initial data type conversions and cleaning...")
    if "release_date" in df.columns:
        df["release_date"] = pd.to_datetime(
            df["release_date"], errors="coerce"
        )
        df["release_year"] = df["release_date"].dt.year
        df["release_quarter"] = (
            df["release_date"].dt.to_period("Q").astype(str)
        )
    if "price" in df.columns:
        df["price"] = pd.to_numeric(df["price"], errors="coerce")
    if "pct_pos_total" in df.columns:
        df["pct_pos_total"] = pd.to_numeric(
            df["pct_pos_total"], errors="coerce"
        )
    if "num_reviews_total" in df.columns:
        df["num_reviews_total"] = pd.to_numeric(
            df["num_reviews_total"], errors="coerce"
        )
    if "positive" in df.columns: # Ensure 'positive' is numeric for H3
        df["positive"] = pd.to_numeric(df["positive"], errors="coerce")

    if "estimated_owners" in df.columns:
        print(
            f"Parsing 'estimated_owners' using method: {OWNER_ESTIMATE_METHOD}"
        )
        df["estimated_owners_numeric"] = df["estimated_owners"].apply(
            lambda x: parse_owners_flexible(x, method=OWNER_ESTIMATE_METHOD)
        )
        df["estimated_owners_numeric"] = pd.to_numeric(
            df["estimated_owners_numeric"], errors="coerce"
        )

    for col in ["windows", "mac", "linux"]:
        if col in df.columns:
            df[col] = (
                df[col]
                .astype(str)
                .str.lower()
                .map({"true": True, "false": False})
                .fillna(False)
            )

    con = duckdb.connect(database=":memory:", read_only=False)
    print("Connected to in-memory DuckDB.")
    try:
        con.register("steam_df_cleaned", df)
        con.execute(
            f"CREATE OR REPLACE TABLE {TABLE_NAME} AS SELECT * FROM steam_df_cleaned"
        )
        print(f"Created DuckDB table '{TABLE_NAME}' from cleaned DataFrame.")
    except Exception as e:
        print(f"ERROR: Could not register/create table in DuckDB: {e}")
        con.close()
        return

    results = {}

    # --- General Statistics ---
    try:
        print("Calculating: General Statistics...")
        general_stats = {}
        general_stats["total_games_analyzed"] = int(
            con.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}").fetchone()[0]
        )

        numeric_cols_for_stats = {
            "price": "Price",
            "dlc_count": "DLC Count",
            "achievements": "Achievements",
            "recommendations": "Recommendations",
            "metacritic_score": "Metacritic Score",
            "user_score": "User Score",
            "positive": "Positive Reviews",
            "negative": "Negative Reviews",
            "estimated_owners_numeric": f"Est. Owners ({OWNER_ESTIMATE_METHOD.capitalize()})",
            "average_playtime_forever": "Avg. Playtime (All Time, Mins)",
            "median_playtime_forever": "Median Playtime (All Time, Mins)",
            "peak_ccu": "Peak Concurrent Users",
            "num_reviews_total": "Total Reviews",
        }
        general_stats["numeric_column_stats"] = []

        for col, display_name in numeric_cols_for_stats.items():
            if col in df.columns:
                query = f"""
                    SELECT
                        MIN({col}) as min_val,
                        MAX({col}) as max_val,
                        AVG({col}) as avg_val,
                        MEDIAN({col}) as median_val,
                        STDDEV_SAMP({col}) as stddev_val,
                        COUNT(CASE WHEN {col} IS NOT NULL THEN 1 END) as count_val
                    FROM {TABLE_NAME};
                """
                stats_result = con.execute(query).fetchone()
                if stats_result and stats_result[5] > 0: # Check count_val
                    general_stats["numeric_column_stats"].append(
                        {
                            "column_name": display_name,
                            "min": stats_result[0],
                            "max": stats_result[1],
                            "average": stats_result[2],
                            "median": stats_result[3],
                            "std_dev": stats_result[4],
                            "count_non_null": stats_result[5],
                        }
                    )
                else:
                    print(
                        f"Warning: Could not compute all stats for column '{col}' or no non-null data."
                    )
                    general_stats["numeric_column_stats"].append(
                        {
                            "column_name": display_name,
                            "min": "N/A", "max": "N/A", "average": "N/A",
                            "median": "N/A", "std_dev": "N/A",
                            "count_non_null": 0,
                        }
                    )
            else:
                print(
                    f"Warning: Column '{col}' not found for general stats calculation."
                )
                general_stats["numeric_column_stats"].append(
                    {
                        "column_name": display_name,
                        "min": "N/A", "max": "N/A", "average": "N/A",
                        "median": "N/A", "std_dev": "N/A",
                        "count_non_null": "N/A (column missing)",
                    }
                )

        if "price" in df.columns:
            free_paid_counts_df = con.execute(
                f"""
                SELECT
                    CASE WHEN price = 0 THEN 'Free' ELSE 'Paid' END as type,
                    COUNT(*) as count
                FROM {TABLE_NAME}
                WHERE price IS NOT NULL
                GROUP BY type;
            """
            ).df()
            general_stats["free_vs_paid_counts"] = free_paid_counts_df.to_dict(
                orient="records"
            )
        else:
            general_stats["free_vs_paid_counts"] = []
            print("Warning: 'price' column not found for free vs paid counts.")

        results["general_info"] = general_stats
        print("SUCCESS: General Statistics.")
    except Exception as e:
        print(f"ERROR during General Statistics calculation: {e}")
        results["general_info"] = {
            "error": str(e),
            "total_games_analyzed": 0,
            "numeric_column_stats": [],
            "free_vs_paid_counts": [],
        }

    # --- Hypothesis 1: Average positive review percentage over time ---
    try:
        print("Hypothesis 1: Avg Positive Review % Over Time...")
        if "release_year" in df.columns and "pct_pos_total" in df.columns:
            query_h1 = f"""
                SELECT
                    release_year,
                    AVG(pct_pos_total) AS avg_positive_percentage,
                    COUNT(*) AS num_games
                FROM {TABLE_NAME}
                WHERE release_year IS NOT NULL AND pct_pos_total IS NOT NULL
                GROUP BY release_year
                HAVING COUNT(*) > 10
                ORDER BY release_year;
            """
            results["h1_review_percentage_over_time"] = (
                con.execute(query_h1).df().to_dict(orient="records")
            )
            print("SUCCESS: H1.")
        else:
            print(
                "WARNING: H1 - Missing 'release_year' or 'pct_pos_total'."
            )
            results["h1_review_percentage_over_time"] = []
    except Exception as e:
        print(f"ERROR H1: {e}")
        results["h1_review_percentage_over_time"] = []

    # --- Hypothesis 2: More platforms -> more owners ---
    try:
        print("Hypothesis 2: Platforms vs. Estimated Owners...")
        if all(
            c in df.columns
            for c in ["windows", "mac", "linux", "estimated_owners_numeric"]
        ):
            query_h2 = f"""
                SELECT
                    (windows::INT + mac::INT + linux::INT) AS num_platforms,
                    AVG(estimated_owners_numeric) AS avg_estimated_owners,
                    COUNT(*) as num_games
                FROM {TABLE_NAME}
                WHERE estimated_owners_numeric IS NOT NULL
                GROUP BY num_platforms
                ORDER BY num_platforms;
            """
            results["h2_platforms_vs_owners"] = (
                con.execute(query_h2).df().to_dict(orient="records")
            )
            print("SUCCESS: H2.")
        else:
            print(
                "WARNING: H2 - Missing platform columns or 'estimated_owners_numeric'."
            )
            results["h2_platforms_vs_owners"] = []
    except Exception as e:
        print(f"ERROR H2: {e}")
        results["h2_platforms_vs_owners"] = []

    # --- Hypothesis 3: Positive reviews vs. estimated owners (non-linear) ---
    try:
        print("Hypothesis 3: Positive Reviews vs. Owners...")
        if "positive" in df.columns and "estimated_owners_numeric" in df.columns:
            # Data for scatter plot (sample if too large)
            # Ensure 'positive' is numeric in the table for DuckDB
            query_h3_scatter = f"""
                SELECT positive, estimated_owners_numeric
                FROM {TABLE_NAME}
                WHERE positive IS NOT NULL AND estimated_owners_numeric IS NOT NULL
                ORDER BY RANDOM()
                LIMIT 2000;
            """
            results["h3_reviews_owners_scatter"] = (
                con.execute(query_h3_scatter).df().to_dict(orient="records")
            )

            # Binned averages
            query_h3_binned = f"""
                SELECT
                    CASE
                        WHEN positive < 1000 THEN '0-1k'
                        WHEN positive < 10000 THEN '1k-10k'
                        WHEN positive < 50000 THEN '10k-50k'
                        WHEN positive < 100000 THEN '50k-100k'
                        WHEN positive < 500000 THEN '100k-500k'
                        ELSE '500k+'
                    END AS positive_reviews_bin,
                    AVG(estimated_owners_numeric) AS avg_estimated_owners,
                    COUNT(*) as num_games
                FROM {TABLE_NAME}
                WHERE positive IS NOT NULL AND estimated_owners_numeric IS NOT NULL
                GROUP BY positive_reviews_bin
                ORDER BY MIN(positive);
            """
            results["h3_reviews_owners_binned"] = (
                con.execute(query_h3_binned).df().to_dict(orient="records")
            )
            print("SUCCESS: H3.")
        else:
            print(
                "WARNING: H3 - Missing 'positive' or 'estimated_owners_numeric'."
            )
            results["h3_reviews_owners_scatter"] = []
            results["h3_reviews_owners_binned"] = []
    except Exception as e:
        print(f"ERROR H3: {e}")
        results["h3_reviews_owners_scatter"] = []
        results["h3_reviews_owners_binned"] = []

    # --- Hypothesis 4: Genres dominate specific price points ---
    try:
        print("Hypothesis 4: Genre Dominance by Price Point...")
        if "genres" in df.columns and "price" in df.columns:
            # Create a temporary DataFrame for exploded genres for this hypothesis
            df_h4 = df[["appid", "genres", "price"]].copy() # Select only necessary columns
            df_h4["genres_list"] = df_h4["genres"].apply(safe_literal_eval)
            df_h4 = df_h4.explode("genres_list")
            df_h4.dropna(subset=["genres_list", "price"], inplace=True)
            df_h4 = df_h4[df_h4["genres_list"] != ""]
            df_h4.rename(columns={"genres_list": "genre"}, inplace=True)

            con.register("h4_exploded_genres_df", df_h4)

            query_h4 = f"""
                WITH PriceBins AS (
                    SELECT
                        price,
                        genre,
                        CASE
                            WHEN price = 0 THEN 'Free'
                            WHEN price < 10 THEN '$0.01-$9.99'
                            WHEN price < 20 THEN '$10-$19.99'
                            WHEN price < 30 THEN '$20-$29.99'
                            WHEN price < 40 THEN '$30-$39.99'
                            WHEN price < 50 THEN '$40-$49.99'
                            ELSE '$50+'
                        END AS price_bin
                    FROM h4_exploded_genres_df
                ),
                GenreCountsInBin AS (
                    SELECT
                        price_bin,
                        genre,
                        COUNT(*) as game_count,
                        ROW_NUMBER() OVER (PARTITION BY price_bin ORDER BY COUNT(*) DESC) as rn
                    FROM PriceBins
                    GROUP BY price_bin, genre
                )
                SELECT price_bin, genre, game_count
                FROM GenreCountsInBin
                WHERE rn <= 5 -- Top 5 genres per price bin
                ORDER BY
                    CASE price_bin
                        WHEN 'Free' THEN 1
                        WHEN '$0.01-$9.99' THEN 2
                        WHEN '$10-$19.99' THEN 3
                        WHEN '$20-$29.99' THEN 4
                        WHEN '$30-$39.99' THEN 5
                        WHEN '$40-$49.99' THEN 6
                        ELSE 7
                    END,
                    game_count DESC;
            """
            results["h4_genre_price_dominance"] = (
                con.execute(query_h4).df().to_dict(orient="records")
            )
            con.unregister("h4_exploded_genres_df") # Clean up temp table
            print("SUCCESS: H4.")
        else:
            print("WARNING: H4 - Missing 'genres' or 'price'.")
            results["h4_genre_price_dominance"] = []
    except Exception as e:
        print(f"ERROR H4: {e}")
        results["h4_genre_price_dominance"] = []

    # --- Hypothesis 5: Free-to-play vs. Paid games (owners, review scores) ---
    try:
        print("Hypothesis 5: Free vs. Paid Games...")
        if (
            "price" in df.columns
            and "estimated_owners_numeric" in df.columns
            and "pct_pos_total" in df.columns
        ):
            query_h5 = f"""
                SELECT
                    CASE WHEN price = 0 THEN 'Free-to-Play' ELSE 'Paid' END AS game_type,
                    AVG(estimated_owners_numeric) AS avg_estimated_owners,
                    AVG(pct_pos_total) AS avg_positive_percentage,
                    STDDEV_SAMP(pct_pos_total) AS stddev_positive_percentage,
                    COUNT(*) as num_games
                FROM {TABLE_NAME}
                WHERE estimated_owners_numeric IS NOT NULL AND pct_pos_total IS NOT NULL AND price IS NOT NULL
                GROUP BY game_type;
            """
            results["h5_free_vs_paid"] = (
                con.execute(query_h5).df().to_dict(orient="records")
            )
            print("SUCCESS: H5.")
        else:
            print(
                "WARNING: H5 - Missing 'price', 'estimated_owners_numeric', or 'pct_pos_total'."
            )
            results["h5_free_vs_paid"] = []
    except Exception as e:
        print(f"ERROR H5: {e}")
        results["h5_free_vs_paid"] = []

    # --- Hypothesis 6: Games released in Q4 vs. other quarters ---
    try:
        print("Hypothesis 6: Q4 Release Impact...")
        if (
            "release_quarter" in df.columns
            and "estimated_owners_numeric" in df.columns
            and "num_reviews_total" in df.columns
        ):
            query_h6 = f"""
                SELECT
                    CASE WHEN release_quarter LIKE '%Q4' THEN 'Q4 Release' ELSE 'Other Quarters' END AS release_period,
                    AVG(estimated_owners_numeric) AS avg_estimated_owners,
                    AVG(num_reviews_total) AS avg_num_reviews,
                    COUNT(*) as num_games
                FROM {TABLE_NAME}
                WHERE release_quarter IS NOT NULL AND estimated_owners_numeric IS NOT NULL AND num_reviews_total IS NOT NULL
                GROUP BY release_period;
            """
            results["h6_q4_release_impact"] = (
                con.execute(query_h6).df().to_dict(orient="records")
            )
            print("SUCCESS: H6.")
        else:
            print(
                "WARNING: H6 - Missing 'release_quarter', 'estimated_owners_numeric', or 'num_reviews_total'."
            )
            results["h6_q4_release_impact"] = []
    except Exception as e:
        print(f"ERROR H6: {e}")
        results["h6_q4_release_impact"] = []

    # --- Hypothesis 7: Median positive review score vs. price ---
    try:
        print("Hypothesis 7: Median Review Score vs. Price...")
        if "price" in df.columns and "pct_pos_total" in df.columns:
            query_h7 = f"""
                WITH PriceBinnedGames AS (
                    SELECT
                        price,
                        pct_pos_total,
                        CASE
                            WHEN price = 0 THEN 'Free'
                            WHEN price > 0 AND price < 5 THEN '$0.01-$4.99'
                            WHEN price >= 5 AND price < 10 THEN '$5-$9.99'
                            WHEN price >= 10 AND price < 15 THEN '$10-$14.99'
                            WHEN price >= 15 AND price < 20 THEN '$15-$19.99'
                            WHEN price >= 20 AND price < 30 THEN '$20-$29.99'
                            WHEN price >= 30 AND price < 40 THEN '$30-$39.99'
                            WHEN price >= 40 AND price < 50 THEN '$40-$49.99'
                            WHEN price >= 50 AND price < 60 THEN '$50-$59.99'
                            WHEN price >= 60 THEN '$60+'
                            ELSE 'Unknown' -- Should not happen if price is not null
                        END AS price_bin,
                        -- For ordering price bins correctly
                        CASE
                            WHEN price = 0 THEN 0
                            WHEN price > 0 AND price < 5 THEN 1
                            WHEN price >= 5 AND price < 10 THEN 2
                            WHEN price >= 10 AND price < 15 THEN 3
                            WHEN price >= 15 AND price < 20 THEN 4
                            WHEN price >= 20 AND price < 30 THEN 5
                            WHEN price >= 30 AND price < 40 THEN 6
                            WHEN price >= 40 AND price < 50 THEN 7
                            WHEN price >= 50 AND price < 60 THEN 8
                            WHEN price >= 60 THEN 9
                            ELSE 10
                        END AS price_bin_order
                    FROM {TABLE_NAME}
                    WHERE price IS NOT NULL AND pct_pos_total IS NOT NULL
                )
                SELECT
                    price_bin,
                    MEDIAN(pct_pos_total) AS median_positive_percentage,
                    COUNT(*) as num_games
                FROM PriceBinnedGames
                WHERE price_bin != 'Unknown'
                GROUP BY price_bin, price_bin_order
                ORDER BY price_bin_order;
            """
            results["h7_median_review_vs_price"] = (
                con.execute(query_h7).df().to_dict(orient="records")
            )
            print("SUCCESS: H7.")
        else:
            print("WARNING: H7 - Missing 'price' or 'pct_pos_total'.")
            results["h7_median_review_vs_price"] = []
    except Exception as e:
        print(f"ERROR H7: {e}")
        results["h7_median_review_vs_price"] = []

    con.close()
    print("Closed DuckDB connection.")

    for key, data in results.items():
        output_path = os.path.join(OUTPUT_DIR, f"{key}.json")
        try:
            # Convert numpy types to native Python types for JSON serialization
            def convert_numpy_types(obj):
                if isinstance(obj, np.integer):
                    return int(obj)
                elif isinstance(obj, np.floating):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                elif isinstance(obj, pd.Timestamp):
                    return obj.isoformat()
                elif isinstance(obj, dict):
                    return {k: convert_numpy_types(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy_types(i) for i in obj]
                return obj

            serializable_data = convert_numpy_types(data)
            with open(output_path, "w") as f:
                json.dump(serializable_data, f, indent=4)
            print(f"Successfully saved {key}.json to {output_path}")
        except Exception as e:
            print(f"ERROR: Could not save {key}.json: {e}")
            # Fallback for problematic data: try to save as string
            try:
                with open(output_path, "w") as f:
                    json.dump({"error_data_could_not_serialize": str(data)}, f, indent=4)
                print(f"Saved problematic data for {key}.json as string due to serialization error.")
            except Exception as e_fallback:
                print(f"ERROR: Fallback save for {key}.json also failed: {e_fallback}")


    print("Processing complete.")


if __name__ == "__main__":
    main()
