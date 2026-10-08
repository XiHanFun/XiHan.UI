# AGENTS.md

本文件约束在 XiHan.UI 仓库内工作的 AI Agent。回答和提交说明使用中文；代码标识、公开 API 与标准术语保持英文。

## 仓库概览

XiHan.UI 是 pnpm + Turborepo 管理的多包组件库。组件行为由框架无关的 Core/Headless 提供，Vue、React 与 Web Components 适配器消费同一契约，DTCG 令牌和纯 CSS 皮肤负责表现。

### 技术栈

| 技术 | 要求 | 用途 |
| --- | --- | --- |
| Node.js | 24+ | 脚本、构建与测试 |
| pnpm | 11+ | 工作区包管理 |
| TypeScript | 6.x | 类型与源码 |
| Turborepo | 2.x | 构建编排 |
| Vue | 3.5+ | Vue 适配器 |
| React | 19+ | React 适配器 |
| Web Components | Light DOM | 原生适配器 |
| Vitest + Playwright | 4.x / 1.62+ | 单测、一致性与浏览器测试 |
| VitePress | 2.0（预发布） | 文档站，主题取 @xihanfun/vitepress-theme |

## 开始前必须做

1. 按任务读取对应技能：组件视觉、交互与文档呈现读取 `.agents/skills/component-design/SKILL.md`；组件实现与重构读取 `.agents/skills/component-development/SKILL.md`；三端接法与适配器差异读取 `.agents/skills/framework-adapters/SKILL.md`。
2. 同时涉及多个职责时加载对应多个技能，不要一次读取无关资料。
3. 检查当前分支、`git status` 和最近提交；保留用户已有改动。在 worktree 中还要按「分支与 worktree」核对分支分组和基线。
4. 先检查现有组件、Core 原语、Headless 契约、Family Recipe、令牌和门禁，确认没有重复建设。
5. 组件设计、样式修改和视觉重构必须读取 `.agents/skills/component-design/references/component-design.md`。

## 目录结构

```text
/
├─ AGENTS.md
├─ .agents/skills/                        # 按设计、开发和适配器分类的仓库技能
├─ .claude/skills -> ../.agents/skills    # Claude Code 技能兼容入口
├─ CLAUDE.md -> AGENTS.md                 # Claude Code 仓库指令入口
├─ docs/                                  # VitePress 文档站（独立 package.json）
└─ ui/                                    # pnpm monorepo 根
   ├─ packages/
   │  ├─ engine/
   │  │  ├─ core/                         # 运行时、状态机、共享行为与结构原语
   │  │  ├─ headless/                     # 组件状态、connect、anatomy、键盘与元数据
   │  │  ├─ motion/                       # 动效原语
   │  │  ├─ pointer/                      # 指针会话
   │  │  └─ position/                     # 浮层定位
   │  ├─ adapters/
   │  │  ├─ vue/
   │  │  ├─ react/
   │  │  └─ web-components/
   │  ├─ design/
   │  │  ├─ tokens/                       # DTCG 与生成令牌
   │  │  ├─ styles/                       # 共享 CSS 皮肤与组件槽
   │  │  └─ icons/
   │  └─ features/                        # 可选能力包
   ├─ tooling/                            # 测试运行时、门禁、共享配置
   └─ scripts/                            # 组件脚手架与文档生成器
```

仓库根没有 package.json。库命令在 `ui/` 执行，文档命令在 `docs/` 执行。

## 常用命令

### `ui/`

