import yaml from 'js-yaml';
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import CodeMirror from '@uiw/react-codemirror';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import axios from 'axios';
import { MarkerType } from 'reactflow';

interface Node {
  id: string;
  position: { x: number; y: number };
  data: { name?: string; description?: string; label?: string; [key: string]: any };
  [key: string]: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  data?: { name?: string; description?: string; label?: string; [key: string]: any };
  [key: string]: any;
}

interface JsonEditorPanelProps {
  nodes: Node[];
  edges: Edge[];
  buildGraph?: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] };
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  graphIdAsNumber: number;
}

const JsonEditorPanel: React.FC<JsonEditorPanelProps> = ({
  nodes,
  edges,
  buildGraph,
  setNodes,
  setEdges,
  graphIdAsNumber,
}) => {
  const [editableJson, setEditableJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  const getCurrentGraphJson = () => {
    const n = buildGraph ? buildGraph(nodes, edges).nodes : nodes;
    const e = buildGraph ? buildGraph(nodes, edges).edges : edges;
    return {
      nodes: n.map(node => ({
        id: node.id,
        name: node.data.name ?? node.data.label ?? '',
        description: node.data.description ?? '',
      })),
      edges: e.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        name: edge.data?.name ?? edge.data?.label ?? '',
        description: edge.data?.description ?? '',
      })),
    };
  };

  useEffect(() => {
    setEditableJson(yaml.dump(getCurrentGraphJson()));
  }, [nodes, edges, buildGraph]);

  const handleFormat = () => {
    try {
    setEditableJson(yaml.dump(yaml.load(editableJson)));
      setJsonError('');
    } catch {
      setJsonError('Ошибка форматирования JSON');
    }
  };

  const handleSaveChanges = async () => {
    const backup = {
      json: editableJson,
      nodes: [...nodes],
      edges: [...edges],
    };
    setJsonError('');
    try {
      const newData = yaml.load(editableJson) as { nodes: any[]; edges: any[] };

      const existingNodeIds = new Set(nodes.map(node => node.id));
      const newNodeIds = newData.nodes.map(n => n.id);
      const invalidNodeIds = newNodeIds.filter(id => !existingNodeIds.has(id));
      const unusedNodeIds = [...existingNodeIds].filter(id => !newNodeIds.includes(id));

      if (invalidNodeIds.length > 0) {
        setJsonError(`Обнаружены новые ID узлов: ${invalidNodeIds.join(', ')}`);
        return;
      }

      const edgesWithId = newData.edges.filter(e => e.id);

      const existingEdgeIds = new Set(edges.map(edge => edge.id));
      const newEdgeIds = edgesWithId.map(e => e.id);
      const invalidEdgeIds = newEdgeIds.filter(id => !existingEdgeIds.has(id));
      const unusedEdgeIds = [...existingEdgeIds].filter(id => !newEdgeIds.includes(id));  

      console.log(invalidEdgeIds)
      if (invalidEdgeIds.length > 0) {
        setJsonError(`Обнаружены новые ID рёбер: ${invalidEdgeIds.join(', ')}`);
        return;
      }
      

      const updatedNodes = newData.nodes.map((n: any) => {
        const old = nodes.find(node => node.id === n.id);
        return {
          id: n.id,
          position: old?.position ?? { x: 0, y: 0 },
          data: {
            ...old?.data,
            name: n.name,
            label: n.name,
            description: n.description,
          },
        };
      });

      const edgesWithoutId = newData.edges.filter((e: any) => !e.id);

      const createdEdges = await Promise.all(
        edgesWithoutId.map(async (e: any) => {
          const resp = await axios.post('/api/api/core/relations', {
            graph_id: graphIdAsNumber,
            from_service: parseInt(e.source, 10),
            to_service: parseInt(e.target, 10),
            name: e.name,
            description: e.description,
          });
          return {
            id: (resp.data as { id: number }).id.toString(),
            source: e.source,
            target: e.target,
            data: {
              name: e.name,
              label: e.name,
              description: e.description,
            },
            label: e.name,
            markerEnd: { type: MarkerType.ArrowClosed },
          };
        })
      );

      const updatedEdges = edgesWithId.map((e: any) => {
        const old = edges.find(edge => edge.id === e.id);
        return {
          ...old,
          id: e.id,
          source: e.source,
          target: e.target,
          data: {
            ...old?.data,
            name: e.name,
            label: e.name,
            description: e.description,
          },
          label: e.name,
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      }).concat(createdEdges);;

      await Promise.all([
        ...unusedEdgeIds.map(id => axios.delete(`/api/api/core/relations/${id}`)),
      ]);
      await Promise.all([
        ...unusedNodeIds.map(id => axios.delete(`/api/api/core/services/${id}`)),
      ]);

      await Promise.all([
        axios.put(`/api/api/core/graphs/${graphIdAsNumber}/services`, updatedNodes.map((node: { id: string; position: { x: any; y: any; }; data: { name: any; description: any; }; }) => ({
          id: parseInt(node.id, 10),
          x: node.position.x,
          y: node.position.y,
          name: node.data.name,
          description: node.data.description,
        }))),
        axios.put(`/api/api/core/graphs/${graphIdAsNumber}/relations`, updatedEdges.map((edge: { id: string; source: string; target: string; data: { name: any; description: any; }; }) => ({
          id: parseInt(edge.id, 10),
          from_service: parseInt(edge.source, 10),
          to_service: parseInt(edge.target, 10),
          name: edge.data?.name,
          description: edge.data?.description,
        }))),
      ]);

      setNodes(updatedNodes);
      setEdges(updatedEdges);
    } catch (error) {
      setEditableJson(backup.json);
      setNodes(backup.nodes);
      setEdges(backup.edges);
      setJsonError(error instanceof Error ? error.message : 'Ошибка сохранения');
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        borderRight: '1px solid #ddd',
        padding: 2,
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fafafa',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Редактор</Typography>
        <Box>
          <Button onClick={handleFormat} sx={{ mr: 1 }}>
            Форматировать
          </Button>
          <Button variant="contained" onClick={handleSaveChanges}>
            Сохранить
          </Button>
        </Box>
      </Box>

      {jsonError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {jsonError}
        </Alert>
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          border: '1px solid #ccc',
          borderRadius: 1,
          bgcolor: '#fff',
        }}
      >
        <CodeMirror
          value={editableJson}
          height="100%"
          extensions={[yamlLang()]}
          onChange={setEditableJson}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
          }}
        />
      </Box>
    </Box>
  );
};

export default JsonEditorPanel;