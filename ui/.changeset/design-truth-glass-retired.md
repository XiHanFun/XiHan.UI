---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

**退役 glass 材质；M4 elevated 改为不透明的 sheet 实体面。**

删除 `material.glass` 配方及全部 `--xh-material-glass-*` 令牌（bg、backdrop、border、highlight、shadow、separator、fg、fg-muted、focus-surface），不提供别名，也不把非法值映射为 frosted。材质只保留 solid（M0）、soft（M1）、frosted（M2）、elevated（M4）四档。

`--xh-material-elevated-*` 改为完全不透明、无背景模糊、无顶部高光，只保留三层高层投影；Dialog 主阅读面与头部 lens 都使用它。BackTop、FloatButton、FloatingPanel 的默认面迁到 `--xh-material-frosted-*`；PromptInput 的默认外壳迁到 `--xh-material-soft-*`。

破坏性：消费 `--xh-material-glass-*` 的自定义样式必须显式改为 frosted 或实体材质；Dialog 内容不再采样背景。
