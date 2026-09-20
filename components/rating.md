来源：https://ui.docs.xihanfun.com/components/rating

# Rating 评分 `alpha`

用一排图案表示一个离散的分值。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/rating" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/rating.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/rating" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/rating" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/rating.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 value 即为非受控，组件自行维护评分；default-value 只决定初始档位

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhRatingRoot v-slot="{ items }" :default-value="3">
    <XhRatingLabel>整体满意度</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i" />
    </XhRatingControl>
  </XhRatingRoot>
</template>
```

```html
<xh-rating default-value="3">
  <div data-xh-part="root">
    <span data-xh-part="label">整体满意度</span>
    <div data-xh-part="control">
      <span data-xh-part="item" value="1"></span>
      <span data-xh-part="item" value="2"></span>
      <span data-xh-part="item" value="3"></span>
      <span data-xh-part="item" value="4"></span>
      <span data-xh-part="item" value="5"></span>
    </div>
  </div>
</xh-rating>
```

## 组件结构

加粗的是必需部件。

`data-scope="rating"`：**`root`** · `label` · **`control`** · `value-text` · **`item`** · `hidden-input`

## 示例

### 半星与悬停预览

allow-half 使落点分左右半边；划过只发 hover-change，评分要点击后才改变

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const score = ref(2.5);
const preview = ref<number | null>(null);

function onHoverChange(details: { value: number | null }) {
  preview.value = details.value;
}
</script>

<template>
  <XhRatingRoot v-slot="{ items }" v-model:value="score" allow-half @hover-change="onHoverChange">
    <XhRatingLabel>服务评分</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i" />
    </XhRatingControl>
  </XhRatingRoot>
  <p>评分：{{ score }} · 悬停预览：{{ preview ?? "（无）" }}</p>
</template>
```

```html
<xh-rating id="rating-half" value="2.5" allow-half>
  <div data-xh-part="root">
    <span data-xh-part="label">服务评分</span>
    <div data-xh-part="control">
      <span data-xh-part="item" value="1"></span>
      <span data-xh-part="item" value="2"></span>
      <span data-xh-part="item" value="3"></span>
      <span data-xh-part="item" value="4"></span>
      <span data-xh-part="item" value="5"></span>
    </div>
  </div>
</xh-rating>
<p>评分：<span id="rating-half-score">2.5</span> · 悬停预览：<span id="rating-half-preview">（无）</span></p>

<script type="module">
  // 值由外面这份状态持有，组件报上来才写回去
  const rating = document.getElementById("rating-half");
  const score = document.getElementById("rating-half-score");
  const preview = document.getElementById("rating-half-preview");

  rating.addEventListener("value-change", (event) => {
    rating.value = event.detail.value;
    score.textContent = event.detail.value;
  });
  rating.addEventListener("hover-change", (event) => {
    preview.textContent = event.detail.value ?? "（无）";
  });
</script>
```

### 自定义档数

count 决定几颗星，星星按 1..count 逐颗写出

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const level = ref(7);
</script>

<template>
  <XhRatingRoot v-slot="{ items }" v-model:value="level" :count="10">
    <XhRatingLabel>推荐指数（10 档）</XhRatingLabel>
    <XhRatingControl>
      <XhRatingItem v-for="i in items" :key="i" :value="i" />
    </XhRatingControl>
  </XhRatingRoot>
  <p>当前：{{ level }} / 10</p>
</template>
```

```html
<xh-rating id="rating-count" value="7" count="10">
  <div data-xh-part="root">
    <span data-xh-part="label">推荐指数（10 档）</span>
    <div data-xh-part="control">
      <span data-xh-part="item" value="1"></span>
      <span data-xh-part="item" value="2"></span>
      <span data-xh-part="item" value="3"></span>
      <span data-xh-part="item" value="4"></span>
      <span data-xh-part="item" value="5"></span>
      <span data-xh-part="item" value="6"></span>
      <span data-xh-part="item" value="7"></span>
      <span data-xh-part="item" value="8"></span>
      <span data-xh-part="item" value="9"></span>
      <span data-xh-part="item" value="10"></span>
    </div>
  </div>
</xh-rating>
<p>当前：<span id="rating-count-value">7</span> / 10</p>

<script type="module">
  const rating = document.getElementById("rating-count");
  const readout = document.getElementById("rating-count-value");

  rating.addEventListener("value-change", (event) => {
    rating.value = event.detail.value;
    readout.textContent = event.detail.value;
  });
