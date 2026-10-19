# 设计器零件

`@xihan-ui/designer-shell` 是画布式设计器共用的界面零件：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、页面结构、历史记录、问题列表、小地图、外框、设置对话框、导入字段对话框与新手引导。打印、流程、表单、报表四款设计器用同一套零件，名字、手势与事件对齐。

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
- 零件自己生成的结构只用 `div`、`span`、`button` 这类没有正文排版的标签，列表靠 `role="list"` 与 `role="listitem"` 标出。宿主按标签名重置 `p`、`ul`、`li` 等的边距与列表样式（文档站的示例舞台、CSS 框架的基础重置），影响不到零件。
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
| `errors` | 字段错误 `{ target, path, message }`，文字由设计器换好，`path` 相对对象；落在属性里层的错误归到它所属的那一行，见下文 |
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
- 选项列表（`options`）是 `<xh-field-array>` 的表格排布，放在这一行的字段里，字段的标题就是表格的名字。一项一行，三格依次是值、文字与禁用（描述写了 `allowDisabled: false` 时没有禁用这一列，写出的选项也不带 `disabled`），每格是一个字段，控件以「列名 + 第几项」为名（中文如「第 3 项的值」）；行号、拖动、上移、下移与删除把手和下面的新增把手由字段数组铺出：按住拖动把手把这一项拖到别处换位，键盘用上移、下移，新增与删除也都能按到。值与文字边输入边写入、失焦封口；勾选禁用，以及新增、删除与换序，各是一步。新增的一项只有空的 `value`，加好后焦点落到它的值上；文字为空、不禁用时不写这两个键，项上别的键（`tone`、`description`）原样留着；删掉最后一项即清除。值与文字两列有最小宽，数字、日期与日期时间的值列不窄过字段的压缩底线（`--xh-control-min-w`），放得下长一些的数与整个日期时间，禁用列放得下列头；格里的控件不超出自己那一格。面板放不下时表格横向滚动，行号钉在起始侧，把手随行一起滚动（字段数组的 `stickyActions` 关掉），滚到末端或 Tab 到时露出来，值格因此总有一个滚动位置整个看得见。值格按描述的 `valueType` 换控件：`"string"`（缺省）是文本框；`"number"` 是数字框，写回数值，清空即去掉 `value`，新增的一项是空对象；`"date"` / `"datetime"` 是日期框（到日 / 到分），写回 `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm`；`"boolean"` 固定 `true`、`false` 两行，值格只读、显示「是 / 否」（随面板语言），没有新增、删除与换序，文字与禁用照常可改，写回时两项都写、`true` 在前。多个对象取值不同时没有行，新增的一项整体写给这几个对象。
- 选项树（`treeOptions`）是 `<xh-table>` 的树形表（声明了 `tree`，平铺的各项也报 `role="treegrid"`），单元格级导航（`navigation="cell"`），整行按一组控件排，表格的名字是这一行的标题。一项一行，四格依次是值、文字、禁用与操作（描述写了 `allowDisabled: false` 时没有禁用这一列），各行报层级与层内位次；值格按层缩进，有下一层的项带展开把手；操作列里是「加子项」与「删除」两颗钮，钉在行尾，面板放不下时表格横向滚动、操作列留在原处；表格下面是「新增一项」，加在顶层末尾。键盘照表格的单元格导航：方向键在格子之间走，Enter 或 F2 进格内编辑（输入框里的左右键归输入框），Esc 或 F2 回到格子，焦点在行上时左右键收起与展开；Alt + 上下键在同一层换序，Alt + 左右键改一层缩进（往里是认上一项当上级，各项还是平铺时也行），也可以按住行拖动，拖到哪一项的中段就放进那一项下面（叶子项也行）；叶子项不带 `aria-expanded`；写回整棵树，焦点留在原来那一格。格里的控件以「列名 + 大纲号」为名（中文如「第 1.2 项的值」），两颗钮也按大纲号起名（「给第 1.2 项加子项」「删除第 1.2 项」）。值与文字边输入边写入、失焦封口；勾选禁用，以及加子项、新增、删除与换位，各是一步。新的一项只有空的 `value`，加好后焦点落到它的值上；删掉一项连同它的下一层，下一层删空时不再写 `children`；项上别的键（`tone`、`description`、`hasChildren`）原样留着。问题按路径标到那一项那一格，如 `[0, "children", 1, "value"]` 标在第 1.2 项值那一格。多个对象取值不同时没有行，新增的一项整体写给这几个对象。
- 选项列表与选项树自己不另做校验：值为空、值重复、缺了要求的文字这些问题由 designer-kit 的取值检查报（`checkProperties` 与 `findPropertyValueIssue`，路径落在那一项的那个键上），设计器照常把它们交给面板的 `errors`。编辑器按路径把问题标到格上：`[i, "value"]`、`[i, "label"]`、`[i, "disabled"]` 落在那一格（选项树先按 `children` 找到那一层那一项），项上别的键与这一项本身落在它的值上；那一格的控件 `aria-invalid="true"`，错误文字显示在格子里、经 `aria-describedby` 接上。两种编辑器都写了 `nestedIssues`，只有里层问题时行下不重复。
- 条件树（`filter`）是 `<xh-filter-builder>`：字段先取描述里的 `fields`，没写时由面板的 `dataFields` 按 `listFilterFields` 列出值字段（字段没写 `type` 的按文本）；参数与子组层数取描述的 `parameters`、`maxDepth`，`ids` 为 true 时新建的条件与组按 `c1`、`g1` 这样取树里没用过的 id。一次增删改就是一步：写入即封口。多个对象取值不同时显示空树，空态写「多个值」，在上面加的条件整体写给这几个对象。
- 错误按路径段归到行：路径以某一行属性的路径开头（含相等）就属于那一行，有嵌套描述时归路径最长的那一行；按段比较，`options` 不沾 `optionsExtra` 的错误。哪一行都不沾的不显示。
- 行下的文字依次取：控件自己发现的错误、恰好落在这一行的错误；只有里层错误时显示第一条，宿主编辑器的实例写了 `nestedIssues: true` 的不显示，由编辑器自己标到子项上。
- 宿主编辑器与内建编辑器的上下文都带 `issues`（designer-kit 的 `PropertyIssue`）：这一行的错误，路径相对这个属性，按路径排；多选时合并各对象的，同一路径只留先出现的一条。四边按 `["top"]` 这类路径把那一边的数字框标成无效（四边相同时标那一个框），文字仍在行下。
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

`update(state)` 每次整份给状态：`value`、`readonly`、`mixed`（多个值）、`label`（给了就换掉建字段时的标题，如切换语言后）、`hint`（说明）、`error`（外面给的错误，控件自己发现的错误优先显示）与 `issues`（落在这个字段值里层的问题，路径相对字段的值，四边按它标出对应那一边；行下的文字仍取 `error`）。返回的 `element` 是一整行：控件在 `<xh-field>` 里，标题、说明与错误由字段接上；四边（`sides`）这类一组控件时整行是 `role="group"`。

复合编辑器把里层的问题标到子项上（如选项表某一行的错）：读 `context.issues`，按路径分给子项，实例上写 `nestedIssues: true`，行下就不重复。读屏与 UI 字段接线同一个约定：

- 子项控件的名字仍是子项自己的标题（「选项 3」），问题文字不并进名字。
- 问题落在子项控件可聚焦的部件上：`aria-invalid="true"`，错误文字经 `aria-describedby` 接上，与 `<xh-field>` 的 `error-text` 一样。子项用 `createPropertyField` 拼时把那一项的问题交给它的 `error`，字段会接好；自己铺的控件就自己写这两个属性，错误文字放在那一项旁边看得见的地方。
- 问题清掉后收回 `aria-invalid` 与描述。写了 `nestedIssues` 的编辑器必须自己显示这些问题，不然它们就看不到了。

```ts
const options: DesignerPropertyEditor = (initial) => {
  let context = initial;
  const element = document.createElement("div");
  let rows: PropertyField[] = [];
  const render = (): void => {
    const items = Array.isArray(context.value) ? context.value : [];
    if (rows.length !== items.length) {
      rows = items.map((_, index) => createPropertyField({
        ownerDocument: document,
        control: { kind: "text" },
        label: `选项 ${index + 1}`,
        setValue: value => context.setValue(items.map((item, i) => (i === index ? { ...item, label: value } : item))),
        commit: () => context.commit(),
      }, { value: undefined }));
      element.replaceChildren(...rows.map(row => row.element));
    }
    rows.forEach((row, index) => row.update({
      value: items[index]?.label,
      readonly: context.readonly,
      error: context.issues.find(issue => issue.path[0] === index)?.message,
    }));
  };
  render();
  return { element, nestedIssues: true, update: (next) => { context = next; render(); } };
};
```

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
| `activate` | 哪些条目能点：`target`（缺省）只有落在对象上的问题能点，设计器据此选中对象；`path` 凡有路径的都能点，JSON 编辑框据此把光标移过去 |

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
- 有 `target` 的条目是按钮，方向键、Home、End 在它们之间移动焦点；没有 `target` 的条目只显示，不可激活。`activate="path"` 时每一条都是按钮。

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
| `headless` | 放进外框的卡片时写：不画自己的标题，由面板头显示；外框的区已是这块地标，正文不再是地标，搜索框照旧 |

| 事件 | detail |
| --- | --- |
| `item-activate` | `{ id, payload }` |

- 方向键、Home、End 在物料间移动焦点，禁用的物料也能停留，读屏照样念出。
- 从物料拖出时的载荷是 `{ source: "palette", id, payload }`。
- 扩展往面板里加的分组（如「我的物料」）经物料来源接进来，见下文「扩展的面板与命令」的「物料来源」。
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

## 页面结构

`<xh-designer-outline>` 按树列出模板里的内容（容器、分组与元素），像图层面板一样定位、删除与挪动。零件只吃节点、吐事件：选中、在画布上标出、删除与挪动都由设计器翻成自己的操作，进撤销栈也归设计器。

```ts
const outline = document.createElement("xh-designer-outline");
outline.nodes = [
  { id: "name", label: "姓名", description: "name" },
  { id: "grid", label: "栅格", children: [
    { id: "col-1", label: "第 1 列", movable: false, deletable: false, children: [{ id: "phone", label: "手机号" }] },
  ] },
];
outline.selection = designer.getSelection().nodes;
outline.allowMove = move => canMove(move);
outline.addEventListener("node-select", event => designer.select({ nodes: event.detail.ids }));
outline.addEventListener("node-highlight", event => markOnCanvas(event.detail.id));
```

| 属性 | 说明 |
| --- | --- |
| `nodes` | `DesignerOutlineNode[]`：`{ id, label, description?, icon?, children?, expanded?, selectable?, movable?, deletable? }`。`children` 是数组就是分支（空数组也能放进东西），没有就是叶子；分支缺省展开，`expanded` 为 false 的第一次出现时先收起，之后随用户展开收起，选中它下面的行时照样展开；`selectable` 为 false 的行只作分组，点了只展开、收起；`movable` 为 false 的行自己不能挪（按住拖不起来，Alt + 方向键也挪不动），仍能当落点，区域、页、页眉页脚这类行就这样写；`deletable` 为 false 的行没有删除钮，Delete 不删它 |
| `selection` | 选中的行 id，受控：点一行只派发 `node-select`，等设计器换上新值。眼下按单选显示，多个时标第一个 |
| `allowMove` | `(move) => boolean`，一次挪动许不许；不给就不能拖。`movable` 为 false 的行先被拦下，不问它 |
| `searchable` | 显示搜索框，按名字与副文本过滤；命中的行连同上级一起展开显示，过滤时不能拖 |
| `readonly` | 能选、能标出，不能删、不能挪 |
| `headless` | 放进外框的卡片时写：不画自己的标题，由面板头显示；标题仍给树命名 |

