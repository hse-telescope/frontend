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
}

const EdgeModal: React.FC<EdgeModalProps> = ({ edgeData, setEdgeData, onSave, onClose }) => {
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
          <input
            type="text"
            value={edgeData.from}
            onChange={(e) => setEdgeData({ ...edgeData, from: e.target.value })}
          />
        </label>
        <label>
          To:
          <input
            type="text"
            value={edgeData.to}
            onChange={(e) => setEdgeData({ ...edgeData, to: e.target.value })}
          />
        </label>
        <button onClick={onSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EdgeModal;