</script>
```

### 只读与禁用

read-only 仍进入 Tab 序列、读屏可朗读但不可修改；disabled 整条退出 Tab 序列

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-slot="{ items }" :default-value="4" read-only>
      <XhRatingLabel>只读（4 星）</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="2" disabled>
      <XhRatingLabel>禁用（2 星）</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-rating default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">只读（4 星）</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating default-value="2" disabled>
    <div data-xh-part="root">
      <span data-xh-part="label">禁用（2 星）</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>
</div>
```

### 颜色

tone 决定点亮的星使用哪族颜色，不写时沿用警示色

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-for="t in tones" :key="t" v-slot="{ items }" :tone="t" :default-value="4" read-only>
      <XhRatingLabel>{{ t }}</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-rating tone="brand" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating tone="neutral" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating tone="success" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating tone="warning" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating tone="danger" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating tone="info" default-value="4" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>
</div>
```

### 尺寸

size 改变星的大小与间距，不写即默认中档

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhRatingRoot v-slot="{ items }" :default-value="3" size="sm">
      <XhRatingLabel>sm</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="3">
      <XhRatingLabel>缺省</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="3" size="lg">
      <XhRatingLabel>lg</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
  <xh-rating default-value="3" size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating default-value="3">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating default-value="3" size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>
</div>
```

### 自定义图标

条目可使用首方图标，也可留空使用皮肤默认星形

```vue
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-slot="{ items }" :default-value="3">
      <XhRatingLabel>换个字形</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i"><XhIcon :icon="HeartIcon" /></XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="2" allow-half>
      <XhRatingLabel>内置星形与半档</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-rating default-value="3">
    <div data-xh-part="root">
      <span data-xh-part="label">换个字形</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"/></svg></span>
        <span data-xh-part="item" value="2"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"/></svg></span>
        <span data-xh-part="item" value="3"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"/></svg></span>
        <span data-xh-part="item" value="4"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"/></svg></span>
        <span data-xh-part="item" value="5"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C10.5 18.5 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C10.6 3 11.4 4.2 12 6.2C12.6 4.2 13.4 3 15.5 3C18.54 3 21 5.46 21 8.5C21 13.5 13.5 18.5 12 20.5Z"/></svg></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating default-value="2" allow-half>
    <div data-xh-part="root">
      <span data-xh-part="label">内置星形与半档</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>
</div>
```

### 自定义颜色

点亮色与未点亮色各是一个组件令牌，写在行内即可脱离语气档

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot
      v-slot="{ items }"
      :default-value="4"
      read-only
      style="--xh-rating-item-fg-highlighted: #4fb233"
    >
      <XhRatingLabel>只换点亮色</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot
      v-slot="{ items }"
      :default-value="2.5"
      allow-half
      style="--xh-rating-item-fg-highlighted: #e11d48; --xh-rating-item-fg: #fecdd3"
    >
      <XhRatingLabel>点亮与未点亮各给一色</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
```

```html
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-rating default-value="4" read-only>
    <div data-xh-part="root" style="--xh-rating-item-fg-highlighted: #4fb233">
      <span data-xh-part="label">只换点亮色</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>

  <xh-rating default-value="2.5" allow-half>
    <div
      data-xh-part="root"
      style="--xh-rating-item-fg-highlighted: #e11d48; --xh-rating-item-fg: #fecdd3"
    >
      <span data-xh-part="label">点亮与未点亮各给一色</span>
      <div data-xh-part="control">
        <span data-xh-part="item" value="1"></span>
        <span data-xh-part="item" value="2"></span>
        <span data-xh-part="item" value="3"></span>
        <span data-xh-part="item" value="4"></span>
        <span data-xh-part="item" value="5"></span>
      </div>
    </div>
  </xh-rating>
</div>
```

### 再点一次清空

allowClear 默认开启：点击当前档位清回未评分，键盘在最低档再向下一步同样清零；设为 false 关闭

```vue
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const score = ref(3);
const sticky = ref(3);
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="score">
        <XhRatingLabel>整体满意度（可清空）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ score === 0 ? "还没评" : score }}</p>
    </div>
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="sticky" :allow-clear="false">
        <XhRatingLabel>关掉清空（再点不清）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ sticky }}</p>
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px">
  <div>
    <xh-rating id="rating-clearable" value="3">
      <div data-xh-part="root">
        <span data-xh-part="label">整体满意度（可清空）</span>
        <div data-xh-part="control">
          <span data-xh-part="item" value="1"></span>
          <span data-xh-part="item" value="2"></span>
          <span data-xh-part="item" value="3"></span>
          <span data-xh-part="item" value="4"></span>
          <span data-xh-part="item" value="5"></span>
        </div>
      </div>
    </xh-rating>
    <p style="margin: 4px 0 0; font-size: 13px">当前：<span id="rating-clearable-value">3</span></p>
  </div>
  <div>
    <xh-rating id="rating-sticky" value="3" allow-clear="false">
      <div data-xh-part="root">
        <span data-xh-part="label">关掉清空（再点不清）</span>
        <div data-xh-part="control">
          <span data-xh-part="item" value="1"></span>
          <span data-xh-part="item" value="2"></span>
          <span data-xh-part="item" value="3"></span>
          <span data-xh-part="item" value="4"></span>
          <span data-xh-part="item" value="5"></span>
        </div>
      </div>
    </xh-rating>
    <p style="margin: 4px 0 0; font-size: 13px">当前：<span id="rating-sticky-value">3</span></p>
  </div>
