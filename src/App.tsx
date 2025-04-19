import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsList from "./ProjectsList";
import GraphList from "./GraphList"
import Editor from "./Editor";
import AuthPage from "./AuthPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage/>}></Route>
        <Route path="/" element={<ProjectsList />} />/
        <Route path="/projects/:ProjectID" element={<GraphList />} />
        <Route path="/graphs/:GraphID" element={<Editor />} />
      </Routes>
    </Router>
  );
};

export default App;