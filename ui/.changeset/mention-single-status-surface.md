---
'@xihan-ui/headless': patch
'@xihan-ui/styles': major
---

Mention 的候选、空结果与加载相位改为共用 `content` 的唯一浮层表面。`empty`、`loading` 继续作为
listbox 的同级 `role=status`，只叠加状态文字，不再各画一张边框、背景和阴影卡片；没有状态文案的手写结构
不会留下空白浮层，自动结构既有的 `No results` 保持不变。

候选计数与导航现在排除带 `hidden` 的 item。全部候选隐藏或移除后同步清空高亮与
`aria-activedescendant`，方向键、Enter、程序化点击与指针事件都不会操作不可见旧候选。loading 只在零可见候选时显示；
已有候选时列表保持可见可操作，仅通过 `aria-busy` 报后台刷新。Mention 的前缀识别、光标位置、
Enter 插入与无候选时放行回车的语义不变。

新增 `--xh-mention-content-min-h`。移除不再拥有表面的 `--xh-mention-empty-bg`、
`--xh-mention-empty-border`、`--xh-mention-empty-radius`、`--xh-mention-empty-shadow`、
`--xh-mention-loading-bg`、`--xh-mention-loading-border`、`--xh-mention-loading-radius` 与
`--xh-mention-loading-shadow`，不保留可重新画出双层状态卡片的兼容分支。

异步示例三端统一显式使用现有 Empty/Loading 部件与 loading/collection 状态，没有新增 API。

皮肤体积（去注释、压空白）：前一提交源码 12163 字节，当前 12266 字节；登记基线 12163 → 12266，只更新本组件，10% 容差保持不变。
