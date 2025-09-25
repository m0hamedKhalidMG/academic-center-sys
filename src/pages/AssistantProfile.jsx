// src/pages/AssistantProfile.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  getAssistantProfile,
  updateAssistantProfile,
} from '../services/endpoints';

export default function AssistantProfile() {
  const [profile, setProfile] = useState({ name: '', email: '', cardId: '' });
  const [initial, setInitial] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getAssistantProfile();
        setProfile(res.data.data);
        setInitial(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAssistantProfile(profile);
      setSuccessOpen(true);
      setInitial(profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    profile.name !== initial.name ||
    profile.email !== initial.email ||
    profile.cardId !== initial.cardId;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                My Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                label="Name"
                name="name"
                fullWidth
                value={profile.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={profile.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                label="Card ID"
                name="cardId"
                fullWidth
                value={profile.cardId}
                onChange={handleChange}
                margin="normal"
                required
              />

              <Box textAlign="center" sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!dirty || saving}
                  onClick={handleSave}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Snackbar
            open={successOpen}
            autoHideDuration={3000}
            onClose={() => setSuccessOpen(false)}
          >
            <Alert severity="success" onClose={() => setSuccessOpen(false)}>
              Profile updated!
            </Alert>
          </Snackbar>
        </motion.div>
      )}
    </Container>
  );
}
