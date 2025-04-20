import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

interface Project {
  id: number;
  name: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { token: refreshToken });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/auth');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get<Project[]>('/api/v1/projects');
        const updatedProjects = response.data.sort((a, b) => a.id - b.id);
        setProjects(updatedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    try {
      const newProject = { Name: 'Новый проект' };
      const response = await api.post<Project>('/api/v1/projects', newProject);
      setProjects([...projects, response.data]);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await api.delete(`/api/v1/projects/${id}`);
      setProjects(projects.filter((project) => project.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: number, currentName: string) => {
    setEditingProjectId(id);
    setNewName(currentName);
  };

  const handleSaveProject = async (id: number) => {
    try {
      await api.put(`/api/v1/projects/${id}`, { Name: newName });
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === id ? { ...project, name: newName } : project
        )
      );
      setEditingProjectId(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Список проектов</h1>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isLoggingOut ? 0.7 : 1
          }}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
      
      <button 
        onClick={handleAddProject}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Добавить проект
      </button>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map((project) => (
          <li
            key={project.id}
            style={{
              cursor: 'pointer',
              marginBottom: '10px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa'
            }}
            onClick={() => handleProjectClick(project.id)}
          >
            {editingProjectId === project.id ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    marginRight: '10px',
                    padding: '5px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveProject(project.id);
                  }}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>{project.name}</h2>
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project.id, project.name);
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#ffc107',
                      color: '#212529',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Изменить
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsList;