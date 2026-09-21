来源：https://ui.docs.xihanfun.com/components/listbox

# Listbox 列表框 `alpha`

用于展示一组常驻选项，并允许用户选择其中一项或多项。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/listbox" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/listbox.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/listbox" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/listbox" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/listbox.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

从成员列表中选择一项

```vue
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const members = [
  { value: "lin", name: "林知夏", email: "lin@xihan.dev", initial: "林" },
  { value: "chen", name: "陈望舒", email: "chen@xihan.dev", initial: "陈" },
  { value: "zhou", name: "周予安", email: "zhou@xihan.dev", initial: "周" },
];
</script>

<template>
  <XhListboxRoot :default-value="['lin']" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>团队成员</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="member in members" :key="member.value" :value="member.value">
        <span
          aria-hidden="true"
          style="display: grid; flex: none; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 999px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); font-weight: 600"
        >
          {{ member.initial }}
        </span>
        <XhListboxItemText>
          <span style="display: grid; gap: 2px">
            <span>{{ member.name }}</span>
            <span style="color: var(--xh-fg-subtle); font-size: var(--xh-text-caption-size)">{{ member.email }}</span>
          </span>
        </XhListboxItemText>
        <XhListboxItemIndicator />
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
</template>
```

```html
<xh-listbox default-value="lin">
  <div data-xh-part="root" style="inline-size: min(100%, 300px)">
    <span data-xh-part="label">团队成员</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="lin">
        <span aria-hidden="true" style="display: grid; flex: none; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 999px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); font-weight: 600">林</span>
        <span data-xh-part="item-text">
          <span style="display: grid; gap: 2px">
            <span>林知夏</span>
            <span style="color: var(--xh-fg-subtle); font-size: var(--xh-text-caption-size)">lin@xihan.dev</span>
          </span>
        </span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="chen">
        <span aria-hidden="true" style="display: grid; flex: none; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 999px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); font-weight: 600">陈</span>
        <span data-xh-part="item-text">
          <span style="display: grid; gap: 2px">
            <span>陈望舒</span>
            <span style="color: var(--xh-fg-subtle); font-size: var(--xh-text-caption-size)">chen@xihan.dev</span>
          </span>
        </span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="zhou">
        <span aria-hidden="true" style="display: grid; flex: none; place-items: center; inline-size: 32px; block-size: 32px; border-radius: 999px; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); font-weight: 600">周</span>
        <span data-xh-part="item-text">
          <span style="display: grid; gap: 2px">
            <span>周予安</span>
            <span style="color: var(--xh-fg-subtle); font-size: var(--xh-text-caption-size)">zhou@xihan.dev</span>
          </span>
        </span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
```

## 组件结构

加粗的是必需部件。

`data-scope="listbox"`：`root` · `label` · **`content`** · `item` · `item-text` · `item-indicator` · `group` · `group-label` · `empty` · `loading` · `load-more-trigger`

## 示例

### 多选

允许选择多个选项

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const options = [
  { value: "design", label: "产品设计" },
  { value: "engineering", label: "工程研发" },
  { value: "marketing", label: "市场运营" },
  { value: "support", label: "客户支持" },
];
</script>

<template>
  <XhListboxRoot
    :collection="options"
    :default-value="['design']"
    label="参与团队"
    selection-mode="multiple"
    style="inline-size: min(100%, 300px)"
  />
</template>
```

```html
<xh-listbox default-value="design" selection-mode="multiple">
  <div data-xh-part="root" style="inline-size: min(100%, 300px)">
    <span data-xh-part="label">参与团队</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="design">
        <span data-xh-part="item-text">产品设计</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="engineering">
        <span data-xh-part="item-text">工程研发</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="marketing">
        <span data-xh-part="item-text">市场运营</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="support">
        <span data-xh-part="item-text">客户支持</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
```

### 分组

按类别组织选项

```vue
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "bangkok", label: "Bangkok 曼谷" },
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];
</script>

