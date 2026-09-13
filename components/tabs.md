来源：https://ui.docs.xihanfun.com/components/tabs

# Tabs 标签页

用于在同一区域内切换并列内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tabs" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tabs.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tabs" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tabs" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tabs.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

在并列内容之间切换

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="项目视图">
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
      <XhTabsTrigger value="reports">报告</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="overview">查看项目概览与近期活动。</XhTabsContent>
    <XhTabsContent value="analytics">分析访问趋势与关键指标。</XhTabsContent>
    <XhTabsContent value="reports">浏览已生成的项目报告。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="overview">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="项目视图">
      <button data-xh-part="trigger" value="overview">概览</button>
      <button data-xh-part="trigger" value="analytics">分析</button>
      <button data-xh-part="trigger" value="reports">报告</button>
    </div>

    <div data-xh-part="content" value="overview">查看项目概览与近期活动。</div>
    <div data-xh-part="content" value="analytics">分析访问趋势与关键指标。</div>
    <div data-xh-part="content" value="reports">浏览已生成的项目报告。</div>
  </div>
</xh-tabs>
```

## 组件结构

加粗的是必需部件。

`data-scope="tabs"`：`root` · **`list`** · **`trigger`** · `indicator` · `separator` · **`content`** · `tab-drag-trigger` · `live-region`

## 示例

### 垂直布局

用于侧栏式内容导航

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="account" orientation="vertical" variant="line" style="inline-size: 420px; max-inline-size: 100%">
    <XhTabsList aria-label="账户设置">
      <XhTabsTrigger value="account">账户</XhTabsTrigger>
      <XhTabsTrigger value="security">安全</XhTabsTrigger>
      <XhTabsTrigger value="notifications">通知</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>

    <XhTabsContent value="account">管理账户资料与偏好。</XhTabsContent>
    <XhTabsContent value="security">配置密码与登录验证。</XhTabsContent>
    <XhTabsContent value="notifications">设置消息通知方式。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="account" orientation="vertical" variant="line">
  <div data-xh-part="root" style="inline-size: 420px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="账户设置">
      <button data-xh-part="trigger" value="account">账户</button>
      <button data-xh-part="trigger" value="security">安全</button>
      <button data-xh-part="trigger" value="notifications">通知</button>
      <div data-xh-part="indicator"></div>
    </div>

    <div data-xh-part="content" value="account">管理账户资料与偏好。</div>
    <div data-xh-part="content" value="security">配置密码与登录验证。</div>
    <div data-xh-part="content" value="notifications">设置消息通知方式。</div>
  </div>
</xh-tabs>
```

### 次级变体

使用下划线表示当前标签

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="overview" variant="line" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="数据视图">
      <XhTabsTrigger value="overview">概览</XhTabsTrigger>
      <XhTabsTrigger value="analytics">分析</XhTabsTrigger>
      <XhTabsTrigger value="reports">报告</XhTabsTrigger>
      <XhTabsIndicator />
    </XhTabsList>
    <XhTabsContent value="overview">查看项目概览。</XhTabsContent>
    <XhTabsContent value="analytics">查看项目分析。</XhTabsContent>
    <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="overview" variant="line">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="数据视图">
      <button data-xh-part="trigger" value="overview">概览</button>
      <button data-xh-part="trigger" value="analytics">分析</button>
      <button data-xh-part="trigger" value="reports">报告</button>
      <div data-xh-part="indicator"></div>
    </div>
    <div data-xh-part="content" value="overview">查看项目概览。</div>
    <div data-xh-part="content" value="analytics">查看项目分析。</div>
    <div data-xh-part="content" value="reports">查看项目报告。</div>
  </div>
</xh-tabs>
```

### 图标标签

图标辅助识别内容类别

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { ActivityIcon, ChartBarIcon, FileTextIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="activity" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="项目数据">
      <XhTabsTrigger value="activity"><XhIcon :icon="ActivityIcon" />活动</XhTabsTrigger>
      <XhTabsTrigger value="analytics"><XhIcon :icon="ChartBarIcon" />分析</XhTabsTrigger>
      <XhTabsTrigger value="reports"><XhIcon :icon="FileTextIcon" />报告</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="activity">查看项目近期活动。</XhTabsContent>
    <XhTabsContent value="analytics">查看项目分析数据。</XhTabsContent>
    <XhTabsContent value="reports">查看项目报告。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="activity">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="项目数据">
      <button data-xh-part="trigger" value="activity">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,12 7,12 10,5 14,19 17,12 21,12"/></svg>
        活动
      </button>
      <button data-xh-part="trigger" value="analytics">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v16h16"/><line x1="8" y1="20" x2="8" y2="14"/><line x1="13" y1="20" x2="13" y2="10"/><line x1="18" y1="20" x2="18" y2="6"/></svg>
        分析
      </button>
      <button data-xh-part="trigger" value="reports">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V6a2 2 0 0 0 2 2h3.5"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
        报告
      </button>
    </div>

    <div data-xh-part="content" value="activity">查看项目近期活动。</div>
    <div data-xh-part="content" value="analytics">查看项目分析数据。</div>
    <div data-xh-part="content" value="reports">查看项目报告。</div>
  </div>
</xh-tabs>
```

