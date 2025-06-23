from supabase import Client

class Assignment:
    
    def __init__(self, supabase_client: Client):
        self.client = supabase_client

    def save(self, student_id: int, file_id: str, file_name: str, file_url: str):
        try:
            response = self.client.table("student_assignment").insert({
                "student_id": student_id,
                "file_id": file_id,
                "file_name": file_name,
                "file_url": file_url
            }).execute()
            print("Payload being inserted:", response.data)

            return response
        
        except Exception as e:
            print(f"Failed to save assignment to Supabase: {e}")
            return None
    
    # Get all files by student_id
    def get_by_student_id(self, student_id: int):
        try:
            response = self.client.table("student_assignment").select("*").eq("student_id", student_id).execute()
            return response.data
        
        except Exception as e:
            print(f"Error fetching assignments for student {student_id}: {e}")
            return []
        
    
