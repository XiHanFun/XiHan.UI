<div align="center">

<img src="./assets/logo.png" alt="XiHan.UI" width="120" />

<h1>XiHan.UI</h1>

<p><b>快速、轻量、高效、用心的跨框架组件库</b></p>

<p>曦寒界面存储库 · 无头内核 + Vue / Web Components 双适配器 · TypeScript Monorepo</p>

<p>
  <img alt="Status" src="https://img.shields.io/badge/Status-Experimental-orange?style=flat-square" />
  <img alt="Version" src="https://img.shields.io/badge/Version-unpublished-orange?style=flat-square" />
  <img alt="Components" src="https://img.shields.io/badge/Components-62-1f6feb?style=flat-square" />
</p>

<p>
  <a href="https://github.com/XiHanFun/XiHan.UI/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/XiHanFun/XiHan.UI?style=flat-square&logo=github&label=Stars&color=1f6feb" /></a>
  <a href="https://github.com/XiHanFun/XiHan.UI/network/members"><img alt="GitHub Forks" src="https://img.shields.io/github/forks/XiHanFun/XiHan.UI?style=flat-square&logo=github&label=Forks&color=1f6feb" /></a>
  <a href="https://gitee.com/XiHanFun/XiHan.UI"><img alt="Gitee Stars" src="https://gitee.com/XiHanFun/XiHan.UI/badge/star.svg" /></a>
  <a href="https://atomgit.com/XiHanFun/XiHan.UI"><img alt="AtomGit Stars" src="https://atomgit.com/XiHanFun/XiHan.UI/star/badge.svg" /></a>
</p>

<p>
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" />
</p>

<p>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/XiHanFun/XiHan.UI?style=flat-square&color=green" /></a>
  <a href="https://github.com/XiHanFun/XiHan.UI/commits"><img alt="Last Commit" src="https://img.shields.io/github/last-commit/XiHanFun/XiHan.UI?style=flat-square&color=blueviolet" /></a>
  <img alt="Commit Activity" src="https://img.shields.io/github/commit-activity/m/XiHanFun/XiHan.UI?style=flat-square" />
  <a href="https://github.com/XiHanFun/XiHan.UI/issues"><img alt="Issues" src="https://img.shields.io/github/issues/XiHanFun/XiHan.UI?style=flat-square" /></a>
  <a href="https://github.com/XiHanFun/XiHan.UI/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/XiHanFun/XiHan.UI?style=flat-square" /></a>
  <img alt="Repo Size" src="https://img.shields.io/github/repo-size/XiHanFun/XiHan.UI?style=flat-square" />
</p>

<p>
  <a href="https://deepwiki.com/XiHanFun/XiHan.UI"><img alt="Ask DeepWiki" src="https://deepwiki.com/badge.svg" /></a>
  <a href="https://docs.xihanfun.com"><img alt="Docs" src="https://img.shields.io/badge/Docs-docs.xihanfun.com-2496ED?style=flat-square&logo=readthedocs&logoColor=white" /></a>
  <a href="https://qm.qq.com/q/qYp1Urv3z2"><img alt="QQ Group" src="https://img.shields.io/badge/QQ_Group-462371834-EB1923?style=flat-square&logo=tencentqq&logoColor=white" /></a>
</p>

</div>

> **实验性项目**：62 个组件的内核、Vue 适配器、Web Components 适配器与默认皮肤均已实现，无障碍扫描跑在真实 Chromium 上，但**尚未发布到 npm、尚无文档站**，且首轮扫出的存量无障碍问题尚未修完。请勿在生产环境依赖。

## 📋 项目概况

XiHan.UI 是一个框架无关的组件库：状态与无障碍逻辑沉在无头内核，各框架只写一层薄适配器。

- **内核**：自研有限状态机 + 行为原语（焦点域、滚动锁、层栈、进出场），不依赖任何框架
- **适配器**：Vue 3 与 Web Components（自研响应式基类）两套，共用同一份内核与同一份一致性测试
- **样式**：`@xihan-ui/styled` 提供构建期 CSS 皮肤，令牌由 `@xihan-ui/system` 从 DTCG 源产出
- **架构**：pnpm workspace，`packages/*` + `tooling/*` + `apps/*` 三段
- **当前状态**：库包版本 `0.0.0`，尚未发布至 npm

### workspace 包（12 个）

| 包 | 职责 |
| --- | --- |
| `@xihan-ui/core` | 结构原语：anatomy / mergeProps / normalizeProps / Scope / context / id |
| `@xihan-ui/machine` | 状态机运行时：`createMachine` + 解释器契约 + 受控值绑定 |
| `@xihan-ui/behavior` | 行为原语：dismissable layer / focus scope / scroll lock / presence / collection / typeahead |
| `@xihan-ui/headless` | 62 个组件的 anatomy + machine + connect（无样式、无框架） |
| `@xihan-ui/vue` | Vue 3 适配器 |
| `@xihan-ui/wc` | Web Components 适配器 |
| `@xihan-ui/styled` | 默认皮肤（CSS，按 `@layer` 分层） |
| `@xihan-ui/system` | 设计令牌产物 + 主题运行时（明暗 / 密度 / 书写方向） |
| `@xihan-ui/position-floating-ui` | 浮层定位实现（唯一允许依赖 `@floating-ui/dom` 的包） |
| `@xihan-ui/ai` | AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store（零 DOM、零框架） |
| `@xihan-ui/markdown` | 流式 Markdown 渲染内核：增量切块 + 稳定 key + 消毒 |
| `@xihan-ui/icons` | 图标集 |