</div>

<script type="module">
  // 值由外面这份状态持有，组件报上来才写回去
  const clearable = document.getElementById("rating-clearable");
  const clearableValue = document.getElementById("rating-clearable-value");
  clearable.addEventListener("value-change", (event) => {
    clearable.value = event.detail.value;
    clearableValue.textContent = event.detail.value === 0 ? "还没评" : event.detail.value;
  });

  const sticky = document.getElementById("rating-sticky");
  const stickyValue = document.getElementById("rating-sticky-value");
  sticky.addEventListener("value-change", (event) => {
    sticky.value = event.detail.value;
    stickyValue.textContent = event.detail.value;
  });
</script>
```

## 设计指引

### 何时使用

- 收集或展示满意度、星级等小范围的主观分值。

### 何时不用

- 分值范围大（0 到 100）时，使用[滑块](./slider)或[数字字段](./number-field)。
- 只展示一个数值时，使用[统计数值](./statistic)。

### 特性

- `allowHalf` 支持半档，`allowClear` 允许再次点击清空。
- 悬停预览与实际值分开，`onHoverChange` 单独回调。
- 条目留空时使用库内置的星形图标；也可传入自定义图标与颜色。

### 组合

- 外层放[表单字段](./field)；只读展示时与[统计数值](./statistic)并列。

### 最佳实践

- 档数固定为五档，更多档用户无法分辨差别。
- 只读展示时同时写出数值（4.2 / 5），图案本身读不出精确值。

### 反模式

- 用它展示进度，那是[进度条](./progress)。
- 不允许清空却也没有默认值，用户误点后无法恢复。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-rating>` |
| Vue 组件 | `XhRatingControl` `XhRatingHiddenInput` `XhRatingItem` `XhRatingLabel` `XhRatingRoot` `XhRatingValueText` |
| 组合式函数 | `useRating` |
| 状态机 | `ratingMachine` |
| 皮肤 | `@xihan-ui/styles/rating.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` |  | 受控评分。提供即受控：内部不再自行落值，只发 onValueChange。 |
| `defaultValue` | `number` |  | 非受控初值，默认 0（尚未评分）。 |
| `count` | `number` |  | 星星颗数，默认 5。 |
| `allowHalf` | `boolean` |  | 允许半颗星：档位从 1 变为 0.5。 |
| `allowClear` | `boolean` |  | 再次点击当前档位即清零，键盘在最低档再向下一步同样清零；默认开启。 |
| `disabled` | `boolean` |  | 完全不可交互：退出 Tab 序列，指针与键盘都不响应。 |
| `readOnly` | `boolean` |  | 只读：仍可聚焦、仍能被读屏朗读，但不可修改，也不提供悬停预览。 |
| `required` | `boolean` |  |  |
| `name` | `string` |  | 表单字段名；提供后表单影子才带 name 并参与提交。 |
| `dir` | `Direction` |  | 文字方向，默认 'ltr'。只改写左右方向键与指针落在哪半边的语义。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<RatingTranslations>` |  |  |
| `onValueChange` | `(details: RatingValueChangeDetails) => void` |  |  |
| `onHoverChange` | `(details: RatingHoverChangeDetails) => void` |  | 悬停预览变化；指针离开时带 null。它不代表值已变化。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `RatingValueChangeDetails` | 评分变化；detail 为 `{ value: number }` |
| `hover-change` | `RatingHoverChangeDetails` | 悬停预览变化；detail 为 `{ value: number \| null }`，指针离开时带 null |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhRatingItem` | `default` | `RatingItemSlotProps` |  |
| `XhRatingRoot` | `default` | `RatingRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `VALUE.STEP` · `VALUE.TO_MIN` · `VALUE.TO_MAX` · `ITEM.SELECT` · `ITEM.FOCUS` · `ITEM.HOVER` · `HOVER.CLEAR` · `CONTROL.BLUR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canInteract`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number` | 已归一化的评分：非法与越界的宿主输入在这里被夹回。 |
| `hoveredValue` | `number \| null` | 指针预览值；没有预览（或不可交互）时为 null。 |
| `highlightedValue` | `number` | 当前应点亮到的位置：有预览时是预览值，否则是评分。样式与 data-highlighted 使用的都是它。 |
| `valueText` | `string` | 分值文本：当前应点亮到的数值，指针预览期间跟随预览值。 |
| `count` | `number` |  |
| `empty` | `boolean` | 尚未评分（value 为 0）。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `items` | `readonly number[]` | 1..count 的序号表，作者直接遍历它渲染星星。 |
| `getItemState` | `(props: RatingItemProps) => RatingItemState` |  |
| `setValue` | `(next: number) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getValueTextProps` | `() => T['element']` | 分值文本：写在 root 中、control 的兄弟；aria-hidden，读屏使用星星自身的可及名。 |
| `getItemProps` | `(props: RatingItemProps) => T['element']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份视觉隐藏的原生输入，随表单提交当前评分。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the control | 整条评分带只占一个 Tab 位：焦点进入锚点星，无锚点时进入容器并由它转移到首颗 |
| `ArrowRight` / `ArrowUp` | focus in control, not disabled/readOnly | 加一档（allowHalf 时半颗），到顶停在 count；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowDown` | focus in control, not disabled/readOnly | 减一档，到底停在最小档，不会退回"还没评"；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in control, not disabled/readOnly | 取最小档（allowHalf 时是半颗，否则一颗） |
| `End` | focus in control, not disabled/readOnly | 取满分（count） |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-disabled` | 'true' \| 'false' |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `aria-orientation` | 'horizontal' |
| `control` | `aria-readonly` | 'true' \| 'false' |
| `control` | `aria-required` | 'true' \| 'false' |
| `control` | `role` | 'radiogroup' |
| `value-text` | `aria-hidden` | 'true' |
| `item` | `aria-checked` | 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-label` | itemLabel?.(item.value, count) |
| `item` | `aria-posinset` | item.value |
| `item` | `aria-setsize` | ratingMax(prop('count')) |
| `item` | `role` | 'radio' |
| `hidden-input` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/rating.css` 使用 `[data-scope="rating"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-empty` | ''（条件成立时才出现） |
| `value-text` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-half` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-readonly` | ''（条件成立时才出现） |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-xh-action-control` | '' |
| `item` | `data-xh-action-display` | 'always' |
| `item` | `data-xh-action-profile` | 'icon' |
| `item` | `data-xh-action-size` | 'xs' |
| `item` | `data-xh-action-variant` | 'ghost' |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-rating-gap` | `root` | `gap` | `default` | `--xh-space-1` | rating 的 root 部件 gap 覆盖槽。 |
| `--xh-rating-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | rating 的 item 部件 background-color 覆盖槽。 |
| `--xh-rating-item-fg` | `item` | `background-color`<br>`background-image`<br>`color` | `default`<br>`dir(rtl)`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-subtle` | rating 的 item 部件 background-color、background-image、color 覆盖槽。 |
| `--xh-rating-item-fg-highlighted` | `item` | `background-color`<br>`background-image`<br>`color` | `@media print`<br>`dir(rtl)`<br>`disabled`<br>`empty`<br>`focus-visible`<br>`half`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not(:empty)`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_rating-accent` | rating 的 item 部件 background-color、background-image、color 覆盖槽。 |
| `--xh-rating-item-font-size` | `item`<br>`root` | `--xh-icon-size`<br>`font-size` | `default` | `--xh-_rating-item-size` | rating 的 item、root 部件 --xh-icon-size、font-size 覆盖槽。 |
| `--xh-rating-item-gap` | `control` | `gap` | `default` | `--xh-_rating-item-gap` | rating 的 control 部件 gap 覆盖槽。 |
| `--xh-rating-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | rating 的 item 部件 border-radius 覆盖槽。 |
| `--xh-rating-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | rating 的 label 部件 color 覆盖槽。 |
| `--xh-rating-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | rating 的 label 部件 color 覆盖槽。 |
| `--xh-rating-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | rating 的 label 部件 font-size 覆盖槽。 |
| `--xh-rating-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | rating 的 label 部件 font-weight 覆盖槽。 |
| `--xh-rating-value-text-fg` | `value-text` | `color` | `default` | `--xh-fg-muted` | rating 的 value-text 部件 color 覆盖槽。 |
| `--xh-rating-value-text-fg-disabled` | `value-text` | `color` | `disabled` | `--xh-fg-subtle` | rating 的 value-text 部件 color 覆盖槽。 |
| `--xh-rating-value-text-font-size` | `value-text` | `font-size` | `default` | `--xh-_rating-font-size` | rating 的 value-text 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`clip-path` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
