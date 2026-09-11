---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/react": major
"@xihan-ui/web-components": major
---

级联选择增加 name/form 原生表单出口，三端自动将每条选中路径编码为独立同名 JSON 字符串数组字段，支持禁用排除与原生重置。

破坏性变更：value/defaultValue、setValue 和 select 统一拒绝非数组、混合类型、空路径或非字符串段，不再隐式展开字符串或容忍非法路径；保留正式单路径数组简写，零选中使用 []，不使用 [[]]。路径无需预先存在于异步 collection 中。
