# 提及 <Badge type="info" text="mention" />

在正文里打一个前缀字符就弹出候选，选中后把引用插进文本。

## 何时使用

- 评论、聊天、任务描述里 @ 某个人或 # 某个条目。
- 需要多种前缀各带一份候选。

## 何时不用

- 整个输入框的值就是选中项：用[组合框](./combobox)。
- 只是补全普通词汇：用[组合框](./combobox)或原生自动补全。
- 正文本身要跨行：本组件的输入框是单行的，不提供多行形态。

## 特性

- 单行输入框，与其它输入控件同一档行高与内衬。
- 多种前缀各自映射一份候选。
- `onQueryChange` 给出当前查询串，异步候选据此拉取。
- 正文可受控，选中时另有回调。
- `label` 部件给输入框一个点得动的标题；给了 `translations.input` 时仍走 `aria-label`。
- 给了 `collection` 却一条都不剩时显出 `empty` 部件。
- `content` 是候选、空态与加载态共用的唯一浮层表面；`empty`/`loading` 保持为 listbox 外的同级 `role=status`，只在零可见候选时把文字覆盖到该表面。自动结构保留既有 `No results`，手写结构没有状态文案时不画空框。
- 候选还在取且当前没有可见项时由 `loading` 顶上来，空态让位；已有候选时列表保持可见可操作，只由 `aria-busy` 报后台刷新。
- 带 `hidden` 的候选不参与计数、高亮、方向键或 Enter；全部隐藏后会清掉 `aria-activedescendant`，不会提交不可见旧项。
- `name` 让整段正文随表单提交，表单重置回落到 `defaultValue`。

## 示例

### 基础用法

在正文里敲 @ 才开候选，选中的那条被插到光标处，前后文一字不动

<XhDemo src="mention/01-basic" />

### 多种前缀

@ 提人、# 打标签共用一个输入框，query-change 会报回是哪个前缀触发的

<XhDemo src="mention/02-multi-prefix" />

### 候选里的自定义内容

手写各部件即可在候选行里放头像与职位；插回正文的那段字取自 item-text

<XhDemo src="mention/03-custom-item" />

### 受控正文与选中回调

正文由宿主持有，select 事件报回插进去的是哪一条，用来攒收件人名单

<XhDemo src="mention/04-controlled" />

### 异步候选

查询串每变一次就重新去远端查一遍，加载、空结果和候选共用一张浮层表面

<XhDemo src="mention/05-async" />

### 形态

variant 换正文框的描边与底色，候选面板不受影响

<XhDemo src="mention/06-variant" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-mention>` |
| Vue 组件 | `XhMentionContent` `XhMentionEmpty` `XhMentionInput` `XhMentionItem` `XhMentionItemText` `XhMentionLabel` `XhMentionLoading` `XhMentionPositioner` `XhMentionRoot` |
| 组合式函数 | `useMention` |
| 状态机 | `mentionMachine` |
| 皮肤 | `@xihan-ui/styles/mention.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="mention"`：**`root`** · `label` · **`input`** · `positioner` · **`content`** · `empty` · `loading` · `item` · `item-text`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `triggerPrefix` | `string \| string[]` |  | 开候选的前缀字符，缺省 '@'。给数组即多种前缀并存，宿主按 onQueryChange 报回的 prefix 分流。 前缀必须紧跟在行首或空白之后，邮箱地址里的 @ 因此不会误触发。 |
| `collection` | `MentionNode[]` |  | 候选数据，显示文本与禁用的事实源。过滤仍归调用方：交进来的就是此刻该显示的那几条。 组件不管怎么筛，它只负责把查询串交出去。 |
| `value` | `string` |  | 整段正文。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string` |  |  |
| `disabled` | `boolean` |  | 整个控件禁用：输入框用原生 disabled，候选一概不开。 |
| `readOnly` | `boolean` |  | 只读：正文仍可聚焦与复制，改不动，候选也不开。 |
| `invalid` | `boolean` |  | 校验失败标注：描边与聚焦环换成失败色，同时经 aria-invalid 上报。 |
| `loading` | `boolean` |  | 候选还在取：候选面板报 aria-busy，在途占位顶上来、空态占位让位。 |
| `placeholder` | `string` |  | 输入框占位文字。不给就整条不输出，作者写在 input 部件上的那份因此留得住。 |
| `name` | `string` |  | 表单字段名；给了输入框才带 name，整段正文随表单一并提交。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `translations` | `MentionTranslations` |  |  |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定输入框的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与高亮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定输入框内边距与字号档位。 |
| `onValueChange` | `(details: MentionValueChangeDetails) => void` |  | 正文变化回调；受控时是唯一出口。 |
| `onQueryChange` | `(details: MentionQueryChangeDetails) => void` |  | 查询串变化回调：调用方据此重新过滤候选。收起时报 null。 |
| `onSelect` | `(details: MentionSelectDetails) => void` |  | 候选被插进正文时回调，带上是哪一条。 |
| `onOpenChange` | `(details: MentionOpenChangeDetails) => void` |  | 浮层开合回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MentionValueChangeDetails` | 正文变化；detail 为 `{ value: string }` |
| `query-change` | `MentionQueryChangeDetails` | 查询串变化；detail 为 `{ query, prefix }`，作者据此过滤候选；收起时报 null |
| `select` | `MentionSelectDetails` | 候选被插进正文；detail 为 `{ value, label, prefix }` |
| `open-change` | `MentionOpenChangeDetails` | 浮层开合；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMentionRoot` | `default` | `MentionRootSlotProps` |  |
| `XhMentionRoot` | `item` | `MentionNodeMeta` | 铺开 collection 时每条候选的文本插槽。 |
| `XhMentionRoot` | `empty` | — | 铺开 collection 时空态里那句话；不写走内建英文。 |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `ESCAPE` · `INPUT.CHANGE` · `CARET.SYNC` · `VALUE.SET` · `ITEM.HIGHLIGHT` · `ITEM.SELECT` · `ITEMS.SYNC` · `FORM.RESET`

