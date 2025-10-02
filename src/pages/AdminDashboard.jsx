// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Chip,
  CardHeader,
  Divider,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  QrCode as QrCodeIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  Today as TodayIcon,
} from '@mui/icons-material';

import {
  getAllAssistants,
  getAttendanceByDateGroup,
  createAssistant,
  resetAssistantPassword,
  createGroup,
  getAllGroups,
  updateGroup,
  deleteGroup,
} from '../services/endpoints';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

// Professional color scheme
const professionalColors = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2'
};

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabIndex, setTabIndex] = useState(0);

  // --- State variables (same as before) ---
  const [assistants, setAssistants] = useState([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);
  const [errorAssistants, setErrorAssistants] = useState('');
  const [newAsst, setNewAsst] = useState({
    name: '',
    email: '',
    password: '',
    cardId: '',
  });
  const [createError, setCreateError] = useState('');
  const [resetDialog, setResetDialog] = useState({
    open: false,
    id: '',
    cardId: '',
    error: '',
    newPassword: '',
  });

  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    groupCode: '',
  });
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [errorAttendance, setErrorAttendance] = useState('');

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorGroups, setErrorGroups] = useState('');
  const [groupDialog, setGroupDialog] = useState({
    mode: 'create',
    open: false,
    data: {
      code: '',
      academicLevel: '',
      maxStudents: '',
      schedule: [{ day: '', startTime: '', endTime: '' }],
    },
    error: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: '',
    code: '',
    error: '',
  });

  // --- Effects (same as before) ---
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllAssistants();
        setAssistants(res.data.data);
      } catch {
        setErrorAssistants('Unable to load assistants.');
      } finally {
        setLoadingAssistants(false);
      }
    })();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!filters.groupCode) {
      setAttendance([]);
      return;
    }
    setLoadingAttendance(true);
    setErrorAttendance('');
    (async () => {
      try {
        const res = await getAttendanceByDateGroup(filters);
        const arr = Array.isArray(res.data.data) ? res.data.data : [];
        setAttendance(arr);
      } catch (err) {
        setErrorAttendance(
          err.response?.data?.message || 'Failed to load attendance.'
        );
        setAttendance([]);
      } finally {
        setLoadingAttendance(false);
      }
    })();
  }, [filters]);

  // --- Helper functions (same as before) ---
  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await createAssistant(newAsst);
      setNewAsst({ name: '', email: '', password: '', cardId: '' });
      const res = await getAllAssistants();
      setAssistants(res.data.data);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Creation failed.');
    }
  };

  const openReset = (id) =>
    setResetDialog({ open: true, id, cardId: '', error: '', newPassword: '' });
  
  const submitReset = async () => {
    setResetDialog((d) => ({ ...d, error: '', newPassword: '' }));
    try {
      const { data } = await resetAssistantPassword(resetDialog.id, {
        cardId: resetDialog.cardId,
      });
      setResetDialog((d) => ({ ...d, newPassword: data.data.newPassword }));
    } catch (err) {
      setResetDialog((d) => ({
        ...d,
        error: err.response?.data?.message || 'Reset failed.',
      }));
    }
  };

  async function fetchGroups() {
    setLoadingGroups(true);
    setErrorGroups('');
    try {
      const res = await getAllGroups();
      setGroups(res.data.data);
    } catch (err) {
      setErrorGroups(err.response?.data?.message || 'Failed to load groups.');
    } finally {
      setLoadingGroups(false);
    }
  }

  const openCreateGroup = () =>
    setGroupDialog({
      mode: 'create',
      open: true,
      data: {
        code: '',
        academicLevel: '',
        maxStudents: '',
        schedule: [{ day: '', startTime: '', endTime: '' }],
      },
      error: '',
    });
  
  const openEditGroup = (group) =>
    setGroupDialog({
      mode: 'edit',
      open: true,
      data: {
        ...group,
        maxStudents: group.maxStudents.toString(),
        schedule: group.schedule.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      },
      error: '',
    });
  
  const closeGroupDialog = () => setGroupDialog((d) => ({ ...d, open: false }));

  const openDeleteGroup = (id, code) =>
    setDeleteDialog({ open: true, id, code, error: '' });
  
  const closeDeleteDialog = () =>
    setDeleteDialog((d) => ({ ...d, open: false }));

  const handleGroupField = (field, value) =>
    setGroupDialog((d) => ({ ...d, data: { ...d.data, [field]: value } }));

  const handleScheduleChange = (idx, field, value) => {
    setGroupDialog((d) => {
      const sched = [...d.data.schedule];
      sched[idx] = { ...sched[idx], [field]: value };
      return { ...d, data: { ...d.data, schedule: sched } };
    });
  };
  
  const addScheduleRow = () =>
    setGroupDialog((d) => ({
      ...d,
      data: {
        ...d.data,
        schedule: [...d.data.schedule, { day: '', startTime: '', endTime: '' }],
      },
    }));
  
  const removeScheduleRow = (idx) =>
    setGroupDialog((d) => ({
      ...d,
      data: {
        ...d.data,
        schedule: d.data.schedule.filter((_, i) => i !== idx),
      },
    }));

  const submitGroup = async () => {
    const { mode, data } = groupDialog;
    setGroupDialog((d) => ({ ...d, error: '' }));
    try {
      const payload = {
        code: data.code,
        academicLevel: data.academicLevel,
        maxStudents: Number(data.maxStudents),
        schedule: data.schedule.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      };
      if (mode === 'create') {
        await createGroup(payload);
      } else {
        await updateGroup(data._id, payload);
      }
      closeGroupDialog();
      fetchGroups();
    } catch (err) {
      setGroupDialog((d) => ({
        ...d,
        error: err.response?.data?.message || 'Operation failed.',
      }));
    }
  };

  const submitDeleteGroup = async () => {
    setDeleteDialog((d) => ({ ...d, error: '' }));
    try {
      await deleteGroup(deleteDialog.id);
      closeDeleteDialog();
      fetchGroups();
    } catch (err) {
      setDeleteDialog((d) => ({
        ...d,
        error: err.response?.data?.message || 'Deletion failed.',
      }));
    }
  };

  // Enhanced status chip colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  // Calculate statistics
  const totalStudents = groups.reduce((sum, group) => sum + group.maxStudents, 0);
  const todayAttendance = attendance.filter(a => a.status === 'present').length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(135deg, ${professionalColors.primary}, ${professionalColors.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block'
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Comprehensive management system for assistants, groups, and attendance monitoring
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>
      </motion.div>

      {/* Enhanced Navigation Tabs */}
      <Paper 
        sx={{ 
          mb: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.05)}, ${alpha(professionalColors.secondary, 0.05)})`,
          border: `1px solid ${alpha(professionalColors.primary, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          textColor="primary"
          indicatorColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 600,
              fontSize: '0.95rem',
              '&.Mui-selected': {
                color: professionalColors.primary,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: professionalColors.primary,
              height: 3,
              borderRadius: 3
            }
          }}
        >
          <Tab 
            icon={<VisibilityIcon />} 
            label="Dashboard Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Assistant Management" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupIcon />} 
            label="Group Management" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <AnimatePresence mode="wait">
        {tabIndex === 0 && (
          <motion.div
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { 
                  label: 'Total Assistants', 
                  value: assistants.length, 
                  icon: PeopleIcon,
                  color: 'primary',
                  description: 'Registered teaching assistants'
                },
                { 
                  label: 'Active Groups', 
                  value: groups.length, 
                  icon: GroupIcon,
                  color: 'secondary',
                  description: 'Managed student groups'
                },
               
              ].map((stat, i) => (
                <Grid key={stat.label} item xs={12} sm={6} lg={3}>
                  <motion.div variants={cardVariants}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette[stat.color].main, 0.1)}, ${alpha(theme.palette[stat.color].main, 0.05)})`,
                        border: `1px solid ${alpha(theme.palette[stat.color].main, 0.2)}`,
                        borderRadius: 3,
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px 0 rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box flex={1}>
                            <Typography 
                              color="textSecondary" 
                              variant="body2"
                              fontWeight={600}
                              sx={{ mb: 0.5 }}
                            >
                              {stat.label}
                            </Typography>
                            <Typography 
                              variant="h3" 
                              fontWeight="bold"
                              sx={{ 
                                color: theme.palette[stat.color].main,
                                mb: 1
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ opacity: 0.8 }}
                            >
                              {stat.description}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              backgroundColor: alpha(theme.palette[stat.color].main, 0.1),
                              ml: 2
                            }}
                          >
                            <stat.icon 
                              sx={{ 
                                fontSize: 32,
                                color: theme.palette[stat.color].main 
                              }} 
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              {/* Enhanced Assistants List */}
              <Grid item xs={12} lg={6}>
                <motion.div variants={itemVariants}>
                  <Card 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                      height: '100%'
                    }}
                  >
                    <CardHeader
                      title="Recent Assistants"
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      action={
                        <Tooltip title="Refresh assistants">
                          <IconButton 
                            onClick={() => window.location.reload()}
                            sx={{
                              backgroundColor: alpha(professionalColors.primary, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(professionalColors.primary, 0.2),
                              }
                            }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ p: 0 }}>
                      {loadingAssistants ? (
                        <Box display="flex" justifyContent="center" p={3}>
                          <CircularProgress />
                        </Box>
                      ) : errorAssistants ? (
                        <Alert 
                          severity="error" 
                          sx={{ m: 2 }}
                          action={
                            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                              RETRY
                            </Button>
                          }
                        >
                          {errorAssistants}
                        </Alert>
                      ) : (
                        <List disablePadding>
                          {assistants.slice(0, 5).map((a, index) => (
                            <ListItem 
                              key={a._id} 
                              divider={index < Math.min(assistants.length - 1, 4)}
                              sx={{ 
                                px: 3, 
                                py: 2.5,
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(professionalColors.primary, 0.04),
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: professionalColors.primary,
                                    fontWeight: 600
                                  }}
                                >
                                  {a.name[0].toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={
                                  <Typography fontWeight={600} variant="body1">
                                    {a.name}
                                  </Typography>
                                } 
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {a.email}
                                  </Typography>
                                }
                              />
                              <Chip 
                                label="Active" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 600,
                                  borderWidth: 2
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

             
            </Grid>
          </motion.div>
        )}

        {tabIndex === 1 && (
          <motion.div
            key="assistants"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {/* Enhanced Create Assistant Card */}
              <Grid item xs={12} lg={4}>
                <motion.div variants={cardVariants}>
                  <Card 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                      height: 'fit-content'
                    }}
                  >
                    <CardHeader
                      title="Create Assistant"
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      avatar={
                        <Avatar sx={{ bgcolor: professionalColors.primary }}>
                          <AddIcon />
                        </Avatar>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ pt: 3 }}>
                      <Box component="form" onSubmit={submitCreate} sx={{ display: 'grid', gap: 2.5 }}>
                        {[
                          { field: 'name', label: 'Full Name', type: 'text' },
                          { field: 'email', label: 'Email Address', type: 'email' },
                          { field: 'password', label: 'Password', type: 'password' },
                          { field: 'cardId', label: 'Card ID', type: 'text' },
                        ].map(({ field, label, type }) => (
                          <TextField
                            key={field}
                            name={field}
                            label={label}
                            type={type}
                            value={newAsst[field]}
                            onChange={(e) =>
                              setNewAsst((s) => ({ ...s, [field]: e.target.value }))
                            }
                            required
                            fullWidth
                            size="medium"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        ))}
                        <Button 
                          type="submit" 
                          variant="contained" 
                          fullWidth
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${professionalColors.primary}, ${professionalColors.secondary})`,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '1rem',
                            mt: 1
                          }}
                        >
                          Create Assistant
                        </Button>
                      </Box>
                      {createError && (
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mt: 2,
                            borderRadius: 2
                          }}
                        >
                          {createError}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Enhanced Assistants List Card */}
              <Grid item xs={12} lg={8}>
                <motion.div variants={cardVariants}>
                  <Card 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
                    }}
                  >
                    <CardHeader
                      title="Assistant Management"
                      subheader={`${assistants.length} assistant(s) registered`}
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      action={
                        <Tooltip title="Refresh list">
                          <IconButton 
                            onClick={() => window.location.reload()}
                            sx={{
                              backgroundColor: alpha(professionalColors.primary, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(professionalColors.primary, 0.2),
                              }
                            }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ p: 0 }}>
                      {loadingAssistants ? (
                        <Box display="flex" justifyContent="center" p={3}>
                          <CircularProgress />
                        </Box>
                      ) : errorAssistants ? (
                        <Alert 
                          severity="error" 
                          sx={{ m: 2 }}
                          action={
                            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                              RETRY
                            </Button>
                          }
                        >
                          {errorAssistants}
                        </Alert>
                      ) : (
                        <List disablePadding>
                          {assistants.map((a, index) => (
                            <ListItem 
                              key={a._id} 
                              divider={index < assistants.length - 1}
                              secondaryAction={
                                <Tooltip title="Reset Password & Card">
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => openReset(a._id)}
                                    sx={{
                                      color: professionalColors.primary,
                                      backgroundColor: alpha(professionalColors.primary, 0.1),
                                      '&:hover': {
                                        backgroundColor: alpha(professionalColors.primary, 0.2),
                                      }
                                    }}
                                  >
                                    <SecurityIcon />
                                  </IconButton>
                                </Tooltip>
                              }
                              sx={{ 
                                px: 3, 
                                py: 2.5,
                                transition: 'background-color 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(professionalColors.primary, 0.04),
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: professionalColors.primary,
                                    fontWeight: 600
                                  }}
                                >
                                  {a.name[0].toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={
                                  <Typography fontWeight={600} variant="body1">
                                    {a.name}
                                  </Typography>
                                } 
                                secondary={
                                  <Typography variant="body2" color="text.secondary">
                                    {a.email}
                                  </Typography>
                                }
                              />
                              <Chip 
                                label={a.cardId || 'No Card'} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  mr: 2,
                                  fontWeight: 600,
                                  borderWidth: 2
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Enhanced Reset Password Dialog */}
            <Dialog
              open={resetDialog.open}
              onClose={() => setResetDialog((d) => ({ ...d, open: false }))}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: '0 20px 60px 0 rgba(0,0,0,0.15)'
                }
              }}
            >
              <DialogTitle sx={{ 
                fontWeight: 600,
                background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.05)}, ${alpha(professionalColors.secondary, 0.05)})`
              }}>
                Reset Assistant Credentials
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    label="New Card ID"
                    value={resetDialog.cardId}
                    onChange={(e) =>
                      setResetDialog((d) => ({ ...d, cardId: e.target.value }))
                    }
                    fullWidth
                    required
                    helperText="Enter the new card ID for this assistant"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  {resetDialog.error && (
                    <Alert 
                      severity="error" 
                      sx={{ borderRadius: 2 }}
                    >
                      {resetDialog.error}
                    </Alert>
                  )}
                  {resetDialog.newPassword && (
                    <Alert 
                      severity="success" 
                      sx={{ borderRadius: 2 }}
                    >
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        ✅ Password Reset Successful
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, mb: 1 }}>
                        New Password: <strong>{resetDialog.newPassword}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Please provide this password to the assistant and instruct them to change it immediately.
                      </Typography>
                    </Alert>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  onClick={() => setResetDialog((d) => ({ ...d, open: false }))}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitReset} 
                  variant="contained"
                  disabled={!resetDialog.cardId}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 3,
                    background: `linear-gradient(135deg, ${professionalColors.primary}, ${professionalColors.secondary})`,
                  }}
                >
                  Reset Credentials
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        )}

        {tabIndex === 2 && (
          <motion.div
            key="groups"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Enhanced Groups Management Header */}
            <Card 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.03)}, ${alpha(professionalColors.secondary, 0.03)})`,
                border: `1px solid ${alpha(professionalColors.primary, 0.1)}`
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Group Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Create and manage student groups with customized schedules
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateGroup}
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${professionalColors.primary}, ${professionalColors.secondary})`,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      px: 4,
                      py: 1
                    }}
                  >
                    Create Group
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Enhanced Groups Table */}
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
              }}
            >
              <CardHeader
                title="All Groups"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                action={
                  <Tooltip title="Refresh groups">
                    <IconButton 
                      onClick={fetchGroups}
                      sx={{
                        backgroundColor: alpha(professionalColors.primary, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(professionalColors.primary, 0.2),
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {loadingGroups ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : errorGroups ? (
                  <Alert 
                    severity="error" 
                    sx={{ m: 2 }}
                    action={
                      <Button color="inherit" size="small" onClick={fetchGroups}>
                        RETRY
                      </Button>
                    }
                  >
                    {errorGroups}
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, py: 3 }}>Group Code</TableCell>
                          <TableCell sx={{ fontWeight: 600, py: 3 }}>Academic Level</TableCell>
                          <TableCell sx={{ fontWeight: 600, py: 3 }}>Max Students</TableCell>
                          <TableCell sx={{ fontWeight: 600, py: 3 }}>Schedule</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, py: 3 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groups.map((group) => (
                          <TableRow 
                            key={group._id} 
                            hover
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              transition: 'background-color 0.2s ease'
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight={600} color="primary">
                                {group.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={group.academicLevel} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 600,
                                  borderWidth: 2
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500}>
                                {group.maxStudents}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ maxWidth: 200 }}>
                                <Tooltip title={group.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}>
                                  <Typography variant="body2" noWrap>
                                    {group.schedule.map(s => 
                                      `${s.day.slice(0, 3)} ${s.startTime}`
                                    ).join(', ')}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="Edit group">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => openEditGroup(group)}
                                    sx={{
                                      color: professionalColors.primary,
                                      backgroundColor: alpha(professionalColors.primary, 0.1),
                                      '&:hover': {
                                        backgroundColor: alpha(professionalColors.primary, 0.2),
                                      }
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete group">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => openDeleteGroup(group._id, group.code)}
                                    sx={{
                                      color: professionalColors.error,
                                      backgroundColor: alpha(professionalColors.error, 0.1),
                                      '&:hover': {
                                        backgroundColor: alpha(professionalColors.error, 0.2),
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Create/Edit Group Dialog */}
            <Dialog
              open={groupDialog.open}
              onClose={closeGroupDialog}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: '0 20px 60px 0 rgba(0,0,0,0.15)'
                }
              }}
            >
              <DialogTitle sx={{ 
                fontWeight: 600,
                background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.05)}, ${alpha(professionalColors.secondary, 0.05)})`,
                borderBottom: `1px solid ${alpha(professionalColors.primary, 0.1)}`
              }}>
                {groupDialog.mode === 'create' ? 'Create New Group' : 'Edit Group'}
              </DialogTitle>
              <DialogContent sx={{ p: 4 }}>
                <Stack spacing={4} sx={{ mt: 1 }}>
                  {groupDialog.error && (
                    <Alert 
                      severity="error" 
                      sx={{ borderRadius: 2 }}
                    >
                      {groupDialog.error}
                    </Alert>
                  )}
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Group Code"
                        value={groupDialog.data.code}
                        onChange={(e) => handleGroupField('code', e.target.value)}
                        fullWidth
                        required
                        helperText="Unique identifier for the group"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Academic Level"
                        value={groupDialog.data.academicLevel}
                        onChange={(e) => handleGroupField('academicLevel', e.target.value)}
                        fullWidth
                        required
                        helperText="e.g., Grade 10, Undergraduate, etc."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Maximum Students"
                        type="number"
                        value={groupDialog.data.maxStudents}
                        onChange={(e) => handleGroupField('maxStudents', e.target.value)}
                        fullWidth
                        required
                        helperText="Maximum number of students in this group"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                      Schedule Configuration
                    </Typography>
                    {groupDialog.data.schedule.map((row, idx) => (
                      <Paper 
                        key={idx} 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          mb: 2, 
                          borderRadius: 2,
                          border: `1px solid ${alpha(professionalColors.primary, 0.2)}`
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <TextField
                              select
                              label="Day of Week"
                              value={row.day}
                              onChange={(e) => handleScheduleChange(idx, 'day', e.target.value)}
                              fullWidth
                              size="medium"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            >
                              {[
                                'monday',
                                'tuesday',
                                'wednesday',
                                'thursday',
                                'friday',
                                'saturday',
                                'sunday',
                              ].map((d) => (
                                <MenuItem key={d} value={d}>
                                  {d.charAt(0).toUpperCase() + d.slice(1)}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              label="Start Time"
                              type="time"
                              value={row.startTime}
                              onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              size="medium"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              label="End Time"
                              type="time"
                              value={row.endTime}
                              onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              fullWidth
                              size="medium"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <IconButton 
                              onClick={() => removeScheduleRow(idx)}
                              color="error"
                              disabled={groupDialog.data.schedule.length === 1}
                              sx={{
                                backgroundColor: alpha(professionalColors.error, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(professionalColors.error, 0.2),
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    <Button 
                      onClick={addScheduleRow} 
                      startIcon={<AddIcon />}
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      Add Schedule Slot
                    </Button>
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  onClick={closeGroupDialog}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitGroup} 
                  variant="contained"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4,
                    background: `linear-gradient(135deg, ${professionalColors.primary}, ${professionalColors.secondary})`,
                  }}
                >
                  {groupDialog.mode === 'create' ? 'Create Group' : 'Save Changes'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Enhanced Delete Group Dialog */}
            <Dialog 
              open={deleteDialog.open} 
              onClose={closeDeleteDialog}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: '0 20px 60px 0 rgba(0,0,0,0.15)'
                }
              }}
            >
              <DialogTitle sx={{ fontWeight: 600 }}>
                Confirm Deletion
              </DialogTitle>
              <DialogContent>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography fontWeight={600}>
                    This action cannot be undone.
                  </Typography>
                </Alert>
                <Typography>
                  Are you sure you want to delete group <strong>"{deleteDialog.code}"</strong>?
                  This will permanently remove all associated data including attendance records.
                </Typography>
                {deleteDialog.error && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    {deleteDialog.error}
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  onClick={closeDeleteDialog}
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitDeleteGroup}
                  variant="contained"
                  color="error"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Delete Group
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}