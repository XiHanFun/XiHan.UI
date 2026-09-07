---
"@xihan-ui/react": minor
---

**React 侧铺上「钉在视口上」与「装在组件之外」这一族七个组件：`affix`、`back-top`、`float-button`、`floating-panel`、`download-trigger`、`clipboard`、`hotkeys`。**

七个的共同点是接线越出组件自己那棵子树：`affix` 与 `back-top` 盯的是滚动容器的滚动量，`float-button` 与 `floating-panel` 钉在视口坐标上（后者还搬去浮层落点），`hotkeys` 把 keydown 装在整篇文档上，`download-trigger` 与 `clipboard` 则把内容交给浏览器的下载与剪贴板。分歧在谁管几何：`affix` 量占位盒的矩形并冻结它的高度，`back-top` 只读滚动量，`floating-panel` 自己算整块矩形写进内联样式。`float-button` 是唯一没有自己机器的那个——开合跑的是 `collapsible`，落位、外形与展开方式不入机器，直接进 `connect`。

`react-coverage.json` 记到 114/126。

**`float-button` 的定位壳与 `clipboard` 的只读框各把不冒泡的事件改装成原生监听器。** 前者是悬停展开的 `pointerenter` / `pointerleave`（React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的），后者是聚焦即全选的 `focus`（React 的 `onFocus` 挂的是冒泡的 `focusin`）。两处都只摘点名的那几个，`onKeydown` 与 `onClick` 照旧走合成事件。另外五个组件的 `connect` 一个不冒泡的事件都不派。

- `float-button` 那一路由共享套件自己咬住：它的悬停用例本就直接往壳上派 `pointerenter` / `pointerleave`。反向验过：把 `bind.attrs` / `bind.ref` 换回裸的 `getRootProps()`，「悬停展开」当场判红。
- `clipboard` 那一路共享套件咬不到（fixture 里没有聚焦只读框这一步），新加 `tests/clipboard-native-events.spec.tsx` 按 DOM 的送达路径直接派 `focus`，观察口取选区。反向验过：把 `useNativeEvents` 的名单清空即判红。先把选区收成一个光标再断言——jsdom 里 `value` 一落地选区本来就是「整段选中」，不这么摆这条用例恒绿。

**`hotkeys` 的监听装在组件之外，卸载必须自己摘。** 组合式每次提交后对齐一次落点（`document` / `parent` / 作者给的节点），落点没换就不动；卸载在一个只跑一次的 `useEffect` 清理里摘干净。共享套件只在挂载态里按键，卸载之后那一段没有判据，新加 `tests/hotkeys-listener.spec.tsx` 认领：观察口取 `defaultPrevented` 与回调次数。反向验过：把卸载清理换成空函数，第二条判红——组件早已不在页面上，Ctrl+S 仍被它接走。

**这七个组件都不认表单重置**（机器里没有 `FORM.RESET` 声明），**Vue 侧也没有任何一个部件收 `asChild`**，React 这边照样不收。`clipboard` 的只读框带 `value`，按既有口径补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），没有改用 `readOnly` —— 那一项由 `connect` 自己写，也在归一化快照的基准属性表里。

**`floating-panel` 的形态钮走部件属性转驼峰这一路。** fixture 写的是 DOM 口径的 `window-state`，`tests/fixture-element.ts` 把它转成 `windowState` 再交给组件，组件那一侧的 prop 名就得是驼峰的那个。反向验过：改成从 `rest['window-state']` 上读，初始快照与形态切换两条当场判红。改尺把手的 `edge` 不带连字符，两侧同名。

**四条判据链全绿：** 共享一致性套件这七个组件共 47 条（`floating-panel` 10 / `float-button` 8 / `back-top` 7 / `affix` 6 / `hotkeys` 6 / `clipboard` 5 / `download-trigger` 5，另各有一条键盘表覆盖），**键盘零豁免**；服务端直出**零豁免**，七个都直出得了（`floating-panel` 的 `positioner` 在服务端就地渲染，不搬运）；与 Vue 的逐帧对拍与标签名对拍各收下这七个套件，`parity-react` 的待铺名单同步删掉七行，还剩十二行。

