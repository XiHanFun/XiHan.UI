# @xihan-ui/vue

Vue 3 适配器：122 个组件的 Vue 形态，外加对应的 composables。行为全部来自 `@xihan-ui/headless`，这一层只负责把它接到 Vue 的响应式与渲染上。

**谁会装它**：在 Vue 里用这套组件的人装它。样式另装 `@xihan-ui/styles`，或者自己写。

## 用法

```ts
import { XhButton, XhDialog } from '@xihan-ui/vue'
import '@xihan-ui/styles'
```

## 装

```bash
pnpm add @xihan-ui/vue
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `adapters/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
