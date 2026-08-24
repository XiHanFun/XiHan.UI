---
"@xihan-ui/vue": patch
---

修 XhJsonViewerRoot 的 value 在类型上被推成 undefined：任何跑 vue-tsc 的工程传真实数据都编译不过。

`type: null as unknown as PropType<unknown>` 这个断言把 `null` 伪装成了 PropType，
绕开了 Vue 的 InferPropType 中 `{ type: null | true } → any` 那条专为「任意类型」准备的分支，
于是掉进 `IfAny<V, V, D>` 落到 D —— 也就是 `default` 的类型 `undefined`。
结果是这个 prop 除 undefined 外什么都不收，`v-bind` 展开也一样被拦（TS2345）。

运行期一直是好的（`as` 断言会被擦除，`type` 的运行期值就是 null，Vue 不据此校验），
所以这是纯编译期缺陷；但库自己的示例 demos/json-viewer/01-basic.vue 就过不了类型检查。

给 default 标注 `as unknown`，推导结果与 headless 契约 `value?: unknown` 对齐。
