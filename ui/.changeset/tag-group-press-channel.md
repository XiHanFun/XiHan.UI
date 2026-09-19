---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**TagGroup 标签本体与移除钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
机器 context 新增 `pressedPart` / `pressedValue`（正被按住的那一枚的哪个部件），事件 `PRESS.START { part, value, disabled? }`
/ `PRESS.END { part, value }`；守卫 `canPress` 在整组禁用、只读，条目禁用、不参与选中的本体、摘不掉的移除钮上不进；按住途中
整组转入禁用 / 只读、正按着的那一枚被摘掉时由机器自行松开。按压经 `connectStaticTag` 的 `press` 入参交给静态标签，
`data-pressed` 投影在 tag 的 root 与 close-trigger 上，皮肤按压面已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
