# 图标集

`@xihan-ui/icons` 是一套**结构化数据**，不是 SVG 字符串、也不是字体。每枚图标是一条 `IconRecord`：名字、`viewBox`、若干节点，节点带标签与属性。

```ts
import { ArrowDownIcon } from '@xihan-ui/icons'

// { name: 'arrow-down', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: '…' } }] }
```

渲染端逐节点建元素，运行期不经任何解析，也就不存在把外来字符串塞进 `innerHTML` 的那条路。这份数据框架无关，Vue 适配器、Web Components 适配器和不用框架的场景吃的是同一份。

首方集是**小而准**的：只收组件自身用得上的那些。图标审美与授权都属于使用者，我们不替你选。要用 Lucide、Tabler、Bootstrap Icons 还是你自己画的一套，把 SVG 目录交给转换器就行。

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
