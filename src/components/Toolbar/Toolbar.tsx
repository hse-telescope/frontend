import React from 'react';

interface ToolbarProps {
  onAddNode: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode }) => {
  return (
    <div className="toolbar">
      <button onClick={onAddNode}>Add Node</button>
    </div>
  );
};

export default Toolbar;
