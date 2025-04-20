import React, { ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

interface NodeModalProps {
  nodeData: { name: string; description: string };
  setNodeData: (data: { name: string; description: string }) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}

const NodeModal: React.FC<NodeModalProps> = ({
  nodeData,
  setNodeData,
  onSave,
  onDelete,
  onClose,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNodeData({ ...nodeData, [name]: value });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать вершину</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Name"
            name="name"
            value={nodeData.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            name="description"
            value={nodeData.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onSave} variant="contained" color="primary">
          Save
        </Button>
        <Button onClick={onDelete} color="error" variant="outlined">
          Delete Node
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeModal;