"""
Fix for RASA Windows path issue with \\?\ prefix
This patches the local_model_storage.py to handle Windows paths correctly
"""

import os
import shutil
from pathlib import Path

def fix_rasa_windows_path():
    # Find the RASA installation
    import rasa
    rasa_path = Path(rasa.__file__).parent
    
    target_file = rasa_path / "engine" / "storage" / "local_model_storage.py"
    
    if not target_file.exists():
        print(f"Could not find {target_file}")
        return False
    
    # Create backup
    backup_file = target_file.with_suffix('.py.backup')
    if not backup_file.exists():
        shutil.copy(target_file, backup_file)
        print(f"Created backup: {backup_file}")
    
    # Read the file
    content = target_file.read_text(encoding='utf-8')
    
    # Fix the problematic line
    old_line = 'tar.extractall(f"\\\\?\\{temporary_directory}")'
    new_line = 'tar.extractall(str(temporary_directory))'
    
    if old_line in content:
        content = content.replace(old_line, new_line)
        target_file.write_text(content, encoding='utf-8')
        print(f"Fixed Windows path issue in {target_file}")
        return True
    else:
        print("Path already fixed or different RASA version")
        return False

if __name__ == "__main__":
    print("Fixing RASA Windows path issue...")
    if fix_rasa_windows_path():
        print("\nFix applied successfully!")
        print("Now run: rasa run --enable-api --cors \"*\" --port 5005")
    else:
        print("\nNo changes made")