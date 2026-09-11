// @xihan-ui/web-components/services —— 命令式反馈服务。
//
// 与 Vue 侧同名同形：四个 create*Service 工厂，句柄上的命令在任意模块作用域可调
// （路由守卫、请求拦截器、store），不要求调用点在文档树的某一处。
//
// 与 Vue 侧的两点不同都源自 WC 的身份：
//   一是没有 config 入参——全局配置沿 DOM 祖先链解析，服务的宿主容器就挂在文档里，
//     语言、尺寸、浮层落点由 setXhConfig 与外层 `<xh-config>` 直接说了算，因此也没有 setConfig；
//   二是模板由服务生成真实的自定义元素与角色节点，作者拿到的仍是一棵可查、可选中的 DOM。

export { createDialogService } from './services/dialog-service'
export { createLoadingBarService } from './services/loading-bar-service'
export { createNotificationService } from './services/notification-service'
export { createToastService } from './services/toast-service'
export type {
  AlertOptions,
  ConfirmOptions,
  DialogActionError,
  DialogBody,
  DialogService,
  DialogServiceOptions,
  LoadingBarService,
  LoadingBarServiceOptions,
  NotificationCreateOptions,
  NotificationMessageOptions,
  NotificationService,
  NotificationServiceOptions,
  ServiceHostOptions,
  ToastCreateOptions,
  ToastMessageOptions,
  ToastPromiseOptions,
  ToastService,
  ToastServiceOptions,
} from './services/types'
