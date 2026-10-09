---
'@xihan-ui/styles': major
---

SignaturePad 画布与字段外壳同一副面：静息铺字段淡底 `--xh-bg-field`（原为透明）；悬停描边升 `--xh-border-strong`（新增覆盖槽 `--xh-signature-pad-border-hover`）；落笔换承载面 `--xh-bg-surface` + `--xh-border-control-focus`（`--xh-signature-pad-border-drawing` 缺省由 `--xh-border-control-hover` 改为聚焦描边，新增 `--xh-signature-pad-bg-drawing`）；校验失败铺 4% 失效色淡底（新增 `--xh-signature-pad-bg-invalid`）。强制色档落笔与失效的描边换 Highlight。
