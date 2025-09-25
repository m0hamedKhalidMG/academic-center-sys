import React from 'react';
import useStore from '../../context/store';

export default function NotificationPanel() {
  const { notifications, clearNotifications } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <p>{notif.msg}</p>
        </div>
      ))}
      <button onClick={clearNotifications}>Clear All</button>
    </div>
  );
}
