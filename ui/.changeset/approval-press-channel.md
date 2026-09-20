---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Approval 的批准钮、拒绝钮与授权项接入按压通道：Space / Enter（授权项只认 Space）与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressed`（`ApprovalPressedKey`：`approve` / `deny` / `item:<value>`，按键记按住的那一个），事件 `PRESS.START` / `PRESS.END` 只在待决态接；判定在途、必选项未勾满的批准钮与禁用的授权项不进，判定落定或转入在途时由机器松开。
键盘表新增 `approval.kbd.press` 与 `approval.kbd.item-press`；`ApprovalPressedKey` 进公开面。三端公开 props 与事件不变。
