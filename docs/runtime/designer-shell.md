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

## 问题列表

`<xh-designer-issues>` 列出结构问题。文字由设计器换好，零件只管排列、过滤与定位。

```ts
const list = document.createElement("xh-designer-issues");
list.items = issues.map(issue => ({ issue, message: t(issue), subject: nameOf(issue.target) }));
list.addEventListener("issue-activate", event => select(event.detail.issue.target));
list.addEventListener("issue-hover", event => highlight(event.detail.issue?.target));
```

| 属性 | 说明 |
| --- | --- |
| `items` | `{ issue, message, subject?, source? }[]`：`issue` 是 `SchemaIssue`，`subject` 是对象名，`source` 显示为来源小标签 |
| `group-by` | `severity`（缺省）错误在前、警告在后；`none` 按传入顺序 |
| `empty-text` | 没有问题时的提示 |
| `readonly` | 列表没有修改类操作，只读时照常浏览与定位 |

| 事件 | detail |
| --- | --- |
| `issue-activate` | `{ issue, index }`：点击或回车；`index` 是在 `items` 里的下标 |
| `issue-hover` | `{ issue }`：指针移到条目上；移出列表时 `issue` 为 `undefined` |

- 头部的错误、警告两个开关带条数，过滤状态在换 `items` 后保留。
- 有 `target` 的条目是按钮，方向键、Home、End 在它们之间移动焦点；没有 `target` 的条目只显示，不可激活。

## 小地图

`<xh-designer-minimap>` 按比例画出设计器给的图形与当前视口的范围。按下或拖动时派发 `navigate`，由设计器把视口中心移过去。

```ts
const map = document.createElement("xh-designer-minimap");
map.shapes = nodes.map(node => ({ kind: "rect", rect: node.rect }));
map.viewport = viewport;
map.canvasSize = { width: canvas.clientWidth, height: canvas.clientHeight };
map.addEventListener("navigate", event => setViewport(centerOn(viewport, event.detail.center, map.canvasSize)));
```

| 属性 | 说明 |
| --- | --- |
| `shapes` | 世界坐标的图形：`{ kind: "rect", rect, tone? }`（`tone` 为 `muted` 时取淡色）或 `{ kind: "path", d }` |
| `bounds` | 内容范围，缺省取全部矩形的外包；路径伸出矩形之外时由设计器给出 |
| `viewport` / `canvasSize` | 画布的视口与屏幕尺寸，两者都给时画出视口框 |
| `readonly` | 小地图只做导航，只读时照常可用 |

- 比例把内容与视口范围一并装下；拖动期间比例与位置保持不变，松手后重新适配。
- 没有图形时收起（`data-empty`），整块 `aria-hidden`，不进 Tab 顺序。
- 零件只画自身的框，摆在画布的哪个角由设计器决定。

## 物料面板与拖放

`<xh-designer-palette>` 按分组列出物料。点击、回车、空格或触屏轻点派发 `item-activate`，设计器一般把物料加到视口中央；按下拖动（触屏长按）经下面的通用拖放拖向画布。

```ts
const palette = document.createElement("xh-designer-palette");
palette.groups = [{ id: "human", label: "人工处理", items: [{ id: "approve", label: "审批", payload: { type: "approve" } }] }];
palette.addEventListener("item-activate", event => addAtCenter(event.detail.payload));
```

| 属性 | 说明 |
| --- | --- |
| `groups` | `{ id, label, items }[]`，物料为 `{ id, label, icon?, description?, disabled?, payload? }`；`icon` 是图标记录，`description` 显示在名称下方 |
| `searchable` | 显示搜索框，按名称过滤 |
| `collapsible` | 分组可折叠，折叠状态按分组 id 保留；搜索时匹配的分组一律展开 |
| `readonly` | 物料只能浏览，不派发 `item-activate`、不能拖出 |

| 事件 | detail |
| --- | --- |
| `item-activate` | `{ id, payload }` |

- 方向键、Home、End 在物料间移动焦点，禁用的物料也能停留，读屏照样念出。
- 从物料拖出时的载荷是 `{ source: "palette", id, payload }`。

### 通用拖放

物料面板之外的拖动源（如字段树）也用这两个函数。坐标一律是浏览器视口坐标，设计器自己换算成世界坐标。

```ts
import { registerDropTarget, startDrag } from "@xihan-ui/designer-shell";

const unregister = registerDropTarget(canvas, {
  over: (point, payload) => ({ accept: payload.source === "palette", ghost: "hide" }),
  drop: (point, payload) => addAt(clientToWorld(point), payload.payload),
  leave: () => clearDropPreview(),
});
canvas.addEventListener("pan-request", event => setViewport(panBy(viewport, -event.detail.dx, -event.detail.dy)));

field.addEventListener("pointerdown", event => startDrag(event, { payload: { source: "field", path } }));
```

