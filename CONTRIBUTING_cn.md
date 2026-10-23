# 贡献指南

[English](./CONTRIBUTING.md) | **简体中文**

感谢你愿意为 XiHan.UI 出力。本文写给人看，讲清楚从拉代码到合入需要做什么；更细的规则（组件架构、样式约束、测试要求）在 [AGENTS.md](./AGENTS.md)，人和 AI 编程工具遵守的是同一套。

## 先开 Issue 的情况

下面几类改动请先开 Issue 讨论，确认方向后再动手：

- 新增组件或新增包；
- 删除或改名公开面：导出、props、事件、部件名、CSS 变量、自定义元素的标签与 attribute；
- 只为某一个适配器做的能力（三端齐备是默认要求）。

拼写、文档、明确的缺陷修复可以直接提 Pull Request。

## 准备环境

要求 Node.js ≥ 24、pnpm ≥ 11。仓库根没有 `package.json`：库在 `ui/`，文档站在 `docs/`。

```bash
cd ui
pnpm install --frozen-lockfile
pnpm build
```

`pnpm install` 会顺带装上 commit-msg 钩子。跑浏览器测试前先装一次 Chromium：

```bash
pnpm exec playwright install chromium
```

本地看文档站，需要先在 `ui/` 构建，再：

```bash
cd docs
pnpm install
pnpm dev
```

## 改动放在哪一层

| 内容 | 位置 |
| --- | --- |
| 跨组件、与框架无关的行为原语 | `ui/packages/engine/core` |
| 组件状态机、默认值、事件、键盘、ARIA、anatomy | `ui/packages/engine/headless/src/<组件>` |
| Vue / React / Web Components 桥接 | `ui/packages/adapters/<适配器>` |
| 设计令牌 | `ui/packages/design/tokens` |
| 默认皮肤 | `ui/packages/design/styles/css/<组件>.css` |
| 三端一致性套件 | `ui/tooling/testing/src/suites` |
| 文档示例 | `docs/.vitepress/demos/<组件>` |

两条原则：

- 三个适配器的 props、事件、部件、默认值和状态语义必须一致。共享的缺陷回到 Core 或 Headless 修，不在三个适配器里各打一次补丁。
- 皮肤只消费语义令牌、部件和状态属性，不写颜色、间距、圆角、阴影和时长的散值。

## 新组件

先用脚手架预演，确认所有登记点：

```bash
cd ui
pnpm new:component -- --list-categories
pnpm new:component -- <kebab-name> --label=<中文名> --category=<分类> --dry-run --show-hunks
```

确认无误后去掉 `--dry-run` 生成骨架，然后按这个顺序完成：Headless 契约与单测 → 三个适配器 → 皮肤 → 生成物（CEM、组件令牌、文档、公开面）→ 真实浏览器与三端一致性验证。

## 测试与门禁

在 `ui/` 下运行：

| 任务 | 命令 |
| --- | --- |
| 单元测试与一致性测试（jsdom） | `pnpm test` |
| 真实 Chromium 测试 | `pnpm test:browser`（`--list` 看分类，`--pkg=vue` 限定包） |
| 类型检查 | `pnpm typecheck` |
| Lint | `pnpm lint` |
| 结构门禁 | `pnpm gate`（`pnpm gate --list` 看模块，可以只跑相关模块） |
| 体积预算 | `pnpm size` |
| 全量构建 | `pnpm build` |

先跑与改动直接相关的测试，再跑 `pnpm gate` 和 `pnpm build`。改了文档还要在 `docs/` 下跑 `pnpm build`。

几条容易踩的约定：

- 生成文件（组件文档、CEM、无层 CSS、公开面基线等）由脚本从源文件生成，和源文件放在同一个提交里，不要手改生成结果。常用的是 `pnpm gen:docs`、`pnpm surface:update`、`pnpm --filter @xihan-ui/styles gen`。
- 视觉问题先写一条能复现失败的浏览器断言，再改实现。
- jsdom 不验证真实布局、动画和浮层几何，这些要在 Chromium 里断言。
- 不要为了让门禁变绿而放宽门禁或往例外表里加条目；确有必要时在 PR 里逐条说明理由。

## 提交

提交信息使用 Conventional Commits，说明用中文：

```text
<type>(<scope>): <中文说明>
```

- `type` 取 feat、fix、refactor、perf、docs、style、test、build、ci、chore、revert；`scope` 的推荐值见 [`ui/commitlint.config.js`](./ui/commitlint.config.js)。
- 一个组件或一个共享配方一个提交；契约、三端、测试、文档和生成物属于同一功能时放在同一个提交里。
- 破坏性变更在类型后加 `!`，例如 `feat(select)!: …`。
- 提交前跑一次 `git diff --check`。

## Changeset

发布包的行为、样式或公开面有变化时，在 `ui/` 下运行 `pnpm changeset` 添加记录：

- 缺陷修复用 patch，兼容的新增用 minor，删除或改名公开面用 major；
- 23 个公开包锁步发版，任何一个包的 major 都会带着全部包升主版本；
- 哪些改动算破坏性，以[版本与兼容性政策](./docs/guide/versioning.md)为准。

纯文档、测试和内部工具的改动不需要 changeset。

## Pull Request

- 从 `dev` 切分支，PR 也提到 `dev`；CI 在指向 `dev` 和 `main` 的 PR 上运行，并检查每条提交信息。
- 按 [PR 模板](./.github/PULL_REQUEST_TEMPLATE.md) 填写，「门禁看不住的改动」一节请认真对照：那几类改动脚本拦不住，只能靠评审读出来。
- 一个 PR 只做一件事；顺手发现的无关问题另开 Issue 或 PR。

## 许可

提交贡献即表示你同意以 [MIT 许可](./LICENSE) 发布你的改动。
