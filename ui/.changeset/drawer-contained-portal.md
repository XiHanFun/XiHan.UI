---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

`RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
所以「局部抽屉」根本做不出来。这次两头一起接：

- **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
  `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
- **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
  一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
  显式写了 `contained` 以显式的为准。
- **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
  没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
- **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
这一条写进了 props 说明与示例。
