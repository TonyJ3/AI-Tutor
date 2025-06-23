from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import openai
from pydantic import BaseModel
from datetime import datetime
import requests
import time
from pydantic import BaseModel
from supabase import create_client
import uuid
from dotenv import load_dotenv
import os

from log import Log
from assignment import Assignment
from auth_service import AuthService

# Load .env file
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise EnvironmentError("Supabase credentials are not set in environment variables.")

if not OPENAI_API_KEY:
    raise EnvironmentError("Missing OPENAI_API_KEY in .env file.")

# Set Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set openAI API key
openai.api_key = OPENAI_API_KEY

# Initialize classes
logger = Log(supabase)
auth_service = AuthService(supabase)
assignment = Assignment(supabase)

# Vector database ID for student upload homework
VECTOR_DATABASE_ID_STUDENT = "vs_682b2108816c8191b38918fef8462a8e"


# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://127.0.0.1:5500",
    "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChatRequest model
# BaseModel is a validation check
class ChatRequest(BaseModel):
    message: str
    assistant_id: str
    student_id: str
    title: str 
        
# Send message to OpenAI assistant 
@app.post("/chat")
async def chat_with_assistant(req: ChatRequest):
    
    # Find the thread by user_id and title
    result = supabase.table("student_threads").select("thread_id").eq("student_id", req.student_id).eq("title", req.title).limit(1).execute()
        
    if result.data and len(result.data) > 0:
        # Thread already exists for user+title
        thread_id = result.data[0]["thread_id"]
        print(f"Found existing thread: {thread_id} for student: {req.student_id}, title: {req.title}")
    else:
        # Create a new thread
        thread = openai.beta.threads.create()
        thread_id = thread.id
        print(f"Creating new thread for student: {req.student_id}, title: {req.title} → {thread_id}")

        # Save to Supabase
        supabase.table("student_threads").insert({
            "student_id": req.student_id,
            "thread_id": thread_id,
            "title": req.title,
        }).execute()

    # Add user message with thread id
    openai.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=req.message
    )

    # Run assistant
    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=req.assistant_id
    )

    # Wait for it to complete
    while True:
        run_status = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        if run_status.status == "completed":
            break

    # Get the assistant response
    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    assistant_msg = None
    for message in messages.data:
        if message.role == "assistant":
            assistant_msg = message.content[0].text.value
            break  # take the first assistant response

    # Save log only after assistant_msg is available
    logger.save(user_input=req.message, assistant_output=assistant_msg or "", created_at=datetime.now(),user_id=req.student_id)

    return {"response": assistant_msg or "Geen antwoord gevonden van de assistent."}

# Get all logs
@app.get("/logs")
async def get_logs():
    logs = logger.get_all()
    return logs

# Upload lesson to vector ID
@app.post("/lessons")
async def upload_lesson(file: UploadFile = File(...), vector_store_id: str = Form(...)):
    # Reads the file
    contents = await file.read()

    # Upload file to openAI
    file_response = requests.post(
        "https://api.openai.com/v1/files",
        headers = {"Authorization": f"Bearer {openai.api_key}"},
        files = {"file": (file.filename, contents)},
        data = {"purpose": "assistants"}
    )

    if file_response.status_code != 200:
        return {"error": "Failed to upload to OpenAI", "details": file_response.json()}
    
    # Assign file id
    file_id = file_response.json()["id"]

    # Attatch file to vector storage
    vector_response = requests.post(
        f"https://api.openai.com/v1/vector_stores/{vector_store_id}/files",
        headers = {
            "Authorization": f"Bearer {openai.api_key}",
            "OpenAI-Beta": "assistants=v2"
        },
        json={"file_id": f"{file_id}"}
    )

    if vector_response.status_code != 200:
        return {"error": "Failed to attach file", "details": vector_response.json()}

    return {
        "message": "File uploaded successfully", "filename": file.filename
    }

