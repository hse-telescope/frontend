import React, { useState, useEffect } from 'react';
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
  Paper,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  MenuItem, 
  Select
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import api from './api';
// import axios from 'axios';
// import api from './api';

interface Project {
  id: number;
  name: string;
}

interface ProjectWithRole {
  project: Project;
  role: string;
}

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithRole[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [roleLogin, setRoleLogin] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');


  // const handleLogout = async () => {
  //   try {
  //     const refreshToken = localStorage.getItem('refreshToken');
  //     if (refreshToken) {
  //       await api.post('/auth/logout', { token: refreshToken });
  //     }
  //   } finally {
  //     localStorage.removeItem('accessToken');
  //     localStorage.removeItem('refreshToken');
  //     navigate('/auth');
  //   }
  // };

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await api.get<ProjectWithRole[]>('/api/core/projects');
      const updatedProjects = response.data.sort((a, b) => a.project.id - b.project.id);
      console.log(updatedProjects)
      setProjects(updatedProjects);
    };

    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    const newProject = { Name: 'Новый проект' };
    const response = await api.post<Project>('/api/core/projects', newProject);
    const newProjectWithRole: ProjectWithRole = {
      project: response.data,
      role: 'owner'
    }
    setProjects([...projects, newProjectWithRole]);
  };

  const handleDeleteProject = async (id: number) => {
    await api.delete(`/api/core/projects/${id}`);
    setProjects(projects.filter((project) => project.project.id !== id));
  };

  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: number, currentName: string) => {
    setEditingProjectId(id);
    setNewName(currentName);
  };

  const handleSaveProject = async (id: number) => {
    await api.put(`/api/core/projects/${id}`, { Name: newName });

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.project.id === id
          ? {
              ...project,
              project: {
                ...project.project,
                name: newName
              }
            }
          : project
      )
    );
    

    setEditingProjectId(null);
  };

  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);

  interface ProjectUser {
    username: string;
    role: string;
  }


  const handleOpenRoleDialog = async (projectId: number) => {
    setSelectedProjectId(projectId);
    setRoleLogin('');
    setSelectedRole('viewer');
    setOpenRoleDialog(true);
  
    try {
      const res = await api.get<{ users: ProjectUser[] }>(`/auth/projectUsers`, {
        params: { project_id: projectId }
      });
      console.log(res.data)
      setProjectUsers(res.data.users);
      console.log(projectUsers)
    } catch (error) {
      console.error('Ошибка при получении пользователей проекта', error);
    }
  };

  useEffect(() => {
    console.log('Обновлён projectUsers:', projectUsers);
  }, [projectUsers]);
  
  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setProjectUsers([]);
  };
  
  const handleAssignOrUpdateRole = async () => {
    if (!roleLogin || !selectedProjectId) return;
  
    const userExists = projectUsers.some(u => u.username === roleLogin);
  
    const payload = {
      username: roleLogin,
      project_id: selectedProjectId,
      role: selectedRole
    };
  
    try {
      if (userExists) {
        await api.put('/auth/updateRole', payload);
      } else {
        await api.post('/auth/assignRole', payload);
      }
    } catch (error) {
      console.error('Ошибка при назначении/обновлении роли', error);
    }
  
    handleCloseRoleDialog();
  };
  
  const handleDeleteRole = async () => {
    if (!roleLogin || !selectedProjectId) return;
  
    try {
      await api.delete('/auth/deleteRole', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          username: roleLogin,
          project_id: selectedProjectId
        }
      });
    } catch (error) {
      console.error('Ошибка при удалении роли', error);
    }
  
    handleCloseRoleDialog();
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
            key={project.project.id} 
            elevation={3} 
            sx={{ mb: 2 }}
          >
            <ListItemButton 
              component="div"
              sx={{ 
                '&:hover': { backgroundColor: 'action.hover' },
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => handleProjectClick(project.project.id)}
            >
              {editingProjectId === project.project.id ? (
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
                      handleSaveProject(project.project.id);
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Box>
              ) : (
                <ListItemText 
                  primary={
                    <Typography variant="h6">
                      {project.project.name}
                    </Typography>
                  } 
                />
              )}
              
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {project.role !== 'viewer' && (
                  <>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project.project.id, project.project.name);
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
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.project.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
                {project.role === 'owner' && (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRoleDialog(project.project.id);
                  }}
                >
                  Управление ролями
                </Button>
              )}
              </Box>

            </ListItemButton>
          </Paper>
          
          
        ))}
      </List>
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>Управление ролями</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Логин пользователя"
            value={roleLogin}
            onChange={(e) => setRoleLogin(e.target.value)}
          />
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="viewer">viewer</MenuItem>
            <MenuItem value="editor">editor</MenuItem>
          </Select>
          {projectUsers.map((user) => (
            <Box
              key={user.username}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderBottom: '1px solid #ccc'
              }}
            >
              <Typography>{user.username}</Typography>
              <Typography variant="body2" color="text.secondary">{user.role}</Typography>
            </Box>
          ))}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignOrUpdateRole} color="primary" variant="contained">
            Добавить / Обновить
          </Button>
          <Button onClick={handleDeleteRole} color="error">
            Удалить
          </Button>
          <Button onClick={handleCloseRoleDialog}>Отмена</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );

};

export default ProjectsList;