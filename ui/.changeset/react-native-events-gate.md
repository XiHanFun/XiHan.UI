---
"@xihan-ui/react": patch
---

**修 `select` 条目上两个不冒泡事件没接成原生监听器。** `connect` 在条目上派的是 DOM 的 `focus` 与 `pointerleave`，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发：`onFocus` 挂的是 `focusin`，`onPointerLeave` 是从 `pointerout` 合出来的。接线看着还在，直接送到节点上的那一种一个都到不了——条目得焦不改高亮、指针离开列表不收高亮，全程零报错。

`select` 是第一个铺的浮层组件，这条口径当时还没立起来；后面十六个派不冒泡事件的组件都接对了，只剩它一个。

**同时补上 `check-native-events`。** 此前这条口径只写在提示词与代码注释里，是逐个组件靠人判断的——`select` 这个洞就是这么留下的，而且已经在仓里躺了两批。现在逐组件对账：`headless` 的 `connect` 派了哪几个不冒泡的事件，React 侧就得逐个用 `useNativeEvents` 摘出来；摘了 `connect` 根本不派的名字同样判失败。`onFocusIn` / `onFocusOut` 不在其列——它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，而那两个合成事件挂的正是冒泡的 `focusin` / `focusout`，改装反而会改坏语义。

Vue 与 Web Components 不在这张门禁的核查面内：两者都把 `connect` 的处理器原样挂成 DOM 监听器，没有合成事件这一层。
