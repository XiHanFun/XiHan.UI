/**
 * 检查通知权限
 */
export async function checkPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * 显示通知
 * @param title 通知标题
 * @param options 通知选项
 */
export async function show(
  title: string,
  options: NotificationOptions & { onClick?: (notification: Notification) => void } = {},
): Promise<Notification | null> {
  const { onClick, ...notificationOptions } = options;

  if (!(await checkPermission())) {
    return null;
  }

  const notification = new Notification(title, notificationOptions);

  if (onClick) {
    notification.onclick = () => onClick(notification);
  }

  return notification;
}

/**
 * 显示简单通知
 * @param title 通知标题
 * @param message 通知内容
 */
export async function showSimple(title: string, message: string): Promise<Notification | null> {
  return show(title, {
    body: message,
    icon: "/favicon.ico",
  });
}

/**
 * 关闭所有通知
 */
export function closeAll() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      });
    });
  }
}
