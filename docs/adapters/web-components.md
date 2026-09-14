# Web Components 适配器

`@xihan-ui/web-components` 把同一套无头内核包成原生自定义元素。它有一个不常见的形态：**Light-DOM 行为宿主**——元素本身不渲染任何结构，结构由你手写，元素只负责发现角色节点并往上挂属性与事件。

响应式基类是自研的（`XhReactiveElement`），不依赖任何第三方运行时。

## 注册

```ts
import { defineXhElements } from "@xihan-ui/web-components/define";

defineXhElements(); // 注册全部 130 个 xh-* 元素
```

主入口的 `import` 本身**不注册**，必须显式调这一行。注册是幂等的：同版本重复调直接返回；同标签不同版本、或标签已被非 XiHan.UI 代码占用，都会抛错而不是静默覆盖。无 `customElements` 的环境（SSR）静默跳过。

背景层单独注册，不引就不会把 WebGL 引擎打进包：

```ts
import { defineXhBackground } from "@xihan-ui/web-components/backgrounds";

defineXhBackground();
```

## 配置与视觉环境

`<xh-config>` 本身就是 Light DOM 局部 scope，七轴一次声明后会投影为 Core Portal 能桥接的标准属性：

```html
<xh-config
  mode="dark"
  brand="acme"
  density="compact"
  direction="rtl"
  contrast="more"
  motion="reduce"
  transparency="reduce"
>
  <my-workspace></my-workspace>
</xh-config>
```

局部 `motion` 只降低该子树的 CSS 动效，不会隐式调用全局 `setMotionOverride`。应用根需要同时驱动 JS 动画时，用 `setXhConfig({ visualEnvironment: { root, initial, motionSink } })` 显式绑定；详见[设计令牌与主题](../guide/theme)。

## 结构由你写

```html
<xh-dialog>
  <button data-xh-part="trigger">打开对话框</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h3 data-xh-part="title">确认操作</h3>
      <p data-xh-part="description">这条操作不可撤销。</p>
      <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
    </div>
  </div>
</xh-dialog>
```

接线后元素会往这些节点上打 `data-scope` / `data-part` / `aria-*` / `data-state` 与事件处理器。打开 DevTools 能直接看到。

::: tip 为什么是 Light DOM 而不是 Shadow DOM
Shadow DOM 会把结构封在里面：你改不了标签、插不进自己的节点、外部 CSS 进不去、表单关联和 `aria-*` 跨边界引用都要额外机制。这套库的定位是「行为可复用、外观完全由你定」，Light DOM 才对得上。

代价是你得自己写结构。这也是为什么必备部件的校验必须存在。
:::

## 部件契约校验

元素接线时会比对你写的 DOM 与组件解剖，三种问题上报到[诊断通道](../guide/diagnostics)：

| 码 | 级别 | 触发条件 |
| --- | --- | --- |
| `wc.missing-part` | error | 缺必备角色节点，该部件不会被接线 |
| `wc.unknown-part` | warn | 角色节点的 part 名不在组件解剖内 |
| `wc.wrong-part-tag` | error | 角色节点用的标签不满足要求 |

第三条只登记「写错了会**静默失效**」的情况。比如表单字段的 `label` 必须是原生 `<label>`，写成 `<div>` 会让 `for` 关联整条失效、点标签不再聚焦控件——但页面看起来一切正常。

有的宿主会把内嵌部件的 DOM 摊在自己的 Light DOM 里接线（日期选择器之于日期输入与日历就是这样），这些角色节点归内嵌部件管，通过契约里的 `delegates` 登记，不会被当成野节点报警。

## 属性

属性遵循自定义元素惯例：kebab-case 的 HTML attribute ↔ camelCase 的 JS property。

```html
<xh-dialog default-open modal="false" role="alertdialog">
```

```ts
const dialog = document.querySelector("xh-dialog");
dialog.open = true; // 受控
dialog.closeOnEscape = false;
```

