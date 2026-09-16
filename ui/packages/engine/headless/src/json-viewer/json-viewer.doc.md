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
- 每一行带 `data-value-type`，六种值形态各自着色。
- 尺寸轴与其他组件同源；`variant` 决定外框形态，默认 `outline`；`subtle` 换成淡底无描边，`ghost` 去掉外框与底色只保留内容。
- 没有任何行可展开时由 `empty` 部件说明，文案使用 `translations.empty`，作者也可以自行写入内容。
- 只支持 JSON 能表达的形状，传入活对象时呈现有损：`Date` / `Map` / `Set` 一律按自有可枚举键展开，因此显示为 `{}`；`undefined` 归入 `null` 一档、显示为 `undefined`；`bigint` 归入 `number`；函数与 symbol 归入 `string`，按各自的字符串形式呈现。需要如实展示这些值时先转换为 JSON 能表达的形状。
- 自定义元素侧：`value` 属性接受一段 JSON 文本（无法解析时按字符串值展示），对象与数组直接赋 property（`el.value = { … }`）；`expandedValue` / `defaultExpandedValue` / `translations` 没有对应属性，只能通过 property 设置，写成 `expanded-value='["$"]'` 不会生效。

## 无障碍

- 树是 `role=tree`，每一行是 `role=treeitem`，层级三项（`aria-level` / `aria-posinset` / `aria-setsize`）取自展开结果。
- 整棵树只占一个 Tab 位：首次进入落在首行，之后 Tab 离开再返回时落回上次停留的行；组内靠上下键移动。
- 展开箭头对读屏隐藏，它重复的是分支自身已报出的 `aria-expanded` 与左右方向键。
- 分支的名称显式提供（`aria-label`）：它包裹整棵子层，从内容计算名称会把所有子孙的文字一并读出。
- 收起摘要（`{…} 3`）是排版记号，对读屏隐藏；其中的成员数并入分支的可访问名称（默认读为 `tags, 3 items`，整句可用 `translations.collapsedBranchLabel` 替换）。

## RTL

- 左右方向键的展开 / 收起语义跟随书写方向：未传 `dir` 时从 DOM 读取，整页 `dir="rtl"` 也能识别。

## 组合

- 放入[标签页](./tabs)或[抽屉](./drawer)作为调试面板；行数多时套一层[滚动区域](./scroll-area)。
- 配合[剪贴板](./clipboard)提供原始 JSON 的复制。

## 最佳实践

- 大数据必须提供 `maxItems` 与 `maxStringLength`：一次展开几万行会让页面停滞。
- 默认展开层数不宜过大：`defaultExpandedDepth` 超过 2 会把整份数据铺满屏幕。
- 值的类型只靠颜色区分不够，字符串的引号、`null` 的字面量都要保留。
- 一行被收起时，其内部持有焦点的行会离开 DOM，焦点回到 `<body>`。应在收起前把焦点交回分支行本身，键盘用户才不会每收一层就丢失位置。

## 反模式

- 将它用作日志流：日志是时间序的条目，使用[日志](./log)。
- 把几 MB 的响应体原样传入，让用户自行查找。
