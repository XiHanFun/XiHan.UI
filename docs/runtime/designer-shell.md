# 设计器零件

`@xihan-ui/designer-shell` 是画布式设计器共用的界面零件：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、问题列表、小地图、外框与设置对话框。打印、流程、表单、报表四款设计器用同一套零件，名字、手势与事件对齐。

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
- 每个零件都有 `readonly`：只能浏览与选择，不出编辑手势、不派发修改类事件。零件的布尔 attribute 与库内元素同一个三态读法：`readonly="false"` 不只读，不写交给缺省。
- 文案键是零件的标签名，自带英文缺省。各语言的文案在 `@xihan-ui/designer-shell/locale`，与 UI 的内建语言包一一对应，导出名是 `designerShell` 加 UI 的语言包名，如 `jaJP` 对 `designerShellJaJP`。各产品把同一语言的这一份并进自己的语言包，宿主只合并一份产品包。

## 属性面板

`<xh-designer-properties>` 按 `@xihan-ui/designer-kit/properties` 的属性描述列出字段。设计器给出被编辑的对象，面板分组、挑编辑器、派发修改，自己不写文档。

面板生成的部件都带 `data-scope="designer-properties"`，样式只认它：`header`、`footer` 插槽与宿主编辑器里的作者内容，即使也用了 `data-part="title"` 之类的部件名，也不受面板样式影响。

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
| `optionLabel` / `unitLabel` | select 选项与 number、sides 单位的文案；单位文案为空串时不显示后缀 |
| `dataFields` | `dataField` 选字段与 `filter` 列字段用的字段树（designer-kit 的 `DataField`）：描述里没写 `fields` 的绑定字段与条件树共用这一份；两处都没有时 `dataField` 是输入字段路径的文本框，`filter` 没有可选的字段 |
| `errors` | 字段错误 `{ target, path, message }`，文字由设计器换好，`path` 相对对象 |
| `heading` | 标题下一行，如「表格 · t1」「已选中 3 个」 |
| `empty-text` | 空状态文案 |
| `toggle-limit` | select 单选且选项不超过它时改用切换按钮组；缺省不用。描述写了 `appearance: "dropdown"` 或 `"toggle"` 的 select 不看它，总是下拉或总是切换按钮组（多选也可以），绑定字段这类运行时生成的选项宜写 `dropdown` |
| `collapsible` | 分组可折叠，折叠状态按分组 id 保留，换选择不重置 |
| `readonly` | 字段只读，不派发修改 |
| `headless` | 放进外框的卡片时写：不画自己的标题与 `heading`，由面板头显示；页头插槽有内容时页头照旧显示 |

| 事件 | detail |
| --- | --- |
| `property-change` | `{ path, value, targets, merge }`：每次输入都派发，`value` 为 `undefined` 表示清除；`merge` 是合并键，交给历史栈的 `execute` |
| `property-commit` | `{ path }`：一次编辑结束（失焦、改选、切换、回车），设计器封口 |

