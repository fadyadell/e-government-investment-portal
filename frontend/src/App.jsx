import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StatusPage from './pages/StatusPage';
import ApprovalDashboard from './pages/ApprovalDashboard';
import SubmissionForm from './pages/SubmissionForm';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<StatusPage />} />
              <Route path="/approvals" element={<ApprovalDashboard />} />
              <Route path="/submit" element={<SubmissionForm />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
