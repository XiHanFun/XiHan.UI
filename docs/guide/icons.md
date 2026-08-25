# 图标集

`@xihan-ui/icons` 是一套**结构化数据**，不是 SVG 字符串、也不是字体。每枚图标是一条 `IconRecord`：名字、`viewBox`、若干节点，节点带标签与属性。

```ts
import { ArrowDownIcon } from '@xihan-ui/icons'

// { name: 'arrow-down', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: '…' } }] }
```

渲染端逐节点建元素，运行期不经任何解析，也就不存在把外来字符串塞进 `innerHTML` 的那条路。这份数据框架无关，Vue 适配器、Web Components 适配器和不用框架的场景吃的是同一份。

首方集覆盖中后台界面的常用语义，逐枚手绘、统一 24 网格与 2 粗描边：方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景。

它不打算做成一套穷尽的图标库。图标审美与授权都属于使用者，我们不替你选——要用 Lucide、Tabler、Bootstrap Icons 还是你自己画的一套，把 SVG 目录交给下面的转换器就行。集合大小不影响你的产物：打包器逐枚证明未被引用并摇掉，只引一枚就只付一枚的体积。

## 组件自带的兜底字形

作者什么都不往部件里塞时，皮肤会替他画一个：多选框里的勾、下拉框的箭头、清空钮的叉、表头的排序方向、树的展开把手、数字框的加减号。这些图形不是字符，是图标包里对应的那枚 SVG：令牌 `--xh-glyph-mark-*` 的取值是 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色，于是随语气、悬停、禁用自动变色，与你用 `<XhIcon>` 画出来的一模一样。

| 令牌 | 取自 | 用在哪 |
| --- | --- | --- |
| `--xh-glyph-mark-check` | `check` | 各列表族的条目勾、多选框、树、穿梭框、表格勾选把手、步骤条已完成 |
| `--xh-glyph-mark-minus` | `minus` | 半选横杠；number-field 的减号 |
| `--xh-glyph-mark-plus` | `plus` | number-field 的加号、悬浮按钮 |
| `--xh-glyph-mark-close` | `x` | 清空钮、关闭钮、标签与文件条目的删除钮 |
| `--xh-glyph-mark-chevron-down` · `-up` · `-left` · `-right` | `chevron-*` | 展开箭头、树与侧栏的分支把手、轮播与穿梭框的翻页、回到顶部 |
| `--xh-glyph-mark-sort` · `-sort-asc` · `-sort-desc` | `arrow-up-down` / `arrow-up` / `arrow-down` | table 的排序方向 |
| `--xh-glyph-mark-info` · `-warning` | `info` / `triangle-alert` | 命令式 dialog / notification 的类型徽记，以及 toast 的状态字形 |
| `--xh-glyph-mark-zoom-in` · `-zoom-out` · `-rotate-left` · `-rotate-right` · `-flip-horizontal` · `-flip-vertical` | 同名图标 | image-viewer 的工具条 |
| `--xh-glyph-mark-required` | `'*'` | field · fieldset 的必填星号（这是文字，不是图标） |

### 换掉它们

**通道一：改令牌。** 全局改写在 `:root` 上，只改一块就写在那块的容器上——它是普通的自定义属性，跟着 DOM 继承走。取值是任意一张 SVG 的 `url()`，着色一样走 `currentColor`：

```css
:root {
  --xh-glyph-mark-check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E…%3C/svg%3E");
}

/* 只有这张表里的排序箭头换成实心三角 */
.report-table {
  --xh-glyph-mark-sort-asc: url("/icons/caret-up.svg");
  --xh-glyph-mark-sort-desc: url("/icons/caret-down.svg");
}
```

遮罩只看图形的不透明度，颜色由部件的 `color` 决定，所以 SVG 里 `fill` / `stroke` 写什么都行。

**通道二：自己放节点。** 往那个部件里写内容，皮肤那条规则就不命中——它带着 `:empty` 守卫：

```vue
<XhSelectItemIndicator>
  <XhIcon :icon="CheckIcon" />
</XhSelectItemIndicator>
```

```html
<span data-xh-part="item-indicator"><svg data-xh-part="root">…</svg></span>
```

注意 `:empty` 连空白文本都不放过：HTML 里要写成 `<span data-xh-part="item-indicator"></span>`，标签之间不留换行。