- 共同属性是每个对象都有、`path` 相同、`control` 按 JSON 相等的那些；任一对象上不显示即不显示。取值不同时字段留空，显示占位「多个值」，宿主编辑器拿到的 `value` 为 `undefined`。
- 字段用 `<xh-field>` 包库内控件，标签、说明与错误接到控件的可聚焦部件上。换选择只换数据时，同一属性、同一编辑器的字段原样复用，焦点与光标不丢。
- 宿主编辑器的 `setValue` 与 `commit` 也走这两个事件。
- 宿主编辑器返回的 `element` 自己写了 `data-xh-part="control"` 时（库内表单控件，或原生 `input` / `select` / `textarea`），面板把它放进 `<xh-field>` 当字段的控件，标签、说明与校验状态由字段接上。没写时按一组控件处理：整行 `role="group"`，标签与说明经 `aria-labelledby` / `aria-describedby` 接上，组里的控件各自给可访问名称。
- 没有编辑器的编辑方式显示只读的一行：左边是标签文字，右边是占位说明，不进字段接线。
- 数字字段按描述的 `integer`、`exclusiveMin`、`min`、`max` 依次校验：不合法时就地报错、不派发，框里保留输入；失焦时越出 `min` / `max` 的值夹回端点。JSON 字段不能解析时同样就地报错。
- 绑定字段（`dataField`）的字段树先取描述里的 `fields`，没写时取面板的 `dataFields`。有字段树时是可搜索的树选择：按描述的 `kinds` 与 `base` 列出起点之下的字段，同 `listDataFields`（进入对象的子字段，不进入列表的子字段）；不能选的对象是禁用的分支，没有可选后代的字段不列，分支起初都展开。字段有 `label` 时条目显示它，下面一行是字段路径。选中写入字段路径的文字，清空即清除。没有字段树时是文本框，写法不对时就地报错、不派发。
- 四边（`sides`）是一组控件，整行 `role="group"`：「四边相同」开关加一个数字框，关掉后换成上、右、下、左四个（两列），每个框上方是这一边的名字、后缀是单位；四边相同时那一个框以「四边」为名。四边都按描述的数值约束校验，有边空着或违反约束时就地报错、不派发；打开开关时四边不同就按上边统一。换了取值的对象按四边是否相同摆开关；多个对象取值不同时开关禁用，只能四边一起改。
- 格式（`format`）是 `<xh-format-input>`：种类限在描述的 `kinds`，不是必填时种类里多一项「不设格式」，选它即清除；改动随输入派发，失焦时封口。多个对象取值不同时格式输入框标 `mixed`，种类显示「多个值」，选了种类就写给每个对象。
- 写了 `secret` 的文本是 `<xh-password-input>`：缺省不显示明文，可切换显隐，浏览器不代填也不记住。
- 颜色预设（`swatch`）是一组控件，整行 `role="group"`：上面是 `<xh-color-swatch-picker>`，一项一格，格子画选项的 `color`，选中写入选项的 `value`；描述写了 `custom` 时下面另有一个颜色框，填任意颜色。取值不在选项里时显示在颜色框里，色板不选中任何一格。
- 条件树（`filter`）是 `<xh-filter-builder>`：字段先取描述里的 `fields`，没写时由面板的 `dataFields` 按 `listFilterFields` 列出值字段（字段没写 `type` 的按文本）；参数与子组层数取描述的 `parameters`、`maxDepth`，`ids` 为 true 时新建的条件与组按 `c1`、`g1` 这样取树里没用过的 id。一次增删改就是一步：写入即封口。多个对象取值不同时显示空树，空态写「多个值」，在上面加的条件整体写给这几个对象。
- 插槽 `header` 在标题下方（如部位导航），`footer` 在字段之后（如「删除列」）。
- `focusField(path)` 把焦点交给该属性的字段，找不到时返回 `false`。

### 复合编辑器里的字段

宿主编辑器常要拼几个字段，比如四边边框的每一边有线宽、线型与颜色。`createPropertyField` 按一种内建编辑方式建出一行字段，控件、单位后缀、数字约束与 JSON、字段路径的就地校验、空值、「多个值」与只读，都和属性面板里的同一套。复合编辑器在 `setValue` 里拼出整个值，再交给自己的 `setValue`：

```ts
import type { DesignerPropertyEditor } from "@xihan-ui/designer-shell";
import { createPropertyField } from "@xihan-ui/designer-shell";

const stroke: DesignerPropertyEditor = (initial) => {
  let context = initial;
  const current = (): Record<string, unknown> => ({ ...(context.value as Record<string, unknown> | undefined) });
  const width = createPropertyField({
    ownerDocument: document,
    control: { kind: "number", min: 0, step: 0.05, unit: "mm" },
    label: "线宽",
    setValue: value => context.setValue({ ...current(), width: value ?? 0 }),
    commit: () => context.commit(),
  }, { value: current().width as number | undefined });
  const element = document.createElement("div");
  element.append(width.element);
  return {
    element,
    update: (next) => {
      context = next;
      width.update({ value: current().width as number | undefined, readonly: next.readonly });
    },
  };
};
```

| 选项 | 说明 |
| --- | --- |
| `control` | 内建的编辑方式；别的种类抛 `TypeError` |
| `label` / `required` | 字段的标题与必填标记 |
| `setValue` / `commit` | 写入新值（`undefined` 为清除）与一次编辑结束；只读时不调用 |
| `optionLabel` / `unitLabel` / `dataFields` / `toggleLimit` | 同属性面板的同名属性 |
| `translations` | 压在配置文案之上；配置取字段所在位置的（`xh-designer-properties` 那一桶） |

