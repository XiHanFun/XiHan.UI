---
'@xihan-ui/designer-shell': minor
---

新增变换覆盖层 `<xh-designer-transform>`：叠在画布上方画选中框、控制柄、旋转柄、对齐线、框选框、悬停框与度量标签，并跑移动、缩放、旋转与框选的手势。设计器命中后调 `startMove` / `startMarquee`，控制柄由覆盖层自己接；每个选中项单独给能缩放的方向、能否旋转、是否等比与最小尺寸。多选时整体包围框上出八个控制柄，拖动按包围框等比缩放全部选中项。吸附选项在手势开始时经 `getSnap` 取一次，阈值按屏幕像素换算；Shift 等比、锁定方向或按角度吸附，Alt 以中心缩放或复制，Esc 取消，拖到边缘派发 `pan-request`。手势经 `transform` 与 `marquee` 两个事件交给设计器。
