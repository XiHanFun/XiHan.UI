# XiHan.UI 架构文档

## 📐 架构概览

XiHan.UI 是一个基于 **Monorepo** 架构的 Vue 3 组件库，使用 pnpm workspace 管理多个相互依赖的包。

```
┌─────────────────────────────────────────────────────────┐
│                      xihan-ui                           │
│                    (主入口包)                            │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
    │components│    │  themes  │    │  hooks   │
    │   (核心)  │    │  (样式)  │    │  (逻辑)  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐
    │  utils   │    │  icons   │    │ locales  │
    │ (工具库) │    │  (图标)  │    │  (i18n)  │
    └──────────┘    └──────────┘    └──────────┘
         │
         ├────────────────────────────────────┐
         │                │                   │
    ┌────▼─────┐    ┌────▼─────┐      ┌─────▼────┐
    │constants │    │directives│      │ plugins  │
    │  (常量)  │    │  (指令)  │      │  (插件)  │
    └──────────┘    └──────────┘      └──────────┘
```

## 📦 包结构详解

### 核心包 (Public Packages)

#### 1. `xihan-ui`
- **作用**: 主入口包，聚合所有功能
- **依赖**: 所有其他包
- **导出**: 统一的 API 接口
- **版本**: 0.9.8

```typescript
// 使用示例
import { Button, useForm, zhCN } from 'xihan-ui'
```

#### 2. `@xihan-ui/components`
- **作用**: 核心组件库（58+ 组件）
- **技术**: Vue 3 TSX + CSS-in-JS
- **依赖**: themes, utils, hooks, icons, directives, locales
- **组件列表**:
  ```
  基础: Button, Icon, Divider, Space
  表单: Input, Select, Checkbox, Radio, Switch, Form
  数据: Table, Tree, List, Pagination
  反馈: Modal, Message, Notification, Alert
  布局: Layout, Grid, Container
  导航: Menu, Tabs, Breadcrumb, Steps
  其他: 40+ 更多组件
  ```

**组件标准结构**:
```
button/
├── src/
│   ├── Button.tsx              # 组件实现
│   ├── interface.ts            # TypeScript 类型
│   ├── styles/
│   │   ├── index.cssr.ts      # CSS-in-JS 样式
│   │   └── theme.ts           # 主题变量
│   └── index.ts               # 导出
├── tests/
│   └── index.spec.ts          # 单元测试
├── demos/                      # 示例代码
└── package.json
```

#### 3. `@xihan-ui/themes`
- **作用**: 统一主题系统
- **核心功能**:
  - 主题令牌 (Theme Tokens)
  - CSS-in-JS 样式引擎
  - 响应式样式支持
  - 动画系统
- **依赖**: @xihan-ui/utils

**主题架构** (计划中):
```typescript
// 主题令牌示例
interface ButtonThemeVars extends ThemeTokens {
  colorPrimary: string
  colorHover: string
  borderRadius: string
  fontSize: string
}

// 样式生成
function getButtonStyles(theme: ButtonThemeVars) {
  return {
    backgroundColor: theme.colorPrimary,
    borderRadius: theme.borderRadius,
    // ...
  }
}
```

#### 4. `@xihan-ui/hooks`
- **作用**: Vue 3 组合式函数（Composables）
- **依赖**: @xihan-ui/utils, pinia (可选)
- **主要 Hooks** (20+):
  ```typescript
  useForm()         // 表单管理
  useTable()        // 表格状态
  useModal()        // 弹窗控制
  usePagination()   // 分页逻辑
  useTheme()        // 主题切换
  useLocale()       // 国际化
  useValidation()   // 表单验证
  ```

#### 5. `@xihan-ui/utils`
- **作用**: 通用工具函数库
- **依赖**: 无
- **导出路径** (10+):
  ```typescript
  import { debounce } from '@xihan-ui/utils/core'
  import { addClass } from '@xihan-ui/utils/dom'
  import { isObject } from '@xihan-ui/utils/types'
  import { formatDate } from '@xihan-ui/utils/format'
  import { isClient } from '@xihan-ui/utils/browser'
  import { vueUtils } from '@xihan-ui/utils/vue'
  ```

**工具分类**:
- `core/`: 核心工具（debounce, throttle, curry）
- `dom/`: DOM 操作（addClass, removeClass, getStyle）
- `types/`: 类型判断（isString, isObject, isArray）
- `format/`: 格式化（formatDate, formatNumber）
- `browser/`: 浏览器检测（isClient, isServer）
- `vue/`: Vue 工具（defineComponent 增强）

#### 6. `@xihan-ui/icons`
- **作用**: SVG 图标库
- **实现**: Vue 组件形式
- **使用**:
  ```vue
  <template>
    <IconSearch :size="24" color="#000" />
  </template>
  ```

