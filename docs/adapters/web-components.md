# Web Components 适配器

`@xihan-ui/web-components` 把同一套无头内核封装为原生自定义元素。它采用一种不常见的形态：Light DOM 行为宿主。元素本身不渲染任何结构，结构由作者编写，元素只负责发现角色节点并写入属性与事件。

响应式基类为自研（`XhReactiveElement`），不依赖任何第三方运行时。

## 注册

```ts
import { defineXhElements } from "@xihan-ui/web-components/define";

defineXhElements(); // 注册全部 136 个 xh-* 元素
```

主入口的 `import` 本身不注册，必须显式调用这一行。注册是幂等的：同版本重复调用直接返回；同标签不同版本，或标签已被非 XiHan.UI 代码占用，都会抛错而不是静默覆盖。无 `customElements` 的环境（SSR）静默跳过。

背景层单独注册，不引入就不会把 WebGL 引擎打进包：

```ts
import { defineXhBackground } from "@xihan-ui/web-components/backgrounds";

defineXhBackground();
```

## 配置与视觉环境

`<xh-config>` 本身就是 Light DOM 局部 scope，八轴一次声明后会投影为 Core Portal 能桥接的标准属性：

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

局部 `motion` 只降低该子树的 CSS 动效，不隐式调用全局 `setMotionOverride`。应用根需要同时驱动 JS 动画时，用 `setXhConfig({ visualEnvironment: { root, initial, motionSink } })` 显式绑定；详见[设计令牌与主题](../guide/theme)。

## 结构由作者编写

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

接线后元素会向这些节点写入 `data-scope` / `data-part` / `aria-*` / `data-state` 与事件处理器，在 DevTools 中可以直接查看。

::: tip 为什么是 Light DOM 而不是 Shadow DOM
Shadow DOM 会封闭结构：无法更换标签、无法插入自定义节点、外部 CSS 无法进入、表单关联和 `aria-*` 跨边界引用都需要额外机制。本库的定位是行为可复用、外观完全由使用者决定，Light DOM 与之匹配。

代价是需要自行编写结构，因此必备部件的校验必须存在。
:::

## 部件契约校验

元素接线时比对作者编写的 DOM 与组件解剖，三种问题报告到[诊断通道](../guide/diagnostics)：

| 码 | 级别 | 触发条件 |
| --- | --- | --- |
| `wc.missing-part` | error | 缺必备角色节点，该部件不会被接线 |
| `wc.unknown-part` | warn | 角色节点的 part 名不在组件解剖内 |
| `wc.wrong-part-tag` | error | 角色节点用的标签不满足要求 |

第三条只登记写错即静默失效的情况。例如表单字段的 `label` 必须是原生 `<label>`，写成 `<div>` 会使 `for` 关联失效、点击标签不再聚焦控件，而页面看起来一切正常。

部分宿主会把内嵌部件的 DOM 铺在自己的 Light DOM 中接线（日期选择器之于日期输入与日历），这些角色节点由内嵌部件管理，通过契约中的 `delegates` 登记，不会被当作未知节点报警。

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

布尔属性使用三态转换器：属性缺席 = `undefined`（使用组件默认值），`="false"` = `false`，其余 = `true`。这个区分是必要的：`modal` 的默认值是 `true`，缺席与 `="false"` 不能区分时就无法关闭它。

## 事件

组件的变更以 `CustomEvent` 派发，`bubbles: true, composed: true`，事件名是 kebab-case：

```ts
document.querySelector("xh-dialog")
  .addEventListener("open-change", (e) => {
    console.log(e.detail.open); // { open: boolean }
  });
```

`detail` 即无头内核中的明细对象，与 Vue 适配器的 `value-change` 载荷完全一致。

## 生命周期

一台状态机对应一个控制器：

- `connectedCallback` → 创建状态机并 mount（旧状态机已停止时从 `initialState` 重建）；
- 每次更新 → 运行依赖追踪；
- `disconnectedCallback` → unmount。

角色节点的进出由 `MutationObserver` 监视，但只在确实有角色节点进出时才重新接线：业务内容（图表、虚拟列表、面板内的业务 DOM）的增删与部件集合无关。这条判断同时避免了一条死循环：角色节点若本身是会在属性变化时改写自身子节点的自定义元素，“宿主重新接线 → 写属性 → 该节点改子节点 → 再次命中观察器”会形成环。

属性观察同理只监视 `value` / `disabled` / `aria-disabled` 三个作者编写的声明，不监视状态机每帧写入的 `aria-*` / `data-*`，全量观察等于自我触发。

## 收起态

浮层关闭时使用内联 `style.display` 而不只依靠 `hidden` 属性：作者层若为该部件声明了 `display`，会覆盖 UA 的 `[hidden] { display: none }`，只靠 `hidden` 无法收起。

展开时恢复作者原本的内联值而不是清为空串：后者会把作者写在该节点上的 `style="display:grid"` 一并清除，且无法恢复。

## 多级菜单的 Portal 所有权

`<xh-menu submenu>` 仍由作者在父 Menu、ContextMenu 或 Menubar 的 Light DOM 中声明。展开时只有它的 `positioner` 会搬到所属 Document 的 `#xh-portal-root`：父菜单的磨砂 `backdrop-filter` 因此不会把 fixed 子层困在局部包含块。每层有自己的无盒 Portal 壳，壳会桥接触发条目祖先上的主题、品牌、密度、对比度、动效与文字方向。

搬运不会转移行为所有权。子菜单宿主继续观察并接线 positioner 里的动态部件，父宿主通过内部逻辑 owner 给 trigger 补齐父层 item 身份；末级选择按叶到根关闭，并只由根派发一次 `select`。关闭、断连或 trigger 换代时，positioner 会恢复到原占位。展开期间应持有部件引用或从 `ownerDocument` 查询，不能假设 `submenu.querySelector(...)` 仍能找到已搬走的 positioner。

## 升级前

自定义元素在 JS 到达之前不会升级，这段时间 `data-scope` / `data-part` 尚未写入，浮层内容会以裸文本出现在页面流中。`@xihan-ui/styles` 的 `undefined.css` 用 `:not(:defined)` 配合作者编写的 `data-xh-part` 先收起浮层子树，见[皮肤与样式分层](../guide/styling#升级前的形态)。

## 自定义元素清单

包内附带 `custom-elements.json`（CEM 格式），包含 136 个元素的标签名、属性、事件、CSS part。编辑器与框架的自定义元素支持可以直接读取它获得补全与类型提示。

清单由构建生成，`pnpm gate:cem` 会重新生成后比对，修改元素后未重新生成会被拦截。

## 与 Vue 适配器的关系

两者运行同一个状态机、同一份 `connect`，输出的 DOM 属性完全一致。文档站每个组件页的示例多套写法并排，便于逐帧对照。

在同一页面共存没有问题：诊断通道是全局的、层栈按文档共享，两套适配器的浮层会正确叠放在同一层栈中。

## 相关

- [组件参考](../components/)：每个组件的标签名与必备部件
- [解剖与部件契约](../guide/anatomy)
- [诊断通道](../guide/diagnostics)
