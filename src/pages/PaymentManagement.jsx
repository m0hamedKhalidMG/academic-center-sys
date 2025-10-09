// src/pages/PaymentManagement.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  AttachMoney,
  CreditCard,
  Payment as PaymentIcon,
  Refresh,
  Phone,
  WhatsApp,
  CalendarMonth,
} from '@mui/icons-material';
import {
  recordPayment,
  getLatePayments,
  sendPaymentReminder,
  getPaymentsSummary,
} from '../services/endpoints';

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ----- Record Payment form state -----
  const [paymentForm, setPaymentForm] = useState({
    cardCode: '',
    month: currentMonth,
    year: currentYear,
    amount: '',
    method: 'cash',
  });
  const [recordStatus, setRecordStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // ----- Late Payments list state -----
  const [filter, setFilter] = useState({
    month: currentMonth === 1 ? 12 : currentMonth - 1,
    year: currentMonth === 1 ? currentYear - 1 : currentYear,
    groupCode: '',
  });
  const [latePayments, setLatePayments] = useState({
    loading: false,
    error: '',
    data: { students: [], isLatePeriod: false },
  });

  // ----- Reminder dialog state -----
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderStatus, setReminderStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // ----- Summary (from /payments/summary which returns an array) -----
  const [summaryFilter, setSummaryFilter] = useState({
    month: currentMonth,
    year: currentYear,
  });
  const [summary, setSummary] = useState({
    loading: false,
    error: '',
    data: [], // array like [{year, month, totalAmount, paymentCount, cashCount, ...}]
  });

  // Load late payments when its filter changes
  useEffect(() => {
    fetchLatePayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Load summary when switching to the Summary tab (index 2)
  useEffect(() => {
    if (activeTab === 2 && summary.data.length === 0 && !summary.loading) {
      fetchPaymentsSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // -------- Handlers (forms) --------
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((p) => ({ ...p, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((f) => ({ ...f, [name]: value }));
  };

  const handleSummaryFilterChange = (e) => {
    const { name, value } = e.target;
    setSummaryFilter((f) => ({ ...f, [name]: Number(value) }));
  };

  // -------- API calls --------
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setRecordStatus({ loading: true, error: '', success: '' });
    try {
      await recordPayment({
        ...paymentForm,
        month: Number(paymentForm.month),
        year: Number(paymentForm.year),
        amount: Number(paymentForm.amount),
      });
      setRecordStatus({
        loading: false,
        error: '',
        success: 'Payment recorded successfully',
      });
      setPaymentForm((p) => ({ ...p, cardCode: '', amount: '' }));
      fetchLatePayments();
    } catch (err) {
      setRecordStatus({
        loading: false,
        error: err?.response?.data?.message || 'Failed to record payment',
        success: '',
      });
    }
  };

  const fetchLatePayments = async () => {
    setLatePayments((lp) => ({ ...lp, loading: true, error: '' }));
    try {
      const res = await getLatePayments(filter);
      setLatePayments({
        loading: false,
        error: '',
        data: res?.data?.data || {
          students: [],
          isLatePeriod: false,
        },
      });
    } catch (err) {
      setLatePayments({
        loading: false,
        error: err?.response?.data?.message || 'Failed to load late payments',
        data: { students: [], isLatePeriod: false },
      });
    }
  };

  const fetchPaymentsSummary = async () => {
    setSummary((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await getPaymentsSummary(); // no params
      const array = res?.data?.data || [];
      setSummary({
        loading: false,
        error: '',
        data: Array.isArray(array) ? array : [],
      });
    } catch (err) {
      setSummary({
        loading: false,
        error:
          err?.response?.data?.message || 'Failed to load payments summary',
        data: [],
      });
    }
  };

  const handleSendReminder = async () => {
    setReminderStatus({ loading: true, error: '', success: '' });
    try {
      await sendPaymentReminder({
        reminders: [
          {
            studentName: selectedStudent.name,
            month: filter.month,
            year: filter.year,
            parentNumber: selectedStudent.parentContact,
          },
        ],
      });
      setReminderStatus({
        loading: false,
        error: '',
        success: 'Reminder sent successfully',
      });
      setTimeout(() => setReminderDialog(false), 1500);
    } catch (err) {
      setReminderStatus({
        loading: false,
        error: err?.response?.data?.message || 'Failed to send reminder',
        success: '',
      });
    }
  };

  // -------- Derived summary data (client-side filter) --------
  const yearsInData = useMemo(() => {
    const ys = Array.from(new Set(summary.data.map((d) => d.year)));
    return ys.sort((a, b) => b - a);
  }, [summary.data]);

  const monthsInData = useMemo(() => {
    const filtered = summary.data.filter((d) => d.year === summaryFilter.year);
    const ms = Array.from(new Set(filtered.map((d) => d.month)));
    // If API empty for the chosen year, fall back to [1..12] for UI
    return ms.length
      ? ms.sort((a, b) => a - b)
      : Array.from({ length: 12 }, (_, i) => i + 1);
  }, [summary.data, summaryFilter.year]);

  const currentSummary = useMemo(() => {
    return (
      summary.data.find(
        (d) => d.year === summaryFilter.year && d.month === summaryFilter.month
      ) || null
    );
  }, [summary.data, summaryFilter.year, summaryFilter.month]);

  const summaryLoading = summary.loading;
  const summaryError = summary.error;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Payment Management
      </Typography>

      <Paper elevation={0} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
        >
          <Tab label="Record Payment" icon={<AttachMoney />} />
          <Tab label="Late Payments" icon={<PaymentIcon />} />
          <Tab label="Summary" icon={<CalendarMonth />} />
        </Tabs>
      </Paper>

      {/* -------- Tab 0: Record Payment -------- */}
      {activeTab === 0 && (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Record a New Payment
          </Typography>

          {recordStatus.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {recordStatus.error}
            </Alert>
          )}
          {recordStatus.success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {recordStatus.success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRecordPayment}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student Card Code"
                  name="cardCode"
                  value={paymentForm.cardCode}
                  onChange={handleFormChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Month"
                  name="month"
                  value={paymentForm.month}
                  onChange={handleFormChange}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', {
                        month: 'long',
                      })}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  type="number"
                  value={paymentForm.year}
                  onChange={handleFormChange}
                  required
                  inputProps={{ min: 2000, max: 2100 }}
                />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  fullWidth
                  label="Amount (LE)"
                  name="amount"
                  type="number"
                  value={paymentForm.amount}
                  onChange={handleFormChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Payment Method"
                  name="method"
                  value={paymentForm.method}
                  onChange={handleFormChange}
                  required
                >
                  {['cash'].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={recordStatus.loading}
                  startIcon={
                    recordStatus.loading ? <CircularProgress size={20} /> : null
                  }
                >
                  {recordStatus.loading ? 'Processing...' : 'Record Payment'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* -------- Tab 1: Late Payments -------- */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }} elevation={3}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Late Payments</Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                select
                size="small"
                label="Month"
                name="month"
                value={filter.month}
                onChange={handleFilterChange}
                sx={{ minWidth: 120 }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', {
                      month: 'short',
                    })}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                label="Year"
                name="year"
                type="number"
                value={filter.year}
                onChange={handleFilterChange}
                sx={{ minWidth: 100 }}
                inputProps={{ min: 2000, max: 2100 }}
              />

              <TextField
                size="small"
                label="Group Code"
                name="groupCode"
                value={filter.groupCode}
                onChange={handleFilterChange}
                sx={{ minWidth: 120 }}
                placeholder="All Groups"
              />

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchLatePayments}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {latePayments.loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={60} />
            </Box>
          ) : latePayments.error ? (
            <Alert severity="error">{latePayments.error}</Alert>
          ) : latePayments.data.students.length === 0 ? (
            <Alert severity="info">
              {latePayments.data.isLatePeriod
                ? 'No late payments found for the selected criteria.'
                : 'Late-payment reminder period has not started yet (after the 10th of the month).'}
            </Alert>
          ) : (
            <TableContainer>
              <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Group</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latePayments.data.students.map((s) => (
                    <TableRow key={s._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={s.photo} />
                          <Typography>{s.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={s.groupCode} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Call Parent">
                          <IconButton
                            href={`tel:${s.parentContact}`}
                            size="small"
                          >
                            <Phone fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="WhatsApp Parent">
                          <IconButton
                            href={
                              s.parentContact
                                ? `https://wa.me/${s.parentContact.replace(
                                    '+',
                                    ''
                                  )}`
                                : undefined
                            }
                            target="_blank"
                            size="small"
                            disabled={!s.parentContact}
                          >
                            <WhatsApp fontSize="small" color="success" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={s.joinDate || 'N/A'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CalendarMonth />}
                          onClick={() => {
                            setSelectedStudent(s);
                            setReminderDialog(true);
                          }}
                        >
                          Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Dialog
            open={reminderDialog}
            onClose={() => setReminderDialog(false)}
          >
            <DialogTitle>Confirm Reminder</DialogTitle>
            <DialogContent>
              {selectedStudent && (
                <Typography>
                  Send payment reminder for {filter.month}/{filter.year} to{' '}
                  <strong>{selectedStudent.name}</strong>?
                </Typography>
              )}
              {reminderStatus.error && (
                <Alert severity="error">{reminderStatus.error}</Alert>
              )}
              {reminderStatus.success && (
                <Alert severity="success">{reminderStatus.success}</Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReminderDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSendReminder}
                disabled={reminderStatus.loading || !!reminderStatus.success}
                startIcon={
                  reminderStatus.loading ? <CircularProgress size={20} /> : null
                }
              >
                {reminderStatus.loading ? 'Sending...' : 'Send Reminder'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}

      {/* -------- Tab 2: Summary (Total Amount, Cash Count, Year, Month only) -------- */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }} elevation={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            mb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6">Payments Summary</Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                select
                size="small"
                label="Year"
                name="year"
                value={summaryFilter.year}
                onChange={handleSummaryFilterChange}
                sx={{ minWidth: 110 }}
              >
                {(yearsInData.length ? yearsInData : [currentYear]).map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Month"
                name="month"
                value={summaryFilter.month}
                onChange={handleSummaryFilterChange}
                sx={{ minWidth: 140 }}
              >
                {monthsInData.map((m) => (
                  <MenuItem key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleString('default', {
                      month: 'long',
                    })}{' '}
                    ({m})
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchPaymentsSummary}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {summaryLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={60} />
            </Box>
          ) : summaryError ? (
            <Alert severity="error">{summaryError}</Alert>
          ) : !currentSummary ? (
            <Alert severity="info">No summary data available.</Alert>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="overline">Total Amount</Typography>
                    <Typography variant="h5">
                      {currentSummary.totalAmount ?? 0}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="overline">Cash Count</Typography>
                    <Typography variant="h5">
                      {currentSummary.cashCount ?? 0}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="overline">Year</Typography>
                    <Typography variant="h6">{currentSummary.year}</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="overline">Month</Typography>
                    <Typography variant="h6">{currentSummary.month}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}
