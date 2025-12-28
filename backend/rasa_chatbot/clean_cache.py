
import shutil
import os

cache_dir = os.path.join('.rasa', 'cache')

if os.path.exists(cache_dir):
    try:
        shutil.rmtree(cache_dir)
        print(f"Successfully removed cache directory: {cache_dir}")
    except Exception as e:
        print(f"Error removing cache directory: {e}")
else:
    print(f"Cache directory not found: {cache_dir}")
