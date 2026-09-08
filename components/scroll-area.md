来源：https://ui.docs.xihanfun.com/components/scroll-area

# 滚动区域 `scroll-area`

给一块溢出的内容配一条外观受控的滚动条。滚动本身走的是浏览器原生通路，组件只画滚动条。

## 何时使用

- 滚动条的外观要跟站点一致（各平台的原生滚动条长得很不一样）。
- 需要控制滚动条什么时候露面。

## 何时不用

- 整页滚动：交给浏览器，别套。
- 内容是长列表且条数很多：用[虚拟滚动](./virtualizer)，只画滚动条解决不了渲染量。
- 滚到底要继续加载：用[无限滚动](./infinite-scroll)。

## 特性

- 它是视口加两条[滚动条](./scrollbar)的组装：`scrollbar` 挂载点同时是那条滚动条的根，里面照滚动条的写法摆轨道、滑块与交叉口；显隐、拖动、几何全是滚动条那一套。
- `root` 要有确定高度，视口才量得出溢出。
- `type` 决定滚动条什么时候露面：缺省的 `scroll-hover` 滚动时或指针进来时露、都停下后收起，`hover` 只认指针，`scroll` 只认滚动，`auto` 溢出就露，`always` 恒露。
- 只有 `auto` 与 `always` 在视口里占一条道；`scroll-hover` / `hover` / `scroll` 三档浮在内容之上，视口宽度一点不减。
- `orientation` 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格。
- `variant="fade"` 给内容的边缘加一道渐隐：哪一头还滚得动就淡出哪一侧，滚到头即收。带宽跟着 `size` 走，
  自绘滚动条不受它影响。两条轴各自到没到头也落成视口上的 `data-at-min-*` / `data-at-max-*`，
  要自己画「还能往下滚」的提示可以直接接这几个属性。
- `dir` 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。

## 示例

### 基础用法

root 要有确定高度，视口才量得出溢出；滚动走的是浏览器原生通路，组件只画滚动条

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const lines = Array.from({ length: 30 }, (_, i) => `第 ${i + 1} 行内容`);
</script>

<template>
  <XhScrollAreaRoot style="block-size: 180px; inline-size: 100%; max-inline-size: 420px">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p v-for="line in lines" :key="line" style="margin: 0; line-height: 24px">
          {{ line }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
```

```html
<xh-scroll-area id="scroll-area-basic">
  <div data-xh-part="root" style="block-size: 180px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 8px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 30 行内容填进内容层
  const content = document
    .getElementById("scroll-area-basic")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 30; i++) {
    const line = document.createElement("p");
    line.style.cssText = "margin: 0; line-height: 24px";
    line.textContent = `第 ${i} 行内容`;
    content.append(line);
  }
</script>
```

### 显隐时机

type 决定滚动条什么时候露面：缺省的 scroll-hover 滚动或指针进来都露，hover 只认指针，always 恒露占一条道

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const types = ["scroll-hover", "hover", "always", "scroll"] as const;
const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行`);
</script>

<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="type in types" :key="type" style="display: grid; gap: 6px">
      <span>type = {{ type }}</span>
      <XhScrollAreaRoot :type="type" style="block-size: 140px; inline-size: 180px">
        <XhScrollAreaViewport>
          <XhScrollAreaContent style="padding: 8px 12px">
            <p v-for="line in lines" :key="line" style="margin: 0; line-height: 22px">
              {{ line }}
            </p>
          </XhScrollAreaContent>
        </XhScrollAreaViewport>
        <XhScrollAreaScrollbar orientation="vertical">
          <XhScrollAreaTrack>
            <XhScrollAreaThumb />
          </XhScrollAreaTrack>
        </XhScrollAreaScrollbar>
      </XhScrollAreaRoot>
    </div>
  </div>
</template>
```

```html
<div id="scroll-area-type" style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
  <div style="display: grid; gap: 6px">
    <span>type = scroll-hover</span>
    <xh-scroll-area type="scroll-hover">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 180px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>
  <div style="display: grid; gap: 6px">
    <span>type = hover</span>
    <xh-scroll-area type="hover">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 180px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>

  <div style="display: grid; gap: 6px">
    <span>type = always</span>
    <xh-scroll-area type="always">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 180px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>

  <div style="display: grid; gap: 6px">
    <span>type = scroll</span>
    <xh-scroll-area type="scroll">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 180px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>
