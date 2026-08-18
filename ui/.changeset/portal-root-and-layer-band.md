---
"@xihan-ui/kernel": major
"@xihan-ui/tokens": major
"@xihan-ui/styles": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": minor
"@xihan-ui/headless": minor
"@xihan-ui/behavior": minor
"@xihan-ui/position": minor
---

浮层搬进单一落点，层号与背景失活跟着改口。

## 浮层不再原地渲染

此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
`backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
`RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
（tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
`isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

**破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
节点的代码要改从 `document` 取。

## 遮罩式浮层并到同一档层号

`--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

**破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

## 背景失活改走祖先链

`hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
`alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

`data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
把模态关掉）。

## 其余

- `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
  原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
- tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
- 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
- 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
- 滚动锁补滚动条补偿与滚动根探测。
