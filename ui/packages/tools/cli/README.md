# @xihan-ui/cli

XiHan.UI 的命令行与 MCP 服务端：把组件 API、文档、示例源码、设计令牌、design.md 与更新日志打包成随版本发布的离线数据，供 AI 编程工具与开发者查询。不联网，查到的内容与 CLI 的版本一致。

```bash
npx -y @xihan-ui/cli info select
```

## 版本对齐

`@xihan-ui/cli` 与其余 `@xihan-ui/*` 包同属一个版本组、始终同号。项目装的是哪一版，就用同号的 CLI：

```bash
npx -y @xihan-ui/cli@<版本> info select
```

在装了 XiHan.UI 的项目里运行时，CLI 会读取 `node_modules` 里的版本，与自身数据版本不一致时在 stderr 提示。

## 命令

| 命令 | 说明 |
| --- | --- |
| `list [--category <分类>] [--query <关键字>]` | 按分类列出组件 |
| `info <组件>` | 组件 API：产物、部件、Props、事件、插槽、状态、键盘 |
| `doc [<组件\|页面>]` | 完整文档，示例按写法内联；不带参数列出指南页 |
| `demo <组件> [<示例>]` | 列出示例或输出示例源码 |
| `token [<关键字>] [--component <组件>]` | 设计令牌与组件覆盖槽 |
| `parts <组件>` | 部件选择器、数据属性与覆盖槽 |
| `design.md` | 设计语言文档 |
| `changelog [<版本> [<版本>]] [--keyword <词>]` | 更新日志，两个版本时取区间 |
| `mcp` | 以 stdio 启动 MCP 服务端 |
| `setup --client <claude\|cursor\|vscode\|codex>` | 写入 MCP 配置与技能，可加 `--mode <mcp\|skill\|both>`、`--pin <版本>`、`--dry-run`、`--check` |

组件名可写标识（`date-picker`）、PascalCase（`DatePicker`）、导出名（`XhDatePickerRoot`）、标签（`xh-date-picker`）或中文名。全局选项：`--framework <vue|react|web-components>` 选示例写法（缺省取项目里装的适配器），`--format <markdown|json>` 选输出格式。

## MCP

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

工具：`xihan_ui_list`、`xihan_ui_info`、`xihan_ui_doc`、`xihan_ui_demo`、`xihan_ui_token`、`xihan_ui_parts`、`xihan_ui_design_md`、`xihan_ui_changelog`。提示词：`xihan-ui-expert`、`xihan-ui-page-generator`。

各客户端的配置写法与 `setup` 命令见 [MCP Server](https://ui.docs.xihanfun.com/ai/mcp)。

## 技能

包内 `skills/xihan-ui/SKILL.md` 是给 AI 编程工具的使用规范，`xihan-ui setup --mode skill` 把它写进项目。

## 许可

MIT