布尔属性用**三态转换器**：属性缺席 = `undefined`（用组件默认值），`="false"` = `false`，其余 = `true`。这个区分是必要的——`modal` 的默认值是 `true`，如果缺席和 `="false"` 不能区分，就没法把它关掉。

## 事件

组件的变更以 `CustomEvent` 派发，`bubbles: true, composed: true`，事件名是 kebab-case：

```ts
document.querySelector("xh-dialog")
  .addEventListener("open-change", (e) => {
    console.log(e.detail.open); // { open: boolean }
  });
```

`detail` 就是无头内核里那个明细对象，与 Vue 适配器的 `value-change` 载荷完全一致。

## 生命周期

一台机器一个控制器：

- `connectedCallback` → 建机器并 mount（旧机器已停止时从 `initialState` 重建）；
- 每次更新 → 跑依赖追踪；
- `disconnectedCallback` → unmount。

角色节点的进出由 `MutationObserver` 监视，但只在**真有角色节点进出**时才重新接线——业务内容（图表、虚拟列表、面板里的业务 DOM）的增删与部件集合无关。这条判断同时断掉一条死循环：角色节点若本身是会在属性变化时改写自身子节点的自定义元素，「宿主重新接线 → 写属性 → 该节点改子节点 → 又命中观察器」会闭成环。

属性观察同理只盯 `value` / `disabled` / `aria-disabled` 三个**作者写的声明**，不盯机器每帧写上去的 `aria-*` / `data-*`——全量观察等于自己触发自己。

## 收起态

浮层关闭时用**内联 `style.display`** 而不是只靠 `hidden` 属性：作者层若给这个部件声明了 `display`，会盖过 UA 的 `[hidden] { display: none }`，光靠 `hidden` 收不起来。

展开时还回作者原本的内联值而不是清成空串——后者会把你写在该节点上的 `style="display:grid"` 一并抹掉，且再也回不来。

## 多级菜单的 Portal 所有权

`<xh-menu submenu>` 仍由作者在父 Menu、ContextMenu 或 Menubar 的 Light DOM 中声明。展开时只有它的 `positioner` 会搬到所属 Document 的 `#xh-portal-root`：父菜单的磨砂 `backdrop-filter` 因此不会把 fixed 子层困在局部包含块。每层有自己的无盒 Portal 壳，壳会桥接触发条目祖先上的主题、品牌、密度、对比度、动效与文字方向。

搬运不会转移行为所有权。子菜单宿主继续观察并接线 positioner 里的动态部件，父宿主通过内部逻辑 owner 给 trigger 补齐父层 item 身份；末级选择按叶到根关闭，并只由根派发一次 `select`。关闭、断连或 trigger 换代时，positioner 会恢复到原占位。展开期间应持有部件引用或从 `ownerDocument` 查询，不能假设 `submenu.querySelector(...)` 仍能找到已搬走的 positioner。

## 升级前

自定义元素在 JS 到达之前不会升级，那段时间 `data-scope` / `data-part` 都还没打上，浮层内容会以裸文本堆在页面流里。`@xihan-ui/styles` 的 `undefined.css` 用 `:not(:defined)` 配合作者写的 `data-xh-part` 先把浮层子树收起来，见[皮肤与样式分层](../guide/styling#升级前的形态)。

## 自定义元素清单

包内附带 `custom-elements.json`（CEM 格式），130 个元素的标签名、属性、事件、CSS part 都在里面。编辑器与框架的自定义元素支持可以直接读它拿到补全与类型提示。

清单由构建生成，`pnpm gate:cem` 会重跑生成后比对——改了元素忘了重新生成会被拦下。

## 与 Vue 适配器的关系

两者跑同一个机器、同一份 `connect`，输出的 DOM 属性完全一致。文档站每个组件页的示例两套写法并排，就是为了逐帧对照。

在同一页面共存没有问题：诊断通道是全局的、层栈按文档共享，两套适配器的浮层会正确地叠在同一摞里。

## 相关

- [组件参考](../components/)：每个组件的标签名与必备部件
- [解剖与部件契约](../guide/anatomy)
- [诊断通道](../guide/diagnostics)
