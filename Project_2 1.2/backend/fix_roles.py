from app.db.session import engine
from sqlalchemy import text

def fix_role_values():
    try:
        with engine.connect() as conn:
            trans = conn.begin()
            try:
                # Update lowercase 'admin' to 'ADMIN'
                result1 = conn.execute(text("UPDATE users SET role = 'ADMIN' WHERE LOWER(role) = 'admin'"))
                print(f"Updated {result1.rowcount} admin roles")
                
                # Update lowercase 'student' to 'STUDENT'
                result2 = conn.execute(text("UPDATE users SET role = 'STUDENT' WHERE LOWER(role) = 'student'"))
                print(f"Updated {result2.rowcount} student roles")
                
                # Update lowercase 'tpo' to 'TPO'
                result3 = conn.execute(text("UPDATE users SET role = 'TPO' WHERE LOWER(role) = 'tpo'"))
                print(f"Updated {result3.rowcount} tpo roles")
                
                trans.commit()
                print('Database role values updated to uppercase successfully')
                
            except Exception as e:
                trans.rollback()
                print(f'Error updating database: {e}')
    except Exception as e:
        print(f'Connection error: {e}')

if __name__ == "__main__":
    fix_role_values()