#### 7. `@xihan-ui/locales`
- **作用**: 国际化支持
- **语言包**: zh-CN, en-US, ja-JP 等
- **集成**: 配合组件内置文案

```typescript
// 使用示例
import { zhCN, enUS } from '@xihan-ui/locales'

app.use(XiHanUI, {
  locale: zhCN
})
```

#### 8. `@xihan-ui/constants`
- **作用**: 全局常量定义
- **内容**: 枚举值、配置默认值、魔法数字

```typescript
export const COMPONENT_SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const

export const Z_INDEX = {
  MODAL: 1000,
  NOTIFICATION: 2000,
  MESSAGE: 3000
} as const
```

#### 9. `@xihan-ui/directives`
- **作用**: Vue 自定义指令
- **指令列表**:
  ```typescript
  v-loading     // 加载状态
  v-tooltip     // 工具提示
  v-clickoutside // 点击外部
  v-resize      // 尺寸监听
  v-infinite-scroll // 无限滚动
  ```

#### 10. `@xihan-ui/plugins`
- **作用**: Vue 插件抽象
- **用途**: 提供插件开发基础类和工具

#### 11. `@xihan-ui/cli` (计划中)
- **作用**: 命令行工具
- **功能**:
  - 创建组件模板
  - 创建 Hook 模板
  - 更新组件库
  - 主题定制工具

### 内部包 (Internal Packages)

#### `internal/build`
- **作用**: 构建工具和配置
- **私有**: 不对外发布

#### `internal/dev`
- **作用**: 开发工具
- **私有**: 不对外发布

### 开发环境

#### `playground/`
- **作用**: 组件开发和预览环境
- **技术**: Vite + Vue 3 + Vue Router
- **端口**: 9709
- **路径别名**: 配置了所有包的导入别名

## 🔄 构建流程

### 构建工具链

```
┌─────────────┐
│  源代码 .ts  │
│  .tsx .vue  │
└──────┬──────┘
       │
       │ unbuild
       ▼
┌─────────────┐
│  dist/      │
│  ├── cjs/   │  (CommonJS)
│  ├── esm/   │  (ES Modules)
│  └── types/ │  (TypeScript 类型)
└──────┬──────┘
       │
       │ Turbo 并行构建
       ▼
┌─────────────┐
│ 11 个包产物 │
└─────────────┘
```

### Turbo 任务编排

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // 依赖包先构建
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**构建顺序** (自动拓扑排序):
```
1. constants, utils (无依赖)
2. themes, icons, locales (依赖 utils)
3. hooks, directives, plugins (依赖上层)
4. components (依赖所有)
5. xihan-ui (主包最后)
```

## 🔗 依赖关系图

### 包依赖关系

```
xihan-ui
└── @xihan-ui/components
    ├── @xihan-ui/themes
    │   └── @xihan-ui/utils
    ├── @xihan-ui/hooks
    │   ├── @xihan-ui/utils
    │   └── pinia (peerDependency)
    ├── @xihan-ui/utils
    ├── @xihan-ui/icons
    ├── @xihan-ui/directives
    │   └── @xihan-ui/utils
    ├── @xihan-ui/plugins
    └── @xihan-ui/locales
        └── @xihan-ui/constants
```

**依赖原则**:
1. 低层包不依赖高层包
2. utils 是基础层，被大多数包依赖
3. components 是最高层，依赖所有其他包
4. 避免循环依赖

### 外部依赖

**核心依赖**:
- Vue 3.5.14+ (peerDependency)
- TypeScript 5.x (devDependency)

**构建依赖**:
- unbuild 3.5.0 (打包)
- turbo 2.5.3 (任务编排)
- vite 6.2.7 (开发服务器)

**测试依赖**:
- vitest 3.2.4 (单元测试)
- @vue/test-utils 2.4.6 (组件测试)

## 🧪 测试架构

### 测试策略

```
┌──────────────────────────────────────┐
│          测试金字塔                   │
│                                      │
│        ┌──────────┐                 │
│        │  E2E 测试 │  ⚠️ 待添加      │
│        └──────────┘                 │
│      ┌──────────────┐               │
│      │  集成测试     │  ⚠️ 待添加     │
│      └──────────────┘               │
│  ┌────────────────────┐             │
│  │    单元测试         │  ✅ 已有     │
│  └────────────────────┘             │
└──────────────────────────────────────┘
```

**当前状态**:
- ✅ 60+ 单元测试文件
- ❌ 缺少根级别 vitest.config.ts
- ❌ 测试质量较低（主要是快照测试）
- ❌ 没有覆盖率要求
- ❌ 没有 E2E 测试

**改进计划**:
1. 添加 `vitest.config.ts` 配置
2. 设置覆盖率阈值（80%+）
3. 增强测试深度（行为测试、边界测试）
4. 引入 Playwright 进行 E2E 测试

## 🎨 主题系统架构

### 主题层级

