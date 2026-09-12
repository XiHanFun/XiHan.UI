---
'@xihan-ui/vue': patch
---

标记 Table 族的 `defineComponent` 声明为无副作用，使生产构建在只导入 `XhTableRoot` 时能删除未使用的兄弟部件定义；组件运行时与公开导出不变。
