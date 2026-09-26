来源：https://ui.docs.xihanfun.com/components/tag

# Tag 标签

表示一个对象是什么：一个分类、一项技能、一个筛选条件。它承载实体身份，可以被移除。标签表达“它是什么”，不表达“发生了什么”；后者由[徽标](./badge)承担。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tag" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tag.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tag" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tag" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tag.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一个标签就是 root 加一段 label 文字；不写 closable 就没有关闭按钮

```vue
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const topics = ["前端", "无头内核", "可访问性"];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot v-for="topic in topics" :key="topic">
      <XhTagLabel>{{ topic }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">前端</span>
    </span>
  </xh-tag>

  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">无头内核</span>
    </span>
  </xh-tag>

  <xh-tag>
    <span data-xh-part="root">
      <span data-xh-part="label">可访问性</span>
    </span>
  </xh-tag>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="tag"`：**`root`** · `label` · `close-trigger`

## 示例

### 变体

variant 决定颜色的使用方式：实心填底、淡色填底、只描边

```vue
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot v-for="v in variants" :key="v" :variant="v" tone="brand">
      <XhTagLabel>{{ v }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="solid" tone="brand">
    <span data-xh-part="root">
      <span data-xh-part="label">solid</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand">
    <span data-xh-part="root">
      <span data-xh-part="label">subtle</span>
    </span>
  </xh-tag>

  <xh-tag variant="outline" tone="brand">
    <span data-xh-part="root">
      <span data-xh-part="label">outline</span>
    </span>
  </xh-tag>
</div>
```

### 颜色

tone 决定使用哪族颜色；语气只更换色相，形态与尺寸不受影响

```vue
<script setup lang="ts">
import { XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot
      v-for="tone in tones"
      :key="tone.value"
      variant="subtle"
      :tone="tone.value"
    >
      <XhTagLabel>{{ tone.label }}</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="subtle" tone="brand">
    <span data-xh-part="root">
      <span data-xh-part="label">品牌</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="neutral">
    <span data-xh-part="root">
      <span data-xh-part="label">中性</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="success">
    <span data-xh-part="root">
      <span data-xh-part="label">成功</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="warning">
    <span data-xh-part="root">
      <span data-xh-part="label">警告</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="danger">
    <span data-xh-part="root">
      <span data-xh-part="label">危险</span>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="info">
    <span data-xh-part="root">
      <span data-xh-part="label">信息</span>
    </span>
  </xh-tag>
</div>
```

### 可关闭

closable 提供关闭按钮；open 受控时去留由宿主决定，可访问名逐个带上标签文字，移除一个后焦点交给下一个

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/vue";
import { nextTick, ref } from "vue";

const all = ["设计", "前端", "无头内核", "可访问性"];
const tags = ref([...all]);
const listEl = ref<HTMLElement | null>(null);

async function remove(tag: string) {
  const index = tags.value.indexOf(tag);
  tags.value = tags.value.filter(t => t !== tag);
  await nextTick();

  // 被摘掉的那一枚带着焦点一起消失，接不住就掉回页面开头：
  // 交给顶上来的那一枚的关闭钮，摘的是最后一枚就交给剩下的最后一枚，一枚不剩交给"还原"钮
  const closes = listEl.value
    ? [
        ...listEl.value.querySelectorAll<HTMLElement>(
          "[data-part=\"close-trigger\"]",
        ),
      ]
    : [];
  const next = closes[Math.min(index, closes.length - 1)];
  const reset = listEl.value?.querySelector<HTMLElement>(
    "[data-scope=\"button\"]",
  );
  (next ?? reset)?.focus();
}
</script>

<template>
  <div
    ref="listEl"
    style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px"
  >
    <XhTagRoot
      v-for="tag in tags"
      :key="tag"
      variant="subtle"
      tone="brand"
      closable
      :open="true"
      :translations="{ close: `移除 ${tag}` }"
      @open-change="remove(tag)"
    >
      <XhTagLabel>{{ tag }}</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <span v-if="!tags.length" style="font-size: 13px">已全部移除</span>

    <XhButton
      v-if="tags.length < all.length"
      size="sm"
      variant="ghost"
      @click="tags = [...all]"
    >
      还原
    </XhButton>
  </div>