| 事件 | detail |
| --- | --- |
| `node-select` | `{ ids }` 用户在树上选了这些行 |
| `node-highlight` | `{ id \| null }` 悬停或焦点所在的行变了，离开整棵树时为 `null`；同一行不重复派发 |
| `node-delete` | `{ ids }` 按了删除钮或 Delete / Backspace |
| `node-move` | `{ id, parent, index }` 拖动或 Alt + 方向键挪了一行，已经过 `allowMove` 判定；`parent` 为 `null` 即顶层，`index` 已按先摘后插修正 |

- 树用 [`<xh-tree>`](../components/tree)，键盘与读屏照它的约定：整棵树一个 Tab 位，上下键走行，右键展开、左键收起，Enter 与 Space 选中，连打检索；Alt + 上下键在同一层挪一位，Alt + 左右键改一层缩进，挪动的结果由树的播报区念出。分支缺省展开，展开状态按节点 id 保留；`selection` 换了新值时，被收起的上级跟着展开，选中的行滚进可见区。
- 删除：Delete 或 Backspace 删焦点所在的一行；焦点在选中的行上时，删全部可删的选中项。行尾的删除钮只接指针，悬停或焦点在这一行时出现（粗指针设备常显），对读屏隐藏、不占 Tab 位，按下不夺焦点；可及名取 `translations.remove(名字)`。
- 换了 `nodes` 时整棵树重新铺，焦点原在树里的回到同一 id 的行上。
- 文案键 `xh-designer-outline`：`title`、`help`（面板头里的帮助）、`search`、`empty`、`noMatches`、`remove(label)`。

### 页面结构面板

各款不必自己接零件的事件：写一个适配器交给 `createOutlinePanel`，得到一块面板，放进内置扩展的 `panels`。

```ts
import { createOutlinePanel } from "@xihan-ui/designer-shell";
import { ListTreeIcon } from "@xihan-ui/icons";

const outline = createOutlinePanel<MyContext>({
  nodes: context => toOutlineNodes(context.designer.schema),
  selection: context => context.designer.getSelection(),
  select: (context, ids) => context.designer.select(ids),
  highlight: (context, id) => context.designer.highlight(id),
  remove: (context, ids) => context.designer.remove(ids),
  canMove: (context, move) => context.designer.canMoveTo(move),
  move: (context, move) => context.designer.moveTo(move),
}, { region: { icon: ListTreeIcon }, readonly: context => context.designer.readonly });

const builtin = { id: "my-designer", panels: [outline] };
```

| 适配器 | 说明 |
| --- | --- |
| `nodes(context)` | 整棵树，每次刷新都会再取；同一份文档要给出稳定的 id |
| `selection(context)` | 画布上当前选中的行 id |
| `select(context, ids)` | 选中这些行，并把第一个滚进画布的可见区（必要时切页、切页签、展开折叠项） |
| `highlight(context, id)` | 在画布上标出这一行对应的东西，`null` 撤掉；不改选择、不滚动 |
| `remove(context, ids)` | 删除这些行，通常是先选中再走设计器自己的删除 |
| `canMove(context, move)`、`move(context, move)` | 一次挪动许不许、执行挪动（记为一步撤销）；两个要么都给，要么都不给，不给就不能挪 |

| 选项 | 说明 |
| --- | --- |
| `region` | 面板登记里要换的项，如 `position`、`icon`、`defaultHidden`；缺省区名 `outline`、停在左栏 |
| `searchable` | 显示搜索框，缺省 `true` |
| `readonly(context)` | 返回 `true` 时只读：能选、能标出，不能删、不能挪 |
| `translations()` | 这块面板自己的文案，压在零件文案之上：标题、帮助与零件里的搜索框、空状态都用它，没给的项照旧取零件文案；读的时候现取。同一页面放几款设计器时，各款经它换掉自己那块的说法，不改全局的那一桶 |

- 面板的标题与帮助取零件文案 `xh-designer-outline` 的 `title`、`help`（给了 `translations` 时它压在上面），读的时候按全局配置现取：设计器每次把区交给外框时跟着语言变。
- 每次 `update(context)` 重取树与选中的行，内容没变时不重设，树的展开与焦点不受影响；树上的事件转给适配器，用的是最近一次刷新的上下文。
- 同一行不重复调 `highlight`；面板撤掉时撤掉标出。
- 一个面板对象可以放进各款共用的内置扩展：每个设计器实例各建一份零件，互不相干。
- 适配器只给了 `canMove`、`move` 之一时，`createOutlinePanel` 抛 `TypeError`。

## 历史记录

`<xh-designer-history>` 按先后列出撤销栈里的每一步，标出当前位置；选一行就跳回那一步。零件只吃 designer-kit 历史的快照、吐事件，跳转与清空都由设计器调历史栈，零件不碰文档。

```ts
import { snapshotHistory } from "@xihan-ui/designer-kit";

const panel = document.createElement("xh-designer-history");
const refresh = () => (panel.snapshot = snapshotHistory(editor.history));
editor.history.subscribe(refresh); // 换语言时也调一次：说明按当时的语言取成字符串
panel.addEventListener("history-go", event => editor.history.goTo(event.detail.position));
panel.addEventListener("history-clear", () => runCommand(commands, "clear-history", context));
```

| 属性 | 说明 |
| --- | --- |
| `snapshot` | designer-kit 的 `snapshotHistory(history)`：`{ entries, position, origin, truncated, originSaved }`。历史变了、换了语言都重交一份 |
| `readonly` | 能浏览，不能跳转，清空钮禁用 |
| `headless` | 放进外框的卡片时写：不画自己的标题与清空钮，标题由面板头显示；标题仍给列表命名 |
| `announce` | `(message) => void`，读屏播报：从这里选一行、跳转完成后礼貌级地读一句「跳到哪一步、走了几步」；不给就不播 |

| 事件 | detail |
| --- | --- |
| `history-go` | `{ position }` 用户选了起点或某一步，`position` 是快照里的 `origin` 或那一步的 `position` |
| `history-clear` | `{}` 用户按了头部的清空钮；设计器转给 `clear-history` 命令，先确认再清空 |

- 第一行是起点：打开、重新载入或清空之后的状态，写「打开时」；起点之前有被步数上限丢掉的步骤时写「更早的步骤已丢弃」。其后按先后列出各步，最新的在最下面；没写说明的一步写「编辑」，已撤销的一步字色减淡、副文本写「已撤销」，保存点那一行副文本写「已保存」。
- 列表用 [`<xh-listbox>`](../components/listbox)，单选，选中的就是当前位置：整张列表一个 Tab 位，上下键与 Home、End 只移焦点、不跳转，Enter 与 Space 跳到焦点那一行，点一行同样跳。选中受控：选了一行只派发 `history-go`，列表仍选在当前位置，等设计器交来新快照。
- 头部的清空钮在列表之前占一个 Tab 位；没有步骤或只读时禁用。
- 快照换了时按位置号复用行，只改文字与状态，焦点所在的行不被换掉；当前位置变了就把它滚进可见区。
- 文案键 `xh-designer-history`：`title`、`help`（面板头里的帮助）、`origin`、`originTruncated`、`untitled`、`undone`、`saved`、`empty`、`clear`，清空确认框的 `clearConfirmTitle`、`clearConfirmContent`、`clearConfirmOk`，播报的 `announceUndo(label)`、`announceRedo(label)`、`announceJump(label, steps)`、`announceCleared`。

撤销、重做与清空历史三条命令由 `designerHistoryCommands` 统一给出，见下文「命令」。

### 历史记录面板

各款不必自己接零件：写一个适配器交给 `createHistoryPanel`，得到一块面板，放进内置扩展的 `panels`。

```ts
import { createHistoryPanel } from "@xihan-ui/designer-shell";
import { HistoryIcon } from "@xihan-ui/icons";

const history = createHistoryPanel<MyContext>({
  snapshot: context => context.designer.historyState,
  goTo: (context, position) => context.designer.goToHistory(position),
  announce: (context, message) => context.frame?.announce(message),
}, { region: { icon: HistoryIcon }, readonly: context => context.designer.readonly });

const builtin = { id: "my-designer", commands: [...designerHistoryCommands(options)], panels: [history] };
const host = createPanelHost(frame, { commands: context => commandTable });
```

| 适配器 | 说明 |
| --- | --- |
| `snapshot(context)` | 此刻的快照，说明已按此刻的语言取成字符串（`snapshotHistory`）；每次刷新都会再取 |
| `goTo(context, position)` | 跳到某一步或起点（快照里的位置号）；只读、预览这类不许改的状态由各款自己挡住 |
| `announce(context, message)` | 读屏播报，通常交给外框的 `announce`；不给就不播 |

| 选项 | 说明 |
| --- | --- |
| `region` | 面板登记里要换的项，如 `icon`、`position`、`defaultHidden`；缺省区名 `history`、停在右栏、缺省隐藏 |
| `readonly(context)` | 返回 `true` 时只读：只能看，不能跳 |

- 缺省隐藏，从「面板」菜单打开；登记在右栏的内置面板之后，打开后在属性下面。外壳不依赖图标包，图标由各款经 `region.icon` 给。
- 面板头是清空历史：面板登记了 `headerCommands: ["clear-history"]`，设计器的命令表里要有这条命令（`designerHistoryCommands`），`createPanelHost` 要给 `commands` 才铺得出来。零件是 headless 的，不画自己的清空钮。
- 面板的标题与帮助取零件文案 `xh-designer-history` 的 `title`、`help`，读的时候按全局配置现取：设计器每次把区交给外框时跟着语言变。
- 每次 `update(context)` 重取快照，内容没变时不重设；选一行转给适配器的 `goTo`，跳到以后零件经适配器的 `announce` 读一句。用的都是最近一次刷新的上下文。清空、保存这类不改文档的变化也要刷新面板。
- 一个面板对象可以放进各款共用的内置扩展：每个设计器实例各建一份零件，互不相干。

## 变换覆盖层

`<xh-designer-transform>` 叠在画布上方，画选中框、控制柄、旋转柄、对齐线、框选框、悬停框与尺寸徽标，并跑移动、缩放、旋转与框选的手势。命中判断归设计器：设计器在选中项上按下后调 `startMove`，在空白处按下后调 `startMarquee`；控制柄由覆盖层自己接。覆盖层盖满画布、左上角就是视口的屏幕原点，除控制柄外不挡指针。

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
| `measure` | 尺寸徽标何时显示：`gesture`（缺省）只在拖动、缩放中只读显示；`selection` 选中即常驻，单选能缩放时可以直接改宽高，见下文「尺寸徽标」 |
| `measureOptions` | 徽标的单位、换算、精度与步长 `{ unit?, displayUnit?, convert?, unitLabel?, fractionDigits?, step?, largeStep? }`；不给不显示徽标 |
| `rotate-step` | 按住 Shift 旋转时吸附的角度，缺省 15 |
| `readonly` | 不画控制柄，`startMove` 不起作用，徽标只显示不能改；框选照常 |
| `translations` | 覆盖 `xh-designer-transform` 桶里的文案：`measure`（徽标这一组的名字）、`width`、`height`（两个数字框的名字）、`measureText(width, height, unit)`（只读显示的整句） |

| 方法 | 说明 |
| --- | --- |
| `startMove(event, { copy? })` | 越过激活距离后移动全部选中项 |
| `startMarquee(event, { additive? })` | 越过激活距离后开始框选 |
| `cancel()` | 取消进行中的手势，派发 `cancel` |
| `focusToolbar()` | 把焦点交给上下文工具条：先交给工具条里 roving 的当前条目，没有就交给第一个能聚焦的；工具条没显示时什么都不做。返回是否交了 |
| `focusMeasure()` | 把焦点交给尺寸徽标里第一个能改的数字框；徽标没显示数字框时什么都不做。返回是否交了 |