| 函数 | 说明 |
| --- | --- |
| `startDrag(event, { payload, source?, preview?, onEnd? })` | 从一次指针按下开始拖动，返回 `{ active, cancel }`。`preview` 缺省为拖动源的缩小副本，按下处保持在指针下；给 `null` 不显示。`onEnd` 收到 `{ dragged, dropped }`，拖过之后可借它吞掉随后的点击 |
| `registerDropTarget(element, { over, drop, leave? })` | 把元素登记为放置目标，返回取消登记的函数。`over(point, payload)` 答复 `{ accept, ghost? }`，`ghost` 为 `hide` 时藏起预览、由目标自己画落点；`leave` 在指针离开、取消或在不接受处松手时调用 |

- 鼠标与笔移动过激活距离才开始拖；触屏长按开始拖，长按前先移动即视为滚动，开始拖之后不再滚动页面。
- 命中取指针下最内层的放置目标，预览不挡命中。
- 贴着接受的目标边缘时逐帧在目标上派发 `pan-request` `{ dx, dy }`：视口要朝哪个方向看过去多少屏幕像素，贴右边缘时 `dx` 为正。
- Esc、指针离开窗口、在不接受处松手即取消。

## 变换覆盖层

`<xh-designer-transform>` 叠在画布上方，画选中框、控制柄、旋转柄、对齐线、框选框、悬停框与度量标签，并跑移动、缩放、旋转与框选的手势。命中判断归设计器：设计器在选中项上按下后调 `startMove`，在空白处按下后调 `startMarquee`；控制柄由覆盖层自己接。覆盖层盖满画布、左上角就是视口的屏幕原点，除控制柄外不挡指针。

```ts
const overlay = document.createElement("xh-designer-transform");
canvas.append(overlay);
overlay.viewport = viewport;
overlay.items = selection.map(node => ({ id: node.id, rect: node.rect, rotatable: false }));
overlay.getSnap = () => ({ targets: others.map(node => node.rect), lines: guides, grid: 8 });
canvas.addEventListener("pointerdown", (event) => {
  const hit = hitTest(clientToWorld(event), rects);
  if (hit >= 0)
    overlay.startMove(event);
  else
    overlay.startMarquee(event, { additive: event.shiftKey });
});
overlay.addEventListener("transform", (event) => {
  const { phase, rects, copy } = event.detail;
  if (phase === "end")
    commit(rects, copy);
});
```

| 属性 | 说明 |
| --- | --- |
| `viewport` | 画布的视口 |
| `items` | 选中项 `{ id, rect, handles?, rotatable?, keepAspect?, minSize? }`。`handles` 缺省 `true` 为八向，`false` 不能缩放，数组为只给这些方向；`rotatable` 缺省不显示旋转柄；`keepAspect` 为总是等比 |
| `hover` | 悬停框，世界坐标 |
| `getSnap(kind)` | 每次手势开始时取一次吸附选项，交给 `snapRect`；`threshold` 不给时取屏幕上的固定像素除以 `zoom` |
| `formatMeasure(rect)` | 拖动中的尺寸与位置标签；不给不显示 |
| `rotate-step` | 按住 Shift 旋转时吸附的角度，缺省 15 |
| `readonly` | 不画控制柄，`startMove` 不起作用；框选照常 |

| 方法 | 说明 |
| --- | --- |
| `startMove(event, { copy? })` | 越过激活距离后移动全部选中项 |
| `startMarquee(event, { additive? })` | 越过激活距离后开始框选 |
| `cancel()` | 取消进行中的手势，派发 `cancel` |

| 事件 | detail |
| --- | --- |
| `transform` | `{ phase, kind, rects, guides, copy? }`：`phase` 为 `start`、`move`、`end`、`cancel`，`kind` 为 `move`、`resize`、`rotate`，`rects` 是 id 到新矩形的表，`cancel` 时为开始时的矩形；`copy` 只在移动时有 |
| `marquee` | `{ phase, rect, mode, additive }`：`rect` 是世界坐标的选框，`mode` 自左向右拖为 `contain`、反向为 `intersect`，交给 `selectInMarquee` |
| `pan-request` | `{ dx, dy }`：拖到画布边缘时逐帧派发，含义与通用拖放相同 |

- 修饰键：缩放时 Shift 等比、Alt 以中心为基准；旋转时 Shift 按 `rotate-step` 吸附；移动时 Shift 锁定水平或竖直、Alt 为复制。修饰键在拖动中按下也算。Esc 取消。
- 设计器在 `move` 阶段是只看预览还是执行事务自行决定；手势进行中覆盖层按自己算出的矩形画框，不等 `items` 更新。
- 单选才出控制柄；多选画各自的细框与整体包围框，可以整体移动。缩放时只吸附被拖动的那条边，旋转过的矩形缩放时不吸附。
- 控制柄是固定的屏幕尺寸，按旋转后的方向画，指针形状随角度换；粗指针设备放大命中区。
