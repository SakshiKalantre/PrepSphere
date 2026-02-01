
import sys
import os
sys.path.append(os.getcwd())
try:
    from main import app
except ImportError:
    from app.main import app

print("Printing all registered routes:")
for route in app.routes:
    if hasattr(route, "methods"):
        print(f"{route.methods} {route.path}")
    else:
        print(f"Mounted: {route.path}")
