import React from 'react';
import './ResumeData.css';

const ResumeData = ({ data }) => {
  return (
    <div className="resume-data">
      <h2>Extracted Data</h2>
      {data.name && <p><strong>Name:</strong> {data.name}</p>}
      {data.email && <p><strong>Email:</strong> {data.email}</p>}
      {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
      {data.linkedin_github_links && (
        <div>
          <strong>LinkedIn/GitHub Links:</strong>
          <ul>
            {data.linkedin_github_links.map((link, index) => (
              <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}
      {data.skills && (
        <div>
          <strong>Skills:</strong>
          <ul>
            {data.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
      {data.education && (
        <div>
          <strong>Education:</strong>
          <ul>
            {data.education.map((edu, index) => (
              <li key={index}>{edu}</li>
            ))}
          </ul>
        </div>
      )}
      {data.experience && (
        <div>
          <strong>Experience:</strong>
          <ul>
            {data.experience.map((exp, index) => (
              <li key={index}>{exp}</li>
            ))}
          </ul>
        </div>
      )}
      {data.projects && (
        <div>
          <strong>Projects:</strong>
          <p>{data.projects}</p>
        </div>
      )}
      {data.certifications && (
        <div>
          <strong>Certifications:</strong>
          <p>{data.certifications}</p>
        </div>
      )}
      {data.summary && (
        <div>
          <strong>Summary:</strong>
          <p>{data.summary}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeData;
