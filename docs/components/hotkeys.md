# 快捷键 <Badge type="info" text="hotkeys" />

注册一组键盘组合，并按当前平台的写法把它显示成一排键帽。`Mod` 这个词在 Mac 上出 ⌘、其余平台出 Ctrl，同一份 `keys` 两边都对。

## 何时使用

- 给一个已有的动作再配一条键盘通路，并让用户看得见这条通路。
- 在菜单条目、按钮旁标出它的组合。
- 面板里列一张快捷键速查表。

## 何时不用

- 只想把一串命令或代码原样显示出来：用[代码视图](./code-view)。
- 只想在悬停时说明某个按钮做什么：用[文字提示](./tooltip)，快捷键至多是提示里的一句。
- 只需要一小块静态状态标记：用[徽标](./badge)。
- 想在一处收口整页的方向键导航：那是[工具条](./toolbar)、[菜单](./menu)这类组件自己的事，不要用快捷键去顶。

## 特性

- 平台写法只有两套：Mac 出 ⌘ ⇧ ⌥ ⌃ 且键帽连排，其余平台出 Ctrl Shift Alt 且用加号连接。
- 平台默认 `auto`，由适配器挂载后测出来传进来；服务端渲染那一帧按非 Mac 出，落地后自行换成实测值。
- 修饰键逐个全等比对：注册了 `Ctrl+S` 时按 `Ctrl+Shift+S` 不会命中，两条组合分得开。
- 命中后默认拦下浏览器的默认动作，`preventDefault` 可关。
- 组合里除 Shift 外没有别的修饰键时，落在输入框、文本域、可编辑区里的按键一律让给输入。
- 输入法组合期的按键不接：那段时间的按键是给候选框用的。
- 键帽与连接符的内容整份归组件所有：出多少枚、每一枚写什么由 `keys` 与平台算出来，写进容器里的东西会被替换掉，也收不到插槽内容。
- Web Components 的 `keys` 属性按逗号分隔，因此属性写法表达不出「逗号本身」这枚主键；`Mod+,` 这类组合改用 property 传数组。
- 键帽渲染与组合注册是两件事：只要注册、不要键帽，用 Vue 侧的 useHotkeys；组件本身就是它的消费者。
- 尺寸一轴与其余组件同源。

## 示例

### 基础用法

一组组合的键帽：Mod 在 Mac 上出 ⌘、其余平台出 Ctrl，平台由组件自己测出来

<XhDemo src="hotkeys/01-basic" />

### 平台写法

同一份 keys 两套写法：Mac 出符号且键帽连排，其余平台出单词并用加号连接

<XhDemo src="hotkeys/02-platform" />

### 尺寸

size 换的是字号与键帽的内边距，三档与其余控件同源

<XhDemo src="hotkeys/03-size" />

### 限定范围

target 写 parent 时只在组件所在的那一层容器里接组合，整页范围的组合不会互相抢

<XhDemo src="hotkeys/04-scoped" />

### 开关监听

enabled 关掉后组合不再触发，键帽也转成不可用的样子

<XhDemo src="hotkeys/05-toggle" />

### 只注册不显示

全局快捷键用 useHotkeys；键帽要不要出是另一件事，组件本身就是它的消费者

