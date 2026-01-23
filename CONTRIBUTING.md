# 贡献指南

欢迎为 XiHan.UI 贡献代码！本文档将帮助你了解如何参与项目开发。

## 🎯 行为准则

我们致力于营造一个开放、友好的社区环境。参与本项目的所有成员应遵守以下准则：

- 尊重不同的观点和经验
- 接受建设性的批评
- 关注什么对社区最有利
- 对其他社区成员表现出同理心

## 🚀 开始之前

### 前置要求

- **Node.js**: >= 24.0.2
- **pnpm**: >= 10.26.2
- **Git**: 最新版本

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/XiHanFun/XiHan.UI.git
cd XiHan.UI/ui

# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 项目结构

```
XiHan.UI/
├── ui/
│   ├── packages/           # 核心包
│   │   ├── components/    # 组件库
│   │   ├── themes/        # 主题系统
│   │   ├── hooks/         # 组合式函数
│   │   ├── utils/         # 工具函数
│   │   └── ...           # 其他包
│   ├── internal/          # 内部构建工具
│   ├── playground/        # 开发预览环境
│   └── pnpm-workspace.yaml
├── ARCHITECTURE.md        # 架构文档
├── DEVELOPMENT_PLAN.md   # 开发计划
└── README.md             # 项目介绍
```

## 💻 开发流程

### 1. 创建分支

从 `main` 分支创建功能分支：

```bash
# 功能开发
git checkout -b feature/your-feature-name

# Bug 修复
git checkout -b fix/issue-number-description

# 文档更新
git checkout -b docs/what-you-update
```

### 2. 开发组件

#### 组件标准结构

```
packages/components/src/my-component/
├── src/
│   ├── MyComponent.tsx       # 组件实现 (TSX)
│   ├── interface.ts          # TypeScript 类型定义
│   ├── styles/
│   │   ├── index.cssr.ts    # CSS-in-JS 样式
│   │   └── theme.ts         # 主题变量
│   └── index.ts             # 导出
├── tests/
│   └── index.spec.ts        # 单元测试
├── demos/                    # 使用示例
│   ├── basic.vue
│   └── advanced.vue
├── index.ts                  # 包入口
├── package.json
└── README.md                # 组件文档
```

#### 组件开发示例

```typescript
// src/MyComponent.tsx
import { defineComponent, PropType } from 'vue'
import { getMyComponentStyles } from './styles'
import type { MyComponentProps } from './interface'

export default defineComponent({
  name: 'MyComponent',
  props: {
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const styles = getMyComponentStyles(props)
    
    return () => (
      <div class={styles.base}>
        {slots.default?.()}
      </div>
    )
  }
})
```

```typescript
// src/interface.ts
export interface MyComponentProps {
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

export interface MyComponentInstance {
  // 暴露的方法
  focus(): void
}

export interface MyComponentSlots {
  default?: () => any
}

export interface MyComponentEmits {
  (e: 'change', value: any): void
}
```

```typescript
// src/styles/index.cssr.ts
import type { MyComponentProps } from '../interface'
import type { ThemeTokens } from '@xihan-ui/themes'

export interface MyComponentThemeVars extends ThemeTokens {
  colorBase: string
  colorHover: string
  padding: string
}

export function getMyComponentStyles(
  props: MyComponentProps,
  theme?: MyComponentThemeVars
) {
  return {
    base: {
      padding: theme?.padding || '8px 16px',
      backgroundColor: theme?.colorBase || '#fff',
      cursor: props.disabled ? 'not-allowed' : 'pointer'
    },
    hover: {
      backgroundColor: theme?.colorHover || '#f5f5f5'
    }
  }
}
```

### 3. 编写测试

