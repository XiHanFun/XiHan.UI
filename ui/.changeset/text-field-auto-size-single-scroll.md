---
'@xihan-ui/headless': patch
'@xihan-ui/styles': patch
---

文本字段多行 `autoSize` 只剩一层滚动：顶到上限后由 textarea 自己滚，控件外壳只包住它，不再另设 12rem 上限、也不再自己滚。此前 `minRows` / `maxRows` 换算超过 12rem 时（如 15–22 行、24–24 行），外壳被钉在 12rem 并滚动，textarea 也在滚，两条滚动条叠在一起，行数界限也被截掉。现在给了 `maxRows` 时上限就是 `maxRows`；没给时上限取 textarea 的 `max-block-size`，两种情况都不低于 `minRows`。默认皮肤的上限槽随之落到 input 部件上并按它改名为 `--xh-text-field-input-max-h`，旧槽 `--xh-text-field-control-max-h` 留在兜底位，已有的覆盖照常生效。自动高度据此接管 textarea 的 `max-block-size` 内联声明，关闭时与 `block-size`、`overflow-y` 一并归还；没给 `maxRows` 时 `max-block-size` 的计算值须为 `none` 或 px，否则明确失败。
