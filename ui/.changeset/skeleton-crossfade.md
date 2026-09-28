---
'@xihan-ui/headless': major
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

Skeleton 刚加载完时不再当场收起：骨架让出版面、原地盖在真实内容之上淡出，播完才收起；挂载时就已加载完的直接收起。

**破坏性**：`connectSkeleton` 的签名由 `(props, normalize)` 改为 `(service, normalize)`，新增 `skeletonMachine` 与 `SkeletonSchema`。直接使用 `@xihan-ui/headless` 的调用方需先用 `skeletonMachine` 创建服务再连接：

```ts
const service = createService(skeletonMachine, { props: () => props, runtime })
const api = connectSkeleton(service, normalize)
```

Vue、React 与 Web Components 组件的用法不变。
