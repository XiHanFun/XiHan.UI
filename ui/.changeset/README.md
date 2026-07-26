# Changesets · 发布流程

版本与发布由 [changesets](https://github.com/changesets/changesets) 驱动。8 个公开包
（core / machine / behavior / system / headless / styled / vue / wc）经 `fixed` 组
**锁步同版**；私有包（testing / playground-* / tooling-*）不发布、不计版。

## 首个公开 alpha（M2-A7 · 8 包 → 1.0.0-alpha.0）

在 `ui/` 目录依次执行：

```bash
# 1) 一次性进入 alpha 预发布模式（生成 .changeset/pre.json）
pnpm changeset pre enter alpha

# 2) 应用版本：8 包 → 1.0.0-alpha.0，生成 CHANGELOG，更新内部依赖范围
pnpm version            # = changeset version

# 3) 提交版本改动（此 commit 不计入 M2-A2 的“无框架污染”审计，见 §19 M2）
git add -A && git commit -m "release: @xihan-ui/* 1.0.0-alpha.0"

# 4) 构建全部包并发布到 npm（需先 npm login；access=public 已在配置里）
pnpm release            # = turbo run build && changeset publish
```

> 发布（`changeset publish` / `npm publish`）是对外动作，请自行确认后执行。

## 后续

- alpha 迭代：`pnpm changeset`（写变更）→ `pnpm version` → 提交 → `pnpm release`。
- 转正式版：`pnpm changeset pre exit` → `pnpm version`（去掉 alpha 后缀）→ 提交 → `pnpm release`。
