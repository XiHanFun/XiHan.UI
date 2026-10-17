# Web Components 适配器

`@xihan-ui/web-components` 把同一套无头内核封装为原生自定义元素。它采用一种不常见的形态：Light DOM 行为宿主。元素本身不渲染任何结构，结构由作者编写，元素只负责发现角色节点并写入属性与事件。

响应式基类为自研（`XhReactiveElement`），不依赖任何第三方运行时。

## 注册

```ts
import { defineXhElements } from "@xihan-ui/web-components/define";

defineXhElements(); // 注册全部 147 个 xh-* 元素
```

主入口的 `import` 本身不注册，必须显式调用这一行。注册是幂等的：同版本重复调用直接返回；同标签不同版本，或标签已被非 XiHan.UI 代码占用，都会抛错而不是静默覆盖。无 `customElements` 的环境（SSR）静默跳过。

只用到其中几个元素时逐个注册。每个元素类都从 `./define` 导出，`defineXhElement` 与全量注册走同一张注册表，幂等与冲突规则相同；标签与元素类由 `XhElementTagMap` 约束，写错一侧类型检查不通过：

```ts
import { defineXhElement, XhStatisticElement, XhTableElement } from "@xihan-ui/web-components/define";

defineXhElement("xh-statistic", XhStatisticElement);
defineXhElement("xh-table", XhTableElement);
```

标记里嵌套的其它 `xh-*` 元素要各自注册，没注册的标签只是普通的未知元素。元素自己接线的内嵌部件（日期选择器里的日期输入与日历、选择器里的标签、侧边导航的名称提示）不在此列：它们的状态机跑在宿主身上，不用注册对应的元素。

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

### 不写结构：按标准结构生成

有标准结构的元素（目前是热力图、选择器、切换按钮组、组合框、文本框、数字输入框、开关、标签输入框、日期输入框、手风琴、标签页、树选择、菜单、单选组、复选组、密码框、滑块、评分、颜色输入框、分隔线、卡片、复选框、分格输入、字段组、签名板、字段、取色器与穿梭框，逐批扩到表单控件与容器）可以不写结构，元素按组件的标准结构自己生成部件树。标准结构与 Vue / React 不写插槽时的缺省树出自同一个结构函数，三端的 DOM 一致。

```html
<xh-heatmap start-date="2024-01-01" end-date="2024-03-31"></xh-heatmap>
```

生成按下面几条规则：

- 宿主里没有作者写的部件节点时连 root 一起生成；只写了 `root` 时生成在它里面。
- 作者写了 root 以外的部件，整棵结构就归作者，元素撤掉生成过的节点，与手写结构的写法完全一样。少数部件可以单独接管：写在 root 里，其余照常生成，如热力图的 `tooltip`、`empty`、`legend`。各组件页写明有哪些。能接管的只有排在 root 末尾或经 Portal 脱离文档流的部件，作者写的这些部件由元素按缺省结构的先后排到 root 末尾，DOM 序与 Tab 序和不写时一致。
- 生成的节点带 `data-xh-gen="structure"`，按身份复用：数据变化时只改动变了的节点，换序时焦点所在的节点照旧有焦点。经 Portal 搬走的浮层节点留在落点，收起后由 Portal 放回原位。段与段之间的分隔符这类装饰文字生成为只装这段文字的 `span`，不带部件名。
- 部件里要放作者内容的（标签页的面板、手风琴的内容等），作者在宿主的直接子节点上写 `slot`，元素把它搬进对应的部件。单个的部件写 `slot="<名>"`，按条目重复的部件写 `slot="<名>:<条目键>"`。搬进去以后内容归作者，元素不改写；对应的部件没了时节点回到宿主，由作者自己移除。
- 结构里组合了另一个库内组件的实例（如条件行里的下拉），元素生成那个组件的元素（`<xh-select>`），由它按自己的标准结构生成内部结构。外层给它的数据按 property 赋值（数组、对象不写成 attribute），值没变就不重设；外层要接的事件由外层监听，不会冒出外层宿主。宿主元素类在 `static dependencies` 里登记这些组件，按需注册宿主（`defineXhElement`）时连带注册。委派给内嵌组件、只在自己的 Light DOM 里接线的部件不在其列，不连带注册。开发期生成了还没注册的库内元素时报 `wc.unregistered-element`；可接管部件没排在末尾的结构报 `wc.structure-takeover-order`，这一条是组件自身的问题。

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

数组与对象形态的初值只能走 property，而脚本常常排在元素连接之后才执行。状态第一次被写入之前，给 `default*` 赋值都算数：

