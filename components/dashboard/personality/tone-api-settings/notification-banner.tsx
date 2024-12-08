import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NotificationBanner() {
  const notifications = [
    { type: 'success', message: 'Gmail Connected Successfully' },
    { type: 'error', message: 'Outlook Sync Failed. Please try again.' }
  ];

  notifications.forEach((notification) =>
    toast[notification.type](notification.message)
  );

  return <ToastContainer />;
}
