---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

颜色选择器（ColorPicker）新增 `invalid`、`required`，放进字段（Field）或表单（Form）时自动继承，实例显式给的值优先；Web Components 为 `invalid`、`required` 属性。

- `invalid`：触发钮写 `aria-invalid`，各部件写 `data-invalid`，字段外壳按它描红。
- `required`：各部件写 `data-required`，标题据此画星号；触发钮是按钮，不收 `aria-required`。
- 表单影子从 `type="hidden"` 改为视觉隐藏的文本输入，原生 `required` 才拦得住空值提交；只读时带 `readonly`。
- 放进字段时，字段的标签并进触发钮的名字链、说明与错误文案并进它的描述链（Vue / React 的触发钮接上字段接线，Web Components 声明了接线目标）。