```
全局主题 (Global Theme)
    │
    ├── 组件主题 (Component Theme)
    │   ├── Button Theme
    │   ├── Input Theme
    │   └── ...
    │
    └── 设计令牌 (Design Tokens)
        ├── Colors
        ├── Typography
        ├── Spacing
        └── Shadows
```

### 主题定制流程

```typescript
// 1. 定义自定义主题
const customTheme = {
  colorPrimary: '#1890ff',
  colorSuccess: '#52c41a',
  borderRadius: '4px',
  fontSize: '14px'
}

// 2. 应用主题
app.use(XiHanUI, {
  theme: customTheme
})

// 3. 组件自动使用主题
<Button type="primary">按钮</Button>
// 会自动应用 colorPrimary
```

### CSS-in-JS 实现

**优势**:
- ✅ 运行时主题切换
- ✅ TypeScript 类型安全
- ✅ 作用域隔离
- ✅ 动态样式生成

**示例**:
```typescript
function getButtonStyles(theme: ButtonThemeVars) {
  return {
    base: {
      backgroundColor: theme.colorPrimary,
      color: theme.colorText,
      borderRadius: theme.borderRadius,
      padding: theme.padding,
      fontSize: theme.fontSize
    },
    hover: {
      backgroundColor: theme.colorHover
    }
  }
}
```

## 📊 性能考虑

### 按需加载

```typescript
// 全量引入 (不推荐)
import XiHanUI from 'xihan-ui'
app.use(XiHanUI)

// 按需引入 (推荐)
import { Button, Input } from 'xihan-ui'
```

### 构建优化

- ✅ ES Modules 支持 tree-shaking
- ✅ 包分离（每个组件独立）
- ⚠️ 待优化：bundle 体积分析
- ⚠️ 待优化：动态导入

### 运行时优化

- ✅ Vue 3 组合式 API
- ✅ TypeScript 类型检查
- ⚠️ 待优化：虚拟滚动
- ⚠️ 待优化：组件懒加载

## 🔄 发布流程

### 版本管理

**工具**: changesets
**策略**: 语义化版本 (Semver)

```bash
# 1. 开发者创建 changeset
pnpm changeset

# 2. 版本提升
pnpm changeset version

# 3. 构建
pnpm build

# 4. 发布到 npm
pnpm publish-packages
```

### 发布检查清单

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 文档更新
- [ ] CHANGELOG 生成
- [ ] 版本号更新
- [ ] Git 标签创建

## 🛠️ 开发工作流

### 添加新组件

```bash
# 1. 创建组件目录 (手动或使用 CLI)
mkdir -p ui/packages/components/src/my-component

# 2. 按标准结构创建文件
# src/MyComponent.tsx
# src/interface.ts
# src/styles/index.cssr.ts
# tests/index.spec.ts

# 3. 在 playground 中测试
cd playground
pnpm dev

# 4. 编写测试
pnpm test

# 5. 构建
pnpm build

# 6. 创建 changeset
pnpm changeset
```

### 代码规范

**Linting**:
```bash
pnpm lint        # ESLint 检查
pnpm format      # Prettier 格式化
```

**Type Checking**:
```bash
pnpm typecheck   # TypeScript 类型检查
```

## 🚀 最佳实践

### 组件开发

1. **遵循单一职责原则**: 每个组件只做一件事
2. **使用 TypeScript**: 所有组件必须有类型定义
3. **编写测试**: 单元测试覆盖率 > 80%
4. **文档齐全**: JSDoc + 使用示例
5. **无障碍支持**: ARIA 属性、键盘导航

### 样式开发

1. **使用主题变量**: 不要硬编码颜色、尺寸
2. **响应式设计**: 支持不同屏幕尺寸
3. **CSS-in-JS**: 使用 CSS-in-JS 而不是外部 CSS
4. **避免样式泄漏**: 使用作用域样式

### API 设计

1. **命名一致性**: 参考 Ant Design / Element Plus
2. **Props 验证**: 使用 TypeScript 接口
3. **事件命名**: 使用 `on` 前缀（onUpdate, onChange）
4. **插槽设计**: 提供灵活的插槽 API

## 📈 未来规划

### 短期 (V1.0)
- ✅ 完善测试体系
- ✅ 建立 CI/CD
- ✅ 完善文档

### 中期 (V1.x)
- 移动端适配
- 主题市场
- 组件市场
- 设计工具集成

### 长期 (V2.0)
- Web Components 支持
- 跨框架支持（React、Angular）
- AI 辅助开发
- 可视化搭建

## 📚 参考资源

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Turbo 文档](https://turbo.build/)
- [Vitest 文档](https://vitest.dev/)
- [unbuild 文档](https://github.com/unjs/unbuild)

---

**维护者**: XiHan Team  
**最后更新**: 2026-01-23  
**版本**: 0.9.8