有几处的部件里本来就装着别的东西，`:empty` 恒不命中，只能走通道一：checkbox-group 与 transfer 的全选格、field 与 fieldset 的必填星号。

json-viewer 键名后面那个冒号不在这族里：它是 JSON 这个数据格式的语法字符，不是视觉标记。hotkeys 的 `⌘` `⇧` 键帽由 JS 渲染成文本，走它自己的 `translations`。


## 把任意 SVG 目录转成图标集

包里带一个 `xihan-icons` 命令：

```bash
npx xihan-icons ./node_modules/lucide-static/icons --out src/icons.mjs --dts
```

产出一份运行期模块，每枚图标一个顶层 `export const`，可摇树；`--dts` 一并产出类型声明。之后照常用：

```ts
import { ArrowDownIcon } from './icons.mjs'
```

命令行参数：

| 参数 | 说明 |
| --- | --- |
| `<svg 目录>` | 必填。扫这个目录下的 `*.svg`，不递归 |
| `--out <文件>` | 产物路径，默认 `icons.mjs` |
| `--dts` | 一并产出同名 `.d.mts` |
| `--quiet` | 跳过的图标只列前 5 条 |

想接进自己的构建脚本，就用 `@xihan-ui/icons/codegen`：

```js
import { ingestIconDir, renderModule } from '@xihan-ui/icons/codegen'

const { icons, skipped } = await ingestIconDir('./svg')
await writeFile('icons.mjs', renderModule(icons))
```

`ingestIconDir` 不掀桌：转不了的那枚收进 `skipped`（带文件名与原因）继续跑，由你决定是报告还是当作失败。

## 转换时会丢掉什么

图标名由文件名归一而来：小写、连字符分段。数字打头的（Bootstrap Icons 的 `0-circle`）会派生出不合法的导出标识符，前缀一个 `n` 收编成 `n0-circle` → `N0CircleIcon`。撞名的后来者被跳过而不是覆盖。

非 24 网格的源会就地归一到 `0 0 24 24`——坐标、描边宽度、半径一并按比例换算，不是简单改个 `viewBox`。

外部图标集普遍带着一堆与图标本身无关的东西，这些会被丢掉并逐条记进 `notes`：

- 根上的 `width` / `height` / `xmlns` / `version` / `xml:space` 等
- 任何节点上的 `class`（样式归皮肤）、`style`、`onclick` 这类内联事件属性
- 白名单外的属性、取值不合规的属性
- `<title>` / `<desc>` / 许可注释

内联事件属性走的是同一条「丢掉」的路，也就是说无论源里写了什么脚本，它都进不了产物。

丢掉它们正是想要的：尺寸由使用处决定，颜色走 `currentColor`，无障碍名字由 `XhIcon` 的 `label` 给。

## 转不了的，会明确报错

属性层可以宽松，标签层不行。宽松模式下这几类**照样报错**：

- **`<use>`**：它的样子依赖记录里表达不了的外部引用
- **`<text>` / `<tspan>` / 任何文本内容**：记录没有文本变体，字体不在也就画不出来
- **`<style>` / `<image>` / `<script>`**：让图标的样子依赖记录之外的东西

收下这些会产出一枚**画错的**图标，而画错比缺一枚更难被发现，所以报错。CLI 会把跳过的逐条打出来——默默少几枚，用的人只会以为自己名字写错了。

还有一类会报错：源不是 24 网格、同时节点上带 `transform`。这种要正确归一得先把变换乘进去，管线不做，直接说清楚。

按三套真实图标集实测：

| 图标集 | 转成 | 跳过 |
| --- | --- | --- |
| Lucide 1.31.0 | 2025 / 2025 | 0 |
| Tabler 3.46.0（outline） | 5130 / 5130 | 0 |
| Bootstrap Icons 1.13.1 | 2077 / 2078 | 1（16 网格 + `transform`） |

## 首方集走的是严格模式

本仓 `src/svg` 下的图标由 `buildIconSet` 构建，任何属性不合规都直接失败——首方集的每一枚都由我们自己画，写错就是写错，没有「宽松收下」的余地。这条路径与上面的摄取管线共用同一套白名单与变换，只是不开宽松开关。