</template>
```

```html
<div
  id="tag-closable"
  style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px"
>
  <xh-tag variant="subtle" tone="brand" closable open>
    <span data-xh-part="root">
      <span data-xh-part="label">设计</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable open>
    <span data-xh-part="root">
      <span data-xh-part="label">前端</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable open>
    <span data-xh-part="root">
      <span data-xh-part="label">无头内核</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable open>
    <span data-xh-part="root">
      <span data-xh-part="label">可访问性</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-button id="tag-closable-reset" size="sm" variant="ghost" style="display: none">
    <button data-xh-part="root">还原</button>
  </xh-button>
</div>

<script type="module">
  // open 受控：标签不自己收起，收起意图经事件回来，由宿主把这一枚摘掉
  const scope = document.getElementById("tag-closable");
  const reset = document.getElementById("tag-closable-reset");
  const tags = [...scope.querySelectorAll("xh-tag")];

  // 关闭钮里只有一个叉，逐枚把标签文字写进可访问名
  for (const tag of tags) {
    const text = tag.querySelector('[data-xh-part="label"]').textContent;
    tag.translations = { close: `移除 ${text}` };
  }

  scope.addEventListener("open-change", (event) => {
    const removed = event.target;
    const index = tags.indexOf(removed);
    removed.style.display = "none";
    reset.style.display = "";

    // 被摘掉的那一枚带着焦点一起消失，接不住就掉回页面开头：
    // 交给它后面第一枚还在的标签，后面没有了就交给剩下的最后一枚，一枚不剩交给"还原"钮
    const rest = tags.filter((tag) => tag.style.display !== "none");
    const following = rest.find((tag) => tags.indexOf(tag) > index);
    const target = following ?? rest[rest.length - 1];
    const button =
      target?.querySelector('[data-xh-part="close-trigger"]') ??
      reset.querySelector("button");
    button?.focus();
  });

  reset.addEventListener("click", () => {
    for (const tag of tags) tag.style.display = "";
    reset.style.display = "none";
  });
</script>
```

### 禁用

disabled 使标签留在原地但不可移除：关闭按钮仍占据位置，标签宽度不因禁用跳变

```vue
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot variant="subtle" tone="brand" closable>
      <XhTagLabel>可摘掉</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable disabled>
      <XhTagLabel>锁定的分类</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="outline" disabled>
      <XhTagLabel>只读</XhTagLabel>
    </XhTagRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="subtle" tone="brand" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">可摘掉</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable disabled>
    <span data-xh-part="root">
      <span data-xh-part="label">锁定的分类</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="outline" disabled>
    <span data-xh-part="root">
      <span data-xh-part="label">只读</span>
    </span>
  </xh-tag>
</div>
```

### 尺寸

size 改变内边距、间距、字号与行框，不写即默认档；同一档有无关闭按钮高度相同，关闭按钮三档同一个尺寸

```vue
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <template v-for="item in sizes" :key="item.label">
      <XhTagRoot variant="subtle" :size="item.size">
        <XhTagLabel>{{ item.label }}</XhTagLabel>
      </XhTagRoot>
      <XhTagRoot variant="subtle" :size="item.size" closable>
        <XhTagLabel>{{ item.label }}</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
    </template>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="subtle" size="sm">
    <span data-xh-part="root">
      <span data-xh-part="label">小</span>
    </span>
  </xh-tag>
  <xh-tag variant="subtle" size="sm" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">小</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle">
    <span data-xh-part="root">
      <span data-xh-part="label">缺省</span>
    </span>
  </xh-tag>
  <xh-tag variant="subtle" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">缺省</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" size="lg">
    <span data-xh-part="root">
      <span data-xh-part="label">大</span>
    </span>
  </xh-tag>
  <xh-tag variant="subtle" size="lg" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">大</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>