### 禁用标签

保留暂不可用的内容入口

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="active" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="标签状态">
      <XhTabsTrigger value="active">当前</XhTabsTrigger>
      <XhTabsTrigger value="disabled" disabled>不可用</XhTabsTrigger>
      <XhTabsTrigger value="available">可用</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="active">当前标签可以正常切换。</XhTabsContent>
    <XhTabsContent value="disabled">此内容暂不可用。</XhTabsContent>
    <XhTabsContent value="available">此标签可以选择。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="active">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="标签状态">
      <button data-xh-part="trigger" value="active">当前</button>
      <button data-xh-part="trigger" value="disabled" disabled>不可用</button>
      <button data-xh-part="trigger" value="available">可用</button>
    </div>

    <div data-xh-part="content" value="active">当前标签可以正常切换。</div>
    <div data-xh-part="content" value="disabled">此内容暂不可用。</div>
    <div data-xh-part="content" value="available">此标签可以选择。</div>
  </div>
</xh-tabs>
```

### 分隔线

在相邻标签之间增加视觉分组

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsSeparator,
  XhTabsTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhTabsRoot default-value="monthly" style="inline-size: 360px; max-inline-size: 100%">
    <XhTabsList aria-label="账单周期">
      <XhTabsTrigger value="monthly">按月</XhTabsTrigger>
      <XhTabsSeparator />
      <XhTabsTrigger value="quarterly">按季</XhTabsTrigger>
      <XhTabsSeparator />
      <XhTabsTrigger value="yearly">按年</XhTabsTrigger>
    </XhTabsList>

    <XhTabsContent value="monthly">每月自动续费，可随时取消。</XhTabsContent>
    <XhTabsContent value="quarterly">每三个月结算一次。</XhTabsContent>
    <XhTabsContent value="yearly">按年结算可享优惠。</XhTabsContent>
  </XhTabsRoot>
</template>
```

```html
<xh-tabs default-value="monthly">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="账单周期">
      <button data-xh-part="trigger" value="monthly">按月</button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="trigger" value="quarterly">按季</button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="trigger" value="yearly">按年</button>
    </div>

    <div data-xh-part="content" value="monthly">每月自动续费，可随时取消。</div>
    <div data-xh-part="content" value="quarterly">每三个月结算一次。</div>
    <div data-xh-part="content" value="yearly">按年结算可享优惠。</div>
  </div>
</xh-tabs>
```

## 设计指引

### 何时使用

- 内容属于同一对象的不同类别。
- 用户需要在少量内容面板之间切换。

### 何时不用

- 内容需要同时比较时并排展示。
- 存在先后顺序时使用[步骤条](./steps)。
- 切换单个状态时使用[切换按钮组](./toggle-group)。

### 特性

- 默认 `segment` 变体使用浅色标签带与浮起选中项。
- `line` 用于次级导航，`card` 用于文档式标签。
- 支持水平、垂直、禁用与手动激活模式。
- 面板常驻并通过 `hidden` 切换，内部状态不会丢失。
- `reorderable` 支持指针拖动与 Alt + 方向键换位。

### 组合

- `indicator` 为 `line` 变体提供滑动指示条。
- `separator` 在相邻标签之间增加分隔线。

### 最佳实践

- 标签数量控制在七个以内。
- 需要保留选择时，将当前标签同步到地址。

### 反模式

