---
name: xihan-ui-commit-msg
description: 根据 XiHan.UI 当前暂存区生成一行提交信息时使用。适用于“提交信息”“commit msg”“msg”或提交前概括 staged changes；只生成消息，不负责暂存、解决冲突或执行提交。
---

# XiHan.UI 提交信息

## 工作流

1. 运行 `git status --short --branch`，存在未解决冲突时停止并指出冲突，不生成假定已完成的提交信息。
2. 只读取 `git diff --cached --stat`、`git diff --cached` 和最近 20 条提交；未暂存内容不纳入，除非用户明确要求。
3. 暂存区为空时直接说明，不能根据工作区或聊天内容猜消息。
4. 将全部暂存改动归纳为一个意图，输出一行 Conventional Commit。

格式：`<type>(<scope>): <中文说明>`。允许的 type 为 `feat`、`fix`、`refactor`、`perf`、`docs`、`style`、`test`、`build`、`ci`、`chore`、`revert`。

scope 优先使用 `core`、`headless`、`vue`、`react`、`web-components`、`styles`、`tokens`、`icons`、`motion`、`position`、`pointer`、`tooling`、`docs` 或明确组件名；跨多个必要层时可组合 scope，不逐文件罗列。

删除或改变公开 API、props、事件、parts、包入口和默认行为时使用 `!`。只要求消息时，最终只输出提交标题，不附解释、代码块或候选列表。
