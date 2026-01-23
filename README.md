![logo](./assets/logo.png)

[中文](README_CN.md)

# XiHan.UI

Xihan ui repository. Fast, lightweight, efficient, and dedicated component library. Built on Vue.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/XiHanFun/XiHan.UI)

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started with development
- **[Architecture Documentation](ARCHITECTURE.md)** - Understand the project structure
- **[Architecture Analysis](ARCHITECTURE_ANALYSIS.md)** - Detailed analysis of strengths and areas for improvement
- **[Contributing Guide](CONTRIBUTING.md)** - Learn how to contribute
- **[Development Plan](DEVELOPMENT_PLAN.md)** - Roadmap and milestones
- **[Security Policy](SECURITY.md)** - Report security vulnerabilities

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build packages
pnpm build
```

For detailed instructions, see the [Quick Start Guide](QUICK_START.md).

## 📦 Project Status

- **Version**: 0.9.8 (Pre-release)
- **Components**: 58+ implemented
- **Target**: V1.0 release in Q1 2026

## 🏗️ Architecture

XiHan.UI uses a **Monorepo** architecture powered by:

- **pnpm workspace** - Package management
- **Turbo** - Build orchestration
- **Vue 3 + TypeScript** - Component development
- **Vite** - Development and build tool
- **Vitest** - Testing framework

### Package Structure

```
ui/
├── packages/
│   ├── components/      # 58+ Vue 3 components
│   ├── themes/          # Theme system
│   ├── hooks/           # Composition API utilities
│   ├── utils/           # Utility functions
│   ├── icons/           # Icon library
│   └── ...             # More packages
├── playground/          # Development preview
└── internal/           # Build tools
```

For more details, see the [Architecture Documentation](ARCHITECTURE.md).

## 🧪 Quality Assurance

- **CI/CD**: GitHub Actions workflows for automated testing and deployment
- **Testing**: Vitest + Vue Test Utils with 70%+ coverage target
- **Type Safety**: Full TypeScript support
- **Code Quality**: ESLint + Prettier

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📞 Contact

- **GitHub**: https://github.com/XiHanFun/XiHan.UI
- **Website**: https://ui.xihanfun.com
- **Email**: me@zhaifanhua.com
- **Author**: zhaifanhua
