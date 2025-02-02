import React from 'react';

interface EdgeModalProps {
  edgeData: {
    name: string;
    description: string;
    from: string;
    to: string;
  };
  setEdgeData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    from: string;
    to: string;
  }>>;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void
  nodes: { id: string; data: { label: string } }[];
}

const EdgeModal: React.FC<EdgeModalProps> = ({ edgeData, setEdgeData, onSave, onClose, onDelete, nodes }) => {
  const isValid = edgeData.from && edgeData.to;

  const handleSave = () => {
    if (!isValid) {
      alert('Please select both "From" and "To" nodes.');
      return;
    }
    onSave();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label>
          Name:
          <input
            type="text"
            value={edgeData.name}
            onChange={(e) => setEdgeData({ ...edgeData, name: e.target.value })}
          />
        </label>
        <label>
          Description:
          <textarea
            value={edgeData.description}
            onChange={(e) => setEdgeData({ ...edgeData, description: e.target.value })}
          />
        </label>
        <label>
          From:
          <select
            value={edgeData.from}
            onChange={(e) => setEdgeData({ ...edgeData, from: e.target.value })}
          >
            <option value="" disabled>
              Select source node
            </option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.data.label || `Node ${node.id}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          To:
          <select
            value={edgeData.to}
            onChange={(e) => setEdgeData({ ...edgeData, to: e.target.value })}
          >
            <option value="" disabled>
              Select target node
            </option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.data.label || `Node ${node.id}`}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleSave} disabled={!isValid}>
          Save
        </button>
        <button onClick={onDelete} style={{ background: 'grey', color: 'white' }}>Delete Edge</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EdgeModal;
