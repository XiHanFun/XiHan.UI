---
name: xihan-ui-changelog-collect
description: 收集 XiHan.UI 两个版本或引用之间的用户可感知变化、核对 changeset 或更新 docs/changelog.md 时使用。它不提升版本、不消费 changeset，也不发布 npm 包。
---

# XiHan.UI 变更日志整理

## 事实源

- 用户指定的起止 tag/commit；未指定终点时使用当前 HEAD，未指定起点时先提出最近正式 tag 供确认。
- `git log <from>..<to>`、实际 diff、合入 PR 和 `ui/.changeset/*.md`。
- `docs/changelog.md` 的现有分类、语气和升级须知格式。

## 收录规则

- 只收录组件使用者和包消费者可感知的新增、修复、优化、调整、移除。
- 内部重构、纯测试、CI、门禁和工具更新不单独列出，除非改变公开产物或使用方式。
- 每条说明用户得到或需要处理什么，不描述“传参数、改文件、加判断”等内部步骤。
- 写明组件或包名；props、事件、parts、导出和令牌使用反引号。
- 破坏性 API、默认值、状态语义和包入口变化置于“升级须知”，给出明确迁移方式。
- 同一变化跨 Core、Headless、三端和样式时合并成一个用户结果，不拆成实现清单。

更新发布日志时新增 `## vX.Y.Z (YYYY-MM-DD)`，沿用已有分类。changeset 是逐变更发布输入，`docs/changelog.md` 是版本级摘要；两者要相互核对但不能用本技能运行 `pnpm version`、删除 changeset 或改变版本号。
