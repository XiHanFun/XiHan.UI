来源：https://ui.docs.xihanfun.com/components/menu

# Menu 菜单

从触发器打开一组操作命令。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menu" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menu.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menu" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menu" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menu.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从按钮打开一组操作

```vue
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "new", label: "新建文件" },
  { value: "open", label: "打开文件" },
  { value: "save", label: "保存" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger>
      <XhButton variant="subtle">
        操作
        <XhIcon :icon="ChevronDownIcon" />
      </XhButton>
    </template>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button
    data-xh-part="trigger"
    style="display: inline-flex; align-items: center; gap: 6px; block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer"
  >
    操作
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="new">新建文件</div>
      <div data-xh-part="item" value="open">打开文件</div>
      <div data-xh-part="item" value="save">保存</div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">移到回收站</div>
    </div>
  </div>
</xh-menu>
```

## 组件结构

加粗的是必需部件。

`data-scope="menu"`：**`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `item-shortcut` · `item-suffix` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 图标与快捷键

为常用命令补充识别信息

```vue
<script setup lang="ts">
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import {
  XhButton,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuItemIndicator,
  XhMenuItemShortcut,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger as-child>
      <XhButton variant="subtle">编辑</XhButton>
    </XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">
          <XhMenuItemIndicator><XhIcon :icon="CopyIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>复制</XhMenuItemText>
          <XhMenuItemShortcut>⌘ C</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuItem value="rename">
          <XhMenuItemIndicator><XhIcon :icon="PencilIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>重命名</XhMenuItemText>
          <XhMenuItemShortcut>F2</XhMenuItemShortcut>
        </XhMenuItem>
        <XhMenuSeparator />
        <XhMenuItem value="delete">
          <XhMenuItemIndicator><XhIcon :icon="TrashIcon" size="sm" /></XhMenuItemIndicator>
          <XhMenuItemText>移到回收站</XhMenuItemText>
          <XhMenuItemShortcut>⌫</XhMenuItemShortcut>
        </XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">编辑</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="copy">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></span>
        <span data-xh-part="item-text">复制</span>
        <span data-xh-part="item-shortcut">⌘ C</span>
      </div>
      <div data-xh-part="item" value="rename">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg></span>
        <span data-xh-part="item-text">重命名</span>
        <span data-xh-part="item-shortcut">F2</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg></span>
        <span data-xh-part="item-text">移到回收站</span>
        <span data-xh-part="item-shortcut">⌫</span>
      </div>
    </div>
  </div>
</xh-menu>
```

### 分组

使用标题与分隔线组织命令

```vue
<script setup lang="ts">
import { XhButton, XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "compact", label: "紧凑", group: "density", groupLabel: "行高" },
  { value: "comfortable", label: "宽松", group: "density" },
  { value: "sidebar", label: "侧栏", group: "panels", groupLabel: "面板", separatorBefore: true },
  { value: "inspector", label: "属性面板", group: "panels" },
];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">视图</XhButton></template>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">视图</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="group" value="density">
        <span data-xh-part="group-label">行高</span>
        <div data-xh-part="item" value="compact"><span data-xh-part="item-text">紧凑</span></div>
        <div data-xh-part="item" value="comfortable"><span data-xh-part="item-text">宽松</span></div>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="group" value="panels">
        <span data-xh-part="group-label">面板</span>
        <div data-xh-part="item" value="sidebar"><span data-xh-part="item-text">侧栏</span></div>
        <div data-xh-part="item" value="inspector"><span data-xh-part="item-text">属性面板</span></div>
      </div>
    </div>
  </div>
