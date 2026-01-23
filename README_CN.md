![logo](./assets/logo.png)

[English](README.md)

# XiHan.UI

曦寒界面存储库。快速、轻量、高效、用心的组件库，基于 Vue 构建。

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/XiHanFun/XiHan.UI)

## 📖 文档导航

- **[快速开始](QUICK_START.md)** - 快速上手开发指南
- **[架构文档](ARCHITECTURE.md)** - 深入了解项目架构
- **[架构分析报告](ARCHITECTURE_ANALYSIS.md)** - 架构优势与改进建议
- **[贡献指南](CONTRIBUTING.md)** - 如何参与项目开发
- **[开发计划](DEVELOPMENT_PLAN.md)** - 路线图与里程碑
- **[安全策略](SECURITY.md)** - 安全漏洞报告

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

详细说明请查看 [快速开始指南](QUICK_START.md)。

## 📦 项目状态

- **版本**: 0.9.8 (预发布版)
- **组件数量**: 58+ 已实现
- **目标**: V1.0 计划于 2026 年 Q1 发布

## 📋 项目概况

XiHan.UI 是一个基于 Vue 3 的企业级组件库，致力于提供快速、轻量、高效的组件解决方案。

- **技术栈**: Vue 3 + TypeScript + Vite + Turbo
- **架构**: Monorepo 架构
- **包管理**: pnpm workspace

## 🎯 项目目标

### 核心理念

- **快速**: 高性能的组件实现，优化渲染性能
- **轻量**: 按需加载，减少打包体积
- **高效**: 开发体验优化，提升开发效率
- **专业**: 企业级标准，满足复杂业务需求

## 🛠️ 技术架构

XiHan.UI 采用 **Monorepo** 架构，核心技术包括：

- **pnpm workspace** - 包管理
- **Turbo** - 构建编排
- **Vue 3 + TypeScript** - 组件开发
- **Vite** - 开发与构建工具
- **Vitest** - 测试框架

### 包结构

```
ui/
├── packages/
│   ├── components/      # 58+ Vue 3 组件
│   ├── themes/          # 主题系统
│   ├── hooks/           # 组合式函数
│   ├── utils/           # 工具函数库
│   ├── icons/           # 图标库
│   └── ...             # 更多包
├── playground/          # 开发预览环境
└── internal/           # 构建工具
```

更多详情请查看 [架构文档](ARCHITECTURE.md)。

### 构建工具

- **Turborepo**: Monorepo 管理
- **Vite**: 构建工具
- **Unbuild**: 包构建
- **Rollup**: 打包工具

### 开发工具

- **TypeScript**: 类型系统
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试
- **Vue Test Utils**: 组件测试

### 发布流程

- **pnpm**: 包管理
- **changesets**: 版本管理
- **GitHub Actions**: CI/CD
- **npm**: 包发布

## 🧪 质量保障

- **CI/CD**: GitHub Actions 自动化测试与部署
- **测试**: Vitest + Vue Test Utils，目标覆盖率 70%+
- **类型安全**: 完整的 TypeScript 支持
- **代码质量**: ESLint + Prettier 规范

## 🤝 贡献指南

欢迎贡献！请阅读我们的 [贡献指南](CONTRIBUTING.md) 开始参与。

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

## 📊 架构分析

我们对项目进行了全面的架构分析，识别了以下关键点：

### ✅ 架构优势

- 现代化的技术栈选择
- 清晰的包组织结构
- 标准化的组件实现模式
- 详细的发展规划

### ⚠️ 需要改进的地方

- 测试基础设施需要完善
- 主题系统实现需要对齐文档
- 需要添加 CI/CD 自动化
- 文档需要更全面

详细分析请查看 [架构分析报告](ARCHITECTURE_ANALYSIS.md)。

## 📞 联系方式

- **GitHub**: https://github.com/XiHanFun/XiHan.UI
- **官网**: https://ui.xihanfun.com
- **邮箱**: me@zhaifanhua.com
- **作者**: zhaifanhua

## 📄 许可证

本项目采用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。