| 任务 | 命令 |
| --- | --- |
| 安装 | `pnpm install --frozen-lockfile` |
| 全量构建 | `pnpm build` |
| 类型检查 | `pnpm typecheck` |
| 单测 | `pnpm test` |
| 浏览器测试 | `pnpm test:browser` |
| 按分类跑浏览器测试 | `pnpm test:browser <分类…>`（`--list` 列出分类，`--pkg=vue` 限定包，逐包串行、worker 有上限） |
| Lint | `pnpm lint` |
| 主质量门禁 | `pnpm gate` |
| 按模块跑门禁 | `pnpm gate <模块…>`（`pnpm gate --list` 列出模块，`--keep-going` 跑完再汇总） |
| 文档契约检查 | `pnpm gate:docs` |
| CEM 检查 | `pnpm gate:cem` |
| CSS 生成物检查 | `pnpm gate:styled` |
| 公开面检查 | `pnpm gate:surface` |
| Web Components 示例 | `pnpm gate:demos` |
| React 示例类型（需先 build） | `pnpm gate:demo-types` |
| 生成组件文档 | `pnpm gen:docs` |
| 更新公开面基线 | `pnpm surface:update` |
| 查看组件分类 | `pnpm new:component -- --list-categories` |
| 新组件预演 | `pnpm new:component -- <kebab-name> --label=<中文名> --category=<id> --dry-run --show-hunks` |

### `docs/`

| 任务 | 命令 |
| --- | --- |
| 开发 | `pnpm dev` |
| 生产构建 | `pnpm build` |
| Lint | `pnpm lint` |

先跑与改动直接相关的最小测试，再跑主门禁和必要的全量构建。不要用覆盖率通过代替角色、名称、事件、焦点和真实浏览器断言。

## 构建顺序

- 修改 Core 后先构建 `@xihan-ui/core`。
- 修改 Headless 后先确保 Core 已构建，再构建 `@xihan-ui/headless`。
- 适配器、测试工具和文档可能读取共享 dist；重建共享 dist 时，不要并行运行这些消费者。
- `ui/` 下的 `pnpm build` 通过 Turbo 依赖处理完整顺序。
- 生成器输出必须与源文件同一提交，不得手改生成文件代替修改真源。

## 组件架构

### 行为归属

- Core：跨组件且框架无关的行为原语。
- Headless：组件状态机、默认值、事件、键盘、ARIA、anatomy 和 `connect`。
- Adapter：框架响应式、DOM 引用、Portal、原生监听与节点渲染。
- Styles：共享 CSS，只消费语义令牌、parts 和状态事实。

跨框架行为不得复制进适配器；样式不得反推业务状态。

### Headless 文件

组件目录通常包含：

```text
<component>/
├─ <component>.types.ts
├─ <component>.machine.ts       # 需要状态机时
├─ <component>.connect.ts
├─ <component>.anatomy.ts
├─ <component>.keyboard.ts
├─ <component>.meta.ts
├─ <component>.doc.md
└─ index.ts
```

简单展示组件可以没有 machine，但不能缺失 anatomy、connect、meta、keyboard、types 和文档契约。

### 适配器

- Vue、React 和 Web Components 的公开 props、事件、部件和默认值必须一致。
- React 使用函数组件与显式 props 类型。
- Vue 使用组合式和带类型 emits/slots。
- Web Components 使用作者提供的 Light DOM；作者节点用 `data-xh-part` 声明角色，升级后库写入 `data-scope`/`data-part`。
- 非冒泡事件使用原生监听，不假设框架合成事件等价。

### 样式

