// src/services/notificationApi.js
import axios from 'axios';

const NotificationAPI = axios.create({
  baseURL: process.env.REACT_APP_NOTIF_API_URL,
});

// (optionally) add logging or interceptors here
export default NotificationAPI;
