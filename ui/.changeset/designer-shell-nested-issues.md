---
"@xihan-ui/designer-shell": minor
---

**新增** 属性面板的错误按路径段归到行：落在属性里层的错误（如选项表第 3 行的值）归到它所属的那一行，有嵌套描述时归路径最长的那一行；宿主编辑器与内建编辑器的上下文带上这一行的 `issues`。只有里层问题时，行下显示第一条，编辑器实例写了 `nestedIssues: true` 的不显示，由编辑器标到子项上。四边按 `["top"]` 这类路径标出对应那一边。`createPropertyField` 的 `update` 新增 `issues`。
