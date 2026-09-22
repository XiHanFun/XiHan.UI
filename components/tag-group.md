来源：https://ui.docs.xihanfun.com/components/tag-group

# TagGroup 标签组

把一排标签作为一个整体操作：方向键在标签之间移动，整组只占一个 Tab 停靠点，标签可以选中、也可以移除，移除后焦点有去处。

单个[标签](./tag)不接收焦点，它的关闭按钮是页面上一个独立的 Tab 停靠点：十个标签就是十个停靠点，键盘用户需要按十次才能越过。标签组把这十个收成一个。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tag-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tag-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tag-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tag-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tag-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一排可移除标签，每个都是库内的 tag：整组只占一个 Tab 位，方向键移动标签，Delete 或 Backspace 移除，关闭按钮就是 tag 的 close-trigger

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

## 组件结构

加粗的是必需部件。

`data-scope="tag-group"`：`root` · `label` · **`list`** · **`cell`** · `item-indicator`

## 示例

### 可选中

selectionMode 决定点击一个标签是替换还是加选；Ctrl/Cmd + A 全选

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
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">设计</span>
        </span>
      </span>
      <span data-xh-part="item" value="a11y">
        <span data-xh-part="cell">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">无障碍</span>
        </span>
      </span>
      <span data-xh-part="item" value="motion">
        <span data-xh-part="cell">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">动效</span>
        </span>
      </span>
      <span data-xh-part="item" value="legacy" aria-disabled="true">
        <span data-xh-part="cell">
          <span data-xh-part="item-indicator"></span>
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

size 写在组上逐个落到每个标签上，使用 tag 的三档，标签自身不写档位

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

逐部件自行编写，标签中即可放置头像、计数等自带内容，移除按钮照常归 cell 管理；条目渲染为 tag 的 root、文字是 tag 的 label，产出的结构与只提供数据的一份完全一致，Tab 位与键盘也一样

