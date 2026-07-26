# @xihan-ui/wc

Web Components 适配器：把框架无关的 headless（anatomy + machine + connect）落在
`ReactiveElement`（非 LitElement）上的 **Light-DOM 行为宿主**。

- 元素不渲染结构；用户写带 `data-xh-part` 的 Light-DOM 子节点，元素发现后用
  `spreadProps` 把 `connect()` 产出命令式打上去。每个组件一个 `xh-*` 元素，part 不是各自的元素。
- `MachineController` 把机器唯一解释器 `createService` 桥到 Lit controller 生命周期，
  不重造 FSM。主入口只 `import type @lit`、零 `HTMLElement` 派生，Node 下可安全 import；
  元素类只在 `@xihan-ui/wc/define` 子路径，`defineXhElements()` 显式惰性注册。

## 与 Vue 适配器的取舍记录（M2 写 WC 时发现的 core/adapter 差异）

- **Presence 模型不同（已知差异，非缺陷）**：Vue 用 Presence 卸载 content（关闭即从 DOM 移除）；
  WC 是 Light DOM，不能删用户节点，content **常驻**，关闭态只由 `data-state="closed"` 标记，
  视觉隐藏交给 styled 层的 `[data-state='closed']{display:none}`。因此两端关闭态 DOM 不同
  （Vue 无 content 节点，WC 有 content[data-state=closed]），Button 可做逐帧 parity、
  Dialog 暂用各自 conformance（Dialog 全量 parity 需 presence 容差，留待后续）。
- **顶层/Portal**：真机可给 content 加 Popover API 上顶层；jsdom 无 Popover，当前只靠
  `data-state` + focus-scope + dismiss-layer，不搬运 DOM。
- **重连（元素在 DOM 中移动，W2）**：解释器 stop 后不可复活，`MachineController` 在 stop 后
  重建机器（从 `initialState`、context 重置）——状态不跨移动保留。
- **受控 open**：HTML 布尔属性表达不了 `undefined`，`open` 用自定义 converter（属性缺省→
  `undefined`=非受控，`open="false"`→受控关）。受控 open 的跨适配器一致性留待后续。