| 事件 | detail |
| --- | --- |
| `transform` | `{ phase, kind, rects, guides, copy? }`：`phase` 为 `start`、`move`、`end`、`cancel`，`kind` 为 `move`、`resize`、`rotate`，`rects` 是 id 到新矩形的表，`cancel` 时为开始时的矩形；`copy` 只在移动时有 |
| `marquee` | `{ phase, rect, mode, additive }`：`rect` 是世界坐标的选框，`mode` 自左向右拖为 `contain`、反向为 `intersect`，交给 `selectInMarquee` |
| `pan-request` | `{ dx, dy }`：拖到画布边缘时逐帧派发，含义与通用拖放相同 |
| `measure-change` | `{ id, rect, axis, source }`：用户在徽标里改了宽或高。`rect` 是改后的模型矩形，左上角不动；`axis` 为 `width` 或 `height`；`source` 为 `step`（加减钮、方向键）或 `input`（输入后确认）。设计器按自己的编辑命令改模型、记撤销，再更新 `items` |

- 修饰键：缩放时 Shift 等比、Alt 以中心为基准；旋转时 Shift 按 `rotate-step` 吸附；移动时 Shift 锁定水平或竖直、Alt 为复制。修饰键在拖动中按下也算。Esc 取消。
- 设计器在 `move` 阶段是只看预览还是执行事务自行决定；手势进行中覆盖层按自己算出的矩形画框，不等 `items` 更新。
- 单选按该项的能力出控制柄。多选画各自的细框与整体包围框，可以整体移动；每一项都能八向缩放时，包围框上出八个控制柄（不出旋转柄），拖动按包围框等比缩放全部选中项：位置与尺寸乘同一比例，旋转角不变，Alt 以中心为基准，任一项缩到 `minSize` 即停。`transform` 事件的 `kind` 为 `resize`，`rects` 带全部选中项。
- 缩放时只吸附被拖动的那条边；单选时旋转过的矩形缩放时不吸附。
- 控制柄是固定的屏幕尺寸，按旋转后的方向画，指针形状随角度换；粗指针设备放大命中区。
- 画的框、线、控制柄与只读显示的徽标都是 `aria-hidden`；上下文工具条与带数字框的徽标不是。

### 上下文工具条

写 `slot="toolbar"` 的子节点是选中时浮在选中框上的一条工具条，内容由各款放，通常是一条横排的命令工具栏：各款按当前选中算出主体（如 `element`、`text`、`node`、`multiple`），用 `arrangeCommands("selection:<主体>", …)` 排出分组，宿主经 `commandLayout` 改排列，扩展登记命令时在 `placement` 里写 `selection:<主体>` 就会出现在这里。

- 位置：在选中框（多选时是整体包围框）上方居中，有旋转柄时让开它；上方放不下时翻到下方，尺寸徽标显示着就排在徽标下面；左右夹在覆盖层里。落在哪一侧写在工具条部件的 `data-placement` 上（`top` 或 `bottom`）。
- 显示：有选中才显示；只读、手势进行中（移动、缩放、旋转、框选）或没有内容时收起，松手后再出现。工具条跟着画布裁剪，不进浮层。
- 外观：实体底、描边与一层柔和投影，接指针。
- 键盘：各款在画布的 keydown 里认 Alt+F10，调 `focusToolbar()` 把焦点交过去；在工具条里按 Esc，焦点回到交之前的位置。

```ts
const format = document.createElement("xh-toolbar");
format.slot = "toolbar";
overlay.append(format);
canvas.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "F10" && overlay.focusToolbar())
    event.preventDefault();
});
```

### 尺寸徽标

给了 `measureOptions` 时，选中框（多选时是整体包围框）底边下方居中有一块尺寸徽标：

- `measure` 为 `gesture`（缺省）：只在拖动、缩放中显示实时尺寸，只读。
- `measure` 为 `selection`：选中即常驻。单选、不是只读、这一项能缩放时，宽、高各一个数字框（库内 `<xh-number-field>`，带加减钮），整块接指针；多选时写整体包围框的尺寸，`handles: false` 的项与只读时写元素自己的宽高，都只读。拖动、缩放中只读显示实时尺寸，松手回到数字框。只给了某些方向的控制柄时，只有能缩放的那一边可以改。
- 单位：`unit` 是模型坐标的长度单位，`displayUnit`（缺省同 `unit`）是显示单位，数值按 designer-kit 的 `convertLength` 换算、`formatLength` 按 locale 写出，最多 `fractionDigits`（缺省 1）位小数；单位文字缺省取显示单位的符号。不是长度的设计器不给 `unit`，徽标直接显示模型数值，单位文字写在 `unitLabel` 里。单选写元素自己的宽高，不是旋转后的外接框。
- 逐轴换算：模型坐标与显示值不是同一种长度、两轴换算还不一样时（如按格计的看板，模型是画布像素，显示格数，列距与行距不同、还要扣掉间隙），给 `convert: { toDisplay(value, axis), toModel(value, axis) }`。给了它，数值只按它换算，`unit`、`displayUnit` 只用来取缺省的单位文字；显示、步进、取整与 `minSize` 的下限都在显示值上算，交出的 `rect` 按 `toModel` 换回模型。不给时照旧按 `unit`、`displayUnit` 换算。
- 单位文字随语言：`unitLabel` 由设计器按自己的语言包给（如「格」「cells」），换了语言重交一份 `measureOptions`，徽标跟着刷新；外壳不写死任何单位文字。
- 改值：加减钮、上下方向键按 `step`（缺省 1），Shift 加上下方向键与 PageUp / PageDown 按 `largeStep`（缺省 10），马上派发 `measure-change`；输入数字后按 Enter 或离开数字框才派发，输入途中不派发，Esc 放弃输入。新值按精度取整、不小于 `minSize`；`keepAspect` 的项改一边，另一边按比例跟着变；值没变不派发。覆盖层不改 `items`，由设计器改完模型后更新。
- 键盘与指针：工具条在徽标之前，Alt+F10 交给工具条后，在工具条里按 Tab 接着进到徽标的数字框；没有工具条时各款可以让 Alt+F10 改调 `focusMeasure()`。在徽标里按 Esc，焦点回到交之前的位置。徽标里的按键与按下不冒泡到画布，打字时的 Delete 不会删掉元素。
- 外观：带数字框时与上下文工具条同一种实体面，数字框按内容定宽；只读显示时是一枚品牌色的小标签。

```ts
overlay.measure = "selection";
overlay.measureOptions = { unit: "mm", fractionDigits: 1, step: 1, largeStep: 10 };
overlay.addEventListener("measure-change", (event) => {
  const { id, rect } = event.detail;
  resize(id, rect);
});
```

按格计的看板：模型是画布像素，列距、行距各含一道间隙。

```ts
const pitch = { width: metrics.column, height: metrics.row };
const gap = { width: metrics.columnGap, height: metrics.rowGap };
overlay.measureOptions = {
  convert: {
    toDisplay: (value, axis) => (value + gap[axis]) / pitch[axis],
    toModel: (value, axis) => value * pitch[axis] - gap[axis],
  },
  unitLabel: t.cells, // 设计器自己的文案，换语言时重交
  fractionDigits: 0,
};
```

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

`<xh-designer-frame>` 是设计器的整体版式：最上一条顶栏，下面一条工具栏，中间一行左、中、右三栏，中间一栏的下方再分一栏，最下一条状态栏。版式按命名区排，缺省登记顶栏 `header`、工具栏 `toolbar`、物料 `palette`、画布 `canvas`、属性 `properties`、问题 `issues`、状态栏 `status` 七个区。作者内容用 `slot="<区名>"` 标在直接子节点上，没写 `slot` 的进中间区。

左、右、下三栏里的区是面板：停在哪一栏、先后、显隐、收成标题条、浮出成小窗，都记在一份布局 `layout` 里。外框改了布局就换成改完的整份，并派发 `layout-change`；设计器把它存进设置的 `layout.panels`。栏与栏、同一栏的面板之间是 `<xh-splitter>` 的分隔条，可以拖动或用键盘调整大小。

```ts
import { DESIGNER_SETTING_KEYS } from "@xihan-ui/designer-shell";

const frame = document.createElement("xh-designer-frame");
frame.append(toolbar, palette, canvas, properties, issues); // 各自写好 slot="toolbar" 等
frame.layout = settings[DESIGNER_SETTING_KEYS.layout]; // 上次存下的布局，没有就用缺省布局
frame.addEventListener("layout-change", event => save(DESIGNER_SETTING_KEYS.layout, event.detail.layout));
```

| 属性 | 说明 |
| --- | --- |
| `regions` | 产品登记的命名区，缺省为 `DESIGNER_FRAME_REGIONS` |
| `layout` | 面板布局 `DesignerLayout`，见下文「面板布局」；不给即缺省布局 |
| `defaultLayout` | 宿主的缺省布局：用户没存过布局时用它，「恢复默认布局」也回到它；写了的字段整项覆盖内置缺省 |
| `layoutPolicy` | 宿主对布局的管控 `{ locked?, panels? }`，通常由 `designerLayoutPolicy(settingsPolicy)` 换算得来 |
| `resolvedLayout` | 只读：此刻的整份布局，每个字段都在 |
| `narrow` | 只读：视口窄于断点、左右两栏收进抽屉时为 `true`，见下文「窄屏」 |

