# 图标集

`@xihan-ui/icons` 是一套结构化数据，不是 SVG 字符串，也不是字体。每枚图标是一条 `IconRecord`：名字、`viewBox`、若干节点，节点带标签与属性。

```ts
import { ArrowDownIcon } from "@xihan-ui/icons";

// { name: 'arrow-down', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: '…' } }] }
```

渲染端逐节点创建元素，运行期不经任何解析，因此不存在把外来字符串写入 `innerHTML` 的路径。这份数据框架无关，Vue、React、Web Components 适配器与不使用框架的场景消费同一份数据。

首方集覆盖中后台界面的常用语义，逐枚手绘、统一 24 网格与 2 粗描边：方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景。

它不打算成为穷尽的图标库。图标审美与授权属于使用者：使用 Lucide、Tabler、Bootstrap Icons 或自绘的图标集，把 SVG 目录交给下文的转换器即可。集合大小不影响产物：打包器逐枚判定未被引用并摇掉，只引用一枚就只承担一枚的体积。

## 组件自带的兜底字形

作者未向部件写入内容时，皮肤会绘制一个默认字形：多选框的勾、下拉框的箭头、清空按钮的叉、表头的排序方向、树的展开把手、数字框的加减号。这些图形不是字符，而是图标包中对应的 SVG：令牌 `--xh-glyph-mark-*` 的取值是 `url("data:image/svg+xml,…")`，皮肤把它用作 `mask-image`、以 `currentColor` 着色，因此随语气、悬停、禁用自动变色，与使用 `<XhIcon>` 绘制的结果一致。

| 令牌 | 取自 | 用途 |
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

### 替换方式

通道一：修改令牌。全局修改写在 `:root` 上，只改一块区域就写在该区域的容器上：它是普通的自定义属性，随 DOM 继承。取值是任意一张 SVG 的 `url()`，着色同样使用 `currentColor`：

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

遮罩只读取图形的不透明度，颜色由部件的 `color` 决定，因此 SVG 中的 `fill` / `stroke` 取值不影响结果。

通道二：自行放置节点。向该部件写入内容后，皮肤规则不再命中：它带有 `:empty` 守卫：

```vue
<XhSelectItemIndicator>
  <XhIcon :icon="CheckIcon" />
</XhSelectItemIndicator>
```

```html
<span data-xh-part="item-indicator"><svg data-xh-part="root">…</svg></span>
```

`:empty` 对空白文本同样敏感：HTML 中要写成 `<span data-xh-part="item-indicator"></span>`，标签之间不留换行。

有几处部件本身已有其他内容，`:empty` 恒不命中，只能使用通道一：checkbox-group 与 transfer 的全选格、field 与 fieldset 的必填星号。

json-viewer 键名后的冒号不在这一族中：它是 JSON 数据格式的语法字符，不是视觉标记。Kbd 的 `⌘` `⇧` 键名由 JS 渲染为文本，使用它自己的 `translations`。


## 把任意 SVG 目录转成图标集

包里带一个 `xihan-icons` 命令：

```bash
npx xihan-icons ./node_modules/lucide-static/icons --out src/icons.mjs --dts
```

产出一份运行期模块，每枚图标一个顶层 `export const`，可摇树；`--dts` 一并产出类型声明。之后照常使用：

```ts
import { ArrowDownIcon } from "./icons.mjs";
```

命令行参数：

| 参数 | 说明 |
| --- | --- |
| `<svg 目录>` | 必填。扫描该目录下的 `*.svg`，不递归 |
| `--out <文件>` | 产物路径，默认 `icons.mjs` |
| `--dts` | 一并产出同名 `.d.mts` |
| `--quiet` | 跳过的图标只列前 5 条 |

需要接入自己的构建脚本时使用 `@xihan-ui/icons/codegen`：

```js
import { ingestIconDir, renderModule } from "@xihan-ui/icons/codegen";

const { icons, skipped } = await ingestIconDir("./svg");
await writeFile("icons.mjs", renderModule(icons));
```

`ingestIconDir` 不中断：无法转换的图标收进 `skipped`（带文件名与原因）后继续，由调用方决定报告还是视为失败。

## 转换时丢弃的内容

图标名由文件名归一而来：小写、连字符分段。数字开头的（Bootstrap Icons 的 `0-circle`）会派生出不合法的导出标识符，前缀一个 `n` 归为 `n0-circle` → `N0CircleIcon`。重名的后来者被跳过而不是覆盖。

非 24 网格的源会就地归一到 `0 0 24 24`：坐标、描边宽度、半径一并按比例换算，不是只修改 `viewBox`。

外部图标集普遍带有与图标本身无关的内容，这些会被丢弃并逐条记入 `notes`：

- 根上的 `width` / `height` / `xmlns` / `version` / `xml:space` 等
- 任何节点上的 `class`（样式归皮肤）、`style`、`onclick` 等内联事件属性
- 白名单外的属性、取值不合规的属性
- `<title>` / `<desc>` / 许可注释

内联事件属性走同一条丢弃路径，源中的任何脚本都不会进入产物。

丢弃它们正是预期行为：尺寸由使用处决定，颜色使用 `currentColor`，无障碍名字由 `XhIcon` 的 `label` 提供。

## 无法转换时明确报错

属性层可以宽松，标签层不可以。宽松模式下以下几类仍然报错：

- `<use>`：外观依赖记录无法表达的外部引用
- `<text>` / `<tspan>` / 任何文本内容：记录没有文本变体，字体缺席时无法绘制
- `<style>` / `<image>` / `<script>`：使图标外观依赖记录之外的内容

接收这些会产出一枚绘制错误的图标，而绘制错误比缺少一枚更难发现，因此报错。CLI 逐条打印跳过的图标：静默缺少图标时使用者只会以为名字写错。

另一类会报错：源不是 24 网格且节点带 `transform`。正确归一需要先把变换乘入坐标，管线不做这件事，直接报告。

按三套真实图标集实测：

| 图标集 | 转成 | 跳过 |
| --- | --- | --- |
| Lucide 1.31.0 | 2025 / 2025 | 0 |
| Tabler 3.46.0（outline） | 5130 / 5130 | 0 |
| Bootstrap Icons 1.13.1 | 2077 / 2078 | 1（16 网格 + `transform`） |

## 首方集使用严格模式

本仓库 `src/svg` 下的图标由 `buildIconSet` 构建，任何属性不合规都直接失败：首方集的每一枚都由库自行绘制，不设宽松接收的余地。这条路径与上文的摄取管线共用同一套白名单与变换，只是不开启宽松开关。