`update(state)` 每次整份给状态：`value`、`readonly`、`mixed`（多个值）、`label`（给了就换掉建字段时的标题，如切换语言后）、`hint`（说明）与 `error`（外面给的错误，控件自己发现的错误优先显示）。返回的 `element` 是一整行：控件在 `<xh-field>` 里，标题、说明与错误由字段接上；四边（`sides`）这类一组控件时整行是 `role="group"`。

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
| `group-by` | `severity`（缺省）错误在前、警告在后；`target` 按问题所在对象分组；`none` 按传入顺序 |
| `empty-text` | 没有问题时的提示 |
| `readonly` | 列表没有修改类操作，只读时照常浏览与定位 |
| `headless` | 放进外框的卡片时写：不画自己的标题，由面板头显示，列表仍以标题为名；严重程度的过滤照旧显示，要放进面板头见下文 `summary` |

| 只读属性 | 说明 |
| --- | --- |
| `summary` | 头部那组带计数的严重程度开关 |

| 事件 | detail |
| --- | --- |
| `issue-activate` | `{ issue, index }`：点击或回车；`index` 是在 `items` 里的下标 |
| `issue-hover` | `{ issue }`：指针移到条目上；移出列表时 `issue` 为 `undefined` |

- 头部的错误、警告两个开关带条数，过滤状态在换 `items` 后保留。
- 放进外框的卡片时，可以把 `summary` 移到面板头的操作区：写上 `slot="<区名>-actions"` 交给外框。零件照样更新计数与开关状态，不再把它收回头部；`headless` 时头部随之收起。

  ```ts
  issues.headless = true;
  issues.summary.slot = "issues-actions";
  frame.append(issues.summary);
  ```
- 按对象分组时，组按对象在 `items` 里第一次出现的先后排列，组内错误在前。组标题取组内第一条的 `subject`，都没有时显示对象的 `id`；条目里不再重复对象名。没有 `target` 的问题归在最后一组，标题取文案 `noTarget`。
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
| `groups` | `{ id, label, items }[]`，物料为 `{ id, label, icon?, description?, disabled?, browseOnly?, payload?, children? }`；`icon` 是图标记录，`description` 是名称之外的一行说明，`children` 是下级物料 |
| `searchable` | 显示搜索框，按名称与说明过滤；命中的条目连同它的上级一起展开显示 |
| `collapsible` | 分组可折叠，折叠状态按分组 id 保留；搜索时匹配的分组一律展开 |
| `readonly` | 物料只能浏览，不派发 `item-activate`、不能拖出 |
| `headless` | 放进外框的卡片时写：不画自己的标题，由面板头显示；标题仍作正文的可访问名，搜索框照旧 |

| 事件 | detail |
| --- | --- |
| `item-activate` | `{ id, payload }` |

- 方向键、Home、End 在物料间移动焦点，禁用的物料也能停留，读屏照样念出。
- 从物料拖出时的载荷是 `{ source: "palette", id, payload }`。
- `disabled` 是用不了的物料：显示为禁用，不派发 `item-activate`、不能拖出。`browseOnly` 是只作浏览的物料：照常显示、能用方向键走到，同样不派发、不能拖出，用于只起分组作用的上级与只供查看的下级。

### 带下级的物料

组里有物料带了 `children` 时，这一组用 [`<xh-tree>`](../components/tree) 显示，没有下级的组仍是一列按钮。适合字段树这类有层级的物料：

```ts
palette.groups = [{
  id: "fields",
  label: "字段",
  items: [
    { id: "no", label: "单号", description: "no", payload: { field: "no" } },
    { id: "items", label: "明细", description: "items", payload: { list: "items" }, children: [
      { id: "items.qty", label: "数量", browseOnly: true },
    ] },
  ],
}];
```

- 键盘与读屏按树的约定：这一组是一个 Tab 停靠点，上下键在看得见的物料间移动，右键展开、左键收起，回车与空格激活；层级、展开态与禁用报给读屏。
- 带下级的物料缺省收起，展开状态按物料 id 保留，换了 `groups` 仍在；搜索时命中的物料连同上级一起展开，清空后回到原来的展开状态。
- 点选与确认键只派发 `item-activate`，树上不留选中的痕迹；按在展开箭头上只展开、收起，不起拖。
- 上级与下级都能激活、拖出，不需要的写 `browseOnly` 或 `disabled`。

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
| `items` | 选中项 `{ id, rect, handles?, rotatable?, keepAspect?, minSize? }`。`handles` 缺省 `true` 为八向，`false` 不能缩放，数组为只给这些方向；`rotatable` 缺省不显示旋转柄；`keepAspect` 为总是等比；`minSize` 是缩放的下限 |
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
- 单选按该项的能力出控制柄。多选画各自的细框与整体包围框，可以整体移动；每一项都能八向缩放时，包围框上出八个控制柄（不出旋转柄），拖动按包围框等比缩放全部选中项：位置与尺寸乘同一比例，旋转角不变，Alt 以中心为基准，任一项缩到 `minSize` 即停。`transform` 事件的 `kind` 为 `resize`，`rects` 带全部选中项。
- 缩放时只吸附被拖动的那条边；单选时旋转过的矩形缩放时不吸附。
- 控制柄是固定的屏幕尺寸，按旋转后的方向画，指针形状随角度换；粗指针设备放大命中区。