**顺带修掉 React 宿主冲刷的一处时间语义。** `tests/harness.ts` 的 `tick()` 原先每一拍交给 `act` 的是异步回调，那条路 `act` 恒要让出一个宏任务；`download-trigger` 的「取数失败」用例把拒绝推到 `setTimeout(0)` 上，指望冲刷期间状态稳定停在 `preparing`，于是两者赛跑——单独跑那一个组件时冷启动下实测约一半判红，整文件跑因为 JIT 已经热了才一直是绿的。改成同步回调后 `act` 只在自己队列里真有活时才让出宏任务，机器的更新本就由 `flushSync` 同步提交；冲刷于是只把框架排空、不把时间往前推，与 Vue 那侧的 `nextTick` 是同一个意思。改完整份一致性套件 1532 条、逐帧对拍与标签名对拍 1532 条、React 适配器 35 个文件 2069 条全绿，`download-trigger` 单跑连续五次稳定。

**已知没有判据咬得住的几处，逐条记在案。**

- **三处滚动容器接线改坏了套件照样全绿**：`back-top` 与 `affix` 的 `getTargetEl`（两个套件都只跑整页滚动那一路，`target` 一次都没传过），以及 `floating-panel` 的 `getContentEl`（它只在指针拖动的副作用里被读，而套件的搬动与改尺全走键盘）。三处逐个实测确认，当前只有代码在保证。`affix` 的 `getRootEl` 不在此列——判定线与占位高度都量它，改成恒 `null` 有四条当场判红。
- **`floating-panel` 的浮层落点没有判据。** 测试宿主刻意插在 portal 落点之前，于是「搬去落点」与「留在原地」两种渲染的文档序完全一样：把 `XhPortal` 换成片段之后，一致性套件与逐帧对拍都还是全绿。真正要它的理由（逃开祖先的层叠上下文）在 jsdom 里没有可观察面。
- **`floating-panel` 的退场闸门同样没有判据。** 收起时 `positioner` 由 `connect` 打上 `hidden`，这一条由套件咬着；而适配器额外压上的内联 `display: none`（以及「退场动画播完之前保持可见」这条真正的闸门）落在 `style` 上，归一化快照不收 style，jsdom 也量不到 `animationName`——把那一整段换成空对象照样全绿。
- **`hotkeys` 挂载后实测平台这一步没有判据。** jsdom 的 `navigator.platform` 不是 Mac，实测值与「还没测出来」时的回落值同为 `other`，把 `detectHotkeysPlatform()` 换成恒 `'auto'` 套件全绿。Mac 上 `Mod` 该落到 ⌘ 这条只能在真机上看。`target: 'parent'` 与「作者给一个取节点的函数」这两支、以及 `stop()` 句柄，套件一次都没走到。
- **七个组件的对外事件里有六种进不了快照**：两个宿主的公开事件表只收登记过的那些，`affix-change`、`visibility-change`、`copy-error`、`position-change`、`dimensions-change`、`window-state-change` 都不在表内，派没派、派了几次一律看不见（`hot-key` 同样不在表内，由新加的用例单独咬住）。表内的 `open-change` 与 `download-error` 则逐帧对得上。
- **`float-button` 的贴边距离没有判据。** 它落成内联的 `--xh-_float-button-offset`，而归一化快照不收 style；套件里那条传了 `offset: 8` 的用例只对 `data-placement` 与 `data-shape`。`affix` 与 `floating-panel` 的矩形不在此列——那两个套件专门用 raw 步骤直接读 `el.style` 对数。
- **`clipboard` 的播报区没跑过。** `status` 部件不在共享 fixture 里，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核；它不给内容时念 `announcement` 这条更是连文本都不进快照（归一化快照只收属性、文档序、焦点与事件）。
- **`floating-panel` 的文案覆盖没有用例。** 套件对的是把手与形态钮的内建英文（含 `aria-valuetext` 那一句），`translations` 传进去覆盖掉之后的样子一次都没验过。
- **jsdom 没有布局，量测全是桩出来的。** `affix` 的判定线与占位尺寸、`back-top` 的滚动量、`floating-panel` 的矩形，都是套件在真实节点上按需摆的常数；`floating-panel` 的指针拖动与改尺（`trackPointer` 整条）一次都没跑到。真实排版下的行为只能在真机上看。
- React 侧还没有浏览器态用例与计算样式快照这条输入，七个组件的皮肤、悬浮钮的贴边、面板的阴影与层级一律不在判据内。