</div>

<script type="module">
  // 每一档都填上同样的 20 行
  const contents = document
    .getElementById("scroll-area-type")
    .querySelectorAll('[data-xh-part="content"]');
  for (const content of contents) {
    for (let i = 1; i <= 20; i++) {
      const line = document.createElement("p");
      line.style.cssText = "margin: 0; line-height: 22px";
      line.textContent = `第 ${i} 行`;
      content.append(line);
    }
  }
</script>
```

### 双轴与拐角

两条轴各写一条滚动条，corner 补上右下角那块空白；内容要比视口宽，横轴才量得出溢出

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaCorner,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = Array.from(
  { length: 16 },
  (_, i) => `第 ${i + 1} 行 —— 这一行故意写得很长，长到横向也需要滚动才看得完整句话`,
);
</script>

<template>
  <XhScrollAreaRoot
    type="always"
    style="block-size: 160px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p
          v-for="row in rows"
          :key="row"
          style="margin: 0; line-height: 24px; white-space: nowrap"
        >
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
      <XhScrollAreaCorner />
    </XhScrollAreaScrollbar>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
```

```html
<xh-scroll-area id="scroll-area-both-axes" type="always">
  <div data-xh-part="root" style="block-size: 160px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 8px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
      <div data-xh-part="corner"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="horizontal">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 16 行长句，不换行，横轴因此也溢出
  const content = document
    .getElementById("scroll-area-both-axes")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 16; i++) {
    const line = document.createElement("p");
    line.style.cssText = "margin: 0; line-height: 24px; white-space: nowrap";
    line.textContent = `第 ${i} 行 —— 这一行故意写得很长，长到横向也需要滚动才看得完整句话`;
    content.append(line);
  }
</script>
```

### 只管一条轴

orientation 关掉的那条轴滚动条恒不显形，视口那一向也不再滚，不留滚不回来的暗格

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cards = Array.from({ length: 12 }, (_, i) => `卡片 ${i + 1}`);
</script>

<template>
  <XhScrollAreaRoot
    orientation="horizontal"
    type="always"
    style="block-size: 110px; inline-size: 100%; max-inline-size: 420px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="display: flex; gap: 10px; padding: 10px 12px">
        <div
          v-for="card in cards"
          :key="card"
          style="
            flex: none;
            display: grid;
            place-items: center;
            inline-size: 96px;
            block-size: 64px;
            border: 1px solid var(--xh-border-subtle);
            border-radius: 8px;
          "
        >
          {{ card }}
        </div>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="horizontal">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
```

```html
<xh-scroll-area id="scroll-area-orientation" orientation="horizontal" type="always">
  <div data-xh-part="root" style="block-size: 110px; inline-size: 100%; max-inline-size: 420px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="display: flex; gap: 10px; padding: 10px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="horizontal">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 12 张卡片横着排，宽度加起来超过视口
  const content = document
    .getElementById("scroll-area-orientation")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 12; i++) {
    const card = document.createElement("div");
    card.style.cssText =
      "flex: none; display: grid; place-items: center; inline-size: 96px; block-size: 64px; border: 1px solid var(--xh-border-subtle); border-radius: 8px";
    card.textContent = `卡片 ${i}`;
    content.append(card);
  }
</script>
```

### 收起的等待

type 为 scroll 时滚动条停手后不立刻收起，hideDelay 决定还留多少毫秒

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const cases = [
  { delay: 200, label: "200ms：停手就收" },
  { delay: 2000, label: "2000ms：停手后还留两秒" },
];
const lines = Array.from({ length: 20 }, (_, i) => `第 ${i + 1} 行`);
</script>

<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="item in cases" :key="item.delay" style="display: grid; gap: 6px">
      <span>{{ item.label }}</span>
      <XhScrollAreaRoot
        type="scroll"
        :hide-delay="item.delay"
        style="block-size: 140px; inline-size: 200px"
      >
        <XhScrollAreaViewport>
          <XhScrollAreaContent style="padding: 8px 12px">
            <p v-for="line in lines" :key="line" style="margin: 0; line-height: 22px">
              {{ line }}
            </p>
          </XhScrollAreaContent>
        </XhScrollAreaViewport>
        <XhScrollAreaScrollbar orientation="vertical">
          <XhScrollAreaTrack>
            <XhScrollAreaThumb />
          </XhScrollAreaTrack>
        </XhScrollAreaScrollbar>
      </XhScrollAreaRoot>
    </div>
  </div>
</template>
```

