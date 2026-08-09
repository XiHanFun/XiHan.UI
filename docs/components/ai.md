# AI 对话

为流式对话准备的两个组件，与 `@xihan-ui/ai` 的会话内核配套使用：`thread` 负责消息列表与自动贴底，`composer` 负责输入与运行态。

本页 2 个组件：会话线程（`thread`）、消息编辑器（`composer`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 会话线程 <Badge type="info" text="thread" /> {#thread}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-thread>` |
| Vue 组件 | `XhThreadContent` `XhThreadLiveRegion` `XhThreadRoot` `XhThreadScrollButton` `XhThreadViewport` |
| 组合式函数 | `useThread` |
| 状态机 | `threadMachine` |
| 皮肤 | `@xihan-ui/styled/thread.css` |

**解剖**（`data-scope="thread"`，加粗为必备部件）

**`root`** · **`viewport`** · **`content`** · `scroll-button` · `live-region`

**键盘**（规格出处：[W3C APG · structural-roles 实践](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入消息区 | 消息区自身可聚焦，方向键/PageUp/PageDown 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |

---

## 消息编辑器 <Badge type="info" text="composer" /> {#composer}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-composer>` |
| Vue 组件 | `XhComposerInput` `XhComposerRoot` `XhComposerSubmitTrigger` |
| 组合式函数 | `useComposer` |
| 状态机 | `composerMachine` |
| 皮肤 | `@xihan-ui/styled/composer.css` |

**解剖**（`data-scope="composer"`，加粗为必备部件）

**`root`** · **`input`** · **`submit-trigger`**

**键盘**（规格出处：[W3C APG · 模式索引](https://www.w3.org/WAI/ARIA/apg/patterns/)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | 焦点在输入框、未处于 IME 组合态、submitOnEnter 为真且可提交 | 提交当前输入并清空 |
| `Shift+Enter` | 焦点在输入框 | 不归组件管：原样放行，浏览器插入换行 |
| `Enter` | 处于 IME 组合态（isComposing 为真） | 不提交：交给输入法确认候选词 |
| `Space` / `Enter` | 焦点在发送/停止按钮上 | 按 data-mode 触发提交或停止 |
