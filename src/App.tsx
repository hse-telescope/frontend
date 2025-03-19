import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsList from "./ProjectsList";
import GraphList from "./GraphList"
import Editor from "./Editor";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<ProjectsList />} />/
        <Route path="/projects/:ProjectID" element={<GraphList />} />
        <Route path="/graphs/:GraphID" element={<Editor />} />
      </Routes>
    </Router>
  );
};

export default App;