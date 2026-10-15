来源：https://ui.docs.xihanfun.com/ai/agents

# For Agents

给 Claude Code、Cursor、Codex、GitHub Copilot 这类 AI 编程工具的入口：一段可以直接粘贴的提示词，加上 XiHan.UI 为 AI 准备的全部资料从哪里取。

## 复制这段提示词

把下面这段放进对话，或写进项目的 `AGENTS.md` / `CLAUDE.md` / `.cursor/rules`：

```text
这个项目用 XiHan.UI 写界面。写代码前先读这两份文档并按其中的规范执行：
- https://ui.docs.xihanfun.com/ai/agents.md
- https://ui.docs.xihanfun.com/ai/SKILL.md

XiHan.UI 的组件名、部件、Props 与设计令牌以项目里安装的版本为准，可能与你记得的不同，也不要套用别的组件库的 API。
不确定时用 CLI 查证（数据随包离线，版本与项目对齐）：
  npx -y @xihan-ui/cli info <组件>      组件 API
  npx -y @xihan-ui/cli demo <组件> 1    示例源码
  npx -y @xihan-ui/cli parts <组件>     样式钩子与覆盖槽
支持 MCP 时，运行 npx -y @xihan-ui/cli setup --client <claude|cursor|vscode|codex> 接入 XiHan.UI 的 MCP 服务端。
```

## Agent 能拿到什么

### CLI：离线、与版本一致的知识库

[`@xihan-ui/cli`](./cli) 把组件 API、全部文档页、三种写法的示例源码、设计令牌、design.md 与更新日志打包在 npm 包里，不联网，查到的内容与 CLI 的版本一致；它与其余 `@xihan-ui/*` 包同属一个版本组、始终同号。

```bash
npx -y @xihan-ui/cli list                     # 按分类列出组件
npx -y @xihan-ui/cli info select              # 产物、部件、Props、事件、插槽、状态、键盘
npx -y @xihan-ui/cli doc select --framework react   # 完整文档，示例按写法内联
npx -y @xihan-ui/cli demo select 1            # 示例源码
npx -y @xihan-ui/cli token bg-brand           # 设计令牌
npx -y @xihan-ui/cli parts select             # 部件选择器、数据属性与覆盖槽
npx -y @xihan-ui/cli design.md                # 设计语言
npx -y @xihan-ui/cli changelog 4.0.0 4.1.0    # 两版之间的变更
```

### MCP Server：把 CLI 接进 AI 工具

`xihan-ui mcp` 以 stdio 启动 [MCP 服务端](./mcp)，AI 工具可以直接调用 `xihan_ui_info`、`xihan_ui_demo`、`xihan_ui_token` 等工具，而不是靠记忆写代码。

```json
{
  "mcpServers": {
    "xihan-ui": {
      "command": "npx",
      "args": ["-y", "@xihan-ui/cli@<版本>", "mcp"]
    }
  }
}
```

`<版本>` 写项目里装的 XiHan.UI 版本。`npx -y @xihan-ui/cli setup --client claude` 会自动读出版本并写好配置。

### 技能：XiHan.UI 的使用规范

[`SKILL.md`](https://ui.docs.xihanfun.com/ai/SKILL.md) 是写给 AI 的使用规范：先查证再写代码、包怎么装与接入、部件组件怎么组合、样式只走部件选择器与令牌、常见错误。它随 CLI 发布，`setup --mode skill` 把它写进项目：Claude Code 写到 `.claude/skills/xihan-ui/`，其余工具写到 `.agents/skills/xihan-ui/`。MCP 提示词 `xihan-ui-expert` 用的也是这一份。

### LLMs.txt：直接放进上下文的文档

文档站构建时产出 [机读资产](./llms)：`llms.txt` 索引、`llms-full.txt` 全站正文、`llms-components.txt` 组件参考、`llms-tokens.txt` 令牌全表，以及每一页的 Markdown（站点地址后加 `.md`，如 [components/select.md](https://ui.docs.xihanfun.com/components/select.md)）。

### design.md：给 AI 设计工具的视觉语言

[`design.md`](./design-md) 用 design.md 格式描述缺省主题的颜色、排版、间距、圆角与组件样式令牌，以及视觉规则与禁忌，供生成整页界面时参考。

## 各部分的关系

| 部分 | 回答什么 | 什么时候用 |
| --- | --- | --- |
| 提示词与技能 | 规范：该怎么写、不该怎么写 | 每次会话开头，或长期写进项目的 Agent 规则 |
| CLI | 事实：某个组件现在有哪些部件、Props、令牌 | 写每一处组件代码之前 |
| MCP Server | 同上，以工具的形式交给 AI | AI 工具支持 MCP 时，替代手动跑 CLI |
| LLMs.txt | 整份文档 | 工具不能运行命令、只能读网页时 |
| design.md | 视觉语言 | 生成整页界面、做视觉取舍时 |

CLI、MCP 与技能都离线且跟随版本；LLMs.txt 与 design.md 在文档站上，内容对应最新发布的版本。

## 相关

- [安装与接入](../installation) · [快速上手](../quickstart)
- [皮肤与样式分层](../guide/styling) · [设计令牌与主题](../guide/theme)
