来源：https://ui.docs.xihanfun.com/components/marquee

# 跑马灯 `marquee`

内容沿一条轴循环滚动。

## 何时使用

- 公告条、合作方 logo 墙这类"内容多、位置窄、且不要求逐条读完"的展示。

## 何时不用

- 内容重要且必须读到：滚动的文字读起来很费力，且会滚走。
- 是一条需要用户处理的通知：用[警告提示](./alert)。

## 特性

- `autoFill` 自动重复内容铺满容器，接缝处不留空。
- `direction` 换方向，`speed` 调速度；速度按 `--xh-marquee-span` 换算成一圈时长，要逐字对上每秒像素数就把这支槽改到内容的真实长度。
- `pauseOnHover` 悬停暂停，`paused` 由作者说了算——受控那一档比悬停优先。

## 示例

### 基础用法

窗口只露出一段，轨道在里面往左走；滚动整段在皮肤的 @keyframes 里，用的人不写动画

```vue
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const notices = [
  "系统将于本周六 02:00 起停机维护两小时",
  "新版导出支持按列脱敏",
  "本月账单已生成",
];
</script>

<template>
  <XhMarqueeRoot style="max-inline-size: 420px">
    <XhMarqueeContent>
      <span v-for="n in notices" :key="n" style="margin-inline-end: 32px; white-space: nowrap">
        {{ n }}
      </span>
    </XhMarqueeContent>
  </XhMarqueeRoot>
</template>
```

```html
<xh-marquee>
  <div data-xh-part="root" style="max-inline-size: 420px">
    <div data-xh-part="content">
      <!-- 一份内容包一层壳，份与份之间的空白由壳自己收尾 -->
      <div data-xh-copy="0">
        <span style="margin-inline-end: 32px; white-space: nowrap">
          系统将于本周六 02:00 起停机维护两小时
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">
          新版导出支持按列脱敏
        </span>
        <span style="margin-inline-end: 32px; white-space: nowrap">本月账单已生成</span>
      </div>
    </div>
  </div>
</xh-marquee>
```

### 方向

四档：左右走横轴，上下走纵轴。轴另落成 data-orientation，竖着滚的窗口靠 --xh-marquee-block-size 定高

```vue
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const directions = ["left", "right", "up", "down"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="d in directions" :key="d" style="inline-size: 200px">
      <p style="margin-block-end: 8px; font-size: 12px">{{ d }}</p>
      <XhMarqueeRoot
        :direction="d"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <XhMarqueeContent>
          <span v-for="i in 6" :key="i" style="padding: 4px 12px; white-space: nowrap">
            第 {{ i }} 条公告
          </span>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">left</p>
    <xh-marquee direction="left">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">right</p>
    <xh-marquee direction="right">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">up</p>
    <xh-marquee direction="up">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div style="inline-size: 200px">
    <p style="margin-block-end: 8px; font-size: 12px">down</p>
    <xh-marquee direction="down">
      <div
        data-xh-part="root"
        style="
          --xh-marquee-block-size: 5rem;
          border: 1px solid var(--xh-border-default);
          border-radius: 6px;
        "
      >
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 4px 12px; white-space: nowrap">第 1 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 2 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 3 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 4 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 5 条公告</span>
            <span style="padding: 4px 12px; white-space: nowrap">第 6 条公告</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
```

### 重复铺满

autoFill 在轨道里铺两份内容，走完一份第二份正好压在起点上，看不出接缝；不开则整段走完再回来

```vue
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const tags = ["多租户", "字段级脱敏", "动态 API", "工作流", "代码生成"];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 20px">
    <div v-for="fill in [false, true]" :key="String(fill)">
      <p style="margin-block-end: 8px; font-size: 12px">
        {{ fill ? "autoFill：一圈只走一份，接缝处始终有内容" : "不开：整段走出窗口后再从另一侧进来" }}
      </p>
      <XhMarqueeRoot
        :auto-fill="fill"
        :speed="60"
        style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
      >
        <XhMarqueeContent>
          <span v-for="t in tags" :key="t" style="padding: 6px 14px; white-space: nowrap">{{ t }}</span>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 20px">
  <div>
    <p style="margin-block-end: 8px; font-size: 12px">不开：整段走出窗口后再从另一侧进来</p>
    <!-- 给了 speed 时 root 的内联样式归组件管，外观写在宿主元素上 -->
    <xh-marquee
      speed="60"
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 8px; font-size: 12px">autoFill：一圈只走一份，接缝处始终有内容</p>
    <xh-marquee
      auto-fill
      speed="60"
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
          <!-- 第二份是副本：读屏不念第二遍，Tab 也不停在上面 -->
          <div data-xh-copy="1" aria-hidden="true" inert>
            <span style="padding: 6px 14px; white-space: nowrap">多租户</span>
            <span style="padding: 6px 14px; white-space: nowrap">字段级脱敏</span>
            <span style="padding: 6px 14px; white-space: nowrap">动态 API</span>
            <span style="padding: 6px 14px; white-space: nowrap">工作流</span>
            <span style="padding: 6px 14px; white-space: nowrap">代码生成</span>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
```