- 统一设计真源是 `.agents/skills/component-design/references/component-design.md`。
- 普通 control 使用 2px 圆角，surface 4px（含 RadioGroup segmented 形态 / Tabs segment 轨道），overlay 4px；pill 只给状态 chip 与一维对象，正方盒取 circle。
- 组件的缺省、下限与上限尺寸按设计真源 §6.8 取档，只经语义尺寸令牌：控件高 sm/md/lg 28/32/36（compact 24/28/32），md 缺省；字段缺省宽 16rem、压缩底线 12rem、上限 100%，放进 Field 即铺满；Tooltip / Popover 上限 20rem（size 16/20/24），菜单 10–20rem，候选面板与字段盒等宽，Dialog 上限 24/32/48rem，Drawer 16/20/28rem；滚动面限高只取 viewport-h-sm/md/lg（12/16/24rem）与 viewport-max-h，浮层取 overlay-max-h / overlay-menu-max-h；浮层上限再与可用区取 min。表里没有的尺寸先加语义令牌。
- 定尺离散 Action Control 使用统一按压反馈：120ms 换到 active 底，缩放取 `--xh-motion-scale-press`（缺省 1，只换面），释放 200ms 回到 rest；行级与 disclosure trigger 只换面，不允许零反馈。
- 动效按设计真源 §9 的角色取令牌：几何动画不用 `micro` / `enter` / `exit` 时长，有进场即有退场，初始内容不播进场；减弱动效去位移、留淡变；JS 动效只经 `@xihan-ui/motion`，不写固定毫秒。
- 禁止 glass 材质及兼容别名；锚定浮层走 frosted 配方（缺省是实体底 + 描边 + 一层柔和投影，透景只作主题档）；导航层在 `data-material="liquid"` 下可用 liquid（设计真源 §8.5），内容层、浮层与模态不用。
- 彩色面声明墨色域，中性描边与淡底取墨色比例；弹簧只用于手势松手与 liquid 档的切换、指示；断点按视口，低于断点用补集写法，不用容器查询。
- 边界只由描边承担：根面取描边（outline，缺省）/ 淡底（subtle）/ 无壳（ghost）之一；raised 必带 border-default；`--xh-border-subtle` 只作内部分隔。字段静息为 `--xh-bg-field` 淡底 + `--xh-border-control` + 无影，聚焦换承载面底 + 品牌描边、不画聚焦环。
- 只有 Button 缺省品牌实心；交互阶梯按承载面（白底 hover 100 → pressed 200，淡底 hover 200 → pressed 300）；`--xh-bg-brand-subtle` 专属选中 / 当前。
- 图表按数据任务与坐标系划分组件，同一标记的不同外观是样式轴，不另建组件；数据色只经 `--xh-chart-*` 语义层，图表文字不用系列色；不提供双 y 轴。
- 不写颜色、间距、圆角、阴影和动效散值；新增槽必须被真实消费并进入生成物。
- 亮色、暗色、comfortable/compact、RTL、粗指针、reduced motion、reduced transparency、forced colors 和 print 必须一起审查。

## 测试

- Headless 单测验证状态机、默认值、非法输入、事件和 DOM 投影。
- `@xihan-ui/testing` 一致性套件验证三端 anatomy、属性、事件、键盘和快照。
- jsdom 不验证真实布局、动画完成、Portal 几何和计算样式；这些必须用 Chromium。
- 浏览器测试优先断言可观察结果：角色、文本、焦点、尺寸、位置、opacity、transform 和生命周期。
- 视觉修复必须先增加能复现失败的断言，再修改实现。
- 查询优先使用 role、label、text 和 parts；仅在没有语义入口时使用测试 id。
- Fake timer 只在确实控制时间的测试内启用，并在测试后还原。

## 文档

- 文档顺序固定为：概述 → 用法 → 组件结构 → 示例 → 设计指引 → API 参考 → 无障碍 → 样式参考。
- 第一个示例必须以最少结构展示核心用途。
- 一个示例只证明一个意图，不为覆盖 API 保留重复示例。
- 组件总览使用独立极简预览。
- Props、事件、插槽、anatomy、键盘表、状态属性、CSS 变量和 CEM 必须由源码生成或校验。
- 生成 Markdown 中的 Vue/JSX 双花括号不得逐个转义；GitHub Pages 依赖 `docs/public/.nojekyll`。

## 新组件流程

1. 先执行脚手架 `--dry-run --show-hunks`，检查所有落点。
2. 使用正式命令生成骨架，不手工漏建登记点。
3. 先完成 Headless 契约和测试。
4. 再完成三个适配器和共享皮肤。
5. 生成 CEM、组件令牌、无层 CSS、文档和公开面。
6. 完成真实浏览器与三端一致性验证。
7. 添加 changeset，并按一个组件一个提交收口。

