来源：https://ui.docs.xihanfun.com/components/toolbar

# Toolbar 工具栏

用于组织一组相关的操作控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toolbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toolbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toolbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toolbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toolbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

集中常用编辑操作

```vue
<script setup lang="ts">
import { BoldIcon, ClipboardIcon, CopyIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
const selected = ref(new Set(["bold"]));

function toggle(value: string) {
  const next = new Set(selected.value);
  next.has(value) ? next.delete(value) : next.add(value);
  selected.value = next;
}
</script>

<template>
  <XhToolbarRoot aria-label="文本编辑">
    <XhToolbarGroup>
      <template v-for="(format, index) in formats" :key="format.value">
        <XhToolbarSeparator v-if="index > 0" />
        <XhToolbarItem
          :value="format.value"
          type="button"
          :aria-label="format.label"
          :aria-pressed="selected.has(format.value)"
          @click="toggle(format.value)"
        >
          <XhIcon :icon="format.icon" />
        </XhToolbarItem>
      </template>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button" aria-label="复制">
        <XhIcon :icon="CopyIcon" />
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="paste" type="button" aria-label="粘贴">
        <XhIcon :icon="ClipboardIcon" />
      </XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar>
  <div data-xh-part="root" aria-label="文本编辑">
    <div data-xh-part="group">
      <button data-format data-xh-part="item" type="button" value="bold" aria-label="加粗" aria-pressed="true">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 5H13A4 4 0 0 1 13 13H7Z"/><path d="M7 13H14A4 4 0 0 1 14 21H7Z"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-format data-xh-part="item" type="button" value="italic" aria-label="斜体" aria-pressed="false">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-format data-xh-part="item" type="button" value="underline" aria-label="下划线" aria-pressed="false">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4V11A6 6 0 0 0 18 11V4"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
      </button>
    </div>
    <div data-xh-part="separator"></div>
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="copy" aria-label="复制">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="paste" aria-label="粘贴">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/></svg>
      </button>
    </div>
  </div>
</xh-toolbar>

<script type="module">
  for (const item of document.querySelectorAll("[data-format]")) {
    item.addEventListener("click", () => {
      item.setAttribute("aria-pressed", String(item.getAttribute("aria-pressed") !== "true"));
    });
  }
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="toolbar"`：**`root`** · `group` · **`item`** · `separator` · `overflow-trigger`

## 示例

### 分组

将相关操作收在一起

```vue
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToolbarRoot aria-label="编辑操作">
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarGroup>
      <XhToolbarItem value="undo" type="button">撤销</XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="redo" type="button">重做</XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar>
  <div data-xh-part="root" aria-label="编辑操作">
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="copy">复制</button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="cut">剪切</button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="paste">粘贴</button>
    </div>
    <div data-xh-part="separator"></div>
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="undo">撤销</button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="redo">重做</button>
    </div>
  </div>
</xh-toolbar>
```

### 垂直布局

按纵向排列工具

```vue
<script setup lang="ts">
import { MaximizeIcon, ZoomInIcon, ZoomOutIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToolbarRoot orientation="vertical" aria-label="画布缩放">
    <XhToolbarItem value="zoom-in" type="button"><XhIcon :icon="ZoomInIcon" />放大</XhToolbarItem>
    <XhToolbarItem value="zoom-out" type="button"><XhIcon :icon="ZoomOutIcon" />缩小</XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarItem value="fit" type="button"><XhIcon :icon="MaximizeIcon" />适应画布</XhToolbarItem>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar orientation="vertical">
  <div data-xh-part="root" aria-label="画布缩放">
    <button data-xh-part="item" type="button" value="zoom-in">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/><path d="M11 8V14M8 11H14"/></svg>
      放大
    </button>
    <button data-xh-part="item" type="button" value="zoom-out">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/><path d="M8 11H14"/></svg>
      缩小
    </button>
    <div data-xh-part="separator"></div>
    <button data-xh-part="item" type="button" value="fit">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3V8M16 3H21V8M8 21H3V16M16 21H21V16"/></svg>
      适应画布
    </button>
  </div>
</xh-toolbar>
```

### 附着工具面

为悬浮工具条提供完整表面

