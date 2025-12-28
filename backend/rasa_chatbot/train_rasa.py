"""
Safe Rasa training script for Windows with permission error fixes.
"""
import os
import sys
import tempfile
import shutil
from pathlib import Path

# Create a local temp directory
TEMP_DIR = Path(__file__).parent / "temp_training"
TEMP_DIR.mkdir(exist_ok=True)

# Set environment variables to use local temp
os.environ['TEMP'] = str(TEMP_DIR)
os.environ['TMP'] = str(TEMP_DIR)
os.environ['TMPDIR'] = str(TEMP_DIR)

print(f"Using temporary directory: {TEMP_DIR}")

# Patch shutil.rmtree to handle permission errors gracefully
original_rmtree = shutil.rmtree

def safe_rmtree(path, *args, **kwargs):
    """Safely remove directory tree, handling Windows permission issues."""
    import stat

    def handle_remove_readonly(func, path, exc):
        """Error handler to handle readonly files."""
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception as e:
            # Just log and continue - cleanup errors are not critical
            print(f"  (Cleanup warning: {path} - {e})")

    # Override onerror parameter
    kwargs['onerror'] = handle_remove_readonly
    try:
        original_rmtree(path, *args, **kwargs)
    except Exception as e:
        print(f"  (Cleanup warning: {e})")

# Apply the patch
shutil.rmtree = safe_rmtree

print("✓ Applied permission error patches")
print("✓ Starting Rasa training...\n")

# Now import and run Rasa
try:
    from rasa.__main__ import main
    sys.argv = ['rasa', 'train']
    main()
except Exception as e:
    print(f"\nTraining failed with error: {e}")
    sys.exit(1)

print("\n✓ Training completed!")
print(f"\nNote: Temporary files in {TEMP_DIR} can be manually deleted if needed.")
