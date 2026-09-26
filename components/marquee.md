来源：https://ui.docs.xihanfun.com/components/marquee

# Marquee 跑马灯

内容沿一条轴循环滚动。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/marquee" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/marquee.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/marquee" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/marquee" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/marquee.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

窗口只显示一段，轨道在其中向左滚动；滚动整段在皮肤的 @keyframes 中，使用者不写动画

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

## 组件结构

加粗的是必需部件。

`data-scope="marquee"`：**`root`** · **`content`** · `autoplay-trigger`

## 示例

### 方向

四档：左右沿横轴，上下沿纵轴。轴另写为 data-orientation，竖向滚动的窗口依靠 --xh-marquee-block-size 定高

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

autoFill 在轨道中铺设两份内容，滚完一份时第二份正好位于起点，看不出接缝；不开启则整段滚完再回到起点

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

### 速度与悬停暂停

speed 是每秒像素；指针停下或焦点落进窗口时暂停，缺省即开

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

### 暂停开关

窗口行尾压一颗暂停开关，触屏与键盘也停得住；名字与图标随状态换成下一步的动作

```vue
<script setup lang="ts">
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from "@xihan-ui/vue";

const notices = ["系统将于本周六 02:00 起停机维护两小时", "新版导出支持按列脱敏", "本月账单已生成"];
</script>

<template>
  <XhMarqueeRoot
    auto-fill
    style="max-inline-size: 420px; border: 1px solid var(--xh-border-default); border-radius: 6px"
  >
    <XhMarqueeContent>
      <span v-for="n in notices" :key="n" style="padding: 10px 14px; white-space: nowrap">{{ n }}</span>
    </XhMarqueeContent>
    <!-- 放在 root 里、紧跟轨道；不给内容时皮肤画暂停 / 播放图标 -->
    <XhMarqueeAutoplayTrigger />
  </XhMarqueeRoot>
</template>
```

```html
<xh-marquee
  auto-fill
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
        <span style="padding: 10px 14px; white-space: nowrap">系统将于本周六 02:00 起停机维护两小时</span>
        <span style="padding: 10px 14px; white-space: nowrap">新版导出支持按列脱敏</span>
        <span style="padding: 10px 14px; white-space: nowrap">本月账单已生成</span>
      </div>
      <div data-xh-copy="1" aria-hidden="true" inert>
        <span style="padding: 10px 14px; white-space: nowrap">系统将于本周六 02:00 起停机维护两小时</span>
        <span style="padding: 10px 14px; white-space: nowrap">新版导出支持按列脱敏</span>
        <span style="padding: 10px 14px; white-space: nowrap">本月账单已生成</span>
      </div>
    </div>
    <!-- 写在 root 里、紧跟轨道；不给内容时皮肤画暂停 / 播放图标 -->
    <button data-xh-part="autoplay-trigger"></button>
  </div>
</xh-marquee>
```

## 设计指引

### 何时使用

- 公告条、合作方 logo 墙等内容多、位置窄且不要求逐条读完的展示。

### 何时不用

- 内容重要且必须被读到：滚动文字阅读费力，且会滚走。
- 需要用户处理的通知使用[警告提示](./alert)。

### 特性

- `autoFill` 自动重复内容铺满容器，接缝处不留空。
- `direction` 切换方向，`speed` 调整速度；速度按 `--xh-marquee-span` 换算为一圈时长，需要精确对应每秒像素数时把该槽改为内容的真实长度。
- `pauseOnHover` 在指针悬停或焦点落入窗口时暂停，缺省开启，设为 `false` 关闭；指针或焦点停在暂停开关上不计入。
- 暂停开关 `autoplay-trigger` 是窗口行尾的单图标按钮，指针、键盘与触屏都能停住滚动；可及名随状态切换为下一步的动作，文案由 `translations` 覆盖。
- `paused` / `defaultPaused` 控制暂停状态，变化经 `paused-change` 通知；暂停状态优先于悬停。

### 组合

- 内部放[图片](./image)组成 logo 墙，或[徽标](./badge)组成标签流。

### 最佳实践

- 持续滚动的内容必须提供暂停开关：悬停暂停在触屏上不存在，键盘用户也需要一个明确的停止入口（WCAG 2.2.2）。
- 系统开启减弱动效时轨道停止、窗口改为可滚动，暂停开关随之隐藏。

### 反模式

