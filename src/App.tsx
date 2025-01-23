import React, { useState } from 'react';
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar/Toolbar';
import NodeModal from './components/NodeModal/NodeModal';
import EdgeModal from './components/EdgeModal/EdgeModal';
import './index.css';

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [activeEdge, setActiveEdge] = useState<Edge | null>(null);
  const [nodeData, setNodeData] = useState<{ name: string; description: string }>({
    name: '',
    description: '',
  });
  const [edgeData, setEdgeData] = useState<{
    name: string;
    description: string;
    from: string;
    to: string;
  }>({
    name: '',
    description: '',
    from: '',
    to: '',
  });

  const addNode = () => {
    setNodes((prevNodes) => {
      const lastNode = prevNodes[prevNodes.length - 1];
      const newPosition = lastNode
        ? { x: lastNode.position.x + 100, y: lastNode.position.y + 75 }
        : { x: 50, y: 50 };

      return [
        ...prevNodes,
        {
          id: `${prevNodes.length + 1}`,
          position: newPosition,
          data: { label: `Node ${prevNodes.length + 1}` },
        },
      ];
    });
  };

  const onNodesChange = (changes: any) =>
    setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));

  const onEdgesChange = (changes: any) =>
    setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));

  const onConnect = (connection: Connection) =>
    setEdges((prevEdges) =>
      addEdge(
        {
          ...connection,
          markerEnd: {
            type: MarkerType.ArrowClosed, // Используем MarkerType.ArrowClosed
          },
          data: { label: '', description: '' }, // Инициализация объекта data
        },
        prevEdges
      )
    );

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setActiveNode(node);
    setNodeData({
      name: node.data.label || `Node ${node.id}`,
      description: node.data.description || '',
    });
    setActiveEdge(null);
  };

  const onEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    setActiveEdge(edge);
    setEdgeData({
      name: edge.data?.label || '',
      description: edge.data?.description || '',
      from: edge.source || '',
      to: edge.target || '',
    });
    setActiveNode(null);
  };

  const closeModal = () => {
    setActiveNode(null);
    setActiveEdge(null);
  };

  const saveNodeData = () => {
    if (activeNode) {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === activeNode.id
            ? {
                ...node,
                data: { ...node.data, label: nodeData.name, description: nodeData.description },
              }
            : node
        )
      );
      closeModal();
    }
  };

  const saveEdgeData = () => {
    if (activeEdge && edgeData.from && edgeData.to) {
      setEdges((prevEdges) =>
        prevEdges.map((edge) =>
          edge.id === activeEdge.id
            ? {
                ...edge,
                data: { ...edge.data, label: edgeData.name, description: edgeData.description },
                source: edgeData.from, // Обновление источника
                target: edgeData.to,   // Обновление цели
              }
            : edge
        )
      );
      closeModal();
    } else {
      alert('Both "From" and "To" fields must be selected.');
    }
  };

  return (
    <ReactFlowProvider>
      <div className="app">
        <Toolbar onAddNode={addNode} />
        <div className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={closeModal}
            fitView
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L10,3.5 L0,7 Z" fill="#000" />
              </marker>
            </defs>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {activeNode && (
          <NodeModal
            nodeData={nodeData}
            setNodeData={setNodeData}
            onSave={saveNodeData}
            onClose={closeModal}
          />
        )}
        {activeEdge && (
          <EdgeModal
            edgeData={edgeData}
            setEdgeData={setEdgeData}
            onSave={saveEdgeData}
            onClose={closeModal}
            nodes={nodes}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default App;
