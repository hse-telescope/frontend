import React from 'react';

interface ToolbarProps {
  onAddNode: () => void;
  onOpenAuthModal: () => void;
  currentUserId: number | null;
  onLogout: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onOpenAuthModal, currentUserId, onLogout }) => {
  return (
    <div className="toolbar">
      <button onClick={onAddNode}>Add Node</button>
      {currentUserId ? (
        <button onClick={onLogout}>Logout</button>
      ) : (
        <button onClick={onOpenAuthModal}>Login/Register</button>
      )}
    </div>
  );
};

export default Toolbar;