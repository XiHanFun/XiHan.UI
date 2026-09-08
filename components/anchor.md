来源：https://ui.docs.xihanfun.com/components/anchor

# 锚点 `anchor`

一份跟着滚动位置自己换高亮的目录。

## 何时使用

- 长文档、设置页、详情页需要一份能跳转也能反映当前位置的目录。

## 何时不用

- 内容分段但互不相邻、需要切换而不是滚动：用[标签页](./tabs)。
- 只是一组跳转链接、不需要反映当前位置：写普通链接就好。

## 特性

- `offset` 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去。
- 一节都没越过判定线时当前值是 `null`，此时谁都不亮、指示条整条收起——不硬点亮第一项。
- `scrollElement` 把判定线挂到指定滚动容器上，不给就挂在窗口上。
- 组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来。

## 示例

### 基础用法

目录跟着滚动位置自己换高亮；scroll-element 把判定线挂到指定滚动容器上，不给就挂在窗口上

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 链接的 value 就是目标区块的 id：href 由组件按它派生
const sections = [
  { value: "anchor-basic-intro", label: "这是什么" },
  { value: "anchor-basic-keyboard", label: "键盘怎么走" },
  { value: "anchor-basic-edge", label: "边界在哪" },
  { value: "anchor-basic-token", label: "主题与令牌" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 20px;
      inline-size: 100%;
      align-items: start;
    "
  >
    <XhAnchorRoot :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <!-- 指示条必须住在 list 里：它以 list 为定位参照系，而 ul 里只放得下 li -->
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 目标区块是页面内容、不是组件的部件：组件按链接的 value 现查 id -->
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px"
      >
        <strong>{{ s.label }}</strong>
        <p>滚动这一栏，看左边哪一条亮起来。</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 20px;
    inline-size: 100%;
    align-items: start;
  "
>
  <!-- 目录先放在模板里：模板里的节点还没升级，滚动容器交得进去 -->
  <template id="anchor-basic-nav">
    <xh-anchor smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <!-- 链接的 value 就是目标区块的 id：href 由元素按它派生 -->
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-intro">这是什么</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-keyboard">键盘怎么走</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-edge">边界在哪</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-token">主题与令牌</a>
          </li>
          <!-- 指示条必须住在 list 里：它以 list 为定位参照系，而 ul 里只放得下 li -->
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-basic-scroll"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 目标区块是页面内容、不是组件的部件：元素按链接的 value 现查 id -->
    <div id="anchor-basic-intro" style="block-size: 180px">
      <strong>这是什么</strong>
      <p>滚动这一栏，看左边哪一条亮起来。</p>
    </div>
    <div id="anchor-basic-keyboard" style="block-size: 180px">
      <strong>键盘怎么走</strong>
      <p>滚动这一栏，看左边哪一条亮起来。</p>
    </div>
    <div id="anchor-basic-edge" style="block-size: 180px">
      <strong>边界在哪</strong>
      <p>滚动这一栏，看左边哪一条亮起来。</p>
    </div>
    <div id="anchor-basic-token" style="block-size: 180px">
      <strong>主题与令牌</strong>
      <p>滚动这一栏，看左边哪一条亮起来。</p>
    </div>
  </div>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("anchor-basic-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-basic-scroll");
  template.replaceWith(anchor);
</script>
```

### 受控

传了 value 就由宿主说了算；一节都没越过判定线时它是 null，此时谁都不亮、指示条整条收起

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhButton,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-ctl-install", label: "安装" },
  { value: "anchor-ctl-usage", label: "用法" },
  { value: "anchor-ctl-faq", label: "常见问题" },
];

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div
      style="
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 20px;
        align-items: start;
      "
    >
      <XhAnchorRoot v-model:value="active" :scroll-element="scrollEl" smooth>
        <XhAnchorList>
          <XhAnchorItem v-for="s in sections" :key="s.value">
            <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
          </XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div
        ref="scrollEl"
        style="
          block-size: 220px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <div
          v-for="s in sections"
          :id="s.value"
          :key="s.value"
          style="block-size: 180px"
        >
          <strong>{{ s.label }}</strong>
          <p>这一节的正文。</p>
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="active = 'anchor-ctl-faq'">
        点亮「常见问题」
      </XhButton>
      <span>当前：{{ active ?? "（还没有一节越过判定线）" }}</span>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <div
    style="
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 20px;
      align-items: start;
    "
  >
    <template id="anchor-ctl-nav">
      <xh-anchor smooth>
        <nav data-xh-part="root">
          <ul data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-ctl-install">安装</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-ctl-usage">用法</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-ctl-faq">常见问题</a>
            </li>
            <li data-xh-part="indicator"></li>
          </ul>
        </nav>
      </xh-anchor>
    </template>

    <div
      id="anchor-ctl-scroll"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <div id="anchor-ctl-install" style="block-size: 180px">
        <strong>安装</strong>
        <p>这一节的正文。</p>
      </div>
      <div id="anchor-ctl-usage" style="block-size: 180px">
        <strong>用法</strong>
        <p>这一节的正文。</p>
      </div>
      <div id="anchor-ctl-faq" style="block-size: 180px">
        <strong>常见问题</strong>
        <p>这一节的正文。</p>
      </div>
    </div>
  </div>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="anchor-ctl-jump" variant="outline">
      <button data-xh-part="root">点亮「常见问题」</button>
    </xh-button>
    <span>当前：<span id="anchor-ctl-readout"></span></span>
  </div>
</div>

<script type="module">
  const template = document.getElementById("anchor-ctl-nav");
  const anchor = template.content.firstElementChild;
  const readout = document.getElementById("anchor-ctl-readout");

  // 激活项写在宿主这边：初值是 null，此刻谁都不亮
  function apply(next) {
    anchor.value = next;
    readout.textContent = next ?? "（还没有一节越过判定线）";
  }

  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  anchor.scrollElement = document.getElementById("anchor-ctl-scroll");
  apply(null);
  template.replaceWith(anchor);

  // 观察器结算出的新激活项写回宿主，值才真的换
  anchor.addEventListener("value-change", (event) => apply(event.detail.value));

  document
    .getElementById("anchor-ctl-jump")
    .addEventListener("click", () => apply("anchor-ctl-faq"));
</script>
```

### 判定线偏移

offset 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去，越过它的最后一节才算当前节

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 20px;
      inline-size: 100%;
      align-items: start;
    "
  >
    <XhAnchorRoot :scroll-element="scrollEl" :offset="44" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        position: relative;
        block-size: 240px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 44px 高的吸顶栏，判定线正好压在它下沿 -->
      <div
        style="
          position: sticky;
          inset-block-start: 0;
          z-index: 1;
          block-size: 44px;
          display: flex;
          align-items: center;
          padding-inline: 12px;
          background: var(--xh-bg-surface);
          border-block-end: 1px solid var(--xh-border-default);
        "
      >
        吸顶栏（44px）
      </div>

      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px; padding: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p>这一节被吸顶栏挡住时不算当前节。</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 20px;
    inline-size: 100%;
    align-items: start;
  "
>
  <template id="anchor-offset-nav">
    <xh-anchor offset="44" smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-a">第一节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-b">第二节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-c">第三节</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-offset-scroll"
    style="
      position: relative;
      block-size: 240px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <!-- 44px 高的吸顶栏，判定线正好压在它下沿 -->
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 44px;
        display: flex;
        align-items: center;
        padding-inline: 12px;
        background: var(--xh-bg-surface);
        border-block-end: 1px solid var(--xh-border-default);
      "
    >
      吸顶栏（44px）
    </div>

    <div id="anchor-offset-a" style="block-size: 180px; padding: 12px">
      <strong>第一节</strong>
      <p>这一节被吸顶栏挡住时不算当前节。</p>
    </div>
    <div id="anchor-offset-b" style="block-size: 180px; padding: 12px">
      <strong>第二节</strong>
      <p>这一节被吸顶栏挡住时不算当前节。</p>
    </div>
    <div id="anchor-offset-c" style="block-size: 180px; padding: 12px">
      <strong>第三节</strong>
      <p>这一节被吸顶栏挡住时不算当前节。</p>
    </div>
  </div>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("anchor-offset-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-offset-scroll");
  template.replaceWith(anchor);
</script>
```

### 横排目录

orientation="horizontal" 只改样式：条目排成一行，轨道与指示条从起始缘挪到底边

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-h-overview", label: "概览" },
  { value: "anchor-h-props", label: "属性" },
  { value: "anchor-h-events", label: "事件" },
  { value: "anchor-h-slots", label: "插槽" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhAnchorRoot
      :scroll-element="scrollEl"
      orientation="horizontal"
      smooth
    >
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 170px"
      >
        <strong>{{ s.label }}</strong>
        <p>这一节的正文。</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <template id="anchor-h-nav">
    <xh-anchor orientation="horizontal" smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-overview">概览</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-props">属性</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-events">事件</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-slots">插槽</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-h-scroll"
    style="
      block-size: 220px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <div id="anchor-h-overview" style="block-size: 170px">
      <strong>概览</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-h-props" style="block-size: 170px">
      <strong>属性</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-h-events" style="block-size: 170px">
      <strong>事件</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-h-slots" style="block-size: 170px">
      <strong>插槽</strong>
      <p>这一节的正文。</p>
    </div>
  </div>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("anchor-h-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-h-scroll");
  template.replaceWith(anchor);
</script>
```

### 语气

tone 换的是选中那一节的指示条与文字颜色，这里用 default-value 预置「用法」为选中项

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

const sections = [
  { value: "anchor-tone-install", label: "安装" },
  { value: "anchor-tone-usage", label: "用法" },
  { value: "anchor-tone-faq", label: "常见问题" },
];
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
    "
  >
    <div v-for="t in tones" :key="t">
      <div style="margin-block-end: 8px; font-size: 12px">{{ t }}</div>
      <XhAnchorRoot :tone="t" default-value="anchor-tone-usage">
        <XhAnchorList>
          <XhAnchorItem v-for="s in sections" :key="s.value">
            <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
          </XhAnchorItem>
          <!-- 指示条必须住在 list 里：它以 list 为定位参照系 -->
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>
    </div>
  </div>
</template>
```

```html
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  "
>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">brand</div>
    <xh-anchor tone="brand" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <!-- 指示条必须住在 list 里：它以 list 为定位参照系 -->
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">neutral</div>
    <xh-anchor tone="neutral" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">success</div>
    <xh-anchor tone="success" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">warning</div>
    <xh-anchor tone="warning" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">danger</div>
    <xh-anchor tone="danger" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">info</div>
    <xh-anchor tone="info" default-value="anchor-tone-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-tone-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>
</div>
```

### 尺寸

size 换条目的字号与左右内边距，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const sections = [
  { value: "anchor-size-install", label: "安装" },
  { value: "anchor-size-usage", label: "用法" },
  { value: "anchor-size-faq", label: "常见问题" },
];
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      align-items: start;
    "
  >
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhAnchorRoot :size="s.size" default-value="anchor-size-usage">
        <XhAnchorList>
          <XhAnchorItem v-for="sec in sections" :key="sec.value">
            <XhAnchorLink :value="sec.value">{{ sec.label }}</XhAnchorLink>
          </XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>
    </div>
  </div>
</template>
```

```html
<div
  style="
    inline-size: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    align-items: start;
  "
>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">小</div>
    <xh-anchor size="sm" default-value="anchor-size-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <!-- 中间一档不写 size -->
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">默认</div>
    <xh-anchor default-value="anchor-size-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>

  <div>
    <div style="margin-block-end: 8px; font-size: 12px">大</div>
    <xh-anchor size="lg" default-value="anchor-size-usage">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-usage">用法</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-size-faq">常见问题</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </div>
</div>
```

### 吸顶目录

目录用 sticky 钉在滚动容器顶边，滚动时留在原处；判定线仍由 offset 定

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-affix-intro", label: "简介" },
  { value: "anchor-affix-install", label: "安装" },
  { value: "anchor-affix-usage", label: "用法" },
  { value: "anchor-affix-faq", label: "常见问题" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 260px;
      overflow: auto;
      inline-size: 100%;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 20px; padding: 12px">
      <!-- 外层这格随内容拉满，目录在它内部 sticky，才有可移动的余量 -->
      <div>
        <XhAnchorRoot
          :scroll-element="scrollEl"
          :offset="12"
          smooth
          style="position: sticky; inset-block-start: 0; background: var(--xh-bg-surface)"
        >
          <XhAnchorList>
            <XhAnchorItem v-for="s in sections" :key="s.value">
              <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
            </XhAnchorItem>
            <XhAnchorIndicator />
          </XhAnchorList>
        </XhAnchorRoot>
      </div>

      <div>
        <div
          v-for="s in sections"
          :id="s.value"
          :key="s.value"
          style="block-size: 200px"
        >
          <strong>{{ s.label }}</strong>
          <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  id="anchor-affix-scroll"
  style="
    block-size: 260px;
    overflow: auto;
    inline-size: 100%;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <div
    style="display: grid; grid-template-columns: 140px 1fr; gap: 20px; padding: 12px"
  >
    <!-- 外层这格随内容拉满，目录在它内部 sticky，才有可移动的余量 -->
    <div>
      <template id="anchor-affix-nav">
        <xh-anchor
          offset="12"
          smooth
          style="
            display: block;
            position: sticky;
            inset-block-start: 0;
            background: var(--xh-bg-surface);
          "
        >
          <nav data-xh-part="root">
            <ul data-xh-part="list">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-affix-intro">简介</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-affix-install">安装</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-affix-usage">用法</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-affix-faq">常见问题</a>
              </li>
              <li data-xh-part="indicator"></li>
            </ul>
          </nav>
        </xh-anchor>
      </template>
    </div>

    <div>
      <div id="anchor-affix-intro" style="block-size: 200px">
        <strong>简介</strong>
        <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
      </div>
      <div id="anchor-affix-install" style="block-size: 200px">
        <strong>安装</strong>
        <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
      </div>
      <div id="anchor-affix-usage" style="block-size: 200px">
        <strong>用法</strong>
        <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
      </div>
      <div id="anchor-affix-faq" style="block-size: 200px">
        <strong>常见问题</strong>
        <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
      </div>
    </div>
  </div>
</div>

<script type="module">
  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  const template = document.getElementById("anchor-affix-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-affix-scroll");
  template.replaceWith(anchor);
</script>
```

### 二级目录

子链接嵌在父项里的原生列表中，按文档序照常参与结算；父级要不要跟着亮由宿主自己算

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const groups = [
  {
    value: "anchor-nested-guide",
    label: "指南",
    children: [
      { value: "anchor-nested-install", label: "安装" },
      { value: "anchor-nested-start", label: "快速开始" },
    ],
  },
  {
    value: "anchor-nested-api",
    label: "接口",
    children: [
      { value: "anchor-nested-props", label: "属性" },
      { value: "anchor-nested-events", label: "事件" },
    ],
  },
];

// 正文区块按文档序摊平，父节与子节共用一份清单
const sections = computed(() =>
  groups.flatMap(g => [{ value: g.value, label: g.label }, ...g.children]),
);

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

// 子节命中时父节一起点亮
function isGroupActive(group: {
  value: string;
  children: readonly { value: string }[];
}): boolean {
  return (
    active.value === group.value
    || group.children.some(c => c.value === active.value)
  );
}
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 20px;
      inline-size: 100%;
      align-items: start;
    "
  >
    <XhAnchorRoot v-model:value="active" :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem
          v-for="g in groups"
          :key="g.value"
          style="flex-direction: column; align-items: stretch"
        >
          <XhAnchorLink
            :value="g.value"
            :style="isGroupActive(g) ? { color: 'var(--xh-fg-brand)' } : undefined"
          >
            {{ g.label }}
          </XhAnchorLink>
          <!-- 子级用一层原生 ul 承载：再嵌一个 XhAnchorList 会把指示条的参照系抢走 -->
          <ul
            style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none"
          >
            <XhAnchorItem v-for="c in g.children" :key="c.value">
              <XhAnchorLink :value="c.value">{{ c.label }}</XhAnchorLink>
            </XhAnchorItem>
          </ul>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 140px"
      >
        <strong>{{ s.label }}</strong>
        <p>这一节的正文。</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 20px;
    inline-size: 100%;
    align-items: start;
  "
>
  <template id="anchor-nested-nav">
    <xh-anchor smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-guide">指南</a>
            <!-- 子级用一层原生 ul 承载：再嵌一个 list 会把指示条的参照系抢走 -->
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-install">安装</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-start">快速开始</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-api">接口</a>
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-props">属性</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-events">事件</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-nested-scroll"
    style="
      block-size: 240px;
      overflow: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <div id="anchor-nested-guide" style="block-size: 140px">
      <strong>指南</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-nested-install" style="block-size: 140px">
      <strong>安装</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-nested-start" style="block-size: 140px">
      <strong>快速开始</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-nested-api" style="block-size: 140px">
      <strong>接口</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-nested-props" style="block-size: 140px">
      <strong>属性</strong>
      <p>这一节的正文。</p>
    </div>
    <div id="anchor-nested-events" style="block-size: 140px">
      <strong>事件</strong>
      <p>这一节的正文。</p>
    </div>
  </div>
</div>

<script type="module">
  // 父节与它名下的子节
  const groups = {
    "anchor-nested-guide": ["anchor-nested-install", "anchor-nested-start"],
    "anchor-nested-api": ["anchor-nested-props", "anchor-nested-events"],
  };

  const template = document.getElementById("anchor-nested-nav");
  const anchor = template.content.firstElementChild;

  // 子节命中时父节一起点亮
  function apply(next) {
    anchor.value = next;
    for (const [parent, children] of Object.entries(groups)) {
      const link = anchor.querySelector(`[data-xh-part="link"][value="${parent}"]`);
      const on = next === parent || children.includes(next);
      link.style.color = on ? "var(--xh-fg-brand)" : "";
    }
  }

  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  anchor.scrollElement = document.getElementById("anchor-nested-scroll");
  apply(null);
  template.replaceWith(anchor);

  anchor.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

### 从外部跳到某一节

组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhButton,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 判定线与滚动落点用同一个偏移，跳过去之后高亮正好落在这一节
const OFFSET = 12;

const sections = [
  { value: "anchor-goto-intro", label: "简介" },
  { value: "anchor-goto-usage", label: "用法" },
  { value: "anchor-goto-faq", label: "常见问题" },
];

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

function jumpTo(id: string): void {
  const container = scrollEl.value;
  const target = container?.querySelector<HTMLElement>(`#${id}`);
  if (!container || !target) {
    return;
  }
  const delta
    = target.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      - OFFSET;
  container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
      <XhButton
        v-for="s in sections"
        :key="s.value"
        size="sm"
        variant="outline"
        @click="jumpTo(s.value)"
      >
        跳到{{ s.label }}
      </XhButton>
      <span>当前：{{ active ?? "（还没有一节越过判定线）" }}</span>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 20px;
        align-items: start;
      "
    >
      <XhAnchorRoot
        v-model:value="active"
        :scroll-element="scrollEl"
        :offset="OFFSET"
        smooth
      >
        <XhAnchorList>
          <XhAnchorItem v-for="s in sections" :key="s.value">
            <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
          </XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div
        ref="scrollEl"
        style="
          block-size: 220px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <div
          v-for="s in sections"
          :id="s.value"
          :key="s.value"
          style="block-size: 180px"
        >
          <strong>{{ s.label }}</strong>
          <p>这一节的正文。</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <div
    id="anchor-goto-bar"
    style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap"
  >
    <xh-button size="sm" variant="outline" data-target="anchor-goto-intro">
      <button data-xh-part="root">跳到简介</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-target="anchor-goto-usage">
      <button data-xh-part="root">跳到用法</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-target="anchor-goto-faq">
      <button data-xh-part="root">跳到常见问题</button>
    </xh-button>
    <span>当前：<span id="anchor-goto-readout"></span></span>
  </div>

  <div
    style="
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 20px;
      align-items: start;
    "
  >
    <template id="anchor-goto-nav">
      <xh-anchor offset="12" smooth>
        <nav data-xh-part="root">
          <ul data-xh-part="list">
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-goto-intro">简介</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-goto-usage">用法</a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="anchor-goto-faq">常见问题</a>
            </li>
            <li data-xh-part="indicator"></li>
          </ul>
        </nav>
      </xh-anchor>
    </template>

    <div
      id="anchor-goto-scroll"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <div id="anchor-goto-intro" style="block-size: 180px">
        <strong>简介</strong>
        <p>这一节的正文。</p>
      </div>
      <div id="anchor-goto-usage" style="block-size: 180px">
        <strong>用法</strong>
        <p>这一节的正文。</p>
      </div>
      <div id="anchor-goto-faq" style="block-size: 180px">
        <strong>常见问题</strong>
        <p>这一节的正文。</p>
      </div>
    </div>
  </div>
</div>

<script type="module">
  // 判定线与滚动落点用同一个偏移，跳过去之后高亮正好落在这一节
  const OFFSET = 12;

  const container = document.getElementById("anchor-goto-scroll");
  const readout = document.getElementById("anchor-goto-readout");
  const template = document.getElementById("anchor-goto-nav");
  const anchor = template.content.firstElementChild;

  function apply(next) {
    anchor.value = next;
    readout.textContent = next ?? "（还没有一节越过判定线）";
  }

  // 滚动容器是 DOM 句柄，只走属性；先交句柄再进 DOM，滚动观察器才挂得到这一层
  anchor.scrollElement = container;
  apply(null);
  template.replaceWith(anchor);

  anchor.addEventListener("value-change", (event) => apply(event.detail.value));

  function jumpTo(id) {
    const target = container.querySelector(`#${id}`);
    if (!target) {
      return;
    }
    const delta =
      target.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      OFFSET;
    container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
  }

  for (const button of document.getElementById("anchor-goto-bar").children) {
    if (button.dataset.target) {
      button.addEventListener("click", () => jumpTo(button.dataset.target));
    }
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorLinkText` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styles/anchor.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="anchor"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-text` · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 当前激活的锚点 id，给定即受控。 |
| `defaultValue` | `string \| null` |  |  |
| `collection` | `readonly string[]` |  | 目标区块的 id 清单，按文档序给；不给则按渲染出来的 link 现查。 |
| `offset` | `number` |  | 判定线距滚动容器视口顶边的距离（px），默认 0。 |
| `bounds` | `number` |  | 压线判定的容差（px），默认 1；区块顶边落在判定线下方这个距离内仍算越过。 |
| `smooth` | `boolean` |  | 点链接时平滑滚动到目标，默认 false。 |
| `dir` | `Direction` |  | 文字方向，作用于排版与指示条的起始缘。 |
| `orientation` | `Orientation` |  | 列表轴向，默认 vertical，只影响样式。 |
| `translations` | `Partial<AnchorTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  | value 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AnchorValueChangeDetails` | 激活项变化；detail 为 `{ value: string \| null }` |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `scrolling`

**事件**：`SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `after.scrollLock`

**判据**：`isSmooth` · `isTargetReached`

## connect API

`useAnchor` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前激活的锚点 id；一个都没越过判定线时为 null。 |
| `isActive` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'location' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/anchor.css` 按部件选择：`[data-scope="anchor"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `link` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | context.get('value') |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-anchor-fg` · `--xh-anchor-font-size` · `--xh-anchor-gap` · `--xh-anchor-gap-horizontal` · `--xh-anchor-indicator-color` · `--xh-anchor-indicator-radius` · `--xh-anchor-indicator-thickness` · `--xh-anchor-leading` · `--xh-anchor-link-bg-hover` · `--xh-anchor-link-fg-current` · `--xh-anchor-link-fg-hover` · `--xh-anchor-link-font-weight-current` · `--xh-anchor-link-max-w` · `--xh-anchor-link-px` · `--xh-anchor-link-py` · `--xh-anchor-link-radius` · `--xh-anchor-track`

## 动效

`background` · `block-size` · `color` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 外面套[固钉](./affix)做吸顶目录；与[排印](./typography)的长正文配合。

## 最佳实践

- 有吸顶栏一定要设 `offset`，否则当前节总比看到的早一节。
- 目录项文字与正文标题一字不差，用户才对得上。

## 反模式

- 目录层级超过两级：读起来比正文还费劲。
- 用它同时承担"跳转"和"切换视图"两件事。
