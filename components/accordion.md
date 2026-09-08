来源：https://ui.docs.xihanfun.com/components/accordion

# 手风琴 `accordion`

一列可展开的区块，标题常驻、内容按需展开。

## 何时使用

- 常见问题、设置分组这类"标题足以判断要不要看"的内容。
- 内容很长，一次全铺开会让页面失去结构。

## 何时不用

- 只有一块内容：用[折叠区域](./collapsible)。
- 各块内容需要对照着看：直接铺开。
- 各块是并列视图、同时只看一个：用[标签页](./tabs)。

## 特性

- `multiple` 决定能不能同时展开多项，`collapsible` 决定能不能全部收起。
- 指示器可以放前也可以放后，图形自定。
- 可以嵌套；触发区大小由作者决定。

## 示例

### 基础用法

默认单开：展开一项即收起其余，defaultValue 只给初始值，之后由组件自己维护

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  {
    value: "install",
    label: "怎么安装",
    content: "装 @xihan-ui/vue 与 @xihan-ui/styles 两个包，皮肤单独引一次。",
  },
  {
    value: "theme",
    label: "怎么换皮肤",
    content: "皮肤只认 data-part 与 data-state，覆写同名令牌即可。",
  },
  {
    value: "a11y",
    label: "键盘怎么走",
    content: "方向键只在标题之间搬焦点，永不进内容区，首尾不回绕。",
  },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :collection="items" :default-value="['install']" />
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-basic">
    <div data-xh-part="root">
      <div data-xh-part="item" value="install">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>怎么安装</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          装 @xihan-ui/web-components 与 @xihan-ui/styles 两个包，皮肤单独引一次。
        </div>
      </div>
      <div data-xh-part="item" value="theme">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>怎么换皮肤</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          皮肤只认 data-part 与 data-state，覆写同名令牌即可。
        </div>
      </div>
      <div data-xh-part="item" value="a11y">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>键盘怎么走</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          方向键只在标题之间搬焦点，永不进内容区，首尾不回绕。
        </div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-basic");
  accordion.value = ["install"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 多项展开

multiple 允许多项并存，展开集合恒为 string[]，受控绑定即可拿到它

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "basic", label: "基础属性", content: "value、defaultValue、multiple。" },
  {
    value: "size",
    label: "排版",
    content: "orientation 决定方向键走哪条轴，默认 vertical。",
  },
  {
    value: "events",
    label: "事件",
    content: "value-change 携带 { value }，update:value 携带裸数组。",
  },
];

const panels = ref<string[]>(["basic", "size"]);
</script>

