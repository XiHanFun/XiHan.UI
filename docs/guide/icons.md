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

作者什么都不往指示器里塞时，皮肤会替他画一个：多选框里的勾、下拉框的箭头、表头的排序方向。这些字形不再散在各份皮肤里各写一遍，而是收在一族令牌上，改一处全库跟着走：

| 令牌 | 缺省 | 用在哪 |
| --- | --- | --- |
| `--xh-glyph-mark-check` | ✓ | cascader · checkbox · checkbox-group · combobox · listbox · popselect · select · transfer · tree |
| `--xh-glyph-mark-minus` | − | cascader · checkbox-group · transfer · tree 的半选 |
| `--xh-glyph-mark-caret-down` | ▾ | cascader · combobox · select 的展开箭头 |
| `--xh-glyph-mark-caret-right` | ▸ | json-viewer 的分支三角 |
| `--xh-glyph-mark-chevron-down` | ⌄ | accordion 的展开箭头 |
| `--xh-glyph-mark-close` | ✕ | combobox 的清空钮 |
| `--xh-glyph-mark-sort` · `-sort-asc` · `-sort-desc` | ↕ ↑ ↓ | table 的排序方向 |
| `--xh-glyph-mark-required` | * | field · fieldset 的必填星号 |

accordion 与 select 族用的是两种不同的下箭头（细弧的 `⌄` 与实心的 `▾`），这是既有观感、没有动它；想统一成一种，把两个令牌设成同一个值即可。

### 换掉它们

**通道一：改令牌。** 全局改写在 `:root` 上，只改一块就写在那块的容器上——它是普通的自定义属性，跟着 DOM 继承走：

```css
:root {
  --xh-glyph-mark-check: '✔';
}

/* 只有这张表里的排序箭头换成三角 */
.report-table {
  --xh-glyph-mark-sort-asc: '▲';
  --xh-glyph-mark-sort-desc: '▼';
}
```

取值就是 CSS `content` 的取值，所以也可以给一张图：`--xh-glyph-mark-check: url("data:image/svg+xml,…")`。图片不吃 `currentColor`，要让图形跟着语气变色请走通道二。

**通道二：自己放节点。** 往那个部件里写内容，皮肤那条规则就不命中——它带着 `:empty` 守卫：

```vue
<XhSelectItemIndicator>
  <XhIcon :icon="CheckIcon" />
</XhSelectItemIndicator>
```

```html
<span data-xh-part="item-indicator"><svg data-xh-part="root">…</svg></span>
```

有九处只走通道一：checkbox-group 与 transfer 的全选格、table 的排序钮、field 与 fieldset 的必填星号。它们的伪元素要么是方框本身、要么贴在一行文字后面，那个部件里本来就装着别的东西，`:empty` 恒不命中。在这几处要自己接管，把令牌设成 `none` 再把图形放进相应部件。

json-viewer 键名后面那个冒号不在这族里：它是 JSON 这个数据格式的语法字符，不是视觉标记。hotkeys 的 `⌘` `⇧` 键帽、image-viewer 工具条、以及命令式 toast / dialog 默认模板里的字形走的是另一条路——它们由 JS 渲染成文本，各有自己的覆盖口，不受这族令牌影响。

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
