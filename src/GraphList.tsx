import React, { useState, useEffect } from 'react';
import api from './api';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface Graph {
  id: number;
  project_id: number;
  name: string;
}


const GraphList: React.FC = () => {
  const { ProjectID } = useParams<{ ProjectID: string }>();
  if (!ProjectID) {
    return <div>Project ID is missing</div>;
  }
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [editingGraphId, setEditingGraphId] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);

  type GraphResponse = {
    can_edit: boolean;
    graphs: Graph[];
  };
  
  useEffect(() => {
    const fetchGraphs = async () => {
      const response = await api.get<GraphResponse>(`/core/api/core/projects/${ProjectID}/graphs`);
      const updatedGraphs = response.data.graphs.sort((a, b) => a.id - b.id);
      setGraphs(updatedGraphs);
      setCanEdit(response.data.can_edit);
    };
  
    fetchGraphs();
  }, [ProjectID]);
  

  const handleAddGraph = async () => {
    const response = await api.post<Graph>(
      '/core/api/core/graphs',
      {
        project_id: parseInt(ProjectID, 10),
        name: 'Новая диаграмма',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    setGraphs([...graphs, response.data]);
  };

  const handleDeleteGraph = async (id: number) => {
    await api.delete(`/core/api/core/graphs/${id}`);
    setGraphs(graphs.filter((graph) => graph.id !== id));
  };

  const handleGraphClick = (id: number) => {
    navigate(`/graphs/${id}`);
  };

  const handleEditGraph = (id: number, currentName: string) => {
    setEditingGraphId(id);
    setNewName(currentName);
  };

  const handleSaveGraph = async (id: number) => {
    await api.put(
      `/core/api/core/graphs/${id}`,
      {
        project_id: parseInt(ProjectID, 10),
        name: newName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    setGraphs((prevGraphs) =>
      prevGraphs.map((graph) =>
        graph.id === id ? { ...graph, name: newName } : graph
      )
    );

    setEditingGraphId(null);
  };

  const handleDownloadGraph = async (id: number) => {
    try {
      const servicesResponse = await fetch(`/core/api/core/graphs/${id}/services`);
      const servicesData = await servicesResponse.json();

      const relationsResponse = await fetch(`/core/api/core/graphs/${id}/relations`);
      const relationsData = await relationsResponse.json();

      const combinedData = {
        services: servicesData,
        relations: relationsData,
      };

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при загрузке графика:', error);
    }
  };

  const handleUploadGraph = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (canEdit) {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        const response = await api.post<Graph>(
          '/core/api/core/graphs',
          {
            project_id: parseInt(ProjectID, 10),
            name: 'Импортированная диаграмма',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        setGraphs([...graphs, response.data]);

        const response1 = await api.post<number[]>(
        `/core/api/core/graphs/${response.data.id}/services`,
          parsedData.services,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const ids: number[] = response1.data
        console.log(ids)
        for (var i = 0; i < parsedData.relations.length; i++) {
          for (var j = 0; j < ids.length; j++) {
            if (parsedData.relations[i].from_service == parsedData.services[j].id) {
              parsedData.relations[i].from_service = ids[j]
            }
            if (parsedData.relations[i].to_service == parsedData.services[j].id) {
              parsedData.relations[i].to_service = ids[j]
            }
          }
        }

        await api.post<Object>(
          `/core/api/core/graphs/${response.data.id}/relations`,
            parsedData.relations,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      };
      fileReader.readAsText(file);
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      
      <Typography variant="h4" sx={{ mr: 2 }} gutterBottom>
        Список диаграмм
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddGraph}
          sx={{ mr: 3}}
        >
          Добавить диаграмму
        </Button>
        <Button
          component="label"
          variant="contained"
          sx={{ backgroundColor: 'purple', '&:hover': { backgroundColor: 'purple.dark' } }}
        >
          Загрузить диаграмму
          <input
            type="file"
            accept=".json"
            hidden
            onChange={handleUploadGraph}
          />
        </Button>
      </Box>

      <List>
        {graphs.map((graph) => (
          <Paper key={graph.id} elevation={3} sx={{ mb: 2 }}>
            <ListItemButton
              component="div"
              onClick={() => handleGraphClick(graph.id)}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              {editingGraphId === graph.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
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
                      handleSaveGraph(graph.id);
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                </Box>
              ) : (
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {graph.name}
                    </Typography>
                  }
                />
              )}

              <Box sx={{ ml: 'auto', display: 'flex' }}>
                {canEdit && (
                  <>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGraph(graph.id, graph.name);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGraph(graph.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
                <IconButton
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadGraph(graph.id);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>

            </ListItemButton>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default GraphList;