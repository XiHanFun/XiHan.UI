来源：https://ui.docs.xihanfun.com/ai/cli

# CLI

`@xihan-ui/cli` 是 XiHan.UI 的命令行工具：在终端里查组件 API、文档、示例源码、设计令牌与更新日志，也是 [MCP 服务端](./mcp) 的载体。

## 特点

- **离线**：组件元数据、全部文档页、示例源码、令牌、design.md 与更新日志随 npm 包发布，查询不联网。
- **与版本一致**：数据在发版时从组件源码与文档生成，CLI 与其余 `@xihan-ui/*` 包同号。在装了 XiHan.UI 的项目里运行时，CLI 读取 `node_modules` 里的版本，与自身不一致时在 stderr 提示改用同号的 CLI。
- **三种写法**：示例与文档可按 Vue、React、Web Components 输出，缺省取项目里装的适配器。
- **给机器读**：所有查询命令都可输出 JSON；查不到时给出候选。

## 安装

不安装，直接用 `npx`：

```bash
npx -y @xihan-ui/cli info select
```

按项目版本查询时钉住版本号：

```bash
npx -y @xihan-ui/cli@<版本> info select
```

也可以装进项目的开发依赖，版本随项目一起升级：

```bash
pnpm add -D @xihan-ui/cli
pnpm exec xihan-ui info select
```

需要 Node ≥ 18。

## 快速开始

```bash
xihan-ui list --category form          # 数据录入类组件
xihan-ui info DatePicker               # 组件 API
xihan-ui demo date-picker              # 列出示例
xihan-ui demo date-picker 2 --framework react   # 第二个示例的 React 写法
xihan-ui parts date-picker             # 样式钩子
xihan-ui token control-h               # 控件高令牌
xihan-ui doc guide/theme               # 指南页全文
```

## 命令

### 查询

| 命令 | 参数 | 说明 |
| --- | --- | --- |
| `list` | `--category <分类>` `--query <关键字>` | 按分类列出组件，含中文名、Vue / React 根组件名、自定义元素标签与状态 |
| `info` | `<组件>` | 组件 API：产物、部件、Props 与条目数据结构、事件、插槽、React 专有属性、状态、connect API、键盘 |
| `doc` | `[<组件\|页面>]` | 组件页或指南页的完整 Markdown，示例按写法内联；不带参数时列出全部指南页 |
| `demo` | `<组件> [<示例>]` | 不带示例时列出全部示例；示例可写序号、文件基名（`01-basic` 或 `basic`）或标题 |
| `token` | `[<关键字>]` `--component <组件>` | 按名字片段查全局令牌及缺省取值；`--component` 列该组件的覆盖槽；都不给时列出令牌族 |
| `parts` | `<组件>` | 部件选择器、数据属性与状态取值、ARIA、覆盖槽 |
| `design.md` | — | 缺省主题的 [design.md](./design-md) |
| `changelog` | `[<版本> [<版本>]]` `--keyword <词>` | 不带版本取最近一版；一个版本取这一版；两个版本取两者之间（不含较早的那一版）；`--keyword` 只留提到它的条目，可写组件名 |

### 集成

| 命令 | 参数 | 说明 |
| --- | --- | --- |
| `mcp` | — | 以 stdio 启动 MCP 服务端，见 [MCP Server](./mcp) |
| `setup` | `--client <claude\|cursor\|vscode\|codex>` `--mode <mcp\|skill\|both>` `--pin <版本>` `--dry-run` `--check` | 把钉住版本的 MCP 配置与使用技能写进项目 |

### 组件名

组件名可以写标识（`date-picker`）、PascalCase（`DatePicker`）、导出名（`XhDatePickerRoot`、`XhDatePickerTrigger`）、自定义元素标签（`xh-date-picker`）或中文名（`日期选择器`）。文档页写站内路径，如 `guide/theme`、`installation`、`adapters/react`。

## 全局选项

| 选项 | 说明 | 缺省 |
| --- | --- | --- |
| `--framework <vue\|react\|web-components>` | 示例写法，`wc` 是 `web-components` 的简写 | 项目里装的适配器，识别不到时为 `vue` |
| `--format <markdown\|json>` | 输出格式 | `markdown` |
| `-v, --version` | 打印版本 | — |
| `-h, --help` | 打印帮助 | — |

## 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 成功 |
| `1` | 查不到（stderr 给出候选）或配置核对未通过 |
| `2` | 用法错误：未知命令、缺参数、选项取值不合法 |

## 编程接口

包的主入口导出 `runCli`、`loadKnowledge`、`serveStdio`、`handleMessage` 以及 MCP 工具与提示词的定义 `TOOLS` / `PROMPTS`，可以在脚本里复用同一份离线数据。

## 相关

- [For Agents](./agents) · [MCP Server](./mcp) · [LLMs.txt](./llms)
