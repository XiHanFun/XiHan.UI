---
name: xihan-ui-version-release
description: 为 XiHan.UI 准备版本、消费 changeset、校验发布产物、打版本标签或发布 npm 包时使用。只有用户明确要求实际发布时才允许推送标签或触发 Release 工作流。
---

# XiHan.UI 版本发布

## 前置条件

- 工作区必须无冲突、无进行中的 merge/rebase、分支与目标版本明确；detached HEAD 不发版。
- 版本真源是锁步 fixed 组中的包版本，发布计划来自 `ui/.changeset` 和 `.changeset/pre.json`。
- `docs/changelog.md` 是版本级用户摘要，不代替 changeset。
- 标签格式为 `vX.Y.Z[-tag.N]`，且标签提交必须位于 `main` 历史；`release.yml` 会拒绝其他提交。

## 准备版本

1. 核对从上一 tag 到当前提交的 changeset、公开面和破坏性变化。
2. 在仓库根运行交互脚本 `pwsh -File ui/scripts/release/VersionUpgrade.ps1`；不替用户预选版本级别或预发布通道。
3. 检查所有 fixed 包同版、包 CHANGELOG、已消费 changeset 和生成物。
4. 在 `ui/` 运行 `pnpm build`、`pnpm gate`、`pnpm gate:publish` 及必要浏览器测试。
5. 版本提交使用 `build: vX.Y.Z`，随后合入 `main`。

## 发布

只有用户明确要求发布，才可在确认提交位于 `main` 后创建并推送 `vX.Y.Z` 标签。标签触发 `.github/workflows/release.yml`，该工作流只做发布：重新构建、核对标签与预发布模式、执行 npm 发布；门禁、测试与 publint / attw 由 `ci.yml` 在提交进 `main` 时完成，发布链不再重跑。

发布后核对 npm 版本和工作流结果，再用独立 docs 提交补 `docs/changelog.md`。不手工修改 dist、不跳过失败门禁、不重复发布已存在版本；失败时停止并报告，不移动标签掩盖问题。
