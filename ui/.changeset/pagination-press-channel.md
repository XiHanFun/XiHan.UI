---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**Pagination 两端翻页钮、页码与省略位接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
同一副按压面。** 机器 context 新增 `pressed`（`PaginationPressedKey`：`prev` / `next` / `item:页号` /
`ellipsis:侧`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫 `canPress` 在到
边界的翻页钮上不进；`endPress` 只松开 key 对应的那一个；摊开的页码面板收起时一并松开（面板里被按住的页码不会再来
keyup）。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `pagination.kbd.press`。三端公开 props 与事件不变。
