// src/components/AttendanceReport.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  QrCodeScanner as ScanIcon,
  Today as TodayIcon,
  FilterAlt as FilterIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import {
  scanAttendance,
  getDailyGroupAttendance,
  getGroupAttendanceReport,
  getAllGroups, // Changed from getAllStudents
  sendAttendanceNotification,
} from '../services/endpoints';
import { format } from 'date-fns';

// Styled components for consistent spacing & hover
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  '&:first-of-type': { paddingLeft: theme.spacing(3) },
  '&:last-of-type': { paddingRight: theme.spacing(3) },
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': { backgroundColor: theme.palette.action.hover },
}));
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

export default function AttendanceReport() {
  const theme = useTheme();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Tab
  const [tab, setTab] = useState(0);

  // Scan state
  const inputRef = useRef(null);
  const scanLockRef = useRef(false);
  const [cardCode, setCardCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState('');
  const [recentlyScanned, setRecentlyScanned] = useState([]);

  // Filters & groups
  const [filters, setFilters] = useState({
    date: todayStr,
    groupCode: '',
    month: currentMonth,
    year: currentYear,
  });
  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [errorGroups, setErrorGroups] = useState('');

  // Daily summary
  const [dailyData, setDailyData] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [errorDaily, setErrorDaily] = useState('');

  // Monthly report
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [errorMonthly, setErrorMonthly] = useState('');

  // Notifications
  const [notifyStatus, setNotifyStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // Track timeouts
  const timeoutsRef = useRef([]);

  // Scan handler
 // Update the handleScan function to handle suspended students
const handleScan = async (e) => {
  e.preventDefault();
  if (scanLockRef.current) return;
  scanLockRef.current = true;
  setScanError('');
  setScanSuccess('');
  if (!cardCode.trim()) {
    setScanError('Please enter or scan a card code.');
    scanLockRef.current = false;
    return;
  }
  const code = cardCode.trim();
  setCardCode('');
  setScanLoading(true);
  if (recentlyScanned.includes(code)) {
    setScanError('This card was already scanned recently.');
    timeoutsRef.current.push(setTimeout(() => inputRef.current?.focus(), 50));
    setScanLoading(false);
    scanLockRef.current = false;
    return;
  }
  try {
    const res = await scanAttendance({ cardCode: code });
    
    // Check if student is suspended
    if (res.data && res.data.success === false && res.data.data.message === "Student is suspended") {
      const student = res.data.data.student;
      const suspension = res.data.data.suspension;
      
      // Format suspension details
      const suspensionType = suspension.type === 'permanent' ? 'Permanently' : 'Temporarily';
      const endDate = suspension.endDate 
        ? ` until ${format(new Date(suspension.endDate), 'MMM dd, yyyy')}`
        : '';
      
      setScanError(
        `Student ${student.fullName} is ${suspensionType.toLowerCase()} suspended${endDate}.`
      );
    } else if (res.data?.success) {
      // Normal successful scan
      const name = res.data?.data?.student?.fullName || 'Unknown Student';
      setScanSuccess(`Marked attendance for: ${name}`);
      setRecentlyScanned((prev) => [...prev, code]);
      if (tab === 1) fetchDaily();
      timeoutsRef.current.push(
        setTimeout(
          () => setRecentlyScanned((prev) => prev.filter((c) => c !== code)),
          5000
        )
      );
    } else {
      // Other error cases
      setScanError(res.data?.data?.message || 'Scan failed');
    }
  } catch (err) {
    // Handle network errors or other exceptions
    setScanError(err.response?.data?.message || 'Scan failed');
  } finally {
    setScanLoading(false);
    timeoutsRef.current.push(
      setTimeout(() => (scanLockRef.current = false), 200)
    );
  }
};
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && cardCode) handleScan(e);
  };

  // Fetch groups - UPDATED to use getAllGroups
  const fetchGroups = async () => {
    setLoadingGroups(true);
    setErrorGroups('');
    try {
      const res = await getAllGroups();
      // Assuming the API returns an array of group objects with code property
      const groups = res.data.data.map(group => group.code).filter(Boolean);
      setGroupOptions(groups);
      if (groups.length === 1) {
        setFilters((f) => ({ ...f, groupCode: groups[0] }));
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setErrorGroups(err.response?.data?.message || 'Failed to load groups.');
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch daily
  const fetchDaily = async () => {
    if (!filters.groupCode) return;
    
    setLoadingDaily(true);
    setErrorDaily('');
    try {
      const res = await getDailyGroupAttendance({
        date: filters.date,
        groupCode: filters.groupCode,
      });
      setDailyData(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorDaily(
        err.response?.data?.message || 'Failed to load daily data.'
      );
      setDailyData(null);
    } finally {
      setLoadingDaily(false);
    }
  };

  // Fetch monthly
  const fetchMonthly = async () => {
    if (!filters.groupCode) return;
    
    setLoadingMonthly(true);
    setErrorMonthly('');
    try {
      const res = await getGroupAttendanceReport({
        month: filters.month,
        year: filters.year,
        groupCode: filters.groupCode,
      });
      setMonthlyData(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMonthly(err.response?.data?.message || 'Failed to load report.');
      setMonthlyData(null);
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Notify single daily (daily template, use dropdown groupCode)
  const handleNotify = async (rec) => {
    const payload = {
      studentName: rec.student.fullName,
      className: filters.groupCode,
      parentNumber: rec.student.parentWhatsAppNumber,
      date: filters.date,
    };
    console.log('Daily notify payload:', payload);
    setNotifyStatus({ loading: true, error: '', success: '' });
    try {
      await sendAttendanceNotification({ students: [payload] });
      setNotifyStatus({ loading: false, success: 'Notification sent!' });
    } catch (err) {
      console.error(err);
      setNotifyStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to notify',
      });
    }
  };

  // Notify all daily
  const handleNotifyAll = async () => {
    if (!dailyData) return;
    const students = dailyData.absentStudents.map((rec) => ({
      studentName: rec.student.fullName,
      className: filters.groupCode,
      parentNumber: rec.student.parentWhatsAppNumber,
      date: filters.date,
    }));
    console.log('Daily notify ALL payload:', students);
    setNotifyStatus({ loading: true, error: '', success: '' });
    try {
      await sendAttendanceNotification({ students });
      setNotifyStatus({ loading: false, success: 'All notified!' });
    } catch (err) {
      console.error(err);
      setNotifyStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to notify all',
      });
    }
  };

  // Notify single monthly
  const handleNotifyMonthly = async (rec) => {
    const payload = {
      studentName: rec.fullName,
      className: filters.groupCode,
      parentNumber: rec.parentWhatsAppNumber,
      absentCount: rec.absentDays,
      date: format(new Date(), 'yyyy-MM-dd'),
    };

    console.log('Monthly notify payload:', payload);
    setNotifyStatus({ loading: true, error: '', success: '' });
    try {
      await sendAttendanceNotification({ students: [payload] });
      setNotifyStatus({ loading: false, success: 'Notification sent!' });
    } catch (err) {
      console.error(err);
      setNotifyStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to notify',
      });
    }
  };

  // Notify all monthly
  const handleNotifyAllMonthly = async () => {
    if (!monthlyData) return;
    const students = monthlyData.students
      .filter((s) => s.absentDays > 0)
      .map((rec) => ({
        studentName: rec.fullName,
        className: filters.groupCode,
        parentNumber: rec.parentWhatsAppNumber,
        absentCount: rec.absentDays,
        date: format(new Date(), 'yyyy-MM-dd'),
      }));
    console.log('Monthly notify ALL payload:', students);
    setNotifyStatus({ loading: true, error: '', success: '' });
    try {
      await sendAttendanceNotification({ students });
      setNotifyStatus({ loading: false, success: 'All notified!' });
    } catch (err) {
      console.error(err);
      setNotifyStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to notify all',
      });
    }
  };

  // Effects
  useEffect(() => {
    fetchGroups();
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (filters.groupCode) fetchDaily();
  }, [filters.date, filters.groupCode]);

  useEffect(() => {
    if (filters.groupCode) fetchMonthly();
  }, [filters.month, filters.year, filters.groupCode]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Scan" icon={<ScanIcon />} iconPosition="start" />
        <Tab label="Daily Summary" icon={<TodayIcon />} iconPosition="start" />
        <Tab
          label="Monthly Report"
          icon={<FilterIcon />}
          iconPosition="start"
        />
      </Tabs>

      {(notifyStatus.error || notifyStatus.success) && (
        <Alert
          severity={notifyStatus.error ? 'error' : 'success'}
          sx={{ mb: 2 }}
        >
          {notifyStatus.error || notifyStatus.success}
        </Alert>
      )}

      {/* Scan Tab */}
      {tab === 0 && (
        <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }} elevation={2}>
          <Typography mb={2}>Scan Student Card</Typography>
          {scanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {scanError}
            </Alert>
          )}
          {scanSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {scanSuccess}
            </Alert>
          )}
          <Box component="form" onSubmit={handleScan}>
            <TextField
              fullWidth
              label="Card Code / QR"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={scanLoading}
              startIcon={
                scanLoading ? <CircularProgress size={20} /> : <ScanIcon />
              }
            >
              {scanLoading ? 'Processing...' : 'Scan'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Daily Summary Tab */}
      {tab === 1 && (
        <Box>
          {errorGroups && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGroups}
            </Alert>
          )}

          <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, date: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Group"
                  fullWidth
                  value={filters.groupCode}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, groupCode: e.target.value }))
                  }
                  disabled={loadingGroups}
                >
                  <MenuItem value="">Select group</MenuItem>
                  {groupOptions.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  onClick={fetchDaily}
                  disabled={loadingDaily || !filters.groupCode}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loadingDaily && <CircularProgress />}
          {errorDaily && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorDaily}
            </Alert>
          )}

          {dailyData &&
            (dailyData.presentStudents?.length > 0 ||
            dailyData.absentStudents?.length > 0 ? (
              <>
                <Grid container spacing={2} mb={3}>
                  {[
                    ['Total Students', dailyData.totalStudents],
                    ['Present', dailyData.presentCount],
                    ['Absent', dailyData.absentCount],
                  ].map(([label, value], idx) => (
                    <Grid key={idx} item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography>{label}</Typography>
                          <Typography
                            variant="h5"
                            color={
                              label === 'Present'
                                ? 'success.main'
                                : label === 'Absent'
                                ? 'error.main'
                                : 'text.primary'
                            }
                          >
                            {value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Paper elevation={1}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead
                        sx={{ backgroundColor: theme.palette.grey[100] }}
                      >
                        <TableRow>
                          <StyledTableCell>Student</StyledTableCell>
                          <StyledTableCell align="center">
                            Status
                          </StyledTableCell>
                          <StyledTableCell align="center">Time</StyledTableCell>
                          <StyledTableCell align="center">
                            Notify
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dailyData.presentStudents.map((rec) => (
                          <StyledTableRow key={rec.student._id}>
                            <StyledTableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <StyledAvatar>
                                  {rec.student.fullName.charAt(0)}
                                </StyledAvatar>
                                <Typography variant="subtitle1" noWrap>
                                  {rec.student.fullName}
                                </Typography>
                              </Stack>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Chip
                                icon={<PresentIcon />}
                                label="Present"
                                color="success"
                              />
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {rec.attendanceTime}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Tooltip title="Notify Parent">
                                <IconButton onClick={() => handleNotify(rec)}>
                                  <PhoneIcon />
                                </IconButton>
                              </Tooltip>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                        {dailyData.absentStudents.map((rec) => (
                          <StyledTableRow key={rec.student._id}>
                            <StyledTableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <StyledAvatar>
                                  {rec.student.fullName.charAt(0)}
                                </StyledAvatar>
                                <Typography variant="subtitle1" noWrap>
                                  {rec.student.fullName}
                                </Typography>
                              </Stack>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Chip
                                icon={<AbsentIcon />}
                                label="Absent"
                                color="error"
                              />
                            </StyledTableCell>
                            <StyledTableCell align="center">—</StyledTableCell>
                            <StyledTableCell align="center">
                              <Tooltip title="Notify Parent">
                                <IconButton onClick={() => handleNotify(rec)}>
                                  <PhoneIcon />
                                </IconButton>
                              </Tooltip>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ p: 2, textAlign: 'right' }}>
                    <Button
                      variant="outlined"
                      onClick={handleNotifyAll}
                      disabled={!dailyData.absentCount || notifyStatus.loading}
                    >
                      Notify All Absent
                    </Button>
                  </Box>
                </Paper>
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No attendance recorded for {filters.date}.
              </Alert>
            ))}
        </Box>
      )}

      {/* Monthly Report Tab */}
      {tab === 2 && (
        <Box>
          {errorGroups && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGroups}
            </Alert>
          )}

          <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Group"
                  fullWidth
                  value={filters.groupCode}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, groupCode: e.target.value }))
                  }
                  disabled={loadingGroups}
                >
                  <MenuItem value="">Select group</MenuItem>
                  {groupOptions.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  select
                  label="Month"
                  fullWidth
                  value={filters.month}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, month: Number(e.target.value) }))
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', {
                        month: 'long',
                      })}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField
                  label="Year"
                  type="number"
                  fullWidth
                  value={filters.year}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, year: Number(e.target.value) }))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={fetchMonthly}
                  disabled={loadingMonthly || !filters.groupCode}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  Load Report
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {loadingMonthly && <CircularProgress />}
          {errorMonthly && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMonthly}
            </Alert>
          )}

          {monthlyData && (
            <>
              <Typography variant="h6" gutterBottom>
                Report for {monthlyData.groupCode} — {monthlyData.month}/
                {monthlyData.year}
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography>Total Scheduled Days</Typography>
                      <Typography variant="h5">
                        {monthlyData.totalScheduledDays}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography>Avg Attendance</Typography>
                      <Typography variant="h5">
                        {monthlyData.averageAttendanceRate}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper elevation={1}>
                <TableContainer>
                  <Table size="small">
                    <TableHead
                      sx={{ backgroundColor: theme.palette.grey[100] }}
                    >
                      <TableRow>
                        <StyledTableCell>Student</StyledTableCell>
                        <StyledTableCell align="center">
                          Present
                        </StyledTableCell>
                        <StyledTableCell align="center">Absent</StyledTableCell>
                        <StyledTableCell align="center">Rate</StyledTableCell>
                        <StyledTableCell align="center">Notify</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyData.students.map((s) => (
                        <StyledTableRow key={s.studentId}>
                          <StyledTableCell>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <StyledAvatar>
                                {s.fullName.charAt(0)}
                              </StyledAvatar>
                              <Typography variant="subtitle1" noWrap>
                                {s.fullName}
                              </Typography>
                            </Stack>
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {s.attendanceDays}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {s.absentDays}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {s.attendanceRate}%
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="Notify Parent">
                              <IconButton
                                onClick={() => handleNotifyMonthly(s)}
                                disabled={
                                  notifyStatus.loading || s.absentDays === 0
                                }
                              >
                                <PhoneIcon />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ p: 2, textAlign: 'right' }}>
                  <Button
                    variant="outlined"
                    onClick={handleNotifyAllMonthly}
                    disabled={
                      !monthlyData.students.some((s) => s.absentDays > 0) ||
                      notifyStatus.loading
                    }
                  >
                    Notify All Absent
                  </Button>
                </Box>
              </Paper>
            </>
          )}
        </Box>
      )}
    </Container>
  );
}