## 标尺与参考线

`<xh-designer-ruler>` 包住画布：上、左两条标尺，左上角角块，中间是作者内容，画布上方一层参考线。不带 `slot` 的子节点进画布区，`slot="corner"` 的进角块。画布区左上角就是视口的屏幕原点，覆盖层等放在画布区里即可对齐。画布区是只有一格的网格：子节点不写尺寸也撑满整块，多个子节点叠在同一块上。标尺的样式只认标尺自己生成的部件，画布区与角块里的作者内容即使也用了 `data-part="tick"`、`"marker"`、`"guide"` 之类的部件名，也不受标尺样式影响。

```ts
const ruler = document.createElement("xh-designer-ruler");
ruler.append(canvasContent);
ruler.viewport = viewport;
ruler.unitSize = 1;
ruler.guides = page.guides;
ruler.snap = (axis, value) => snapToGrid(value, 1);
ruler.addEventListener("guides-change", event => setGuides(event.detail.guides));
```

| 属性 | 说明 |
| --- | --- |
| `viewport` | 画布的视口 |
| `unit-size` | 一个刻度单位等于多少世界单位，只管刻度显示，缺省 1 |
| `guides` | `{ x, y }`：竖向（x 等于定值）与横向参考线的位置，世界单位；受控，零件不自己改 |
| `highlight` | 在两条标尺上画淡底的范围，世界坐标，如选中项的包围框 |
| `format(value)` | 刻度与参考线数值的文字，入参是刻度单位；缺省按主刻度间隔取整数或所需的小数位 |
| `snap(axis, value)` | 拖动参考线时的吸附，入参与返回值都是世界单位 |
| `readonly` | 照常显示参考线，不能新建、挪动或删除 |

| 事件 | detail |
| --- | --- |
| `guides-change` | `{ guides, change }`：`guides` 是改后的整组参考线，`change` 为 `{ type, axis, index }`，`type` 为 `add`、`move`、`remove`，新增的 `index` 在末尾 |

- 从上标尺拖进画布新建横向参考线，从左标尺拖出竖向参考线；松手时还在标尺上即取消。
- 拖动已有参考线挪动，拖回对应的标尺即删除，拖到别处不变；拖动中显示预览线与数值。
- 点参考线选中并取得焦点，Delete 或 Backspace 删除；Esc 放弃进行中的拖动。
- 指针在标尺或画布上时，两条标尺上画跟随的细线；参考线在对应标尺上另画一道标记。
- 参考线是带名称的 `separator`，名称取文案 `horizontalGuide` / `verticalGuide`。

## 外框

`<xh-designer-frame>` 是设计器的整体版式：最上一条顶栏，下面一条工具栏，中间一行左、中、右三栏，中间一栏的下方再分一块，最下一条状态栏。版式按命名区排，缺省登记顶栏 `header`、工具栏 `toolbar`、物料 `palette`、画布 `canvas`、属性 `properties`、问题 `issues`、状态栏 `status` 七个区。作者内容用 `slot="<区名>"` 标在直接子节点上，没写 `slot` 的进中间区。区与区之间是 `<xh-splitter>` 的分隔条，可以拖动或用键盘调整大小。

```ts
const frame = document.createElement("xh-designer-frame");
frame.append(toolbar, palette, canvas, properties, issues); // 各自写好 slot="toolbar" 等
frame.panels = "toolbar palette properties";
frame.sizes = saved.sizes;
frame.addEventListener("sizes-change", event => save(event.detail.sizes));
```

| 属性 | 说明 |
| --- | --- |
| `panels` | 要显示的区，空格分隔；不写即全部显示，写空串则只留中间区。中间区总是显示，顶栏有内容就显示，状态栏按 `panels` 且有内容才显示。同名 attribute |
| `regions` | 产品登记的命名区，缺省为 `DESIGNER_FRAME_REGIONS` |
| `sizes` | `{ start, end, bottom, regions }`：各处的大小（百分比），用来恢复上次的布局。`start`、`end`、`bottom` 是位置的大小，不给的用区的缺省大小；`regions` 是同一位置堆叠的区各自占该位置高度的百分比，键为区名，不给的等分 |