- 用它承载唯一的重要信息（故障公告、截止时间）。
- 速度过快，无法读完一句话。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-marquee>` |
| Vue 组件 | `XhMarqueeAutoplayTrigger` `XhMarqueeContent` `XhMarqueeRoot` |
| 状态机 | `marqueeMachine` |
| 皮肤 | `@xihan-ui/styles/marquee.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `direction` | `MarqueeDirection` |  | 滚动方向，默认 left。 |
| `speed` | `number` |  | 名义上的每秒像素数。写为根上的内联变量，皮肤用一份内容的长度除以它换算为一圈的时长。 该长度取自 `--xh-marquee-span`：CSS 无法读取布局尺寸，槽中存放的是一个默认值。 把它修改为与内容真实长度一致时速度才逐字等于每秒该像素数，否则它是一个成比例的快慢档。 只接受有限正数；其余值不写出，回退为皮肤默认值。 |
| `pauseOnHover` | `boolean` |  | 指针停在窗口上、或键盘焦点落进窗口时暂停，默认开启；写 false 关掉。 |
| `paused` | `boolean` |  | 受控暂停：为真即停在当前位置，为假继续移动。给了它，暂停开关只报 onPausedChange，由作者写回。 |
| `defaultPaused` | `boolean` |  | 非受控暂停的初值，默认 false。 |
| `autoFill` | `boolean` |  | 内容不足时重复铺满：轨道中铺两份内容，走完一份正好接上第二份。 |
| `translations` | `Partial<MarqueeTranslations>` |  | 暂停开关在两种状态下的可及名，默认英文。 |
| `onPausedChange` | `(details: MarqueePausedChangeDetails) => void` |  | 暂停状态变化时回调：暂停开关、setPaused 与受控写回都经过它。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `paused-change` | `MarqueePausedChangeDetails` | 暂停状态变化（暂停开关、setPaused 或受控写回）；detail 为 `{ paused: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhMarqueeRoot` | `default` | — |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `autoplay-trigger` | 'paused' \| 'running' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`PAUSED.SET` · `PAUSED.TOGGLE` · `PRESS.START` · `PRESS.END`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `copies` | `number` | 轨道中铺设的内容份数：autoFill 开启为 2，关闭为 1。 |
| `paused` | `boolean` | 是否被暂停开关或受控属性停住；悬停与聚焦的临时暂停不算。 |
| `setPaused` | `(paused: boolean) => void` | 程序化停住或继续，与按暂停开关走同一路径。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getAutoplayTriggerProps` | `() => T['button']` | 暂停开关：可及名是下一步的动作，data-state 投影 running / paused。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in autoplay-trigger | 在停住与继续之间切换；名字随之换成下一步的动作 |
| `Enter` / `Space` | held in autoplay-trigger | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `autoplay-trigger` | `aria-controls` | scope.partId('marquee', 'content') |
| `autoplay-trigger` | `aria-label` | label.autoplayTriggerPlay \| label.autoplayTriggerPause |

## 样式参考

### 皮肤

`@xihan-ui/styles/marquee.css` 使用 `[data-scope="marquee"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `autoplay-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `autoplay-trigger` | `data-state` | 'paused' \| 'running' |
| `autoplay-trigger` | `data-xh-action-control` | '' |
| `autoplay-trigger` | `data-xh-action-display` | 'always' |
| `autoplay-trigger` | `data-xh-action-profile` | 'icon' |
| `autoplay-trigger` | `data-xh-action-size` | 'md' |
| `autoplay-trigger` | `data-xh-action-variant` | 'outline' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-marquee-block-size` | `root` | `block-size` | `orientation=vertical` | `10rem` | marquee 的 root 部件 block-size 覆盖槽。 |
| `--xh-marquee-gap` | `content`<br>`root` | `padding-block-end`<br>`padding-inline-end` | `orientation=vertical`<br>`xh-copy` | `--xh-space-6` | marquee 的 content、root 部件 padding-block-end、padding-inline-end 覆盖槽。 |
| `--xh-marquee-icon-size` | `autoplay-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | marquee 的 autoplay-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-marquee-span` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `600` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
| `--xh-marquee-speed` | `content`<br>`root` | `animation-duration` | `auto-fill`<br>`default` | `60` | marquee 的 content、root 部件 animation-duration 覆盖槽。 |
| `--xh-marquee-trigger-bg` | `autoplay-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-bg-surface` | marquee 的 autoplay-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-marquee-trigger-bg-active` | `autoplay-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover-opaque` | marquee 的 autoplay-trigger 部件 background-color 覆盖槽。 |
| `--xh-marquee-trigger-bg-hover` | `autoplay-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-opaque` | marquee 的 autoplay-trigger 部件 background-color 覆盖槽。 |
| `--xh-marquee-trigger-inset` | `autoplay-trigger`<br>`root` | `inset-block-end`<br>`inset-inline-end` | `default`<br>`orientation=vertical` | `--xh-space-1` | marquee 的 autoplay-trigger、root 部件 inset-block-end、inset-inline-end 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

可覆盖的动效槽：`--xh-marquee-span` · `--xh-marquee-speed`。

关键帧 `xh-marquee-x` · `xh-marquee-y` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`hover: hover`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
