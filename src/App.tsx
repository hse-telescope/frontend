// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsList from "./ProjectsList";
import GraphList from "./GraphList";
import Editor from "./Editor";
import AuthPage from "./pages/AuthPage";
// import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage/>}></Route>
        <Route path="/" element={<ProjectsList />} />/
        <Route path="/projects/:ProjectID" element={<GraphList />} />
        <Route path="/graphs/:GraphID" element={<Editor />} />
{/* <!--         <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        } />
        <Route path="/projects/:projectId" element={
          <ProtectedRoute>
            <GraphList />
          </ProtectedRoute>
        } />
        <Route path="/graphs/:graphId" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/auth" replace />} /> --> */}
      </Routes>
    </Router>
  );
};

export default App;