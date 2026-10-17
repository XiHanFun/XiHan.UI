---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

评分（Rating）新增 `invalid`：星星带（role=radiogroup）写 `aria-invalid`，root、星星带、每颗星与分值文本写 `data-invalid`。放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `invalid` 属性。

皮肤：校验失败时没点亮的那部分星形换成无效色（新增覆盖槽 `--xh-rating-item-fg-invalid`，缺省 `--xh-border-invalid`），点亮的部分仍取语气色；强制色下照旧是 GrayText。
