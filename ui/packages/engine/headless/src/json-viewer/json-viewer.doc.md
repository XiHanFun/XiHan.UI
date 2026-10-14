# JSON 视图

把一份 JSON 展开为可折叠的树：键名、值与值类型各自成块，对象与数组可以逐层收起。

## 何时使用

- 调试面板、接口返回体、配置文件的只读呈现。
- 日志详情中的大段结构化字段，直接铺开会淹没正文。

## 何时不用

- 数据可编辑时，本组件只读；修改值需要自行接入[表单](./form)与[文本字段](./text-field)。
- 数据只是一段带语法高亮的源码时，使用[代码视图](./code-view)。
- 层级数据不是 JSON、键名与类型没有语义时，使用[树](./tree)；它处理通用层级数据与选中，本组件处理 JSON 的类型语义（键名、值形态、按类型着色、循环引用）。
- 只有几个字段需要平铺展示时，使用[描述列表](./descriptions)。

## 特性

- 行结构由 `value` 展开，作者不写任何行标记：Vue 与自定义元素两侧铺出同一棵 DOM，根容器内原有内容由组件接管。
- 自定义渲染器可调用 `groupJsonViewerNodesByParent(nodes)` 把可见行按父路径分组；返回值保留父路径首次出现顺序、组内输入顺序与节点身份。
- 未提供 `value` 时是空视图，不展开任何行；对象内确实存在值为 `undefined` 的成员时，该行照常展开。
- 展开集合可受控（`expandedValue` / `defaultExpandedValue`），非受控时按 `defaultExpandedDepth` 计算：数据晚于组件挂载到达（自定义元素常先升级、再由脚本写 `.value`）也能计算，第一次展开或收起之后固定，不再跟随数据。
- `maxStringLength` 截断长字符串，`maxItems` 折叠超长数组，`sortKeys` 让对象键按字典序排列。
- 循环引用展开到即停，标记为 `[Circular]`，不会无限递归。
- 每一行带 `data-value-type`，六种值形态各自着色。原文档同样着色：原文按类别切成 `token` 部件（`data-kind` 为 `key`、`string`、`number`、`boolean`、`null`、`punctuation`），与树档使用同一组覆盖槽与语法令牌；原文无法识别为 JSON 时整段不着色。
- 尺寸轴与其他组件同源；`variant` 决定外框形态，默认 `outline`；`subtle` 换成淡底无描边，`ghost` 去掉外框与底色只保留内容。
- 没有任何行可展开时由 `empty` 部件说明，文案使用 `translations.empty`，作者也可以自行写入内容。
- 内建工具条按需打开：`tools` 不提供即没有工具条；`true` 铺出全部工具；数组只铺列出的几项（`expand`、`wrap`、`copy`、`view`），数组里出现未知的工具名会抛错。条是根的第一个孩子，钮的排列由组件决定：展开 / 收起全部是一颗切换钮，只在树档出现：还有收着的分支时按下展开全部，已经全部展开时按下收回顶层，名称与字形随之变化；「自动换行」只在原文档出现；复制与树 / 原文切换钮固定在末端，切换形态时这两颗不移动，切换钮的名称与字形取要切去的那一档。
- 树 / 原文切换钮改写 `view`：`view` 提供即受控，开关只触发 `onViewChange`；`defaultView` 是非受控初值。自动换行同理（`wrap` / `defaultWrap` / `onWrapChange`），开启后原文的长行折到下一行而不是横向滚动。
- 复制钮写入的是原文档那一份文本（不受 `maxStringLength` / `maxItems` 折减），无论当前处于哪一档；成功后钮换成对钩约 3 秒，写入失败时回到常态并触发 `onCopyError`。剪贴板接口要求安全上下文。
- 手里有值的原文（如后端下发的 JSON 文本）时传给 `source`：原文档与复制钮改用它，能解析成 JSON 就只按两格缩进重排，数字、字符串等字面量保持不变，解析不了就原样显示。`value` 是解析过的值，超出安全整数的数字（如 64 位 ID）已经失真，只有原文与来源一致；树档仍展示 `value`。headless 另导出同一个重排函数 `formatJsonSource`。
- 只支持 JSON 能表达的形状，传入活对象时呈现有损：`Date` / `Map` / `Set` 一律按自有可枚举键展开，因此显示为 `{}`；`undefined` 归入 `null` 一档、显示为 `undefined`；`bigint` 归入 `number`；函数与 symbol 归入 `string`，按各自的字符串形式呈现。需要如实展示这些值时先转换为 JSON 能表达的形状。
- 自定义元素侧：`value` 属性接受一段 JSON 文本（无法解析时按字符串值展示），对象与数组直接赋 property（`el.value = { … }`）；`expandedValue` / `defaultExpandedValue` / `translations` 没有对应属性，只能通过 property 设置，写成 `expanded-value='["$"]'` 不会生效。

