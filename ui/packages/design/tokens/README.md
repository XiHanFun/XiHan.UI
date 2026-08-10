# @xihan-ui/tokens

设计令牌与主题运行时。DTCG 源产出三份等价产物：`tokens.css`（自带 `@layer`）、`tokens.json`、以及带类型的 TS 常量。主题控制器负责把 `data-theme` / `data-brand` / `data-density` / `data-contrast` / `dir` 写到根元素上。

**谁会装它**：要自定义主题、或只要令牌不要组件的人直接装它。

## 用法

```ts
import { createThemeController } from '@xihan-ui/tokens/runtime'
import '@xihan-ui/tokens/tokens.css'

createThemeController().setTheme('dark')
```

## 装

```bash
pnpm add @xihan-ui/tokens
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `design/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
