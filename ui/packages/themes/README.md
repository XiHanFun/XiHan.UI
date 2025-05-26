# @xihan-ui/themes

企业级 Vue UI 组件库的主题和样式系统，基于 `@xihan-ui/utils` 构建的高性能 CSS-in-JS 解决方案。

## 🚀 功能特性

### 核心引擎系统

- **完整样式引擎** - 支持嵌套选择器、媒体查询、伪类等完整 CSS 功能
- **简化样式引擎** - 轻量级样式引擎，适用于简单场景
- **智能缓存系统** - LRU 缓存策略，支持 TTL 和自动清理
- **样式注入器** - 高效的 DOM 样式注入和管理

### 主题系统

- **动态主题切换** - 支持亮色/暗色主题无缝切换
- **CSS 变量集成** - 自动生成和管理 CSS 自定义属性
- **主题继承** - 支持主题扩展和覆盖

### 响应式系统

- **媒体查询** - 基于断点的响应式样式
- **容器查询** - 现代容器查询支持
- **响应式工具** - 设备检测和响应式值选择

### DOM 集成

- **样式化元素** - 创建带样式的 DOM 元素
- **动态样式管理** - 运行时样式更新和管理
- **批量样式操作** - 高效的批量样式应用

## 📦 安装

```bash
pnpm add @xihan-ui/themes
```

## 🔧 基础用法

### 1. 完整样式引擎

```typescript
import { createStyleEngine } from "@xihan-ui/themes";

// 创建样式引擎
const engine = createStyleEngine({
  prefix: "my-app",
  hashLength: 8,
  cache: true,
});

// 编译样式
const compiled = engine.compile({
  color: "blue",
  fontSize: "16px",
  "&:hover": {
    color: "red",
  },
  "@media (min-width: 768px)": {
    fontSize: "18px",
  },
});

// 注入样式并获取类名
engine.inject(compiled.css, compiled.hash);
console.log(compiled.className); // 'my-app-abc123'
```

### 2. 简化样式引擎

```typescript
import { createSimpleStyleEngine } from "@xihan-ui/themes";

const engine = createSimpleStyleEngine("app");

// 创建样式
const className = engine.css({
  color: "blue",
  padding: "10px",
});

// 合并类名
const combined = engine.cx("base-class", className, condition && "active");
```

### 3. Vue 集成

```vue
<template>
  <div :class="buttonClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { useStyleEngine } from "@xihan-ui/themes";

  const engine = useStyleEngine();

  const buttonClass = engine.compileAndInject({
    padding: "8px 16px",
    borderRadius: "4px",
    backgroundColor: "blue",
    color: "white",
    "&:hover": {
      backgroundColor: "darkblue",
    },
  });
</script>
```

### 4. 主题系统

```typescript
import { createTheme, useTheme } from "@xihan-ui/themes";

// 创建主题
const theme = createTheme({
  colors: {
    primary: "#409eff",
    success: "#67c23a",
  },
  fontSizes: {
    sm: "14px",
    base: "16px",
  },
});

// 在组件中使用
const currentTheme = useTheme();
```

### 5. 响应式样式

```typescript
import { responsive, mediaQuery } from "@xihan-ui/themes";

// 响应式样式
const responsiveStyles = responsive({
  base: { fontSize: "14px" },
  md: { fontSize: "16px" },
  lg: { fontSize: "18px" },
});

// 媒体查询
const mediaStyles = mediaQuery("(min-width: 768px)", {
  display: "flex",
  gap: "16px",
});
```

## 🏗️ 架构设计

### 分层架构

```
@xihan-ui/themes
├── core/                 # 核心引擎层
│   ├── style-engine.ts   # 完整样式引擎
│   ├── simple-engine.ts  # 简化样式引擎
│   ├── cache.ts          # 缓存系统
│   ├── injector.ts       # 样式注入器
│   └── types.ts          # 核心类型
├── css-in-js/            # CSS-in-JS 系统
│   ├── css.ts            # CSS 工具函数
│   ├── theme.ts          # 主题管理
│   ├── responsive.ts     # 响应式工具
│   ├── dom-integration.ts # DOM 集成
│   └── utils.ts          # 样式工具
└── index.ts              # 统一导出
```

### 功能分类

1. **核心引擎层** - 样式编译、缓存、注入的核心功能
2. **主题系统层** - 主题管理、CSS 变量、动态切换
3. **样式生成层** - CSS 工具函数、样式变体、组件样式
4. **响应式层** - 媒体查询、容器查询、断点管理
5. **DOM 集成层** - DOM 操作、样式应用、动态管理

## 🎯 性能优化

### 缓存策略

- **LRU 缓存** - 最近最少使用算法
- **TTL 支持** - 缓存过期时间控制
- **自动清理** - 定期清理过期缓存

### 样式优化

- **样式去重** - 自动移除重复样式
- **CSS 压缩** - 生产环境样式压缩
- **按需加载** - 只加载使用的样式

### 开发体验

- **TypeScript 支持** - 完整的类型定义
- **开发模式** - 详细的调试信息
- **热更新** - 开发时样式热更新

## 🔌 扩展性

### 自定义引擎

```typescript
import { StyleEngine } from "@xihan-ui/themes";

class CustomStyleEngine extends StyleEngine {
  // 自定义编译逻辑
  protected compileCSS(className: string, styles: StyleObject): string {
    // 自定义实现
    return super.compileCSS(className, styles);
  }
}
```

### 插件系统

```typescript
import { styleEngineUtils } from "@xihan-ui/themes";

// 批量清理
styleEngineUtils.batchCleanup([engine1, engine2]);

// 开发模式引擎
const devEngine = styleEngineUtils.createDevEngine();
```

## 📊 API 参考

### 核心 API

#### StyleEngine

- `compile(styles)` - 编译样式对象
- `inject(css, id?)` - 注入 CSS 到 DOM
- `compileAndInject(styles)` - 编译并注入样式
- `clear()` - 清空所有样式和缓存

#### StyleCache

- `get(key)` - 获取缓存项
- `set(key, value)` - 设置缓存项
- `cleanup()` - 清理过期缓存
- `getStats()` - 获取缓存统计

#### StyleInjector

- `inject(css, id?)` - 注入样式到 DOM
- `remove(id)` - 移除指定样式
- `clear()` - 清空所有样式

### 工具函数

#### 样式工具

- `css(styles)` - 创建样式类
- `cx(...classes)` - 合并类名
- `mergeStyles(...styles)` - 合并样式对象

#### 响应式工具

- `mediaQuery(query, styles)` - 创建媒体查询
- `responsive(styles)` - 创建响应式样式
- `useResponsiveValue(values)` - 响应式值选择

## 🤝 与 @utils 集成

本包深度集成了 `@xihan-ui/utils` 的功能：

- **DOM 操作** - 使用 `@utils/dom` 的元素操作功能
- **字符串处理** - 使用 `@utils/core` 的字符串转换
- **颜色处理** - 使用 `@utils/dom` 的颜色转换功能
- **ID 生成** - 使用 `@utils/core` 的 ID 生成功能

## �� 许可证

MIT License