- 不要嵌套标签页。
- 避免面板高度差异过大造成布局跳动。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tabs>` |
| Vue 组件 | `XhTabsContent` `XhTabsIndicator` `XhTabsList` `XhTabsLiveRegion` `XhTabsRoot` `XhTabsSeparator` `XhTabsTabDragTrigger` `XhTabsTrigger` |
| 组合式函数 | `useTabs` |
| 状态机 | `tabsMachine` |
| 皮肤 | `@xihan-ui/styles/tabs.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TabsNode[]` |  | 条目数据，标签文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在 trigger 上」的老路。 |
| `value` | `string \| null` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal；不同轴的方向键放行给页面滚动与读屏。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只影响水平轴上 ArrowLeft/ArrowRight 的前后语义。 |
| `activationMode` | `TabsActivationMode` |  | 方向键移动焦点时是否顺带切换选中，默认 automatic。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `variant` | `TabsVariant` |  | 变体：line / card / segment，决定选中态怎么画。缺省是 segment。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `reorderable` | `boolean` |  | 标签可以拖着换位。整个标签都是拖动源，不另出把手。 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，只发 onTabMove。 |
| `onTabMove` | `(details: TabsMoveDetails) => void` |  |  |
| `closable` | `boolean` |  | 标签可关闭：trigger 上按 Delete / Backspace 即发 onTabClose。 库不持有标签序，只发意图，删不删由数据源那边决定。 |
| `onTabClose` | `(details: TabsCloseDetails) => void` |  | 标签被关闭。 |
| `translations` | `Partial<TabsTranslations>` |  |  |
| `onValueChange` | `(details: TabsValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TabsValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| null }` |
| `tab-move` | `TabsMoveDetails` | 标签换了位；detail 为 `{ value, from, to, values }`，values 是重排好的整份标签序 |
| `tab-close` | `TabsCloseDetails` | 标签被关闭；detail 为 `{ value, values }`，values 是关掉这一条之后余下的标签序 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'active' \| 'inactive' |
| `content` | 'active' \| 'inactive' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `TRIGGER.SELECT` · `TRIGGER.FOCUS` · `TRIGGER.NAVIGATE` · `LIST.BLUR` · `TAB_DRAG.START` · `TAB_DRAG.MOVE` · `TAB_DRAG.END` · `TAB_DRAG.CANCEL` · `TAB.MOVE_BY` · `TAB.CLOSE`

**判据**：`isAutomatic`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` |  |
| `collection` | `readonly TabsNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `dropTarget` | `DropTarget \| null` | 此刻的落点；松手就落在这儿。没落在任何标签上时是 null。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `setValue` | `(next: string \| null) => void` | 传 null 清空选中：context.value 与受控 value 都能表达"无选中"，写入侧同样收得下。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: TabsTriggerProps) => T['button']` |  |
| `getIndicatorProps` | `() => T['element']` | 选中标签下的滑条；位置由机器量好写成内联样式，没有选中项时 hidden。 |
| `getSeparatorProps` | `() => T['element']` | 标签之间的细分隔线，纯装饰。 |
| `getContentProps` | `(props: TabsContentProps) => T['element']` |  |
| `getTabDragTriggerProps` | `(props: TabsTriggerProps) => T['element']` | 标签拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：reorderable 关着或这个标签禁用时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getLiveRegionProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in list, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；automatic 模式顺带切换选中 |
| `ArrowLeft` / `ArrowUp` | focus in list, 按键与 orientation 同轴 | 焦点移到上一个 trigger；automatic 模式顺带切换选中 |
| `Home` | focus in list | 焦点移到首个可停留 trigger |
| `End` | focus in list | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 把选中切到焦点所在 trigger（manual 模式的确认键） |
| `Tab` / `Shift+Tab` | focus in list | 整组只有锚点 trigger 留在 Tab 序列内，一次 Tab 进出；无锚点时由 list 兜底，焦点进来后转投锚点 trigger（即选中项），锚点缺席或被禁用才落首个可停留项 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` | focus in list, reorderable 开着, 按键与 orientation 同轴 | 把焦点标签在标签带里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；横轴跟着文字方向翻、rtl 下左右两键对调，竖排的上下两键不对调；已是首位 / 末位就不动，也不回绕；标签序不进库，只报一次重排好的新顺序。裸方向键仍是导航、Enter/Space 仍是确认 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-orientation` | props.orientation |
| `list` | `role` | 'tablist' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-selected` | 'true' \| 'false' |
| `trigger` | `role` | 'tab' |
| `indicator` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'tabpanel' |
| `tab-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式参考

### 皮肤

