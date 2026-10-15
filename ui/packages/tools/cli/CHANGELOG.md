# @xihan-ui/cli

## 4.2.0

### Minor Changes

- d7374f4: 新增 `@xihan-ui/cli`：XiHan.UI 的命令行与 MCP 服务端。组件 API（产物、部件、Props、条目数据、事件、插槽、React 专有属性、状态、connect API、键盘）、全部文档页、三种写法的示例源码、设计令牌、design.md 与更新日志随包离线发布，与同号的组件库版本一致。命令 `list` / `info` / `doc` / `demo` / `token` / `parts` / `design.md` / `changelog` 支持 markdown 与 json 输出；`mcp` 以 stdio 启动 MCP 服务端，提供 `xihan_ui_list`、`xihan_ui_info`、`xihan_ui_doc`、`xihan_ui_demo`、`xihan_ui_token`、`xihan_ui_parts`、`xihan_ui_design_md`、`xihan_ui_changelog` 八个工具与 `xihan-ui-expert`、`xihan-ui-page-generator` 两个提示词；`setup --client claude|cursor|vscode|codex` 把钉住版本的 MCP 配置与 XiHan.UI 使用技能写进项目。在装了 XiHan.UI 的项目里运行时按项目的适配器选示例写法，项目版本与 CLI 版本不一致时给出提示。
