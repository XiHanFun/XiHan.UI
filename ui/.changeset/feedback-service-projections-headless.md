---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Toast 与 Notification 的默认服务投影现在由 Headless 统一计算：合并计数标题、Toast 默认语气、
有效停留时长、默认关闭出口及服务级退场/页面暂停值不再由三端适配器分别判断。DialogService 的
徽记到语气映射也迁入同一核心层；适配器只保留框架节点、Light DOM、宿主挂载和事件桥接。
