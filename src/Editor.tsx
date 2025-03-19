import React, { useState, useEffect } from 'react';
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
  NodeChange,
  EdgeChange,
  NodeDragHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toolbar from './components/Toolbar/Toolbar';
import NodeModal from './components/NodeModal/NodeModal';
import EdgeModal from './components/EdgeModal/EdgeModal';
import AuthModal from './components/AuthModal/AuthModal';
import './index.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Editor: React.FC = () => {
    const { GraphID } = useParams<{ GraphID: string }>();
    if (!GraphID) {
        return <div>Graph ID is missing</div>;
      }
      const graphtIdAsNumber = parseInt(GraphID, 0);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const handleLoginSuccess = (userId: number) => {
    setCurrentUserId(userId);
    setIsAuthModalOpen(false);
  };
  
  const handleLogout = () => {
    setCurrentUserId(null);
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    axios.get(`/api/v1/graphs/${graphtIdAsNumber}/services`).then((message) => {
      var servs = JSON.parse(JSON.stringify(message.data));
      console.log(servs)

      var newservs : Node[] = [];

      for (var i = 0; i < servs.length; i++) {
        var node = {
          "id" : servs[i]["ID"].toString(),
          "position" : {"x": servs[i]["X"], "y": servs[i]["Y"]},
          "data" : {"label": servs[i]["Name"], "description": servs[i]["Description"]}
        }

        newservs.push(node)
        
      }
      console.log(newservs)

      setNodes(newservs);
    });
  }, []);

  useEffect(() => {
    axios.get(`/api/v1/graphs/${graphtIdAsNumber}/relations`).then((message) => {
      var rels = JSON.parse(JSON.stringify(message.data));

      console.log("!!!!", rels)
      var newrels: Edge[] = [];

      for (var i = 0; i < rels.length; i++) {
        var edge = {
          "id" : rels[i]["ID"].toString(),
          "data" : {"label": rels[i]["Name"], "description": rels[i]["Description"]},
          "source" : rels[i]["FromService"].toString(),
          "target" : rels[i]["ToService"].toString()
        }

        newrels.push(edge)
      }
      console.log(newrels)

      setEdges(newrels);
  });
  }, []);

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

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const addNode = async (x: number, y: number) => {
    const response = await axios.post("/api/v1/services", {
      graph_id: graphtIdAsNumber,
      name: "Node",
      description: "",
      x: x,
      y: y,
    });
    console.log("======")
    console.log(response.data)
    if (typeof response.data === "object" && response.data !== null && "ID" in response.data) {
      const newNodeId = response.data.ID;

      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: `${newNodeId}`,
          position: { x, y },
          data: { label: "Node" },
        },
      ]);

      console.log("Nodes: ", nodes, "\nEdges: ", edges);
    }
  };

  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));

  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));

  const onConnect = async (connection: Connection) => {
    const response = await axios.post("/api/v1/relations", {
      "graph_id" : graphtIdAsNumber,
      "name" : `Edge`,
      "description" : "",
      "from_service" : connection.source != null ? parseInt(connection.source) : 1,
      "to_service" : connection.target != null ? parseInt(connection.target) : 1,
    });
    if (typeof response.data === "object" && response.data !== null && "ID" in response.data) {
      const newEdgeId = response.data.ID;
      setEdges((prevEdges) =>
        addEdge(
          {
            ...connection,
            id: `${newEdgeId}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
            data: { label: '', description: '' },
          },
          prevEdges
        )
      );
    }
    console.log("Nodes: ", nodes, "\nEdges: ", edges);
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setActiveNode(node);
    setNodeData({
      name: node.data.label || `Node`,
      description: node.data.description || '',
    });
    setActiveEdge(null);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
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
      console.log('!', graphtIdAsNumber)
      axios.put(`/api/v1/services/${activeNode.id}`, {
        "id" : parseInt(activeNode.id),
        "name" : nodeData.name,
        "description" : nodeData.description,
        "graph_id": graphtIdAsNumber,
        "x" : activeNode.position.x,
        "y" : activeNode.position.y
      })
      console.log("Nodes: ", nodes, "\nEdges: ", edges);
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
                source: edgeData.from,
                target: edgeData.to,
              }
            : edge
        )
      );

      axios.put(`/api/v1/relations/${activeEdge.id}`, {
        "id" : parseInt(activeEdge.id),
        "name" : edgeData.name,
        "description" : edgeData.description,
        "graph_id": graphtIdAsNumber,
        "from_service" : parseInt(edgeData.from),
        "to_service" : parseInt(edgeData.to)
      })
      console.log("Nodes: ", nodes, "\nEdges: ", edges);
      closeModal();
    } else {
      alert('Both "From" and "To" fields must be selected.');
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  const handleAddNodeFromMenu = () => {
    if (contextMenu) {
      const canvasBounds = document.querySelector('.canvas')?.getBoundingClientRect();
      if (canvasBounds) {
        const x = contextMenu.x - canvasBounds.left;
        const y = contextMenu.y - canvasBounds.top;
        addNode(x, y);
      }
    }
    setContextMenu(null);
  };

  const closeContextMenu = () => setContextMenu(null);

  const deleteNode = () => {
    if (activeNode) {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== activeNode.id));
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== activeNode.id && edge.target !== activeNode.id));
      axios.delete(`/api/v1/services/${activeNode.id}`)
      console.log("Nodes: ", nodes, "\nEdges: ", edges);
      closeModal();
    }
  };
  
  const deleteEdge = () => {
    if (activeEdge) {
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== activeEdge.id));
      axios.delete(`/api/v1/relations/${activeEdge.id}`)
      console.log("Nodes: ", nodes, "\nEdges: ", edges);
      closeModal();
    }
  };

  const onNodeDragStop: NodeDragHandler = (_, node) => {
    console.log("Node stopped:", node.id, "Position:", node.position);
  
    axios.put(`/api/v1/services/${node.id}`, {
      "id" : parseInt(node.id),
      "name" : node.data.label,
      "description" : node.data.description,
      "graph_id": graphtIdAsNumber,
      "x" : node.position.x,
      "y" : node.position.y
    })
  };
  

  return (
    <ReactFlowProvider>
      <div className="app">
      <Toolbar
      onAddNode={() => addNode(100, 100)}
      onOpenAuthModal={handleOpenAuthModal}
      currentUserId={currentUserId}
      onLogout={handleLogout}
      />
        <div
          className="canvas"
          onContextMenu={handleContextMenu}
          onClick={closeContextMenu}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={closeModal}
            onNodeDragStop={onNodeDragStop}
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
        {contextMenu && (
          <div
            className="context-menu"
            style={{
              position: 'absolute',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'white',
              border: '1px solid #ccc',
              padding: '8px',
              zIndex: 1000,
            }}
          >
            <button onClick={handleAddNodeFromMenu}>Add Node</button>
          </div>
        )}
        {activeNode && (
          <NodeModal
            nodeData={nodeData}
            setNodeData={setNodeData}
            onSave={saveNodeData}
            onDelete={deleteNode}
            onClose={closeModal}
          />
        )}
        {activeEdge && (
          <EdgeModal
            edgeData={edgeData}
            setEdgeData={setEdgeData}
            onSave={saveEdgeData}
            onDelete={deleteEdge}
            onClose={closeModal}
            nodes={nodes}
          />
        )}
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default Editor;
