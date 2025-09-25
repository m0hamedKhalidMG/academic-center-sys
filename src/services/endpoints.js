// services/endpoints.js
import API from './api';
import NotificationAPI from './notificationApi';

// Admin Auth
export const adminLogin = (data) => API.post('/auth/admin-login', data);
export const registerAdmin = (data) => API.post('/auth/setup-admin', data);

// Assistant Auth
export const assistantCardLogin = (data) => API.post('/auth/card-login', data);

// Assistant Management
export const createAssistant = (data) => API.post('/admin/assistants', data);
export const getAllAssistants = () => API.get('/admin/assistants');
export const resetAssistantPassword = (id, data) =>
  API.put(`/admin/assistants/${id}/reset-password`, data);
export const getAssistantProfile = () => API.get('/assistants/profile');
export const updateAssistantProfile = (data) =>
  API.put('/assistants/profile', data);

// Students Management
export const createStudent = (data) => API.post('/students', data);
export const getAllStudents = () => API.get('/students');

// Attendance Management
export const scanAttendance = (data) => API.post('/attendance/scan', data);
export const getTodayAttendance = () => API.get('/attendance/today');

export const getLatePayments = (params) =>
  API.get('/payments/late', { params });

// Get late payments for a specific group
// GET /payments/late?groupCode={groupCode}
export const getLatePaymentsByGroup = (groupCode) =>
  API.get('/payments/late', {
    params: { groupCode },
  });

// My suspensions
export const getMySuspensions = () => API.get('/assistants/my-suspensions');

// Suspend a student (temporary or permanent)
export const suspendStudent = (body) => API.post('/assistants/suspend', body);

// Lift a student's suspension by suspension‐record ID
// Lift a student's suspension (by student ID)
export const liftStudentSuspension = (studentId) => {
  if (!studentId) {
    return Promise.reject(new Error('No student ID provided'));
  }
  // must return the promise!
  return API.put(`/assistants/lift-suspension/${studentId}`);
};
// Record a payment
export const recordPayment = (data) => API.post('/payments', data);

// Get attendance records filtered by date and/or group
export const getAttendanceRecords = (params) =>
  API.get('/attendance/today', { params });

// Lift an assistant’s suspension
export const liftAssistantSuspension = (assistantId) =>
  API.put(`/assistants/lift-suspension/${assistantId}`);

// Attendance by date & group
export const getAttendanceByDateGroup = (params) =>
  API.get('/attendance/by-date-group', { params });

// Reminders via WhatsApp-bot (on its own server)
export const sendAttendanceNotification = (data) =>
  NotificationAPI.post('/notifications/attendance', data);

export const sendPaymentReminder = (data) =>
  NotificationAPI.post('/notifications/payment', data);

export const getGroupAttendanceReport = ({ month, year, groupCode }) =>
  API.get('/attendance/group-report', {
    params: { month, year, groupCode },
  });

export const getDailyGroupAttendance = ({ date, groupCode }) =>
  API.get('/attendance/daily-group', {
    params: { date, groupCode },
  });

// Create a new group
export const createGroup = (data) => API.post('/groups', data);

// Get all groups
export const getAllGroups = () => API.get('/groups');

// Update an existing group by ID
export const updateGroup = (id, data) => API.put(`/groups/${id}`, data);

// Delete a group by ID
export const deleteGroup = (id) => API.delete(`/groups/${id}`);
