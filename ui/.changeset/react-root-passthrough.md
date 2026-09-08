---
"@xihan-ui/react": minor
---

**73 个组件的 Root 现在接住透传属性，逐实例令牌覆盖在 React 上终于写得出来。**

Vue 侧的根部件吃 fallthrough attrs：作者写 `<XhAlertRoot style="--xh-alert-border: transparent">`，这个 `style` 自己就落到 root 元素上。而 React 侧 107 个 Root 里有 79 个的 props 是封闭列表，同样的写法 TypeScript 直接报 `Property 'style' does not exist`——三级覆盖通道里最里面那一级（写在元素上的内联令牌）React 用户根本用不了。文档站 966 份 Vue 示例里有 90 份在 Root 上写了 `style` / `class`，多数正是设 `--xh-*` 令牌，它们的 React 版此前写不出来。

判据是「渲染了自己 DOM 元素的 Root 就接住其余属性」。改完 101 个 Root 收 rest；剩下 6 个（`command` / `dialog` / `image-viewer` / `menu` / `popover` / `tooltip`）不改，因为它们的解剖里没有 root 部件、Root 只提供上下文与子树，作者的属性没有元素可落。

schema props 一律显式解构，绝不漏进 DOM。与 DOM 同名异型的（`dir` 改的是方向键语义、`defaultValue` 的类型更宽、`onSelect` 与合成事件同名）逐个从继承里 `Omit` 掉并写明理由。

**一处口径顺带对齐了 Vue**：这些 Root 现在交给机器的是一份「键恒在、没给即 `undefined`」的对象，而不是只含作者写过的键的 rest 包。`fillXhConfigDefaults` 的判据正是「键在不在」，所以 `XhConfigProvider` 的全局 `size` / `locale` 从此在这些组件上真的垫得进去了。

计算样式基线与 Vue 侧仍逐字节全等，逐帧对拍不动。