## 无障碍

- 树是 `role=tree`，每一行是 `role=treeitem`，层级三项（`aria-level` / `aria-posinset` / `aria-setsize`）取自展开结果。
- 整棵树只占一个 Tab 位：首次进入落在首行，之后 Tab 离开再返回时落回上次停留的行；组内靠上下键移动。
- 展开箭头对读屏隐藏，它重复的是分支自身已报出的 `aria-expanded` 与左右方向键。
- 分支的名称显式提供（`aria-label`）：它包裹整棵子层，从内容计算名称会把所有子孙的文字一并读出。
- 收起摘要（`{…} 3`）是排版记号，对读屏隐藏；其中的成员数并入分支的可访问名称（默认读为 `tags, 3 items`，整句可用 `translations.collapsedBranchLabel` 替换）。
- 工具条是 `role=group` 并带可访问名称（`translations.toolbar`），每颗钮各占一个 Tab 位；不报告 `role=toolbar`，条内不靠方向键移动。钮里只有字形，名称取自 `translations`；自动换行是开关钮，开关状态由 `aria-pressed` 报告、名称不变；展开 / 收起与树 / 原文两颗切换钮的名称随动作变化（如「展开全部」「收起全部」），不再另报 `aria-pressed`，免得名称与按下态各说各的。
- 复制成功的回执由视觉隐藏的 `status` 部件（`aria-live="polite"`）读出，钮上的对钩只是视觉标记。

## RTL

- 左右方向键的展开 / 收起语义跟随书写方向：未传 `dir` 时从 DOM 读取，整页 `dir="rtl"` 也能识别。

## 组合

- 搜索：`search` 标出键名与值里含有搜索词的行（不区分大小写），命中行的祖先分支自动展开（写进展开集合，之后照常能收起），命中的那一段铺成 `mark` 部件。搜索框与上一条 / 下一条由作者摆在树之前：Vue 写进 `toolbar` 插槽，React 经 `toolbar` 传入，载荷是 `searchMatches`、`activeMatch`、`nextMatch`、`prevMatch`；Web Components 在元素上取 `searchMatches` / `activeMatch` 并调用 `nextMatch()` / `prevMatch()`。停住的那一条投影 `data-current`、命中片段换成实心，并被滚进视野。

- 放入[标签页](./tabs)或[抽屉](./drawer)作为调试面板；行数多时套一层[滚动区域](./scroll-area)。
- 只需要复制原文时打开 `tools` 的 `copy` 一项；复制钮要放在别处或换成带文字的样式时，改用[剪贴板](./clipboard)并把 `jsonText(value, sortKeys)` 的结果交给它。
- 搜索框（`toolbar` 插槽）与内建工具条可以同时使用：插槽内容排在根之前，内建工具条排在根内的最前面。

## 最佳实践

- 大数据必须提供 `maxItems` 与 `maxStringLength`：一次展开几万行会让页面停滞。
- 默认展开层数不宜过大：`defaultExpandedDepth` 超过 2 会把整份数据铺满屏幕。
- 值的类型只靠颜色区分不够，字符串的引号、`null` 的字面量都要保留。
- 一行被收起时，其内部持有焦点的行会离开 DOM，焦点回到 `<body>`。应在收起前把焦点交回分支行本身，键盘用户才不会每收一层就丢失位置。

## 反模式

- 将它用作日志流：日志是时间序的条目，使用[日志](./log)。
- 把几 MB 的响应体原样传入，让用户自行查找。
