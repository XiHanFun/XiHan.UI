---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Rating 星接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedValue`
（正被按住的星，按序号记），事件 `PRESS.START { value }` / `PRESS.END { value }`，守卫沿用 `canInteract`（禁用或只读不进），
按住途中转入禁用或只读时由机器自行松开；松开不清悬停预览。星是 role=radio 的 span，Space / Enter 在它上面什么都不做
（评分靠方向键走档），键盘那一路没有按压面。三端公开 props 与事件不变。
