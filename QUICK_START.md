# 快速开始指南

本指南将帮助你快速上手 XiHan.UI 开发。

## 📦 安装

### 前置要求

确保你的开发环境满足以下要求：

- **Node.js**: >= 24.0.2
- **pnpm**: >= 10.26.2

### 克隆仓库

```bash
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui
```

### 安装依赖

```bash
pnpm install
```

## 🚀 开发

### 启动开发服务器

```bash
# 启动所有包的开发模式
pnpm dev

# 或者只启动 playground
cd playground
pnpm dev
```

开发服务器将在 `http://localhost:9709` 启动。

### 开发单个组件

```bash
# 在 playground 中测试组件
cd playground
pnpm dev

# 在浏览器中访问 http://localhost:9709
# 编辑 playground/src/views/ 中的文件来测试组件
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试（单次运行）
pnpm test:run

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试（监听模式）
pnpm test:watch

# 运行测试（UI 模式）
pnpm test:ui
```

### 运行特定组件的测试

```bash
# 运行 button 组件的测试
pnpm test button

# 运行 input 组件的测试
pnpm test input
```

## 🔍 代码检查

### 类型检查

```bash
pnpm typecheck
```

### 代码风格检查

```bash
# 运行 ESLint
pnpm lint

# 自动修复 ESLint 问题
pnpm lint:fix

# 格式化代码
pnpm format
```

## 🏗️ 构建

### 构建所有包

```bash
pnpm build
```

### 清理构建产物

```bash
# 清理所有 dist 目录
pnpm clean:build

# 清理并重新构建
pnpm rebuild
```

## 📝 创建新组件

### 1. 创建组件目录

```bash
cd packages/components/src
mkdir my-component
cd my-component
```

### 2. 创建文件结构

```bash
mkdir -p src/styles tests demos
touch src/MyComponent.tsx
touch src/interface.ts
touch src/styles/index.cssr.ts
touch src/styles/theme.ts
touch src/index.ts
touch tests/index.spec.ts
touch index.ts
touch package.json
touch README.md
```

### 3. 编写组件代码

参考现有组件（如 Button）的实现模式：

```typescript
// src/MyComponent.tsx
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  props: {
    // 定义 props
  },
  setup(props, { slots }) {
    // 组件逻辑
    return () => (
      <div>
        {slots.default?.()}
      </div>
    )
  }
})
```

### 4. 编写测试

```typescript
// tests/index.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../src/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })
})
```

### 5. 在 Playground 中测试

```vue
<!-- playground/src/views/MyComponentDemo.vue -->
<template>
  <div>
    <MyComponent>测试内容</MyComponent>
  </div>
</template>

<script setup lang="ts">
import { MyComponent } from '@xihan-ui/components'
</script>
```

### 6. 运行测试和构建

```bash
# 运行测试
pnpm test my-component

# 类型检查
pnpm typecheck

# 构建
pnpm build
```

## 🔄 提交代码

### 1. 创建分支

```bash
git checkout -b feature/my-component
```

### 2. 提交代码

使用规范的提交消息：

```bash
git add .
git commit -m "feat(components): add MyComponent"
```

### 3. 推送代码

```bash
git push origin feature/my-component
```

### 4. 创建 Pull Request

在 GitHub 上创建 Pull Request，填写 PR 模板。

## 📦 发布流程

### 1. 创建 Changeset

```bash
pnpm changeset
```

按提示选择：
- 变更的包
- 版本类型（major/minor/patch）
- 变更描述

### 2. 版本提升

```bash
pnpm changeset version
```

这将：
- 更新包版本号
- 生成 CHANGELOG

### 3. 构建和发布

```bash
# 构建所有包
pnpm build

# 发布到 npm
pnpm publish-packages
```

## 🛠️ 常用命令速查

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建所有包 |
| `pnpm test` | 运行测试 |
| `pnpm test:coverage` | 生成测试覆盖率 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | 代码风格检查 |
| `pnpm format` | 格式化代码 |
| `pnpm clean:build` | 清理构建产物 |
| `pnpm rebuild` | 清理并重新构建 |
| `pnpm changeset` | 创建版本变更 |
| `pnpm ci` | 运行 CI 检查（lint + typecheck + test + build） |

## 🐛 故障排除

### 依赖安装失败

```bash
# 清理并重新安装
pnpm clean:node
pnpm install
```

### 构建失败

```bash
# 清理构建产物并重新构建
pnpm rebuild
```

### 测试失败

```bash
# 运行单个测试文件
pnpm test path/to/test.spec.ts

# 查看详细错误信息
pnpm test --reporter=verbose
```

### 类型错误

```bash
# 运行类型检查查看详细错误
pnpm typecheck

# 清理并重新构建类型
pnpm clean:build
pnpm build
```

## 📚 进一步学习

- [架构文档](../ARCHITECTURE.md) - 了解项目架构
- [贡献指南](../CONTRIBUTING.md) - 学习如何贡献代码
- [开发计划](../DEVELOPMENT_PLAN.md) - 查看开发路线图
- [架构分析](../ARCHITECTURE_ANALYSIS.md) - 深入了解架构设计

## 💡 提示

1. **使用 TypeScript**: 所有代码都应该使用 TypeScript 编写
2. **遵循规范**: 查看现有组件的实现作为参考
3. **编写测试**: 确保测试覆盖率 > 80%
4. **代码审查**: 提交 PR 前进行自我审查
5. **文档齐全**: 为新功能编写文档

## 🆘 获取帮助

- **GitHub Issues**: https://github.com/XiHanFun/XiHan.UI/issues
- **讨论区**: https://github.com/XiHanFun/XiHan.UI/discussions
- **邮箱**: me@zhaifanhua.com

---

**祝你开发愉快！** 🎉