</div>
```

### 只读

readOnly 只锁定关闭按钮：按钮留在原地但不可按下，标签本身不置灰；与 disabled 的区别只在标签本体的颜色

```vue
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhTagRoot variant="subtle" tone="brand" closable>
      <XhTagLabel>可摘掉</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable read-only>
      <XhTagLabel>只读</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

    <XhTagRoot variant="subtle" tone="brand" closable disabled>
      <XhTagLabel>禁用</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
  <xh-tag variant="subtle" tone="brand" closable>
    <span data-xh-part="root">
      <span data-xh-part="label">可摘掉</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable read-only>
    <span data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>

  <xh-tag variant="subtle" tone="brand" closable disabled>
    <span data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <button data-xh-part="close-trigger"></button>
    </span>
  </xh-tag>
</div>
```

## 设计指引

### 何时使用

- 一条记录关联的若干分类、技能、关键词。
- 已生效的筛选条件，用户可以逐条移除。
- 需要用户看清对象身份并能移除的任何短文本。

### 何时不用

- 提醒用户注意某个对象（未读数、小圆点、在线状态）时，使用[徽标](./badge)，它附着在其他元素上、不接受交互。
- 用户需要在几个互斥选项中选一个时，使用[单选组](./radio-group)或[切换按钮组](./toggle-group)。
- 用户需要自行输入并累积多个值时，使用[标签输入](./tags-input)，它自带输入框与增删逻辑。
- 整条页面级提示使用[警告提示](./alert)。

### 特性

- 形态、语气、尺寸三轴与其他组件同源。四种形态是 solid / subtle / outline / ghost：默认与 subtle 使用 M1 compact surface，solid 强调身份，outline 只保留轮廓，ghost 完全融入父表面。语气挂在显式形态之下；不写 `variant` 时保持中性 M1。尺寸档走间距、字号与行框，不占控件行高；同档标签有无关闭按钮高度一致，默认档放进默认档控件的行高内不撑高。默认档（26px）高于 14px 正文行（21px）：随文排版、紧凑表格的状态列、下拉候选中的标签写 `size="sm"`（22px）。
- `closable` 显示关闭按钮，显隐可受控（`open` / `defaultOpen` / `open-change`）。关闭按钮保持 16px 视觉盒，透明命中层扩到随文动作的 24px；不为命中面积撑高标签。
- `disabled` 让标签留在原地但不可移除，宽度不因禁用而变化。
- `readOnly` 只锁定关闭按钮：按钮留在原地但不可用，标签本身不置灰；宿主整体只读时逐个传下即可。
- Vue 侧默认插槽内只有文字时自动包一层 `label`，截断规则直接生效。

### 组合

- 一排标签使用[弹性布局](./flex)排列。
- 标签内的图元使用[图标](./icon)。
- 文字过长时配合[文本截断](./truncate)，或直接由皮肤截断。

### 最佳实践

- 关闭按钮的可访问名称带上标签文字：默认只读 Delete，一屏十个标签听起来完全相同。逐实例传 `translations.close`，写成“移除 前端”。
- 移除一个标签之后安置焦点：标签成排出现，被移除的标签带着焦点一起消失，焦点会回到页面开头，键盘与读屏用户每移除一次就丢失一次位置。交给顶上来的标签的关闭按钮，没有剩余标签时交给列表容器或“还原”按钮。组件不替宿主决定去留，因此只能由宿主处理。
- 移除标签之后提供回退路径，否则用户误点后无法恢复。
- 标签文字尽量短：它是身份标记，不是句子。

### 反模式

- 自定义元素中把文字直接写在 `root` 上：文字过长时会把关闭按钮挤出，应写进 `data-xh-part="label"`。
- 把标签当按钮使用：整块可点却没有按钮语义，键盘用户无法激活。
- 一屏铺满高饱和度的实心标签，强调失去意义。
- 只用颜色表达含义：色觉障碍的用户无法分辨，文字本身要说明。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tag>` |
| Vue 组件 | `XhTagCloseTrigger` `XhTagLabel` `XhTagRoot` |
| 组合式函数 | `useTag` |
| 状态机 | `tagMachine` |
| 皮肤 | `@xihan-ui/styles/tag.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `TagVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色的使用方式。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `closable` | `boolean` |  | 是否提供关闭按钮，默认 false。false 时该按钮同时被禁用与收起。 |
| `disabled` | `boolean` |  | 标签禁用：关闭按钮不可用，点击不改变显隐。 |
| `readOnly` | `boolean` |  | 只读：关闭按钮保留位置但不可按下，标签本身不置灰。 |
| `open` | `boolean` |  | 受控显隐；未提供该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: TagOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `translations` | `Partial<TagTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TagOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSED` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `closable` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上，且 closable 且未禁用、非只读 | 收起标签并通知 open=false；关闭按钮是原生 button，这两个键由平台转换为 click |
| `Enter` / `Space` | held in close-trigger, closable 且未禁用、非只读 | 按住期间关闭按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，按住途中转入禁用 / 只读、收回关闭按钮或标签收起也撤下。root 由把标签当条目用的宿主（tag-group）接同一条通道 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/tag.css` 使用 `[data-scope="tag"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-ink-surface` | ''（条件成立时才出现） |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tag-bg` | `root` | `--xh-ink-surface`<br>`background` | `default`<br>`tone`<br>`variant=solid`<br>`variant=subtle`<br>`xh-ink-surface` | `--xh-_tone`<br>`--xh-_tone-subtle`<br>`--xh-bg-brand`<br>`--xh-material-soft-bg` | tag 的 root 部件 --xh-ink-surface、background 覆盖槽。 |
| `--xh-tag-bg-disabled` | `root` | `--xh-ink-surface`<br>`background` | `disabled`<br>`tone`<br>`xh-ink-surface` | `--xh-bg-muted`<br>`--xh-bg-muted-opaque` | tag 的 root 部件 --xh-ink-surface、background 覆盖槽。 |
| `--xh-tag-border` | `root` | `border`<br>`border-color` | `default`<br>`tone`<br>`variant=outline`<br>`variant=subtle` | `--xh-_tone-border-control`<br>`--xh-border-default`<br>`--xh-material-soft-border` | tag 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-tag-border-disabled` | `root` | `border-color` | `disabled`<br>`tone` | `--xh-border-default` | tag 的 root 部件 border-color 覆盖槽。 |
| `--xh-tag-close-bg-active` | `close-trigger` | `background` | `is(:active, [data-pressed])`<br>`not(:disabled)`<br>`pressed` | `color-mix(in oklab, currentColor 22%, transparent)` | tag 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-tag-close-bg-hover` | `close-trigger` | `background` | `hover`<br>`not(:disabled)` | `color-mix(in oklab, currentColor 14%, transparent)` | tag 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-tag-close-fg` | `close-trigger` | `color` | `default` | `currentColor` | tag 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-tag-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-inset` | tag 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tag-close-size` | `close-trigger` | `block-size`<br>`inline-size`<br>`inset` | `default` | `--xh-control-indicator-size` | tag 的 close-trigger 部件 block-size、inline-size、inset 覆盖槽。 |
| `--xh-tag-fg` | `root` | `color` | `default`<br>`tone`<br>`variant=ghost`<br>`variant=outline`<br>`variant=solid`<br>`variant=subtle` | `--xh-_tone-fg`<br>`--xh-_tone-on`<br>`--xh-fg-default`<br>`--xh-fg-on-brand`<br>`--xh-material-soft-fg` | tag 的 root 部件 color 覆盖槽。 |
| `--xh-tag-font-size` | `root` | `font-size` | `default` | `--xh-_tag-font-size` | tag 的 root 部件 font-size 覆盖槽。 |
| `--xh-tag-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | tag 的 root 部件 font-weight 覆盖槽。 |
| `--xh-tag-gap` | `root` | `gap` | `default` | `--xh-_tag-gap` | tag 的 root 部件 gap 覆盖槽。 |
| `--xh-tag-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | tag 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tag-px` | `root` | `padding-inline` | `default` | `--xh-_tag-px` | tag 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-tag-py` | `root` | `padding-block` | `default` | `--xh-_tag-py` | tag 的 root 部件 padding-block 覆盖槽。 |
| `--xh-tag-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | tag 的 root 部件 border-radius 覆盖槽。 |
| `--xh-tag-shadow` | `root` | `box-shadow` | `default`<br>`variant=solid` | `--xh-_tag-highlight`<br>`--xh-material-soft-shadow` | tag 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`background-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
