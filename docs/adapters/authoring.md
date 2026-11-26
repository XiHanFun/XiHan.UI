# 编写自己的元素

`@xihan-ui/web-components/authoring` 公开库内元素所用的那套基础件，供设计器等第三方编写同样形态的 Light DOM 元素：自研的响应式基类、布尔属性的三态转换器、按 key 复用生成节点、事件派发、元素注册、读取全局配置与文案的控制器，以及元素自己当配置作用域时用的接口与变更通知。这个子入口不含库内的元素类，Node 下可以安全 import。元素形态本身（Light DOM 行为宿主、属性与事件的约定、生命周期）见 [Web Components 适配器](./web-components)。

```ts
import type { KeyedChildren, PropertyValues } from "@xihan-ui/web-components/authoring";
import {
  BOOLEAN_CONVERTER,
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
    compact: { converter: BOOLEAN_CONVERTER },
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
| `XhReactiveElement` | 响应式基类。渲染根就是元素自身（Light DOM）；`static properties` 声明字段，声明键只认 `attribute`（`false` 不观察，字符串指定属性名，缺省为字段名转小写）、`type`（`Boolean` / `Number` / `Object` / `Array`，其余按字符串）与 `converter`；布尔属性写 `converter: BOOLEAN_CONVERTER`，不写 `type: Boolean`（后者按 HTML 原生规矩，`="false"` 也是真）；属性单向转成字段，不回写；同一拍里的多次写入合并成一轮更新；生命周期为 `update(changed)`（覆盖时必须调 `super.update(changed)`）、`firstUpdated`、`updated`，另有 `requestUpdate()`、`updateComplete` 与控制器；元素升级前就赋在实例上的值在连上文档时经访问器写回，先写声明的字段，再按赋值次序写子类手写的带 set 的访问器 |
| `BOOLEAN_CONVERTER` | 布尔属性的三态转换器，与库内元素同一个：没写这个 attribute 为 `undefined`（交给缺省值），写 `"false"` 为 `false`，其余写法（空串、`"true"` 与别的值）为 `true`。缺省为真的开关因此写得出「关」，移除 attribute 回到缺省 |
| `reconcile(parent, items, keys, keyOf, make, mark?)` | 按 key 把一组节点排进父节点：已有的复用、缺的新建、多的移除，次序与输入一致；作者写在父节点里的节点不动，生成的节点排在它们之后。给了 `mark` 时只认、只摘生成标记等于它的节点，同一父节点里另一套生成逻辑写的节点不动 |
| `createGeneratedElement(doc, tag, attributes?, children?)` / `generatedChildren(parent)` | 建一个带生成标记（`GEN_ATTR`，即 `data-xh-gen`）的 HTML 节点，可同时按属性表写上属性、依次放入子节点（字符串作为文本） / 取父节点里生成的直接子节点（给了第二个参数时只取生成标记等于它的）；SVG 节点用 `createElementNS(SVG_NS, tag)` 建好后自己加 `GEN_ATTR` |
| `createAuthoredElement(doc, tag, attributes?, children?)` | 同上，但不带生成标记，节点就像作者手写的：用代码搭库内元素的 Light DOM 结构（`data-xh-part` 角色节点、空状态与提示框里的自定义内容）时用它。带生成标记的子节点会被宿主当作自己生成的节点——补结构时收走，判断有没有作者内容时略过 |
| `setAttributes(element, attributes)` / `setText(element, text)` | 按属性表更新属性、改写文本，值没变时不写。属性表 `ElementAttributes` 里 `false` 与 `undefined` 删除该属性，`true` 写成空串。库内元素监听子树里角色节点的增删与声明属性的改写来重新接线，每轮更新都重写同样的值会白白触发重新接线 |
| `emitEvent(target, type, detail?, { bubbles?, cancelable? })` | 与库内元素同一约定派发 `CustomEvent`：缺省 `bubbles: true, composed: true`，与原生事件同名、冒泡会被祖先误认的（如 `submit`）传 `bubbles: false`；不给 `detail` 时为 `null`；返回 `false` 表示被 `preventDefault` |
| `registerElement(tag, ctor)` | 注册元素：同一构造器重复注册不报错，标签被别的构造器占用时抛错，没有 `customElements` 的环境跳过；不写任何全局登记表 |
| `XhConfigController` | 元素连上文档后订阅所在子树的配置，`setXhConfig` 或祖先 `<xh-config>` 变化时自动请求更新；`config`、`locale` 现解析，`translations(component, defaults, own?)` 按 defaults < 配置里那一桶 < 元素自己的顺序叠加，值为 `undefined` 的键视为没给 |
| `XhConfigScope` / `XhConfig` | 配置作用域的接口与配置的类型：元素带一个 `xhConfig` 字段就是一层作用域（`<xh-config>` 也是这样认的），子树里的元素沿逻辑祖先链逐层并入它；同一个作用域要对子树里不同节点给不同配置时再实现 `xhConfigFor(node)` |
| `notifyXhConfigChange(root?)` | 配置变了通知订阅者重画。自定义元素当作用域时，改了它的 `xhConfig` 就调 `notifyXhConfigChange(this)`：它子树里已渲染的元素（含搬进 Portal 的浮层内容）照新配置重画，不调则照旧。不给 `root` 时通知整页 |

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

元素自己也能当一层配置作用域，比如设计器单独设语言：声明 `xhConfig` 字段，改了它就调 `notifyXhConfigChange(this)`。

```ts
import type { XhConfig, XhConfigScope } from "@xihan-ui/web-components/authoring";
import { notifyXhConfigChange, XhReactiveElement } from "@xihan-ui/web-components/authoring";

class XhMyDesigner extends XhReactiveElement implements XhConfigScope {
  xhConfig: XhConfig = {};

  setLanguage(pack: XhConfig): void {
    this.xhConfig = pack;
    notifyXhConfigChange(this);
  }
}
```

## 相关

- [Web Components 适配器](./web-components)
- [三端共同约定](./)
- [全局配置 · 自定义元素侧](../runtime/config#自定义元素侧)
