来源：https://ui.docs.xihanfun.com/components/menubar

# Menubar 菜单栏

用于桌面应用的横向命令菜单栏。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/menubar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/menubar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/menubar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/menubar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/menubar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在一条菜单栏中组织应用命令

```vue
<script setup lang="ts">
import { XhMenubarRoot } from "@xihan-ui/vue";

const menus = [
  { value: "file", label: "文件", items: [{ value: "new", label: "新建" }, { value: "open", label: "打开" }, { value: "save", label: "保存" }] },
  { value: "edit", label: "编辑", items: [{ value: "undo", label: "撤销" }, { value: "redo", label: "重做" }] },
  { value: "view", label: "视图", items: [{ value: "sidebar", label: "侧栏" }, { value: "terminal", label: "终端" }] },
];
</script>

<template>
  <XhMenubarRoot :collection="menus" style="background: var(--xh-bg-subtle)" />
</template>
```

```html
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="file">文件</button>
    <button data-xh-part="trigger" value="edit">编辑</button>
    <button data-xh-part="trigger" value="view">视图</button>

    <div data-xh-part="positioner" value="file"><div data-xh-part="content" value="file"><div data-xh-part="item" value="new">新建</div><div data-xh-part="item" value="open">打开</div><div data-xh-part="item" value="save">保存</div></div></div>
    <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit"><div data-xh-part="item" value="undo">撤销</div><div data-xh-part="item" value="redo">重做</div></div></div>
    <div data-xh-part="positioner" value="view"><div data-xh-part="content" value="view"><div data-xh-part="item" value="sidebar">侧栏</div><div data-xh-part="item" value="terminal">终端</div></div></div>
  </div>
</xh-menubar>
```

## 组件结构

加粗的是必需部件。

`data-scope="menubar"`：**`root`** · **`trigger`** · `positioner` · **`content`** · **`item`** · `item-text` · `item-indicator` · `item-description` · `separator` · `group` · `group-label` · `arrow`

## 示例

### 分组

在菜单内组织相关命令

```vue
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarGroup,
  XhMenubarGroupLabel,
  XhMenubarItem,
  XhMenubarItemIndicator,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenubarRoot style="background: var(--xh-bg-subtle)">
    <XhMenubarTrigger value="view">视图</XhMenubarTrigger>
    <XhMenubarPositioner value="view">
      <XhMenubarContent>
        <XhMenubarGroup value="theme">
          <XhMenubarGroupLabel>主题</XhMenubarGroupLabel>
          <XhMenubarItem value="light"><XhMenubarItemIndicator /><XhMenubarItemText>浅色</XhMenubarItemText></XhMenubarItem>
          <XhMenubarItem value="dark"><XhMenubarItemText>深色</XhMenubarItemText></XhMenubarItem>
        </XhMenubarGroup>
        <XhMenubarSeparator />
        <XhMenubarGroup value="panels">
          <XhMenubarGroupLabel>面板</XhMenubarGroupLabel>
          <XhMenubarItem value="sidebar"><XhMenubarItemText>侧栏</XhMenubarItemText></XhMenubarItem>
          <XhMenubarItem value="terminal"><XhMenubarItemText>终端</XhMenubarItemText></XhMenubarItem>
        </XhMenubarGroup>
      </XhMenubarContent>
    </XhMenubarPositioner>
  </XhMenubarRoot>
</template>
```

```html
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="view">视图</button>
    <div data-xh-part="positioner" value="view">
      <div data-xh-part="content" value="view">
        <div data-xh-part="group" value="theme">
          <span data-xh-part="group-label">主题</span>
          <div data-xh-part="item" value="light"><span data-xh-part="item-indicator"></span><span data-xh-part="item-text">浅色</span></div>
          <div data-xh-part="item" value="dark"><span data-xh-part="item-text">深色</span></div>
        </div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="group" value="panels">
          <span data-xh-part="group-label">面板</span>
          <div data-xh-part="item" value="sidebar"><span data-xh-part="item-text">侧栏</span></div>
          <div data-xh-part="item" value="terminal"><span data-xh-part="item-text">终端</span></div>
        </div>
      </div>
    </div>
  </div>
</xh-menubar>
```

