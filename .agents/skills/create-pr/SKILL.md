---
name: xihan-ui-create-pr
description: 为 XiHan.UI 准备、审查或创建 Pull Request 时使用。适用于生成 PR 标题与正文、比较当前分支和基线、填写仓库模板或执行 gh pr create；普通代码审查不使用。
---

# XiHan.UI 创建 PR

## 前置检查

- 读取 `git status --short --branch`；存在 rebase、merge、未解决冲突或 detached HEAD 时，不创建 PR。
- 根据用户意图、当前分支上游和远端分支确定 base；普通开发通常面向 `dev`，不得无依据改成 `main`。
- 使用 `git log <base>..HEAD`、`git diff --stat <base>...HEAD` 和完整 diff 总结整条分支，不只看最后一个提交。
- 检查提交信息、changeset、公开面、生成物、文档和测试是否与实际变更一致。

## PR 内容

严格使用 `.github/PULL_REQUEST_TEMPLATE.md`，保留“关联 Issue、变更类型、变更说明、影响范围、自测清单、门禁看不住的改动、破坏性变更、补充说明/截图”结构。

- 标题使用 Conventional Commit 形态并准确概括用户影响。
- 影响范围列出包、组件和适配器，不堆文件名。
- 只有实际执行过的检查才能勾选；未运行或失败的检查写明原因。
- 公开面变化必须有正确级别 changeset；破坏性变化列出迁移方式。
- 状态词表、截图基线、内建动效/音效名称和门禁 allowlist 的变化必须按模板逐项解释。

只要求草稿时只输出标题和正文，不写远程。明确要求创建 PR 时，确认分支已推送后使用 `gh pr create`；可以推送当前分支，但禁止 force push、合并或修改其他远端状态。创建后返回 PR 链接。
