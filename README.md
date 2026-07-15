<div align="center">

<img src="./assets/logo.png" alt="XiHan.UI" width="120" />

<h1>XiHan.UI</h1>

<p><b>快速、轻量、高效、用心的 Vue 组件库</b></p>

<p>曦寒界面存储库 · 基于 Vue 3 + TypeScript · Monorepo 架构</p>

<p>
  <img alt="Status" src="https://img.shields.io/badge/Status-Experimental-orange?style=flat-square" />
  <img alt="Version" src="https://img.shields.io/badge/Version-0.9.8-orange?style=flat-square" />
  <img alt="Components" src="https://img.shields.io/badge/Components-2%2F60-orange?style=flat-square" />
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

> **实验性项目**：当前 v0.9.8，60 个组件中仅 Button、Icon 已完整实现，其余为占位重写中，请勿在生产环境依赖。

## 📋 项目概况

XiHan.UI 是一个基于 Vue 3 的企业级组件库，致力于提供快速、轻量、高效的组件解决方案。

- **技术栈**: Vue 3 + TypeScript + Vite + Turbo
- **架构**: Monorepo 架构（pnpm workspace，`packages/*` + `internal/*` + `playground`）
- **当前版本**: v0.9.8（实验阶段，尚未正式发布至 npm）
- **workspace 包**: cli / components / constants / directives / hooks / icons / locales / plugins / themes / utils / xihan-ui，共 11 个

## 🧩 组件现状

`packages/components` 目前收录 60 个组件目录，整体仍处于早期重写阶段，请勿在生产环境中依赖：

- **已完整实现**: Button、Icon（含完整交互逻辑与样式）
- **接口占位/重写中（58 个）**: 其余组件（如 Table、Form、Select、DatePicker、Tree 等）目前仅有 props/interface 类型定义与占位渲染骨架（渲染为空的 `<div>` 包裹 `slot`），尚未实现真实交互逻辑与样式

后续将按组件逐个补齐实现与测试后再发布，欢迎关注仓库进展或参与共建。

## 🎯 项目目标

### 核心理念

- **快速**: 高性能的组件实现，优化渲染性能
- **轻量**: 按需加载，减少打包体积
- **高效**: 开发体验优化，提升开发效率
- **专业**: 企业级标准，满足复杂业务需求

## 🛠️ 技术架构

### 构建工具

- **Turborepo**: Monorepo 任务编排与增量构建
- **Unbuild**: 组件包构建（`packages/components` 等使用）
- **Rollup**: 底层打包工具（经 `@xihan-ui/build` 封装）
- **Vite**: playground 预览/开发服务器

### 开发工具

- **TypeScript**: 类型系统
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试
- **Vue Test Utils**: 组件测试

### 发布流程

- **pnpm workspace**: 包管理与 `workspace:*` 版本关联
- **npm**: 包发布（规划中，当前 v0.9.8 处于实验阶段，尚未正式发布）
- **changesets / GitHub Actions CI-CD**: 尚未接入，规划中

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

## Star History

<div align="center">
  <a href="https://star-history.com/#XiHanFun/XiHan.UI&Date" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=XiHanFun/XiHan.UI&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=XiHanFun/XiHan.UI&type=Date" />
      <img alt="XiHan.UI Star History Chart" src="https://api.star-history.com/svg?repos=XiHanFun/XiHan.UI&type=Date" width="640" />
    </picture>
  </a>
</div>

## 支持&赞助

如果此项目对你的开发有助益，也欢迎请作者一杯咖啡。

官方赞助页 https://docs.xihanfun.com/cosmos/sponsor

## 关注动态

![weixinmp](./assets/weixinmp.png)


## 版权&授权

Copyright (c) 2026 XiHanFun and ZhaiFanhua

本项目采用 MIT 授权，详见 [License](./LICENSE)

XiHan.UI Logo、XiHan.UI名称、界面视觉设计与原创视觉表达归作者所有，第三方依赖和第三方服务分别遵循其各自授权与服务条款。

项目仅供学习参考，作者不承担任何软件的使用风险。
