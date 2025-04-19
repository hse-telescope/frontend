import React, { useState } from 'react';
import { Box, Button, TextField, Paper, Tabs, Tab, Alert } from '@mui/material';
import axios from 'axios';

const API_URL = 'http://auth:8080';

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (_: any, newValue: number) => {
    setTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (tab === 0) {
        interface LoginResponse {
          token: string;
        }
        const resp = await axios.post<LoginResponse>(`${API_URL}/login`, { username, password });
        setSuccess('Успешный вход! Токен: ' + resp.data.token);
      } else {
        await axios.post(`${API_URL}/register`, { username, password });
        setSuccess('Успешная регистрация!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Вход" />
          <Tab label="Регистрация" />
        </Tabs>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              {tab === 0 ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AuthPage;