| 方法 | 说明 |
| --- | --- |
| `showsPanel(name)` | 这个区是否显示：中间区总是显示，顶栏看有没有内容，状态栏看 `panels` 与有没有内容，其余按 `panels`，没登记的区为否 |

| 事件 | detail |
| --- | --- |
| `sizes-change` | `{ sizes }`：拖动或用键盘调整后的大小，形状同 `sizes`；拖动途中连续发出 |
| `panels-change` | `{ panels }`：点了面板头的关闭钮，外框已收起这块面板；`panels` 是收起之后要显示的区（空格分隔），设计器据此同步自己的 `panels` |

命名区是 `{ name, position, size?, minSize?, label?, title?, subtitle?, help?, closable? }`：

- `position` 取 `header`、`top`、`start`、`center`、`end`、`bottom`、`status`。同一位置的多个区按登记顺序上下排列，共用一个大小；除 `top` 外，区与区之间有分隔条，可拖动，也可聚焦后用上下方向键调整（Shift 加大步长）。
- `size` 是位置的缺省大小：`start`、`end` 占中间一行的宽度，`bottom` 占中间一栏的高度；`minSize` 是拖动的下限，缺省 10。都取该位置第一个区的值。中间区至少留 20。外框还按尺寸槽给的像素下限折算，两者取大的，见下文「尺寸槽」。
- `label` 是分隔条无障碍名称里的区名，缺省用 `title`，再缺省用 `name`；名称取文案 `resize`，分隔条所在的布局取文案 `layout`。
- 收起的区移出文档，内容保留，再展开时原样放回。
- 外框自己生成的结构（上方条、中间行、位置、分隔条与区容器）都带 `data-scope="designer-frame"`，区容器另带 `data-region`（区名）与 `data-position`（所在位置）。外框的样式只认这个 scope，区里的作者内容即使也用了 `data-part="region"` 之类的部件名，也不受外框样式影响。

堆叠区的大小记在 `sizes.regions`：

- 值是该区占所在位置高度的百分比，键为区名。同一位置当前显示的区按这些值的比例分高度，合计不必是 100，外框按比例归一；没有记录的区按等分值（100 ÷ 区数）补上，都没有记录时即等分。
- 每个区至少占 10%（区多到放不下时取等分）；归一后低于下限的区定在下限，其余区按比例分剩下的高度。
- 收起其中一个区时，其余区按各自的比例分掉它的高度；记录仍在，再展开时恢复拖过的比例。
- 回填的 `sizes` 里有已不存在的区名、或不是正数的值，一律忽略；`sizes-change` 只带当前登记着的区。

### 顶栏与状态栏

顶栏与状态栏是整宽的一条，不可拖动，按段放内容：

| 区 | 段与插槽 | 只写区名时进 |
| --- | --- | --- |
| `header` | `header-start`（标志与名称）、`header-center`（插入快捷按钮）、`header-end`（主操作） | `header-center` |
| `status` | `status-start`（选中对象的信息）、`status-end`（缩放、保存与连接状态） | `status-start` |

- 各段有内容才显示这一条，内容拿走就收起。顶栏不受 `panels` 控制；状态栏另外要在 `panels` 里。
- 段用 `data-part="zone"` 与 `data-zone` 标出，左段贴左、中段居中、右段贴右；状态栏的文字取弱一档的颜色与小一号的字。

### 面板卡片

左右与下方的区给了 `title` 就画成一张卡片：承载面的底、描边与圆角，四周留出间距，上面是面板头，下面是可以滚动的正文，作者内容放进正文。

- 面板头左边是标题与一行副标题（`subtitle`，不给不显示）；右边是操作区、帮助钮与关闭钮。
- 操作区放 `slot="<区名>-actions"` 的作者内容，没有内容时收起。
- `help` 给了才出帮助钮，悬停或聚焦时用 `<xh-tooltip>` 弹出这段说明，按钮的名字取文案 `panelHelp`。
- 关闭钮缺省出现（`closable: false` 时不出），名字取文案 `closePanel`；点了收起这块面板，并派发 `panels-change`。
- 卡片是 `role="region"`，以标题为名。区后来加了或去掉标题，外框连同已经搬进去的内容一起换成新的结构。
- 物料、属性、问题三个零件放进卡片时写 `headless`：不画自己的标题，由面板头显示。

