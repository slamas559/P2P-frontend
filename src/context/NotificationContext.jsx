import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback(({ type = 'info', message, duration = 3000 }) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <NotificationToast {...notification} />}
    </NotificationContext.Provider>
  );
};

// Dynamically import the toast component (see next step)
import NotificationToast from '../components/ui/NotificationToast';
