# app/services/directory.py
import os
from typing import List, Dict, Any

class DirectoryService:
    @staticmethod
    def get_directory_structure() -> List[Dict[str, Any]]:
        """
        Get the directory structure for the data directory
        """
        data_dir = os.path.join(os.getcwd(), "data")
        directory_structure = []
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        try:
            for item in os.listdir(data_dir):
                full_path = os.path.join(data_dir, item)
                is_dir = os.path.isdir(full_path)
                directory_structure.append({
                    "name": item,
                    "isFolder": is_dir,
                    "path": os.path.join("data", item)
                })
                
            return directory_structure
            
        except Exception as e:
            raise Exception(f"Error accessing directory: {str(e)}")

directory_service = DirectoryService()