```html
<div id="scroll-area-hide-delay" style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
  <div style="display: grid; gap: 6px">
    <span>200ms：停手就收</span>
    <xh-scroll-area type="scroll" hide-delay="200">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 200px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>

  <div style="display: grid; gap: 6px">
    <span>2000ms：停手后还留两秒</span>
    <xh-scroll-area type="scroll" hide-delay="2000">
      <div data-xh-part="root" style="block-size: 140px; inline-size: 200px">
        <div data-xh-part="viewport">
          <div data-xh-part="content" style="padding: 8px 12px"></div>
        </div>
        <div data-xh-part="scrollbar" orientation="vertical">
          <div data-xh-part="track">
            <div data-xh-part="thumb"></div>
          </div>
        </div>
      </div>
    </xh-scroll-area>
  </div>
</div>

<script type="module">
  // 两份都填上同样的 20 行
  const contents = document
    .getElementById("scroll-area-hide-delay")
    .querySelectorAll('[data-xh-part="content"]');
  for (const content of contents) {
    for (let i = 1; i <= 20; i++) {
      const line = document.createElement("p");
      line.style.cssText = "margin: 0; line-height: 22px";
      line.textContent = `第 ${i} 行`;
      content.append(line);
    }
  }
</script>
```

### 边缘渐隐

variant="fade" 让还滚得动的那一侧把内容淡出，滚到头即收；带宽跟着 size 走

```vue
<script setup lang="ts">
import {
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
} from "@xihan-ui/vue";

const rows = Array.from({ length: 18 }, (_, i) => `第 ${i + 1} 行内容`);
</script>

<template>
  <XhScrollAreaRoot
    variant="fade"
    size="lg"
    style="block-size: 180px; inline-size: 100%; max-inline-size: 320px"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 8px 12px">
        <p v-for="row in rows" :key="row" style="margin: 0; line-height: 28px">
          {{ row }}
        </p>
      </XhScrollAreaContent>
    </XhScrollAreaViewport>
    <XhScrollAreaScrollbar orientation="vertical">
      <XhScrollAreaTrack>
        <XhScrollAreaThumb />
      </XhScrollAreaTrack>
    </XhScrollAreaScrollbar>
  </XhScrollAreaRoot>
</template>
```

```html
<xh-scroll-area id="scroll-area-fade" variant="fade" size="lg">
  <div data-xh-part="root" style="block-size: 180px; inline-size: 100%; max-inline-size: 320px">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 8px 12px"></div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </div>
</xh-scroll-area>

<script type="module">
  // 18 行，纵向溢出，两端各铺一道渐隐带
  const content = document
    .getElementById("scroll-area-fade")
    .querySelector('[data-xh-part="content"]');
  for (let i = 1; i <= 18; i++) {
    const line = document.createElement("p");
    line.style.cssText = "margin: 0; line-height: 28px";
    line.textContent = `第 ${i} 行内容`;
    content.append(line);
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scroll-area>` |
| Vue 组件 | `XhScrollAreaContent` `XhScrollAreaCorner` `XhScrollAreaRoot` `XhScrollAreaScrollbar` `XhScrollAreaThumb` `XhScrollAreaTrack` `XhScrollAreaViewport` |
| 组合式函数 | `useScrollArea` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/scroll-area.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="scroll-area"`：**`root`** · **`viewport`** · **`content`** · `scrollbar`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dir` | `Direction` |  | 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。 |
| `forceVisible` | `boolean` |  | 触屏（粗指针）上也画自绘滚动条，默认 false：缺省交给原生滚动。 |
| `hideDelay` | `number` |  | 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 |
| `orientation` | `ScrollAreaOrientation` |  | 哪几条轴归本组件管，默认 both。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，换的是滚动条厚度，也是边缘渐隐的带宽。 |
| `type` | `ScrollbarType` |  | 滚动条露面的时机，默认 scroll-hover。 |
| `variant` | `ScrollAreaVariant` |  | 形态：plain / fade，默认 plain。 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhScrollAreaRoot` | `default` | `ScrollAreaRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `scrollbar` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

