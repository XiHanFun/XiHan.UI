---
'@xihan-ui/web-components': minor
---

新增子入口 `@xihan-ui/web-components/authoring`，供设计器等第三方编写与库内元素同一形态的 Light DOM 自定义元素。

- 公开响应式基类 `XhReactiveElement` 与 `PropertyDeclaration`、`PropertyDeclarations`、`PropertyValues`、`AttributeConverter`、`ComplexAttributeConverter`、`ReactiveController`、`ReactiveControllerHost` 等类型。
- 元素升级前就赋在实例上的值，连上文档时经访问器写回：声明过的字段，以及子类手写的带 set 的访问器（如设计器的 `schema`）。宿主先给元素赋值、后加载并注册元素时（如按需加载设计器模块），值照样生效。
- 公开生成节点的辅助件：`reconcile` 按 key 复用、新建、移除节点；`createGeneratedElement` 建带生成标记的节点；`generatedChildren` 取生成的子节点；另有 `GEN_ATTR`、`SVG_NS` 与 `KeyedChildren` 类型。
- 新增 `emitEvent`：按库内元素的约定派发 `CustomEvent`（冒泡、穿过 shadow 边界），返回是否未被 `preventDefault`。
- 新增 `registerElement`：同一构造器重复注册不报错，标签被别的构造器占用时抛错，没有 `customElements` 的环境跳过，不写全局登记表。
- 新增 `XhConfigController`：订阅所在子树的配置并在变化时请求更新，读取 `config`、`locale` 与按组件叠加的 `translations`。第三方文案以语言包的形式交给 `setXhConfig` 或 `<xh-config>`，类型经声明合并补进 `XhTranslationOverrides`。
