---
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/code-highlight": major
---

**`@xihan-ui/code-highlight` 从适配器的硬依赖改成可选 peer，包也从 `engine` 组挪到 `features` 组。包名没变。**

它只服务代码视图一个组件，装了适配器的人有九成用不上它。改成可选 peer 之后，要不要为着色付出这份体积由使用者定，不再由库替他决定。包所在的组跟着这条判据走：`engine` 是「使用者做不了取舍的」，`features` 是「你不点头它就不来」。

## 使用者要做什么

**要着色**——单独装上它，其余不用动，代码视图照旧自动着色，`highlighter` prop 一个字都不用写：

```bash
pnpm add @xihan-ui/code-highlight
```

**不要着色**——什么都不用做。代码视图渲纯文本：行号、折叠、换行、高亮行照旧，只是不上色。**没装它不是错误**，控制台不会报错，也不会抛异常。

**接的是别的着色器**（Shiki 之类）——什么都不用做，本来走的就是 `highlighter` prop。

直接 `import { createHighlighter } from '@xihan-ui/code-highlight'` 的代码不受影响，导出的名字一个都没有变。

## 顺带

适配器对它的引用改成了动态引入：可选 peer 却在主入口静态 import，等于把「可选」写成谎话——使用者不装它，模块解析就地报错。现在它是在组件首次用到时才去取，取不到就保持不着色。因此**着色比首帧晚一拍到达**：先渲纯文本，实现落位后重渲一次并上色。