<template>
  <div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
    <XhAccordionRoot v-model:value="panels" :collection="items" multiple />
    <span>展开：{{ panels.length ? panels.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-accordion id="accordion-multiple" multiple>
    <div data-xh-part="root">
      <div data-xh-part="item" value="basic">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>基础属性</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">value、defaultValue、multiple。</div>
      </div>
      <div data-xh-part="item" value="size">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>排版</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          orientation 决定方向键走哪条轴，默认 vertical。
        </div>
      </div>
      <div data-xh-part="item" value="events">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>事件</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">value-change 携带 { value }。</div>
      </div>
    </div>
  </xh-accordion>
  <span>展开：<span id="accordion-multiple-value">basic、size</span></span>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回、再回显
  const accordion = document.getElementById("accordion-multiple");
  const readout = document.getElementById("accordion-multiple-value");
  accordion.value = ["basic", "size"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 允许全收

单开模式下最后一项默认收不起来，加 collapsible 才能把它也收上

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  {
    value: "one",
    label: "再点一次就收起",
    content: "点当前展开项的标题，它会收起，展开集合变成空数组。",
  },
  {
    value: "two",
    label: "另一项",
    content: "展开它会把上一项挤掉，单开模式一次只留一项。",
  },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :collection="items" :default-value="['one']" collapsible />
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-collapsible" collapsible>
    <div data-xh-part="root">
      <div data-xh-part="item" value="one">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>再点一次就收起</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          点当前展开项的标题，它会收起，展开集合变成空数组。
        </div>
      </div>
      <div data-xh-part="item" value="two">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>另一项</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          展开它会把上一项挤掉，单开模式一次只留一项。
        </div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-collapsible");
  accordion.value = ["one"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 指示器与禁用

indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const items = [
  {
    value: "ready",
    label: "已发布",
    content: "标题右侧那个箭头就是 indicator，展开时自动翻转。",
  },
  {
    value: "draft",
    label: "草稿（禁用）",
    content: "这一项展不开。",
    disabled: true,
  },
  {
    value: "archived",
    label: "已归档",
    content: "从第一项按方向键，会直接跳到这里。",
  },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :collection="items" :default-value="['ready']" />
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-indicator">
    <div data-xh-part="root">
      <div data-xh-part="item" value="ready">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>已发布</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          标题右侧那个箭头就是 indicator，展开时自动翻转。
        </div>
      </div>
      <!-- 禁用写在条目节点上，条目内的部件跟着它走 -->
      <div data-xh-part="item" value="draft" aria-disabled="true">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>草稿（禁用）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">这一项展不开。</div>
      </div>
      <div data-xh-part="item" value="archived">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>已归档</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">从第一项按方向键，会直接跳到这里。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-indicator");
  accordion.value = ["ready"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 语气

tone 落在展开态的标题上，六种语气各预置一项展开做对照

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
].map(tone => ({
  ...tone,
  panels: [
    {
      value: "open",
      label: `${tone.label}（展开）`,
      content: `tone="${tone.value}"`,
    },
    {
      value: "closed",
      label: `${tone.label}（收起）`,
      content: "收起态的标题不吃语气色。",
    },
  ],
}));
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    "
  >
    <XhAccordionRoot
      v-for="tone in tones"
      :key="tone.value"
      :tone="tone.value"
      :collection="tone.panels"
      :default-value="['open']"
    />
  </div>
</template>
```

```html
<div
  id="accordion-tones"
  style="
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  "
>
  <xh-accordion tone="brand">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>品牌（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="brand"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>品牌（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="neutral">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>中性（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="neutral"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>中性（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="success">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>成功（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="success"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>成功（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>警告（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="warning"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>警告（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="danger">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>危险（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="danger"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>危险（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="info">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>信息（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="info"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>信息（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：逐组设初值、每次变更写回
  const grid = document.getElementById("accordion-tones");
  for (const accordion of grid.querySelectorAll("xh-accordion")) {
    accordion.value = ["open"];
    accordion.addEventListener("value-change", (event) => {
      accordion.value = event.detail.value;
    });
  }
</script>
```

### 尺寸

size 换的是标题栏的高度、内边距与字号，三档并排对照

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const another = {
  value: "b",
  label: "另一项",
  content: "同一档内所有标题一致。",
};

// 中间一档不写 size，用 undefined 表达
const groups = [
  {
    size: "sm",
    key: "sm",
    panels: [
      { value: "a", label: "小号 sm", content: "标题栏最矮，字号也最小。" },
      another,
    ],
  },
  {
    size: undefined,
    key: "md",
    panels: [
      { value: "a", label: "缺省档", content: "不写 size 就是这一档。" },
      another,
    ],
  },
  {
    size: "lg",
    key: "lg",
    panels: [
      { value: "a", label: "大号 lg", content: "标题栏最高，字号也最大。" },
      another,
    ],
  },
];
</script>

<template>
  <div
    style="
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      align-items: start;
    "
  >
    <XhAccordionRoot
      v-for="group in groups"
      :key="group.key"
      :size="group.size"
      :collection="group.panels"
      :default-value="['a']"
    />
  </div>
</template>
```

```html
<div
  id="accordion-sizes"
  style="
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    align-items: start;
  "
>
  <xh-accordion size="sm">
    <div data-xh-part="root">
      <div data-xh-part="item" value="a">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>小号 sm</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">标题栏最矮，字号也最小。</div>
      </div>
      <div data-xh-part="item" value="b">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>另一项</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">同一档内所有标题一致。</div>
      </div>
    </div>
  </xh-accordion>

  <!-- 中间一档不写 size -->
  <xh-accordion>
    <div data-xh-part="root">
      <div data-xh-part="item" value="a">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>缺省档</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">不写 size 就是这一档。</div>
      </div>
      <div data-xh-part="item" value="b">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>另一项</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">同一档内所有标题一致。</div>
      </div>
    </div>
  </xh-accordion>

  <xh-accordion size="lg">
    <div data-xh-part="root">
      <div data-xh-part="item" value="a">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>大号 lg</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">标题栏最高，字号也最大。</div>
      </div>
      <div data-xh-part="item" value="b">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>另一项</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">同一档内所有标题一致。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：逐组设初值、每次变更写回
  const grid = document.getElementById("accordion-sizes");
  for (const accordion of grid.querySelectorAll("xh-accordion")) {
    accordion.value = ["a"];
    accordion.addEventListener("value-change", (event) => {
      accordion.value = event.detail.value;
    });
  }
</script>
```

### 嵌套

content 里再放一组手风琴，内外两组各自维护展开集合，方向键也各管各的

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['shipping']">
      <XhAccordionItem value="shipping">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>配送</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>
          <!-- 内层是另一组独立的手风琴：展开集合、单开与否都自己说了算 -->
          <XhAccordionRoot :default-value="['express']" multiple>
            <XhAccordionItem value="express">
              <XhAccordionHeader>
                <XhAccordionTrigger>
                  <span>快递</span>
                  <XhAccordionIndicator />
                </XhAccordionTrigger>
              </XhAccordionHeader>
              <XhAccordionContent>次日达，节假日照常发货。</XhAccordionContent>
            </XhAccordionItem>
            <XhAccordionItem value="pickup">
              <XhAccordionHeader>
                <XhAccordionTrigger>
                  <span>自提</span>
                  <XhAccordionIndicator />
                </XhAccordionTrigger>
              </XhAccordionHeader>
              <XhAccordionContent>下单后到门店凭码取货。</XhAccordionContent>
            </XhAccordionItem>
          </XhAccordionRoot>
        </XhAccordionContent>
      </XhAccordionItem>

      <XhAccordionItem value="refund">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>退换</span>
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>签收七日内可退，运费到付。</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-outer">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <!-- 内层是另一组独立的手风琴：展开集合、单开与否都自己说了算 -->
          <xh-accordion id="accordion-inner" multiple>
            <div data-xh-part="root">
              <div data-xh-part="item" value="express">
                <h3 data-xh-part="header">
                  <button data-xh-part="trigger">
                    <span>快递</span>
                    <span data-xh-part="indicator"></span>
                  </button>
                </h3>
                <div data-xh-part="content">次日达，节假日照常发货。</div>
              </div>
              <div data-xh-part="item" value="pickup">
                <h3 data-xh-part="header">
                  <button data-xh-part="trigger">
                    <span>自提</span>
                    <span data-xh-part="indicator"></span>
                  </button>
                </h3>
                <div data-xh-part="content">下单后到门店凭码取货。</div>
              </div>
            </div>
          </xh-accordion>
        </div>
      </div>

      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收七日内可退，运费到付。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：内外两组各设各的初值、各写各的回
  const outer = document.getElementById("accordion-outer");
  const inner = document.getElementById("accordion-inner");
  outer.value = ["shipping"];
  inner.value = ["express"];
  // 内层的事件会冒泡上来，只认自己派的那份
  outer.addEventListener("value-change", (event) => {
    if (event.target === outer) outer.value = event.detail.value;
  });
  inner.addEventListener("value-change", (event) => {
    inner.value = event.detail.value;
  });
</script>
```

### 标题栏附加信息

标题栏里的节点全归作者，把计数与指示器包成一组排在末尾

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const groups = [
  { value: "todo", label: "待处理", extra: "3 项", body: "还没有人认领。" },
  { value: "doing", label: "进行中", extra: "1 项", body: "预计今天完成。" },
  { value: "done", label: "已完成", extra: "12 项", body: "本周已归档。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['todo']">
      <XhAccordionItem v-for="g in groups" :key="g.value" :value="g.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ g.label }}</span>
            <!-- 附加信息与指示器同属末尾这一组，标题栏两端对齐照旧生效 -->
            <span style="display: flex; align-items: center; gap: 8px; font-size: 12px">
              <span>{{ g.extra }}</span>
              <XhAccordionIndicator />
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ g.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-header-extra">
    <div data-xh-part="root">
      <div data-xh-part="item" value="todo">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>待处理</span>
            <!-- 附加信息与指示器同属末尾这一组，标题栏两端对齐照旧生效 -->
            <span
              style="display: flex; align-items: center; gap: 8px; font-size: 12px"
            >
              <span>3 项</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">还没有人认领。</div>
      </div>
      <div data-xh-part="item" value="doing">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>进行中</span>
            <span
              style="display: flex; align-items: center; gap: 8px; font-size: 12px"
            >
              <span>1 项</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">预计今天完成。</div>
      </div>
      <div data-xh-part="item" value="done">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>已完成</span>
            <span
              style="display: flex; align-items: center; gap: 8px; font-size: 12px"
            >
              <span>12 项</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">本周已归档。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-header-extra");
  accordion.value = ["todo"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 指示器在前

指示器写在标题之前就落到起始缘，标题拿 auto 外边距吃掉余量

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "one", label: "第一章", body: "指示器在标题左边，展开时照样翻转。" },
  { value: "two", label: "第二章", body: "部件的先后顺序就是它们在标题栏里的顺序。" },
  { value: "three", label: "第三章", body: "标题吃掉余量，右侧留白。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['one']">
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <XhAccordionIndicator />
            <span style="margin-inline-end: auto">{{ item.label }}</span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-indicator-start">
    <div data-xh-part="root">
      <div data-xh-part="item" value="one">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第一章</span>
          </button>
        </h3>
        <div data-xh-part="content">指示器在标题左边，展开时照样翻转。</div>
      </div>
      <div data-xh-part="item" value="two">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第二章</span>
          </button>
        </h3>
        <div data-xh-part="content">部件的先后顺序就是它们在标题栏里的顺序。</div>
      </div>
      <div data-xh-part="item" value="three">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第三章</span>
          </button>
        </h3>
        <div data-xh-part="content">标题吃掉余量，右侧留白。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-indicator-start");
  accordion.value = ["one"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 缩小触发区域

trigger 只包住指示器，标题文字留在 header 里，点标题不再展开

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionIndicator,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "profile", label: "账户资料", body: "只有右边那个按钮能展开这一段。" },
  { value: "billing", label: "账单信息", body: "标题文字不在按钮里，点它没有反应。" },
];
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot :default-value="['profile']">
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <!-- 标题栏自己排布：文字是普通节点，按钮只占末尾一小格 -->
        <XhAccordionHeader
          style="display: flex; align-items: center; gap: 8px; padding-inline-start: 12px"
        >
          <span style="flex: 1">{{ item.label }}</span>
          <XhAccordionTrigger
            style="inline-size: auto"
            :aria-label="`展开${item.label}`"
          >
            <XhAccordionIndicator />
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-trigger-area">
    <div data-xh-part="root">
      <div data-xh-part="item" value="profile">
        <!-- 标题栏自己排布：文字是普通节点，按钮只占末尾一小格 -->
        <h3
          data-xh-part="header"
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding-inline-start: 12px;
          "
        >
          <span style="flex: 1">账户资料</span>
          <button
            data-xh-part="trigger"
            style="inline-size: auto"
            aria-label="展开账户资料"
          >
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">只有右边那个按钮能展开这一段。</div>
      </div>
      <div data-xh-part="item" value="billing">
        <h3
          data-xh-part="header"
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding-inline-start: 12px;
          "
        >
          <span style="flex: 1">账单信息</span>
          <button
            data-xh-part="trigger"
            style="inline-size: auto"
            aria-label="展开账单信息"
          >
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">标题文字不在按钮里，点它没有反应。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-trigger-area");
  accordion.value = ["profile"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
</script>
```

### 自定义展开图标

indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画

```vue
<script setup lang="ts">
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "shipping", label: "配送方式", body: "同城次日达，跨省三日达。" },
  { value: "invoice", label: "发票", body: "支持电子普票与专票。" },
  { value: "refund", label: "退换货", body: "签收七日内无理由退换。" },
];

const panels = ref<string[]>(["shipping"]);
</script>

<template>
  <div style="width: 100%; max-width: 420px">
    <XhAccordionRoot v-model:value="panels" multiple>
      <XhAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <XhAccordionHeader>
          <XhAccordionTrigger>
            <span>{{ item.label }}</span>
            <!-- 标记按这一项在不在展开集合里换字形 -->
            <span style="font-size: 12px; color: var(--xh-fg-muted)">
              {{ panels.includes(item.value) ? "－" : "＋" }}
            </span>
          </XhAccordionTrigger>
        </XhAccordionHeader>
        <XhAccordionContent>{{ item.body }}</XhAccordionContent>
      </XhAccordionItem>
    </XhAccordionRoot>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-custom-icon" multiple>
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">同城次日达，跨省三日达。</div>
      </div>
      <div data-xh-part="item" value="invoice">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>发票</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">支持电子普票与专票。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换货</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">签收七日内无理由退换。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 标记按这一项在不在展开集合里换字形
  const accordion = document.getElementById("accordion-custom-icon");
  const paint = (value) => {
    for (const item of accordion.querySelectorAll('[data-xh-part="item"]')) {
      const mark = item.querySelector("[data-mark]");
      mark.textContent = value.includes(item.getAttribute("value")) ? "－" : "＋";
    }
  };
  accordion.value = ["shipping"];
  paint(accordion.value);
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
    paint(event.detail.value);
  });
</script>
```

### 形态

plain 不画壳，surface 给整块一层面，bordered 逐条画边；三档只改怎么与页面分开

```vue
<script setup lang="ts">
import { XhAccordionRoot } from "@xihan-ui/vue";

const panels = [
  { value: "shipping", label: "配送方式", content: "下单后 48 小时内发出。" },
  { value: "refund", label: "退换政策", content: "签收 7 天内可申请退换。" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
    <XhAccordionRoot
      v-for="variant in ['plain', 'surface', 'bordered']"
      :key="variant"
      :variant="variant"
      :collection="panels"
      :default-value="['shipping']"
    />
  </div>
</template>
```

```html
<div
  id="accordion-variants"
  style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"
>
  <xh-accordion variant="plain">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>

  <xh-accordion variant="surface">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>

  <xh-accordion variant="bordered">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：逐组设初值、每次变更写回
  const grid = document.getElementById("accordion-variants");
  for (const accordion of grid.querySelectorAll("xh-accordion")) {
    accordion.value = ["shipping"];
    accordion.addEventListener("value-change", (event) => {
      accordion.value = event.detail.value;
    });
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-accordion>` |
| Vue 组件 | `XhAccordionContent` `XhAccordionHeader` `XhAccordionIndicator` `XhAccordionItem` `XhAccordionItemSeparator` `XhAccordionRoot` `XhAccordionTrigger` |
| 组合式函数 | `useAccordion` |
| 状态机 | `accordionMachine` |
| 皮肤 | `@xihan-ui/styles/accordion.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="accordion"`：`root` · `item` · `item-separator` · `header` · **`trigger`** · **`content`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `AccordionNode[]` |  | 条目数据，标题文本、正文与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本写在部件里、禁用写在条目上」的老路。 |
| `value` | `string[]` |  | 展开集合，给定即受控。 |
| `defaultValue` | `string[]` |  |  |
| `multiple` | `boolean` |  | 允许多项同时展开；false 时展开一项即收起其余。 |
| `collapsible` | `boolean` |  | 允许把最后一个展开项收起，默认 false。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 false。 |
| `disabled` | `boolean` |  | 整组禁用：所有条目都不可切换，条目上写的 disabled 只能更严不能放宽。 |
| `variant` | `AccordionVariant` |  | 形态：plain / surface / bordered，决定条目怎么与页面分开。缺省 plain。 |
| `orientation` | `Orientation` |  | 方向键轴向，默认 vertical。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；影响水平轴上 ArrowLeft/ArrowRight 的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AccordionValueChangeDetails) => void` |  | 展开集合变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AccordionValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `item` | 'open' \| 'closed' |
| `header` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`ITEM.TOGGLE` · `VALUE.SET`

## connect API

`useAccordion` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前展开集合，单开模式下长度 ≤ 1。 |
| `collection` | `readonly AccordionNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `setValue` | `(next: string[]) => void` |  |
| `isOpen` | `(value: string) => boolean` |  |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getItemSeparatorProps` | `() => T['element']` |  |
| `getHeaderProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getTriggerProps` | `(props: AccordionItemProps) => T['button']` |  |
| `getContentProps` | `(props: AccordionItemProps) => T['element']` |  |
| `getIndicatorProps` | `(props: AccordionItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起该条目的 content |
| `ArrowDown` / `ArrowRight` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到下一个 trigger，末条不回绕 |
| `ArrowUp` / `ArrowLeft` | focus in trigger, 按键与 orientation 同轴（dir=rtl 时左右键语义互换） | 焦点移到上一个 trigger，首条不回绕 |
| `Home` | focus in trigger | 焦点移到首个 trigger |
| `End` | focus in trigger | 焦点移到末个 trigger |
| `Tab` / `Shift+Tab` | focus in trigger | 按文档序进出：每个 trigger 都是独立 Tab 停靠点，无 roving tabindex |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `item-separator` | `aria-hidden` | 'true' |
| `header` | `aria-level` | 3 |
| `header` | `role` | 'heading' |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'region' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/accordion.css` 按部件选择：`[data-scope="accordion"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'open' \| 'closed' |
| `header` | `data-disabled` | ''（条件成立时才出现） |
| `header` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-accordion-content-fg` · `--xh-accordion-content-px` · `--xh-accordion-content-py` · `--xh-accordion-icon-size` · `--xh-accordion-item-bg` · `--xh-accordion-item-border` · `--xh-accordion-item-gap` · `--xh-accordion-item-radius` · `--xh-accordion-item-shadow` · `--xh-accordion-trigger-bg` · `--xh-accordion-trigger-bg-hover` · `--xh-accordion-trigger-fg` · `--xh-accordion-trigger-fg-open` · `--xh-accordion-trigger-font-size` · `--xh-accordion-trigger-font-weight` · `--xh-accordion-trigger-gap` · `--xh-accordion-trigger-h` · `--xh-accordion-trigger-px` · `--xh-accordion-trigger-radius`

## 动效

关键帧 `xh-accordion-collapse` · `xh-accordion-expand` 随皮肤自带，不引用别处文件里的名字；`rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 标题栏里可以挂附加信息（计数、状态[徽标](./badge)）。

## 最佳实践

- 标题写清楚里面是什么，用户不该靠展开来发现。
- 默认展开第一项，让用户看见内容长什么样。

## 反模式

- 把关键信息藏进折叠：用户不会逐个点开。
- 展开时页面下方内容大幅跳动而没有滚动补偿。