### 画布区的浮动条

中间区的四角与右侧中间各有一个落点，放浮动在画布内容之上的小工具条或小地图：

| 插槽 | 落点 |
| --- | --- |
| `<中间区名>-top-start` / `-top-end` | 左上、右上 |
| `<中间区名>-bottom-start` / `-bottom-end` | 左下、右下 |
| `<中间区名>-end` | 右侧中间，竖排 |

缺省中间区名是 `canvas`，所以插槽是 `canvas-top-start` 等。落点没有内容时不占位置。

### 尺寸槽

外框上的几个 CSS 自定义属性，缺省取 UI 的语义令牌：

| 尺寸槽 | 缺省 | 作用 |
| --- | --- | --- |
| `--xh-designer-frame-start-min` | `--xh-layout-col-min-sm` | 左栏拖动的下限 |
| `--xh-designer-frame-end-min` | `--xh-layout-col-min-md` | 右栏拖动的下限 |
| `--xh-designer-frame-bottom-min` | `--xh-layout-col-min-xs` | 下方拖动的下限 |
| `--xh-designer-frame-gap` | `--xh-space-2` | 卡片与四周、画布浮动条与边缘的间距 |
| `--xh-designer-frame-panel-px` / `-py` | `--xh-space-3` / `--xh-space-2` | 面板头、顶栏与状态栏的内边距 |
| `--xh-designer-frame-status-h` | `--xh-control-h-sm` | 状态栏的最小高度 |

- 三个下限是像素宽度，外框量出后按自己当前的宽高折成百分比交给分隔条，外框变宽变窄时重新折算。
- 左右与下方的面板在分隔条上可以收起：分隔条聚焦后按 Enter 收起，再按一次展开回原来的大小。

`parseDesignerPanels(value)` 按同一口径解析 `panels`：没写为 `undefined`（全部显示），空串为空集合（全部收起），多个空白与制表符都当分隔。设计器自己的 `panels` 属性可以直接转给外框。

## 设置

设计器的设置是用户偏好，每人每机一份，不是模板数据：主题、主题色、状态栏与语言，再加各款与扩展自己的条目。`<xh-designer-settings>` 是设置对话框；`createDesignerSettingsHost` 把主题与主题色落到设计器上，并读写存储。

```ts
import { collectSettingsSections, createDesignerSettingsHost } from "@xihan-ui/designer-shell";
import { registerBrand } from "@xihan-ui/tokens";

const brands = [{ value: "blue", color: "#1677ff", label: "蓝" }];
const host = createDesignerSettingsHost({
  root: designerRoot,
  brands,
  registerBrand,
  storageKey: "flow-designer:settings",
  onStorageError: detail => console.warn(detail),
});

const dialog = document.createElement("xh-designer-settings");
dialog.general = { brands, customBrand: true };
dialog.sections = collectSettingsSections([productSettings, ...extensions]);
dialog.settings = host.load();
host.apply(dialog.settings);
dialog.addEventListener("settings-change", (event) => {
  host.apply(event.detail.settings);
  host.save(event.detail.settings, dialog.sections);
});
designerRoot.append(dialog);
dialog.show();
```

### 分区与条目

- 分区是 `{ id, label, order?, items }`，对话框左边一页。`order` 小的在前，内建的「基础」是 0，各款从 100 起，扩展从 200 起，同值按登记顺序。
- 条目就是 `@xihan-ui/designer-kit` 的属性描述：`path` 只写一段条目 id，`label` 是标签，`default` 是缺省值，说明写在 `meta.description`。
- 值是扁平的键值：键是 `<分区 id>.<条目 id>`，没写的键取条目的 `default`。
- 内建编辑方式与属性面板同一套字段；别的种类交给对话框的 `editors`，被编辑的对象是整份设置。

| 函数 | 说明 |
| --- | --- |
| `collectSettingsSections(sources)` | 合起各来源（`{ id, settings? }`，扩展的 `settings` 字段就是这个形状）的分区。分区 id 重名时抛 `DesignerExtensionError`，名字空间 `settings-section`；`general` 留给内建 |
| `sortSettingsSections(sections)` | 按 `order` 排好，同值按传入顺序 |
| `settingKey(section, item)` | 条目的键 |
| `settingValue(settings, section, item)` | 条目此刻的值：写了用写的，没写取缺省值 |
| `settingPolicy(policy, section, item)` | 条目在宿主管控下的状态：先看条目键，再看分区 id |
| `designerGeneralSettings(t, options?)` | 内建的「基础」分区；对话框自己会生成，各款要单独拿条目时用 |

