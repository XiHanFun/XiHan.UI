# Kbd <Badge type="info" text="键帽" />

显示一枚语义键帽，不注册任何键盘监听。`Mod` 会按平台写成 Mac 的 ⌘ 或其他平台的 Ctrl；要显示完整组合用[键帽组](./kbd-group)，要注册动作另用[快捷键](./hotkeys)。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单枚原生 kbd，只显示键名，不注册快捷键

<XhDemo src="kbd/01-basic" />

## 示例

### 尺寸

三档同时调整键帽字号与行内留白

<XhDemo src="kbd/02-size" />

### 禁用

只表达对应动作不可用，不会降低整段文字的不透明度

<XhDemo src="kbd/03-disabled" />

### 真实按下

键帽只在可交互 owner 真正 active 时轻压

<XhDemo src="kbd/04-pressed" />

## 设计指引

### 何时使用

- 在说明文字里表示一枚键。
- 需要单独控制一枚键帽的尺寸、禁用或真实按下反馈。

### 何时不用

- 显示完整快捷键组合：用[键帽组](./kbd-group)，让读屏只念一次整组。
- 注册快捷键动作：用[快捷键](./hotkeys)，不要给纯展示节点安装全局监听。
- 显示代码或命令文本：用[代码视图](./code-view)。

### 特性

- 使用原生 `kbd` 语义，平台格式化唯一事实源在 Headless。
- `pressed` 只投影作者已知的真实激活事实；组件不会自己监听键盘，也不会默认制造按下态。
- M1 实体小表面使用 1px 边、顶部高光和底部 contact shadow；按下时轻压并撤掉海拔。
- compact 密度、三尺寸、RTL、forced-colors 和 200% 缩放均保持键名清楚。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-kbd>` |
| Vue 组件 | `XhKbd` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/kbd.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="kbd"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 这枚键所提示的动作是否不可用。 |
| `platform` | `HotkeysPlatform` |  | 平台写法；auto 在适配器测出平台前按 other。 |
| `pressed` | `boolean` |  | 这枚键是否正在被真实动作激活；纯展示默认静止。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<KbdTranslations>` |  | 读屏键名覆盖。 |
| `value` | `string` | 是 | 一枚键的声明，例如 Mod、Shift、Esc 或 S。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segment` | `HotkeySegment` | 归一化后的键。 |
| `label` | `string` | 键帽可见文本。 |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.keyName?.(segment.key) |

- 符号键帽通过 `aria-label` 使用可读键名；例如 ⌘ 念作 Command。
- 单枚键帽可独立进入无障碍树；在 KbdGroup 内由组级名称统一朗读，子键帽会被隐藏。

## 样式

默认皮肤 `@xihan-ui/styles/kbd.css` 按部件选择：`[data-scope="kbd"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-modifier` | ''（条件成立时才出现） |
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-bg` | `root` | `background` | `default` | `--xh-material-soft-bg` | kbd 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-bg-disabled` | `root` | `background` | `disabled` | `--xh-bg-muted` | kbd 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-border` | `root` | `border` | `default` | `--xh-material-soft-border` | kbd 的 root 部件 border 覆盖槽。 |
| `--xh-kbd-fg` | `root` | `color` | `default` | `--xh-fg-default` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-fg-disabled` | `root` | `color` | `disabled` | `--xh-fg-subtle` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-fg-modifier` | `root` | `color` | `modifier` | `--xh-fg-muted` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-font` | `root` | `font-family` | `default` | `--xh-font-family-mono` | kbd 的 root 部件 font-family 覆盖槽。 |
| `--xh-kbd-font-size` | `root` | `font-size` | `default` | `--xh-_kbd-font-size` | kbd 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd 的 root 部件 font-weight 覆盖槽。 |
| `--xh-kbd-min-w` | `root` | `min-inline-size` | `default` | `--xh-control-indicator-size` | kbd 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-px` | `root` | `padding-inline` | `default` | `--xh-_kbd-px` | kbd 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-py` | `root` | `padding-block` | `default` | `--xh-space-0_5` | kbd 的 root 部件 padding-block 覆盖槽。 |
| `--xh-kbd-radius` | `root` | `border-radius` | `default` | `--xh-shape-inset` | kbd 的 root 部件 border-radius 覆盖槽。 |
| `--xh-kbd-shadow` | `root` | `box-shadow` | `default` | `--xh-stroke-thin` | kbd 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-shadow-pressed` | `root` | `box-shadow` | `active`<br>`disabled`<br>`is(button, a[href], [role='button'], [role='menuitem'], [role='option'])`<br>`not([data-disabled])`<br>`not([disabled], [aria-disabled='true'])`<br>`pressed` | `--xh-stroke-thin` | kbd 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background-color` · `border-color` · `box-shadow` · `color` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与按钮、菜单条目或说明文字并排。
- 多枚键必须使用 KbdGroup，不要手写多个 `kbd` 再让读屏逐枚重复。

## 最佳实践

- 跨平台快捷键写 `Mod`，不要把 Ctrl 或 Meta 写死。
- 只有动作真实触发期间才设置 `pressed`。

## 反模式

- 用键帽替代实际按钮或菜单项。
- 给纯展示 Kbd 安装键盘监听。
