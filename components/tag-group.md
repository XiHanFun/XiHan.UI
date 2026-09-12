来源：https://ui.docs.xihanfun.com/components/tag-group

# TagGroup `标签组`

一排标签当作一件东西来操作：方向键在标签之间走，整组只占一个 Tab 停靠点，
标签可以选中、也可以被摘掉，摘完焦点有去处。

单枚[标签](./tag)不接收焦点，它的关闭钮是页面上一个独立的 Tab 停靠点——十枚标签就是
十个停靠点，键盘用户得按十下才能走过去。标签组把这十个收成一个。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tag-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tag-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tag-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tag-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tag-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排可摘标签，每一枚都是库里的 tag：整组只占一个 Tab 位，方向键走标签，Delete 或 Backspace 摘掉，那颗叉就是 tag 的 close-trigger

```vue
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const tags = ref([
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
]);

// 条目的去留归宿主：组件只报「用户要摘这一枚」
function remove({ value }: { value: string }) {
  tags.value = tags.value.filter(tag => tag.value !== value);
}
</script>

<template>
  <XhTagGroupRoot
    :collection="tags"
    label="技术栈"
    deletable
    @item-delete="remove"
  />
  <p>还剩：{{ tags.length ? tags.map((tag) => tag.label).join("、") : "（空）" }}</p>
</template>
```

```html
<xh-tag-group id="tag-group-basic" deletable>
  <div data-xh-part="root">
    <span data-xh-part="label">技术栈</span>
    <div data-xh-part="list">
      <span data-xh-part="item" value="vue">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">Vue</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="react">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">React</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="svelte">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">Svelte</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="angular">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">Angular</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
    </div>
  </div>
</xh-tag-group>
<p>还剩：<span id="tag-group-basic-rest">Vue、React、Svelte、Angular</span></p>

<script type="module">
  // 条目的去留归宿主：组件只报「用户要摘这一枚」，节点由这里摘掉
  const group = document.getElementById("tag-group-basic");
  const readout = document.getElementById("tag-group-basic-rest");
  group.addEventListener("item-delete", (event) => {
    group.querySelector(`[data-xh-part="item"][value="${event.detail.value}"]`)?.remove();
    const rest = [...group.querySelectorAll('[data-xh-part="item-text"]')].map((el) => el.textContent);
    readout.textContent = rest.join("、") || "（空）";
  });
</script>
```

## 示例

### 可选中

selectionMode 决定点一枚是替换还是加选；Ctrl/Cmd + A 全选

```vue
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const picked = ref<string[]>(["design"]);
const topics = [
  { value: "design", label: "设计" },
  { value: "a11y", label: "无障碍" },
  { value: "motion", label: "动效" },
  { value: "legacy", label: "已归档", disabled: true },
];
</script>

<template>
  <XhTagGroupRoot
    v-model:value="picked"
    :collection="topics"
    label="话题"
    selection-mode="multiple"
    variant="outline"
    tone="brand"
  />
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tag-group
  id="tag-group-selection"
  selection-mode="multiple"
  value="design"
  variant="outline"
  tone="brand"
>
  <div data-xh-part="root">
    <span data-xh-part="label">话题</span>
    <div data-xh-part="list">
      <span data-xh-part="item" value="design">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">设计</span>
        </span>
      </span>
      <span data-xh-part="item" value="a11y">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">无障碍</span>
        </span>
      </span>
      <span data-xh-part="item" value="motion">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">动效</span>
        </span>
      </span>
      <span data-xh-part="item" value="legacy" aria-disabled="true">
        <span data-xh-part="cell">
          <span data-xh-part="item-text">已归档</span>
        </span>
      </span>
    </div>
  </div>
</xh-tag-group>
<p>已选：<span id="tag-group-selection-value">design</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const group = document.getElementById("tag-group-selection");
  const readout = document.getElementById("tag-group-selection-value");
  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 尺寸

size 打在组上逐枚落到每一枚标签上，走 tag 的三档，标签自己不写档位

```vue
<script setup lang="ts">
import { XhTagGroupRoot } from "@xihan-ui/vue";

const tags = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
    <XhTagGroupRoot :collection="tags" size="sm" label="小档" />
    <XhTagGroupRoot :collection="tags" label="缺省档" />
    <XhTagGroupRoot :collection="tags" size="lg" label="大档" />
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
  <xh-tag-group size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">小档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>

  <xh-tag-group>
    <div data-xh-part="root">
      <span data-xh-part="label">缺省档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>

  <xh-tag-group size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">大档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>
