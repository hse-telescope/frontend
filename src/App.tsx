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

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [edgeIdCounter, setEdgeIdCounter] = useState(1);

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
    axios.get("/api/v1/graph/1").then((message) => {
      alert(JSON.stringify(message))
      alert(message.status + "" + JSON.stringify(message.data));
      var servs = JSON.parse(JSON.stringify(message.data))["services"];
      var rels = JSON.parse(JSON.stringify(message.data))["relations"];
      console.log(servs)

      console.log(rels)
      var newservs : Node[] = [], newrels: Edge[] = [];
      var new_serv_id = parseInt(JSON.parse(JSON.stringify(message.data))["max_node_id"])
      var new_rel_id = parseInt(JSON.parse(JSON.stringify(message.data))["max_edge_id"])

      for (var i = 0; i < servs.length; i++) {
        var node = {
          "id" : servs[i]["id"].toString(),
          "position" : {"x": servs[i]["x"], "y": servs[i]["y"]},
          "data" : {"label": servs[i]["name"], "description": servs[i]["description"]}
        }

        newservs.push(node)
        
      }

      for (var i = 0; i < rels.length; i++) {
        var edge = {
          "id" : rels[i]["id"].toString(),
          "data" : {"label": rels[i]["name"], "description": rels[i]["description"]},
          "source" : rels[i]["from_service"].toString(),
          "target" : rels[i]["to_service"].toString()
        }

        newrels.push(edge)
      }
      console.log(newservs)
      console.log(newrels)

      setNodeIdCounter(new_serv_id)
      setEdgeIdCounter(new_rel_id)
      setNodes(newservs);
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

  const addNode = (x: number, y: number) => {
    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id:  `${nodeIdCounter}`,
        position: { x, y },
        data: { label: `Node ${nodeIdCounter}` },
      },
    ]);
    axios.post("/api/v1/services", {
      "id" : nodeIdCounter,
      "graph_id" : 1,
      "name" : `Node ${nodeIdCounter}`,
      "description" : "",
      "x" : x,
      "y" : y
    });
    
    console.log("Nodes: ", nodes, "\nEdges: ", edges);
    setNodeIdCounter((prev) => prev + 1);
  };

  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((prevNodes) => applyNodeChanges(changes, prevNodes));

  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges));

  const onConnect = (connection: Connection) => {
    setEdges((prevEdges) =>
      addEdge(
        {
          ...connection,
          id: `${edgeIdCounter}`,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          data: { label: '', description: '' },
        },
        prevEdges
      )
    );
    axios.post("/api/v1/relations", {
      "id" : edgeIdCounter,
      "graph_id" : 1,
      "name" : `${edgeIdCounter}`,
      "description" : "",
      "from_service" : connection.source != null ? parseInt(connection.source) : 1,
      "to_service" : connection.target != null ? parseInt(connection.target) : 1,
    });
    console.log("Nodes: ", nodes, "\nEdges: ", edges);
    setEdgeIdCounter((prev) => prev + 1);
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setActiveNode(node);
    setNodeData({
      name: node.data.label || `Node ${node.id}`,
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
      axios.put(`/api/v1/services/${activeNode.id}`, {
        "id" : parseInt(activeNode.id),
        "name" : nodeData.name,
        "description" : nodeData.description,
        "graph_id": 1,
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
        "graph_id": 1,
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
      //axios.delete(`/api/v1/services/${activeNode.id}`)
      console.log("Nodes: ", nodes, "\nEdges: ", edges);
      closeModal();
    }
  };
  
  const deleteEdge = () => {
    if (activeEdge) {
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== activeEdge.id));
      //axios.delete(`/api/v1/relations/${activeEdge.id}`)
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
      "graph_id": 1,
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

export default App;