<XhDemo src="hotkeys/06-register-only" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hotkeys>` |
| Vue 组件 | `XhHotkeys` |
| 组合式函数 | `useHotkeys` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/hotkeys.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="hotkeys"`：**`root`** · `key` · `separator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` |  | 监听是否生效，缺省开启；关掉后组合不再触发，键帽也转成不可用的样子。 |
| `keys` | `string[]` |  | 组合里的各枚键，如 `['Mod', 'S']`。 'Mod' 在 Mac 上是 ⌘、其余平台是 Ctrl；'Shift' / 'Alt' / 'Ctrl' / 'Meta' 各自对应那一枚。 除修饰键外只能有一枚主键，多写的组合按不出来，也就永远不会命中。 |
| `onHotKey` | `(details: HotkeysTriggerDetails) => void` |  | 组合被按出来时的回调。 |
| `platform` | `HotkeysPlatform` |  | 按哪个平台的写法显示与解析。 缺省 'auto'：读 navigator 会在服务端渲染时炸，所以 headless 只认显式值， 由适配器挂载后测出来传进来；未落定前按非 Mac 出。 |
| `preventDefault` | `boolean` |  | 命中后拦下浏览器的默认动作，缺省开启（注册 Mod+S 就是为了不让浏览器弹保存）。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `target` | `HotkeysTarget` |  | 监听装在哪儿，缺省 'document'。 |
| `translations` | `Partial<HotkeysTranslations>` |  | 读屏文案覆盖。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hot-key` | `HotkeysTriggerDetails` | 组合被按出来；detail 为 `{ keys: string[], event: KeyboardEvent }` |

## connect API

`useHotkeys` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segments` | `readonly HotkeySegment[]` | 翻好的各枚键，顺序与 keys 一致；适配器照着它铺键帽。 |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `enabled` | `boolean` | 监听当前是否生效。 |
| `target` | `HotkeysTarget` | 监听该装在哪儿，适配器据此挑节点。 |
| `separator` | `string` | 两枚键帽之间的连接符；Mac 的写法里键帽直接连排，此时是空串。 |
| `segmentOf` | `(value: string) => HotkeySegment \| null` | 按 keys 里原样写的那个词取回这枚键；没有这枚键时为 null。 |
| `matches` | `(event: KeyboardEvent) => boolean` | 这次按键是否命中本组合（含输入法组合期与打字落点的排除）。 |
| `handleKeyDown` | `(event: KeyboardEvent) => void` | 适配器把它挂到监听节点的 keydown 上：命中即按 preventDefault 决定拦不拦，并回调 onHotKey。 |
| `getRootProps` | `() => T['element']` |  |
| `getKeyProps` | `(props: HotkeysKeyProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/TR/uievents/#event-type-keydown)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `keys 指定的组合` | enabled 未关，且不在输入法组合期 | 触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器的默认动作 |
| `keys 指定的组合` | 组合里没有 Ctrl / Meta / Alt，且按键落在输入框、文本域或可编辑区里 | 不触发也不拦：这类组合与打字撞车，输入优先 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | undefined \| translations?.hotkey?.(names) |
| `root` | `role` | undefined \| 'img' |

- 键帽整块对外是一张图（`role="img"`），名字由 `aria-label` 给：读屏念不出 ⌘ ⇧ 这类符号，逐枚念出来也不成句。
- 每一枚键的读法与整句的拼法都可以经 `translations` 换掉，内建的是英文。
- `keys` 空着时不出 `role`：一张没有名字的图，读屏只念得出「图像」两个字。按数据渲染速查表时某行没有组合，这一格就是个空容器。
- 监听关掉后键帽只是转成暗底，字仍然读得出：这块是说明性文字而不是失效控件，用户此刻要认的正是这几枚键。
- 快捷键不能是唯一路径：它对应的动作必须另有一个看得见、点得到的入口。只有键盘组合的功能，触屏用户与只用指点设备的用户根本够不着。
- 不要占用浏览器与读屏已有的组合。读屏在浏览模式下会先吃掉大量单键，`Ctrl+W`、`Ctrl+T`、`F5` 这类浏览器组合也拦不住或拦了就是伤害。带 `Alt` 的组合在 Mac 上会改写字符输入，也要避开。

## 样式

默认皮肤 `@xihan-ui/styles/hotkeys.css` 按部件选择：`[data-scope="hotkeys"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-size` | props.size |
| `key` | `data-modifier` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-hotkeys-fg` · `--xh-hotkeys-font-size` · `--xh-hotkeys-gap` · `--xh-hotkeys-key-bg` · `--xh-hotkeys-key-bg-disabled` · `--xh-hotkeys-key-border` · `--xh-hotkeys-key-fg` · `--xh-hotkeys-key-fg-modifier` · `--xh-hotkeys-key-font` · `--xh-hotkeys-key-font-weight` · `--xh-hotkeys-key-min-w` · `--xh-hotkeys-key-px` · `--xh-hotkeys-key-py` · `--xh-hotkeys-key-radius` · `--xh-hotkeys-key-shadow` · `--xh-hotkeys-separator-fg`

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 挂在[菜单](./menu)条目的右侧，或[按钮](./button)旁边，标出这个动作的组合。
- 放进[对话框](./dialog)里列一张速查表。
- 用[分隔线](./separator)把速查表按功能分段。

## 最佳实践

- 一律用 `Mod` 而不是写死 `Ctrl` 或 `Meta`：写死之后另一个平台上的用户看到的和按出来的对不上。
- 给单键组合（如 `?` 打开帮助）留一条别的入口，并注意它在输入区里不会触发。
- `target` 用 `parent` 把组合限制在一块面板内，避免整页范围的组合互相抢。
- 组合变了要同步改文档与提示，两处对不上比没有快捷键更糟。

## 反模式

- 一屏里挂十几组全局组合：记不住，还必然和浏览器或读屏撞车。
- 用快捷键替代按钮：功能藏进组合里，等于对触屏用户不存在。
- 只把组合写在帮助页里，界面上不显示：用户不会为了一次操作去翻文档。
