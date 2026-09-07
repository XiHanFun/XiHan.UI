---
"@xihan-ui/react": minor
---

**再铺 `button` / `toast` / `notification` / `loading-bar`，并交出第一个命令式服务。已铺 12/126。**

`createDialogService` 是服务层的样板：从组件树之外调起，自带宿主树，同一时刻只挂一个对话框、后来的排队，退场窗口走完才放下一个。八条用例钉住行为，其中一条专盯 `dispose`——队里没结的一律按取消结掉，调用方的 `await` 不会永远挂着。

React 版与 Vue 的结构差异写在代码里：Vue 用 `reactive` + `createApp`，React 这边宿主树在组件树之外，状态自己存一份、经 `useSyncExternalStore` 推重渲；`prompt` 的可写代理换成「值 + set 回调」。

**`@xihan-ui/react/behavior` 此前是错的。** 这个子路径在 Vue 侧是「行为原语的框架包装」——滚动锁、悬停意图、滚动观察、贴底、连敲检索五件，文档里明写「自建浮层才用得上，不用的应用不必把它压进主入口的体积」。React 侧第一批却把机器运行时放了进去，两家同名子路径指着完全不同的东西：照 Vue 文档写 `import { useScrollLock } from '@xihan-ui/react/behavior'` 什么也拿不到。现在按 Vue 那五件逐个包装，机器运行时留在主入口。

这一处是被体积预算撞出来的：`react/behavior` 7.51 kB 顶破了 3.8 kB 的额度，而那个额度是照 Vue 同名条目抄的——数字对不上正说明装的不是同一批东西。改完 3.52 kB。

**顺带记一处判据够不着的地方**：公开面基线把「子路径清单」与「导出名清单」分开记，名字不与子路径挂钩。把一个导出从一个子路径挪到另一个，基线看不出任何变化，而消费方的 import 会断。三家适配器都在这条口径下。

**connect 的处理器按 DOM 语义写，React 的合成事件在两处不满足它**，这一批又撞到两次：`button` 在载入态调 `stopImmediatePropagation()` 拦同节点上作者的处理器（React 的 SyntheticEvent 没有这个方法，直接抛）；`toast` 与 `notification` 的卡片派 `pointerenter` / `pointerleave`（不冒泡，React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的，直接派到节点上的那一种到不了）。都用 `useNativeEvents` 把这几个处理器改装成原生监听器；它新加了一个 `only` 参数——`toast` 只摘那两个指针事件，因为同一份 props 里的 `onFocusIn` / `onFocusOut` 归到 React 的 `onFocus` / `onBlur` 恰好挂的是冒泡的 `focusin` / `focusout`，整份改装反而会让焦点落在内部按钮上时按不住计时。

两张门禁的 React 读取器此前只认「同名目录」，而 `button` 与 Vue 侧一样是单文件平铺：`check-part-wiring` 直接判红，`check-read-ports` 则是**静默跳过**。两张都改成两种形态都认——`check-read-ports` 的可比对份数随之从 1 涨到 6，说明此前一直有组件在它眼皮底下没被核过。
