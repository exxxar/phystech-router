import { reactive } from 'vue';

const notifications = reactive([]);
let notificationId = 0;

export function useNotification() {
    const addNotification = (type, message, duration = 5000) => {
        const id = ++notificationId;
        const notification = { id, type, message };
        notifications.push(notification);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    const removeNotification = (id) => {
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications.splice(index, 1);
        }
    };

    const success = (message) => addNotification('success', message);
    const error = (message) => addNotification('error', message);
    const warning = (message) => addNotification('warning', message);
    const info = (message) => addNotification('info', message);

    return {
        notifications,
        removeNotification,
        success,
        error,
        warning,
        info
    };
}