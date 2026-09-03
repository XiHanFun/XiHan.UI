# Changesets · 发布流程

版本与发布由 [changesets](https://github.com/changesets/changesets) 驱动。**18 个公开包**
（kernel / machine / behavior / motion / pointer / tokens / headless / styles / vue / web-components /
chat-stream / markdown / position / code-highlight / backgrounds / sound / icons / animations）
经 `fixed` 组**锁步同版**；私有包（testing / build / scripts / tsconfig / eslint-config /
stylelint-config）不发布、不计版。

新增一个对外发布的包时，除了建包本身，还要把它加进 `.changeset/config.json` 的 `fixed` 组——
漏了它就会自己走一套版本号，与其余包脱节。上面那份名单、提交 scope 表、体积限额表、两份仓库 README
的包表以及三个平台的 issue / PR 模板同样要一起加；`check-package-manifests` 逐张对账，
少一个包或多一个已退役的包都判失败，包缺 README 也判失败。

## 职责划分

| 动作 | 由谁做 |
| --- | --- |
| 写变更集、`changeset version` 定版本、生成 CHANGELOG | 人，在本地 |
| git tag、GitHub Release | 人，手工 |
| 发到 npm | `.github/workflows/release.yml` |

changesets 自己的打 tag 行为已用 `--no-git-tag` 关掉，所以不会再出现一个包一个
`@xihan-ui/xxx@x.y.z` tag；工作流里也没有创建 Release 的步骤。一次发版对应一个自己
起名的 tag（如 `v1.0.0-alpha.1`）和一篇自己写的 Release。

## 发一个版本

在 `ui/` 目录：

```bash
# 1) 写变更集（选包、选 patch/minor/major、写条目）
pnpm changeset

# 2) 应用版本：锁步同版，生成 CHANGELOG，更新内部依赖范围
pnpm run version            # = changeset version

# 3) 提交版本改动并推到 main
git add -A && git commit -m "release: @xihan-ui/* 1.0.0-alpha.1"
```

推到 `main` 之后，在仓库根打自己的 tag 触发发布：

```bash
git tag v1.0.0-alpha.1 && git push origin v1.0.0-alpha.1
```

`v*` tag 推上去后工作流构建、跑 publint / attw、把 npm 上还没有的版本发出去；
也可以在 Actions 页手动 `Run workflow`（`workflow_dispatch`）发布当前 `main`。
GitHub Release 之后自己在 Releases 页新建。

首个公开 alpha 之前执行过一次性的 `pnpm changeset pre enter alpha`（生成
`.changeset/pre.json`）；转正式版时执行 `pnpm changeset pre exit` 再走上面的流程，
版本号会去掉 alpha 后缀。

> 本地也能直接 `pnpm release` 发布（需先 npm login），但那样拿不到 npm provenance。
