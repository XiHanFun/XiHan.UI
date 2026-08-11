# @xihan-ui/headless

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

- e788896: Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

  多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
  的容器形状统一成了数组（单选恒为长度 ≤ 1）。

  迁移点：

  - `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
    的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
  - `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
    `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
    想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
    否则取 `placeholder`。
  - Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
    因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
  - WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
    新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
    表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
    `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/machine@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0
