// src/pages/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter } from 'date-fns';

import {
  createStudent,
  getAllStudents,
  getMySuspensions,
  suspendStudent,
  liftStudentSuspension,
  getAllGroups,
} from '../services/endpoints';

// Custom styled components
const StyledPaper = ({ children, ...props }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      background: 'white',
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Paper>
);

const StatusChip = ({ status }) => {
  const theme = useTheme();
  const config = {
    active: { label: 'Active', color: 'success', icon: <CheckCircleIcon /> },
    suspended: { label: 'Suspended', color: 'error', icon: <BlockIcon /> },
    temporary: { label: 'Temporary', color: 'warning', icon: <BlockIcon /> },
  };

  const { label, color, icon } = config[status] || config.active;

  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

const StatsCard = ({ title, value, icon, color }) => (
  <Card 
    sx={{ 
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
      border: `1px solid ${color}30`,
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Box sx={{ color, mb: 1 }}>{icon}</Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

// Enhanced AddTab Component
function AddTab({ onAdded }) {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    parentWhatsAppNumber: '',
    academicLevel: '',
    groupCode: '',
    attendanceCardCode: '',
  });
  const [groupsList, setGroupsList] = useState([]);
  const [loadingGroupsList, setLoadingGroupsList] = useState(true);
  const [errorGroupsList, setErrorGroupsList] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await getAllGroups();
      setGroupsList(res.data.data);
    } catch (err) {
      setErrorGroupsList(err.response?.data?.message || 'Failed to load groups');
    } finally {
      setLoadingGroupsList(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'groupCode') {
      const grp = groupsList.find((g) => g.code === value);
      setForm((f) => ({
        ...f,
        groupCode: value,
        academicLevel: grp?.academicLevel || '',
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createStudent(form);
      onAdded();
      setForm({
        fullName: '',
        phoneNumber: '',
        parentWhatsAppNumber: '',
        academicLevel: '',
        groupCode: '',
        attendanceCardCode: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon color="primary" />
        Add New Student
      </Typography>
      
      <StyledPaper>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="fullName"
                label="Full Name"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter student's full name"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="phoneNumber"
                label="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Student's phone number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="parentWhatsAppNumber"
                label="Parent WhatsApp Number"
                value={form.parentWhatsAppNumber}
                onChange={handleChange}
                placeholder="Parent's WhatsApp number"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errorGroupsList}>
                <InputLabel>Group</InputLabel>
                <Select
                  name="groupCode"
                  label="Group"
                  value={form.groupCode}
                  onChange={handleChange}
                  disabled={loadingGroupsList}
                >
                  {groupsList.map((g) => (
                    <MenuItem key={g._id} value={g.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" />
                        {g.code} - {g.academicLevel}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errorGroupsList && (
                  <FormHelperText>{errorGroupsList}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Level"
                name="academicLevel"
                value={form.academicLevel}
                InputProps={{ 
                  readOnly: true,
                  startAdornment: <SchoolIcon color="action" sx={{ mr: 1 }} />
                }}
                placeholder="Auto-filled from group"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="attendanceCardCode"
                label="Attendance Card Code"
                value={form.attendanceCardCode}
                onChange={handleChange}
                placeholder="Unique card identifier"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="reset"
                  variant="outlined"
                  onClick={() => setForm({
                    fullName: '',
                    phoneNumber: '',
                    parentWhatsAppNumber: '',
                    academicLevel: '',
                    groupCode: '',
                    attendanceCardCode: '',
                  })}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </StyledPaper>
    </Box>
  );
}

// Enhanced ListTab Component
function ListTab({ refreshToggle }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadStudents();
  }, [refreshToggle]);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllStudents();
      setStudents(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.groupCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.academicLevel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.attendanceCardCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? s.isActive :
      !s.isActive;
    
    return matchesSearch && matchesFilter;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    suspended: students.filter(s => !s.isActive).length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading students...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard
            title="Total Students"
            value={stats.total}
            icon={<PersonIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            title="Active Students"
            value={stats.active}
            icon={<CheckCircleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            title="Suspended Students"
            value={stats.suspended}
            icon={<BlockIcon />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <StyledPaper sx={{ mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search students by name, group, level, or card code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh">
            <IconButton onClick={loadStudents}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </StyledPaper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Students Table */}
      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Academic Info</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {paginated.map((student) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Badge
                          color={student.isActive ? "success" : "error"}
                          variant="dot"
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar
                            src={
                              student.photo?.startsWith('data:')
                                ? student.photo
                                : /^[A-Za-z0-9+/=]+$/.test(student.photo || '')
                                ? `data:image/jpeg;base64,${student.photo}`
                                : undefined
                            }
                            alt={student.fullName}
                            sx={{ width: 48, height: 48, mr: 2 }}
                          >
                            {student.fullName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="600">
                            {student.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Card: {student.attendanceCardCode}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Chip
                          label={student.academicLevel}
                          size="small"
                          variant="outlined"
                          icon={<SchoolIcon />}
                        />
                        <Chip
                          label={student.groupCode}
                          size="small"
                          variant="outlined"
                          icon={<GroupIcon />}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontFamily="monospace">
                            {student.phoneNumber}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <WhatsAppIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2" fontFamily="monospace">
                            {student.parentWhatsAppNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={student.isActive ? 'active' : 'suspended'} />
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No students found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      </StyledPaper>
    </Box>
  );
}

// Enhanced SuspendTab Component
function SuspendTab({ refreshToggle }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [suspensionMap, setSuspensionMap] = useState({});
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const [allRes, suspRes] = await Promise.all([
        getAllStudents(),
        getMySuspensions(),
      ]);

      const allStudents = allRes.data.data;
      const suspensions = suspRes.data.data;

      // هنحافظ على map للـ suspensions زي ما عندك
      const m = {};
      suspensions.forEach((s) => {
        if (s.student?._id) {
          m[s.student._id] = {
            type: s.type,
            notes: s.notes,
            endDate: s.endDate ? s.endDate.slice(0, 10) : null,
            suspensionId: s._id,
          };
        }
      });

      // نتاكد الطلبة بتوع الـ suspensions موجودين في students list
      const suspStudents = suspensions
        .map((s) => s.student)
        .filter(Boolean);

      // merge
      const merged = [
        ...allStudents,
        ...suspStudents.filter(
          (ss) => !allStudents.some((as) => as._id === ss._id)
        ),
      ];

      setStudents(merged);
      setSuspensionMap(m);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  })();
}, [refreshToggle]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, suspensionsRes] = await Promise.all([
        getAllStudents(),
        getMySuspensions(),
      ]);
      
      setStudents(studentsRes.data.data);
      
      const m = {};
      suspensionsRes.data.data.forEach((s) => {
        if (s.student?._id) {
          m[s.student._id] = {
            type: s.type,
            notes: s.notes,
            endDate: s.endDate?.slice(0, 10),
            suspensionId: s._id,
            createdAt: s.createdAt,
          };
        }
      });
      setSuspensionMap(m);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    if (filter === 'active') return s.isActive;
    if (filter === 'suspended') return !s.isActive;
    return true;
  });

  const openDialog = (student) => {
    setSelectedStudent(student);
    setError('');
    setDialogOpen(true);
  };

  const handleSuspend = async (studentId) => {
    const entry = suspensionMap[studentId] || {};
    const { type, notes = '', endDate } = entry;

    if (!type) {
      setError('Please select a suspension type');
      return;
    }
    if (type === 'temporary' && !endDate) {
      setError('End date is required for temporary suspension');
      return;
    }
    if (type === 'temporary' && isAfter(new Date(), new Date(endDate))) {
      setError('End date must be in the future');
      return;
    }

    setError('');
    setActionLoading((a) => ({ ...a, [studentId]: true }));
    try {
      const res = await suspendStudent({
        studentId,
        type,
        notes,
        endDate: type === 'temporary' ? endDate : null,
      });
      setSuspensionMap((m) => ({
        ...m,
        [studentId]: { ...entry, suspensionId: res.data.data._id, createdAt: new Date().toISOString() },
      }));
      setStudents((list) =>
        list.map((s) => (s._id === studentId ? { ...s, isActive: false } : s))
      );
      setDialogOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend student');
    } finally {
      setActionLoading((a) => ({ ...a, [studentId]: false }));
    }
  };

  const handleLift = async (studentId) => {
    setError('');
    setActionLoading((a) => ({ ...a, [studentId]: true }));
    try {
      await liftStudentSuspension(studentId);
      setStudents((list) =>
        list.map((s) => (s._id === studentId ? { ...s, isActive: true } : s))
      );
      setSuspensionMap((m) => {
        const nxt = { ...m };
        delete nxt[studentId];
        return nxt;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lift suspension');
    } finally {
      setActionLoading((a) => ({ ...a, [studentId]: false }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading suspension data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <StyledPaper sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Student Suspension Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage student suspensions and reinstatements
            </Typography>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter">
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="suspended">Suspended Only</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh">
              <IconButton onClick={loadData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </StyledPaper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Suspensions Table */}
      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Academic Info</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Suspension Details</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((student) => {
                const suspension = suspensionMap[student._id];
                const isSuspended = !student.isActive;
                
                return (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={
                            student.photo?.startsWith('data:')
                              ? student.photo
                              : /^[A-Za-z0-9+/=]+$/.test(student.photo || '')
                              ? `data:image/jpeg;base64,${student.photo}`
                              : undefined
                          }
                          sx={{ mr: 2 }}
                        >
                          {student.fullName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {student.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.phoneNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Chip label={student.academicLevel} size="small" />
                        <Chip label={student.groupCode} size="small" variant="outlined" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={isSuspended ? (suspension?.type === 'temporary' ? 'temporary' : 'suspended') : 'active'} />
                    </TableCell>
                    <TableCell>
                      {isSuspended ? (
                        <Box>
                          <Typography variant="body2">
                            <strong>Type:</strong> {suspension?.type || '—'}
                          </Typography>
                          {suspension?.type === 'temporary' && suspension?.endDate && (
                            <Typography variant="body2">
                              <strong>Until:</strong> {format(new Date(suspension.endDate), 'MMM dd, yyyy')}
                            </Typography>
                          )}
                          {suspension?.notes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Notes:</strong> {suspension.notes}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          No active suspension
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {student.isActive ? (
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<BlockIcon />}
                          onClick={() => openDialog(student)}
                          size="small"
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleLift(student._id)}
                          disabled={actionLoading[student._id]}
                          size="small"
                        >
                          {actionLoading[student._id] ? (
                            <CircularProgress size={16} />
                          ) : (
                            'Lift Suspension'
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No students found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      {/* Suspension Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedStudent && (
          <>
            <DialogTitle sx={{ pb: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <BlockIcon color="warning" />
                Suspend Student
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="600">
                  You are about to suspend: {selectedStudent.fullName}
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.academicLevel} • {selectedStudent.groupCode}
                </Typography>
              </Box>

              <Box display="grid" gap={3}>
                <FormControl fullWidth required>
                  <InputLabel>Suspension Type</InputLabel>
                  <Select
                    value={suspensionMap[selectedStudent._id]?.type || ''}
                    onChange={(e) =>
                      setSuspensionMap((m) => ({
                        ...m,
                        [selectedStudent._id]: {
                          ...(m[selectedStudent._id] || {}),
                          type: e.target.value,
                        },
                      }))
                    }
                    label="Suspension Type"
                  >
                    <MenuItem value="temporary">Temporary Suspension</MenuItem>
                    <MenuItem value="permanent">Permanent Suspension</MenuItem>
                  </Select>
                </FormControl>

                {suspensionMap[selectedStudent._id]?.type === 'temporary' && (
                  <TextField
                    fullWidth
                    type="date"
                    label="Suspension End Date"
                    InputLabelProps={{ shrink: true }}
                    value={suspensionMap[selectedStudent._id]?.endDate || ''}
                    onChange={(e) =>
                      setSuspensionMap((m) => ({
                        ...m,
                        [selectedStudent._id]: {
                          ...(m[selectedStudent._id] || {}),
                          endDate: e.target.value,
                        },
                      }))
                    }
                    helperText="Date when suspension will be automatically lifted"
                  />
                )}

                <TextField
                  fullWidth
                  label="Suspension Notes"
                  multiline
                  rows={3}
                  placeholder="Reason for suspension (optional but recommended)"
                  value={suspensionMap[selectedStudent._id]?.notes || ''}
                  onChange={(e) =>
                    setSuspensionMap((m) => ({
                      ...m,
                      [selectedStudent._id]: {
                        ...(m[selectedStudent._id] || {}),
                        notes: e.target.value,
                      },
                    }))
                  }
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button onClick={() => setDialogOpen(false)} variant="outlined">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => handleSuspend(selectedStudent._id)}
                disabled={actionLoading[selectedStudent._id]}
                startIcon={actionLoading[selectedStudent._id] ? <CircularProgress size={16} /> : <BlockIcon />}
              >
                {actionLoading[selectedStudent._id] ? 'Suspending...' : 'Confirm Suspension'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// Main Component
export default function StudentManagement() {
  const [tab, setTab] = useState(0);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const refreshData = () => {
    setRefreshToggle((t) => !t);
  };

  const tabLabels = ['Add Student', 'Student List', 'Manage Suspensions'];
  const tabIcons = [<AddIcon />, <PersonIcon />, <BlockIcon />];

  return (
    <Container >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="700" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage student records, attendance, and suspensions
        </Typography>
      </Box>

      {/* Enhanced Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 64,
            '& .MuiTab-root': {
              minHeight: 64,
              fontSize: '1rem',
              fontWeight: 600,
              gap: 1,
            },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={label}
              icon={tabIcons[index]}
              label={label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 0 && <AddTab onAdded={refreshData} />}
          {tab === 1 && <ListTab refreshToggle={refreshToggle} />}
          {tab === 2 && <SuspendTab refreshToggle={refreshToggle} />}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}