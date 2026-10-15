来源：https://ui.docs.xihanfun.com/ai/llms

# LLMs.txt

文档站在构建时产出一组给大语言模型读的机读资产，内容与站点正文同源。AI 工具读取它们即可了解 XiHan.UI 的组件、API 与用法。

## 可用资源

| 文件 | 说明 |
| --- | --- |
| [llms.txt](https://ui.docs.xihanfun.com/llms.txt) | 索引：全部页面的标题、一句话摘要与地址，以及下列资产的入口 |
| [llms-full.txt](https://ui.docs.xihanfun.com/llms-full.txt) | 全站正文，组件示例已内联为 Vue 与 Web Components 源码 |
| [llms-components.txt](https://ui.docs.xihanfun.com/llms-components.txt) | 组件参考：部件、Props、事件、状态、键盘、数据属性、CSS 变量与示例 |
| [llms-guide.txt](https://ui.docs.xihanfun.com/llms-guide.txt) | 核心概念、适配器与服务运行时 |
| [llms-tokens.txt](https://ui.docs.xihanfun.com/llms-tokens.txt) | 设计令牌全表：名字、类型、缺省取值与改写档 |
| [design.md](https://ui.docs.xihanfun.com/design.md) | 缺省主题的设计语言，见 [design.md](./design-md) |
| [ai/SKILL.md](https://ui.docs.xihanfun.com/ai/SKILL.md) | 给 AI 编程工具的使用规范，见 [For Agents](./agents) |

**单页 Markdown**：任何一页的站点地址后加 `.md` 即可取到这一页的 Markdown，如 [components/select.md](https://ui.docs.xihanfun.com/components/select.md)、[guide/theme.md](https://ui.docs.xihanfun.com/guide/theme.md)。每页正文上方的「取本页 Markdown」也指向它。

`llms-full.txt` 体积较大，多数场景读 `llms.txt` 索引后按需取单页，或只取 `llms-components.txt` 中用到的组件。

## 在 AI 工具中使用

所有工具都可以用同一段提示词：

```text
阅读 https://ui.docs.xihanfun.com/llms.txt 了解 XiHan.UI，写 XiHan.UI 代码时按需读取其中列出的页面（站点地址后加 .md 取 Markdown），以文档为准，不要凭记忆写组件 API。
```

| 工具 | 做法 |
| --- | --- |
| Claude Code | 写进项目的 `CLAUDE.md`，或用 `/memory` 记下 |
| Cursor | 在对话中用 `@Docs` 添加 `https://ui.docs.xihanfun.com/llms.txt`，或写进 `.cursor/rules` |
| Codex | 写进项目的 `AGENTS.md` |
| GitHub Copilot | 写进 `.github/copilot-instructions.md` |
| Windsurf | 写进 `.windsurf/rules` |

能运行命令或接入 MCP 的工具，优先用 [CLI](./cli) 或 [MCP Server](./mcp)：数据离线且与项目版本一致，而文档站上的资产对应最新发布的版本。

## 相关

- [For Agents](./agents) · [MCP Server](./mcp) · [design.md](./design-md)
