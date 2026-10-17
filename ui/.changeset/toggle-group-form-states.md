---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

分段开关组（ToggleGroup）新增 `readOnly`、`invalid`、`required`，放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `read-only`、`invalid`、`required` 属性。

- 单选（role=radiogroup）写 `aria-readonly`、`aria-invalid`、`aria-required`，缺省显式写 false；多选是 role=group，不收这三条，只写 `data-readonly`、`data-invalid`、`data-required`。
- 只读：条目仍可聚焦、方向键照常走，点击与 Space / Enter 不改选中，也不进按压面；程序化写值不受影响。
- 表单影子从 `type="hidden"` 改为视觉隐藏的文本输入：hidden 不参与约束校验，原生 `required` 拦不住空值提交；没选时值为空串。
- 皮肤：只读的段悬停与按下停在静息面、光标为默认；校验失败时整组外沿画一圈无效色的线（新增覆盖槽 `--xh-toggle-group-border-invalid`，缺省 `--xh-border-invalid`），强制色下为 ButtonText。