```vue
<script setup lang="ts">
import {
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhToolbarRoot variant="outline" aria-label="快捷操作">
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button">复制</XhToolbarItem>
      <XhToolbarItem value="cut" type="button">剪切</XhToolbarItem>
      <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarItem value="more" type="button">更多</XhToolbarItem>
  </XhToolbarRoot>
</template>
```

```html
<xh-toolbar variant="outline">
  <div data-xh-part="root" aria-label="快捷操作">
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="copy">复制</button>
      <button data-xh-part="item" type="button" value="cut">剪切</button>
      <button data-xh-part="item" type="button" value="paste">粘贴</button>
    </div>
    <div data-xh-part="separator"></div>
    <button data-xh-part="item" type="button" value="more">更多</button>
  </div>
</xh-toolbar>
```

### 收进更多菜单

放不下的操作按次序收进行尾的更多按钮

```vue
<script setup lang="ts">
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  UnderlineIcon,
} from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarOverflowTrigger,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
const aligns = [
  { value: "left", label: "左对齐", icon: AlignLeftIcon },
  { value: "center", label: "居中", icon: AlignCenterIcon },
  { value: "right", label: "右对齐", icon: AlignRightIcon },
];
const inserts = [
  { value: "link", label: "插入链接", icon: LinkIcon },
  { value: "image", label: "插入图片", icon: ImageIcon },
  { value: "quote", label: "引用", icon: QuoteIcon },
];
const pressed = ref(new Set(["bold"]));
const align = ref("left");

function toggle(value: string) {
  const next = new Set(pressed.value);
  next.has(value) ? next.delete(value) : next.add(value);
  pressed.value = next;
}
</script>

<template>
  <div style="max-inline-size: 280px">
    <XhToolbarRoot aria-label="文本编辑">
      <XhToolbarGroup>
        <XhToolbarItem
          v-for="format in formats"
          :key="format.value"
          :value="format.value"
          type="button"
          :aria-label="format.label"
          :aria-pressed="pressed.has(format.value)"
          @click="toggle(format.value)"
        >
          <XhIcon :icon="format.icon" />
        </XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarGroup>
        <XhToolbarItem
          v-for="item in aligns"
          :key="item.value"
          :value="item.value"
          type="button"
          :aria-label="item.label"
          :aria-pressed="align === item.value"
          @click="align = item.value"
        >
          <XhIcon :icon="item.icon" />
        </XhToolbarItem>
      </XhToolbarGroup>
      <XhToolbarSeparator />
      <XhToolbarItem
        v-for="item in inserts"
        :key="item.value"
        :value="item.value"
        type="button"
        :aria-label="item.label"
      >
        <XhIcon :icon="item.icon" />
      </XhToolbarItem>
      <XhToolbarOverflowTrigger />
    </XhToolbarRoot>
  </div>
</template>
```

```html
<div style="max-inline-size: 280px">
  <xh-toolbar>
    <div data-xh-part="root" aria-label="文本编辑">
      <div data-xh-part="group">
        <button data-format data-xh-part="item" type="button" value="bold" aria-label="加粗" aria-pressed="true">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V4h6a4 4 0 0 1 0 8H6"/><path d="M6 12h8a4 4 0 0 1 0 8H6"/></svg>
        </button>
        <button data-format data-xh-part="item" type="button" value="italic" aria-label="斜体" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5h9"/><path d="M5 19h9"/><path d="M15 5L9 19"/></svg>
        </button>
        <button data-format data-xh-part="item" type="button" value="underline" aria-label="下划线" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v6a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/></svg>
        </button>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="group">
        <button data-align data-xh-part="item" type="button" value="left" aria-label="左对齐" aria-pressed="true">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M4 9.5h11"/><path d="M4 14.5h16"/><path d="M4 19.5h11"/></svg>
        </button>
        <button data-align data-xh-part="item" type="button" value="center" aria-label="居中" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M6.5 9.5h11"/><path d="M4 14.5h16"/><path d="M6.5 19.5h11"/></svg>
        </button>
        <button data-align data-xh-part="item" type="button" value="right" aria-label="右对齐" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M9 9.5h11"/><path d="M4 14.5h16"/><path d="M9 19.5h11"/></svg>
        </button>
      </div>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="link" aria-label="插入链接">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 7.5H8a4.5 4.5 0 0 0 0 9h2"/><path d="M14 7.5h2a4.5 4.5 0 0 1 0 9h-2"/><path d="M8.5 12h7"/></svg>
      </button>
      <button data-xh-part="item" type="button" value="image" aria-label="插入图片">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15L16 10L5 21"/></svg>
      </button>
      <button data-xh-part="item" type="button" value="quote" aria-label="引用">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12H6a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 6 6h2.5A1.5 1.5 0 0 1 10 7.5V13c0 2.6-1.5 4.4-4 5"/><path d="M19.5 12h-4a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 15.5 6H18a1.5 1.5 0 0 1 1.5 1.5V13c0 2.6-1.5 4.4-4 5"/></svg>
      </button>
      <button data-xh-part="overflow-trigger"></button>
    </div>
  </xh-toolbar>
</div>

<script type="module">
  for (const item of document.querySelectorAll("[data-format]")) {
    item.addEventListener("click", () => {
      item.setAttribute("aria-pressed", String(item.getAttribute("aria-pressed") !== "true"));
    });
  }
  const aligns = document.querySelectorAll("[data-align]");
  for (const item of aligns) {
    item.addEventListener("click", () => {
      for (const other of aligns)
        other.setAttribute("aria-pressed", String(other === item));
    });
  }
</script>
```

