// src/services/notificationApi.js
import axios from 'axios';

const NotificationAPI = axios.create({
  baseURL: "/api",
});

// (optionally) add logging or interceptors here
export default NotificationAPI;
