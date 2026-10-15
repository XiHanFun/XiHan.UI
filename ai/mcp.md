来源：https://ui.docs.xihanfun.com/ai/mcp

# MCP Server

本页介绍如何通过 Model Context Protocol（MCP）在 AI 编程工具中使用 XiHan.UI。

## 什么是 MCP

[Model Context Protocol](https://modelcontextprotocol.io) 是一个开放协议，让 AI 模型调用外部工具与数据源。接入 XiHan.UI 的 MCP 服务端后，AI 写代码前可以直接查到组件的部件、Props、示例与令牌，而不是凭记忆猜。

## 官方 MCP Server

服务端由 [`@xihan-ui/cli`](./cli) 提供，命令是 `xihan-ui mcp`，走 stdio 传输。数据随 npm 包离线发布、不联网，内容与 CLI 的版本一致；CLI 与其余 `@xihan-ui/*` 包同属一个版本组，钉住与项目相同的版本号即可查到项目实际用的 API。

### 工具

| 工具 | 说明 |
| --- | --- |
| `xihan_ui_list` | 按分类列出组件：标识、中文名、Vue / React 根组件名、自定义元素标签 |
| `xihan_ui_info` | 组件 API：产物、部件、Props 与条目数据结构、事件、插槽、React 专有属性、状态、connect API、键盘 |
| `xihan_ui_doc` | 组件页或指南页的完整 Markdown，示例按所选写法内联；不传参数时列出指南页 |
| `xihan_ui_demo` | 列出组件的示例，或取某个示例在 Vue / React / Web Components 下的源码 |
| `xihan_ui_token` | 按名字查设计令牌及缺省取值，或列出某个组件的覆盖槽 |
| `xihan_ui_parts` | 样式钩子：部件选择器、数据属性与状态取值、ARIA、覆盖槽 |
| `xihan_ui_design_md` | 缺省主题的 [design.md](./design-md) |
| `xihan_ui_changelog` | 查某一版或两版之间的更新日志，可按组件名过滤 |

工具都是只读的。示例写法缺省取项目里装的适配器（`@xihan-ui/vue` / `@xihan-ui/react` / `@xihan-ui/web-components`），识别不到时为 Vue，每次调用也可以用 `framework` 参数指定。

### 提示词

| 提示词 | 说明 |
| --- | --- |
| `xihan-ui-expert` | 以 XiHan.UI 专家身份工作，内容就是 [使用技能](https://ui.docs.xihanfun.com/ai/SKILL.md) |
| `xihan-ui-page-generator` | 按描述用 XiHan.UI 组件搭一整页，参数 `description`（必填）与 `framework` |

### 配置

多数工具使用同一种写法，只是配置文件的位置不同：

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

`<版本>` 写项目里装的 XiHan.UI 版本（`npm view @xihan-ui/vue version` 或看 `package.json`）。省略版本号时 `npx` 取最新版，查到的 API 可能比项目里装的新。

需要 Node ≥ 18。

### 自动写入

在项目里运行 `setup`，它会读出项目里装的 XiHan.UI 版本，把钉住版本的配置写进对应文件，只改 `xihan-ui` 这一项，不动已有的其他服务。配置写在所在 git 仓库的根目录（不在仓库里时写在 `package.json` 所在目录）；前端放在 `frontend/` 这类一级子目录时，在仓库根运行也能读出版本：

```bash
npx -y @xihan-ui/cli setup --client claude                 # .mcp.json，并写入技能
npx -y @xihan-ui/cli setup --client cursor --mode mcp      # 只写 .cursor/mcp.json
npx -y @xihan-ui/cli setup --client vscode                 # .vscode/mcp.json
npx -y @xihan-ui/cli setup --client codex                  # 打印 ~/.codex/config.toml 片段
npx -y @xihan-ui/cli setup --client claude --dry-run       # 只打印，不写文件
npx -y @xihan-ui/cli setup --client claude --check         # 核对配置是否就绪、版本是否一致
```

`--mode` 取 `mcp`、`skill` 或 `both`（缺省）；`--pin <版本>` 显式指定版本。配置文件已存在但无法解析为 JSON（例如带注释）时，`setup` 不改动文件并给出提示，按 `--dry-run` 打印的片段手动合并即可。

## 在各工具中配置

### Claude Code

项目根目录的 `.mcp.json` 使用上面的通用写法，也可以用命令添加：

```bash
claude mcp add --scope project xihan-ui -- npx -y @xihan-ui/cli@<版本> mcp
```

Windows（非 WSL）上 Claude Code 需要经 `cmd /c` 调用 `npx`，`setup --client claude` 会自动写成这种形式：

```json
{
  "mcpServers": {
    "xihan-ui": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@xihan-ui/cli@<版本>", "mcp"]
    }
  }
}
```

### Cursor

写在项目的 `.cursor/mcp.json`（只对本项目生效）或用户目录的 `~/.cursor/mcp.json`，使用通用写法。

### VS Code

写在项目的 `.vscode/mcp.json`，顶层键是 `servers`，并标明传输类型：

```json
{
  "servers": {
    "xihan-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@xihan-ui/cli@<版本>", "mcp"]
    }
  }
}
```

### Codex

写在 `~/.codex/config.toml`：

```toml
[mcp_servers.xihan-ui]
command = "npx"
args = [
  "-y",
  "@xihan-ui/cli@<版本>",
  "mcp"
]
```

### Windsurf 与其他工具

Windsurf 写在 `~/.codeium/windsurf/mcp_config.json`，使用通用写法。其他支持 stdio MCP 的工具，按各自的配置位置填入同一组 `command` 与 `args` 即可。

## 备选：LLMs.txt

工具不支持 MCP、也不能运行命令时，让它读文档站的 [机读资产](./llms)：`https://ui.docs.xihanfun.com/llms.txt` 是索引，组件页在站点地址后加 `.md` 即可取到 Markdown。

## 相关

- [For Agents](./agents) · [CLI](./cli) · [LLMs.txt](./llms) · [design.md](./design-md)
