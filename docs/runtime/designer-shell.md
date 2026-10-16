# 设计器零件

`@xihan-ui/designer-shell` 是画布式设计器共用的界面零件：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、问题列表、小地图与外框。打印、流程、表单、报表四款设计器用同一套零件，名字、手势与事件对齐。

```ts
import { defineDesignerShell } from "@xihan-ui/designer-shell";
import "@xihan-ui/designer-shell/style.css";

defineDesignerShell();
```

## 只出 Web Components

这个包是本库「组件三端齐备」惯例的例外：

- 只有 Web Components，没有 headless 契约，也没有 Vue 与 React 版本，不进三端一致性套件。四款设计器都以原生 Web Components 交付，这些零件只给设计器用，不是通用组件。
- 元素自己生成内部结构，不要求作者写 `data-xh-part` 的 Light DOM。部件用 `data-part` 标出，供样式与测试选取。作者内容用 `slot="<名>"` 标在零件的直接子节点上，零件把它搬进对应区域。
- 内部用到的库内元素（字段、开关、选择器、标签等）经 `defineXhElement` 按需注册，不全量注册 `@xihan-ui/web-components`。
- 样式随包发 `@xihan-ui/designer-shell/style.css`，只消费语义令牌，不进 `@xihan-ui/styles` 的组件槽与无层产物。

## 注册

| 函数 | 说明 |
| --- | --- |
| `defineDesignerShell()` | 注册全部零件，重复调用不报错 |
| `defineDesignerShellElement(tag, ctor)` | 按需注册一个零件；同名标签注册了别的类时抛错 |
| `DESIGNER_SHELL_ELEMENTS` | 标签名到元素类的登记表 |

## 约定

- 零件不持有文档、不碰历史栈：只吃数据、吐事件。改文档与记撤销由设计器做。
- 坐标只认 `@xihan-ui/designer-kit` 的视口：屏幕 = 世界 × `zoom` + (`x`, `y`)。世界单位由设计器定，`zoom` 就是一个世界单位等于多少屏幕像素。控制柄大小、吸附阈值、标尺厚度等固定尺寸一律按屏幕像素。
- 事件一律 `CustomEvent`，冒泡并穿过 shadow 边界，名字用短横线、不带前缀。
- 每个零件都有 `readonly`：只能浏览与选择，不出编辑手势、不派发修改类事件。
- 文案键是零件的标签名，自带英文缺省。中文在 `@xihan-ui/designer-shell/locale` 的 `designerShellZhCN`，各产品把它并进自己的语言包，宿主只合并一份产品包。

## 属性面板

`<xh-designer-properties>` 按 `@xihan-ui/designer-kit/properties` 的属性描述列出字段。设计器给出被编辑的对象，面板分组、挑编辑器、派发修改，自己不写文档。

```ts
const panel = document.createElement("xh-designer-properties");
panel.targets = [{ kind: "task", id: "t1", value: node, descriptors }];
panel.addEventListener("property-change", (event) => {
  const { path, value, targets, merge } = event.detail;
  history.execute(opsFor(targets, path, value), { merge, mergeWithin: Infinity });
});
panel.addEventListener("property-commit", () => history.seal());
```

| 属性 | 说明 |
| --- | --- |
| `targets` | 被编辑的对象 `{ kind, id, value, descriptors }`；空数组显示空状态，多个时只显示共同属性 |
| `editors` | 宿主编辑器表，按 `resolvePropertyEditor` 查找；查不到的内建种类用自带编辑器 |
| `groupOrder` / `groupLabel` | 分组的先后与标题，标题缺省显示分组 id |
| `labelOf` / `hintOf` | 字段的标签与说明；标签缺省取描述的 `label`，再缺省取 `formatJsonPath(path)` |
| `optionLabel` / `unitLabel` | select 选项与 number 单位的文案 |
| `errors` | 字段错误 `{ target, path, message }`，文字由设计器换好，`path` 相对对象 |
| `heading` | 标题下一行，如「表格 · t1」「已选中 3 个」 |
| `empty-text` | 空状态文案 |
| `toggle-limit` | select 单选且选项不超过它时改用切换按钮组；缺省不用 |
| `collapsible` | 分组可折叠，折叠状态按分组 id 保留，换选择不重置 |
| `readonly` | 字段只读，不派发修改 |

| 事件 | detail |
| --- | --- |
| `property-change` | `{ path, value, targets, merge }`：每次输入都派发，`value` 为 `undefined` 表示清除；`merge` 是合并键，交给历史栈的 `execute` |
| `property-commit` | `{ path }`：一次编辑结束（失焦、改选、切换、回车），设计器封口 |

- 共同属性是每个对象都有、`path` 相同、`control` 按 JSON 相等的那些；任一对象上不显示即不显示。取值不同时字段留空，显示占位「多个值」，宿主编辑器拿到的 `value` 为 `undefined`。
- 字段用 `<xh-field>` 包库内控件，标签、说明与错误接到控件的可聚焦部件上。换选择只换数据时，同一属性、同一编辑器的字段原样复用，焦点与光标不丢。
- 宿主编辑器的 `setValue` 与 `commit` 也走这两个事件。
- 插槽 `header` 在标题下方（如部位导航），`footer` 在字段之后（如「删除列」）。
- `focusField(path)` 把焦点交给该属性的字段，找不到时返回 `false`。
