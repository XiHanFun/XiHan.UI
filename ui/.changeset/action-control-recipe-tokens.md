---
'@xihan-ui/styles': patch
---

Action Control 家族配方三处修正，影响全部按钮形触发器：

- 换面过渡补上字色：底色、描边与字色同一节奏淡变（micro），缩放单走释放时长。此前字色硬切、底色淡变，Pagination 换页、Toggle 实心切换、Clipboard 成功态等会先闪一拍字色。
- outline 形态的禁用外边改取 `--xh-border-default`，与 Checkbox、Switch、字段的禁用边一致；此前取只作内部分隔的 `--xh-border-subtle`。
- xs 视觉盒（含 field-inset sm）改走 `--xh-control-action-size`，field-inset 字形 xs / sm 改走 `--xh-control-indicator-sm` / `--xh-control-indicator-md`，随密度换档：compact 下 xs 视觉盒为 20px、field-inset 字形为 10 / 14px；comfortable 下 field-inset sm 字形由 14px 变为 16px。
