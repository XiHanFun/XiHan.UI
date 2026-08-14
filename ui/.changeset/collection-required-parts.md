---
"@xihan-ui/vue": patch
---

「collection 铺开的结构凑齐必备部件」这条判据改成机检，并把三档语义写进文档。

`collection` 收了数据不等于会替你渲染结构，而这件事此前既没有对外判据、也没有任何东西守着：
14 个组件里 13 个在根上代铺、popselect 只在 content 里铺，使用者只能一个个试。
官网落地时那棵树就是把数据写了一遍、DOM 又手码了一遍，两份得自己保持同步。

新增 `tests/collection-required-parts.spec.ts`：逐个组件只交 `collection`、不写任何部件，
断言铺出来的 DOM 含该组件 `meta.requiredParts` 里的每一个部件。少一个就是渲染出一个
看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、同一份结构写到自定义元素那侧
会报 `wc.missing-part`。给新组件加代铺时先往这份测试加一行，铺漏了当场红。

顺带查出并钉住两处此前没人测的差别：`popselect` 的铺开落在 content 部件里而不是根上
（`<XhPopselectRoot :collection>` 单独用什么都不出），`mention` 的候选浮层没有 `defaultOpen`、
敲下前缀字符才铺开。

`guide/anatomy.md` 补「collection 管不管铺开结构」一节，三档逐个列出组件名，
并写明判据是结构的自由度：扁平集合的 DOM 形状是确定的，代铺挡不住任何写法；
层级与多区（`tree` / `cascader` / `transfer`）的结构有太多合理变体，代铺只会逼作者推翻重写。