### 图标与快捷键

补充常用命令的识别信息

```vue
<script setup lang="ts">
import { FileIcon, FolderIcon, PencilIcon, PlusIcon, SaveIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenubarRoot style="background: var(--xh-bg-subtle)">
    <XhMenubarTrigger value="file"><XhIcon :icon="FileIcon" size="sm" />文件</XhMenubarTrigger>
    <XhMenubarTrigger value="edit"><XhIcon :icon="PencilIcon" size="sm" />编辑</XhMenubarTrigger>
    <XhMenubarPositioner value="file">
      <XhMenubarContent>
        <XhMenubarItem value="new"><XhIcon :icon="PlusIcon" size="sm" /><XhMenubarItemText>新建</XhMenubarItemText><span aria-hidden="true">⌘ N</span></XhMenubarItem>
        <XhMenubarItem value="open"><XhIcon :icon="FolderIcon" size="sm" /><XhMenubarItemText>打开</XhMenubarItemText><span aria-hidden="true">⌘ O</span></XhMenubarItem>
        <XhMenubarSeparator />
        <XhMenubarItem value="save"><XhIcon :icon="SaveIcon" size="sm" /><XhMenubarItemText>保存</XhMenubarItemText><span aria-hidden="true">⌘ S</span></XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
    <XhMenubarPositioner value="edit">
      <XhMenubarContent>
        <XhMenubarItem value="undo">撤销</XhMenubarItem>
        <XhMenubarItem value="redo">重做</XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
  </XhMenubarRoot>
</template>
```

```html
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="file">文件</button>
    <button data-xh-part="trigger" value="edit">编辑</button>
    <div data-xh-part="positioner" value="file">
      <div data-xh-part="content" value="file">
        <div data-xh-part="item" value="new"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span data-xh-part="item-text">新建</span><span aria-hidden="true">⌘ N</span></div>
        <div data-xh-part="item" value="open"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h7l2 3h9v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span data-xh-part="item-text">打开</span><span aria-hidden="true">⌘ O</span></div>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="save"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h12l3 3v13H4V5zM8 4v6h8M8 20v-6h8v6"/></svg><span data-xh-part="item-text">保存</span><span aria-hidden="true">⌘ S</span></div>
      </div>
    </div>
    <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit"><div data-xh-part="item" value="undo">撤销</div><div data-xh-part="item" value="redo">重做</div></div></div>
  </div>
</xh-menubar>
```

### 子菜单

在菜单栏命令中打开下一层

```vue
<script setup lang="ts">
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarSeparator,
  XhMenubarSub,
  XhMenubarSubTrigger,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
} from "@xihan-ui/vue";
</script>

<template>
  <XhMenubarRoot style="background: var(--xh-bg-subtle)">
    <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
    <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
    <XhMenubarPositioner value="file">
      <XhMenubarContent>
        <XhMenubarItem value="open">打开</XhMenubarItem>
        <XhMenubarItem value="save">保存</XhMenubarItem>
        <XhMenubarSeparator />
        <XhMenubarSub value="share">
          <XhMenubarSubTrigger>发送到</XhMenubarSubTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem value="email">邮件</XhMenuItem>
              <XhMenuItem value="message">消息</XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenubarSub>
        <XhMenubarSeparator />
        <XhMenubarItem value="close">关闭</XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
    <XhMenubarPositioner value="edit">
      <XhMenubarContent>
        <XhMenubarItem value="undo">撤销</XhMenubarItem>
        <XhMenubarItem value="redo">重做</XhMenubarItem>
      </XhMenubarContent>
    </XhMenubarPositioner>
  </XhMenubarRoot>
</template>
```

