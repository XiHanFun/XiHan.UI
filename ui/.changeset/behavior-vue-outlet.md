---
"@xihan-ui/vue": minor
"@xihan-ui/kernel": major
---

行为原语补一条 Vue 出口，并修掉滚动锁那段假文档。

**新增 `@xihan-ui/vue/behavior` 子入口**，收五个组合式：`useScrollLock`、`useHoverIntent`、`useScrollTracker`、`useStickToBottom`、`useTypeahead`。它们只做一件事——把原语句柄的释放挂到 Vue 作用域结束，语义与原语一字不差。与主入口分开是因为自建浮层才用得上这一层，不用的应用不必把它压进主入口的体积预算（子入口本身 gzip 3.39 kB）。

需要层栈仪式的那几个（消解层、焦点域、背景失活）**刻意不收**：它们要按顺序接四五个东西，接错的表现是「点子菜单父层跟着关」这类不报错的怪症，那种场景请直接用库里现成的浮层组件。

**`docs/guide/behavior.md` 的滚动锁一节此前写的是不存在的 API**：示例里的 `shards` 选项与句柄上的 `addShard()` 从未实现过，`ScrollLockOptions` 一直只有 `config`，句柄一直只有 `dispose()`。照实现重写，并补上实现里有、文档里没写的两件：锁哪个元素由 `config.scrollRoot?.()` 决定（宿主把滚动搬进内容容器时必须注入，否则锁到的是不滚的那个）；加锁期间让出来的滚动条宽度写在文档根的 `--xh-scroll-lock-gutter` 上，供 `fixed` 元素让位。

**破坏性**：`@xihan-ui/kernel` 删除 `DATA_SCROLL_SHARD`。它是那段假文档的来源——声明处之外全库零引用，配套的分片机制从未实现。留着等于承认公开面里有一个永远不生效的名字。没有使用者能真的依赖它（它不参与任何代码路径），但名字确实从公开面消失，故记为 major。
