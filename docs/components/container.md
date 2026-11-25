# Container 容器

把页面内容收进居中限宽的版心，两侧留出随视口变宽的空白。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/container" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/container.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/container" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/container" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/container.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

内容收进居中的版心：铺满所在的行，宽到最大宽度档就停下，左右留出内衬

<XhDemo src="container/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="container"`：**`root`**

## 示例

### 最大宽度

sm / md / lg / xl 四档与同名断点同宽，full 不限宽；轨道比舞台宽，各档的起止边线错开成台阶，横向滚动看全

<XhDemo src="container/02-max-width" />

### 放进页面骨架

页头、内容与页脚各放一个同档的版心，三段的内容对齐到同一条边线；通栏的底色与分隔线留在布局各段上

<XhDemo src="container/03-page" />

## 设计指引

### 何时使用

- 页面正文、页头与页脚的内容需要对齐到同一条左右边线。
- 宽屏上正文铺满整行会让行过长，需要限定最大宽度并居中。

### 何时不用

- 搭建带页头、侧栏、内容和页脚的页面骨架使用[布局](./layout)；版心放进布局的内容区，约束其中的正文宽度。
- 沿一个方向排列、对齐子项使用[弹性布局](./flex)。
- 按行列排列子项使用[栅格](./grid)。
- 只限制一段说明文字的行宽时，使用[排印](./typography)自带的行宽上限。

### 特性

- `maxWidth` 取 `sm` / `md` / `lg` / `xl` 四档，与同名断点同宽；`full` 不限宽，只保留左右内衬。缺省 `lg`。
- 最大宽度含左右内衬，内容区的宽度为档位宽度减去两侧内衬。
- 左右内衬按视口分两档：窄于 `sm` 断点时较窄，达到 `sm` 断点后放宽。
- 版心只决定宽度与居中，不决定子项如何排列；内部排列交给[弹性布局](./flex)或[栅格](./grid)。
- 公开槽 `--xh-container-max-w` 与 `--xh-container-px` 写入后覆盖所有档位与视口档。

### 组合

- 页头、正文与页脚各放一个同档的版心，三段内容对齐到同一条边线。
- 放进[布局](./layout)的内容区，约束正文宽度；侧栏不受影响。

### 最佳实践

- 同一页面的各段使用同一档最大宽度，避免边线错位。
- 需要通栏背景时，背景写在版心外层的通栏元素上，版心只承载内容。

### 反模式

- 不要嵌套多层版心：内层的内衬会叠加在外层之上。
- 不要用固定宽度模拟版心：窄屏上会溢出视口。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-container>` |
| Vue 组件 | `XhContainer` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/container.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `maxWidth` | `ContainerMaxWidth` |  | 最大宽度档，缺省 lg。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhContainer` | `default` | — | 版心里的内容。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `maxWidth` | `ContainerMaxWidth` | 解析后的最大宽度档。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

- 版心不预设语义角色，也不可聚焦。页面主体或区块的地标由作者在版心内外自行声明，如 `<main>`、`<section>`。

## 样式参考

### 皮肤

`@xihan-ui/styles/container.css` 按 `[data-scope="container"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-container` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-max-width` | props.maxWidth |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-container-max-w` | `root` | `max-inline-size` | `default` | `--xh-_container-max-w` | container 的 root 部件 max-inline-size 覆盖槽。 |
| `--xh-container-px` | `root` | `padding-inline` | `default` | `--xh-_container-px` | container 的 root 部件 padding-inline 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### 响应式

皮肤按视口分档：`min-width: 640px`。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 居中与内衬使用逻辑方向属性，自动适配 RTL。
