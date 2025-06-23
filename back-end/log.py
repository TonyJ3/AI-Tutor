from supabase import Client
from datetime import datetime

class Log:

    # Contructor
    def __init__(self, supabase_client: Client):
        self.client = supabase_client

    # Create log
    def save(self, user_input: str,assistant_output:str, created_at: datetime,user_id):
        try:
            response = self.client.table("logs").insert({
                "input": user_input,
                "datetime": created_at.isoformat(),
                "output": assistant_output,
                "user_id": user_id 
            }).execute()

            return response
        
        except Exception as e:
            print(f"Failed to save log to Supabase: {e}")
            return None
        
    def get_all(self):
        result = self.client.table("logs").select("*").order("datetime", desc=True).execute()
        return result.data
     