| 方法 | 说明 |
| --- | --- |
| `showsPanel(name)` | 这个区是否显示：中间区与工具栏总是显示，顶栏、状态栏看有没有内容，面板与画布浮动件看布局（浮出的也算），没登记的区为否 |
| `panelEntries()` | 面板菜单的数据：能停靠的面板与画布浮动件，按登记顺序，`closable: false` 的不列。每项 `{ name, label, icon?, shown, dock?, minimized, floating, locked, movable, floatable, minimizable }`（后三项是此刻能不能换栏、浮出、收起，算上了管控）；`label` 依次取 `title`、`label`、`name`，`shown` 是它此刻看得见：没隐藏，所在栏没在分隔条上收起，窄屏时左右两栏的面板还要它所在的抽屉开着 |
| `togglePanel(name)` | 开关一块面板：显示着就隐藏、隐藏着就显示。所在栏在分隔条上收起着时是把那一栏放回收起前的大小；窄屏时左右两栏的面板是开关它所在那一侧的抽屉 |
| `setPanelVisible(name, visible)` | 显示或隐藏一块面板 |
| `movePanel(name, dock, index?)` | 停到某一栏的第 `index` 位（按布局里那一栏的先后算，含隐藏的；缺省末尾），浮着的一并吸回 |
| `setPanelMinimized(name, minimized)` | 收成标题条或展开 |
| `floatPanel(name, rect?)` | 浮出成小窗；`rect` 是相对外框左上角的像素位置与大小，不给时按卡片此刻的大小放在中间一行的中央 |
| `dockPanel(name)` | 把小窗吸回原来的栏与位置 |
| `revealPanel(name)` | 把显示着的面板亮出来：收在窄屏抽屉里的打开抽屉，所在栏在分隔条上收起的放回，收成标题条的展开；面板隐藏着时返回 `false`。引导与问题定位用 |
| `toggleAllPanels()` | 有面板显示着就全部隐藏，否则放回全部隐藏前的那一组；不动工具栏与状态栏 |
| `restorePanels()` | 各面板的显隐回到缺省，位置与大小不动 |
| `resetLayout()` | 整份布局回到缺省：显隐、停靠、先后、大小、收起、浮出一起复原 |
| `announce(message)` | 礼貌级地读一句，经 core 的页面级播报器（[`announce`](../guide/behavior#页面级播报)）；外框自己在挪动、浮出、停靠、收起与隐藏之后各读一句 |

宿主锁定了整份布局或某块面板时，改那块面板的方法什么都不做。

| 事件 | detail |
| --- | --- |
| `layout-change` | `{ layout, reason }`：布局变了，`layout` 是改完的整份（`ResolvedDesignerLayout`，可以直接存）。`reason` 取 `toggle`、`move`、`minimize`、`float`、`dock`、`resize`、`reset`。指针拖分隔条只在松手时派发，方向键调的、在分隔条上收起或放回的当场派发；拖小窗的标题栏挪动在松手时派发，用键盘挪动与改尺停 300 毫秒后派发 |

命名区就是面板的登记，是 `{ name, position, size?, minSize?, label?, title?, subtitle?, help?, icon?, anchor?, defaultHidden?, closable?, movable?, floatable?, minimizable? }`：

- `position` 取 `header`、`top`、`start`、`center`、`end`、`bottom`、`status`、`overlay`。`start`、`end`、`bottom` 上的区是面板，这里写的是它缺省停的栏；同一栏的多块面板按登记顺序上下排列，共用一栏的大小，之间有分隔条，可拖动，也可聚焦后用上下方向键调整（Shift 加大步长）。`overlay` 是画布浮动件，见下文「画布区的浮动条」。
- `size` 是那一栏的缺省大小：左右两栏占中间一行的宽度，下栏占中间一栏的高度；`minSize` 是拖动的下限，缺省 10。都取那一栏第一块面板的值。中间区至少留 20。外框还按尺寸槽给的像素下限折算，两者取大的，见下文「尺寸槽」。
- `label` 是分隔条无障碍名称里的区名，缺省用 `title`，再缺省用 `name`；名称取文案 `resize`，分隔条所在的布局取文案 `layout`。
- `icon` 是面板菜单与浮出小窗标题栏里的图标。`defaultHidden` 的面板缺省不显示。`closable`、`movable`、`floatable`、`minimizable` 缺省都是 `true`，写 `false` 就不出对应的钮与菜单项；没给 `title` 的区没有面板头，只能显示或隐藏。
- 隐藏的面板移出文档，内容保留，再显示时原样放回。
- 区的结构变了（比如换了一份不带标题的区表，卡片变回普通区）时，已经搬进去的作者内容跟着挪到新结构里；新结构里没有对应位置的（面板头操作区里的内容），回到外框下面、不占版面，等结构里再有这个位置时自动放回。从 `regions` 里去掉的区，里面的作者内容同样回到外框下面。带 `slot` 而外框没有对应位置的作者内容留在外框下面，不显示。
- 外框自己生成的结构（上方条、中间行、栏、分隔条、区容器、小窗与落点层）都带 `data-scope="designer-frame"`，区容器另带 `data-region`（区名）与 `data-position`（所在的栏或位置，浮出的写 `float`）。外框的样式只认这个 scope，区里的作者内容即使也用了 `data-part="region"` 之类的部件名，也不受外框样式影响。

### 面板布局

`DesignerLayout` 是一份 JSON，除 `version` 外都可以不写：

| 字段 | 说明 |
| --- | --- |
| `version` | 恒为 `1`（`DESIGNER_LAYOUT_VERSION`）；读到别的版本按缺省布局 |
| `docks` | `{ start?, end?, bottom? }`：三栏里各面板 id 的先后。浮出的面板也留在原来的栏里，记着吸回去的位置；没列到的面板按缺省位置排在那一栏的后面 |
| `hidden` | 隐藏的面板与画布浮动件 |
| `minimized` | 收成标题条的面板 |
| `floating` | 面板 id → `{ x, y, width, height }`：浮出的小窗相对外框左上角的像素位置与大小 |
| `sizes` | `{ start?, end?, bottom?, panels? }`：三栏的大小（百分比），以及同一栏里各面板分到的份额（百分比，键为面板 id） |
| `collapsed` | 在分隔条上收起的栏 |

- 写了的字段整项覆盖缺省布局，没写的取缺省：缺省布局是宿主的 `defaultLayout`，再缺省是各面板按登记顺序停在 `position` 那一栏、`defaultHidden` 的隐藏。
- 认不得的面板 id、不合法的值去掉，不报错：存下的布局里可能有已经卸掉的扩展面板。不能挪的面板只认它缺省的那一栏。登记了却没出现在布局里的面板（后装的扩展）按缺省位置放。
- 同一栏当前显示的面板按 `sizes.panels` 的比例分高度，合计不必是 100，外框按比例归一；没有记录的面板按等分值（100 ÷ 面板数）补上，都没有记录时即等分。每块至少占 10%（面板多到放不下时取等分），归一后低于下限的定在下限，其余按比例分剩下的。隐藏其中一块时，其余按各自的比例分掉它的高度；记录仍在，再显示时恢复。
- 外框派发的 `layout` 总是整份、只含登记着的面板，同一份布局派发出去又赋回来不会重排。

宿主的管控：

| `layoutPolicy` | 效果 |
| --- | --- |
| `{ locked: true }` | 整份布局只读：面板头不出收起、更多与关闭钮，不能拖，面板菜单里的面板不可点，改布局的方法什么都不做 |
| `{ panels: { <id>: "hidden" } }` | 这块面板不存在：不显示、不进面板菜单，布局里写了也不认 |
| `{ panels: { <id>: "locked" } }` | 这块面板固定：不能隐藏、挪动、浮出、收起，别的面板照常 |

`designerLayoutPolicy(settingsPolicy)` 从设置的管控换算：`layout.panels`（或整个 `layout` 分区）被藏或锁时整份锁定，`layout.panels.<面板 id>` 管一块面板。

布局的纯函数不碰 DOM，设计器或宿主改布局、读布局时可以直接用：

| 函数 | 说明 |
| --- | --- |
| `resolveDesignerLayout(regions, layout?, defaults?, policy?)` | 合成此刻的整份布局 |
| `defaultDesignerLayout(regions, defaults?, policy?)` | 缺省布局 |
| `designerLayoutEquals(a, b)` | 两份布局是不是同一份 |
| `designerPanelAbilities(region, policy?)` | 一块面板此刻能做的事：`{ closable, movable, floatable, minimizable }` |
| `designerPanelDock(layout, id)` | 面板停在哪一栏 |
| `withDesignerPanelVisible`、`withDesignerPanelMoved`、`withDesignerPanelMinimized`、`withDesignerPanelFloating`、`withDesignerDockSize`、`withDesignerPanelShares` | 几种改法，返回新的一份 |

### 顶栏与状态栏

顶栏与状态栏是整宽的一条，不可拖动，不是面板，按段放内容：

| 区 | 段与插槽 | 只写区名时进 |
| --- | --- | --- |
| `header` | `header-start`（标志与名称）、`header-center`（插入快捷按钮）、`header-end`（主操作） | `header-center` |
| `status` | `status-start`（选中对象的信息）、`status-end`（缩放、保存与连接状态） | `status-start` |

- 各段有内容才显示这一条，内容拿走就收起。不要状态栏（比如设置里关掉了）时从 `regions` 里去掉 `status` 区，里面的状态项回到外框下面，再登记时放回。
- 段用 `data-part="zone"` 与 `data-zone` 标出，左段贴左、中段居中、右段贴右；状态栏的文字取弱一档的颜色与小一号的字。
- 顶栏中段放 `placement` 含 `header` 的命令：另建一条 `display: "stacked"` 的命令工具栏，写上 `slot="header-center"` 交给外框，见下文「命令」。
- 状态栏上的每一项用 `createStatusItem` 建，标签、值与分隔四款一致：

  ```ts
  import { createStatusItem } from "@xihan-ui/designer-shell";

  const selection = createStatusItem(document, { label: "已选", value: "2 个节点" });
  const zoom = createStatusItem(document, { label: "缩放", value: "80%", action: () => designer.zoomToActual() });
  selection.element.slot = "status-start";
  zoom.element.slot = "status-end";
  frame.append(selection.element, zoom.element);
  zoom.update({ label: "缩放", value: "100%" });
  ```

  | 选项 | 说明 |
  | --- | --- |
  | `label` | 标签，取弱一档的颜色显示在值前面；不给只显示值 |
  | `value` | 值 |
  | `tone` | 值的语气，如保存失败写 `danger` |
  | `action` | 给了这一项就是一颗 ghost 小按钮（`<xh-button>`），点了调用它；建好之后不能再改成纯文字或反过来 |

  返回 `{ element, update(state) }`，`update` 换标签、值与语气。同一段里相邻两项之间一道细分隔。

### 面板卡片

三栏里的区给了 `title` 就画成一张卡片：承载面的底、描边与圆角，四周留出间距，上面是面板头，下面是可以滚动的正文，作者内容放进正文。

- 面板头左边是标题与一行副标题（`subtitle`，不给不显示）；右边依次是操作区、帮助钮、收起钮、「更多」钮与关闭钮。
- 操作区放 `slot="<区名>-actions"` 的作者内容，没有内容时收起。扩展的面板给 `headerCommands` 时，面板宿主在这里铺一小条命令，见下文「扩展的面板与命令」。
- `help` 给了才出帮助钮，悬停或聚焦时用 `<xh-tooltip>` 弹出这段说明，按钮的名字取文案 `panelHelp`。
- 收起钮把面板收成标题条：只剩面板头，留在原位，同一栏的其余面板分剩下的高度；一栏全收起时几条面板头贴着栏顶，下栏全收起时下栏只剩面板头那么高。再点展开。双击面板头也是收起与展开。名字取文案 `minimizePanel` / `expandPanel`，带 `aria-expanded`。
- 「更多」钮打开一张 `<xh-menu>`，按此刻的布局列出能做的事：移到左栏、右栏、下栏，上移、下移，浮出或停靠，收成标题条或展开，隐藏。键盘与读屏挪面板靠它。从右往左写时左右两栏对调叫法。
- 关闭钮隐藏这块面板，名字取文案 `closePanel`。
- 卡片是 `role="region"`，以标题为名。区后来加了或去掉标题，外框连同已经搬进去的内容一起换成新的结构。
- 物料、属性、问题三个零件放进卡片时写 `headless`：不画自己的标题，由面板头显示。

### 拖动面板与浮出

- 按住面板头（不在按钮与操作区上）拖动，越过激活距离才开始，跟手的是面板头的副本。外框盖上一层落点层：左、右、下三条停靠条，栏空着也能停；拖进一栏两块面板之间画一条插入线；拖到画布上画出浮出的落位框。松手在停靠条上停到那一栏末尾，在插入线处插在那里，在画布上就地浮出；停回原处不算。Esc 取消。窄屏不拖。
- 浮出的面板放进一个 `<xh-floating-panel>` 小窗：标题栏是图标、标题与拖动把手，加停靠、收拢与关闭三颗钮，八个边角可以改尺。卡片的标题、收起、更多与关闭由小窗的标题栏代替，面板头只留副标题、操作区与帮助。
- 小窗限在外框里：挪出去、改得比外框大时夹回框内；外框变小、页面滚动时跟着外框重新落位。位置按外框左上角记，`floating` 里存的就是这个。
- 拖着小窗的标题栏时外框同样盖上落点层：松在停靠条上停到那一栏末尾，松在一栏两块面板之间插在那里，小窗随之收起；松在别处就是挪动，松手时派发。停靠钮把小窗吸回浮出前的栏与位置；收拢就是小窗的收拢形态，记在 `minimized` 里；关闭是隐藏这块面板，再显示时仍是小窗。

### 画布区的浮动条

中间区的四角与右侧中间各有一个落点，放浮动在画布内容之上的小工具条或小地图：

| 插槽 | 落点 |
| --- | --- |
| `<中间区名>-top-start` / `-top-end` | 左上、右上 |
| `<中间区名>-bottom-start` / `-bottom-end` | 左下、右下 |
| `<中间区名>-end` | 右侧中间，竖排 |

缺省中间区名是 `canvas`，所以插槽是 `canvas-top-start` 等。落点没有内容时不占位置。右侧中间的竖条不超出中间区，里面放竖排的命令工具栏（`createCommandToolbar(document, { orientation: "vertical" })`）时，画布矮了放不下的条目按高度收进「更多」。

要能在面板菜单里开关的浮动件（小地图、翻页条）登记成画布浮动件：`{ name: "minimap", position: "overlay", anchor: "bottom-end", label: "小地图" }`，内容写 `slot="minimap"`。外框把它放进 `anchor` 那个落点（缺省 `bottom-end`），排在作者在同一落点写的内容后面；它跟着布局的 `hidden` 显示或隐藏，进面板菜单，不能挪、浮出或收起。

### 尺寸槽

外框上的几个 CSS 自定义属性，缺省取 UI 的语义令牌：

| 尺寸槽 | 缺省 | 作用 |
| --- | --- | --- |
| `--xh-designer-frame-start-min` | `--xh-layout-col-min-sm` | 左栏拖动的下限 |
| `--xh-designer-frame-end-min` | `--xh-layout-col-min-md` | 右栏拖动的下限 |
| `--xh-designer-frame-bottom-min` | `--xh-layout-col-min-xs` | 下栏拖动的下限 |
| `--xh-designer-frame-gap` | `--xh-space-2` | 卡片与四周、画布浮动条与边缘的间距 |
| `--xh-designer-frame-panel-px` / `-py` | `--xh-space-3` / `--xh-space-2` | 面板头、顶栏与状态栏的内边距 |
| `--xh-designer-frame-status-h` | `--xh-control-h-sm` | 状态栏的最小高度 |

- 三个下限是像素宽度，外框量出后按自己当前的宽高折成百分比交给分隔条，外框变宽变窄时重新折算。收成标题条的面板同样按量出的面板头高度折算。
- 三栏在分隔条上可以收起：双击分隔条，或聚焦后按 Enter，收起它旁边那一栏，再来一次按收起前的大小放回；左边那条管左栏，右边那条管右栏，中间一栏下方那条管下栏。
- 收着期间外框重排（换了显示的面板、外框变宽变窄、窄屏来回）后仍收着，再双击或按 Enter 照样放回收起前的大小，焦点留在那条分隔条上。布局的 `sizes` 记的是收起前的大小，不记 0，收起的栏记在 `collapsed` 里。

### 窄屏

视口窄于断点令牌 `--xh-breakpoint-md` 时外框进窄屏，外框上写 `data-narrow`，`narrow` 为 `true`：

- 中间一栏占满整行，下栏照旧在中间一栏下面；左右两栏收进从两边滑出的 `<xh-drawer>`，缺省收着。抽屉在外框里面（`contained`）、非模态，压在画布上，不挤窄画布。
- 「面板」命令与 `togglePanel` 开关抽屉，同时只开一侧，开另一侧时这一侧收起，不改布局；隐藏着的面板开抽屉时先显示并派发一次 `layout-change`。
- 面板头的关闭钮与 Esc 只收起抽屉，布局不变。抽屉以它里面各面板的标题为名，从右往左写时两侧对调。
- 浮出的面板窄屏时按停靠显示在原来那一栏的抽屉里，不改存下的布局，回到宽屏再浮出来。窄屏不能拖动面板，「更多」菜单里不出换栏与浮出。
- 视口变宽回到三栏，抽屉收起；再变窄时两侧都收着。
- 没有 `matchMedia` 或断点令牌缺席时不进窄屏。

## 设置

设计器的设置是用户偏好，每人每机一份，不是模板数据：主题、主题色、状态栏与语言，工具栏的显示方式与按钮，面板布局，再加各款与扩展自己的条目。`<xh-designer-settings>` 是设置对话框；`createDesignerSettingsHost` 把主题与主题色落到设计器上，并读写存储。

```ts
import { collectSettingsSections, createDesignerSettingsHost } from "@xihan-ui/designer-shell";
import { BRAND_PRESET_COLORS, BRAND_PRESETS, registerBrand } from "@xihan-ui/tokens";

const brands = BRAND_PRESETS.map(id => ({ value: id, color: BRAND_PRESET_COLORS[id] }));
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

- 分区是 `{ id, label, order?, items }`，对话框左边一页。`order` 小的在前，内建的「基础」是 0、「布局」是 1、「工具栏」是 2，各款从 100 起，扩展从 200 起，900 以后留给内建的「帮助」「快捷键」「关于」，同值按登记顺序。
- 条目就是 `@xihan-ui/designer-kit` 的属性描述：`path` 只写一段条目 id，`label` 是标签，`default` 是缺省值，说明写在 `meta.description`。
- 值是扁平的键值：键是 `<分区 id>.<条目 id>`，没写的键取条目的 `default`。
- 内建编辑方式与属性面板同一套字段；别的种类交给对话框的 `editors`，被编辑的对象是整份设置。

| 函数 | 说明 |
| --- | --- |
| `collectSettingsSections(sources)` | 合起各来源（`{ id, settings? }`，扩展的 `settings` 字段就是这个形状）的分区。分区 id 重名时抛 `DesignerExtensionError`，名字空间 `settings-section`；`general`、`layout`、`toolbar`、`help`、`shortcuts`、`about` 留给内建 |
| `sortSettingsSections(sections)` | 按 `order` 排好，同值按传入顺序 |
| `settingKey(section, item)` | 条目的键 |
| `settingValue(settings, section, item)` | 条目此刻的值：写了用写的，没写取缺省值 |
| `resolveSettings(sections, settings)` | 此刻生效的设置：写了的键原样保留，各分区里没写的条目取缺省值（没有缺省值的不写）。交给命令、面板与扩展的上下文用这一份；`sections` 通常是 `collectSettingsSections` 合出的分区，基础分区要缺省值时把 `designerGeneralSettings` 的分区也传进来 |
| `settingPolicy(policy, section, item)` | 条目在宿主管控下的状态：先看条目键，再看分区 id |
| `designerGeneralSettings(t, options?)` | 内建的「基础」分区；对话框自己会生成，各款要单独拿条目时用 |
| `designerLayoutSettings(t)` | 内建的「布局」分区（`DESIGNER_LAYOUT_SETTINGS`）：一条 `panels`，编辑方式 `PANEL_LAYOUT_CONTROL`；对话框给了 `frame` 时自己生成 |
| `designerToolbarSettings(t, { layout? })` | 内建的「工具栏」分区（`DESIGNER_TOOLBAR_SETTINGS`）：按钮显示方式、显示工具栏，`layout` 为真时加按钮表（编辑方式 `TOOLBAR_LAYOUT_CONTROL`）；对话框自己生成 |

### 「基础」分区

| 条目 | 键 | 编辑方式 | 缺省 | 何时出现 |
| --- | --- | --- | --- | --- |
| 主题 | `general.theme` | 分段：跟随页面、跟随系统、亮色、暗色 | `follow` | 总有 |
| 主题色 | `general.brand` | 色板 | 不写即跟随页面 | 给了 `brands` 或 `customBrand` |
| 状态栏 | `general.statusBar` | 开关 | `true` | 总有 |
| 语言 | `general.language` | 下拉 | 不选即跟随页面 | 给了 `languages` |

键也在 `DESIGNER_SETTING_KEYS` 里。主题与主题色由 `createDesignerSettingsHost` 落到设计器上；状态栏与语言由各款自己接，例如状态栏关掉时从外框的 `regions` 里去掉 `status` 区，语言换成对应的产品语言包。面板布局也存在设置里，键是 `layout.panels`（`DESIGNER_SETTING_KEYS.layout`），对话框里对应「布局」页，见下文与「外框」的「面板布局」。

### 「工具栏」分区

| 条目 | 键 | 编辑方式 | 缺省 | 何时出现 |
| --- | --- | --- | --- | --- |
| 按钮显示方式 | `toolbar.display` | 分段：图标、文字、图标和文字 | `icon` | 总有 |
| 显示工具栏 | `toolbar.visible` | 开关 | `true` | 总有 |
| 按钮 | `toolbar.layout` | 按钮表（`toolbarLayout`） | 不写即缺省排列 | 对话框给了 `toolbar` 的缺省排列与命令 |

工具栏只走设置，各款不另设属性：`toolbarDisplayOf(settings)` 取显示方式（没写或不认识的值是 `icon`），交给命令工具栏的 `setDisplay`；`toolbarVisibleOf(settings)` 只有写了 `false` 才是不显示，各款这时从外框的 `regions` 里去掉工具栏的区，命令照样能经快捷键与菜单执行。

按钮表只管顶部工具栏：顶栏的插入钮、右键菜单与选中工具条都不进用户定制，只由宿主的 `commandLayout` 改。

- **列什么**：对话框的 `toolbar` 是 `{ defaults, commands }`：`defaults` 是缺省排列（各款 `arrangeCommands("toolbar", …)` 排出的分组，已含宿主 `commandLayout` 与扩展追加的那一组），`commands` 是其中每条命令的短文字、图标与快捷键。各款每轮更新时用 `toolbarSettingsSource(defaults, 命令表, 上下文)` 现算，交给对话框；文字取 `commandShortLabel`（撤销这类文字随下一步变的命令写固定的短名），按此刻的语言取，所以每编辑一步算出来的数据不变、表不重铺。
- **样子**：一组一块，组头是三态勾选框（全选、部分、全不选）与拖动把手，下面每条命令一行：勾选框（图标与名字）、快捷键、拖动把手。组与组之间、组里的命令都能拖，命令能从一组拖进另一组；键盘在把手上用空格拿起、方向键挪、空格放下（竖排的命令列表用左右键挪到相邻的组）。表下一颗「恢复默认」删掉这个键。组这一层是一个 `<xh-sortable>`，组里的命令各是一个同 `group` 的 `<xh-sortable>`。
- **值**：`DesignerToolbarCustomization`，`{ groups, hidden? }`：`groups` 按用户的先后列出全部命令（含藏起的），藏起的写进 `hidden`，重新勾上时回到原位；整组藏起就是组里每条都在 `hidden` 里。
- **生效**：先 `arrangeCommands("toolbar", 命令表, 缺省排列, commandLayout)`，再 `applyToolbarCustomization(上一步的分组, toolbarCustomizationOf(settings))`。用户值里有、命令表里已经没有的命令跳过，不抛错（宿主 `commandLayout` 写错 id 照旧抛错）；命令表里新有、用户值里没有的命令（后装的扩展）放在缺省排列里同组前面最近一条之后，没有就放在后面最近一条之前，整组都新就另起一组。
- **管控**：`toolbar.layout` 锁定时按钮表只读，藏掉时没有这张表；显示方式与显示工具栏照常。整个 `toolbar` 分区也能藏或锁。

| 函数 | 说明 |
| --- | --- |
| `toolbarCustomizationOf(settings)` | 设置里的 `toolbar.layout`；没写或形状不对时为 `undefined` |
| `mergeToolbarCustomization(arranged, customization)` | 合起缺省排列与用户定制，列出全部命令（含藏起的），规则如上；按钮表用它 |
| `applyToolbarCustomization(arranged, customization)` | 合起来以后去掉藏起的命令与空组，就是工具栏此刻的分组 |
| `toolbarSettingsSource(defaults, commands, context)` | 交给对话框 `toolbar` 的数据，命令表里没有的跳过 |
| `toolbarVisibleOf(settings)` | 显示工具栏，只有写了 `false` 才为 `false` |

### 「帮助」「快捷键」「关于」分区

对话框给了 `help`、`shortcuts`、`about` 才有这三页，排在最后（900、910、920）。它们由只显示、不存值的条目组成：没有缺省值，编辑器不写设置，`resolveSettings` 里也不出现。

| 页 | 对话框的属性 | 内容 |
| --- | --- | --- |
| 帮助 | `help: { notes?, actions? }` | `notes` 是几段操作说明（各款的文案，按语言取好）；`actions` 是几颗钮 `{ command, label }`，如「开始引导」（`start-tour`）、「打开文档」（`help`），点了派发 `settings-command { command }`，由设计器跑这条命令（开始引导前先关上对话框）。两样都没有时没有这一页 |
| 快捷键 | `shortcuts: { groups }` | 一张快捷键表，从命令表生成，不手写：各款用 `shortcutSettingsSource(命令表, 上下文, { extensionCommands?, keys?, commonKeys? })` 现算。凡有快捷键的命令一行（名字取 `commandShortLabel`，第二快捷键写在同一行），designer-shell 内置的命令归「通用」，四款共有的编辑命令（`DESIGNER_EDIT_COMMANDS`）归「编辑」，扩展的归「扩展」，其余归「本设计器」；`keys` 是本设计器不是命令的按键，排在「本设计器」末尾。对话框给「通用」补上四款都有的按键（`DESIGNER_COMMON_KEYS`：方向键微移、Shift 加方向键大步微移、按住空格拖动画布、Alt+F10 聚焦选中工具条、Esc 取消），各款经 `commonKeys` 换掉这几行，见下文。键铺成 `<xh-kbd>`，按平台写 |
| 关于 | `about: { product, version, license?, rows? }` | 产品、版本、界面库（XiHan.UI，即 `DESIGNER_SHELL_VERSION`）的版本与许可证，后面接 `rows`：扩展的 `about` 字段（附加包的版本与授权）由各款接在这里。各款的版本号也从构建时注入的常量取（如流程的 `FLOW_VERSION`） |

各款与扩展的分区也能用这几种条目：

| `control.kind` | 形状 |
| --- | --- |
| `note` | `{ kind: "note", paragraphs }`：几段纯文本 |
| `action` | `{ kind: "action", command, text }`：一颗钮，点了派发 `settings-command`；宿主锁定这一条时不可用 |
| `info` | `{ kind: "info", rows }`：名字与值的几行 |
| `shortcutTable` | `{ kind: "shortcutTable", groups }`：几组 `{ label, rows }`，每行 `{ label, keys }` |

| 函数 | 说明 |
| --- | --- |
| `designerHelpSettings(t, help)`、`designerShortcutSettings(t, shortcuts)`、`designerAboutSettings(t, about)` | 三页的分区（`DESIGNER_HELP_SETTINGS`、`DESIGNER_SHORTCUT_SETTINGS`、`DESIGNER_ABOUT_SETTINGS`）；对话框自己生成 |
| `shortcutSettingsSource(commands, context, options?)` | 交给对话框 `shortcuts` 的快捷键表，规则如上 |
| `isDesignerDisplayControl(control)` | 这条条目只显示、不存值（`DESIGNER_DISPLAY_CONTROL_KINDS`） |

「通用」组末尾四款共有的那几行，各款可以换掉：在导出的 `DESIGNER_COMMON_KEYS` 基础上去掉本设计器没有的操作、改写说法不同的那一行，或另加几行，经 `shortcutSettingsSource` 的 `commonKeys` 交进去。

- 一行是 `{ id, keys, label? }`（`DesignerCommonKey`）：`id` 是内建的几种（`DesignerCommonKeyId`：`nudge`、`nudgeLarge`、`pan`、`selectionToolbar`、`cancel`）时可以不写 `label`，名字由对话框按语言取；写了 `label` 就用它，取各款自己的文案（按此刻的语言取好），外壳不写死。另加的行必须写 `label`，不写时类型报错，`shortcutSettingsSource` 也抛 `TypeError`。
- 不给 `commonKeys` 时照旧是 `DESIGNER_COMMON_KEYS`；给空数组就没有这几行。

```ts
import { DESIGNER_COMMON_KEYS, shortcutSettingsSource } from "@xihan-ui/designer-shell";

// 看板上没有按住空格拖动画布；Shift 加方向键是把卡片改大或改小一格
const commonKeys = DESIGNER_COMMON_KEYS
  .filter(key => key.id !== "pan")
  .map(key => (key.id === "nudgeLarge" ? { ...key, label: t.shortcutResize } : key));
settingsDialog.shortcuts = shortcutSettingsSource(commands, context, { commonKeys });
```

### 「布局」分区

对话框给了 `frame`（设计器的外框）且外框里有面板时，「基础」后面多一页「布局」：一张面板表，逐块面板一行，列出显示开关、位置（左栏、右栏、下栏、浮动）、上移下移与收成标题条，表下一颗「恢复默认布局」。它和面板头的「更多」菜单一样，是不靠拖动也能改布局的路。

- 表直接调外框的方法改布局（`setPanelVisible`、`movePanel`、`floatPanel`、`dockPanel`、`setPanelMinimized`、`resetLayout`），外框派发 `layout-change`，设计器照常把它写进设置；这一页自己不派发 `settings-change`。
- 三栏按布局里的先后排，画布浮动件排在最后、只有显示开关；不能挪的面板位置与上下移不可用，不能浮出的没有「浮动」，不能收起的收起开关不可用；浮着的面板不能上下移。从右往左写时左右两栏的叫法对调。
- 管控：`layout.panels`（或整个 `layout` 分区）`hidden` 时没有这一页，`locked` 时表只读、说明换成文案 `locked`；锁定一块面板（外框的 `layoutPolicy`）只锁那一行。

### 设置对话框

`<xh-designer-settings>` 里是 `<xh-dialog>`，左边竖排的分区页，右边按正文行宽逐条列出条目；分区页定高，换页时对话框不跳。宿主元素不占盒。

| 属性 | 说明 |
| --- | --- |
| `sections` | 各款与扩展的设置分区；没有可显示条目的分区不出现 |
| `general` | 「基础」分区的选项 `{ brands?, customBrand?, languages? }`；`false` 不要这一页。文案随对话框的语言 |
| `frame` | 设计器的外框（`DesignerSettingsFrame`，外框元素本身即可）；给了且有面板时有「布局」页 |
| `help` | 「帮助」页：几段操作说明与几颗跑命令的钮，见上文 |
| `shortcuts` | 「快捷键」页：`shortcutSettingsSource` 现算的快捷键表 |
| `about` | 「关于」页：产品、版本、许可证与扩展给的几行 |
| `toolbar` | 「工具栏」页：`{ defaults, commands }`（`toolbarSettingsSource` 现算）给了才有按钮表；不给只有显示方式与显示工具栏两条；`false` 不要这一页 |
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
| `settings-command` | `{ command }`：点了只显示条目里跑命令的钮（帮助页的开始引导、打开文档），由设计器跑这条命令 |

对话框打开时内容搬到浮层根：主题、主题色等视觉轴经视觉桥跟着设计器根走；标题、字段与对话框自己的文案照它们在设计器里的原位取配置，设计器外面包一层局部 `<xh-config>` 时用的是那一层的语言与文案。

### 落到设计器上

`createDesignerSettingsHost(options)` 返回 `{ load, save, apply, dispose }`：

| 选项 | 说明 |
| --- | --- |
| `root` | 设计器根：主题写成它的 `data-theme`，主题色写成它的 `data-brand`，只作用于设计器 |
| `brands` | 预设的主题色，与「基础」分区给的同一份；直接用 tokens 的 `BRAND_PRESETS`，色块取 `BRAND_PRESET_COLORS` |
| `registerBrand` | 注册自定义主题色，形状与 `@xihan-ui/tokens` 的 `registerBrand` 相同；不给时不是预设的颜色不生效 |
| `storageKey` | 设置存在根所在窗口 localStorage 的哪个键下；不给就不读写 |
| `onStorageError` | 读写失败（无痕窗口、配额满、内容不是对象）时回调 `{ operation, key, error }`，设置留在内存里。给了 `storageKey` 就必须给，否则抛 `TypeError` |

- `apply(settings)`：主题跟随页面时把根的 `data-theme` 还原成接手前的值，跟随系统时按 `prefers-color-scheme` 写、系统改了跟着改；主题色是预设就写它的 `value`，否则经 `registerBrand` 注册成这台设计器自己的品牌，换走时撤销。
- `data-brand` 要与 `data-theme` 在同一个元素上才换得动品牌：主题跟随页面又选了主题色时，根上照抄外层的 `data-theme`（外层没写就是亮色）。根上新写了主题时，语义令牌在这里重新声明，外层的 `data-contrast` 也一并照抄。外层这两个属性变了，根上跟着改。
- `save(settings, sections?)`：`sections` 里标了 `secret` 的文本条目不存。
- `load()`：没给存储键、没存过或读不出时是空对象。
- `dispose()`：撤掉跟随系统与外层的监听、注册的主题色，根上的 `data-theme`、`data-brand`、`data-contrast` 还原成接手前的样子。

## 导入字段

`<xh-designer-field-import>` 从一份 JSON 样例或一份 JSON Schema 导入字段树。里面是 `<xh-dialog>`：上面一排来源页签，下面是预览表，用户勾选、改显示名与类型后按「导入」。推断用 designer-kit 的 `@xihan-ui/designer-kit/field-inference`，全在本机做，不发请求。对话框不改设计器的字段，派发 `fields-import`，由设计器自己换上。宿主元素不占盒。

```ts
const dialog = document.createElement("xh-designer-field-import");
dialog.fields = designer.fields; // 现有字段：不为空时出「合并 / 替换」
dialog.contents = ["text", "image", "barcode", "qrcode"]; // 给了才有「内容」列
dialog.inference = { detectImages: true };
dialog.offerSample = true;
dialog.addEventListener("fields-import", (event) => {
  designer.fields = event.detail.fields;
  if (event.detail.sample !== undefined)
    designer.sampleData = event.detail.sample;
});
dialog.show();
```

| 属性 | 说明 |
| --- | --- |
| `sources` | 扩展登记的字段来源（designer-kit 的 `DesignerFieldSource`，见那一页的「字段来源」），按 `order` 排在内置两页之后；id 与内置页重名时抛 `TypeError` |
| `fields` | 现有字段：不为空时出「合并 / 替换」，合并时预先标出同名而种类不同的字段 |
| `contents` | 给了才有「内容」列，值字段的内容种类只能在这几种里选；不给时保留推断出的内容 |
| `inference` | 推断选项，交给 `inferDataFields`；JSON Schema 只用其中的 `rootName` 与 `maxDepth` |
| `offerSample` | 内容带样例时出「同时作为示例数据」，缺省勾上。attribute 是 `offer-sample` |
| `open` | 对话框打开。同名 attribute |
| `source` | 当前显示的页：`sample`、`json-schema`（`DESIGNER_FIELD_IMPORT_SOURCES`）或字段来源的 id；不写或找不到时显示第一页。同名 attribute |
| `translations` | 元素自己的文案，压在全局配置之上 |

| 方法 | 说明 |
| --- | --- |
| `show(source?)` | 打开对话框，给了页 id 就显示那一页 |

| 事件 | 说明 |
| --- | --- |
| `fields-import` | `{ fields, mode, source, sample?, annotations }`：用户按了「导入」，对话框随即关上。`fields` 已按勾选、显示名、类型、内容与合并 / 替换算好；`mode` 在现有字段为空时恒为 `replace`；`sample` 只在内容带样例、又勾了「同时作为示例数据」时有；`annotations` 是推断出的注解（说明、必填、候选值等），键是 `formatJsonPath(字段路径)` |
| `open-change` | `{ open }`：按 Esc、点遮罩、关闭钮、取消或导入时对话框关上，元素已经换成这个状态 |

- 内置两页各有一个多行输入框，下面是读文件的投放区：把 `.json` 文件拖进来或点它选一个，文件在本机读进输入框。输入一变就解析；解析失败时写出第几行第几列与原因（core/json 的 `parseJsonText`），预览表收起，导入钮不可用。
- 字段来源页切到时才建，切走或对话框关上时中止并销毁，它交来的内容一并清掉；`fail(message)` 给的话写在页下。
- 预览表一个字段一行，下级按层级缩进：勾选框、字段名、显示名输入框、类型下拉（值字段才有，对象与列表写种类）、内容下拉。去掉一行就连同它的下级一起不导入，下级的控件不可用。内容换了时，路径没变的行保留用户改过的显示名、类型与内容。表下列出推断说明（如「列表里是单个值，导入为没有子字段的列表」）与合并时种类不同的字段。
- 每次打开都从空白开始。
- 文案键 `xh-designer-field-import`，英文表 `DESIGNER_FIELD_IMPORT_EN_US`；推断说明按 designer-kit 的说明码各一条。

内置命令 `import-fields` 打开它，见下文「命令」的 `designerShellCommands`。

## JSON 编辑

`<xh-designer-json-editor>` 编辑整份模板的 JSON。里面是 `<xh-dialog>`：一个等宽字体、不折行的多行编辑框，下面是解析失败的说明与问题列表（`<xh-designer-issues>`），底边是格式化、复制、取消与应用。对话框不改设计器的文档，派发 `json-apply`，由设计器自己换上；四款把它作为一步进撤销栈，说明写「编辑 JSON」。宿主元素不占盒。

```ts
const editor = document.createElement("xh-designer-json-editor");
editor.value = designer.schema; // 每次打开都从它写起，缩进两格
editor.validate = value => issuesOf(migrate(value)).map(issue => ({ issue, message: t(issue) }));
editor.readonly = designer.readonly;
editor.addEventListener("json-apply", event => designer.replaceDocument(event.detail.value));
editor.show();
```

| 属性 | 说明 |
| --- | --- |
| `value` | 打开时编辑框里的 JSON（设计器此刻的整份文档）；只走 property |
| `validate` | `(value) => DesignerIssueItem[]`：各款先走读入迁移、再走 core 的校验，与粘贴整份模板同一套，换好文字交回来。不给时只查能不能解析 |
| `readonly` | 只读：能看、能格式化、能复制，不能改，也没有「应用」。同名 attribute |
| `open` | 对话框打开。同名 attribute |
| `translations` | 元素自己的文案，压在全局配置之上 |

| 方法 | 说明 |
| --- | --- |
| `show()` | 打开对话框 |

| 事件 | 说明 |
| --- | --- |
| `json-apply` | `{ value }`：用户按了「应用」，对话框随即关上。只有文字解析得了、没有错误级问题、又与打开时的值不同时「应用」才可用 |
| `open-change` | `{ open }`：按 Esc、点遮罩、关闭钮、取消或应用时对话框关上，元素已经换成这个状态 |

- 文字一变就重新解析（core/json 的 `parseJsonText`）并交给 `validate`。解析失败时编辑框标成 invalid，写出第几行第几列与原因，后面一颗「转到出错处」把光标放过去。
- 点问题列表的一条，光标选中那个路径在文字里的值（core/json 的 `locateJsonPath`，见下），编辑框滚到那一行；路径在文字里没有时退到最近的上级。整块的对象或数组只选它起头的那一行。
- 打开时落焦在编辑框，光标在开头、滚到顶，不全选。
- 复制把编辑框里的文字写进剪贴板（core/clipboard 的 `writeToClipboard`，要安全上下文），钮旁写一句「已复制」或「复制失败」，再改文字时清掉。
- 每次打开都从 `value` 重新写起，没应用的改动丢掉。
- 文案键 `xh-designer-json-editor`，英文表 `DESIGNER_JSON_EDITOR_EN_US`。

`locateJsonPath(text, path)`（`@xihan-ui/core/json`）在 JSON 文本里找路径指向的值，返回 `{ start, end, line, column }`：值在文本里的起止下标与起点的行列（从 1 数起，换行的算法同 `parseJsonText`）。路径写法同 `getJsonAt`，空路径指整个值；文本不是合法 JSON 或路径走不通时为 `undefined`；对象里键重复时取最后一个，与 `JSON.parse` 一致。

内置命令 `edit-json` 打开它，见下文「命令」的 `designerShellCommands`。

## 新手引导

`<xh-designer-tour>` 是设计器的新手引导：库内 `<xh-tour>` 包一层，designer-shell 的通用步骤加上各款与扩展的步骤，按 `order` 排，一步步高亮外框里的面板、区或工具栏上的命令。放在设计器元素里、外框旁边，和设置对话框一样；宿主元素不占盒。

```ts
import { collectTourSteps, resolveTourSteps, tourDoneOf } from "@xihan-ui/designer-shell";

const steps = collectTourSteps([productExtension, ...extensions]); // id 重名时抛 DesignerExtensionError
const tour = document.createElement("xh-designer-tour");
tour.frame = frame;
tour.steps = resolveTourSteps(steps, context); // 每轮按上下文取文字、过一遍 when
designerRoot.append(tour);
tour.addEventListener("tour-end", () => writeSetting("help.tourDone", true));
if (autoTour && !tourDoneOf(settings))
  tour.start(); // 第一次连上文档、画布铺好之后
```

### 步骤

| 字段 | 说明 |
| --- | --- |
| `id` | 全局唯一：designer-shell 的写 `shell.<名>`，各款写 `<产品>.<名>`，扩展写扩展 id 加点 |
| `target` | 要高亮的目标，不给就不锚定、浮层居中：`{ panel, part? }` 面板卡片（给了 `part` 就是面板里 `data-part` 为它的节点）；`{ command }` 工具栏上这条命令的按钮，收在「更多」里时是「更多」钮；`{ region }` 外框的区（`toolbar`、`canvas`、`status`、`header`）；`{ selector }` 设计器里的任意节点 |
| `title`、`description` | 标题与说明，可以是按上下文现算的函数 |
| `placement` | 浮层相对目标的首选位置，缺省 `bottom` |
| `order` | 排序：designer-shell 的通用步骤 0–90，各款 100 起，扩展 200 起；同值按登记顺序 |
| `when` | 返回 `false` 时跳过，如只读模式下的编辑步骤 |

通用步骤：`shell.welcome`（居中，0）、`shell.toolbar`（工具栏区，10）、`shell.palette`（物料面板，20）、`shell.canvas`（画布区，30）、`shell.properties`（属性面板，40）、`shell.issues`（问题面板，50）、`shell.status`（状态栏，60）、`shell.settings`（工具栏上的设置命令，90），文案在 `xh-designer-tour` 那一桶。目标面板隐藏、区不在外框里或没有内容、命令没有按钮的那一步跳过，所以没有物料面板的报表自然少一步，各款补自己的步骤即可。

| 函数 | 说明 |
| --- | --- |
| `resolveTourSteps(steps, context)` | 按上下文取好文字、过一遍 `when`，得到交给零件的 `DesignerTourStepView[]`；顺序不变 |
| `collectTourSteps(sources)` | 合起各来源（`{ id, tourSteps? }`，扩展的 `tourSteps` 字段就是这个形状）的步骤，保持登记顺序。id 重名或用了留给 designer-shell 的 `shell.` 前缀时抛 `DesignerExtensionError`，名字空间 `tour-step` |
| `tourDoneOf(settings)` | 设置里 `help.tourDone`（`DESIGNER_TOUR_DONE_KEY`）为 `true`：引导已经完成或跳过过，不再自动开始。这个键不对应设置对话框里的条目 |

### 零件 `<xh-designer-tour>`

| 属性 | 说明 |
| --- | --- |
| `frame` | 设计器的外框：解析目标、判断面板显隐，进入一步前经 `revealPanel` 把面板亮出来（展开分隔条上收起的栏、标题条，窄屏时开抽屉） |
| `steps` | 各款与扩展的步骤（`resolveTourSteps` 取好的） |
| `builtin` | 带上通用步骤，缺省 `true`；同名 attribute 写 `"false"` 不带 |
| `translations` | 元素自己的文案，压在全局配置之上 |

| 方法与只读属性 | 说明 |
| --- | --- |
| `start()` | 从第一步开始；没有能走的步骤时返回 `false` |
| `stop()` | 收起引导 |
| `plannedSteps()` | 此刻会走的各步：排好序、去掉了走不了的 |
| `running` | 引导此刻开着 |

| 事件 | 说明 |
| --- | --- |
| `tour-end` | `{ reason, step }`：引导收起了。`reason` 是 `complete`（走完）、`skip`（跳过或 Esc）或 `close`（关闭钮或 `stop()`）；`step` 是收起时那一步的 id。各款收到后把 `help.tourDone` 写成 `true` |

- 浮层里依次是标题、说明、「第几步，共几步」、一步一个的圆点，底部一行跳过、上一步与下一步（最后一步写「完成」），右上角关闭钮；键盘与读屏照 `<xh-tour>`。
- 宿主不要自动开始时设计器给 `autoTour = false`；内置命令 `start-tour`（`designerShellCommands` 的 `startTour` 选项）与帮助页里的「开始引导」随时重新开始。

## 扩展的面板与命令

设计器扩展的骨架、合并查重与装卸在 `@xihan-ui/designer-kit`（见那一页的「设计器扩展」）。这里放跟界面有关的几样：面板登记到外框的区，命令铺成工具栏按钮与右键菜单条目，粘贴与拖放的数据列成导入来源，设置分区放进设置对话框，物料来源接进物料面板。

### 面板

```ts
import { createPanelHost } from "@xihan-ui/designer-shell";

// 内置区缺省为 DESIGNER_FRAME_REGIONS，产品有自己的就传 regions；给了 commands，面板头的命令按它铺
const panels = createPanelHost(frame, { regions, commands: () => commandTable, actionsLabel: (context, title) => title });
panels.assign(host.list, context); // 每次 extensions 变化后调用
panels.update(context); // 设计器状态变化后刷新
panels.dispose();
```

- 扩展的 `panels` 是 `{ region, create(context) => { element, update?, destroy? }, headerCommands? }`：`region` 是外框的命名区，也就是面板的登记（名字、缺省停的栏、标题、图标、能不能挪与浮出等，见「外框」），追加在内置区之后，同一栏按扩展顺序上下排；`element` 以 `slot` 交给外框，放进那个区。
- 区名与内置区或别的扩展重名时 `assign` 抛 `DesignerExtensionError`（名字空间 `panel`），什么都不变。
- 按面板对象的引用比对：留下来的不重建，去掉的调 `destroy` 后撤掉。
- `headerCommands` 是面板头操作区里的命令 id（或按上下文现算的函数）：面板宿主按选项 `commands` 给的命令表铺成一小条只显示图标的工具栏，放进 `slot="<区名>-actions"`，每次 `update` 刷新，命令表里没有的 id 跳过；一条命令都没有时整条藏起，里面不放 `<xh-toolbar>`，有了命令再放回。内置面板（物料、属性、问题这类不是扩展登记的面板）用 `createPanelActions(document, 面板 id)` 建同样的一条，返回 `{ element, update(ids, commands, context, label) }`，由各款放进外框。
- 扩展登记的面板与内置面板一样进布局：能换栏、浮出、收起、隐藏，记在 `layout` 里。宿主写在 HTML 里的内容照样用 `slot="<区名>"` 交给外框，不必经扩展。

### 命令

工具栏与右键菜单的排列用 `commandLayout`：位置 → 若干组命令 id，内置命令与扩展命令混排。

```ts
import { arrangeCommands, createCommandToolbar, renderCommandMenu, runCommand } from "@xihan-ui/designer-shell";

const commands = extensionCommands(host.list); // designer-kit，内置在前
const toolbar = createCommandToolbar(document, { display: "icon" }); // 显示方式缺省 icon，快捷键的平台缺省当场测
toolbar.update(arrangeCommands("toolbar", commands, BUILTIN_TOOLBAR, designer.commandLayout), commands, context, t.toolbar);

renderCommandMenu(menuContent, arrangeCommands("menu:node", commands, BUILTIN_NODE_MENU, designer.commandLayout), commands, context, { platform });
menu.addEventListener("select", event => runCommand(commands, event.detail.value, context));
```

| 函数 | 说明 |
| --- | --- |
| `arrangeCommands(placement, commands, defaults, layout?)` | 排出某个位置的分组（工具栏、顶栏、`menu:<主体>` 的右键菜单、`selection:<主体>` 的选中工具条都用它）：`layout` 写了这个位置就只用它；否则用 `defaults`（各款内置的缺省排列），再把 `placement` 含这个位置、又不在缺省排列里的命令按登记顺序追加成一组。排列里写了没登记的命令 id 时抛 `TypeError` |
| `createCommandToolbar(document, { display?, orientation?, platform? })` | 一条 `<xh-toolbar>`，外面包一个委托模式的 `<xh-tooltip>`（`element` 是这层外壳，布局上不占盒子；`toolbar` 是里面那条工具栏）。`update(groups, commands, context, label)` 分组变了才重铺按钮，文字、图标、`aria-label`、`aria-keyshortcuts`（快捷键按 `platform` 写成规范写法，如 `Control+Shift+Z`；命令有第二快捷键时依次接在后面，提示只显示第一条）、可用、`aria-pressed`（开关式命令）与 `data-tone`（命令的语气）每次刷新；点击按钮执行命令，放不下的收进行尾的「更多」菜单，图标与语气随按钮带进菜单项。`display` 是 `icon`（缺省）、`text`、`both` 或 `stacked`，没有图标的命令在 `icon` 档照样显示文字，写的是短文字（`shortLabel`，没给就是 `label`），名字仍是全名；`stacked` 是图标在上、短文字（`shortLabel`）在下、钮高随内容，给顶栏的插入快捷钮用，名字仍是全名，每个按钮都给提示；`setDisplay(display)` 换显示方式不重铺按钮，「更多」里的条目按新的宽度重新收放。悬停或键盘聚焦到按钮时提示显示命令的文字与快捷键；文字看得见时只给带快捷键的按钮提示。`orientation` 缺省 `horizontal`；`vertical` 时按钮上下排，提示、弹层与菜单在按钮的行首一侧弹出（从左往右写时在左边），放不下的按高度收进「更多」。弹层命令与菜单命令见下文 |
| `renderCommandMenu(content, groups, commands, context, { platform? })` | 把分组铺成 `<xh-context-menu>` content 里的条目，组间一条分隔线；不可用的写 `aria-disabled`，命令的语气写 `data-tone`，带图标的在文字前铺 `item-icon`，带快捷键的在行尾写提示（只写主快捷键）并写进 `aria-keyshortcuts`（第二快捷键接在后面）。没有 `run` 的弹层命令与菜单命令只能放在工具栏上，排进右键菜单时抛 `TypeError` |
| `runCommand(commands, id, context)` | 命令存在、有 `run` 且此刻可用才执行，返回是否执行了 |
| `commandLabel(command, context)` / `commandShortLabel(command, context)` / `commandEnabled(command, context)` | 命令的文字；短文字（没给 `shortLabel` 时同 `label`；短文字要出现在 `label` 里，开发期工具栏发现不在时报一条 `core.warn` 告警，一条命令只报一次）；此刻能否执行 |
| `designerHistoryCommands({ history, disabled?, translations, historyTranslations, confirm, announce?, icons? })` | 撤销、重做与清空历史，四款共用：`history` 返回设计器的历史栈（designer-kit 的 `History` 直接合用），返回 `undefined`、在事务中（如拖动）或 `disabled` 返回 true 时三条都不可用。`undo`（Mod+Z）与 `redo`（Mod+Shift+Z，另认 Ctrl+Y）缺省放在工具栏上，全名带上下一步的说明，如「撤销：添加卡片」，按钮上看得见的短文字仍是「撤销」；`clear-history` 是危险语气，不上工具栏，由历史面板或 `commandLayout` 放置，没有步骤时不可用，执行时先经 `confirm(context, { title, content, okText, tone })` 弹确认框（交给各款的 `DialogService.confirm`），确定后才清空。三条做完都经 `announce(context, message)` 礼貌级地读一句。文案取 `translations`（`xh-designer-commands` 那一桶的 `undo`、`redo`、`undoWith`、`redoWith`、`clearHistory`）与 `historyTranslations`（`xh-designer-history` 那一桶）。id 与各款原有的 `undo`、`redo` 相同，替换后宿主的 `commandLayout` 不用动 |
| `designerShellCommands({ translations, frame?, openSettings?, helpUrl?, openFieldImport?, fieldImportDisabled?, openJsonEditor?, startTour?, icons? })` | designer-shell 内置的命令。给了 `frame`（返回设计器的外框）有四条：`panels` 点开一张菜单，逐块面板一项（外框的 `panelEntries()`，勾选的显示，锁定的不可点，选中经 `togglePanel` 开关），分隔线后列出另外三条；`panels-toggle-all`（显示或隐藏所有面板，`Mod+\`）、`panels-restore`（还原面板显隐，`Mod+Shift+\`）与 `layout-reset`（恢复默认布局）只在菜单与快捷键上，全部面板都锁定时不可用。给了 `openSettings` 有 `settings`（打开设置对话框），给了 `helpUrl` 有 `help`（在新窗口打开各款文档站的帮助页，返回 `undefined` 时不可用），给了 `openFieldImport` 有 `import-fields`（打开导入字段对话框，`fieldImportDisabled` 返回 true 时不可用），给了 `openJsonEditor` 有 `edit-json`（打开 JSON 编辑框，`Mod+Shift+J`；只读时也能打开，编辑框里只能看与复制），给了 `startTour` 有 `start-tour`（开始新手引导）；`import-fields`、`edit-json`、`start-tour` 不排位置，各款放进面板头、菜单或帮助页。文案取 `xh-designer-commands` 那一桶，图标由各款从 `@xihan-ui/icons` 传入，`panels`、`settings`、`help` 缺省放在工具栏上。各款把它们并进自己的内置扩展，排在工具栏末组；宿主不要哪一条，用 `commandLayout` 排掉 |
| `designerPanelCommands({ panels, frame })` | 每块面板一条开关命令 `panel:<面板 id>`（`designerPanelCommandId(id)`）：文字取面板标题，`checked` 是它此刻看得见，执行即 `togglePanel`；不上工具栏、不带快捷键，给 `commandLayout`、引导与扩展用。外框里没有这块面板或宿主锁定了它时不可用。`panels` 列设计器登记的面板与画布浮动件，含扩展登记的 |

两个铺法用到的 `<xh-toolbar>`、`<xh-context-menu>`、`<xh-tooltip>`、`<xh-icon>`，以及弹层命令与菜单命令用到的 `<xh-popover>`、`<xh-menu>` 按需注册。快捷键的命中用 designer-kit 的 `commandForShortcut`。

命令工具栏上的弹层命令与菜单命令（命令的 `panel` 与 `menu`，见 designer-kit 那一页的「弹层命令与菜单命令」）：

- 点按钮打开锚在它上面的 `<xh-popover>` 或 `<xh-menu>`（用两个组件的 `anchor`），再点一下收起，点别的弹层或菜单命令是换过去。弹层的 content 与菜单都以命令文字命名；弹层里放 `panel` 建出的元素，开着时每次 `update` 调它的 `update`，收起后调 `destroy`；菜单每次 `update` 按上下文重算条目与勾选。
- 按钮收在「更多」里时，从「更多」菜单里点它，打开的是同一块面板或同一张菜单，锚在「更多」钮上。开着的时候工具栏变窄把它收进「更多」、或变宽又放回来，弹层与菜单跟着换锚点，不关掉。
- 锚点按钮上的 `aria-haspopup`、`aria-expanded`、`aria-controls` 由弹层与菜单在展开期间写上，收起后还原；Escape 或点在外面收起时焦点回到锚点。
- 重铺按钮（分组变了）、命令不在了或此刻不可用时，开着的弹层与菜单关掉。
- 菜单里点了复选条目、菜单仍开着时，按点过之后的上下文重算条目与勾选，不必等设计器下一次 `update`。
- `open(id)` 打开一条弹层命令或菜单命令，给快捷键用：命令的 `run` 里调它；不是这两类命令、不在工具栏上或此刻不可用时返回 `false`。`close()` 关掉开着的那一个，`opened()` 是开着的命令 id。

四款都有的通用命令，文案收在 designer-shell 语言包的 `xh-designer-commands` 一桶里：撤销、重做（以及带上下一步说明的 `undoWith`、`redoWith`）、清空历史、剪切、复制、粘贴、创建副本、删除、全选，六种对齐、两种分布、四种层级，放大、缩小、适合窗口、实际大小，设计与预览，内置命令的面板、设置、帮助、导入字段、编辑 JSON 与开始引导，以及命令工具栏的名字 `toolbar`。各款引用这一桶，不再各写一份；产品专属的命令仍写在各款自己的语言包里。

```ts
import { DESIGNER_COMMANDS_EN_US, DESIGNER_HISTORY_EN_US } from "@xihan-ui/designer-shell";
import { XhConfigController } from "@xihan-ui/web-components/authoring";

const config = new XhConfigController(designer);
const t = config.translations("xh-designer-commands", DESIGNER_COMMANDS_EN_US); // t.undo、t.alignCenter……
const history = config.translations("xh-designer-history", DESIGNER_HISTORY_EN_US); // 给 designerHistoryCommands 的 historyTranslations
```

### 设置分区

扩展的 `settings` 是若干设置分区，形状见上文「设置」。用 `collectSettingsSections` 把各款自己的分区与扩展的合起来交给设置对话框；分区 id 与内建的 `general`、`layout`、`toolbar` 或别的扩展重名时抛 `DesignerExtensionError`（名字空间 `settings-section`）。

### 引导步骤

扩展的 `tourSteps` 是若干引导步骤，形状见上文「新手引导」，`order` 从 200 起，排在各款的步骤之后。用 `collectTourSteps` 把各款自己的步骤与扩展的合起来，按上下文用 `resolveTourSteps` 取好交给 `<xh-designer-tour>`；步骤 id 重名或用了 `shell.` 前缀时抛 `DesignerExtensionError`（名字空间 `tour-step`）。

### 关于

扩展的 `about` 是「关于」页里的几行 `{ label, value }`，如附加包的版本与授权；各款把它们接在自己那几行后面，交给设置对话框的 `about.rows`。

### 物料来源

扩展的 `paletteSources` 往物料面板里加几组，排在各款内置分组之后，如专业版的「我的物料」、行业模板。开源版不登记，就没有这几组。

```ts
import { collectPaletteSources, resolvePaletteSources } from "@xihan-ui/designer-shell";

const sources = collectPaletteSources([builtinExtension, ...extensions]); // id 重名时抛 DesignerExtensionError
const view = resolvePaletteSources(BUILTIN_GROUPS, sources, context); // 每轮刷新现取
palette.groups = view.groups;
palette.addEventListener("item-activate", (event) => {
  if (!view.insert(event.detail.id, context))
    insertKind(event.detail.payload); // 内置的物料照旧
});
// 画布放下时一样先问来源：view.insert(payload.id, context, 落点)
```

| 字段 | 说明 |
| --- | --- |
| `id` | 全局唯一，写法同命令 id；名字空间 `palette-source` |
| `order` | 先后：各款内置的分组在前，来源按它排在后面，不写按 100；同值按登记顺序 |
| `groups(context)` | 这一来源此刻的分组，形状同物料面板的 `groups`；组 id 与条目 id（含下级）在整个物料面板里唯一 |
| `insert(item, context, at?)` | 这一来源的条目被激活或拖到画布上放下：`at` 是放下处，激活时没有。插入怎么做由来源自己定，通常调设计器的 `paste(clip, { at })` |

| 函数 | 说明 |
| --- | --- |
| `collectPaletteSources(sources)` | 合起各来源（`{ id, paletteSources? }`，扩展本身就是这个形状）的物料来源，按 `order` 排；id 重名时抛 `DesignerExtensionError`，名字空间 `palette-source` |
| `resolvePaletteSources(builtin, sources, context)` | 返回 `{ groups, insert(itemId, context, at?) }`：`groups` 是内置分组在前、各来源按上下文现取的接在后面；`insert` 在条目（含下级）属于某个来源时交给它的 `insert` 并返回 `true`，内置条目返回 `false`。组 id 或条目 id 重名时抛 `TypeError` |

落点 `at` 的形状由各款定（流程是画布坐标，打印还带页与带区），在扩展类型上写：`DesignerShellExtension<Ctx, Editor, Doc, RuleCtx, At>` 的最后一个类型参数。

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