## 设计指引

### 何时使用

- 文本编辑、表格操作或画布工具。
- 相关控件需要统一的方向键导航。

### 何时不用

- 只有少量独立操作时直接使用按钮。
- 操作必须连接成一个整体时使用[按钮组](./button-group)。

### 特性

- 默认 `ghost` 形态只组织控件，不绘制工具条外框。
- `outline` 形态提供带内距、描边与背景的附着式工具面；`subtle` 为淡底。
- `group` 将相关操作连接成连续分段，并以低对比度分隔线区分。
- 独立条目是接入 Action Control text 档的无描边工具按钮，组内条目使用中性操作面；`aria-pressed` 表示选中状态。
- 支持水平、垂直、分组、分隔线与整体禁用。
- 方向键在条目间移动，禁用项会被跳过。
- 放了 `overflow-trigger` 时不折行：宽度不够时，放不下的条目按次序收进行尾的「更多」按钮，点开是一张菜单，选中其中一项即触发该条目自己的点击；宽度够时「更多」按钮收起。容器变宽变窄、条目增减或改写后自动重新计算。

### 组合

- 使用 `group` 收紧相关操作。
- 使用 `separator` 区分操作组。
- 使用 `overflow-trigger` 放在 `root` 的最后，承接放不下的条目。菜单里的文字取条目的 `aria-label`（没有时取条目文字），写了 `aria-pressed` 的开关条目在菜单里显示为勾选项，工具条上的分组与分隔线在菜单里画成分隔线。不写内容时由皮肤画一枚横排三点，可及名缺省为 `More`，用 `translations.overflowTrigger` 换成本地文案。
- Web Components 只写一颗空的 `<button data-xh-part="overflow-trigger">`，菜单的浮层与条目由元素自己建。

### 最佳实践

- 仅图标条目必须提供 `aria-label`：它也是条目收进菜单后显示的文字。
- 使用 `aria-pressed` 表示可切换工具的当前状态。
- 常用的操作排在前面：收纳从尾部开始，排在最后的最先收进菜单。

### 反模式

