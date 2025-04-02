import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  IconButton,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Список проектов
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAddProject}
        sx={{ mb: 3 }}
      >
        Добавить проект
      </Button>
      
      <List>
        {projects.map((project) => (
          <Paper 
            key={project.id} 
            elevation={3} 
            sx={{ mb: 2 }}
          >
            <ListItemButton 
              component="div" // Используем div как базовый элемент
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => handleProjectClick(project.id)}
            >
              {editingProjectId === project.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ flexGrow: 1, mr: 1 }}
                  />
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProject(project.id);
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Box>
              ) : (
                <ListItemText 
                  primary={
                    <Typography variant="h6">
                      {project.name}
                    </Typography>
                  } 
                />
              )}
              
              <Box sx={{ ml: 'auto' }}>
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project.id, project.name);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItemButton>
          </Paper>
        ))}
      </List>
    </Box>
  );

};

export default ProjectsList;