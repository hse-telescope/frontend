import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get<Project[]>('/api/v1/projects');
      const updatedProjects = response.data.sort((a, b) => a.id - b.id);
      setProjects(updatedProjects);
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    const newProject = { Name: 'Новый проект' };
    const response = await axios.post<Project>('/api/v1/projects', newProject);
    setProjects([...projects, response.data]);
  };

  const handleDeleteProject = async (id: number) => {
    await axios.delete(`/api/v1/projects/${id}`);
    setProjects(projects.filter((project) => project.id !== id));
  };

  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: number, currentName: string) => {
    setEditingProjectId(id);
    setNewName(currentName);
  };

  const handleSaveProject = async (id: number) => {
    await axios.put(`/api/v1/projects/${id}`, { Name: newName });

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, name: newName } : project
      )
    );

    setEditingProjectId(null);
  };

  return (
    <div>
      <h1>Список проектов</h1>
      <button onClick={handleAddProject}>Добавить проект</button>
      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            style={{ cursor: 'pointer', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}
            onClick={() => handleProjectClick(project.id)}
          >
            {editingProjectId === project.id ? (
              <div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginRight: '10px' }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveProject(project.id);
                  }}
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <div>
                <h2>{project.name}</h2>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
            >
              Удалить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(project.id, project.name);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'blue', color: 'white' }}
            >
              Изменить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsList;