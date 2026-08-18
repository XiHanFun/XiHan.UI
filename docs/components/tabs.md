# 标签页 <Badge type="info" text="tabs" />

导航组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 示例

### 基础用法

default-value 指定初始选中项，禁用的标签方向键会跳过；面板常挂，靠 hidden 显隐

<XhDemo src="tabs/01-basic" />

### 受控

传了 value 就由宿主说了算，组件自己不再改选中值；v-model:value 是它的语法糖

<XhDemo src="tabs/02-controlled" />

### 手动激活

activation-mode="manual" 时方向键只搬焦点，按 Enter 或空格才真的切面板

<XhDemo src="tabs/03-manual" />

### 竖排

orientation 换掉方向键收哪一对键：竖排认上下键，左右键原样放行给页面

<XhDemo src="tabs/04-vertical" />

### 形态

variant 只改选中态怎么画，切换行为与键盘操作三档一致；不写 variant 即 line 档

<XhDemo src="tabs/05-variant" />

### 语气

tone 决定选中态用哪族颜色，与 variant 正交；这里固定 card 形态只看语气的差别

<XhDemo src="tabs/06-tone" />

### 尺寸

size 换标签的高度、内边距与字号，不传 size 即默认档

<XhDemo src="tabs/07-size" />

### 标签栏前后缀

list 里只收 trigger；要在标签栏两侧摆东西，把它们与 list 排进同一行

<XhDemo src="tabs/08-prefix-suffix" />

### 拦截切换

受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动

<XhDemo src="tabs/09-guard" />

### 动态增删

标签清单归宿主维护；关掉当前这页时把选中值挪到相邻一项，全关完选中值是 null

<XhDemo src="tabs/10-dynamic" />

### 可滚动的标签栏

标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮

<XhDemo src="tabs/11-scrollable" />

### 切换后滚进视野

每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中

<XhDemo src="tabs/12-active-into-view" />

### 标签栏摆在哪一边

root 按书写顺序渲染子节点：把面板写在 list 前面，标签栏就落到内容之后，基线换到另一边

<XhDemo src="tabs/13-placement" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsList` `XhTabsRoot` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styles/tabs.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TabsNode[]` |  | 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在 trigger 上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `activationMode` | `TabsActivationMode` |  | 方向键移动焦点时是否顺带切换选中，默认 automatic。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `variant` | `TabsVariant` |  | 形态：line / card / segment，决定选中态怎么画。缺省是 line。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 状态机

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR`

**判据**：`isAutomatic`

## connect API

`useTabs` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly TabsNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