```html
<xh-menubar>
  <div data-xh-part="root" style="background: var(--xh-bg-subtle)">
    <button data-xh-part="trigger" value="file">文件</button>
    <button data-xh-part="trigger" value="edit">编辑</button>
    <div data-xh-part="positioner" value="file">
      <div data-xh-part="content" value="file">
        <div data-xh-part="item" value="open">打开</div>
        <div data-xh-part="item" value="save">保存</div>
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
        <div data-xh-part="item" value="close">关闭</div>
      </div>
    </div>
    <div data-xh-part="positioner" value="edit"><div data-xh-part="content" value="edit"><div data-xh-part="item" value="undo">撤销</div><div data-xh-part="item" value="redo">重做</div></div></div>
  </div>
</xh-menubar>
```

## 设计指引

### 何时使用

- 在编辑器或桌面应用中按“文件、编辑、视图”组织命令。

### 何时不用

- 站点导航使用[导航菜单](./navigation-menu)。
- 单个入口使用[菜单](./menu)。
- 窄屏和触摸优先界面不适合菜单栏。

### 特性

- 同一时间只展开一个顶层菜单。
- 展开后移向相邻入口会直接切换菜单。
- 支持方向键、首字符检索、禁用项、分组与子菜单。
- 条目可组合图标、文字、说明和快捷键提示。
- 首次展开与最终关闭使用短距离淡变，顶层菜单切换不播放交叉动画。

### 组合

- 菜单栏应放在宽度稳定的应用顶栏中。

### 最佳实践

- 顶层入口使用单个名词，并控制在少量常用分类内。
- 破坏性命令放在菜单末尾并与普通命令分隔。
- 仅为已注册的快捷键显示提示。

### 反模式

- 不要在菜单栏中堆积过多顶层入口。
- 不要用菜单栏代替持久选项控件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-menubar>` |
| Vue 组件 | `XhMenubarArrow` `XhMenubarContent` `XhMenubarGroup` `XhMenubarGroupLabel` `XhMenubarItem` `XhMenubarItemDescription` `XhMenubarItemIndicator` `XhMenubarItemText` `XhMenubarPositioner` `XhMenubarRoot` `XhMenubarSeparator` `XhMenubarSub` `XhMenubarSubTrigger` `XhMenubarTrigger` |
| 组合式函数 | `useMenubar` |
| 状态机 | `menubarMachine` |
| 皮肤 | `@xihan-ui/styles/menubar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `MenubarNode[]` |  | 菜单栏数据，显示文本与禁用的事实源。给了它，入口与条目部件只需报 value。 缺省即回到「文本与禁用逐个写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 菜单栏排布轴，默认 horizontal。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `disabled` | `boolean` |  | 整条菜单栏禁用，展开与选中都不发生。 |
| `typeahead` | `boolean` |  | 菜单内的连打检索，默认开。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<MenubarTranslations>` |  |  |
| `onValueChange` | `(details: MenubarValueChangeDetails) => void` |  | value 变化回调。 |
| `onSelect` | `(details: MenubarSelectDetails) => void` |  | 条目被选中；菜单随之收起。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `MenubarValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |
| `select` | `MenubarSelectDetails` | 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMenubarRoot` | `default` | `MenubarRootSlotProps` |  |
| `XhMenubarRoot` | `item` | `MenubarNodeMeta` |  |
| `XhMenubarSub` | `default` | `MenubarSubSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`idle` · `open`

**事件**：`TRIGGER.TOGGLE` · `TRIGGER.OPEN` · `TRIGGER.POINTER` · `TRIGGER.FOCUS` · `CLOSE` · `MENUBAR.BLUR` · `VALUE.SET` · `PRESENCE.SET` · `ITEM.FOCUS` · `ITEM.LOST` · `ITEM.SELECT` · `SYNC.OPEN` · `SYNC.CLOSE`

