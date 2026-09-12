来源：https://ui.docs.xihanfun.com/components/carousel

# Carousel `走马灯`

在同一块区域里轮播若干张内容，一次显示一屏。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/carousel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/carousel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/carousel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/carousel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/carousel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

张数由 slideCount 声明而不是从 DOM 数，页数与指示点数量都由它算出来

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["第一张", "第二张", "第三张"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <!-- 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 -->
    <XhCarouselViewport style="block-size: 140px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <!-- 指示点一页一个，作者照着 totalPages 渲染 -->
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel slide-count="3">
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <!-- 视口只负责裁切，高度由页面给：不给高度就没有可裁的窗口 -->
    <div data-xh-part="viewport" style="block-size: 140px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            第一张
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            第二张
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            第三张
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <!-- 指示点一页一个，一屏一张时页数就是张数 -->
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
  </div>
</xh-carousel>
```

## 示例

### 受控

传了 page 就由宿主说了算，组件只发 page-change 不自己改页码，宿主写回它才动

```vue
<script setup lang="ts">
import {
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";
import { ref } from "vue";

const slides = ["登录", "选套餐", "付款"];
const page = ref(1);
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhCarouselRoot v-model:page="page" :slide-count="slides.length">
      <XhCarouselPrevTrigger />
      <XhCarouselViewport style="block-size: 120px">
        <XhCarouselList>
          <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
            <div style="display: grid; place-items: center; block-size: 100%">
              {{ text }}
            </div>
          </XhCarouselItem>
        </XhCarouselList>
      </XhCarouselViewport>
      <XhCarouselNextTrigger />
    </XhCarouselRoot>

    <!-- 页码握在宿主手里，外部按钮直接改它 -->
    <div style="display: flex; align-items: center; gap: 8px">
      <button
        v-for="(text, i) in slides"
        :key="text"
        type="button"
        @click="page = i"
      >
        跳到「{{ text }}」
      </button>
      <span>当前第 {{ page + 1 }} 张</span>
    </div>
  </div>
</template>
```

```html
<div id="carousel-controlled" style="inline-size: 100%; display: grid; gap: 12px">
  <xh-carousel id="carousel-controlled-host" slide-count="3" page="1">
    <div data-xh-part="root">
      <button data-xh-part="prev-trigger"></button>
      <div data-xh-part="viewport" style="block-size: 120px">
        <div data-xh-part="list">
          <div data-xh-part="item" index="0">
            <div style="display: grid; place-items: center; block-size: 100%">
              登录
            </div>
          </div>
          <div data-xh-part="item" index="1">
            <div style="display: grid; place-items: center; block-size: 100%">
              选套餐
            </div>
          </div>
          <div data-xh-part="item" index="2">
            <div style="display: grid; place-items: center; block-size: 100%">
              付款
            </div>
          </div>
        </div>
      </div>
      <button data-xh-part="next-trigger"></button>
    </div>
  </xh-carousel>

  <!-- 页码握在宿主手里，外部按钮直接改它 -->
  <div style="display: flex; align-items: center; gap: 8px">
    <button type="button" data-page="0">跳到「登录」</button>
    <button type="button" data-page="1">跳到「选套餐」</button>
    <button type="button" data-page="2">跳到「付款」</button>
    <span id="carousel-controlled-readout">当前第 2 张</span>
  </div>
</div>

<script type="module">
  // 组件只发意图，页码由这里写回去
  const host = document.getElementById("carousel-controlled");
  const carousel = document.getElementById("carousel-controlled-host");
  const readout = document.getElementById("carousel-controlled-readout");

  function setPage(page) {
    carousel.page = page;
    readout.textContent = `当前第 ${page + 1} 张`;
  }

  carousel.addEventListener("page-change", (event) => setPage(event.detail.page));

  for (const button of host.querySelectorAll("[data-page]")) {
    button.addEventListener("click", () => setPage(Number(button.dataset.page)));
  }
</script>
```

### 一屏多张

slidesPerPage 决定一屏露几张，一次翻几张缺省跟着它走，所以仍是整屏翻

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["一", "二", "三", "四", "五", "六"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ totalPages }"
    :slide-count="slides.length"
    :slides-per-page="2"
    spacing="12px"
    style="inline-size: 100%"
  >
    <!-- 不回绕：首页的上一张与末页的下一张转成原生 disabled -->
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 120px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            第 {{ text }} 张
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel slide-count="6" slides-per-page="2" spacing="12px">
  <div data-xh-part="root" style="inline-size: 100%">
    <!-- 不回绕：首页的上一张与末页的下一张转成原生 disabled -->
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 120px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            第一张
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            第二张
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            第三张
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            第四张
          </div>
        </div>
        <div data-xh-part="item" index="4">
          <div style="display: grid; place-items: center; block-size: 100%">
            第五张
          </div>
        </div>
        <div data-xh-part="item" index="5">
          <div style="display: grid; place-items: center; block-size: 100%">
            第六张
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <!-- 六张两两一屏，整屏翻即三页 -->
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
  </div>
</xh-carousel>
```

### 自动播放与暂停

autoplay 给毫秒即间隔；开了它就得渲播放开关，自动翻页必须能停住

```vue
<script setup lang="ts">
import {
  XhCarouselAutoplayTrigger,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["公告一", "公告二", "公告三"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, autoplaying, paused }"
    :slide-count="slides.length"
    :autoplay="2500"
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 120px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselAutoplayTrigger />
    <!-- root 自己就是会换行的横排 flex，回显想独占一行得自己占满 -->
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 ·
      {{ autoplaying ? "自动播放中" : paused ? "被按住" : "已停" }}
    </span>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel id="carousel-autoplay" slide-count="3" autoplay="2500" loop>
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 120px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            公告一
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            公告二
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            公告三
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <button data-xh-part="autoplay-trigger"></button>
    <!-- root 自己就是会换行的横排 flex，回显想独占一行得自己占满 -->
    <span id="carousel-autoplay-readout" style="flex-basis: 100%"></span>
  </div>
</xh-carousel>

<script type="module">
  // 播放与按住两个状态写在 root 上，页码跟着 page-change 走
  const carousel = document.getElementById("carousel-autoplay");
  const root = carousel.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("carousel-autoplay-readout");
  let page = 0;

  function render() {
    const state = root.hasAttribute("data-autoplay")
      ? "自动播放中"
      : root.hasAttribute("data-paused")
        ? "被按住"
        : "已停";
    readout.textContent = `第 ${page + 1} / 3 页 · ${state}`;
  }

  carousel.addEventListener("page-change", (event) => {
    page = event.detail.page;
    render();
  });

  new MutationObserver(render).observe(root, {
    attributes: true,
    attributeFilter: ["data-autoplay", "data-paused"],
  });

  render();
</script>
```

### 纵向轨道

orientation 换成 vertical 后轨道竖着位移，两端按钮落到上下两头，翻页认的是上下方向键

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["09:00 晨会", "11:00 客户沟通", "15:00 联调"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages }"
    orientation="vertical"
    :slide-count="slides.length"
    style="inline-size: 240px"
  >
    <XhCarouselPrevTrigger>∧</XhCarouselPrevTrigger>
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <XhCarouselViewport style="block-size: 96px; inline-size: 100%">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger>∨</XhCarouselNextTrigger>
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span>第 {{ page + 1 }} / {{ totalPages }} 条</span>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel id="carousel-vertical" orientation="vertical" slide-count="3">
  <div data-xh-part="root" style="inline-size: 240px">
    <button data-xh-part="prev-trigger">∧</button>
    <!-- 纵轨的裁切窗口靠高度定，宽度交给根节点 -->
    <div data-xh-part="viewport" style="block-size: 96px; inline-size: 100%">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            09:00 晨会
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            11:00 客户沟通
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            15:00 联调
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger">∨</button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
    </div>
    <span id="carousel-vertical-readout">第 1 / 3 条</span>
  </div>
</xh-carousel>

<script type="module">
  // 页码回显跟着 page-change 走
  const carousel = document.getElementById("carousel-vertical");
  const readout = document.getElementById("carousel-vertical-readout");
  carousel.addEventListener("page-change", (event) => {
    readout.textContent = `第 ${event.detail.page + 1} / 3 条`;
  });
</script>
```

### 指针拖拽

allowPointerDrag 打开后按住轨道就能拖着走，松手落回整页；关掉则只有触摸的原生滚动

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["拖我", "再拖", "还能拖", "最后一张"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, dragging }"
    :slide-count="slides.length"
    allow-pointer-drag
    loop
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 130px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 ·
      {{ dragging ? "正在拖" : "松手状态" }}
    </span>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel
  id="carousel-drag"
  slide-count="4"
  allow-pointer-drag
  loop
>
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 130px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            拖我
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            再拖
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            还能拖
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            最后一张
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
    <span id="carousel-drag-readout" style="flex-basis: 100%"></span>
  </div>
</xh-carousel>

<script type="module">
  // 拖拽态写在 root 上，页码跟着 page-change 走
  const carousel = document.getElementById("carousel-drag");
  const root = carousel.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("carousel-drag-readout");
  let page = 0;

  function render() {
    const state = root.hasAttribute("data-dragging") ? "正在拖" : "松手状态";
    readout.textContent = `第 ${page + 1} / 4 页 · ${state}`;
  }

  carousel.addEventListener("page-change", (event) => {
    page = event.detail.page;
    render();
  });

  new MutationObserver(render).observe(root, {
    attributes: true,
    attributeFilter: ["data-dragging"],
  });

  render();
</script>
```

### 指示点悬停切页

指示点上补一个原生 mouseenter 就是悬停切页，组件自带的点击翻页照旧

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, setPage }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselViewport style="block-size: 130px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselIndicatorGroup>
      <!-- mouseenter 是落到指示点按钮上的原生事件，组件自带的点击不受影响 -->
      <XhCarouselIndicator
        v-for="p in totalPages"
        :key="p"
        :index="p - 1"
        @mouseenter="setPage(p - 1)"
      />
    </XhCarouselIndicatorGroup>
    <span style="flex-basis: 100%">
      鼠标扫过下面的圆点即可换页，当前第 {{ page + 1 }} / {{ totalPages }} 页
    </span>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel id="carousel-hover" slide-count="4">
  <div data-xh-part="root" style="inline-size: 100%">
    <div data-xh-part="viewport" style="block-size: 130px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            城市夜景
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            海岸线
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            雪山
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            沙漠
          </div>
        </div>
      </div>
    </div>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
    <span id="carousel-hover-readout" style="flex-basis: 100%">
      鼠标扫过下面的圆点即可换页，当前第 1 / 4 页
    </span>
  </div>
</xh-carousel>

<script type="module">
  // mouseenter 是落到指示点按钮上的原生事件，转手按一下它自带的点击就换页
  const carousel = document.getElementById("carousel-hover");
  const readout = document.getElementById("carousel-hover-readout");

  for (const indicator of carousel.querySelectorAll('[data-xh-part="indicator"]')) {
    indicator.addEventListener("mouseenter", () => indicator.click());
  }

  carousel.addEventListener("page-change", (event) => {
    readout.textContent = `鼠标扫过下面的圆点即可换页，当前第 ${event.detail.page + 1} / 4 页`;
  });
</script>
```

### 一次挪一张

slidesPerMove 与 slidesPerPage 分开给：一屏露三张、一次只挪一张，页数按剩下的张数重新算

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";

const slides = ["A", "B", "C", "D", "E", "F"];
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages, slideRange }"
    :slide-count="slides.length"
    :slides-per-page="3"
    :slides-per-move="1"
    spacing="10px"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 110px">
      <XhCarouselList>
        <XhCarouselItem v-for="(text, i) in slides" :key="text" :index="i">
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <span style="flex-basis: 100%">
      第 {{ page + 1 }} / {{ totalPages }} 页 · 眼下露的是第
      {{ slideRange.start + 1 }} 到 {{ slideRange.end + 1 }} 张
    </span>
  </XhCarouselRoot>
</template>
```

```html
<xh-carousel
  id="carousel-per-move"
  slide-count="6"
  slides-per-page="3"
  slides-per-move="1"
  spacing="10px"
>
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 110px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">A</div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">B</div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">C</div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">D</div>
        </div>
        <div data-xh-part="item" index="4">
          <div style="display: grid; place-items: center; block-size: 100%">E</div>
        </div>
        <div data-xh-part="item" index="5">
          <div style="display: grid; place-items: center; block-size: 100%">F</div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <!-- 六张里一屏露三张、一次挪一张，落点共四个 -->
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
    <span id="carousel-per-move-readout" style="flex-basis: 100%"></span>
  </div>
</xh-carousel>

<script type="module">
  // 当前页写在指示点的 data-current 上，露在外面的那几张带 data-inview，回显直接读它们
  const carousel = document.getElementById("carousel-per-move");
  const root = carousel.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("carousel-per-move-readout");
  const indicators = [...carousel.querySelectorAll('[data-xh-part="indicator"]')];
  const items = [...carousel.querySelectorAll('[data-xh-part="item"]')];

  function render() {
    const page = indicators.findIndex((el) => el.hasAttribute("data-current"));
    const inView = items.filter((el) => el.hasAttribute("data-inview"));
    if (page < 0 || inView.length === 0) {
      return;
    }
    const first = Number(inView[0].dataset.index) + 1;
    const last = Number(inView[inView.length - 1].dataset.index) + 1;
    readout.textContent = `第 ${page + 1} / ${indicators.length} 页 · 眼下露的是第 ${first} 到 ${last} 张`;
  }

  new MutationObserver(render).observe(root, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-current", "data-inview"],
  });

  render();
</script>
```

### 换过渡效果

条目的内联样式只有尺寸与间距，位移之外的表现全归作者：把条目摞起来再按当前页调透明度与缩放，翻页、键盘与指示点一概照旧

```vue
<script setup lang="ts">
import {
  XhCarouselIndicator,
  XhCarouselIndicatorGroup,
  XhCarouselItem,
  XhCarouselList,
  XhCarouselNextTrigger,
  XhCarouselPrevTrigger,
  XhCarouselRoot,
  XhCarouselViewport,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

type Effect = "slide" | "fade" | "zoom";

const slides = ["城市夜景", "海岸线", "雪山", "沙漠"];

const options: { key: Effect; label: string }[] = [
  { key: "slide", label: "平移" },
  { key: "fade", label: "淡入" },
  { key: "zoom", label: "缩放淡入" },
];

const effect = ref<Effect>("fade");

// 后两档把条目摞在一起，轨道那条整页位移随之作废
const groupStyle = computed(() =>
  effect.value === "slide" ? undefined : { position: "relative", transform: "none" },
);

function itemStyle(index: number, page: number): Record<string, string> | undefined {
  if (effect.value === "slide")
    return undefined;
  const current = index === page;
  return {
    position: "absolute",
    inset: "0",
    opacity: current ? "1" : "0",
    scale: effect.value === "zoom" && !current ? "0.9" : "1",
    transition:
      "opacity var(--xh-motion-duration-slide) var(--xh-motion-ease-slide), scale var(--xh-motion-duration-slide) var(--xh-motion-ease-slide)",
  };
}
</script>

<template>
  <XhCarouselRoot
    v-slot="{ page, totalPages }"
    :slide-count="slides.length"
    style="inline-size: 100%"
  >
    <XhCarouselPrevTrigger />
    <XhCarouselViewport style="block-size: 140px">
      <XhCarouselList :style="groupStyle">
        <XhCarouselItem
          v-for="(text, i) in slides"
          :key="text"
          :index="i"
          :style="itemStyle(i, page)"
        >
          <div style="display: grid; place-items: center; block-size: 100%">
            {{ text }}
          </div>
        </XhCarouselItem>
      </XhCarouselList>
    </XhCarouselViewport>
    <XhCarouselNextTrigger />
    <XhCarouselIndicatorGroup>
      <XhCarouselIndicator v-for="p in totalPages" :key="p" :index="p - 1" />
    </XhCarouselIndicatorGroup>
    <div style="flex-basis: 100%; display: flex; justify-content: center; gap: 8px">
      <button
        v-for="opt in options"
        :key="opt.key"
        type="button"
        :aria-pressed="effect === opt.key"
        @click="effect = opt.key"
      >
        {{ opt.label }}
      </button>
    </div>
  </XhCarouselRoot>
</template>
```

```html
<style>
  /* 后两档把条目摞在一起，轨道那条整页位移随之作废 */
  #carousel-effect:not([data-effect="slide"]) [data-xh-part="list"] {
    position: relative;
    transform: none !important;
  }
  #carousel-effect:not([data-effect="slide"]) [data-xh-part="item"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition:
      opacity var(--xh-motion-duration-slide) var(--xh-motion-ease-slide),
      scale var(--xh-motion-duration-slide) var(--xh-motion-ease-slide);
  }
  /* 露在外面的那一张由组件标出来，样式跟着它走 */
  #carousel-effect:not([data-effect="slide"]) [data-xh-part="item"][data-inview] {
    opacity: 1;
  }
  #carousel-effect[data-effect="zoom"] [data-xh-part="item"] {
    scale: 0.9;
  }
  #carousel-effect[data-effect="zoom"] [data-xh-part="item"][data-inview] {
    scale: 1;
  }
</style>

<xh-carousel id="carousel-effect" data-effect="fade" slide-count="4">
  <div data-xh-part="root" style="inline-size: 100%">
    <button data-xh-part="prev-trigger"></button>
    <div data-xh-part="viewport" style="block-size: 140px">
      <div data-xh-part="list">
        <div data-xh-part="item" index="0">
          <div style="display: grid; place-items: center; block-size: 100%">
            城市夜景
          </div>
        </div>
        <div data-xh-part="item" index="1">
          <div style="display: grid; place-items: center; block-size: 100%">
            海岸线
          </div>
        </div>
        <div data-xh-part="item" index="2">
          <div style="display: grid; place-items: center; block-size: 100%">
            雪山
          </div>
        </div>
        <div data-xh-part="item" index="3">
          <div style="display: grid; place-items: center; block-size: 100%">
            沙漠
          </div>
        </div>
      </div>
    </div>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="indicator-group">
      <button data-xh-part="indicator" index="0"></button>
      <button data-xh-part="indicator" index="1"></button>
      <button data-xh-part="indicator" index="2"></button>
      <button data-xh-part="indicator" index="3"></button>
    </div>
    <div
      id="carousel-effect-picker"
      style="flex-basis: 100%; display: flex; justify-content: center; gap: 8px"
    >
      <button type="button" data-effect="slide" aria-pressed="false">平移</button>
      <button type="button" data-effect="fade" aria-pressed="true">淡入</button>
      <button type="button" data-effect="zoom" aria-pressed="false">缩放淡入</button>
    </div>
  </div>
</xh-carousel>

<script type="module">
  // 挡位落在宿主的 data-effect 上，上面那段样式照它选形态
  const carousel = document.getElementById("carousel-effect");
  const picker = document.getElementById("carousel-effect-picker");
  const buttons = [...picker.querySelectorAll("[data-effect]")];

  for (const button of buttons) {
    button.addEventListener("click", () => {
      carousel.dataset.effect = button.dataset.effect;
      for (const other of buttons) {
        other.setAttribute("aria-pressed", String(other === button));
      }
    });
  }
</script>
```

## 设计指引

### 何时使用

- 首屏的营销位、图片画廊这类"内容并列且用户不急着全看"的场景。

### 何时不用

- 每一张都重要、都需要被看到：并排铺开或做成[列表](./list)——轮播里第二张之后的点击率极低。
- 内容是导航入口。

### 特性

- `slidesPerPage` 与 `slidesPerMove` 分开：可以一屏三张、一次挪一张。
- 支持纵向轨道、指针拖拽、回绕与自动播放。
- 指示点可以做成悬停即切页。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-carousel>` |
| Vue 组件 | `XhCarouselAutoplayTrigger` `XhCarouselIndicator` `XhCarouselIndicatorGroup` `XhCarouselItem` `XhCarouselList` `XhCarouselNextTrigger` `XhCarouselPrevTrigger` `XhCarouselRoot` `XhCarouselViewport` |
| 组合式函数 | `useCarousel` |
| 状态机 | `carouselMachine` |
| 皮肤 | `@xihan-ui/styles/carousel.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="carousel"`：**`root`** · **`viewport`** · **`list`** · `item` · `prev-trigger` · `next-trigger` · `autoplay-trigger` · `indicator-group` · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` |  | 当前页，0 基。给定即受控：内部不再自改，只发 onPageChange。 页不是张：一页可能同时露出好几张（见 slidesPerPage）。 |
| `defaultPage` | `number` |  | 非受控初始页，默认 0。 |
| `slideCount` | `number` |  | 条目总数，由作者声明，不从 DOM 数。 |
| `slidesPerPage` | `number` |  | 一屏放几张，默认 1。 |
| `slidesPerMove` | `number` |  | 一次翻几张，默认跟随 slidesPerPage（整屏翻页）。 |
| `orientation` | `Orientation` |  | 轨道方向，默认 horizontal；方向键的轴跟着它走。 |
| `dir` | `Direction` |  | 文字方向。水平轴上同时作用于排版与位移方向：rtl 下"下一张"在左手边， 轨道也要往正方向位移。纵向轨道不受它影响。 |
| `loop` | `boolean` |  | 走到尽头是否回绕，默认 false。 |
| `autoplay` | `boolean \| number` |  | 自动播放。true 用默认间隔，数值即毫秒间隔；缺省 / false / 非正数一律不自动播放。 指针悬停或轮播内任一节点获得焦点时按住计时，离开后从头计满一整个间隔再翻。 减弱动效档下不自动起播：给了间隔也停在 idle，要播得由用户按下播放开关。 |
| `allowPointerDrag` | `boolean` |  | 允许指针拖拽切页，默认 false。鼠标、触摸、触控笔一并门控。 打开后沿轨道那一轴的原生滚动会让位给拖拽，关掉则完全没有拖拽、触摸走原生滚动。 |
| `spacing` | `string` |  | 张与张之间的间距，任意 CSS 长度（如 '12px'）。落成条目自身的内边距，不影响位移算术。 |
| `translations` | `Partial<CarouselTranslations>` |  |  |
| `onPageChange` | `(details: CarouselPageChangeDetails) => void` |  | 页码变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `page-change` | `CarouselPageChangeDetails` | 页码变化；detail 为 `{ page: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCarouselAutoplayTrigger` | `default` | `{ stopped: boolean }` |  |
| `XhCarouselRoot` | `default` | `CarouselRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `autoplay-trigger` | 'paused' \| 'running' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `playing` · `playing.running` · `playing.paused`

**事件**：`PAGE.SET` · `PAGE.PREV` · `PAGE.NEXT` · `AUTOPLAY.START` · `AUTOPLAY.STOP` · `AUTOPLAY.PAUSE` · `AUTOPLAY.RESUME` · `after.autoplay` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`isLastPauseSource` · `canAdvance` · `hasAutoplay`

## connect API

`useCarousel` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页，0 基；恒在 [0, max(totalPages-1, 0)] 内，slideCount 变小后也读得到一个可用的值。 |
| `totalPages` | `number` |  |
| `slideCount` | `number` | 归一后的条目总数（负数/小数/缺省都已收成非负整数）。 |
| `slidesPerPage` | `number` |  |
| `slidesPerMove` | `number` |  |
| `orientation` | `Orientation` |  |
| `slideRange` | `{ start: number, end: number }` | 当前页露出的条目下标区间，0 基闭区间；一张都没有时 end &lt; start。 |
| `pageSnapPoints` | `number[]` | 每一页的首张下标序列，长度即总页数。 |
| `canScrollPrev` | `boolean` |  |
| `canScrollNext` | `boolean` |  |
| `autoplaying` | `boolean` | 自动播放的计时正在走。 |
| `paused` | `boolean` | 自动播放开着但被按住（悬停 / 焦点 / 调用方）。 |
| `autoplayStopped` | `boolean` | 自动播放此刻是不是由用户按停的：计时没在走（idle），或调用方那一路按住了。 与 `paused` 的差别在于它不算悬停与焦点那两路——那两路一挪开就自己续上， 拿它去驱动播放 / 暂停开关的名字与图形，鼠标一碰按钮就会在两态之间跳。 |
| `dragging` | `boolean` |  |
| `isInView` | `(index: number) => boolean` |  |
| `setPage` | `(page: number) => void` | 页码会被收进合法区间（loop 时回绕），越界入参不会写出越界的页。 |
| `goToPrev` | `() => void` |  |
| `goToNext` | `() => void` |  |
| `play` | `() => void` | 开始自动播放；autoplay prop 没给出正的间隔时无事发生。 |
| `pause` | `() => void` | 按住计时（来源记为 api），与悬停 / 焦点叠加计数。 |
| `resume` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `(props: CarouselItemProps) => T['element']` |  |
| `getPrevTriggerProps` | `() => T['button']` |  |
| `getNextTriggerProps` | `() => T['button']` |  |
| `getAutoplayTriggerProps` | `() => T['button']` | 播放 / 暂停开关。没配自动播放（间隔为 0）时转原生 disabled。 |
| `getIndicatorGroupProps` | `() => T['element']` |  |
| `getIndicatorProps` | `(props: CarouselIndicatorProps) => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` | orientation=horizontal，焦点在轮播内 | 翻到下一页；rtl 下反向（走上一页） |
| `ArrowLeft` | orientation=horizontal，焦点在轮播内 | 翻到上一页；rtl 下反向（走下一页） |
| `ArrowDown` | orientation=vertical，焦点在轮播内 | 翻到下一页；横轨下不接管，放行给页面滚动 |
| `ArrowUp` | orientation=vertical，焦点在轮播内 | 翻到上一页；横轨下不接管，放行给页面滚动 |
| `Home` | 焦点在轮播内 | 跳到第一页 |
| `End` | 焦点在轮播内 | 跳到最后一页 |
| `Enter` / `Space` | 焦点在上一张 / 下一张按钮上 | 翻一页；由原生按钮的激活行为负责 |
| `Enter` / `Space` | 焦点在指示点上 | 跳到该指示点对应的页；由原生按钮的激活行为负责 |
| `Tab` / `Shift+Tab` | 任意时刻 | 在两端按钮与各指示点之间逐个停靠；到端点后禁用的按钮自动脱序 |
| `方向键` | 焦点在幻灯片内的输入控件上 | 不接管：交还给控件自己做光标移动 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | label.root |
| `root` | `aria-roledescription` | 'carousel' |
| `root` | `role` | 'region' |
| `viewport` | `aria-atomic` | 'false' |
| `viewport` | `aria-live` | 'off' \| 'polite' |
| `item` | `aria-label` | label.item(index + 1, slideCount) |
| `item` | `aria-roledescription` | 'slide' |
| `item` | `role` | 'group' |
| `prev-trigger` | `aria-controls` | `viewport` 部件的 id |
| `prev-trigger` | `aria-label` | label.prevTrigger |
| `next-trigger` | `aria-controls` | `viewport` 部件的 id |
| `next-trigger` | `aria-label` | label.nextTrigger |
| `autoplay-trigger` | `aria-controls` | `viewport` 部件的 id |
| `autoplay-trigger` | `aria-label` | label.autoplayTriggerPlay \| label.autoplayTriggerPause |
| `indicator-group` | `aria-label` | label.indicatorGroup |
| `indicator-group` | `role` | 'group' |
| `indicator` | `aria-current` | 'true' \| 'false' |
| `indicator` | `aria-label` | label.indicator(index + 1) |

## 样式

默认皮肤 `@xihan-ui/styles/carousel.css` 按部件选择：`[data-scope="carousel"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-autoplay` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `viewport` | `data-dragging` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | props.orientation |
| `list` | `data-dragging` | ''（条件成立时才出现） |
| `list` | `data-orientation` | props.orientation |
| `item` | `data-index` | String(index) |
| `item` | `data-inview` | ''（条件成立时才出现） |
| `item` | `data-orientation` | props.orientation |
| `prev-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `prev-trigger` | `data-orientation` | props.orientation |
| `next-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `next-trigger` | `data-orientation` | props.orientation |
| `autoplay-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `autoplay-trigger` | `data-state` | 'paused' \| 'running' |
| `indicator-group` | `data-orientation` | props.orientation |
| `indicator` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-index` | String(index) |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-carousel-duration` | `list` | `transition` | `default` | `--xh-motion-duration-slide` | carousel 的 list 部件 transition 覆盖槽。 |
| `--xh-carousel-ease` | `list` | `transition` | `default` | `--xh-motion-ease-slide` | carousel 的 list 部件 transition 覆盖槽。 |
| `--xh-carousel-gap` | `root` | `gap` | `default` | `--xh-space-2` | carousel 的 root 部件 gap 覆盖槽。 |
| `--xh-carousel-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | carousel 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-carousel-indicator-bg` | `indicator` | `background` | `default` | `--xh-border-control` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-hover` | `indicator` | `background` | `current`<br>`hover`<br>`not([data-current])` | `--xh-fg-subtle` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-bg-selected` | `indicator` | `background` | `current` | `--xh-bg-brand` | carousel 的 indicator 部件 background 覆盖槽。 |
| `--xh-carousel-indicator-gap` | `indicator-group` | `gap` | `default` | `--xh-space-1` | carousel 的 indicator-group 部件 gap 覆盖槽。 |
| `--xh-carousel-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | carousel 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-carousel-indicator-size` | `indicator` | `block-size`<br>`inline-size` | `default` | `--xh-space-2` | carousel 的 indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-carousel-trigger-bg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background` | `default` | `--xh-bg-surface` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-carousel-trigger-bg-active` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-carousel-trigger-bg-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 background 覆盖槽。 |
| `--xh-carousel-trigger-border` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border` | `default` | `--xh-border-control` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 border 覆盖槽。 |
| `--xh-carousel-trigger-fg` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `color` | `default` | `--xh-fg-default` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 color 覆盖槽。 |
| `--xh-carousel-trigger-radius` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `border-radius` | `default` | `--xh-shape-pill` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 border-radius 覆盖槽。 |
| `--xh-carousel-trigger-shadow-hover` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `box-shadow` | `hover`<br>`not(:disabled)` | `--xh-elevation-raised` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-carousel-trigger-size` | `autoplay-trigger`<br>`next-trigger`<br>`prev-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-md` | carousel 的 autoplay-trigger、next-trigger、prev-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-carousel-viewport-radius` | `viewport` | `border-radius` | `default` | `--xh-shape-surface` | carousel 的 viewport 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `box-shadow` · `scale` · `transform` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：内核读系统的减弱动效偏好，据此决定要不要动。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## 组合

- 每一张放[图片](./image)或[卡片](./card)。

## 最佳实践

- 开了自动播放就把 `autoplay-trigger` 渲出来：它是唯一能把自动翻页停住、且停住之后不会被别的交互重新点着的入口。
- 自动播放在指针悬停或焦点进入时自动暂停，离开后从头计满一整个间隔再翻。
- 减弱动效档下自动播放不会自己起播，此时播放开关是用户唯一的起播入口。
- 指示点要能看出总共几屏、当前第几屏。

## 反模式

- 自动播放且不能暂停：读得慢的人永远读不完一张。
- 把关键信息或唯一的行动入口放在第三张之后。