# Get all upload english lessons by vector ID
@app.get("/lessons")
async def get_lesson(vector_store_id: str = Query(...)):
    vector_response = requests.get(
        f"https://api.openai.com/v1/vector_stores/{vector_store_id}/files",
        headers= {
            "Authorization": f"Bearer {openai.api_key}",
            "OpenAI-Beta": "assistants=v2"
        }
    )

    if vector_response.status_code != 200:
        return {"error": "Failed to fetch vector store", "status": vector_response.status_code}

    data = vector_response.json()
    file_ids = data.get("data", [])

    files = []
    for file_obj in file_ids:
        file_id = file_obj.get("id")
        if file_id:
            file_response = requests.get(
                f"https://api.openai.com/v1/files/{file_id}",
                headers = {"Authorization": f"Bearer {openai.api_key}"}
            )
        if file_response.status_code == 200:
            files.append(file_response.json())
        else:
            files.append({
                "id": file_id,
                "error": f"Failed to retrieve file metadata (status {file_response.status_code})"
            })

    return {"files": files}

# Upload assignment from student
@app.post("/assignments")
async def upload_lesson(file: UploadFile = File(...), student_id: str = Form(...)):
    contents = await file.read()

    # upload to OpenAI    
    file_response = requests.post(
        "https://api.openai.com/v1/files",
        headers={"Authorization": f"Bearer {openai.api_key}"},
        files={"file": (file.filename, contents)},
        data={"purpose": "assistants"}
    ) 

    if file_response.status_code != 200:
        return {"error": "File upload failed", "details": file_response.json()}

    file_id = file_response.json()["id"]

    #wachten voor de add
    for _ in range(10):
        check = requests.get(
            f"https://api.openai.com/v1/files/{file_id}",
            headers={"Authorization": f"Bearer {openai.api_key}"}
        )
        status = check.json().get("status")
        if status == "processed":
            break
        time.sleep(1)

    if status != "processed":
        return {"error": "File not ready for vectorstore yet"}

    # Upload to OpenAI vector database
    vector_response = requests.post(
        f"https://api.openai.com/v1/vector_stores/{VECTOR_DATABASE_ID_STUDENT}/files",
        headers={
            "Authorization": f"Bearer {openai.api_key}",
            "OpenAI-Beta": "assistants=v2"
        },
        json={"file_id": file_id}
    )

    if vector_response.status_code != 200:
        return {"error": "Vectorstore koppeling mislukt", "details": vector_response.json()}

    # Generate random unique identifier for file
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    # Define path in Supabase Storage
    file_path = f"assignments/{student_id}/{unique_filename}"

    # Upload file to Supabase Storage
    supabase.storage.from_("pdfs").upload(file_path, contents, {
        "content-type": file.content_type
    })

    # Save assigment to database
    assignment.save(student_id, file_id, file.filename, file_path)

    return {
        "message": "Upload en koppeling geslaagd",
        "student_id": student_id,
        "file_id": file_id,
        "filename": file.filename
    }

# Get all assignment from student by student ID
@app.get("/assignments")
def get_student_files(student_id: str = Query(...)):
    try:
        # Fetch all assignment records from the database for the given student_id
        data = assignment.get_by_student_id(student_id)

        if not data:
            return JSONResponse(content={"files": []})

        return {"files": data}
    
    except Exception as e:
        print(f"Error fetching student files: {e}")
        raise HTTPException(status_code=500, detail="Error fetching student files")

# LoginRequest model
class LoginRequest(BaseModel):
    username: str
    password: str

# Login
@app.post("/login")
def login(request: LoginRequest):
    return auth_service.login_user(request.username, request.password)

# Get student name by student id
@app.get("/student-name/{student_id}")
def get_student_name(student_id: int):
    response = supabase.table("student").select("name").eq("user_id", student_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"name": response.data["name"]}

# Get total prompt group by student
@app.get("/prompt-counts")
def get_prompt_counts():
    try:
        # get_promt_counts: SELECT s.name, c.classname, COUNT(*) AS prompt_count FROM logs l JOIN student s ON 
        # l.user_id = s.user_id JOIN classes c ON s.class_id = c.id WHERE l.user_id IS NOT NULL GROUP BY s.name, c.classname;
        result = supabase.rpc("get_prompt_counts").execute()
        return result.data
    except Exception as e:
        print("Error fetching prompt counts:", e)
        return {"error": "Failed to fetch prompt counts"}

# Get students
@app.get("/students")
def get_students():
    response = supabase.table("student").select("user_id", "name").execute()
    return response.data

