import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Project {
  ID: number;
  Name: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get<Project[]>('/api/v1/projects');
      const updatedProjects = response.data.sort((a, b) => a.ID - b.ID);
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
    setProjects(projects.filter((project) => project.ID !== id));
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
        project.ID === id ? { ...project, Name: newName } : project
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
            key={project.ID}
            style={{ cursor: 'pointer', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}
            onClick={() => handleProjectClick(project.ID)}
          >
            {editingProjectId === project.ID ? (
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
                    handleSaveProject(project.ID);
                  }}
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <div>
                <h2>{project.Name}</h2>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.ID);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
            >
              Удалить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(project.ID, project.Name);
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