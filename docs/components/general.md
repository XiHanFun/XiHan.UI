# 通用组件

不承载表单值、也不管理浮层的基础件。其中 `button` / `badge` / `separator` / `code-block` 没有状态机，`connect` 直接由 props 算出属性。

本页 9 个组件：按钮（`button`）、切换按钮（`toggle`）、切换按钮组（`toggle-group`）、徽标（`badge`）、头像（`avatar`）、图片（`image`）、分隔线（`separator`）、代码块（`code-block`）、剪贴板（`clipboard`）。

每个组件三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。部件（part）名即 `data-part` 属性值，也是皮肤的选择器；加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

---

## 按钮 <Badge type="info" text="button" /> {#button}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-button>` |
| Vue 组件 | `XhButton` `XhButtonIndicator` `XhButtonLabel` `XhButtonPrefix` `XhButtonSuffix` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/button.css` |

**解剖**（`data-scope="button"`，加粗为必备部件）

**`root`** · `label` · `indicator` · `prefix` · `suffix`

**键盘**（规格出处：[W3C APG · button 模式](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in root, interactive | 激活按钮（原生行为） |

---

## 切换按钮 <Badge type="info" text="toggle" /> {#toggle}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle>` |
| Vue 组件 | `XhToggle` |
| 组合式函数 | `useToggle` |
| 状态机 | `toggleMachine` |
| 皮肤 | `@xihan-ui/styled/toggle.css` |

**解剖**（`data-scope="toggle"`，加粗为必备部件）

**`root`**

**键盘**（规格出处：[W3C APG · button 模式](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 pressed 状态 |

---

## 切换按钮组 <Badge type="info" text="toggle-group" /> {#toggle-group}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle-group>` |
| Vue 组件 | `XhToggleGroupItem` `XhToggleGroupRoot` |
| 组合式函数 | `useToggleGroup` |
| 状态机 | `toggleGroupMachine` |
| 皮肤 | `@xihan-ui/styled/toggle-group.css` |

**解剖**（`data-scope="toggle-group"`，加粗为必备部件）

**`root`** · **`item`**

**键盘**（规格出处：[W3C APG · toolbar 模式](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | rovingFocus 开启（默认） | 整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到首个可停留条目 |
| `End` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, 条目未禁用 | 切换该条目；条目是原生 button，这两个键由平台翻成 click |

---

## 徽标 <Badge type="info" text="badge" /> {#badge}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-badge>` |
| Vue 组件 | `XhBadge` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/badge.css` |

**解剖**（`data-scope="badge"`，加粗为必备部件）

**`root`**

**键盘**（规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 头像 <Badge type="info" text="avatar" /> {#avatar}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-avatar>` |
| Vue 组件 | `XhAvatarFallback` `XhAvatarImage` `XhAvatarRoot` |
| 组合式函数 | `useAvatar` |
| 状态机 | `avatarMachine` |
| 皮肤 | `@xihan-ui/styled/avatar.css` |

**解剖**（`data-scope="avatar"`，加粗为必备部件）

`root` · `image` · **`fallback`**

**键盘**（规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 图片 <Badge type="info" text="image" /> {#image}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image>` |
| Vue 组件 | `XhImageFallback` `XhImageImage` `XhImageRoot` |
| 组合式函数 | `useImage` |
| 状态机 | `imageMachine` |
| 皮肤 | `@xihan-ui/styled/image.css` |

**解剖**（`data-scope="image"`，加粗为必备部件）

**`root`** · **`image`** · `fallback`

**键盘**（规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 分隔线 <Badge type="info" text="separator" /> {#separator}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-separator>` |
| Vue 组件 | `XhSeparator` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/separator.css` |

**解剖**（`data-scope="separator"`，加粗为必备部件）

**`root`**

**键盘**（规格出处：[W3C APG · separator 模式](https://www.w3.org/WAI/ARIA/apg/patterns/separator/)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

---

## 代码块 <Badge type="info" text="code-block" /> {#code-block}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-code-block>` |
| Vue 组件 | `XhCodeBlock` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styled/code-block.css` |

**解剖**（`data-scope="code-block"`，加粗为必备部件）

**`root`** · `lang-label` · **`pre`** · **`code`** · `token`

**键盘**（规格出处：[WCAG 2.1 技术 G202](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)）

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 代码块在 Tab 序列中 | &lt;pre&gt; 自身可聚焦，随后方向键的横向滚动交给浏览器，组件不接管 |

---

## 剪贴板 <Badge type="info" text="clipboard" /> {#clipboard}

| 产物 | 值 |
| --- | --- |
| 自定义元素 | `<xh-clipboard>` |
| Vue 组件 | `XhClipboardControl` `XhClipboardIndicator` `XhClipboardInput` `XhClipboardLabel` `XhClipboardRoot` `XhClipboardTrigger` |
| 组合式函数 | `useClipboard` |
| 状态机 | `clipboardMachine` |
| 皮肤 | `@xihan-ui/styled/clipboard.css` |

**解剖**（`data-scope="clipboard"`，加粗为必备部件）

**`root`** · `label` · `control` · `input` · **`trigger`** · `indicator`

**键盘**（规格出处：[HTML 标准](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)）

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。
