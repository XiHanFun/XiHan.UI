---
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Vue 的 `useScrollLock` 改在 mounted 后用 post watcher 读取当前 active 与 RuntimeConfig，确保初始启用时模板 ref 已经提交。释放会先清空包装层句柄再调用 Core dispose，因此清理抛错后下一次 false→true 仍能用最新配置建立新锁；单次 active 阶段继续固定创建时配置，不因普通对象换代重锁。

React 的 `useScrollLock` 改用同构 layout effect，在浏览器绘制前完成首帧加锁，并保持单次 active 阶段的 RuntimeConfig 固定；false→true 会读取最近一次已提交配置，StrictMode 的探测清理不会留下额外锁。

Web Components 的 `<xh-command>` 现在与 Dialog、Drawer、ImageViewer 一样，在每次实际获取滚动锁时沿元素祖先链读取最近的 `<xh-config>` 或全局 `scrollRoot`。未配置时显式返回 `null` 表示页面，不再依赖 Core 自动探测。