**判据**：`hasValue` · `isCurrent` · `shouldAbsorbToggle` · `shouldSwitch`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly MenubarNodeMeta[]` | collection 推出的入口元信息（各自带着它那张菜单的条目），按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有菜单展开着。 |
| `focusedValue` | `string \| null` | trigger 的 roving 锚点；焦点不在菜单栏内时为 null。 |
| `focusedItem` | `string \| null` | 展开菜单内持有焦点的条目；无锚点时为 null。 |
| `orientation` | `Orientation` |  |
| `disabled` | `boolean` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: MenubarTriggerProps) => T['button']` |  |
| `getPositionerProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getContentProps` | `(props: MenubarContentProps) => T['element']` |  |
| `getItemProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: MenubarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: MenubarGroupProps) => T['element']` |  |
| `getArrowProps` | `(props: MenubarContentProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | focus in trigger, horizontal | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `ArrowLeft` | focus in trigger, horizontal | 焦点移到上一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去 |
| `Home` | focus in trigger | 焦点移到首个可用 trigger |
| `End` | focus in trigger | 焦点移到末个可用 trigger |
| `ArrowDown` / `Enter` / `Space` | focus in trigger, horizontal | 展开本项的菜单；方向键入口把焦点落到首个可用条目，Enter/Space 让焦点留在 trigger 上 |
| `ArrowUp` | focus in trigger, horizontal | 展开本项的菜单并把焦点落到末个可用条目 |
| `ArrowDown` | open, focus in content | 焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕） |
| `Home` | open, focus in content | 焦点移到本张菜单的首个可用条目 |
| `End` | open, focus in content | 焦点移到本张菜单的末个可用条目 |
| `ArrowRight` / `ArrowLeft` | open, focus in content | 切到相邻菜单并保持展开，焦点落到那一项的 trigger 上 |
| `a-z` / `0-9` | open, focus in content | 连打检索：焦点跳到首字母匹配的条目（同字符连打则在候选间轮换） |
| `Enter` / `Space` | focus in item, not disabled | 派发选中详情并收起菜单，焦点归还 trigger |
| `Escape` | open | 收起菜单并把焦点留在 trigger 上 |
| `Tab` / `Shift+Tab` | open | 收起菜单，焦点不被抢回 trigger，按 Tab 序列自然离开 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-label` | props.translations.root |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'menubar' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'menu' |
| `trigger` | `role` | 'menuitem' |
| `content` | `aria-hidden` | !isOpen \|\| undefined |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'menu' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `role` | 'menuitem' |
| `item-indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-orientation` | 'horizontal' |
| `separator` | `role` | 'separator' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/menubar.css` 使用 `[data-scope="menubar"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `content` | `data-instant` | ''（条件成立时才出现） |
| `content` | `data-placement` | 定位引擎算出的实际落位 \| undefined |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-menubar-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | menubar 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-menubar-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | menubar 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-menubar-bg` | `root` | `background` | `default` | `transparent` | menubar 的 root 部件 background 覆盖槽。 |
| `--xh-menubar-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | menubar 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-menubar-content-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | menubar 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-menubar-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | menubar 的 content 部件 color 覆盖槽。 |
| `--xh-menubar-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | menubar 的 content 部件 gap 覆盖槽。 |
| `--xh-menubar-content-px` | `content` | `padding-inline` | `default` | `--xh-surface-pad-xs` | menubar 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-content-py` | `content` | `padding-block` | `default` | `--xh-surface-pad-xs` | menubar 的 content 部件 padding-block 覆盖槽。 |
| `--xh-menubar-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | menubar 的 content 部件 border-radius 覆盖槽。 |
| `--xh-menubar-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | menubar 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-menubar-fg` | `root` | `color` | `default` | `--xh-fg-default` | menubar 的 root 部件 color 覆盖槽。 |
| `--xh-menubar-gap` | `root` | `gap` | `default` | `--xh-space-1` | menubar 的 root 部件 gap 覆盖槽。 |
| `--xh-menubar-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | menubar 的 group 部件 gap 覆盖槽。 |
| `--xh-menubar-group-label-fg` | `group-label` | `color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 group-label 部件 color 覆盖槽。 |
| `--xh-menubar-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | menubar 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-menubar-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | menubar 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-menubar-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_menubar-item-px` | menubar 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | menubar 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-menubar-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | menubar 的 content 部件 background 覆盖槽。 |
| `--xh-menubar-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | menubar 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-menubar-item-bg-active` | `item` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-bg-subtle` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-bg-pressed` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-bg-subtle-active` | menubar 的 item 部件 background 覆盖槽。 |
| `--xh-menubar-item-description-fg` | `item-description` | `color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 item-description 部件 color 覆盖槽。 |
| `--xh-menubar-item-description-font-size` | `item-description` | `font-size` | `default` | `--xh-text-caption-size` | menubar 的 item-description 部件 font-size 覆盖槽。 |
| `--xh-menubar-item-fg` | `item` | `color` | `default` | `--xh-material-frosted-fg` | menubar 的 item 部件 color 覆盖槽。 |
| `--xh-menubar-item-font-size` | `item` | `font-size` | `default` | `--xh-_menubar-font-size` | menubar 的 item 部件 font-size 覆盖槽。 |
| `--xh-menubar-item-gap` | `item` | `gap` | `default` | `--xh-_menubar-item-gap` | menubar 的 item 部件 gap 覆盖槽。 |
| `--xh-menubar-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tone` | menubar 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-menubar-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | menubar 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-menubar-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | menubar 的 item 部件 line-height 覆盖槽。 |
| `--xh-menubar-item-px` | `item` | `padding-inline` | `default` | `--xh-_menubar-item-px` | menubar 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-item-py` | `item` | `padding-block` | `default` | `--xh-_menubar-item-py` | menubar 的 item 部件 padding-block 覆盖槽。 |
| `--xh-menubar-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 item 部件 border-radius 覆盖槽。 |
| `--xh-menubar-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | menubar 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-menubar-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-menu-max-h` | menubar 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-menubar-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | menubar 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-menubar-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-menu-min-w` | menubar 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-menubar-px` | `root` | `padding-inline` | `default` | `--xh-space-1` | menubar 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-py` | `root` | `padding-block` | `default` | `--xh-space-1` | menubar 的 root 部件 padding-block 覆盖槽。 |
| `--xh-menubar-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-menubar-separator-color` | `separator` | `background` | `default` | `--xh-material-frosted-separator` | menubar 的 separator 部件 background 覆盖槽。 |
| `--xh-menubar-separator-my` | `separator` | `margin-block` | `default` | `--xh-space-0_5` | menubar 的 separator 部件 margin-block 覆盖槽。 |
| `--xh-menubar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | menubar 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-menubar-separator-thickness` | `separator` | `block-size` | `default` | `--xh-stroke-thin` | menubar 的 separator 部件 block-size 覆盖槽。 |
| `--xh-menubar-submenu-indicator-fg` | `item` | `background-color` | `default` | `--xh-material-frosted-fg-muted` | menubar 的 item 部件 background-color 覆盖槽。 |
| `--xh-menubar-trigger-bg-active` | `trigger` | `background` | `disabled`<br>`not([data-disabled])`<br>`state=open` | `--xh-_menubar-active-bg` | menubar 的 trigger 部件 background 覆盖槽。 |
| `--xh-menubar-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle` | menubar 的 trigger 部件 background 覆盖槽。 |
| `--xh-menubar-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_menubar-font-size` | menubar 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-menubar-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-sm` | menubar 的 trigger 部件 gap 覆盖槽。 |
| `--xh-menubar-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_menubar-trigger-px` | menubar 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-menubar-trigger-py` | `trigger` | `padding-block` | `default` | `--xh-_menubar-trigger-py` | menubar 的 trigger 部件 padding-block 覆盖槽。 |
| `--xh-menubar-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | menubar 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
