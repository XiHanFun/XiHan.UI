---
'@xihan-ui/core': minor
'@xihan-ui/position': minor
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**变更** 浮层第一次打开时才加载浮层机制：消隐层、焦点域、滚动锁、背景失活、Portal 视觉桥、多选标签动效、定位引擎与浮层里的自绘滚动条不再进首屏，使用者的打包器把它们切成按需块。只用 `XhSelectRoot` 时首屏从 53.5 kB 降到 33.1 kB（gzip），`XhMenuRoot` 51.5 → 33.4 kB，`XhDialogRoot` 40.0 → 27.4 kB，React 的 `XhSelectRoot` 56.1 → 35.5 kB。

- 何时取：浮层挂载后，文档上第一次有交互（指针移进来、按下、按键、聚焦、触摸）就在后台取；挂载时就开着的立刻取。加载过一次之后整页同步，与静态引入一样。
- 没到时打开：展开态、ARIA、`data-state` 与事件当场生效，资源到了再接上。靠定位的浮层落位前本就藏着；对话框、抽屉、图片查看器、命令面板的内容等按需块到了才露出来。等的这段时间 Escape 与点外面不收起，等的时候已经关掉就不再接、不抢焦点。加载失败不缓存，下一次打开重新取。
- 第一次打开也要同步：启动时调一次适配器新导出的 `preloadOverlay()`（Vue / React / Web Components 都有）。

Core 新增 `loadOverlayKit`、`overlayKit`、`requireOverlayKit`、`whenOverlayKit`、`prefetchOverlayKit`、`onFirstInteraction` 与 `OverlayKit` 类型，以及 `connectPortalVisualBridge`（Portal 壳的逻辑来源当场登记，搬进壳的控件照旧找得到所在位置的配置与语言包，视觉桥等按需块到了再建）；`createPortalLease` 与 Vue / React 的 Portal 都改用它；`createDismissLayer`、`createFocusScope` 等原有导出不变，直接引入照旧同步。Position 新增 `createDeferredPositionEngine`（同一个 `PositionEnginePort`，引擎本体第一次 `attach` 时才加载，并等浮层按需块到了再量）与 `loadPositionEngine`，各适配器的浮层都改用它。Headless 的浮层外壳新增 `createOverlayKitGate`，`trackPresenceResources` 内置这道闸门。

体积预算同步收紧：`XhSelectRoot` 56 → 36 kB、`XhMenuRoot` 54 → 37 kB、`XhDialogRoot` 42 → 30 kB；新增四条按需块预算（core 浮层按需块、定位引擎本体、Vue / React 浮层自绘滚动条），`position` 主入口因多了延迟引擎 3.1 → 4 kB。