```vue
<script setup lang="ts">
import {
  XhTagGroupCell,
  XhTagGroupItem,
  XhTagGroupItemDeleteTrigger,
  XhTagGroupItemIndicator,
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
          <XhTagGroupItemIndicator />
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
          <span data-xh-part="item-indicator"></span>
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
          <span data-xh-part="item-indicator"></span>
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
          <span data-xh-part="item-indicator"></span>
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

- 一排可移除的标签：已生效的筛选条件、一条记录关联的若干分类。
- 一排可选的标记：点击一个即筛选一次，或按住多选。
- 键盘与读屏用户需要逐个遍历、逐个移除。

### 何时不用

- 只有一个标签且不接受交互时，直接使用[标签](./tag)。
- 用户需要自行输入并累积多个值时，使用[标签输入](./tags-input)，它自带输入框与增删逻辑。
- 选项很多、需要搜索时，使用[选择器](./select)的多选或[穿梭框](./transfer)。
- 一组互斥选项需要用户选一个时，使用[单选组](./radio-group)或[分段控制器](./segmented)。
- 只是把一排标签排开、不接键盘时，用[弹性布局](./flex)包一层即可。

### 特性

- roving tabindex：整组一个 Tab 停靠点，组内使用方向键移动；`Home` / `End` 到端点。
- `selectionMode` 三档：`none` 只是标记、`single` 单选、`multiple` 可多选（`Ctrl` / `Cmd` + `A` 全选）。
- 每一个标签就是库内的[标签](./tag)：标签本体是它的 `root`，文字是它的 `label`，移除按钮是它的 `close-trigger`；组只在其上叠加行角色、Tab 停靠点、选中与锚点。
- 选中的标签使用品牌淡底，并在文字前展示 `item-indicator` 选中标记（默认绘制对号，也可放入图标）；未选中时该部件收起，不接选中时不出现。
- `deletable` 显示移除按钮，键盘路径使用 `Delete` / `Backspace`。
- 选择与移除是两个互斥动作：点击标签本体才选择，点击移除按钮只从选中集合移除并发出 `item-delete`，不会让同一次冒泡 click 把待删值重新选中。
- 移除一个之后焦点交给前一个；前面没有则交给后一个，没有剩余时交给列表容器。
- `collection` 是文本、禁用与可移除的事实源；也可以逐个编写。
- 连续输入按首字母跳转，只移动焦点、不改变选中值。

### 组合

- 每一个标签就是[标签](./tag)本身：形态、语气、尺寸三轴写在组上，逐个落到每个标签的 `root`，外观全部由 `tag.css` 决定，`--xh-tag-*` 覆盖槽在组内同样生效。
- 标签内的图元使用[图标](./icon)。
- 外层放[表单字段](./field)，为标题提供位置。

### 最佳实践

- 条目的去留由宿主决定：`item-delete` 只报告用户要移除哪一个，宿主从自己的数据中删除。撤销、二次确认、服务端失败回滚都只有宿主知道。
- 移除之后提供回退路径，否则用户误点后无法恢复。
- 标签文字尽量短，且首字母有区分度：连续输入按首字母跳转。
- 不接选中时把 `selectionMode` 保持为 `none`：一排纯标记标签报告“未选中”是错误信息。

### 反模式

- 把整排标签铺成十个 Tab 停靠点：这正是本组件要解决的问题，不再逐个编写[标签](./tag)。
- 移除后不处理焦点：被移除的标签带着焦点一起消失，焦点会回到页面开头。
- 只用颜色表达含义：色觉障碍的用户无法分辨，文字本身要说明。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tag-group>` |
| Vue 组件 | `XhTagGroupCell` `XhTagGroupItem` `XhTagGroupItemDeleteTrigger` `XhTagGroupItemIndicator` `XhTagGroupItemText` `XhTagGroupLabel` `XhTagGroupList` `XhTagGroupRoot` |
| 组合式函数 | `useTagGroup` |
| 状态机 | `tagGroupMachine` |
| 皮肤 | `@xihan-ui/styles/tag-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TagGroupNode[]` |  | 条目数据，显示文本、禁用与可移除的事实源。提供后条目部件只需声明 value。 未提供时回到文本与禁用都写在条目部件上的方式。 |
| `value` | `string \| string[]` |  | 选中值，提供即受控；单选可写为裸串，内部归一为数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `selectionMode` | `TagGroupSelectionMode` |  | 选择模式，默认 none。 |
| `deletable` | `boolean` |  | 是否提供移除按钮，默认 false。false 时该按钮同时被禁用与收起。 |
| `disabled` | `boolean` |  | 整组禁用：键盘与点击都不再修改选中值，也不可移除任何标签。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、可导航与朗读，但选中值不可修改、标签也不可移除。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal：标签成排出现。 |
| `typeahead` | `boolean` |  | 连打检索，默认开启。 |
| `variant` | `TagVariant` |  | 形态：solid / subtle / outline，逐个写到每个标签（tag 的 root）上。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，使用 tag 的三档。 |
| `onValueChange` | `(details: TagGroupValueChangeDetails) => void` |  | value 变化意图回调。 |
| `onItemDelete` | `(details: TagGroupItemDeleteDetails) => void` |  | 移除意图回调。条目由宿主的数据决定去留，组件只报告用户要移除该标签， 同时把它从选中集合中移除，并把焦点交给相邻的标签。 |
| `translations` | `Partial<TagGroupTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TagGroupValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `item-delete` | `TagGroupItemDeleteDetails` | 用户要移除某个标签；detail 为 `{ value: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTagGroupRoot` | `default` | `TagGroupRootSlotProps` |  |
| `XhTagGroupRoot` | `label` | — |  |
| `XhTagGroupRoot` | `item` | `TagGroupNodeMeta` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.SELECT` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `ITEM.DELETE` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 选中集合；单选模式下长度 ≤ 1。 |
| `collection` | `readonly TagGroupNodeMeta[]` | 由 collection 推导的条目元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `selectionMode` | `TagGroupSelectionMode` | 生效的选择模式。 |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在组内时为 null。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `deletable` | `boolean` | 整组是否提供移除按钮。 |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: string[]) => void` |  |
| `select` | `(value: string) => void` | 只保留该条目；加选使用 toggle。 |
| `toggle` | `(value: string) => void` |  |
| `deleteItem` | `(value: string) => void` | 移除一个标签。程序化入口，不移动焦点。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TagGroupItemProps) => T['element']` | 一个标签：库内 tag 的 root（data-scope="tag"），三轴与置灰由 tag 提供； row 角色、身份、roving tabindex、选中（data-selected）与锚点（data-highlighted）叠加在它上面。 |
| `getCellProps` | `(props: TagGroupItemProps) => T['element']` | 标签内的格子；移除按钮必须落在它之内。 |
| `getItemIndicatorProps` | `(props: TagGroupItemProps) => T['element']` | 选中标记：落在格子内、文字之前，选中时展示、未选中时以 hidden 收起； 对读屏隐藏，选中态由标签上的 aria-selected 表达。内容留空时由皮肤绘制对号，也可放入图标。 |
| `getItemTextProps` | `(props: TagGroupItemProps) => T['element']` | 标签文字：tag 的 label，截断规则挂在该层。 |
| `getItemDeleteTriggerProps` | `(props: TagGroupItemProps) => T['button']` | 移除按钮：所在标签那份 tag 的 close-trigger，不占 Tab 位；可及名、禁用与收起都由 tag 提供。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/grid/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the group | 整组只占一个 Tab 位：焦点进入锚点标签，无锚点时先落到列表容器再由它转移；每个标签的移除按钮一律不占停靠点 |
| `ArrowRight` | focus in group, orientation=horizontal | 焦点移到下一个可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowDown 承担，dir=rtl 再对调左右 |
| `ArrowLeft` | focus in group, orientation=horizontal | 焦点移到上一个可停留标签（禁用项跳过、尽头按 loop 回绕）；orientation=vertical 时改由 ArrowUp 承担，dir=rtl 再对调左右 |
| `Home` | focus in group | 焦点移到首枚可停留标签 |
| `End` | focus in group | 焦点移到末枚可停留标签 |
| `Enter` / `Space` | focus on item, selectionMode=single 且可改 | 只选中焦点标签，替换原有选中；标签禁用或整组只读则不认 |
| `Enter` / `Space` | focus on item, selectionMode=multiple 且可改 | 切换焦点标签的选中态，其余选中不动 |
| `Ctrl+A` / `Cmd+A` | focus in group, selectionMode=multiple 且可改 | 选中全部可选标签；已经全选则把它们一并取消（禁用但已选中的不动） |
| `Delete` / `Backspace` | focus on item, 该标签可移除且可修改 | 移除焦点标签，并把焦点交给前一个；前面没有则交给后一个，全部移除后交给列表容器 |
| `单个可打印字符` | focus in group, typeahead 未关 | 连打检索把焦点移到首字母匹配的标签，不改选中值 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-label` | label.list |
| `list` | `aria-labelledby` | `label` 部件的 id |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'grid' |
| `cell` | `role` | 'gridcell' |
| `item-indicator` | `aria-hidden` | 'true' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' \| undefined |
| `item` | `role` | 'row' |

一排可移除的标签是“集合 + 每条自带动作”，在 ARIA 中只有表格语义能容纳：可聚焦的移除按钮不允许位于 `option` 等控件角色内，`gridcell` 允许。因此 `list` 是 `grid`、每个标签（[标签](./tag)的 `root`）承担 `row`、标签内的格是 `gridcell`；手写部件时 `cell` 这一层不能省略，使用 `collection` 时由组件铺开。

## 样式参考

### 皮肤

`@xihan-ui/styles/tag-group.css` 使用 `[data-scope="tag-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-orientation` | props.orientation |
| `cell` | `data-disabled` | ''（条件成立时才出现） |
| `cell` | `data-highlighted` | ''（条件成立时才出现） |
| `cell` | `data-selected` | ''（条件成立时才出现） |
| `item-indicator` | `data-disabled` | ''（条件成立时才出现） |
| `item-indicator` | `data-highlighted` | ''（条件成立时才出现） |
| `item-indicator` | `data-selected` | ''（条件成立时才出现） |
| `item` | `data-deletable` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-selectable` | ''（条件成立时才出现） |
| `item` | `data-selected` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tag-group-gap` | `root` | `gap` | `default` | `--xh-space-2` | tag-group 的 root 部件 gap 覆盖槽。 |
| `--xh-tag-group-item-bg-hover` | `list`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`tone`<br>`variant=solid` | `--xh-_tone-subtle-hover`<br>`--xh-bg-subtle` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-bg-pressed` | `list`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`selectable`<br>`tone`<br>`variant=solid` | `--xh-_tone-subtle-active`<br>`--xh-bg-subtle-hover` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-bg-pressed-solid` | `list`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`pressed`<br>`selectable`<br>`tone`<br>`variant=solid` | `--xh-_tone-active`<br>`--xh-bg-brand-active` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-bg-selected` | `list`<br>`root` | `background` | `disabled`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `--xh-_tone-subtle` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-bg-selected-hover` | `list`<br>`root` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `--xh-_tone-subtle-hover` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-bg-selected-pressed` | `list`<br>`root` | `background` | `disabled`<br>`is(:active, [data-pressed])`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`pressed`<br>`selectable`<br>`selected`<br>`variant=solid` | `--xh-_tone-subtle-active` | tag-group 的 list、root 部件 background 覆盖槽。 |
| `--xh-tag-group-item-border-selected` | `list`<br>`root` | `border-color` | `disabled`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `currentColor`<br>`transparent` | tag-group 的 list、root 部件 border-color 覆盖槽。 |
| `--xh-tag-group-item-fg-selected` | `list`<br>`root` | `color` | `disabled`<br>`not([data-disabled])`<br>`not([data-variant='solid'])`<br>`selected`<br>`variant=solid` | `--xh-_tone-fg` | tag-group 的 list、root 部件 color 覆盖槽。 |
| `--xh-tag-group-item-indicator-fg` | `item-indicator` | `color` | `default` | `currentColor` | tag-group 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-tag-group-item-indicator-size` | `item-indicator` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | tag-group 的 item-indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tag-group-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | tag-group 的 label 部件 color 覆盖槽。 |
| `--xh-tag-group-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | tag-group 的 label 部件 font-size 覆盖槽。 |
| `--xh-tag-group-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tag-group 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tag-group-list-gap` | `list` | `gap` | `default` | `--xh-space-1_5` | tag-group 的 list 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
