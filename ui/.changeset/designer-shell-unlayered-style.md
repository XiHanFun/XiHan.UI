---
'@xihan-ui/designer-shell': minor
---

新增 `@xihan-ui/designer-shell/style.unlayered.css`：与 `style.css` 内容相同、没有 `@layer xihan.components` 层壳，配无层的组件皮肤 `@xihan-ui/styles/index.unlayered.css` 用。无层规则不论特指度都压过有层规则，此前配无层皮肤引 `style.css` 时，零件覆盖库内组件部件的样式会静默失效：JSON 编辑框只剩两行高、等宽字体退回正文字体，导入字段对话框的 JSON 输入框不是等宽字体，外框分隔条变成圆角。配有层皮肤的照旧引 `style.css`。
