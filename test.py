import os

def scan_directory(directory, ignored_dirs=None):
    """
    Recursively scan the directory and return a list of project structure
    excluding specified ignored directories.
    """
    if ignored_dirs is None:
        ignored_dirs = ['node_modules', '.git']  # Default ignored directories
    
    project_structure = []

    for root, dirs, files in os.walk(directory):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        
        # Add directory to project structure
        project_structure.append(os.path.relpath(root, directory))
        
        # Add files in the directory
        for file in files:
            project_structure.append(os.path.join(os.path.relpath(root, directory), file))

    return project_structure

def display_structure(structure):
    """Displays the project structure in a formatted manner."""
    for item in structure:
        print(item)

def main():
    directory = input("Enter the path of the project directory: ")
    if not os.path.isdir(directory):
        print("Invalid directory path.")
        return
    
    ignored_dirs = ['node_modules', '.git']  # Directories to ignore (can be modified)
    structure = scan_directory(directory, ignored_dirs)
    display_structure(structure)

if __name__ == "__main__":
    main()
