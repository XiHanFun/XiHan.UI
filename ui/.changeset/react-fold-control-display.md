---
"@xihan-ui/react": minor
---

**React 适配器再铺六个组件：`accordion`、`collapsible`、`checkbox`、`toggle`、`alert`、`badge`。** 折叠两件、表单控件两件、纯展示两件，公开面从 12 个组件涨到 18 个。

六个都不碰浮层，所以这一批没有新的定位与消隐层接线。真正新增的运行期件只有一个：`runtime/use-overlay-exit.ts`。折叠族的 content 需要退场闸门——连接层给它打的 `hidden` 跟着展开态走，收起那一帧节点就不生成盒子，退场动画一帧都播不出来。浮层族那几个走 `use-overlay`（它们还要连消隐层、遮罩与定位一起管），折叠族只需要「几时真的收起」这一件事，所以另收一个薄件：presence 建一次、每次提交后按展开态 update、把 CSS 退场动画接到退出租约，收起落成内联 `display: none`。首帧的展开态用 `useState` 冻住，每帧现算会让展开一次就重建一次 presence、退场租约跟着断掉。手风琴的闸门按面板各开一个：切换项时一个进场一个退场是同时发生的。

`checkbox` 是 `switch` 之后第二个认表单重置的组件。React 的桥是个 hook、由组件自己调，不像 Vue / WC 在运行时统一挂一次，所以它逐个组件挂：锚点取组件渲出来的最外层节点——给了文字时是外面那个 `<label>`，没给时就是那颗按钮。半选也走这条线，重置回 `defaultChecked="indeterminate"`。字段接线照 `switch`：说明与校验状态落在焦点所在的那颗按钮上，字段的标签并进名字链。

`badge` 没有机器，`connectBadge` 直接吃 props；全局配置经 `withXhConfig` 并进来。角标的计数文本作为函数式 children 的载荷交给作者。`alert` 的 `translations` 同样只能经 `withXhConfig` 拿到——`useMachine` 那一处只并 locale 与 size，按组件名分桶的文案到不了它。

判据一并接上：一致性套件、服务端直出、Vue×React 的逐帧对拍与标签名对拍四条链，加上 `react-coverage.json` 的登记。这六个一个 SSR 豁免都没用上，键盘覆盖也没有豁免行。对拍连跑三轮无抖动。

**尚未交付**：`checkbox-group` 与 `toggle-group` 还没铺，这两个单件目前只能单独用；手风琴的 `collection` 铺开走 `renderContent` 这个渲染 prop，与 Vue 侧的 `#content` 插槽是同一份能力的两种介质。