`@xihan-ui/styles/tabs.css` 使用 `[data-scope="tabs"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-closable` | ''（条件成立时才出现） |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-draggable` | ''（条件成立时才出现） |
| `trigger` | `data-dragging` | ''（条件成立时才出现） |
| `trigger` | `data-drop` | 'before' \| 'after' |
| `trigger` | `data-state` | 'active' \| 'inactive' |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | item.value |
| `separator` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'active' \| 'inactive' |
| `tab-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `tab-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tabs-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | tabs 的 content 部件 color 覆盖槽。 |
| `--xh-tabs-content-py` | `content` | `padding-block` | `default` | `--xh-stack-gap-md` | tabs 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tabs-drag-fg` | `tab-drag-trigger` | `color` | `default` | `--xh-fg-subtle` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-active` | `tab-drag-trigger` | `color` | `disabled`<br>`dragging`<br>`hover`<br>`not([data-disabled])` | `--xh-fg-default` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-fg-disabled` | `tab-drag-trigger` | `color` | `disabled` | `--xh-fg-disabled` | tabs 的 tab-drag-trigger 部件 color 覆盖槽。 |
| `--xh-tabs-drag-grip-long` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-2` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-grip-short` | `root`<br>`tab-drag-trigger` | `block-size`<br>`inline-size` | `empty`<br>`orientation=vertical` | `--xh-space-1` | tabs 的 root、tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-drag-radius` | `tab-drag-trigger` | `border-radius` | `default` | `--xh-shape-control` | tabs 的 tab-drag-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-drag-size` | `tab-drag-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tabs 的 tab-drag-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-dragging-opacity` | `trigger` | `opacity` | `dragging` | `--xh-state-dragging-opacity` | tabs 的 trigger 部件 opacity 覆盖槽。 |
| `--xh-tabs-drop-fg` | `trigger` | `background` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])` | `--xh-bg-brand` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-drop-line` | `root`<br>`trigger` | `block-size`<br>`inline-size` | `drop=after`<br>`drop=before`<br>`is([data-drop='before'], [data-drop='after'])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 root、trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-gap` | `root` | `gap` | `default` | `--xh-stack-gap-md` | tabs 的 root 部件 gap 覆盖槽。 |
| `--xh-tabs-indicator-color` | `indicator` | `background` | `default` | `--xh-_tabs-accent` | tabs 的 indicator 部件 background 覆盖槽。 |
| `--xh-tabs-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-indicator-thickness` | `indicator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thick` | tabs 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-list-bg` | `list` | `background` | `default` | `--xh-_tabs-list-bg` | tabs 的 list 部件 background 覆盖槽。 |
| `--xh-tabs-list-border` | `list` | `border-block-end`<br>`border-inline-end` | `default` | `--xh-border-default` | tabs 的 list 部件 border-block-end、border-inline-end 覆盖槽。 |
| `--xh-tabs-list-gap` | `list` | `gap` | `default` | `--xh-_tabs-list-gap` | tabs 的 list 部件 gap 覆盖槽。 |
| `--xh-tabs-list-p` | `list` | `padding` | `default` | `--xh-_tabs-list-p` | tabs 的 list 部件 padding 覆盖槽。 |
| `--xh-tabs-list-radius` | `list` | `border-radius` | `default` | `--xh-_tabs-list-radius` | tabs 的 list 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-color` | `separator` | `background` | `default` | `--xh-border-default` | tabs 的 separator 部件 background 覆盖槽。 |
| `--xh-tabs-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | tabs 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-tabs-separator-size` | `separator` | `block-size` | `default` | `--xh-space-4` | tabs 的 separator 部件 block-size 覆盖槽。 |
| `--xh-tabs-separator-thickness` | `separator` | `block-size`<br>`inline-size` | `default`<br>`orientation=vertical` | `--xh-stroke-thin` | tabs 的 separator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tabs-trigger-bg` | `trigger` | `background` | `default` | `transparent` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active` | `trigger` | `background` | `state=active` | `--xh-_tabs-trigger-bg-active` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-active-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=active` | `--xh-_tabs-trigger-bg-active-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-bg-hover` | `trigger` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-bg-subtle-hover` | tabs 的 trigger 部件 background 覆盖槽。 |
| `--xh-tabs-trigger-border` | `trigger` | `border` | `default` | `--xh-_tabs-trigger-border` | tabs 的 trigger 部件 border 覆盖槽。 |
| `--xh-tabs-trigger-border-active` | `trigger` | `border-color` | `state=active` | `--xh-_tabs-trigger-border-active` | tabs 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-tabs-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-muted` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-active` | `trigger` | `color` | `state=active` | `--xh-_tabs-accent-text` | tabs 的 trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-fg-hover` | `root`<br>`trigger` | `color` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`variant=line` | `--xh-_tabs-accent-text` | tabs 的 root、trigger 部件 color 覆盖槽。 |
| `--xh-tabs-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tabs-trigger-font-size` | tabs 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tabs-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | tabs 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-tabs-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | tabs 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tabs-trigger-h` | `trigger` | `block-size` | `default` | `--xh-_tabs-trigger-h` | tabs 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-tabs-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_tabs-trigger-px` | tabs 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-tabs-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-_tabs-trigger-radius` | tabs 的 trigger 部件 border-radius 覆盖槽。 |
| `--xh-tabs-trigger-shadow-active` | `trigger` | `box-shadow` | `state=active` | `--xh-_tabs-trigger-shadow-active` | tabs 的 trigger 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`block-size` · `box-shadow` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