## connect API

`useMention` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly MentionNodeMeta[]` | collection 推出的候选元信息，按数据顺序排列；没给 collection 即空数组。 |
| `value` | `string` | 整段正文。 |
| `query` | `string \| null` | 当前查询串；没有触发时为 null。 |
| `activePrefix` | `string \| null` | 触发本次查询的前缀；没有触发时为 null。 |
| `highlightedValue` | `string \| null` | 高亮候选；收起时为 null。焦点不在它身上，只经 aria-activedescendant 上报。 |
| `disabled` | `boolean` |  |
| `empty` | `boolean` | 没有候选可显：给了 collection 且一条都不剩。作者据此显出空态部件。 |
| `isHighlighted` | `(value: string) => boolean` |  |
| `setValue` | `(next: string) => void` | 整段改写正文，浮层随之收起。 |
| `close` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` | 标题；`for` 恒写向 input，故须是原生 `&lt;label&gt;`。 |
| `getInputProps` | `() => T['input']` | 单行输入框；正文就写在它身上。 |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 一条候选都没有时显出的空态；有候选时带 hidden 收起。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 同样是 content 的兄弟，不进 role=listbox。 |
| `getItemProps` | `(props: MentionItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MentionItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `前缀字符` | 光标前是行首或空白 | 开候选浮层，并把前缀到光标之间那段作为查询串交给宿主 |
| `可打印字符` | open | 查询串跟着变长，过滤由调用方按 onQueryChange 自己做 |
| `ArrowDown` | open | 高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `ArrowUp` | open | 高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动 |
| `Enter` | open, 有高亮且未禁用 | 把候选文本插到光标处替换查询串，光标落到插入内容之后，浮层收起；这次回车被吞掉，不落到表单上 |
| `Enter` | open, 无可提交候选 | 不吞按键，只把浮层收起来；摆在表单里时这次回车照常提交表单 |
| `Escape` | open | 收起浮层且正文不变；光标不离开这个触发点就不再自动展开 |
| `Tab` / `Shift+Tab` | open | 收起浮层且不拦按键，焦点按 Tab 序列自然离开 |
| `ArrowLeft` / `ArrowRight` / `Home` / `End` | 任意时候 | 一律不接管：光标照常移动，触发按新的光标位置重算，挪出查询串即收起 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `content` 部件的 id |
| `input` | `aria-expanded` | 'true' \| 'false' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-label` | props.translations.input |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `input` | `role` | 'combobox' |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `role` | 'listbox' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |

## 样式

默认皮肤 `@xihan-ui/styles/mention.css` 按部件选择：`[data-scope="mention"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-readonly` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-mention-content-bg` · `--xh-mention-content-border` · `--xh-mention-content-fg` · `--xh-mention-content-gap` · `--xh-mention-content-max-h` · `--xh-mention-content-max-w` · `--xh-mention-content-min-h` · `--xh-mention-content-min-w` · `--xh-mention-content-px` · `--xh-mention-content-py` · `--xh-mention-content-radius` · `--xh-mention-content-shadow` · `--xh-mention-empty-fg` · `--xh-mention-empty-font-size` · `--xh-mention-empty-px` · `--xh-mention-empty-py` · `--xh-mention-input-autofill-bg` · `--xh-mention-input-autofill-fg` · `--xh-mention-input-bg` · `--xh-mention-input-bg-disabled` · `--xh-mention-input-bg-hover` · `--xh-mention-input-bg-readonly` · `--xh-mention-input-border` · `--xh-mention-input-border-focus` · `--xh-mention-input-border-hover` · `--xh-mention-input-border-invalid` · `--xh-mention-input-fg` · `--xh-mention-input-font-size` · `--xh-mention-input-h` · `--xh-mention-input-min-w` · `--xh-mention-input-px` · `--xh-mention-input-radius` · `--xh-mention-input-shadow` · `--xh-mention-item-bg-hover` · `--xh-mention-item-fg` · `--xh-mention-item-font-size` · `--xh-mention-item-gap` · `--xh-mention-item-leading` · `--xh-mention-item-px` · `--xh-mention-item-py` · `--xh-mention-item-radius` · `--xh-mention-label-fg` · `--xh-mention-label-fg-disabled` · `--xh-mention-label-font-size` · `--xh-mention-label-font-weight` · `--xh-mention-label-gap` · `--xh-mention-layer` · `--xh-mention-loading-fg` · `--xh-mention-loading-font-size` · `--xh-mention-loading-px` · `--xh-mention-loading-py` · `--xh-mention-placeholder-fg`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 正文只有一行，与[文本输入](./text-field)的单行档并排时等高。
- 要在多行正文里 @ 人：本库现在给不出这样的组件。

## 最佳实践

- 候选按最近使用排序：@ 的对象高度重复。
- 插入后的引用要能整体删除，别让用户一个字一个字退。
- 异步示例应显式组合 `empty` 与 `loading`，不要用外部文字代替浮层内的正式状态，也不要把状态伪造成 option。

## 反模式

- 候选异步且没有在途反馈：用户以为没人可 @。
- 前缀字符在正文里本来就常用（比如 `#` 在代码里），却不给退出方式。