每个组件必须有对应的测试文件：

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

  it('should apply size prop', () => {
    const wrapper = mount(MyComponent, {
      props: { size: 'large' }
    })
    expect(wrapper.props('size')).toBe('large')
  })

  it('should handle disabled state', () => {
    const wrapper = mount(MyComponent, {
      props: { disabled: true }
    })
    expect(wrapper.props('disabled')).toBe(true)
  })

  it('should emit change event', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.trigger('change')
    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
```

### 4. 在 Playground 中测试

在 `playground/` 目录中创建测试页面：

```vue
<!-- playground/src/views/MyComponentDemo.vue -->
<template>
  <div class="demo-container">
    <h2>MyComponent 示例</h2>
    
    <section>
      <h3>基础用法</h3>
      <MyComponent>默认内容</MyComponent>
    </section>

    <section>
      <h3>不同尺寸</h3>
      <MyComponent size="small">小尺寸</MyComponent>
      <MyComponent size="medium">中尺寸</MyComponent>
      <MyComponent size="large">大尺寸</MyComponent>
    </section>

    <section>
      <h3>禁用状态</h3>
      <MyComponent disabled>禁用状态</MyComponent>
    </section>
  </div>
</template>

<script setup lang="ts">
import { MyComponent } from '@xihan-ui/components'
</script>
```

### 5. 运行检查

```bash
# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📝 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 为所有公共 API 提供类型定义
- 避免使用 `any`，优先使用 `unknown`
- 使用接口（interface）而不是类型别名（type）定义对象类型

### 命名规范

- **组件**: PascalCase (MyComponent)
- **文件名**: kebab-case (my-component.tsx)
- **变量/函数**: camelCase (myFunction)
- **常量**: UPPER_SNAKE_CASE (MY_CONSTANT)
- **类型/接口**: PascalCase (MyComponentProps)

### 样式规范

- 使用 CSS-in-JS 而不是外部 CSS
- 所有颜色、尺寸使用主题变量
- 支持响应式设计
- 遵循 BEM 命名规范（如果使用 CSS 类）

### 注释规范

```typescript
/**
 * 组件功能描述
 * 
 * @example
 * ```vue
 * <MyComponent size="large">内容</MyComponent>
 * ```
 */
export default defineComponent({
  name: 'MyComponent',
  
  props: {
    /**
     * 组件尺寸
     * @default 'medium'
     */
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    }
  }
})
```

## 📦 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新增功能，也不是修复 Bug）
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖变更
- `ci`: CI 配置文件和脚本变更
- `chore`: 其他不修改 src 或 test 的变更
- `revert`: 回滚之前的提交

### 示例

```bash
# 新增功能
git commit -m "feat(button): add loading state support"

# 修复 Bug
git commit -m "fix(input): resolve validation error on empty value"

# 文档更新
git commit -m "docs(readme): update installation instructions"

# 重大变更（Breaking Change）
git commit -m "feat(api): redesign component API

BREAKING CHANGE: The `color` prop has been renamed to `variant`"
```

## 🔄 Pull Request 流程

### 1. 创建 PR

- 确保你的分支基于最新的 `main` 分支
- 运行所有检查并确保通过
- 推送代码到你的 fork 仓库
- 在 GitHub 上创建 Pull Request

### 2. PR 标题格式

PR 标题应遵循提交规范：

```
feat(button): add loading state
fix(input): resolve validation issue
docs: update contribution guide
```

### 3. PR 描述模板

```markdown
## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 性能优化 (perf)
- [ ] 重构 (refactor)
- [ ] 测试 (test)
- [ ] 构建/工具 (build/chore)

## 变更描述
简要描述你的变更内容

## 相关 Issue
关闭 #issue_number

## 测试
- [ ] 已添加/更新单元测试
- [ ] 所有测试通过
- [ ] 已在 playground 中手动测试

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已运行 `pnpm lint` 且无错误
- [ ] 已运行 `pnpm typecheck` 且无错误
- [ ] 已运行 `pnpm test` 且全部通过
- [ ] 已更新相关文档
- [ ] 提交信息遵循规范

## 截图（如适用）
如果是 UI 变更，请提供前后对比截图
```

### 4. 代码审查

- PR 需要至少一位维护者审查
- 解决所有审查意见
- 保持提交历史清晰（必要时使用 `git rebase`）

### 5. 合并

- 所有检查通过后，维护者将合并 PR
- 合并后你的分支可以安全删除

## 🧪 测试指南

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test button

# 监听模式
pnpm test --watch

# 覆盖率报告
pnpm test:coverage
```

### 测试原则

1. **覆盖率**: 每个组件测试覆盖率应 > 80%
2. **独立性**: 测试之间不应相互依赖
3. **可读性**: 测试代码应清晰易懂
4. **完整性**: 测试常规用例、边界条件和错误情况

### 测试最佳实践

```typescript
describe('MyComponent', () => {
  // 分组相关测试
  describe('props', () => {
    it('should render with default props', () => {
      // 测试默认状态
    })

    it('should apply custom size', () => {
      // 测试自定义属性
    })
  })

  describe('events', () => {
    it('should emit change event', () => {
      // 测试事件触发
    })
  })

  describe('slots', () => {
    it('should render slot content', () => {
      // 测试插槽
    })
  })

  describe('edge cases', () => {
    it('should handle null value', () => {
      // 测试边界条件
    })
  })
})
```

## 📚 文档要求

### 组件文档

每个组件应包含：

1. **概述**: 组件用途和功能
2. **API**: Props、Events、Slots、Methods
3. **示例**: 基础用法和高级用法
4. **注意事项**: 使用限制和最佳实践

### JSDoc 注释

```typescript
/**
 * 按钮组件
 * 
 * @example
 * ```vue
 * <Button type="primary" size="large" @click="handleClick">
 *   点击我
 * </Button>
 * ```
 */
export default defineComponent({
  name: 'Button',
  
  props: {
    /**
     * 按钮类型
     * @values 'default' | 'primary' | 'success' | 'warning' | 'error'
     * @default 'default'
     */
    type: String,
    
    /**
     * 按钮尺寸
     * @default 'medium'
     */
    size: String
  },
  
  emits: {
    /**
     * 点击事件
     * @param event - 鼠标事件
     */
    click: (event: MouseEvent) => true
  }
})
```

## 🐛 Bug 报告

### 报告 Bug 时请包含：

1. **环境信息**:
   - 操作系统
   - 浏览器版本
   - XiHan.UI 版本
   - Vue 版本

2. **重现步骤**:
   - 详细的步骤描述
   - 最小化重现代码

3. **期望行为**: 描述你期望发生什么

4. **实际行为**: 描述实际发生了什么

5. **截图/录屏** (可选): 如果是视觉问题

### Bug 报告模板

```markdown
## 环境信息
- OS: macOS 14.0
- Browser: Chrome 120
- XiHan.UI: 0.9.8
- Vue: 3.5.14

## 重现步骤
1. 安装 XiHan.UI
2. 创建 Button 组件
3. 点击按钮
4. 观察控制台错误

## 期望行为
按钮应该正常响应点击事件

## 实际行为
控制台抛出错误: ...

## 重现代码
\`\`\`vue
<template>
  <Button @click="handleClick">点击</Button>
</template>
\`\`\`
```

## 💡 功能建议

欢迎提出新功能建议！请：

1. 在 Issues 中搜索是否已有类似建议
2. 描述功能用途和使用场景
3. 如果可能，提供 API 设计草案
4. 说明为什么这个功能对用户有价值

## 📞 联系方式

- **GitHub Issues**: https://github.com/XiHanFun/XiHan.UI/issues
- **讨论区**: https://github.com/XiHanFun/XiHan.UI/discussions
- **邮箱**: me@zhaifanhua.com

## 🙏 致谢

感谢所有为 XiHan.UI 做出贡献的开发者！

你的每一个 PR、Issue 和建议都让这个项目变得更好。

---

**Happy Coding!** 🚀
