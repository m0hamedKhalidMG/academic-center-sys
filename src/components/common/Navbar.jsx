// src/components/common/Navbar.jsx

import React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    // Clear all stored credentials (token, user info, etc.)
    localStorage.clear();
    // Redirect to the login/setup page
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/students', label: 'Students' },
    { to: '/payments', label: 'Payments' },
    { to: '/assistants', label: 'Assistants' },
    { to: '/attendance/report', label: 'Attendance' },
  ];

  return (
    <AppBar position="sticky" color="inherit">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/dashboard"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: theme.palette.text.primary,
            fontWeight: 700,
          }}
        >
          AcadCenter
        </Typography>

        {isMobile ? (
          <>
            <IconButton onClick={openMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
            >
              {navLinks.map((link) => (
                <MenuItem
                  key={link.to}
                  onClick={() => {
                    navigate(link.to);
                    closeMenu();
                  }}
                >
                  {link.label}
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                color="inherit"
              >
                {link.label}
              </Button>
            ))}
            <IconButton onClick={handleLogout} sx={{ ml: 2 }}>
              <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
