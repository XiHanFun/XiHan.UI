---
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

组类控件直接放进表单字段（不经 `XhFieldControl`）也接上字段的标题与说明：单选组、复选框组、色板选择、切换按钮组、评分、滑块、分格输入把字段的标题并进焦点宿主的名字链（组根、星组或拇指），说明与错误文案进描述链，读屏进组时一起念出；校验、必填与只读仍按字段状态由组件自己投影（`role=group` 不接受 `aria-invalid` / `aria-required`）。新增 `useFieldGroupWiring` 供组类封装只取字段的描述链。
