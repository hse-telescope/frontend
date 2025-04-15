import React, { ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

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
  onDelete: () => void;
  nodes: { id: string; data: { label: string } }[];
}

const EdgeModal: React.FC<EdgeModalProps> = ({
  edgeData,
  setEdgeData,
  onSave,
  onClose,
  onDelete,
  nodes,
}) => {
  const isValid = edgeData.from && edgeData.to;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEdgeData({ ...edgeData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as 'from' | 'to';
    setEdgeData({ ...edgeData, [name]: e.target.value });
  };

  const handleSave = () => {
    if (!isValid) {
      alert('Please select both "From" and "To" nodes.');
      return;
    }
    onSave();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать ребро</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Name"
            name="name"
            value={edgeData.name}
            onChange={handleChange}
            fullWidth
            autoFocus
          />
          <TextField
            label="Description"
            name="description"
            value={edgeData.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
          />
          <FormControl fullWidth>
            <InputLabel id="from-label">From</InputLabel>
            <Select
              labelId="from-label"
              name="from"
              value={edgeData.from}
              label="From"
              onChange={handleSelectChange}
            >
              <MenuItem value="" disabled>
                Select source node
              </MenuItem>
              {nodes.map((node) => (
                <MenuItem key={node.id} value={node.id}>
                  {node.data.label || `Node ${node.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="to-label">To</InputLabel>
            <Select
              labelId="to-label"
              name="to"
              value={edgeData.to}
              label="To"
              onChange={handleSelectChange}
            >
              <MenuItem value="" disabled>
                Select target node
              </MenuItem>
              {nodes.map((node) => (
                <MenuItem key={node.id} value={node.id}>
                  {node.data.label || `Node ${node.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!isValid}>
          Save
        </Button>
        <Button onClick={onDelete} color="error" variant="outlined">
          Delete Edge
        </Button>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EdgeModal;