# @xihan-ui/web-components

Web Components 适配器：把框架无关的 headless（anatomy + machine + connect）落在
自研基类 `XhReactiveElement` 上的 **Light-DOM 行为宿主**（零第三方运行时依赖）。

- 元素不渲染结构；用户写带 `data-xh-part` 的 Light-DOM 子节点，元素发现后用
  `spreadProps` 把 `connect()` 产出命令式打上去。每个组件一个 `xh-*` 元素，part 不是各自的元素。
- `MachineController` 把机器唯一解释器 `createService` 桥到 controller 生命周期，
  不重造 FSM。元素类只在 `@xihan-ui/web-components/define` 子路径，`defineXhElements()` 显式注册。
- **两个入口在 Node 下都可安全 import**：基类无 DOM 时取一个替身基座（`src/reactive/element.ts`），
  元素类的定义式不再在模块求值那一刻取 `HTMLElement`；`defineElement` 无 `customElements` 时静默跳过。
  判据在 `tests/node-smoke.spec.ts`。
- **升级前的形态**：收起态由元素在 `wire()` 里用内联 display 做，`data-scope` / `data-part` 也是
  那一刻才打上，所以 JS 到达前浮层子树既没有皮肤也没有收起。styled 的 `styles/undefined.css`
  按作者写的 `data-xh-part` 把浮层族的 backdrop / content / positioner / viewport 收起来，
  SSR 直出的首屏不会把浮层内容倾泻进页面流。不引 styled 的宿主需自行处理这一段。
- 基类在 `src/reactive/`：属性 → 字段的单向转换、批量异步更新、控制器生命周期。
  `tests/reactive-parity.spec.ts` 是差分判据，逐条对拍 `@lit/reactive-element`（仅 devDependency）。

## 与 Vue 适配器的取舍记录（写 WC 适配器时发现的 core/adapter 差异）

- **Presence 模型不同（已知差异，非缺陷）**：Vue 用 Presence 卸载 content（关闭即从 DOM 移除）；
  WC 是 Light DOM，不能删用户节点，content **常驻**，关闭态只由 `data-state="closed"` 标记，
  视觉隐藏交给 styled 层的 `[data-state='closed']{display:none}`。因此两端关闭态 DOM 不同
  （Vue 无 content 节点，WC 有 content[data-state=closed]），Button 可做逐帧 parity、
  Dialog 暂用各自 conformance（Dialog 全量 parity 需 presence 容差，留待后续）。
- **顶层/Portal**：真机可给 content 加 Popover API 上顶层；jsdom 无 Popover，当前只靠
  `data-state` + focus-scope + dismiss-layer，不搬运 DOM。
- **重连（元素在 DOM 中移动）**：解释器 stop 后不可复活，`MachineController` 在 stop 后
  重建机器（从 `initialState`、context 重置）——状态不跨移动保留。
  重建后的状态与重建前相同，cell 不会 bump 版本，因此**不会**自动排更新；
  `connectedCallback` 显式 `requestUpdate()` 重跑一次 `wire()`，否则角色节点上仍挂着
  指向已停机器的处理器（送事件在 dev 下抛 `SEND_AFTER_STOP`）。
- **运行期增删角色节点（已抹平的差异）**：Vue 侧条目是组件，增删自带整套 props 渲染；
  WC 侧作者直接改 Light DOM，元素若不看着点就会留下"死条目"（没有 `data-scope`/`data-part`/
  `data-value` 与事件处理器，集合查询也看不见它）。`XhElement` 用 `MutationObserver`
  观察 `childList`（**不观察 attributes**——`wire()` 正是往角色节点写属性，一并观察会自触发成死循环），
  命中即重新发现 part 并接线。两道过滤：增删里得真有元素节点；目标与宿主之间隔着别的
  `xh-*` 元素则跳过（内层子树归内层元素自己管）。
- **受控 open**：HTML 布尔属性表达不了 `undefined`，`open` 用自定义 converter（属性缺省→
  `undefined`=非受控，`open="false"`→受控关）。受控 open 的跨适配器一致性留待后续。
