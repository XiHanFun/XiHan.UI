---
'@xihan-ui/headless': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

**修复** Alert 在没有 Web Animations 的宿主（jsdom、旧引擎）里收起时状态机崩溃：量退场高度前撤掉在播展开段的那一步，先看宿主有没有 `getAnimations`。

**修复** GraphChart 键盘缩放补间时把每一帧都写进可绑定的 `view`：受控时一次按键派发一串 `view-change`，`data-zoomed` 也要等补间播完才对。现在逻辑视图一按键就落到目标、只派发一次，补间只走画面；受控时画面停在此刻，等宿主写回目标才补过去。

**修复** JsonViewer 的 Vue 与 React 适配器没建 scope：根与树的 id 由计数器派生，每挂一次换一个号，服务端与客户端对不上。现在和其它组件一样由适配器的 id 生成器派生。
