import React, { useState } from 'react';
import axios from 'axios';
import './UploadResume.css'; // Import the CSS file for styling

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [resumeData, setResumeData] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
    setMessage(""); // Clear previous message on new file selection
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Upload successful!");
      setResumeData(response.data.data);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.detail || "Upload failed"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="upload-card">
        <h2>📄 Upload Your Resume</h2>
        <label>
          <span>Choose a PDF file</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        <label>
          <span>Job Description</span>
          <textarea
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            className="job-description-input"
          />
        </label>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`upload-button ${uploading ? "uploading" : ""}`}
        >
          {uploading ? (
            <>
              <span className="loader"></span>
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>
        {message && (
          <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message.includes("✅") ? "✔️" : "⚠️"} {message}
          </p>
        )}
      </div>
      {resumeData && (
        <div className="resume-data">
          <h3>Extracted Resume Data</h3>
          <pre>{JSON.stringify(resumeData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}