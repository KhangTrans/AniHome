import React, { useState } from 'react';
import { AlertTriangle, UserX, MessageSquare } from 'lucide-react';

const ReportManager = () => {
  const [reports, setReports] = useState([
    { id: 1, type: 'Scam', target: 'ShelterABC', reporter: 'User123', detail: 'Asking for direct bank transfer' },
    { id: 2, type: 'Harassment', target: 'Comment456', reporter: 'User789', detail: 'Rude language in comments' },
  ]);

  const resolveReport = (id) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="mb-4">Reported Content</h1>
      <div className="flex flex-col gap-4">
        {reports.map(report => (
          <div key={report.id} className="card flex justify-between items-center bg-red-50" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle size={20} color="var(--danger)" />
                 <h3 style={{ fontSize: '1.1rem' }}>{report.type}</h3>
               </div>
               <p style={{ marginBottom: '0.5rem' }}><strong>Target:</strong> {report.target} | <strong>Reporter:</strong> {report.reporter}</p>
               <p style={{ color: 'var(--gray)' }}>"{report.detail}"</p>
            </div>
            <div className="flex flex-col gap-2">
                <button className="btn btn-primary" onClick={() => resolveReport(report.id)}>Ban User</button>
                <button className="btn btn-outline" onClick={() => resolveReport(report.id)}>Dismiss</button>
            </div>
          </div>
        ))}
         {reports.length === 0 && (
          <div className="text-center p-4">
              <CheckCircle size={48} color="var(--success)" style={{ display: 'block', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--gray)' }}>All clear! No reports pending.</p>
          </div>
      )}
      </div>
    </div>
  );
};

export default ReportManager;