</div>
```

### 手写部件

逐部件自己写，标签里就能塞头像、计数这类自带内容，摘除钮照旧归 cell 管；条目渲出来是 tag 的 root、文字是 tag 的 label，产出的结构与只交数据那一份完全一致，Tab 位与键盘也一样

```vue
<script setup lang="ts">
import {
  XhTagGroupCell,
  XhTagGroupItem,
  XhTagGroupItemDeleteTrigger,
  XhTagGroupItemText,
  XhTagGroupLabel,
  XhTagGroupList,
  XhTagGroupRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const members = ref([
  { value: "zhang", label: "张三", initial: "张", tasks: 3 },
  { value: "li", label: "李四", initial: "李", tasks: 8 },
  { value: "wang", label: "王五", initial: "王", tasks: 0 },
]);

const picked = ref<string[]>(["li"]);

// 条目的去留归宿主：组件只报「用户要摘这一枚」
function remove({ value }: { value: string }) {
  members.value = members.value.filter(member => member.value !== value);
}

const avatar
  = "display: inline-flex; align-items: center; justify-content: center;"
    + " inline-size: 16px; block-size: 16px; border-radius: 50%;"
    + " background: var(--xh-bg-subtle); font-size: var(--xh-font-size-xs)";
</script>

<template>
  <XhTagGroupRoot
    v-model:value="picked"
    :collection="members"
    selection-mode="multiple"
    variant="outline"
    deletable
    @item-delete="remove"
  >
    <XhTagGroupLabel>协作成员</XhTagGroupLabel>
    <XhTagGroupList>
      <XhTagGroupItem v-for="member in members" :key="member.value" :value="member.value">
        <XhTagGroupCell>
          <!-- 首字头像只是装饰，连打检索取的是 item-text 里那几个字 -->
          <span aria-hidden="true" :style="avatar">{{ member.initial }}</span>
          <XhTagGroupItemText>{{ member.label }}</XhTagGroupItemText>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">
            {{ member.tasks }}
          </span>
          <XhTagGroupItemDeleteTrigger />
        </XhTagGroupCell>
      </XhTagGroupItem>
    </XhTagGroupList>
  </XhTagGroupRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tag-group
  id="tag-group-parts"
  selection-mode="multiple"
  variant="outline"
  deletable
>
  <div data-xh-part="root">
    <span data-xh-part="label">协作成员</span>
    <div data-xh-part="list">
      <span data-xh-part="item" value="zhang">
        <span data-xh-part="cell">
          <!-- 首字头像只是装饰，连打检索取的是 item-text 里那几个字 -->
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >张</span
          >
          <span data-xh-part="item-text">张三</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">3</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="li">
        <span data-xh-part="cell">
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >李</span
          >
          <span data-xh-part="item-text">李四</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">8</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
      <span data-xh-part="item" value="wang">
        <span data-xh-part="cell">
          <span
            aria-hidden="true"
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              inline-size: 16px;
              block-size: 16px;
              border-radius: 50%;
              background: var(--xh-bg-subtle);
              font-size: var(--xh-font-size-xs);
            "
            >王</span
          >
          <span data-xh-part="item-text">王五</span>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">0</span>
          <button data-xh-part="item-delete-trigger"></button>
        </span>
      </span>
    </div>
  </div>
</xh-tag-group>
<p>已选：<span id="tag-group-parts-value">li</span></p>

<script type="module">
  const group = document.getElementById("tag-group-parts");
  const readout = document.getElementById("tag-group-parts-value");

  group.value = ["li"];

  group.addEventListener("value-change", (event) => {
    group.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });

  // 条目的去留归宿主：元素只报「用户要摘这一枚」，节点由这里摘掉
  group.addEventListener("item-delete", (event) => {
    group.querySelector(`[data-xh-part="item"][value="${event.detail.value}"]`)?.remove();
  });
</script>
```

## 设计指引

### 何时使用

- 一排可摘的标签：已生效的筛选条件、一条记录挂着的若干分类。
- 一排可选的标记：点一枚就筛一次，或者按住多选。
- 键盘与读屏用户要能逐枚走过去、逐枚摘掉。

### 何时不用

- 只有一枚标签，且不接交互：直接用[标签](./tag)。
- 用户要自己输入并累积多个值：用[标签输入](./tags-input)，它自带输入框与增删逻辑。
- 选项很多、需要搜索：用[选择器](./select)的多选或[穿梭框](./transfer)。
- 一组互斥选项要用户挑一个：用[单选组](./radio-group)或[分段控件](./segmented)。
- 只是把一排标签摆开、不接键盘：用[弹性布局](./flex) 包一层就够了。

### 特性

- roving tabindex：整组一个 Tab 停靠点，组内走方向键；`Home` / `End` 到端点。
- `selectionMode` 三档：`none` 只是标记、`single` 单选、`multiple` 可多选（`Ctrl`/`Cmd` + `A` 全选）。
- 每一枚标签就是库里的[标签](./tag)：标签本体是它的 `root`，文字是它的 `label`，摘除钮是它的 `close-trigger`；组只往上面叠行角色、Tab 停靠点、选中与锚点。
- `deletable` 给出摘除钮，键盘那一路走 `Delete` / `Backspace`。
- 选择与摘除是两个互斥动作：点标签本体才选择，点摘除钮只从选中集合移除并发 `item-delete`，
  不会让同一次冒泡 click 又把待删值选回来。
- 摘掉一枚之后焦点交给前一枚；前面没有就交给后一枚，一枚不剩就交给列表容器。
- `collection` 是文本、禁用与可摘的事实源；也可以逐枚自己写。
- 连打检索按首字母跳，只搬焦点、不改选中值。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tag-group>` |
| Vue 组件 | `XhTagGroupCell` `XhTagGroupItem` `XhTagGroupItemDeleteTrigger` `XhTagGroupItemText` `XhTagGroupLabel` `XhTagGroupList` `XhTagGroupRoot` |
| 组合式函数 | `useTagGroup` |
| 状态机 | `tagGroupMachine` |
| 皮肤 | `@xihan-ui/styles/tag-group.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tag-group"`：`root` · `label` · **`list`** · **`cell`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TagGroupNode[]` |  | 条目数据，显示文本、禁用与可摘的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `string \| string[]` |  | 选中值，给定即受控；单选可写成裸串，内部归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `TagGroupSelectionMode` |  | 选择模式，默认 none。 |
| `deletable` | `boolean` |  | 是否给出摘除钮，默认 false。false 时该钮同时被禁用与收起。 |
| `disabled` | `boolean` |  | 整组禁用：键盘与点击都不再改选中值，也摘不掉任何一枚。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可导航与朗读，但选中值改不动、标签也摘不掉。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal——标签是成排出现的。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。 |
| `variant` | `TagVariant` |  | 形态：solid / subtle / outline，逐枚落到每一枚标签（tag 的 root）上。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，走 tag 的三档。 |
| `onValueChange` | `(details: TagGroupValueChangeDetails) => void` |  | value 变化意图回调。 |
| `onItemDelete` | `(details: TagGroupItemDeleteDetails) => void` |  | 摘除意图回调。条目由宿主的数据决定去留，组件只报「用户要摘这一枚」， 顺手把它从选中集合里去掉，并把焦点交给相邻的一枚。 |
| `translations` | `Partial<TagGroupTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TagGroupValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `item-delete` | `TagGroupItemDeleteDetails` | 用户要摘掉某一枚；detail 为 `{ value: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTagGroupRoot` | `default` | `TagGroupRootSlotProps` |  |
| `XhTagGroupRoot` | `label` | — |  |
| `XhTagGroupRoot` | `item` | `TagGroupNodeMeta` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `ITEM.DELETE` · `LIST.BLUR`

## connect API

`useTagGroup` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly TagGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `selectionMode` | `TagGroupSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在组内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `deletable` | `boolean` | 整组是否给出摘除钮。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只留这一个；加选用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `deleteItem` | `(value: string) => void` | 摘掉一枚。程序化入口，不搬焦点。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TagGroupItemProps) => T['element']` | 一枚标签：库里 tag 的 root（data-scope="tag"），三轴与置灰由 tag 给； row 角色、身份、roving tabindex、选中（data-selected）与锚点（data-highlighted）叠在它上面。 |
| `getCellProps` | `(props: TagGroupItemProps) => T['element']` | 标签里那一格；摘除钮必须落在它之内。 |
| `getItemTextProps` | `(props: TagGroupItemProps) => T['element']` | 标签文字：tag 的 label，截断规则挂在那一层。 |
| `getItemDeleteTriggerProps` | `(props: TagGroupItemProps) => T['button']` | 摘除钮：所在标签那份 tag 的 close-trigger，不占 Tab 位；可及名、禁用与收起都由 tag 给。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点标签，无锚点时先落列表容器再由它转投；每枚标签的摘除钮一律不占停靠点 |
| `ArrowRight` | focus in group, orientation=horizontal | 焦点移到下一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowDown 承担，dir=rtl 再对调左右 |
| `ArrowLeft` | focus in group, orientation=horizontal | 焦点移到上一枚可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowUp 承担，dir=rtl 再对调左右 |
| `Home` | focus in group | 焦点移到首枚可停留标签 |
| `End` | focus in group | 焦点移到末枚可停留标签 |
| `Enter` / `Space` | focus on item, selectionMode=single 且可改 | 只选中焦点标签，替换原有选中；标签禁用或整组只读则不认 |
| `Enter` / `Space` | focus on item, selectionMode=multiple 且可改 | 切换焦点标签的选中态，其余选中不动 |
| `Ctrl+A` / `Cmd+A` | focus in group, selectionMode=multiple 且可改 | 选中全部可选标签；已经全选则把它们一并取消（禁用但已选中的不动） |
| `Delete` / `Backspace` | focus on item, 该标签可摘且可改 | 摘掉焦点标签，并把焦点交给前一枚；前面没有就交给后一枚，一枚不剩就交给列表容器 |
| `单个可打印字符` | focus in group, typeahead 未关 | 连打检索把焦点移到首字母匹配的标签，不改选中值 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | label.list |
| `list` | `aria-labelledby` | `label` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'grid' |
| `cell` | `role` | 'gridcell' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' \| undefined |
| `item` | `role` | 'row' |

一排可摘标签是「集合 + 每条自带动作」，这在 ARIA 里只有表格语义放得下：可聚焦的摘除钮
不许待在 `option` 这类控件角色里，`gridcell` 允许。所以 `list` 是 `grid`、每枚标签（[标签](./tag)的 `root`）
担 `row`、标签里那一格是 `gridcell`——手写部件时 `cell` 这一层不能省，用 `collection` 则由组件自己铺开。

## 样式

默认皮肤 `@xihan-ui/styles/tag-group.css` 按部件选择：`[data-scope="tag-group"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-deletable` | ''（条件成立时才出现） |
| `item` | `data-selectable` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tag-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | tag-group 的 root 部件 gap 覆盖槽。 |
| `--xh-tag-group-item-bg-hover` | `list`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`variant=solid` | `--xh-bg-subtle-hover` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-border-selected` | `list`<br>`root` | `border-color` | `disabled`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `--xh-_tone`<br>`currentColor` | tag-group 的 list、root 部件 border-color 覆盖槽。 |
| `--xh-tag-group-item-fg-selected` | `list`<br>`root` | `color` | `disabled`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `--xh-_tone-fg` | tag-group 的 list、root 部件 color 覆盖槽。 |
| `--xh-tag-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | tag-group 的 label 部件 color 覆盖槽。 |
| `--xh-tag-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | tag-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-tag-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tag-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tag-group-list-gap` | `list` | `gap` | `default` | `--xh-space-1_5` | tag-group 的 list 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 每一枚标签就是[标签](./tag)本身：形态 · 语气 · 尺寸三轴写在组上，逐枚落到每一枚的 `root` 上，样子全归 `tag.css`，`--xh-tag-*` 覆盖槽在组里照样生效。
- 标签里的图元用[图标](./icon)。
- 外面套[表单字段](./field)，标题就有了去处。

## 最佳实践

- 条目的去留是宿主的事：`item-delete` 只报「用户要摘这一枚」，宿主从自己的数据里删掉它。
  组件不替宿主决定，因为撤销、二次确认、服务端失败回滚都只有宿主知道。
- 摘掉一枚之后要有回退路径，否则用户误点就再也加不回来。
- 标签文字尽量短，且首字母有区分度——连打检索按首字母跳。
- 不接选中就把 `selectionMode` 留在 `none`：一排纯标记标签报「未选中」是句假话。

## 反模式

- 把整排标签铺成十个 Tab 停靠点：那正是这个组件要解决的问题，别再逐枚写[标签](./tag)。
- 摘完不管焦点：被摘的那一枚带着焦点一起消失，焦点会掉回页面开头。
- 用颜色单独表达含义：色觉障碍的用户分不出来，文字本身要说清楚。
