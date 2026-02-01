#!/usr/bin/env python
"""Script to create the analytics_percentages table in the database."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_analytics_percentages_table():
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL to create the analytics_percentages table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS analytics_percentages (
        id SERIAL PRIMARY KEY,
        placed_percentage DECIMAL(5,2) NOT NULL,
        unplaced_percentage DECIMAL(5,2) NOT NULL,
        higher_studies_percentage DECIMAL(5,2) NOT NULL,
        exploring_percentage DECIMAL(5,2) NOT NULL,
        others_percentage DECIMAL(5,2) NOT NULL,
        total_students INTEGER NOT NULL,
        placed_students INTEGER NOT NULL,
        unplaced_students INTEGER NOT NULL,
        higher_studies_count INTEGER NOT NULL,
        exploring_count INTEGER NOT NULL,
        others_count INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        with engine.connect() as conn:
            # Execute the create table statement
            conn.execute(text(create_table_sql))
            conn.commit()
            print("Table 'analytics_percentages' created successfully!")
            
            # Check if we need to initialize with initial data
            result = conn.execute(text("SELECT COUNT(*) FROM analytics_percentages")).fetchone()
            if result[0] == 0:
                # Insert initial record with zero values
                insert_sql = """
                INSERT INTO analytics_percentages (
                    placed_percentage, unplaced_percentage, higher_studies_percentage,
                    exploring_percentage, others_percentage, total_students,
                    placed_students, unplaced_students, higher_studies_count,
                    exploring_count, others_count
                ) VALUES (
                    0.0, 0.0, 0.0, 0.0, 0.0, 0, 0, 0, 0, 0, 0
                );
                """
                conn.execute(text(insert_sql))
                conn.commit()
                print("Initial record added to 'analytics_percentages' table.")
            else:
                print("'analytics_percentages' table already has data.")
                
    except Exception as e:
        print(f"Error creating table: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_analytics_percentages_table()
    if success:
        print("\nAnalytics percentages table setup completed successfully!")
    else:
        print("\nFailed to set up analytics percentages table.")
        sys.exit(1)