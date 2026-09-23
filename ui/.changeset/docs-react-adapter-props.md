---
'@xihan-ui/react': patch
---

组件文档新增「React 适配器 props」一节，111 个组件因此各多一张表。

Props 表的来源一直是 Headless 的机器契约，React 这一侧自己加的 `trigger` / `renderItem` / `children` / `asChild` 这些不在其中——Vue 有插槽表兜住，React 没有对应物，作者只能翻源码或靠类型提示猜。

新表只列各组件**自己声明**的 props：继承自 `ComponentPropsWithRef` 的那一大票 DOM 属性不列（列了会把真正要看的几行淹掉），根组件上与机器契约同名的也不重复列。

这一节没有改任何运行时行为，只是把既有的公开面写进文档。
