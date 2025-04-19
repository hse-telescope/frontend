import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType
} from 'reactflow';
import axios from 'axios';
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
  Modal,
  TextareaAutosize
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  FormatIndentIncrease as FormatIcon
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
  const [viewingGraphData, setViewingGraphData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [miniMapNodes, setMiniMapNodes] = useState<Node[]>([]);
  const [miniMapEdges, setMiniMapEdges] = useState<Edge[]>([]);
  const [editableJson, setEditableJson] = useState('');
  const [jsonError, setJsonError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraphs = async () => {
      const response = await axios.get<Graph[]>(`/api/core/projects/${ProjectID}/graphs`);
      const updatedGraphs = response.data.sort((a, b) => a.id - b.id);
      setGraphs(updatedGraphs);
    };

    fetchGraphs();
  }, [ProjectID]);

  const handleAddGraph = async () => {
    const response = await axios.post<Graph>(
      '/api/core/graphs',
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
    await axios.delete(`/api/core/graphs/${id}`);
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
    await axios.put(
      `/api/core/graphs/${id}`,
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
      const servicesResponse = await fetch(`/api/core/graphs/${id}/services`);
      const servicesData = await servicesResponse.json();

      const relationsResponse = await fetch(`/api/core/graphs/${id}/relations`);
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

  const updateMiniMap = (services: any[], relations: any[]) => {
    const nodes = services.map(service => ({
      id: service.id.toString(),
      position: { x: service.x, y: service.y },
      data: { label: service.name },
      style: { width: 50, height: 50, fontSize: 10 }
    }));
  
    const edges = relations.map(relation => ({
      id: relation.id.toString(),
      source: relation.from_service.toString(),
      target: relation.to_service.toString(),
      markerEnd: { type: MarkerType.ArrowClosed }
    }));
  
    setMiniMapNodes(nodes);
    setMiniMapEdges(edges);
  };

  const handleViewGraph = async (id: number) => {
    try {
      const servicesResponse = await fetch(`/api/core/graphs/${id}/services`);
      const servicesData = await servicesResponse.json();
  
      const relationsResponse = await fetch(`/api/core/graphs/${id}/relations`);
      const relationsData = await relationsResponse.json();
  
      const combinedData = {
        services: servicesData,
        relations: relationsData,
        graphId: id
      };
  
      setEditableJson(JSON.stringify(combinedData, null, 2));
      setViewingGraphData(combinedData);
      updateMiniMap(servicesData, relationsData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке данных графика:', error);
    }
  };

  
  const handleSaveChanges = async () => {
    const backup = {
      json: editableJson,
      data: { ...viewingGraphData },
      nodes: [...miniMapNodes],
      edges: [...miniMapEdges]
    };
    setJsonError("")
  
    try {
      const newData = JSON.parse(editableJson);
      const graphId = viewingGraphData.graphId;
  
      const oldIds = {
        services: viewingGraphData.services.map((s: { id: any; }) => s.id),
        relations: viewingGraphData.relations.map((r: { id: any; }) => r.id)
      };
  
      const hasNewIds = [
        ...newData.services.map((s: { id: any; }) => s.id).filter((id : number) => !oldIds.services.includes(id)),
        ...newData.relations.map((r: { id: any; }) => r.id).filter((id : number) => !oldIds.relations.includes(id))
      ];
  
      if (hasNewIds.length > 0) {
        throw new Error(`Найдены новые ID: ${hasNewIds.join(', ')}`);
      }
  
      const validServiceIds = newData.services.map((s: { id: any; }) => s.id);
      const brokenRelations = newData.relations.filter(
        (        r: { from_service: any; to_service: any; }) => !validServiceIds.includes(r.from_service) || !validServiceIds.includes(r.to_service)
      );
  
      if (brokenRelations.length > 0) {
        throw new Error(`Ошибка в связях: ${brokenRelations.map((r: { id: any; }) => r.id).join(', ')}`);
      }

      const newIds = {
        services: newData.services.map((s: { id: number; }) => s.id),
        relations: newData.relations.map((r: { id: number; }) => r.id)
      };  

      const elementsToDelete = {
        services: oldIds.services.filter((id: number) => !newIds.services.includes(id)),
        relations: oldIds.relations.filter((id: number) => !newIds.relations.includes(id))
      };

      await Promise.all([
        axios.put(`/api/core/graphs/${graphId}/services`, newData.services),
        axios.put(`/api/core/graphs/${graphId}/relations`, newData.relations),
      ]);

      await Promise.all([
        ...elementsToDelete.services.map((id: number) => 
          axios.delete(`/api/core/services/${id}`)
        ),
        ...elementsToDelete.relations.map((id: number) => 
          axios.delete(`/api/core/relations/${id}`)
        )
      ]);
  
      updateMiniMap(newData.services, newData.relations);
      setViewingGraphData(newData);
    } catch (error) {
      setEditableJson(backup.json);
      setViewingGraphData(backup.data);
      setMiniMapNodes(backup.nodes);
      setMiniMapEdges(backup.edges);
      setJsonError(error instanceof Error ? error.message : 'Ошибка сохранения');
    }
  };


  const handleUploadGraph = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        const response = await axios.post<Graph>(
          '/api/core/graphs',
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

        const response1 = await axios.post<number[]>(
        `/api/core/graphs/${response.data.id}/services`,
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

        await axios.post<Object>(
          `/api/core/graphs/${response.data.id}/relations`,
            parsedData.relations,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      };
      fileReader.readAsText(file);
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
                <IconButton
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadGraph(graph.id);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewGraph(graph.id);
                  }}
                >
                  <ViewIcon />
                </IconButton>
              </Box>
            </ListItemButton>
          </Paper>
        ))}
      </List>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper
          sx={{
            width: '90%',
            height: '90%',
            maxWidth: 1200,
            p: 3,
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          <Box sx={{ flex: 1, pr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Редактор JSON</Typography>
              <Box>
                <Button
                  startIcon={<FormatIcon />}
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(editableJson), null, 2);
                      setEditableJson(formatted);
                    } catch (e) {
                      setJsonError('Ошибка форматирования');
                    }
                  }}
                  sx={{ mr: 1 }}
                >
                  Форматировать
                </Button>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSaveChanges}
                  sx={{ mr: 1 }}
                >
                  Сохранить
                </Button>
                <IconButton onClick={() => setIsModalOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {jsonError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {jsonError}
              </Typography>
            )}

            <TextareaAutosize
              value={editableJson}
              onChange={(e) => setEditableJson(e.target.value)}
              style={{
                width: '100%',
                height: '80%',
                fontFamily: 'monospace',
                padding: 10,
                borderRadius: 4,
                borderColor: '#ccc'
              }}
            />
          </Box>

          {/* <Divider orientation="vertical" flexItem sx={{ mx: 2 }} /> */}

          <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Миниатюра диаграммы
            </Typography>
            <Box
              sx={{
                flex: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative',
                height: 500
              }}
            >
              <ReactFlow
                nodes={miniMapNodes}
                edges={miniMapEdges}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnPinch={false}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
              >
                <MiniMap 
                  nodeColor="#ddd" 
                  maskColor="#f5f5f5" 
                  style={{ backgroundColor: '#f9f9f9' }}
                  position="bottom-right"
                />
                <Controls showInteractive={false} />
                <Background />
              </ReactFlow>
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate(`/graphs/${viewingGraphData.graphId}`)}
                sx={{ px: 3 }}
              >
                Открыть в редакторе
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default GraphList;