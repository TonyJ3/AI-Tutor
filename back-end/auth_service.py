import bcrypt
from fastapi import HTTPException
from supabase import Client


class AuthService:

    # Contructor
    def __init__(self, supabase_client: Client):
        self.client = supabase_client

    def hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def create_teacher_account(self, username: str, password: str, role: str, name: str):
        hashed = self.hash_password(password)

        account = self.client.table("account").insert({
            "username": username,
            "password": hashed,
            "role": role
        }).execute()

        user_id = account.data[0]["id"]

        self.client.table("teacher").insert({
            "user_id": user_id,
            "name": name
        }).execute()

        print("Teacher account created.")

    def create_student_account(self, username: str, password: str, role: str, name: str, class_id: str):
        hashed = self.hash_password(password)

        account = self.client.table("account").insert({
            "username": username,
            "password": hashed,
            "role": role
        }).execute()

        user_id = account.data[0]["id"]

        self.client.table("student").insert({
            "user_id": user_id,
            "name": name,
            "class_id": class_id
        }).execute()

        print("Student account created.")

    def assign_teacher_to_subject(self, teacher_user_id: str, subject_id: str, class_id: str):
        self.client.table("teacher_class_subject").insert({
            "teacher_id": teacher_user_id,
            "subject_id": subject_id,
            "class_id": class_id
        }).execute()
        print("Assigned subject to teacher in class.")

    def login_user(self, username: str, password: str):
        try:
            result = self.client.table("account").select("*").eq("username", username).execute()

            if not result.data:
                raise HTTPException(status_code=401, detail="Invalid username or password")

            user = result.data[0]
            hashed_password = user["password"]

            if not bcrypt.checkpw(password.encode(), hashed_password.encode()):
                raise HTTPException(status_code=401, detail="Invalid username or password")

            return {
                "id": user["id"],
                "role": user["role"]
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Login failed: {e}")
            raise HTTPException(status_code=500, detail="Login error")
