from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), jobDescription: str = Form(...)):
    try:
        contents = await file.read()
        # Process the file contents and job description here
        # For example, you can analyze the resume against the job description
        score = 85  # Dummy score for demonstration
        resume_data = {"name": "John Doe", "experience": "5 years"}  # Dummy data for demonstration
        return JSONResponse(content={"score": score, "data": resume_data})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=422)
