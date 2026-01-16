from sqlalchemy import create_engine, inspect
from app.core.config import settings
from app.models.file import FileUpload

def check_schema():
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    table_name = FileUpload.__tablename__
    if not inspector.has_table(table_name):
        print(f"Table {table_name} does not exist.")
        return

    columns = [c['name'] for c in inspector.get_columns(table_name)]
    print(f"Columns in {table_name}: {columns}")
    
    expected_columns = [
        'id', 'user_id', 'file_name', 'file_path', 'file_size', 
        'mime_type', 'file_type', 'file_url', 'file_hash', 
        'is_verified', 'verified_by', 'verification_notes', 
        'status', 'uploaded_at'
    ]
    
    missing = [c for c in expected_columns if c not in columns]
    if missing:
        print(f"Missing columns: {missing}")
    else:
        print("All expected columns are present.")

if __name__ == "__main__":
    check_schema()
