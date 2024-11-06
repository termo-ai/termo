# app/services/directory.py
import os
from typing import List, Dict, Any

class DirectoryService:
    @staticmethod
    def get_directory_structure(path: str = "") -> List[Dict[str, Any]]:
        """
        Get the directory structure for the given path
        """
        base_path = os.path.join(os.getcwd(), path)
        directory_structure = []
        
        try:
            for item in os.listdir(base_path):
                full_path = os.path.join(base_path, item)
                is_dir = os.path.isdir(full_path)
                directory_structure.append({
                    "name": item,
                    "isFolder": is_dir,
                    "path": os.path.join(path, item) if path else item
                })
                
            return directory_structure
            
        except Exception as e:
            raise Exception(f"Error accessing directory: {str(e)}")

directory_service = DirectoryService()