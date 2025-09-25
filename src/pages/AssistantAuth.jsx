import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  Box,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  QrCodeScanner as ScannerIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';
import { assistantCardLogin } from '../services/endpoints';
import { useNavigate } from 'react-router-dom';
import useStore from '../context/store';

export default function AssistantAuth() {
  const [cardId, setCardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);

  // Auto-submit when scan is complete
  useEffect(() => {
    if (scanComplete && cardId.length > 0) {
      const timer = setTimeout(() => {
        handleLogin(new Event('submit'));
      }, 500); // Small delay to ensure all characters are captured
      return () => clearTimeout(timer);
    }
  }, [scanComplete, cardId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!cardId) return;
    
    setError('');
    setLoading(true);
    try {
      const { data } = await assistantCardLogin({ cardId });
      setAuth(data.token, 'assistant');
      navigate('/assistant/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      if (scanMode) {
        setCardId(''); // Reset for new scan attempt
      }
    } finally {
      setLoading(false);
      setScanComplete(false);
    }
  };

  // Handle scanner input
  const handleScannerInput = (e) => {
    if (scanMode) {
      setCardId(e.target.value);
      // Detect scanner input (usually ends with Enter/Tab or has consistent timing)
      if (e.target.value.length >= 6) { // Adjust based on your card ID length
        setScanComplete(true);
      }
    }
  };

  const toggleInputMode = () => {
    setScanMode(!scanMode);
    setCardId('');
    setError('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ display: 'flex', alignItems: 'center', minHeight: '80vh' }}
    >
      <Box width="100%">
        <Typography variant="h5" align="center" gutterBottom>
          Assistant Login
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            label={scanMode ? 'Scanner Mode' : 'Manual Entry'}
            color={scanMode ? 'primary' : 'default'}
            icon={scanMode ? <ScannerIcon /> : <KeyboardIcon />}
            onClick={toggleInputMode}
            sx={{ cursor: 'pointer' }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label={scanMode ? 'Scan your card' : 'Enter Card ID'}
            value={cardId}
            onChange={scanMode ? handleScannerInput : (e) => setCardId(e.target.value)}
            margin="normal"
            required
            inputRef={inputRef}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon />
                </InputAdornment>
              ),
              endAdornment: scanMode && (
                <InputAdornment position="end">
                  <ScannerIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          {!scanMode && (
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
              disabled={loading || !cardId}
            >
              {loading ? 'Signing in…' : 'Login'}
            </Button>
          )}

          {scanMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Scan your card to automatically login
            </Typography>
          )}
        </form>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          {scanMode 
            ? 'Place your card near the scanner' 
            : 'Switch to scanner mode for faster login'}
        </Typography>
      </Box>
    </Container>
  );
}