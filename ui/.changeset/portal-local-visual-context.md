---
"@xihan-ui/core": minor
"@xihan-ui/vue": major
"@xihan-ui/react": major
---

**Portal 按实例桥接逻辑来源的局部视觉环境，局部主题不再在搬到共享落点后丢失。**

Core 新增 `createPortalVisualBridge`、`PortalVisualBridge` 与 `PortalVisualBridgeOptions`。桥只复制仓库当前真实存在的六个 DOM 环境轴：`data-theme`、`data-brand`、`data-density`、`data-contrast`、`data-motion` 与 `dir`。每一轴独立读取来源 composed 祖先链中最近的显式声明；来源未声明时，实例壳不写该属性，继续继承业务显式 portalContainer 的环境。

桥不会复制计算后的 CSS 自定义属性，也不会凭规格文字虚构 `data-transparency`。当前 transparency 只有系统媒体查询，没有 DOM 控制轴；`shape` 是组件自身形态轴，不属于主题环境。后续只有在 VisualEnvironmentController 真正建立对应 DOM 合同时才会扩充名单。

Vue 与 React 的每个 Portal 增加独占的 `display: contents` 壳；共享 `xh-portal-root` 不写任何主题属性，因此同页多个局部 dark/light、compact/comfortable 或 contrast 档不会互相覆盖。祖先属性改值、删除、来源换父、ShadowRoot 与 slot 重新分配均会异步同步；观察器取自来源 Document 的 Window，跨 Document 来源与壳直接失败。

已有触发器或控件 ref 的锚定浮层直接以该节点作为 source，不生成来源 marker，避免改变 ButtonGroup 的 `:first-child` / `:last-child`、`root > *` 与 Toolbar 的直接子项。没有现成来源节点的模态/浮动组合使用无布局的 `template[data-xh-portal-source]`。React 的 `XhPortalProps` 新增可选 `source`；Vue 的桥组件保持内部实现，不新增公开组件家族。Web Components 声明式浮层仍在 Light DOM 原位，继续通过真实祖先链自然继承，不为了这一缺陷引入节点搬运。

**破坏面：** Vue 与 React 的 portalContainer 直接子节点现在是 `div[data-xh-portal-shell]`，实际浮层位于壳内；React SSR 的原位输出也带 source/shell。按 `#xh-portal-root > [data-scope]` 或假定浮层部件直接父节点就是业务容器的样式和测试，应改为通过公开部件属性匹配后代；`data-xh-portal-shell` 仍是库内部标记。壳不产生布局盒，不改变定位包含块与层叠上下文。
