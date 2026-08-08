# @xihan-ui/icons

首方图标集。产物是结构化的 `IconRecord` 数据，运行期不经任何 HTML/XML 解析。

```ts
import { CheckIcon } from '@xihan-ui/icons'
```

每个图标是一个顶层 `export const`，值是纯对象字面量，打包器能逐个证明未被引用并摇掉。

## 目录

| 路径 | 内容 |
|---|---|
| `src/svg/*.svg` | 手画的源图标，24×24 网格、单色描边、`stroke-width="2"`、round 端点与连接 |
| `build/*.mjs` | 生成管线（零第三方依赖：自己的 SVG 标记扫描器 + 白名单 + 坐标归一 + 产物拼装） |
| `tests/*.spec.ts` | 对抗测试，按「输入这段 SVG，产出里不得出现 X」写，不引用管线内部函数 |
| `dist/` | 生成物：`index.mjs`、`index.d.mts`、`types.d.mts`、`types.mjs` |

`pnpm --filter @xihan-ui/icons build` 重跑管线。

## 记录形状

`IconRecord` 的真源在 `packages/core/src/types/icon.ts`。这个包不依赖 core，管线把那份文件逐字节复制成 `dist/types.d.mts`，测试断言两份一致。

```ts
interface IconRecord {
  name: string
  viewBox: string // 恒为 '0 0 24 24'
  attrs?: Record<string, string> // 根 <svg> 上的呈现属性，不含 width / height
  nodes: IconNode[] // { tag, attrs?, children? }，任意深度递归
}
```

## 管线的处置策略

两档，没有第三档：

- **构建期报错并中止**：白名单外的标签、属性名、属性值。静默丢弃会产出「看起来对但少一块」的图标。
- **静默丢弃**：注释、CDATA 壳、XML 声明、DOCTYPE、`<title>`、`<desc>`、空白文本，以及根 `<svg>` 上的 `width` / `height` / `xmlns*` / `version`。

`<title>` / `<desc>` 必须丢：可及名字只从 `IconProps.label` 来，记录里留一个 title 会与 `aria-label` 双重命名。

## 白名单

标签：`path` `circle` `ellipse` `rect` `line` `polyline` `polygon` `g` `defs` `clipPath` `mask` `linearGradient` `radialGradient` `stop`

属性按类目列（不按标签列）：几何、变换、填充描边、裁剪遮罩、渐变、`id`，另加只允许出现在根上的 `viewBox`。

点名挡掉的：一切 `on*`（按前缀，不按名单）、一切 `data-*`、一切 `aria-*`、`style`、`class`、`role`、`tabindex`、`xmlns`、`href` 与任何带 `:` 的名字。

取值层面：`javascript:` / `vbscript:` / `data:`（去掉全部空白与控制字符后判）；`url(` 之后必须紧跟 `#` 并闭合于第一个 `)`。

`id` 只有在同一条记录里被 `url(#id)` 引用时才留到产物里，且一律重写成 `xh-<图标名>-<序号>`，集合内不相交。

## 坐标归一

源 `viewBox` 不是 `0 0 24 24` 时，管线重写几何数值（`d` 逐命令、`points` 逐点对、`cx`/`x1`/`r`/`stroke-width` 等逐属性）而不是原样保留——`stroke-width` 的单位随 viewBox 缩放，不统一则同一个 `data-weight` 档位在不同图标上粗细不同。

只做等比缩放：非正方形 viewBox 报错。需要缩放且节点带 `transform` / `gradientTransform`，或出现单位随 `*Units` 属性变化的 `linearGradient` / `radialGradient` / `mask` / `clipPath` 时，管线报错，要求源先画到 24 网格上。

## 归一化不可逆

源 SVG → 记录不是逐字节可逆的：单引号变双引号、`<g></g>` 变 `<g/>`、注释消失、CDATA 壳消失。回归测试按语义断言（比对节点树），不按字节 diff 源文件。
