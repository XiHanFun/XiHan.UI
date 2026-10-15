来源：https://ui.docs.xihanfun.com/ai/design-md

# design.md

[`design.md`](https://ui.docs.xihanfun.com/design.md) 是给 AI 设计与编码工具读的设计语言文件，描述 XiHan.UI 缺省主题（浅色 · 舒适密度 · 基础对比度）的颜色、排版、间距、圆角、组件样式令牌与视觉规则，帮助工具生成符合 XiHan.UI 视觉体系的界面。

## 格式

文件遵循 [google-labs-code/design.md](https://github.com/google-labs-code/design.md) 规范，分两部分：

- **YAML 头**：机读令牌，包括 `colors`、`typography`、`rounded`、`spacing` 与 `components`。取值在构建时从 `@xihan-ui/tokens` 的 `tokens.json` 展开，不手抄，令牌改了它跟着改；组件条目引用前面的令牌，如 `{colors.primary}`、`{rounded.control}`。
- **正文**：按 Overview、Colors、Typography、Layout、Elevation & Depth、Shapes、Components、Do's and Don'ts 的顺序说明视觉规则，最后一节 Customization 说明怎样改品牌色、视觉环境与令牌。

正文是 [设计](/design/) 一册的浓缩：中性克制、边界由描边承担、4px 网格、圆角只有 control / surface / overlay 三个角色、阴影只表达抬升、组件按六个家族取样式。

## 使用方式

**在线读取**：让工具直接访问文件地址。

```text
阅读 https://ui.docs.xihanfun.com/design.md，按其中的 XiHan.UI 视觉语言生成界面。
```

**用 CLI 取**：工具不能访问网址时，用 [CLI](./cli) 输出同一份内容，版本与 CLI 一致。

```bash
npx -y @xihan-ui/cli design.md > DESIGN.md
```

**经 MCP 取**：接入 [MCP Server](./mcp) 后调用 `xihan_ui_design_md` 工具。

## 适用场景

- 让 AI 生成整页界面或页面草图时，作为视觉约束；
- 让设计类工具理解 XiHan.UI 的缺省主题与组件形态；
- 判断「这里该用什么颜色、圆角、阴影」这类视觉取舍。

design.md 只描述缺省主题。项目改过品牌色或令牌时，以项目里的令牌为准：用 `xihan-ui token <关键字>` 查令牌名，写代码时引用令牌而不是 design.md 里的取值。

## 相关

- [设计体系](/design/) · [设计令牌与主题](../guide/theme) · [主题设计器](/design/theme-designer)
- [For Agents](./agents) · [LLMs.txt](./llms)
