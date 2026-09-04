---
"@xihan-ui/styles": minor
---

**禁用光标与触摸高亮收进一份公共层。** 新增 `css/pointer.css`，两条规则：

- `[data-scope][data-part][data-disabled]`、`:disabled`、`[aria-disabled='true']` 三种条件拼写合成一条选择器，光标一律 `cursor: not-allowed`。原先 151 处逐份手写，现在皮肤里只剩 3 处（提示条按钮的「待决」与「在途」分档、分栏与裁剪把手要压过按走向给的 resize 光标），其余由这条接住。
- `[data-scope]` 上一条 `-webkit-tap-highlight-color: transparent`。它是继承属性，一条规则覆盖全库节点与它们的后代，触摸点按不再闪浏览器画的高亮方块。

同批统一的两件事：

- 在途光标从三种拼写（`progress` / `wait` / `not-allowed`）收成一种 `progress`，`cursor: wait` 归零；按钮的 `[data-loading]` 从「禁用」那档拆出来单列。挂在哪个部件上仍由组件自己说——`data-loading` 在若干组件上挂在包着作者内容的外壳节点上，写成通配会把光标铺到作者自己的内容上。
- 只读与禁用相遇时的优先级统一写成 `[data-readonly]:not([data-disabled])`，不再靠源序定胜负（取色器的通道滑条原先源序写反，禁用态被只读态盖住）。

`data-disabled` 由这条与组件无关的规则消费，`check-dead-state-attr` 的逐组件豁免登记随之删去 15 条。

按需引入的人多引一份：`import '@xihan-ui/styles/pointer.css'`，位置排在组件皮肤之前。
