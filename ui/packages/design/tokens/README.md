# @xihan-ui/tokens

设计令牌与主题运行时。DTCG 源产出三份等价产物：`tokens.css`（自带 `@layer`）、`tokens.json`、以及带类型的 TS 常量。主题控制器负责把 `data-theme` / `data-brand` / `data-density` / `data-contrast` / `dir` 写到根元素上。

**谁会装它**：要自定义主题、或只要令牌不要组件的人直接装它。

## 用法

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import '@xihan-ui/tokens/tokens.css'

createThemeController().setTheme('dark')
```

## 装

```bash
pnpm add @xihan-ui/tokens
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `design/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT

## px 与 rem 的口径

令牌里的长度只分两类，按「是否该随根字号缩放」定单位：

| 单位 | 给谁 | 例子 |
| --- | --- | --- |
| `px` | 不随根字号缩放的几何：描边、圆角、间距、控件高度、开关轨道、滑杆拇指、滚动条厚度、字形描边与字形尺寸 | `stroke.*`、`radius.*`、`space.*`、`control.h-*` / `box-*`、`switch.track-h-*`、`track.*`、`scrollbar.*`、`glyph.stroke-*` |
| `rem` | 随根字号缩放的排版量：字号、行宽（measure）、面板宽、抽屉厚度、最小宽 / 最大高 | `control.min-w`、`nav.link-max-w`、`viewport.max-h`、`overlay.*`（含 `sheet-w-*` / `drawer-w-*`） |

判据只有一条：用户把浏览器根字号从 16 调到 20，这个量该不该跟着变大。一段文字的读行宽该变（rem），一条 1px 描边和一个 32px 高的按钮不该变（px）。`em` 只给「跟着当前字号走」的字形档（`glyph.size-text`、`glyph.baseline-shift`）。断点 `breakpoint.*` 写 px：媒体查询里的 rem 按初始根字号算，两种写法等价，取可读的那种。

按口径已对齐的三组值（根字号 16 时像素不变）：

- `font-size.*` 七档是 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75），对应 12 / 13 / 14 / 16 / 18 / 22 / 28px。
- `glyph.size-sm/md/lg` 是 px（16 / 20 / 24），与单行控件三档对齐；`glyph.size-xl/2xl/3xl/4xl` 是 px（32 / 40 / 56 / 72）。`glyph.size-text` 仍是 `1em`。
- `control.action-size`（24px，compact 20px）与 `control.indicator-size`（16px，compact 14px）是 px：单行控件里的动作钮与指示器是控件几何。

## 单行控件本体的槽一律叫 control

组件级覆盖槽里，单行控件本体的高度槽统一叫 `--xh-<组件>-control-h`。只有部件在解剖里确实叫 `trigger` / `input` 时才用 `--xh-<组件>-trigger-h` / `--xh-<组件>-input-h`：前者是弹出型控件的触发钮（select / tree-select），后者是文本类控件里真正的 `<input>`（text-field / number-field / password-input / mention）。槽名与它落在的部件名必须一致，不能选择器写 `control`、槽名叫 `input-h`。
