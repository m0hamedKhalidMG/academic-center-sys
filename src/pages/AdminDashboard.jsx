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
} from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);

  // --- Assistants ---
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

  // --- Attendance ---
  const [filters, setFilters] = useState({
    date: new Date().toISOString().slice(0, 10),
    groupCode: '',
  });
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [errorAttendance, setErrorAttendance] = useState('');

  // --- Groups ---
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

  // --- Effects ---
  useEffect(() => {
    // load assistants
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
    // load groups
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
        // ensure it's always an array
        const arr = Array.isArray(res.data.data) ? res.data.data : [];
        setAttendance(arr);
      } catch (err) {
        setErrorAttendance(
          err.response?.data?.message || 'Failed to load attendance.'
        );
        setAttendance([]); // fallback to empty
      } finally {
        setLoadingAttendance(false);
      }
    })();
  }, [filters]);

  // --- Helpers ---
  const handleFilterChange = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  // --- Assistants: create ---
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

  // --- Assistants: reset ---
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

  // --- Groups API ---
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

  // --- Groups: dialog handlers ---
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

  // --- Groups: create/update ---
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

  // --- Groups: delete ---
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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Manage Assistants" />
        <Tab label="Manage Groups" />
      </Tabs>

      {tabIndex === 0 && (
        <Box>
          {/* Overview Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                name="date"
                label="Date"
                fullWidth
                value={filters.date}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              {errorGroups && <Alert severity="error">{errorGroups}</Alert>}
              <TextField
                select
                name="groupCode"
                label="Group"
                fullWidth
                value={filters.groupCode}
                onChange={handleFilterChange}
                disabled={loadingGroups}
              >
                <MenuItem value="">Select Group</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g.code}>
                    {g.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Overview Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              { label: 'Assistants', value: assistants.length },
              {
                label: 'Attendance',
                value: filters.groupCode ? attendance.length : 0,
              },
            ].map((c, i) => (
              <Grid key={c.label} item xs={12} sm={6} md={3}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary">{c.label}</Typography>
                      <Typography variant="h3">{c.value}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Overview Assistants */}
          <Typography variant="h6" gutterBottom>
            Assistants
          </Typography>
          {loadingAssistants ? (
            <CircularProgress />
          ) : errorAssistants ? (
            <Alert severity="error">{errorAssistants}</Alert>
          ) : (
            <Paper sx={{ maxHeight: 240, overflow: 'auto', mb: 4 }}>
              <List disablePadding>
                {assistants.map((a) => (
                  <ListItem key={a._id} divider>
                    <ListItemAvatar>
                      <Avatar>{a.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={a.name} secondary={a.email} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Overview Attendance */}
          <Typography variant="h6" gutterBottom>
            Attendance
          </Typography>
          {!filters.groupCode ? (
            <Alert severity="info">
              Please select a group to view attendance.
            </Alert>
          ) : loadingAttendance ? (
            <CircularProgress />
          ) : errorAttendance ? (
            <Alert severity="error">{errorAttendance}</Alert>
          ) : attendance.length === 0 ? (
            <Alert severity="info">
              No attendance recorded for {filters.date}.
            </Alert>
          ) : (
            <Paper>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Scanned At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.map((rec) => (
                      <TableRow key={rec._id}>
                        <TableCell>{rec.student.fullName}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {rec.status}
                        </TableCell>
                        <TableCell>
                          {new Date(rec.scannedAt).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          {/* Create Assistant */}
          <Typography variant="h6" gutterBottom>
            Create New Assistant
          </Typography>
          <Box
            component="form"
            onSubmit={submitCreate}
            sx={{
              mb: 2,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            }}
          >
            {['name', 'email', 'password', 'cardId'].map((f) => (
              <TextField
                key={f}
                name={f}
                label={f.charAt(0).toUpperCase() + f.slice(1)}
                type={f === 'password' ? 'password' : 'text'}
                value={newAsst[f]}
                onChange={(e) =>
                  setNewAsst((s) => ({ ...s, [f]: e.target.value }))
                }
                required
              />
            ))}
            <Button type="submit" variant="contained">
              Create
            </Button>
          </Box>
          {createError && <Alert severity="error">{createError}</Alert>}

          {/* Reset Password */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Reset Assistant Password
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List disablePadding>
              {assistants.map((a) => (
                <ListItem
                  key={a._id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => openReset(a._id)}>
                      <RefreshIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={a.name} secondary={a.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Dialog
            open={resetDialog.open}
            onClose={() => setResetDialog((d) => ({ ...d, open: false }))}
          >
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent sx={{ display: 'grid', gap: 2, width: 300 }}>
              <TextField
                label="New Card ID"
                value={resetDialog.cardId}
                onChange={(e) =>
                  setResetDialog((d) => ({ ...d, cardId: e.target.value }))
                }
                required
              />
              {resetDialog.error && (
                <Alert severity="error">{resetDialog.error}</Alert>
              )}
              {resetDialog.newPassword && (
                <Alert severity="success">
                  New Password: <strong>{resetDialog.newPassword}</strong>
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setResetDialog((d) => ({ ...d, open: false }))}
              >
                Cancel
              </Button>
              <Button onClick={submitReset} variant="contained">
                Reset
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Manage Groups</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateGroup}
            >
              Add Group
            </Button>
          </Box>

          {loadingGroups ? (
            <CircularProgress />
          ) : errorGroups ? (
            <Alert severity="error">{errorGroups}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Max Students</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g._id}>
                      <TableCell>{g.code}</TableCell>
                      <TableCell>{g.academicLevel}</TableCell>
                      <TableCell>{g.maxStudents}</TableCell>
                      <TableCell>
                        {g.schedule
                          .map((s) => `${s.day} ${s.startTime}-${s.endTime}`)
                          .join(', ')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEditGroup(g)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => openDeleteGroup(g._id, g.code)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Create/Edit Group Dialog */}
          <Dialog
            open={groupDialog.open}
            onClose={closeGroupDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {groupDialog.mode === 'create' ? 'Create Group' : 'Edit Group'}
            </DialogTitle>
            <DialogContent sx={{ display: 'grid', gap: 2 }}>
              {groupDialog.error && (
                <Alert severity="error">{groupDialog.error}</Alert>
              )}
              <TextField
                label="Code"
                value={groupDialog.data.code}
                onChange={(e) => handleGroupField('code', e.target.value)}
                fullWidth
              />
              <TextField
                label="Academic Level"
                value={groupDialog.data.academicLevel}
                onChange={(e) =>
                  handleGroupField('academicLevel', e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Max Students"
                type="number"
                value={groupDialog.data.maxStudents}
                onChange={(e) =>
                  handleGroupField('maxStudents', e.target.value)
                }
                fullWidth
              />

              <Typography>Schedule</Typography>
              {groupDialog.data.schedule.map((row, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    select
                    label="Day"
                    value={row.day}
                    onChange={(e) =>
                      handleScheduleChange(idx, 'day', e.target.value)
                    }
                    sx={{ flex: 1 }}
                  >
                    {[
                      'sunday',
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                    ].map((d) => (
                      <MenuItem key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Start"
                    type="time"
                    value={row.startTime}
                    onChange={(e) =>
                      handleScheduleChange(idx, 'startTime', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End"
                    type="time"
                    value={row.endTime}
                    onChange={(e) =>
                      handleScheduleChange(idx, 'endTime', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton onClick={() => removeScheduleRow(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button onClick={addScheduleRow}>Add Schedule Row</Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeGroupDialog}>Cancel</Button>
              <Button onClick={submitGroup} variant="contained">
                {groupDialog.mode === 'create' ? 'Create' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Group Dialog */}
          <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete group{' '}
                <strong>{deleteDialog.code}</strong>?
              </Typography>
              {deleteDialog.error && (
                <Alert severity="error">{deleteDialog.error}</Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDeleteDialog}>Cancel</Button>
              <Button
                onClick={submitDeleteGroup}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
}
