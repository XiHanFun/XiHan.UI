---
'@xihan-ui/styles': patch
---

浮层打开后不再常驻 `will-change`，静止画面不再发虚。

此前 26 份浮层皮肤（Menu、Select、Popover、Dialog、Drawer、Tooltip、ContextMenu、Menubar、日期与时间选择器等）在 `[data-state='open']` 上一直挂着 `will-change: opacity, translate` 一类合成属性。Chromium 对这样的层沿用第一次栅格化时的位移与缩放：第一次栅格若落在入场动画中途，小数位移就被保留下来，动画播完后文字与 1px 分隔线仍是重采样出来的，看上去发虚；落在哪一帧取决于时序，所以时好时坏。

现在打开态只留入场动画：动画播放期间浏览器照样把这一层提到合成层，播完按整数像素重画。附带的变化是浮层里的文字与页面其他文字一样走亚像素抗锯齿，不再被合成层压成灰阶。退场态与拖拽中的 `will-change` 不变。
