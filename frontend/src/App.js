import React, { useState } from 'react';
import './App.css'; // Import the CSS file for App component

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [score, setScore] = useState(null);
  const [resumeData, setResumeData] = useState(null); // State to store resume data
  const [error, setError] = useState('');

  const handleResumeUpload = (event) => {
    setResume(event.target.files[0]);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!resume || !jobDescription) {
      setError('Please upload a resume and enter a job description.');
      return;
    }

    setError('');
    const formData = new FormData();
    formData.append('file', resume); // Ensure the key matches the backend expectation
    formData.append('job_description', jobDescription); // Ensure the key matches the backend expectation

    try {
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setScore(result.score.toFixed(2)); // Format the score to two decimal places
        setResumeData(result.data); // Set the resume data
        setError(null);
      } else {
        setError(result.error);
        setScore(null);
        setResumeData(null); // Clear the resume data
      }
    } catch (err) {
      setError('An error occurred while uploading the file.');
      setScore(null);
      setResumeData(null); // Clear the resume data
    }
  };

  const renderResumeData = () => {
    if (!resumeData) return null;

    return (
      <table className="resume-data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resumeData).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Resume Analyzer</h1>
        <form className="upload-form" onSubmit={handleSubmit}>
          <input type="file" onChange={handleResumeUpload} />
          <textarea
            placeholder="Enter job description here..."
            value={jobDescription}
            onChange={handleJobDescriptionChange}
          />
          <button type="submit">Analyze Resume</button>
        </form>
        {error && <div className="error">{error}</div>}
        {score !== null && (
          <div className="score-display">
            <h2>Resume Score</h2>
            <p>{score} / 100</p>
          </div>
        )}
        {resumeData && (
          <div className="result">
            <h2>Resume Data</h2>
            {renderResumeData()}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;