<template>
  <XhListboxRoot :default-value="['beijing']" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxGroup v-for="g in groups" :key="g.value" :value="g.value">
        <XhListboxGroupLabel>{{ g.label }}</XhListboxGroupLabel>
        <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value">
          <XhListboxItemText>{{ c.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxGroup>
    </XhListboxContent>
  </XhListboxRoot>
</template>
```

```html
<xh-listbox default-value="beijing">
  <div data-xh-part="root" style="inline-size: min(100%, 300px)">
    <span data-xh-part="label">城市</span>
    <div data-xh-part="content">
      <div data-xh-part="group" value="asia">
        <span data-xh-part="group-label">亚洲</span>
        <div data-xh-part="item" value="bangkok">
          <span data-xh-part="item-text">Bangkok 曼谷</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chengdu">
          <span data-xh-part="item-text">Chengdu 成都</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="group" value="europe">
        <span data-xh-part="group-label">欧洲</span>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-listbox>
```

### 滚动

固定高度显示长列表

```vue
<script setup lang="ts">
import { XhListboxRoot } from "@xihan-ui/vue";

const tracks = Array.from({ length: 12 }, (_, index) => ({
  value: `track-${index + 1}`,
  label: `曲目 ${String(index + 1).padStart(2, "0")}`,
}));
</script>

<template>
  <XhListboxRoot
    :collection="tracks"
    :default-value="['track-1']"
    label="播放列表"
    style="inline-size: min(100%, 300px); --xh-listbox-content-max-h: 180px"
  />
</template>
```

```html
<xh-listbox default-value="track-1">
  <div
    data-xh-part="root"
    style="inline-size: min(100%, 300px); --xh-listbox-content-max-h: 180px"
  >
    <span data-xh-part="label">播放列表</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="track-1"><span data-xh-part="item-text">曲目 01</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-2"><span data-xh-part="item-text">曲目 02</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-3"><span data-xh-part="item-text">曲目 03</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-4"><span data-xh-part="item-text">曲目 04</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-5"><span data-xh-part="item-text">曲目 05</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-6"><span data-xh-part="item-text">曲目 06</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-7"><span data-xh-part="item-text">曲目 07</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-8"><span data-xh-part="item-text">曲目 08</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-9"><span data-xh-part="item-text">曲目 09</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-10"><span data-xh-part="item-text">曲目 10</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-11"><span data-xh-part="item-text">曲目 11</span><span data-xh-part="item-indicator"></span></div>
      <div data-xh-part="item" value="track-12"><span data-xh-part="item-text">曲目 12</span><span data-xh-part="item-indicator"></span></div>
    </div>
  </div>
</xh-listbox>
```

### 空态

没有选项时显示简洁提示

```vue
<script setup lang="ts">
import {
  XhListboxContent,
  XhListboxEmpty,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhListboxRoot :collection="[]" style="inline-size: min(100%, 300px)">
    <XhListboxLabel>团队成员</XhListboxLabel>
    <XhListboxContent />
    <XhListboxEmpty>暂无成员</XhListboxEmpty>
  </XhListboxRoot>
</template>
```

```html
<xh-listbox>
  <div data-xh-part="root" style="inline-size: min(100%, 300px)">
    <span data-xh-part="label">团队成员</span>
    <div data-xh-part="content"></div>
    <div data-xh-part="empty">暂无成员</div>
  </div>
</xh-listbox>
```

## 设计指引

### 何时使用

- 选项需要常驻可见。
- 需要单选、多选或连续范围选择。

### 何时不用

- 选项需要收起：使用[选择器](./select)。
- 内容不可选择：使用[列表](./list)。

### 特性

- 支持 `single`、`multiple` 和 `extended` 三种选择模式。
- 支持方向键导航、连续输入检索与范围选择。
- 支持分组、禁用条目和定高滚动。
- 提供空态、加载态与加载更多部件。

### 组合

- 收进浮层即是[选择器](./select)与[组合框](./combobox)的候选列表；常驻时直接铺在面板内。
- 长列表接入[虚拟滚动](./virtualizer)只渲染可视区；两侧搬运的场景使用[穿梭框](./transfer)。

### 最佳实践

- 使用 `item-indicator` 表示选中，并始终保留其空间。页内列表的选中行铺品牌淡底行面并在起始侧画对号，与下拉候选的透明底行尾对号刻意不同。
- 条目标题保持简短，补充信息使用次级文字。
- 长列表设置固定高度，并按需启用虚拟化。
- 空态与加载态放在 `content` 外，与其互斥显示。

### 反模式

- 用选项承载删除、提交等即时命令。
- 在没有可见选项时保留空白列表边框。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-listbox>` |
| Vue 组件 | `XhListboxContent` `XhListboxEmpty` `XhListboxGroup` `XhListboxGroupLabel` `XhListboxItem` `XhListboxItemIndicator` `XhListboxItemText` `XhListboxLabel` `XhListboxLoadMoreTrigger` `XhListboxLoading` `XhListboxRoot` |
| 组合式函数 | `useListbox` |
| 状态机 | `listboxMachine` |
| 皮肤 | `@xihan-ui/styles/listbox.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ListboxNode[]` |  | 条目数据，显示文本与禁用的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| string[]` |  | 选中值，提供即受控；单选可写为裸串，内部归一为数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `ListboxSelectionMode` |  | 选择模式，默认 single。 |
| `disabled` | `boolean` |  | 整个列表禁用，键盘与点击都不再改选中值。 |
| `readOnly` | `boolean` |  | 只读：条目照常浏览与聚焦，但选中值不可修改。禁用则连同焦点一起退出。 |
| `loading` | `boolean` |  | 条目加载中：列表报告 aria-busy，显示在途占位，隐藏空态占位。 |
| `invalid` | `boolean` |  | 校验失败：列表报告 aria-invalid，各角色节点带 data-invalid。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目的几何档位。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。 |
| `onValueChange` | `(details: ListboxValueChangeDetails) => void` |  | value 变化意图回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ListboxValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhListboxRoot` | `default` | `ListboxRootSlotProps` |  |
| `XhListboxRoot` | `label` | — |  |
| `XhListboxRoot` | `item` | `ListboxNodeMeta` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-indicator` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.CLEAR` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `FOCUS.CLEAR` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly ListboxNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `selectionMode` | `ListboxSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在列表内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `loading` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只保留该条目；加选使用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 中、content 的兄弟。 提供 collection 时由连接层按条数收放；条目手写时不写 hidden，是否显示由作者决定。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 提供 collection 时由连接层按条数收放；条目手写时只按 loading 收放。 |
| `getLoadMoreTriggerProps` | `() => T['element']` | 取下一页的入口：库不知道是否还有下一页，是否显示与点击后的行为都由作者决定， 连接层只保证取数在途与整列禁用两档不可点击。 |
| `getGroupProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: ListboxGroupProps) => T['element']` |  |
| `getItemProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: ListboxItemProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: ListboxItemProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the listbox | 整个列表只占一个 Tab 位：焦点进入锚点条目，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in listbox, orientation=vertical | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowRight 承担，dir=rtl 再对调左右 |
| `ArrowUp` | focus in listbox, orientation=vertical | 焦点移到上一个可停留条目（禁用项跳过、尽头按 loop 回绕）；orientation=horizontal 时改由 ArrowLeft 承担，dir=rtl 再对调左右 |
| `Home` | focus in listbox | 焦点移到首个可停留条目 |
| `End` | focus in listbox | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, selectionMode 为 single 或 extended | 只选中焦点条目，替换原有选中；条目自报禁用则不认 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 可多选（multiple；extended 下须按住 Ctrl/Cmd） | 切换焦点条目的选中态，其余选中不动 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in listbox, 可多选 | 焦点移到相邻条目并切换它的选中态；反向移动即取消刚扩展进来的条目 |
| `Ctrl+A` / `Cmd+A` | focus in listbox, 可多选 | 选中全部可选条目；已经全选则把它们一并取消（禁用但已选中的不动） |
| `Enter` / `Space` | held in item / load-more-trigger, interactive | 按住期间该部件投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下；禁用、只读的条目与在途中的取下一页不进 |
| `单个可打印字符` | focus in listbox, typeahead 未关 | 连打检索把焦点移到首字母匹配的条目，不改选中值 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `aria-busy` | 'true' \| undefined |
| `content` | `aria-disabled` | 'true' \| 'false' |
| `content` | `aria-invalid` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `label` 部件的 id |
| `content` | `aria-multiselectable` | 'true' \| 'false' |
| `content` | `aria-orientation` | props.orientation |
| `content` | `aria-readonly` | 'true' \| 'false' |
| `content` | `role` | 'listbox' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-indicator` | `aria-hidden` | 'true' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/listbox.css` 使用 `[data-scope="listbox"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-invalid` | ''（条件成立时才出现） |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-state` | 'checked' \| 'unchecked' |
| `item-indicator` | `data-xh-collection-slot` | 'indicator' |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-loading` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `load-more-trigger` | `data-xh-action-control` | '' |
| `load-more-trigger` | `data-xh-action-display` | 'always' |
| `load-more-trigger` | `data-xh-action-profile` | 'row' |
| `load-more-trigger` | `data-xh-action-size` | props.size |
| `load-more-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-listbox-content-bg` | `content` | `background` | `default` | `--xh-bg-surface` | listbox 的 content 部件 background 覆盖槽。 |
| `--xh-listbox-content-border` | `content` | `border` | `default` | `--xh-border-default` | listbox 的 content 部件 border 覆盖槽。 |
| `--xh-listbox-content-border-invalid` | `content` | `border-color` | `invalid` | `--xh-border-invalid` | listbox 的 content 部件 border-color 覆盖槽。 |
| `--xh-listbox-content-fg` | `content` | `color` | `default` | `--xh-fg-default` | listbox 的 content 部件 color 覆盖槽。 |
| `--xh-listbox-content-gap` | `content` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 content 部件 gap 覆盖槽。 |
| `--xh-listbox-content-max-h` | `content` | `max-block-size` | `default` | `--xh-viewport-h-md` | listbox 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-listbox-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | listbox 的 content 部件 padding-block 覆盖槽。 |
| `--xh-listbox-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | listbox 的 content 部件 border-radius 覆盖槽。 |
| `--xh-listbox-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | listbox 的 empty 部件 color 覆盖槽。 |
| `--xh-listbox-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 empty 部件 font-size 覆盖槽。 |
| `--xh-listbox-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | listbox 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-listbox-gap` | `root` | `gap` | `default` | `--xh-space-2` | listbox 的 root 部件 gap 覆盖槽。 |
| `--xh-listbox-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | listbox 的 group 部件 gap 覆盖槽。 |
| `--xh-listbox-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | listbox 的 group-label 部件 color 覆盖槽。 |
| `--xh-listbox-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | listbox 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-listbox-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | listbox 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | listbox 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-listbox-group-spacing` | `content`<br>`group`<br>`item` | `margin-block-start` | `has([data-scope='listbox'][data-part='item']:not([hidden])`<br>`not([data-scope='listbox'][data-part='content'] [hidden] *)` | `--xh-space-1_5` | listbox 的 content、group、item 部件 margin-block-start 覆盖槽。 |
| `--xh-listbox-icon-size` | `item`<br>`root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | listbox 的 item、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-listbox-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-bg-selected` | `item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | listbox 的 item 部件 background-color 覆盖槽。 |
| `--xh-listbox-item-check-fg` | `item` | `background-color`<br>`color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-listbox-item-indicator-fg` | listbox 的 item 部件 background-color、color 覆盖槽。 |
| `--xh-listbox-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | listbox 的 item 部件 color 覆盖槽。 |
| `--xh-listbox-item-font-size` | `item` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 item 部件 font-size 覆盖槽。 |
| `--xh-listbox-item-font-weight-selected` | `item` | `font-weight` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-font-weight-regular` | listbox 的 item 部件 font-weight 覆盖槽。 |
| `--xh-listbox-item-gap` | `item` | `margin-inline-end`<br>`margin-inline-start` | `xh-collection-context=page`<br>`xh-collection-slot=indicator`<br>`xh-collection-slot=prefix`<br>`xh-collection-slot=shortcut`<br>`xh-collection-slot=suffix` | `--xh-_listbox-gap` | listbox 的 item 部件 margin-inline-end、margin-inline-start 覆盖槽。 |
| `--xh-listbox-item-indicator-fg` | `item` | `background-color`<br>`color` | `current`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`state=checked`<br>`xh-collection-context=page`<br>`xh-collection-slot=indicator` | `--xh-_listbox-accent` | listbox 的 item 部件 background-color、color 覆盖槽。 |
| `--xh-listbox-item-indicator-size` | `item-indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | listbox 的 item-indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-listbox-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | listbox 的 item 部件 line-height 覆盖槽。 |
| `--xh-listbox-item-px` | `item` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-item-py` | `item` | `padding-block` | `default` | `--xh-_listbox-item-py` | listbox 的 item 部件 padding-block 覆盖槽。 |
| `--xh-listbox-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 item 部件 border-radius 覆盖槽。 |
| `--xh-listbox-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | listbox 的 label 部件 color 覆盖槽。 |
| `--xh-listbox-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | listbox 的 label 部件 font-size 覆盖槽。 |
| `--xh-listbox-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | listbox 的 label 部件 font-weight 覆盖槽。 |
| `--xh-listbox-load-more-trigger-bg-hover` | `load-more-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | listbox 的 load-more-trigger 部件 background-color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-fg` | `load-more-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_tone-fg` | listbox 的 load-more-trigger 部件 color 覆盖槽。 |
| `--xh-listbox-load-more-trigger-font-size` | `load-more-trigger` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 load-more-trigger 部件 font-size 覆盖槽。 |
| `--xh-listbox-load-more-trigger-gap` | `load-more-trigger` | `gap` | `default` | `--xh-_listbox-gap` | listbox 的 load-more-trigger 部件 gap 覆盖槽。 |
| `--xh-listbox-load-more-trigger-px` | `load-more-trigger` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 load-more-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-load-more-trigger-py` | `load-more-trigger` | `padding-block` | `xh-action-profile=row` | `--xh-_listbox-item-py` | listbox 的 load-more-trigger 部件 padding-block 覆盖槽。 |
| `--xh-listbox-load-more-trigger-radius` | `load-more-trigger` | `border-radius` | `default` | `--xh-shape-control` | listbox 的 load-more-trigger 部件 border-radius 覆盖槽。 |
| `--xh-listbox-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | listbox 的 loading 部件 color 覆盖槽。 |
| `--xh-listbox-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_listbox-font-size` | listbox 的 loading 部件 font-size 覆盖槽。 |
| `--xh-listbox-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_listbox-item-px` | listbox 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-listbox-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | listbox 的 loading 部件 padding-block 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
