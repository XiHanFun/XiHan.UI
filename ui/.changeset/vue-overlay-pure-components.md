---
'@xihan-ui/vue': patch
---

标记 Dialog、Menu、Select 与 Toast 族的 `defineComponent` 声明为无副作用，使生产构建按需导入 Root 时删除未使用的兄弟部件定义；全部公开导出与运行时行为保持不变。