### 「基础」分区

| 条目 | 键 | 编辑方式 | 缺省 | 何时出现 |
| --- | --- | --- | --- | --- |
| 主题 | `general.theme` | 分段：跟随页面、跟随系统、亮色、暗色 | `follow` | 总有 |
| 主题色 | `general.brand` | 色板 | 不写即跟随页面 | 给了 `brands` 或 `customBrand` |
| 状态栏 | `general.statusBar` | 开关 | `true` | 总有 |
| 语言 | `general.language` | 下拉 | 不选即跟随页面 | 给了 `languages` |

键也在 `DESIGNER_SETTING_KEYS` 里。主题与主题色由 `createDesignerSettingsHost` 落到设计器上；状态栏与语言由各款自己接，例如状态栏关掉时从外框的 `panels` 里去掉 `status`，语言换成对应的产品语言包。

### 设置对话框

`<xh-designer-settings>` 里是 `<xh-dialog>`，左边竖排的分区页，右边按正文行宽逐条列出条目；分区页定高，换页时对话框不跳。宿主元素不占盒。

| 属性 | 说明 |
| --- | --- |
| `sections` | 各款与扩展的设置分区；没有可显示条目的分区不出现 |
| `general` | 「基础」分区的选项 `{ brands?, customBrand?, languages? }`；`false` 不要这一页。文案随对话框的语言 |
| `settings` | 设置的值 |
| `policy` | 宿主的管控：键是条目键或分区 id，值 `hidden` 不显示、`locked` 只读并把说明换成文案 `locked` |
| `editors` | 内建编辑方式之外的条目按 `control.kind` 用这里的编辑器；没登记的只显示值 |
| `open` | 对话框打开。同名 attribute |
| `section` | 当前显示的分区 id；不写或那一页不显示时显示第一页。同名 attribute |
| `translations` | 元素自己的文案，压在全局配置之上 |

| 方法 | 说明 |
| --- | --- |
| `show(section?)` | 打开对话框，给了分区 id 就显示那一页 |

| 事件 | 说明 |
| --- | --- |
| `settings-change` | `{ key, value, settings }`：改了一条，`value` 为 `undefined` 表示删掉这个键、回到缺省值；`settings` 是改过之后的整份值，元素已经换成它 |
| `open-change` | `{ open }`：按 Esc、点遮罩或关闭钮时对话框要关上，元素已经换成这个状态 |

对话框打开时内容搬到浮层根：主题、主题色等视觉轴经视觉桥跟着设计器根走；字段的文案由对话框在原位解析好交给字段，跟着设计器所在位置的配置。

### 落到设计器上

`createDesignerSettingsHost(options)` 返回 `{ load, save, apply, dispose }`：

| 选项 | 说明 |
| --- | --- |
| `root` | 设计器根：主题写成它的 `data-theme`，主题色写成它的 `data-brand`，只作用于设计器 |
| `brands` | 预设的主题色，与「基础」分区给的同一份 |
| `registerBrand` | 注册自定义主题色，形状与 `@xihan-ui/tokens` 的 `registerBrand` 相同；不给时不是预设的颜色不生效 |
| `storageKey` | 设置存在根所在窗口 localStorage 的哪个键下；不给就不读写 |
| `onStorageError` | 读写失败（无痕窗口、配额满、内容不是对象）时回调 `{ operation, key, error }`，设置留在内存里。给了 `storageKey` 就必须给，否则抛 `TypeError` |

- `apply(settings)`：主题跟随页面时把根的 `data-theme` 还原成接手前的值，跟随系统时按 `prefers-color-scheme` 写、系统改了跟着改；主题色是预设就写它的 `value`，否则经 `registerBrand` 注册成这台设计器自己的品牌，换走时撤销。
- `save(settings, sections?)`：`sections` 里标了 `secret` 的文本条目不存。
- `load()`：没给存储键、没存过或读不出时是空对象。
- `dispose()`：撤掉跟随系统的监听与注册的主题色，根上的两个属性还原成接手前的样子。

## 扩展的面板与命令

设计器扩展的骨架、合并查重与装卸在 `@xihan-ui/designer-kit`（见那一页的「设计器扩展」）。这里放跟界面有关的几样：面板登记到外框的区，命令铺成工具栏按钮与右键菜单条目，粘贴与拖放的数据列成导入来源，设置分区放进设置对话框。