### 速度与暂停

speed 是每秒像素；pauseOnHover 在指针停下或焦点落进窗口时停住

```vue
<script setup lang="ts">
import { XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const speeds = [30, 60, 140] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <!--
      皮肤拿「一份内容在滚动轴上的长度」除以 speed 算一圈的时长，那个长度取自
      --xh-marquee-span（缺省 600）。内容长度与缺省差得多时把 span 改成真实长度，
      每秒滚过的像素数才逐字对得上。
    -->
    <div v-for="s in speeds" :key="s">
      <p style="margin-block-end: 6px; font-size: 12px">speed = {{ s }}（每秒 {{ s }} 像素）</p>
      <XhMarqueeRoot
        :speed="s"
        auto-fill
        pause-on-hover
        style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
      >
        <XhMarqueeContent>
          <a href="#" style="padding: 6px 14px; white-space: nowrap">
            把指针停在这儿，或用 Tab 聚焦这条链接
          </a>
        </XhMarqueeContent>
      </XhMarqueeRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px">
  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 30（每秒 30 像素）</p>
    <!-- 给了 speed 时 root 的内联样式归组件管，外观写在宿主元素上 -->
    <xh-marquee
      speed="30"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 60（每秒 60 像素）</p>
    <xh-marquee
      speed="60"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>

  <div>
    <p style="margin-block-end: 6px; font-size: 12px">speed = 140（每秒 140 像素）</p>
    <xh-marquee
      speed="140"
      auto-fill
      pause-on-hover
      style="
        display: block;
        max-inline-size: 420px;
        border: 1px solid var(--xh-border-default);
        border-radius: 6px;
      "
    >
      <div data-xh-part="root">
        <div data-xh-part="content">
          <div data-xh-copy="0">
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
          <div data-xh-copy="1" aria-hidden="true" inert>
            <a href="#" style="padding: 6px 14px; white-space: nowrap">
              把指针停在这儿，或用 Tab 聚焦这条链接
            </a>
          </div>
        </div>
      </div>
    </xh-marquee>
  </div>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-marquee>` |
| Vue 组件 | `XhMarqueeContent` `XhMarqueeRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/marquee.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="marquee"`：**`root`** · **`content`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `autoFill` | `boolean` |  | 内容不足时重复铺满：轨道里铺两份内容，走完一份正好接上第二份。 |
| `direction` | `MarqueeDirection` |  | 滚动方向，缺省 left。 |
| `paused` | `boolean` |  | 受控暂停：翻真即停在当前位置，翻假接着走。比 pauseOnHover 优先。 |
| `pauseOnHover` | `boolean` |  | 指针停在窗口上时暂停；键盘焦点落进窗口时同样暂停。 |
| `speed` | `number` |  | 名义上的每秒像素数。写成根上的内联变量，皮肤拿一份内容的长度除以它换成一圈的时长。 那个长度取的是 `--xh-marquee-span`——CSS 读不到布局尺寸，槽里放的是一个缺省值。 把它改到与内容真实长度一致时速度才逐字等于每秒这么多像素，否则它是一个成比例的快慢档。 只收有限正数；其余值不写出，退回皮肤缺省。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `copies` | `number` | 轨道里要铺几份内容：autoFill 开是 2，关是 1。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/marquee.css` 按部件选择：`[data-scope="marquee"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-marquee-block-size` · `--xh-marquee-gap` · `--xh-marquee-span` · `--xh-marquee-speed`

## 动效

关键帧 `xh-marquee-x` · `xh-marquee-y` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## 响应式

皮肤另按输入能力分档：`hover: hover`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 里面放[图片](./image)做 logo 墙，或[徽标](./badge)做标签流。

## 最佳实践

- 一定要能暂停：悬停暂停是最低要求。
- 系统开启减弱动效时应当停下来。

## 反模式

- 用它承载唯一的重要信息（故障公告、截止时间）。
- 速度快到读不完一句话。
