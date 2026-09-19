---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**FileUpload 选择钮、逐条删除钮与清空钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，删除钮按文件标识；新增导出类型 `FileUploadPressedKey`），
事件 `PRESS.START` / `PRESS.END` 挂根级，禁用时不进；按住途中转入禁用，或按住的删除钮随文件一起离开列表（Enter 在 keydown
即删）时由机器自行松开；选择钮打开系统文件框后随窗口失焦撤下。投放区仍不投影（按下回执由拖入态给出）。皮肤里三颗钮的按压规则
由 `:active` 改为 `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增
`file-upload.kbd.press`。三端公开 props 与事件不变。
