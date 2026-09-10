---
"@xihan-ui/testing": minor
---

**夹具节点可以声明只在某几个适配器下渲，级联检索档的 WC 候选由此补进共用夹具。**

`FixtureNode` 新增 `only?: readonly AdapterName[]`：写了名单的节点只在名单里的适配器渲进标记，其余适配器当它没写；省略即各侧都渲。三个适配器的 harness 在把夹具树翻成 VNode / React 元素 / Light-DOM 时按这条过滤，根节点的直接子节点也过。它给的是「一侧由作者手写、另一侧由部件自渲」的节点——级联的检索候选正是这一类：WC 的 `search-item` 归作者手写，Vue / React 的 `search-list` 按当下命中自渲。

级联的检索档夹具因此在 `search-list` 下声明了全部七条叶子路径的候选（`only: ['wc']`）。此前共用夹具一条候选都没写，WC 侧连接层照机器状态发出的 `aria-activedescendant` 指向不存在的 id，axe 判 critical，只能登进 WC 的 a11y 基线；现在 id 解得开，那条登记删掉。`expectHighlight` 同时收紧：除末段身份外，还要求 `aria-activedescendant` 在文档里真能解到一条带 `data-highlighted` 的 `search-item`——拿掉候选立刻在 WC 侧判红，三侧同一份判据。

逐帧比对的豁免留着但理由改了：不再是「Vue 侧没有部件供夹具声明」，而是 WC 的候选常驻 DOM 靠 `hidden` 过滤、Vue / React 只渲命中的那几条，同一帧的节点数对不上。全程不打字的那条用例改用不带候选的夹具，继续留在逐帧比对里。
