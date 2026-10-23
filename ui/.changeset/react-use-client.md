---
'@xihan-ui/react': minor
---

**新增** 产物里用到客户端能力的模块（组件、hook、全局配置的 Provider、命令式服务）带上 `'use client'`，Next.js App Router 的服务端组件可以直接导入组件渲染，不必再包一层自己的客户端组件。语言包与 `mergeXhConfig` 不带指令，服务端代码里照常可用；`mergeXhConfig` 移到独立的纯函数模块，从包入口导入的写法不变。