- 不要在工具栏中放置文本输入控件。
- 不要将整页所有操作放入同一工具栏。
- 不要在放不下时让工具条横向滚动：用 `overflow-trigger` 收进菜单。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toolbar>` |
| Vue 组件 | `XhToolbarGroup` `XhToolbarItem` `XhToolbarOverflowTrigger` `XhToolbarRoot` `XhToolbarSeparator` |
| 组合式函数 | `useToolbar` |
| 状态机 | `toolbarMachine` |
| 皮肤 | `@xihan-ui/styles/toolbar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 主轴，默认 horizontal。它决定 root 的 aria-orientation、方向键接管哪一对键 （另一轴原样放行给页面），以及分隔线的朝向（恒与主轴垂直）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写水平主轴上左右方向键的语义。 |
| `loop` | `boolean` |  | 方向键到达末尾是否回绕，默认 true。 |
| `disabled` | `boolean` |  | 整条禁用：条目全部为 aria-disabled，方向键不再接管。 |
| `variant` | `ControlVariant` |  | 形态：ghost 只组织控件不画面（默认），outline 为附着式工具面，subtle 为淡底。默认 ghost。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，同时调整排布与默认条目尺寸。 |
| `translations` | `Partial<ToolbarTranslations>` |  | 读屏文案：「更多」钮的可及名，缺省 More。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToolbarRoot` | `default` | `ToolbarRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhToolbarItem` | `value` | `string` | 是 |  |
| `XhToolbarItem` | `disabled` | `boolean` |  |  |
| `XhToolbarItem` | `as` | `ElementType` |  | 条目渲染为哪个标签，默认 button；不自动补 type="button"，表单内需自行声明。 |
| `XhToolbarRoot` | `children` | `SlotChildren<ToolbarRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`ITEM.FOCUS` · `OVERFLOW_TRIGGER.FOCUS` · `TOOLBAR.BLUR` · `PRESS.START` · `PRESS.END` · `OVERFLOW.SELECT`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在工具条内、或停在「更多」钮上时为 null。 |
| `orientation` | `Orientation` | 生效的主轴。 |
| `separatorOrientation` | `Orientation` | 分隔线的朝向：恒与主轴垂直（横向工具条中的分隔线是竖线）。 |
| `disabled` | `boolean` |  |
| `overflowItems` | `readonly ToolbarOverflowItem[]` | 收进「更多」菜单的条目，文档序；全部放得下时为空数组。 |
| `getRootProps` | `() => T['element']` |  |
| `getGroupProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToolbarItemProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getOverflowTriggerProps` | `() => T['button']` | 行尾的「更多」钮，也是「更多」菜单的触发器：适配器按 asChild 的规则把菜单的开合接线合进来，解剖标记归工具条，工具条的处理器先跑。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | roving tabindex（恒开） | 整条只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投给第一个可停留条目 |
| `ArrowRight` / `ArrowDown` | 焦点在条内且未整条禁用；横排收 ArrowRight、竖排收 ArrowDown | 焦点移到下一个可停留条目（禁用项与收进菜单的条目跳过、放不下时「更多」钮排在最后、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | 焦点在条内且未整条禁用；横排收 ArrowLeft、竖排收 ArrowUp | 焦点移到上一个可停留条目（禁用项与收进菜单的条目跳过、尽头按 loop 回绕）；dir=rtl 时水平主轴改由 ArrowRight 承担 |
| `Home` | 焦点在条内且未整条禁用 | 焦点移到首个可停留条目 |
| `End` | 焦点在条内且未整条禁用 | 焦点移到末个可停留条目；放不下时是「更多」钮 |
| `Enter` / `Space` | held on item, 整条未禁用且条目未禁用 | 按住期间该条目投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或转禁用撤下。激活语义仍归条目自身（原生 button 的 click） |
| `Enter` / `Space` / `ArrowDown` / `ArrowUp` | 焦点在「更多」钮上；竖排工具条里上下键仍归工具条走位，只收 Enter 与 Space | 展开「更多」菜单：Enter / Space / ArrowDown 落到首项，ArrowUp 落到末项；菜单里选中一项即替收起的条目触发它自己的点击，菜单收起 |
| `Escape` | 「更多」菜单展开 | 收起菜单，焦点回到「更多」钮 |
| `交叉轴的两个方向键` | 焦点在条内（横排按上下、竖排按左右） | 不归工具条管：原样放行给页面滚动与读屏，绝不 preventDefault；落在菜单触发器（含「更多」钮）上时由触发器展开菜单 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-disabled` | 'true' \| 'false' |
| `root` | `aria-orientation` | props.orientation |
| `root` | `role` | 'toolbar' |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `separator` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `separator` | `role` | 'separator' |
| `overflow-trigger` | `aria-disabled` | 'true' \| 'false' |
| `overflow-trigger` | `aria-label` | resolveTranslations(TOOLBAR_EN_US, prop('translations… |

## 样式参考

### 皮肤

`@xihan-ui/styles/toolbar.css` 按 `[data-scope="toolbar"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-toolbar` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-orientation` | props.orientation |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'text' |
| `item` | `data-xh-action-size` | props.size |
| `item` | `data-xh-action-variant` | 'ghost' |
| `separator` | `data-orientation` | 'vertical' \| 'horizontal' |
| `overflow-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `overflow-trigger` | `data-xh-action-control` | '' |
| `overflow-trigger` | `data-xh-action-display` | 'always' |
| `overflow-trigger` | `data-xh-action-profile` | 'icon' |
| `overflow-trigger` | `data-xh-action-size` | props.size |
| `overflow-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toolbar-bg` | `root` | `background` | `default` | `--xh-_toolbar-root-bg` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-bg-disabled` | `root` | `background` | `disabled` | `--xh-_toolbar-root-bg-disabled` | toolbar 的 root 部件 background 覆盖槽。 |
| `--xh-toolbar-border` | `root` | `border` | `default` | `--xh-_toolbar-root-border` | toolbar 的 root 部件 border 覆盖槽。 |
| `--xh-toolbar-fg` | `root` | `color` | `default` | `--xh-fg-default` | toolbar 的 root 部件 color 覆盖槽。 |
| `--xh-toolbar-gap` | `root` | `gap` | `default` | `--xh-_toolbar-gap` | toolbar 的 root 部件 gap 覆盖槽。 |
| `--xh-toolbar-group-gap` | `group` | `gap` | `default` | `--xh-space-0` | toolbar 的 group 部件 gap 覆盖槽。 |
| `--xh-toolbar-icon-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | toolbar 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-toolbar-item-bg` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`not([aria-pressed='true'])`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest`<br>`--xh-bg-subtle` | toolbar 的 group、item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-disabled` | `group`<br>`item` | `--xh-ink-surface`<br>`background-color` | `disabled`<br>`xh-ink-surface` | `--xh-_action-variant-bg-disabled`<br>`--xh-bg-subtle` | toolbar 的 group、item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed` | `item` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-bg-brand-subtle` | toolbar 的 item 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed-active` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-brand-subtle-active` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-bg-pressed-hover` | `item` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-brand-subtle-hover` | toolbar 的 item 部件 background-color 覆盖槽。 |
| `--xh-toolbar-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | toolbar 的 item 部件 color 覆盖槽。 |
| `--xh-toolbar-item-fg-pressed` | `item` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-on-brand-subtle` | toolbar 的 item 部件 color 覆盖槽。 |
| `--xh-toolbar-item-font-size` | `item` | `font-size` | `default` | `--xh-_action-profile-font-size` | toolbar 的 item 部件 font-size 覆盖槽。 |
| `--xh-toolbar-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | toolbar 的 item 部件 font-weight 覆盖槽。 |
| `--xh-toolbar-item-gap` | `item` | `gap` | `default` | `--xh-control-gap-sm` | toolbar 的 item 部件 gap 覆盖槽。 |
| `--xh-toolbar-item-h` | `item` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | toolbar 的 item 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toolbar-item-px` | `item` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | toolbar 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-toolbar-item-radius` | `group`<br>`item` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-of-type`<br>`last-of-type`<br>`not(:has(~ [data-scope='toolbar'][data-part='item']:not([hidden])`<br>`not([hidden])`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-_action-profile-radius`<br>`--xh-shape-control` | toolbar 的 group、item 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-toolbar-px` | `root` | `padding-inline` | `default` | `--xh-_toolbar-root-p` | toolbar 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toolbar-py` | `root` | `padding-block` | `default` | `--xh-_toolbar-root-p` | toolbar 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toolbar-radius` | `root` | `border-radius` | `default`<br>`variant=outline` | `--xh-shape-surface` | toolbar 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-color` | `group`<br>`separator` | `background` | `default` | `--xh-border-default`<br>`--xh-fg-default` | toolbar 的 group、separator 部件 background 覆盖槽。 |
| `--xh-toolbar-separator-gap` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-inset` | `separator` | `margin-block`<br>`margin-inline` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-0` | toolbar 的 separator 部件 margin-block、margin-inline 覆盖槽。 |
| `--xh-toolbar-separator-opacity` | `group`<br>`separator` | `opacity` | `default` | `--xh-control-separator-opacity` | toolbar 的 group、separator 部件 opacity 覆盖槽。 |
| `--xh-toolbar-separator-radius` | `separator` | `border-radius` | `default` | `--xh-shape-pill` | toolbar 的 separator 部件 border-radius 覆盖槽。 |
| `--xh-toolbar-separator-thickness` | `group`<br>`separator` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thin` | toolbar 的 group、separator 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
| `--xh-toolbar-shadow` | `root` | `box-shadow` | `variant=outline` | `none` | toolbar 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`background-color` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
