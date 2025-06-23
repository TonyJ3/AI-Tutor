import bcrypt
from supabase import create_client

# Supabase credentials
url = "https://filntjkaxvvipuaceodm.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpbG50amtheHZ2aXB1YWNlb2RtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDEwMDU1MCwiZXhwIjoyMDU5Njc2NTUwfQ.CWcBOkntWzdAP1K9DQoRz6Tu0UZZ9S0WwStQozZ310o"
supabase = create_client(url, key)

# Hash password function
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# Create Teacher Account
def create_teacher_account(username, password, role,name):
    hashed = hash_password(password)

    # 1. Insert into accounts
    account = supabase.table("account").insert({
        "username": username,
        "password": hashed,
        "role": role
    }).execute()

    user_id = account.data[0]["id"]

    # 2. Insert into teachers
    supabase.table("teacher").insert({
        "user_id": user_id,
        "name":name
    }).execute()

    print("Teacher account created.")

# Create Student Account
def create_student_account(username, password, role,name, class_id):
    hashed = hash_password(password)

    # 1. Insert into accounts
    account = supabase.table("account").insert({
        "username": username,
        "password": hashed,
        "role": role
    }).execute()

    user_id = account.data[0]["id"]

    # # 2. Insert into students
    supabase.table("student").insert({
        "user_id": user_id,
        "name":name,
        "class_id": class_id
    }).execute()

    print("Student account created.")
def assign_teacher_to_subject(teacher_user_id, subject_id, class_id):
    response = supabase.table("teacher_class_subject").insert({
        "teacher_id": teacher_user_id,
        "subject_id": subject_id,
        "class_id": class_id
    }).execute()
    print("Assigned subject to teacher in class")
# create_teacher_account("John", "securePass123", "teacher", "Jonh Smith")

create_student_account("Jerry@gmail.com", "123456", "student", "Jerry Berry", "10")