## 分支与 worktree

在主检出上的日常改动直接提交到当前分支（通常是 `dev`），不另开分支。新功能或并行开发开启 worktree 时，分支按用途分组命名，不保留工具生成的 `claude/<名>`、`codex/<名>` 等前缀：

| 分组 | 用途 | 分支名 |
| --- | --- | --- |
| `feat/` | 新组件、新能力、增强，以及重构、性能、文档、测试等非缺陷改动 | `feat/<worktree 名>`，如 `feat/confident-morse-925efe` |
| `fix/` | 缺陷修复 | `fix/<worktree 名>`，如 `fix/confident-morse-925efe` |
| `issue/` | 处理指定的 GitHub Issue | `issue/<编号>`，如 `issue/46` |
| `pr/` | 审阅或接手已有 Pull Request | 拉取他人 PR 审阅用 `pr/<编号>-review`；没有编号时用 `pr/<worktree 名>` |

- 任务对应 Issue 或 PR 编号时归入 `issue/`、`pr/` 并以编号命名；其余按改动性质取 `feat/` 或 `fix/`，后缀沿用 worktree 目录名。
- 进入 worktree 后先看 `git branch --show-current`。分支是工具生成的 `claude/<名>` 等形式时，在首次提交前就地改名：`git branch -m <分组>/<名>`；worktree 目录名不变。改名后上游若指向 `main` 等别的分支，执行 `git branch --unset-upstream`。分支已推送到远端时不改名，先向用户说明。
- 自行创建时直接带分组：`git worktree add -b feat/<名> .claude/worktrees/<名> dev`。审阅他人 PR 时先 `git fetch origin pull/<编号>/head:pr/<编号>-review`，再 `git worktree add .claude/worktrees/pr-<编号> pr/<编号>-review`。
- 基线默认是本地 `dev`；用户指定 `release/*` 时以其为准。工具从 `main` 或 `origin/main` 切出且还没有提交时，用 `git merge --ff-only dev` 对齐；不能快进就停下说明，不 reset。
- 一个 worktree 只承载一项任务、一条分支。并行任务会改到同一组件、同一共享配方、令牌或生成物（无层 CSS、CEM、公开面、组件文档）时，先说明冲突风险再动手。
- 新 worktree 没有 `node_modules` 和 dist：先在 `ui/` 执行 `pnpm install --frozen-lockfile` 和 `pnpm build`，改文档时再安装 `docs/` 依赖。
- turbo 本地缓存在各 worktree 之间共享；怀疑缓存命中掩盖了真实结果（如体积测量、跨包改名）时，用 `TURBO_FORCE=true pnpm build` 强制重建。
- worktree 分支的合并、推送、创建 PR 以及 worktree 和分支的删除，只在用户明确要求时执行。路径过长导致 `git worktree remove` 失败时，用 PowerShell `Remove-Item -LiteralPath "\\?\<worktree 绝对路径>" -Recurse -Force` 删除目录后再 `git worktree prune`。

## Git 与提交

- 保留用户已有和无关改动；不要 reset、checkout 或清理它们。
- 使用 Conventional Commits：`<type>(<scope>): <中文说明>`。
- 破坏性公开面使用 `!` 并添加 major changeset。
- 每个组件或每个共享配方独立提交；只有三端协议、测试和生成物为同一功能所必需时才放在同一提交。
- 不推送、不发布、不创建远程 PR，除非用户明确要求。
- 提交前检查 `git diff --check`、相关测试、`pnpm gate` 和生产构建。

## 禁止事项

- 不凭记忆猜组件 API、部件、事件或令牌。
- 不添加静默兜底和推测性兼容。
- 不在适配器实现共享行为。
- 不用 Tailwind 工具类或 CSS-in-JS 作为公共皮肤真源。
- 不复制第三方组件库运行时。
- 不通过放宽门禁掩盖生产实现问题。
- 不把测试、文档和生成物留给后续任务补齐。