## 🧩 组件现状

62 个组件，每个都有 headless 内核 + Vue 组件 + 自定义元素 + 默认皮肤：

| 组 | 组件 |
| --- | --- |
| 浮层 | dialog · drawer · popover · tooltip · hover-card · tour |
| 导航 | menu · context-menu · menubar · navigation-menu · tabs · breadcrumb · pagination · steps · anchor · toolbar |
| 表单 | field · form · text-field · number-field · pin-input · tags-input · editable · file-upload |
| 选择 | checkbox · checkbox-group · radio-group · switch · toggle · toggle-group · select · combobox · listbox · cascader · transfer |
| 日期时间 | calendar · date-field · date-picker · time-field · time-picker |
| 取值 | slider · rating · color-picker |
| 数据 | table · tree · tree-select · virtualizer |
| 展示 | avatar · badge · image · carousel · accordion · collapsible · separator |
| 反馈 | toast · toaster · progress · loading-bar |
| 其他 | button · scroll-area · splitter · clipboard |

两个 playground 逐组件对照两套适配器的行为：`apps/playground-vue` 与 `apps/playground-wc`。

### 还没做的

- **文档站**：无（API 表、状态图、键盘表、令牌浏览器均未产出）
- **npm 发布**：未发布，本地用 `pnpm pack` 验证
- **组件文案国际化**：未落地，面向用户的字符串目前内置英文
- **令牌产物格式**：仅 CSS / JSON / TS 三种
- **AI 组件族**：协议内核与渲染内核已落地，Thread / Composer / CodeBlock 三件可用；
  MarkdownStream、Reasoning / ToolCall 折叠、工具审批、代码高亮精渲仍在做
- **企业业务组件**：未开始

## 📦 本地开发

```bash
cd ui
pnpm install --frozen-lockfile
pnpm dev          # 启动 playground
pnpm test         # 单元测试与一致性测试（jsdom）
pnpm test:browser # 真实 Chromium 里的无障碍扫描（需先 pnpm exec playwright install chromium）
pnpm typecheck
pnpm lint
pnpm boundaries   # 分层依赖门禁
pnpm build
```

要求 Node ≥ 24、pnpm ≥ 11。

## 🎯 项目目标

### 核心理念

- **快速**: 高性能的组件实现，优化渲染性能
- **轻量**: 按需加载，减少打包体积
- **高效**: 开发体验优化，提升开发效率
- **专业**: 企业级标准，满足复杂业务需求

## 🛠️ 技术架构

### 构建工具

- **Turborepo**: Monorepo 任务编排与增量构建
- **tsdown**: 库包打包（经 `@xihan-ui/build` 统一配置）
- **Vite**: playground 开发服务器

### 开发工具

- **TypeScript**: 类型系统，四层 tsconfig + project references
- **oxlint + ESLint**: 代码检查
- **Stylelint / Prettier**: 样式与格式化
- **dependency-cruiser**: 分层依赖门禁（唯一权威）
- **Vitest**: 单元测试与跨适配器一致性测试（jsdom）
- **@vitest/browser + Playwright + axe-core**: 真实 Chromium 里的无障碍扫描
- **size-limit**: 体积棘轮

### 发布流程

- **pnpm workspace**: 包管理，内部依赖一律 `workspace:*`，第三方版本统一走 catalog
- **changesets**: 已接入，`fixed` 版本组同步发布
- **GitHub Actions**: 已接入（lint → typecheck → boundaries → build → test → size）
- **npm**: 尚未发布

## 🤝 贡献指南

### 开发流程

1. Fork 项目到个人仓库
2. 创建功能分支
3. 完成开发和测试
4. 提交 Pull Request
5. 代码评审和合并

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 使用 TypeScript 编写代码
- 编写单元测试
- 更新相关文档

### 提交规范

- 使用 conventional commits 规范
- 提供清晰的提交信息
- 关联相关 Issue


## 支持&赞助

如果此项目对你的开发有助益，也欢迎请作者一杯咖啡。

官方赞助页 https://docs.xihanfun.com/cosmos/sponsor


## 版权&授权

Copyright (c) 2021-Present XiHanFun and contributors.

本项目采用 MIT 授权，详见 [License](./LICENSE)

XiHan.UI Logo、XiHan.UI名称、界面视觉设计与原创视觉表达归作者所有，第三方依赖和第三方服务分别遵循其各自授权与服务条款。

项目仅供学习参考，作者不承担任何软件的使用风险。
