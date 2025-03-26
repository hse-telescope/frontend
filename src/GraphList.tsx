import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const fetchGraphs = async () => {
      const response = await axios.get<Graph[]>(`/api/v1/projects/${ProjectID}/graphs`);
      const updatedGraphs = response.data.sort((a, b) => a.id - b.id);
      setGraphs(updatedGraphs);
    };

    fetchGraphs();
  }, [ProjectID]);

  const handleAddGraph = async () => {
    const response = await axios.post<Graph>(
      '/api/v1/graphs',
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
    await axios.delete(`/api/v1/graphs/${id}`);
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
      `/api/v1/graphs/${id}`,
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
      const servicesResponse = await fetch(`/api/v1/graphs/${id}/services`);
      const servicesData = await servicesResponse.json();

      const relationsResponse = await fetch(`/api/v1/graphs/${id}/relations`);
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
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        const response = await axios.post<Graph>(
          '/api/v1/graphs',
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
        `/api/v1/graphs/${response.data.id}/services`,
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
          `/api/v1/graphs/${response.data.id}/relations`,
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
    <div>
      <h1>Список диаграмм</h1>
      <button onClick={handleAddGraph}>Добавить диаграмму</button>
      <label style={{ marginLeft: '10px', backgroundColor: 'purple', color: 'white', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>
        Загрузить диаграмму
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleUploadGraph}
        />
      </label>
      <ul>
        {graphs.map((graph) => (
          <li
            key={graph.id}
            style={{ cursor: 'pointer', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}
            onClick={() => handleGraphClick(graph.id)}
          >
            {editingGraphId === graph.id ? (
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
                    handleSaveGraph(graph.id);
                  }}
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <div>
                <h2>{graph.name}</h2>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGraph(graph.id);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
            >
              Удалить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditGraph(graph.id, graph.name);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'blue', color: 'white' }}
            >
              Изменить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadGraph(graph.id);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'green', color: 'white' }}
            >
              Скачать
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GraphList;