</xh-menu>
```

### 子菜单

将相关操作收进下一层

```vue
<script setup lang="ts">
import {
  XhButton,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenuRoot>
    <XhMenuTrigger as-child><XhButton variant="subtle">文件操作</XhButton></XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="open">打开</XhMenuItem>
        <XhMenuItem value="rename">重命名</XhMenuItem>
        <XhMenuSeparator />
        <XhMenuSub value="share">
          <XhMenuSubTrigger>发送到</XhMenuSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="email">邮件</XhMenuItem>
              <XhMenuItem value="message">消息</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuSub>
        <XhMenuSeparator />
        <XhMenuItem value="delete">移到回收站</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">文件操作</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="open">打开</div>
      <div data-xh-part="item" value="rename">重命名</div>
      <div data-xh-part="separator"></div>
      <xh-menu submenu open-on-hover placement="right-start" style="display: contents">
        <div data-xh-part="trigger" value="share">发送到</div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="email">邮件</div>
            <div data-xh-part="item" value="message">消息</div>
          </div>
        </div>
      </xh-menu>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">移到回收站</div>
    </div>
  </div>
</xh-menu>
```

### 破坏性命令

用语气把删除一类命令与其余区分开

```vue
<script setup lang="ts">
import type { MenuNode, MenuNodeMeta } from "@xihan-ui/headless";
import { CopyIcon, PencilIcon, TrashIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const actions: MenuNode[] = [
  { value: "copy", label: "复制", shortcut: "⌘ C" },
  { value: "rename", label: "重命名", shortcut: "F2" },
  { value: "delete", label: "移到回收站", tone: "danger", shortcut: "⌫", separatorBefore: true },
];

const icons = { copy: CopyIcon, rename: PencilIcon, delete: TrashIcon };
const iconOf = (node: MenuNodeMeta) => icons[node.value as keyof typeof icons];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">文件</XhButton></template>
    <template #item-prefix="node">
      <XhIcon :icon="iconOf(node)" size="sm" />
    </template>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">文件</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="copy">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></span>
        <span data-xh-part="item-text">复制</span>
        <span data-xh-part="item-shortcut">⌘ C</span>
      </div>
      <div data-xh-part="item" value="rename">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg></span>
        <span data-xh-part="item-text">重命名</span>
        <span data-xh-part="item-shortcut">F2</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete" data-tone="danger">
        <span data-xh-part="item-indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></svg></span>
        <span data-xh-part="item-text">移到回收站</span>
        <span data-xh-part="item-shortcut">⌫</span>
      </div>
    </div>
  </div>
</xh-menu>
```

### 说明与快捷键

只交数据，副文本与按键提示自动落位

```vue
<script setup lang="ts">
import type { MenuNode } from "@xihan-ui/headless";
import { XhButton, XhMenuRoot } from "@xihan-ui/vue";

const actions: MenuNode[] = [
  { value: "duplicate", label: "创建副本", description: "保留当前版本，另存一份", shortcut: "⌘ D" },
  { value: "export", label: "导出", description: "生成 PDF 或 PNG", shortcut: "⌘ E" },
  { value: "archive", label: "归档", description: "移出列表，随时可以恢复", shortcut: "⌘ ⇧ A", separatorBefore: true },
];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger><XhButton variant="subtle">更多</XhButton></template>
  </XhMenuRoot>
</template>
```

```html
<xh-menu>
  <button data-xh-part="trigger" style="block-size: var(--xh-control-h-md); padding-inline: var(--xh-control-px-md); border: 0; border-radius: var(--xh-shape-pill); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; cursor: pointer">更多</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="duplicate">
        <span data-xh-part="item-text">创建副本</span>
        <span data-xh-part="item-description">保留当前版本，另存一份</span>
        <span data-xh-part="item-shortcut">⌘ D</span>
      </div>
      <div data-xh-part="item" value="export">
        <span data-xh-part="item-text">导出</span>
        <span data-xh-part="item-description">生成 PDF 或 PNG</span>
        <span data-xh-part="item-shortcut">⌘ E</span>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="archive">
        <span data-xh-part="item-text">归档</span>
        <span data-xh-part="item-description">移出列表，随时可以恢复</span>
        <span data-xh-part="item-shortcut">⌘ ⇧ A</span>
      </div>
    </div>
  </div>
</xh-menu>
```

## 设计指引

### 何时使用

- 收纳次要操作、账户命令或多级命令。

### 何时不用

- 选择并保留一个值时使用[选择器](./select)。
- 一两个主要操作直接使用[按钮](./button)。
- 站点主导航使用[导航菜单](./navigation-menu)。

### 特性

- `collection` 可直接生成条目、分组、标记位、说明、快捷键提示和分隔线。
- 条目可逐条声明语气，删除一类命令自带该族字色与高亮底。
- 快捷键提示贴行尾，与说明同档同色；它是纯装饰，读屏从命令文字取意。
- 支持方向键、首字符检索、禁用条目和多级子菜单。
- 子菜单使用安全三角避免指针斜向移动时误关闭。
- 条目可组合图标、文字、说明和快捷键提示。
- 行首与行尾两格各有逐条钩子，只想加个图标不必把整条重搭；`item` 插槽仍是整条的接管口。
- 选中命令后发出根级 `select` 并关闭菜单链。

### 组合

- 触发器通常使用中性按钮，避免与页面主操作争夺层级。

### 最佳实践

- 破坏性命令放在末尾、与普通命令分隔，并同时给出 `danger` 语气和图标。
- 条目使用简短的动宾短语。
- 仅为已注册的快捷键显示提示。

### 反模式

- 不要用命令菜单代替持久选择控件。
- 不要在菜单中放置长段说明或复杂表单。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menu>` |
| Vue 组件 | `XhMenuArrow` `XhMenuContent` `XhMenuGroup` `XhMenuGroupLabel` `XhMenuItem` `XhMenuItemDescription` `XhMenuItemIndicator` `XhMenuItemShortcut` `XhMenuItemSuffix` `XhMenuItemText` `XhMenuPositioner` `XhMenuRoot` `XhMenuSeparator` `XhMenuSub` `XhMenuSubTrigger` `XhMenuTrigger` |
| 组合式函数 | `useMenu` |
| 状态机 | `menuMachine` |
| 皮肤 | `@xihan-ui/styles/menu.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenuNode[]` |  | 条目数据，显示文本、禁用、逐条语气与分组的事实源。提供后条目部件只需声明 value。 未提供时回到这些事实都写在条目部件上的方式（语气写成条目的 `data-tone`）。 |
| `open` | `boolean` |  | 展开态，提供即受控；受控下内部不自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `tone` | `Tone` |  | 整张菜单的语气：brand / neutral / success / warning / danger / info。 只为浮层与作者放进来的内容备好该族颜色，不下发给条目——条目保持中性档， 逐条的语气写在 collection 的 `tone` 上（见 MenuNode）。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目高度、内边距与字号档位。 |
| `typeahead` | `boolean` |  | 首字符连打检索，默认开启。 |
| `disabled` | `boolean` |  | 整张菜单禁用：触发器不再展开，条目全部为 aria-disabled。 |
| `translations` | `Partial<MenuTranslations>` |  |  |
| `submenu` | `boolean` |  | 本菜单是另一张菜单的子菜单：触发器渲染为父菜单的条目形态 （经 getSubmenuTriggerProps），默认落位改为侧向，悬停触发默认开启。 |
| `openOnHover` | `boolean` |  | 悬停触发：进入触发器延时展开、经安全三角离开才收起。子菜单默认开启，普通菜单默认关闭。 |
| `hoverOpenDelay` | `number` |  | 悬停到展开的延时（ms），默认 100。 |
| `hoverCloseDelay` | `number` |  | 离开到收起的延时（ms），也是安全三角中的停滞上限，默认 300。 |
| `onOpenChange` | `(details: MenuOpenChangeDetails) => void` |  | open 变化回调。 |
| `onSelect` | `(details: MenuSelectDetails) => void` |  | 条目被选中；菜单随之关闭。 |

### MenuNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` |  | 展示文本；默认回退为 value。 |
| `disabled` | `boolean` |  | 条目禁用：方向键跳过它，但它仍可聚焦、仍是导航起点。 |
| `tone` | `Tone` |  | 该条命令自身动作的性质：删除写 danger、停用写 warning。不写即与其余条目同档。 只换字色与悬停 / 按下的面，不改字重与缩进，也不表达选中或校验；禁用压过它。 红字不是唯一通道，破坏性命令仍要配图标。整张菜单的 tone 不下发给条目。 |
| `indicator` | `string` |  | 标记位文字（勾选符号等装饰）；未提供时本条不铺 item-indicator。 |
| `description` | `string` |  | 副文本，写入 item-description 部件；未提供时本条不铺该部件。 |
| `shortcut` | `string` |  | 快捷键提示，写入 item-shortcut 部件；未提供时本条不铺该部件。 纯装饰：读屏从条目文字取意，不念它；只为真正注册了的组合写提示。 |
| `group` | `string` |  | 归属分组的身份值；相邻同值的条目收进同一个 group 部件。未提供时本条直接落在 content 上。 |
| `groupLabel` | `string` |  | 分组标题文字，取本组首个提供它的条目；本组无人提供时不铺 group-label。 |
| `separatorBefore` | `boolean` |  | 本条之前绘制一条分隔线；写在首条上不产出分隔线。本条领头一个分组时，分隔线绘制在分组外。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `MenuOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `select` | `MenuSelectDetails` | 条目被选中（菜单随之关闭）；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenuRoot` | `default` | `MenuRootSlotProps` |  |
| `XhMenuRoot` | `trigger` | — |  |
| `XhMenuRoot` | `item` | `MenuNodeMeta` | 整条的接管口：写了它，代铺的各格一概不铺，作者自己放置部件 |
| `XhMenuRoot` | `item-prefix` | `MenuNodeMeta` | 只接管行首那一格，其余槽照旧由数据铺 |
| `XhMenuRoot` | `item-suffix` | `MenuNodeMeta` | 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 |
| `XhMenuSub` | `default` | `MenuSubSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhMenuGroup` | `value` | `string` | 是 |  |
| `XhMenuItem` | `value` | `string` | 是 |  |
| `XhMenuItem` | `disabled` | `boolean` |  | 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 |
| `XhMenuPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhMenuRoot` | `trigger` | `ReactNode` |  | 触发器中放置的内容；只提供 collection 时由它承载。 |
| `XhMenuRoot` | `triggerAsChild` | `boolean` |  | 只提供 collection 时，trigger 给出的节点直接作为触发器使用，不再外包一个 button。 |
| `XhMenuRoot` | `renderItem` | `(node: MenuNodeMeta) => ReactNode` |  | 每个条目的自定义内容；未提供时使用 collection 中的 label。 |
| `XhMenuRoot` | `renderItemPrefix` | `(node: MenuNodeMeta) => ReactNode` |  | 只接管条目行首那一格；其余槽仍由数据铺。 |
| `XhMenuRoot` | `renderItemSuffix` | `(node: MenuNodeMeta) => ReactNode` |  | 只接管条目行尾那一格（计数、徽标、次级图标）；其余槽仍由数据铺。 |
| `XhMenuRoot` | `children` | `SlotChildren<MenuRootSlotProps>` |  |  |
| `XhMenuSub` | `value` | `string` | 是 | 它在父菜单中的条目身份。 |
| `XhMenuSub` | `disabled` | `boolean` |  |  |
| `XhMenuSub` | `collection` | `MenuNode[]` |  |  |
| `XhMenuSub` | `placement` | `Placement` |  |  |
| `XhMenuSub` | `offset` | `number` |  |  |
| `XhMenuSub` | `loop` | `boolean` |  |  |
| `XhMenuSub` | `openOnHover` | `boolean` |  |  |
| `XhMenuSub` | `hoverOpenDelay` | `number` |  |  |
| `XhMenuSub` | `hoverCloseDelay` | `number` |  |  |
| `XhMenuSub` | `dir` | `Direction` |  | 文字方向；默认继承父层。子层被迁移到浮层落点，无法继承父层的方向。 |
| `XhMenuSub` | `tone` | `Tone` |  | 语气；默认继承父层。子层是浮层落点下的同级节点，CSS 私有槽无法继承。 |
| `XhMenuSub` | `size` | `Size` |  | 尺寸；默认继承父层，理由同 tone。 |
| `XhMenuSub` | `children` | `SlotChildren<MenuSubSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `submenu-trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `PRESS.START` · `PRESS.END` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `ITEM.LOST` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `disabled` | `boolean` | 整张菜单是否禁用。 |
| `collection` | `readonly MenuNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起时为 null。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getItemProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemShortcutProps` | `(props: MenuItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: MenuItemProps) => T['element']` |  |
| `getSubmenuTriggerProps` | `(props: MenuItemProps) => T['element']` | 子菜单触发条目（submenu 模式）：既是父菜单中的一条 item（value 是它在父菜单 中的身份，父层的方向键与高亮照常识别它），又是本子菜单的触发器（aria-haspopup、 悬停 / 点击 / 右方向键展开）。父层的选中会跳过带 aria-haspopup 的条目。 |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenuGroupProps) => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` / `ArrowDown` | focus in trigger | 展开菜单并把焦点落到首个可用条目 |
| `ArrowUp` | focus in trigger | 展开菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到首个可用条目 |
| `End` | open, focus in content | 焦点移到末个可用条目 |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并关闭菜单，焦点归还 trigger |
| `Enter` / `Space` | held in item, not disabled | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或菜单收起撤下 |
| `Escape` | open | 关闭菜单并把焦点归还 trigger |
| `Tab` / `Shift+Tab` | open | 关闭菜单，焦点不归还 trigger，按 Tab 序列自然离开 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-label` | props.translations.content |
| `content` | `aria-labelledby` | `trigger` 部件的 id \| undefined |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item-shortcut` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |
| `submenu-trigger` | `aria-controls` | `content` 部件的 id |
| `submenu-trigger` | `aria-disabled` | 'true' \| 'false' |
| `submenu-trigger` | `aria-expanded` | 'true' \| 'false' |
| `submenu-trigger` | `aria-haspopup` | 'menu' |
| `submenu-trigger` | `role` | 'menuitem' |

## 样式参考

### 皮肤

`@xihan-ui/styles/menu.css` 使用 `[data-scope="menu"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-tone` | props.tone |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-tone` | metaOf.get(item.value)?.tone |
| `item` | `data-xh-collection-context` | 'overlay' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-xh-collection-slot` | 'prefix' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-shortcut` | `data-disabled` | ''（条件成立时才出现） |
| `item-shortcut` | `data-highlighted` | ''（条件成立时才出现） |
| `item-shortcut` | `data-xh-collection-slot` | 'shortcut' |
| `item-suffix` | `data-disabled` | ''（条件成立时才出现） |
| `item-suffix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `separator` | `data-xh-collection-separator` | '' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |
| `submenu-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submenu-trigger` | `data-in-path` | ''（条件成立时才出现） |
| `submenu-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `submenu-trigger` | `data-state` | 'open' \| 'closed' |
| `submenu-trigger` | `data-xh-collection-context` | 'overlay' |
| `submenu-trigger` | `data-xh-collection-item` | '' |
| `submenu-trigger` | `data-xh-collection-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-menu-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | menu 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-menu-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | menu 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-menu-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | menu 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-menu-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | menu 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-menu-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | menu 的 content 部件 color 覆盖槽。 |
| `--xh-menu-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | menu 的 content 部件 gap 覆盖槽。 |
| `--xh-menu-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-menu-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | menu 的 content 部件 padding-block 覆盖槽。 |
| `--xh-menu-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | menu 的 content 部件 border-radius 覆盖槽。 |
| `--xh-menu-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | menu 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-menu-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | menu 的 group 部件 gap 覆盖槽。 |
| `--xh-menu-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 group-label 部件 color 覆盖槽。 |
| `--xh-menu-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | menu 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-menu-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | menu 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-menu-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menu-item-px` | menu 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-menu-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | menu 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-menu-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | menu 的 content 部件 background 覆盖槽。 |
| `--xh-menu-icon-size` | `content` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | menu 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-menu-item-bg-active` | `item` | `background-color` | `in-path` | `--xh-bg-subtle` | menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-menu-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-menu-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-menu-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 item-description 部件 color 覆盖槽。 |
| `--xh-menu-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | menu 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-menu-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`in-path`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-material-frosted-fg` | menu 的 item 部件 color 覆盖槽。 |
| `--xh-menu-item-font-size` | `item` | `font-size` | `default` | `--xh-_menu-font-size` | menu 的 item 部件 font-size 覆盖槽。 |
| `--xh-menu-item-gap` | `item` | `gap` | `default` | `--xh-_menu-item-gap` | menu 的 item 部件 gap 覆盖槽。 |
| `--xh-menu-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | menu 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-menu-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | menu 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-menu-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | menu 的 item 部件 line-height 覆盖槽。 |
| `--xh-menu-item-px` | `item` | `padding-inline` | `default` | `--xh-_menu-item-px` | menu 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-menu-item-py` | `item` | `padding-block` | `default` | `--xh-_menu-item-py` | menu 的 item 部件 padding-block 覆盖槽。 |
| `--xh-menu-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | menu 的 item 部件 border-radius 覆盖槽。 |
| `--xh-menu-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | menu 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-menu-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | menu 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-menu-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | menu 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-menu-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | menu 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-menu-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | menu 的 separator 部件 background 覆盖槽。 |
| `--xh-menu-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | menu 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-menu-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | menu 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-menu-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | menu 的 separator 部件 block-size 覆盖槽。 |
| `--xh-menu-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | menu 的 item 部件 background-color 覆盖槽。 |
| `--xh-menu-submenu-indicator-size` | `item` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | menu 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-menu-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-bg-subtle` | menu 的 trigger 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
