# 弹出选择 <Badge type="info" text="popselect" />

数据录入组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

触发器旁弹出一个列表，选完即收起；条目按 value 标识身份，禁用的条目方向键会跳过

<XhDemo src="popselect/01-basic" />

### 多选

multiple 下落值是切换、浮层不收起，可以接着挑；收起交给 Esc 或点浮层外

<XhDemo src="popselect/02-multiple" />

### 受控

选中值与展开态都由外部持有：组件只发意图，写不写回由你决定

<XhDemo src="popselect/03-controlled" />

### 形态·语气·尺寸

三个视觉轴只写在根上，触发器与浮层都从这里继承

<XhDemo src="popselect/04-appearance" />

### 自定义条目

条目里想放什么都行：连打检索只认 item-text，多出来的文字不参与，选中与导航照旧

<XhDemo src="popselect/05-custom-item" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popselect>` |
| Vue 组件 | `XhPopselectContent` `XhPopselectItem` `XhPopselectItemIndicator` `XhPopselectItemText` `XhPopselectPositioner` `XhPopselectRoot` `XhPopselectTrigger` |
| 组合式函数 | `usePopselect` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/popselect.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popselect"`：`root` · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发器的描边与底色怎么用。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopselectRoot` | `default` | `PopselectRootSlotProps` |  |

## connect API

`usePopselect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `value` | `string[]` | 选中集合；单选恒为长度 ≤ 1。 |
| `collection` | `readonly PopselectNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `multiple` | `boolean` |  |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 落值：单选替换并收起浮层，多选切换并保持展开。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: PopselectItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: PopselectItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: PopselectItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | focus on trigger, 收起态 | 展开浮层；焦点随即进入列表，落在选中项上，无选中则落首个可停留条目 |
| `ArrowDown` | focus in content | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | focus in content | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | focus in content | 焦点移到首个可停留条目 |
| `End` | focus in content | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus in content, 单选 | 选中焦点条目并收起浮层，焦点归还触发器；条目禁用则不认 |
| `Enter` / `Space` | focus in content, multiple | 切换焦点条目的选中态，浮层保持展开继续挑 |
| `单个可打印字符` | focus in content, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不落值 |
| `Tab` / `Shift+Tab` | focus in content | 收起浮层并放行焦点，按 Tab 序列离开 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-popselect-content-bg` · `--xh-popselect-content-border` · `--xh-popselect-content-fg` · `--xh-popselect-content-max-h` · `--xh-popselect-content-max-w` · `--xh-popselect-content-min-w` · `--xh-popselect-content-p` · `--xh-popselect-content-radius` · `--xh-popselect-content-shadow` · `--xh-popselect-item-bg-hover` · `--xh-popselect-item-fg` · `--xh-popselect-item-fg-selected` · `--xh-popselect-item-font-size` · `--xh-popselect-item-font-weight-selected` · `--xh-popselect-item-gap` · `--xh-popselect-item-indicator-fg` · `--xh-popselect-item-indicator-size` · `--xh-popselect-item-leading` · `--xh-popselect-item-px` · `--xh-popselect-item-py` · `--xh-popselect-item-radius` · `--xh-popselect-placeholder-fg` · `--xh-popselect-trigger-bg` · `--xh-popselect-trigger-border` · `--xh-popselect-trigger-border-hover` · `--xh-popselect-trigger-fg` · `--xh-popselect-trigger-font-size` · `--xh-popselect-trigger-gap` · `--xh-popselect-trigger-h` · `--xh-popselect-trigger-px` · `--xh-popselect-trigger-radius`
