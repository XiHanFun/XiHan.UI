---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Layout 侧栏跨过断点的通知从 `onSiderBreakpoint` 改叫 `onSiderBreakpointChange`：变化事件一律 `on<X>Change`，旧名与 `siderBreakpoint` 这个 prop 只差一个 on，读起来像在设断点。`siderBreakpoint` 与它的 attribute `sider-breakpoint` 不变。

| 旧名 | 新名 |
| --- | --- |
| `onSiderBreakpoint`（Vue `@sider-breakpoint`，WC 事件 `sider-breakpoint`） | `onSiderBreakpointChange`（Vue `@sider-breakpoint-change`，WC 事件 `sider-breakpoint-change`） |
| 类型 `LayoutSiderBreakpointDetails` | `LayoutSiderBreakpointChangeDetails` |