```ts
const calendar = document.querySelector("xh-calendar-picker");
calendar.defaultValue = ["2026-09-18"]; // 元素早已连接，照样按这一天选中
```

写入（用户交互、方法调用、表单重置）之后再改 `default*` 不影响当前值，只改变表单重置的落点，与 Vue / React 一致，见[初值的读取时机](../guide/machine#初值的读取时机)。

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

- `connectedCallback` → 写回升级前赋在实例上的属性，再创建状态机并 mount（旧状态机已停止时从 `initialState` 重建）；
- 每次更新 → 状态尚未被写入而 `default*` 变了时，按新的初值重建状态机；再运行依赖追踪；
- `disconnectedCallback` → unmount。

角色节点的进出由 `MutationObserver` 监视，但只在确实有角色节点进出时才重新接线：业务内容（图表、虚拟列表、面板内的业务 DOM）的增删与部件集合无关。这条判断同时避免了一条死循环：角色节点若本身是会在属性变化时改写自身子节点的自定义元素，“宿主重新接线 → 写属性 → 该节点改子节点 → 再次命中观察器”会形成环。

属性观察同理只监视 `value` / `disabled` / `aria-disabled` 三个作者编写的声明，不监视状态机每帧写入的 `aria-*` / `data-*`，全量观察等于自我触发。

## 收起态

浮层关闭时使用内联 `style.display` 而不只依靠 `hidden` 属性：作者层若为该部件声明了 `display`，会覆盖 UA 的 `[hidden] { display: none }`，只靠 `hidden` 无法收起。

展开时恢复作者原本的内联值而不是清为空串：后者会把作者写在该节点上的 `style="display:grid"` 一并清除，且无法恢复。

## 多级菜单的 Portal 所有权

`<xh-menu submenu>` 仍由作者在父 Menu、ContextMenu 或 Menubar 的 Light DOM 中声明。展开时只有它的 `positioner` 会搬到所属 Document 的 `#xh-portal-root`：主题给父菜单开了透景时，它的 `backdrop-filter` 因此不会把 fixed 子层困在局部包含块。每层有自己的无盒 Portal 壳，壳会桥接触发条目祖先上的主题、品牌、密度、对比度、动效与文字方向。

搬运不会转移行为所有权。子菜单宿主继续观察并接线 positioner 里的动态部件，父宿主通过内部逻辑 owner 给 trigger 补齐父层 item 身份；末级选择按叶到根关闭，并只由根派发一次 `select`。关闭、断连或 trigger 换代时，positioner 会恢复到原占位。展开期间应持有部件引用或从 `ownerDocument` 查询，不能假设 `submenu.querySelector(...)` 仍能找到已搬走的 positioner。

## 升级前

自定义元素在 JS 到达之前不会升级，这段时间 `data-scope` / `data-part` 尚未写入，浮层内容会以裸文本出现在页面流中。`@xihan-ui/styles` 的 `undefined.css` 用 `:not(:defined)` 配合作者编写的 `data-xh-part` 先收起浮层子树，见[皮肤与样式分层](../guide/styling#升级前的形态)。

## 编写自己的元素

`@xihan-ui/web-components/authoring` 公开库内元素所用的那套基础件，供设计器等第三方编写同样形态的 Light DOM 元素：自研的响应式基类、按 key 复用生成节点、事件派发、元素注册，以及读取全局配置与文案的控制器。这个子入口不含库内的元素类，Node 下可以安全 import。

```ts
import type { KeyedChildren, PropertyValues } from "@xihan-ui/web-components/authoring";
import {
  createGeneratedElement,
  emitEvent,
  reconcile,
  registerElement,
  setAttributes,
  setText,
  XhConfigController,
  XhReactiveElement,
} from "@xihan-ui/web-components/authoring";

interface Step {
  id: string;
  label: string;
}

class XhStepList extends XhReactiveElement {
  static override properties = {
    steps: { attribute: false },
    compact: { type: Boolean },
  };

  declare steps: Step[] | undefined;
  declare compact: boolean | undefined;

  private readonly config = new XhConfigController(this);
  private readonly keys: KeyedChildren = new WeakMap();

  protected override update(changed: PropertyValues): void {
    super.update(changed);
    const t = this.config.translations("xh-step-list", { empty: "No steps" });
    this.dataset.empty = t.empty;
    reconcile(this, this.steps ?? [], this.keys, step => step.id, (step, reuse) => {
      const node = reuse ?? createGeneratedElement(this.ownerDocument, "button", { type: "button" });
      setAttributes(node, { "data-compact": this.compact });
      setText(node, step.label);
      node.onclick = () => emitEvent(this, "step-select", { id: step.id });
      return node;
    });
  }
}

registerElement("xh-step-list", XhStepList);
```

| 导出 | 说明 |
| --- | --- |
| `XhReactiveElement` | 响应式基类。渲染根就是元素自身（Light DOM）；`static properties` 声明字段，声明键只认 `attribute`（`false` 不观察，字符串指定属性名，缺省为字段名转小写）、`type`（`Boolean` / `Number` / `Object` / `Array`，其余按字符串）与 `converter`；属性单向转成字段，不回写；同一拍里的多次写入合并成一轮更新；生命周期为 `update(changed)`（覆盖时必须调 `super.update(changed)`）、`firstUpdated`、`updated`，另有 `requestUpdate()`、`updateComplete` 与控制器 |
| `reconcile(parent, items, keys, keyOf, make, mark?)` | 按 key 把一组节点排进父节点：已有的复用、缺的新建、多的移除，次序与输入一致；作者写在父节点里的节点不动，生成的节点排在它们之后。给了 `mark` 时只认、只摘生成标记等于它的节点，同一父节点里另一套生成逻辑写的节点不动 |
| `createGeneratedElement(doc, tag, attributes?, children?)` / `generatedChildren(parent)` | 建一个带生成标记（`GEN_ATTR`，即 `data-xh-gen`）的 HTML 节点，可同时按属性表写上属性、依次放入子节点（字符串作为文本） / 取父节点里生成的直接子节点（给了第二个参数时只取生成标记等于它的）；SVG 节点用 `createElementNS(SVG_NS, tag)` 建好后自己加 `GEN_ATTR` |
| `createAuthoredElement(doc, tag, attributes?, children?)` | 同上，但不带生成标记，节点就像作者手写的：用代码搭库内元素的 Light DOM 结构（`data-xh-part` 角色节点、空状态与提示框里的自定义内容）时用它。带生成标记的子节点会被宿主当作自己生成的节点——补结构时收走，判断有没有作者内容时略过 |
| `setAttributes(element, attributes)` / `setText(element, text)` | 按属性表更新属性、改写文本，值没变时不写。属性表 `ElementAttributes` 里 `false` 与 `undefined` 删除该属性，`true` 写成空串。库内元素监听子树里角色节点的增删与声明属性的改写来重新接线，每轮更新都重写同样的值会白白触发重新接线 |
| `emitEvent(target, type, detail, { cancelable? })` | 与库内元素同一约定派发 `CustomEvent`（`bubbles: true, composed: true`），返回 `false` 表示被 `preventDefault` |
| `registerElement(tag, ctor)` | 注册元素：同一构造器重复注册不报错，标签被别的构造器占用时抛错，没有 `customElements` 的环境跳过；不写任何全局登记表 |
| `XhConfigController` | 元素连上文档后订阅所在子树的配置，`setXhConfig` 或祖先 `<xh-config>` 变化时自动请求更新；`config`、`locale` 现解析，`translations(component, defaults, own?)` 按 defaults < 配置里那一桶 < 元素自己的顺序叠加，值为 `undefined` 的键视为没给 |

第三方元素的文案与内建组件走同一条路：元素自带语言包，形状与内建语言包相同，应用合并后交给全局配置，或用 `<xh-config>` 只作用于一棵子树。

```ts
import { mergeXhConfig, setXhConfig } from "@xihan-ui/web-components";
import { zhCN } from "@xihan-ui/web-components/locale";

const stepListZhCN = { translations: { "xh-step-list": { empty: "暂无步骤" } } };

setXhConfig(mergeXhConfig(zhCN, stepListZhCN));
```

文案桶的类型用声明合并补进 `XhTranslationOverrides`：

```ts
declare module "@xihan-ui/web-components" {
  interface XhTranslationOverrides {
    "xh-step-list"?: { empty?: string };
  }
}
```

## 自定义元素清单

包内附带 `custom-elements.json`（CEM 格式），包含 147 个元素的标签名、属性、事件、CSS part。编辑器与框架的自定义元素支持可以直接读取它获得补全与类型提示。

清单由构建生成，`pnpm gate:cem` 会重新生成后比对，修改元素后未重新生成会被拦截。

## 与 Vue 适配器的关系

两者运行同一个状态机、同一份 `connect`，输出的 DOM 属性完全一致。文档站每个组件页的示例多套写法并排，便于逐帧对照。

在同一页面共存没有问题：诊断通道是全局的、层栈按文档共享，两套适配器的浮层会正确叠放在同一层栈中。

## 相关

- [组件参考](../components/)：每个组件的标签名与必备部件
- [解剖与部件契约](../guide/anatomy)
- [诊断通道](../guide/diagnostics)
