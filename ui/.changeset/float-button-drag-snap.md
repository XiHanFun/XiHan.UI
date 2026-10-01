---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

FloatButton 支持拖动与贴边：`draggable`（Web Components 为 `button-draggable`，避开 HTML 全局属性 `draggable`）打开后可按住触发器拖到别处，移动过激活距离才跟手，起拖时展开的动作组先收起、拖完补派的点击不开合；松手按 `snap` 贴边（`inline` 缺省贴左右两边里近的那条、`block` 贴上下、`nearest` 贴四边里最近的、`none` 停在放手处），甩一下贴到甩去的那一边，弹簧带着松手速度落定。新增 `position` / `defaultPosition` / `onPositionChange`（Vue `v-model:position`、Web Components `position-change` 事件）：贴边位置写 `{ edge, ratio }`，按比例记、换个视口尺寸照样贴在同一侧，停在一点写像素坐标 `{ x, y }`；不给时仍停在 `placement` 那一角。展开组恒朝页面中间长。