### 面板

```ts
import { createPanelHost } from "@xihan-ui/designer-shell";

const panels = createPanelHost(frame); // 内置区缺省为 DESIGNER_FRAME_REGIONS，产品有自己的就传 { regions }
panels.assign(host.list, context); // 每次 extensions 变化后调用
panels.update(context); // 设计器状态变化后刷新
panels.dispose();
```

- 扩展的 `panels` 是 `{ region, create(context) => { element, update?, destroy? } }`：`region` 是外框的命名区（`{ name, position, size?, minSize?, label? }`），追加在内置区之后，同一位置按扩展顺序上下排；`element` 以 `slot` 交给外框，放进那个区。
- 区名与内置区或别的扩展重名时 `assign` 抛 `DesignerExtensionError`（名字空间 `panel`），什么都不变。
- 按面板对象的引用比对：留下来的不重建，去掉的调 `destroy` 后撤掉。
- `panels` 照旧只管显隐，扩展登记的区也能用它开关。宿主写在 HTML 里的内容照样用 `slot="<区名>"` 交给外框，不必经扩展。

### 命令

工具栏与右键菜单的排列用 `commandLayout`：位置 → 若干组命令 id，内置命令与扩展命令混排。

```ts
import { arrangeCommands, createCommandToolbar, renderCommandMenu, runCommand } from "@xihan-ui/designer-shell";

const commands = extensionCommands(host.list); // designer-kit，内置在前
const toolbar = createCommandToolbar(document);
toolbar.update(arrangeCommands("toolbar", commands, BUILTIN_TOOLBAR, designer.commandLayout), commands, context, t.toolbar);

renderCommandMenu(menuContent, arrangeCommands("menu:node", commands, BUILTIN_NODE_MENU, designer.commandLayout), commands, context, { platform });
menu.addEventListener("select", event => runCommand(commands, event.detail.value, context));
```

| 函数 | 说明 |
| --- | --- |
| `arrangeCommands(placement, commands, defaults, layout?)` | 排出某个位置的分组：`layout` 写了这个位置就只用它；否则用 `defaults`（各款内置的缺省排列），再把 `placement` 含这个位置、又不在缺省排列里的命令按登记顺序追加成一组。排列里写了没登记的命令 id 时抛 `TypeError` |
| `createCommandToolbar(document)` | 一条 `<xh-toolbar>`：`update(groups, commands, context, label)` 分组变了才重铺按钮，文字、可用、`aria-pressed`（开关式命令）与 `data-tone`（命令的语气）每次刷新；点击按钮执行命令，放不下的收进行尾的「更多」菜单，语气随按钮带进菜单项 |
| `renderCommandMenu(content, groups, commands, context, { platform? })` | 把分组铺成 `<xh-context-menu>` content 里的条目，组间一条分隔线；不可用的写 `aria-disabled`，命令的语气写 `data-tone`，带快捷键的在行尾写提示 |
| `runCommand(commands, id, context)` | 命令存在且此刻可用才执行，返回是否执行了 |
| `commandLabel(command, context)` / `commandEnabled(command, context)` | 命令的文字；此刻能否执行 |

两个铺法用到的 `<xh-toolbar>` 与 `<xh-context-menu>` 按需注册。快捷键的命中用 designer-kit 的 `commandForShortcut`。

### 设置分区

扩展的 `settings` 是若干设置分区，形状见上文「设置」。用 `collectSettingsSections` 把各款自己的分区与扩展的合起来交给设置对话框；分区 id 与内建的 `general` 或别的扩展重名时抛 `DesignerExtensionError`（名字空间 `settings-section`）。

### 导入来源

`importSources(data, kind)` 把粘贴事件的 `clipboardData` 或拖放事件的 `dataTransfer` 列成导入来源：先是每个文件（带类型与文件名），再按链接、HTML、纯文本的顺序列出不为空的文本。交给 designer-kit 的 `findImporter`，挑出第一个接下的导入器。

```ts
import { findImporter } from "@xihan-ui/designer-kit";
import { importSources } from "@xihan-ui/designer-shell";

canvas.addEventListener("drop", (event) => {
  const found = findImporter(model.importers, importSources(event.dataTransfer!, "drop"));
  if (!found)
    return;
  event.preventDefault();
  void found.importer.import(found.source, context).then(place);
});
```
