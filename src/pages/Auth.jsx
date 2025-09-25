import React, { useState } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { registerAdmin, adminLogin } from '../services/endpoints';
import { useNavigate } from 'react-router-dom';
import useStore from '../context/store';

export default function Auth() {
  const [tab, setTab] = useState(1);
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin(form);
      alert('Admin registered. Please log in.');
      setTab(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin(form);
      setAuth(res.data.token, 'admin');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Academic Center Admin
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
        <Tab label="Login" value={1} />
        <Tab label="Register" value={2} />
      </Tabs>
      <Box
        component="form"
        sx={{ mt: 3 }}
        onSubmit={tab === 1 ? handleLogin : handleRegister}
      >
        <TextField
          fullWidth
          name="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
          {tab === 1 ? 'Login' : 'Register'}
        </Button>
      </Box>
    </Container>
  );
}
