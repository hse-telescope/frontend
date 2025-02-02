import React, { ChangeEvent } from 'react';

interface NodeModalProps {
  nodeData: { name: string; description: string };
  setNodeData: (data: { name: string; description: string }) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}

const NodeModal: React.FC<NodeModalProps> = ({ nodeData, setNodeData, onSave, onDelete, onClose }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNodeData({ ...nodeData, [name]: value });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={nodeData.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={nodeData.description}
            onChange={handleChange}
          />
        </label>
        <button onClick={onSave}>Save</button>
        <button onClick={onDelete} style={{ background: 'grey', color: 'white' }}>Delete Node</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default NodeModal;