## connect API

`useScrollArea` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `type` | `ScrollbarType` |  |
| `orientation` | `ScrollAreaOrientation` |  |
| `vertical` | `ScrollAreaAxisState` |  |
| `horizontal` | `ScrollAreaAxisState` |  |
| `draggingAxis` | `Orientation \| null` | 正被拖动的那条轴；没在拖为 null。 |
| `cornerVisible` | `boolean` | 右下角补丁该不该显形：两条滚动条同时在场才有它的位置。 |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getScrollbarProps` | `(props: ScrollAreaScrollbarProps) => T['element']` | 某条轴的滚动条挂载点，同时充当那条 scrollbar 的根节点。 |
| `getTrackProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |  |
| `getThumbProps` | `(props: ScrollAreaScrollbarProps) => T['element']` |  |
| `getCornerProps` | `() => T['element']` | 交叉口补丁，写在竖条的挂载点里；只有两条都在场时才显形。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 焦点走到滚动区 | 视口带 tabindex=0，键盘用户能停在滚动区上；组件只在这一处动过 Tab 序列 |
| `PageUp` / `PageDown` | focus in viewport | 按视口高度翻页滚动；组件不监听、不拦截 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus in viewport | 逐行/逐列滚动；组件不监听、不拦截 |
| `Home` / `End` | focus in viewport | 滚到内容两端；组件不监听、不拦截 |
| `Space` / `Shift+Space` | focus in viewport | 整屏翻页；组件不监听、不拦截 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `scrollbar` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/scroll-area.css` 按部件选择：`[data-scope="scroll-area"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-reveal-mode` | props.type |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |
| `viewport` | `data-at-max-horizontal` | ''（条件成立时才出现） |
| `viewport` | `data-at-max-vertical` | ''（条件成立时才出现） |
| `viewport` | `data-at-min-horizontal` | ''（条件成立时才出现） |
| `viewport` | `data-at-min-vertical` | ''（条件成立时才出现） |
| `viewport` | `data-lane-horizontal` | ''（条件成立时才出现） |
| `viewport` | `data-lane-vertical` | ''（条件成立时才出现） |
| `viewport` | `data-native` | ''（条件成立时才出现） |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-size` | props.size |
| `viewport` | `data-variant` | props.variant |
| `content` | `data-orientation` | props.orientation |
| `scrollbar` | `data-dragging` | ''（条件成立时才出现） |
| `scrollbar` | `data-gutter` | ''（条件成立时才出现） |
| `scrollbar` | `data-native` | ''（条件成立时才出现） |
| `scrollbar` | `data-orientation` | axis |
| `scrollbar` | `data-reveal-mode` | props.type |
| `scrollbar` | `data-scrolling` | ''（条件成立时才出现） |
| `scrollbar` | `data-size` | props.size |
| `scrollbar` | `data-state` | 'visible' \| 'hidden' |
| `corner` | `data-state` | 'visible' \| 'hidden' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-scroll-area-fade-size`

## 动效

`opacity` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 放进[分栏](./splitter)的面板、[对话框](./dialog)的内容区、[菜单](./menu)的长条目列表。
- 把[表格](./table)放进视口：表格不再自己定高与滚，吸顶表头与吸附列钉在视口上，两条滚动条照常工作。

## 最佳实践

- 触屏（粗指针）上默认交给原生滚动、不画自绘滚动条；`forceVisible` 打开才画，那时别用 `hover`：那里没有悬停。
- 内容可滚时给出可见提示（渐隐边缘或恒显滚动条），否则用户不知道下面还有东西。

## 反模式

- 把 `root` 的高度留给内容撑：量不出溢出，滚动条永远不出现。
- 用它包住整页，再在里面嵌套多层滚动区域：滚轮落在哪一层不可预期。
