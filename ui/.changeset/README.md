# Changesets · 发布流程

版本与发布由 [changesets](https://github.com/changesets/changesets) 驱动。**13 个公开包**
（core / machine / behavior / system / headless / styled / vue / wc / ai / markdown / position / highlight / visual）
经 `fixed` 组**锁步同版**；私有包（testing / playground-* / tooling-*）不发布、不计版。

新增一个对外发布的包时，除了建包本身，还要把它加进 `.changeset/config.json` 的 `fixed` 组——
漏了它就会自己走一套版本号，与其余包脱节。

## 首个公开 alpha（13 包 → 1.0.0-alpha.0）

在 `ui/` 目录依次执行：

```bash
# 1) 一次性进入 alpha 预发布模式（生成 .changeset/pre.json）
pnpm changeset pre enter alpha

# 2) 应用版本：13 包 → 1.0.0-alpha.0，生成 CHANGELOG，更新内部依赖范围
pnpm run version            # = changeset version

# 3) 提交版本改动
git add -A && git commit -m "release: @xihan-ui/* 1.0.0-alpha.0"

# 4) 构建全部包并发布到 npm（需先 npm login；access=public 已在配置里）
pnpm release            # = turbo run build && changeset publish
```

> 发布（`changeset publish` / `npm publish`）是对外动作，请自行确认后执行。

## 后续

- alpha 迭代：`pnpm changeset`（写变更）→ `pnpm run version` → 提交 → `pnpm release`。
- 转正式版：`pnpm changeset pre exit` → `pnpm run version`（去掉 alpha 后缀）→ 提交 → `pnpm release`。
