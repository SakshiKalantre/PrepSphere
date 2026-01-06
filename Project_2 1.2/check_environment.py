#!/usr/bin/env python3
"""
Environment Checker for PrepSphere
This script checks if all required dependencies are installed for running PrepSphere.
"""

import sys
import subprocess
import importlib.util

def check_python_version():
    """Check if Python 3.8+ is installed"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✓ Python {sys.version}")
        return True
    else:
        print(f"✗ Python {sys.version} - Need Python 3.8 or higher")
        return False

def check_command(command, name):
    """Check if a command is available"""
    try:
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✓ {name} is installed")
            return True
        else:
            print(f"✗ {name} is not installed or not in PATH")
            return False
    except Exception as e:
        print(f"✗ Error checking {name}: {e}")
        return False

def check_python_package(package_name, import_name=None):
    """Check if a Python package is installed"""
    if import_name is None:
        import_name = package_name
    
    if importlib.util.find_spec(import_name) is not None:
        print(f"✓ Python package '{package_name}' is installed")
        return True
    else:
        print(f"✗ Python package '{package_name}' is not installed")
        return False

def check_node_packages():
    """Check if required Node.js packages are installed"""
    required_packages = [
        "next",
        "@clerk/nextjs",
        "tailwindcss",
        "@radix-ui/react-dialog"
    ]
    
    try:
        # Check if npm is available
        result = subprocess.run(["npm", "list", "--depth=0"], 
                              capture_output=True, text=True, cwd="frontend")
        if result.returncode == 0:
            installed_packages = result.stdout
            print("✓ npm is available")
            
            # Check for each required package
            for package in required_packages:
                if package in installed_packages:
                    print(f"✓ Node package '{package}' is installed")
                else:
                    print(f"✗ Node package '{package}' is not installed")
            return True
        else:
            print("✗ npm is not available or frontend directory not found")
            return False
    except Exception as e:
        print(f"✗ Error checking Node.js packages: {e}")
        return False

def main():
    print("PrepSphere Environment Checker")
    print("=" * 40)
    
    # Check Python version
    python_ok = check_python_version()
    
    # Check system commands
    commands = [
        ("node --version", "Node.js"),
        ("npm --version", "npm"),
        ("psql --version", "PostgreSQL")
    ]
    
    commands_ok = True
    for command, name in commands:
        if not check_command(command, name):
            commands_ok = False
    
    # Check Python packages
    python_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2",
        "pydantic",
        "python-multipart",
        "clerk-sdk-python"
    ]
    
    packages_ok = True
    for package in python_packages:
        if not check_python_package(package):
            packages_ok = False
    
    # Check Node.js packages
    node_ok = check_node_packages()
    
    print("\n" + "=" * 40)
    if python_ok and commands_ok and packages_ok and node_ok:
        print("✓ All checks passed! Your environment is ready for PrepSphere.")
        print("\nNext steps:")
        print("1. Set up your database")
        print("2. Configure environment variables")
        print("3. Run the application")
    else:
        print("✗ Some checks failed. Please install the missing components.")
        print("Refer to SETUP_INSTRUCTIONS.md for detailed installation guides.")

if __name__ == "__main__":
    main()