# 弹出选择 <Badge type="info" text="popselect" />

一个触发器加一张选项浮层：比选择器轻，没有输入框也不参与表单。

## 何时使用

- 就地切换一个视图参数（排序方式、显示密度），不属于任何表单。
- 触发器本身就是当前值的显示位（一段文字、一个图标按钮）。

## 何时不用

- 值要随表单提交：用[选择器](./select)。
- 条目是命令：用[菜单](./menu)。

## 特性

- 单选与多选都支持，条目带标记位。
- 形态、语气、尺寸三轴与其余选择类组件同源。

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

三个视觉轴只写在根上，盒与浮层都从这里继承

<XhDemo src="popselect/04-appearance" />

### 自定义条目

条目里想放什么都行：连打检索只认 item-text，多出来的文字不参与，选中与导航照旧

<XhDemo src="popselect/05-custom-item" />

### 清空按钮

清空钮与触发器一起收在盒里，是它的兄弟节点：有选中才显出，点按清空全部选中、焦点送回触发器；焦点在触发器上按 Delete 清空全部、Backspace 多选去掉最后一个；可及名走 translations.clearTrigger

<XhDemo src="popselect/06-clear" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popselect>` |
| Vue 组件 | `XhPopselectClearTrigger` `XhPopselectContent` `XhPopselectControl` `XhPopselectItem` `XhPopselectItemIndicator` `XhPopselectItemText` `XhPopselectPositioner` `XhPopselectRoot` `XhPopselectTrigger` |
| 组合式函数 | `usePopselect` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/popselect.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popselect"`：`root` · `control` · **`trigger`** · `clear-trigger` · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发器高度、内边距与字号档位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中强调用哪族颜色。 |
| `translations` | `Partial<PopselectTranslations>` |  | 读屏用的文案；缺省走英文兜底。 |
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

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

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
| `canClear` | `boolean` | 有选中值且未禁用：清空钮据此显隐，键盘清空也只在此时生效。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 落值：单选替换并收起浮层，多选切换并保持展开。 |
| `clear` | `() => void` | 清空选中集合；单选多选一视同仁。 |
| `getRootProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
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
| `Delete` | focus on trigger, 有选中值, not disabled | 清空全部选中，浮层开合不变 |
| `Backspace` | focus on trigger, 有选中值, not disabled | 单选清空；多选只去掉最后选中的那一个 |
| `Tab` / `Shift+Tab` | focus in content | 收起浮层并放行焦点，按 Tab 序列离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'listbox' |
| `clear-trigger` | `aria-label` | props.translations?.clearTrigger |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/popselect.css` 按部件选择：`[data-scope="popselect"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-popselect-action-radius` · `--xh-popselect-action-size` · `--xh-popselect-clear-bg-active` · `--xh-popselect-clear-bg-hover` · `--xh-popselect-clear-fg` · `--xh-popselect-clear-fg-hover` · `--xh-popselect-content-bg` · `--xh-popselect-content-border` · `--xh-popselect-content-fg` · `--xh-popselect-content-max-h` · `--xh-popselect-content-max-w` · `--xh-popselect-content-min-w` · `--xh-popselect-content-px` · `--xh-popselect-content-py` · `--xh-popselect-content-radius` · `--xh-popselect-content-shadow` · `--xh-popselect-control-bg` · `--xh-popselect-control-bg-disabled` · `--xh-popselect-control-border` · `--xh-popselect-control-border-focus` · `--xh-popselect-control-border-hover` · `--xh-popselect-control-gap` · `--xh-popselect-control-h` · `--xh-popselect-control-min-w` · `--xh-popselect-control-px` · `--xh-popselect-control-radius` · `--xh-popselect-icon-size` · `--xh-popselect-item-bg-hover` · `--xh-popselect-item-fg` · `--xh-popselect-item-fg-selected` · `--xh-popselect-item-font-size` · `--xh-popselect-item-font-weight-selected` · `--xh-popselect-item-gap` · `--xh-popselect-item-indicator-fg` · `--xh-popselect-item-indicator-size` · `--xh-popselect-item-leading` · `--xh-popselect-item-px` · `--xh-popselect-item-py` · `--xh-popselect-item-radius` · `--xh-popselect-layer` · `--xh-popselect-placeholder-fg` · `--xh-popselect-root-gap` · `--xh-popselect-trigger-fg` · `--xh-popselect-trigger-font-size` · `--xh-popselect-trigger-gap`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器用[按钮](./button)；放进[工具栏](./toolbar)。

## 最佳实践

- 触发器上显示当前值，别只显示一个名词。
- 选项控制在十项以内，多了就换[选择器](./select)。

## 反模式

- 拿它做表单字段：没有 `name`，也没有标签关联。
