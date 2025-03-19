import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

interface Graph {
  ID: number;
  project_id: number;
  Name: string;
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
      const updatedGraphs = response.data.sort((a, b) => a.ID - b.ID);
      setGraphs(updatedGraphs);
    };

    fetchGraphs();
  }, [ProjectID]);

  const handleAddGraph = async () => {
    console.log(ProjectID);
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
    setGraphs(graphs.filter((graph) => graph.ID !== id));
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
        project_id : parseInt(ProjectID, 10),
        name: newName
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
    }
  );

    setGraphs((prevGraphs) =>
      prevGraphs.map((graph) =>
        graph.ID === id ? { ...graph, Name: newName } : graph
      )
    );

    setEditingGraphId(null);
  };

  return (
    <div>
      <h1>Список диаграмм</h1>
      <button onClick={handleAddGraph}>Добавить диаграмму</button>
      <ul>
        {graphs.map((graph) => (
          <li
            key={graph.ID}
            style={{ cursor: 'pointer', marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}
            onClick={() => handleGraphClick(graph.ID)}
          >
            {editingGraphId === graph.ID ? (
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
                    handleSaveGraph(graph.ID);
                  }}
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <div>
                <h2>{graph.Name}</h2>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGraph(graph.ID);
              }}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
            >
              Удалить
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditGraph(graph.ID, graph.Name);
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

export default GraphList;