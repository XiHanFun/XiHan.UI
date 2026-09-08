来源：https://ui.docs.xihanfun.com/components/hover-card

# 悬浮卡片 `hover-card`

指针停留一会儿才出现的信息卡：预览一个对象，不打断当前动作。

## 何时使用

- 链接或头像的预览：用户资料、文档摘要、商品简介。
- 信息属于"顺便看看"，不需要专门去点。

## 何时不用

- 内容需要交互（按钮、表单）：用[气泡卡片](./popover)。
- 只是一句文字：用[文字提示](./tooltip)。
- 触摸端是主要场景。

## 特性

- `openDelay` 与 `closeDelay` 一对：进入要停留、离开有宽限，指针斜穿去卡片上不会误收。
- 可受控。

## 示例

### 基础用法

与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到

```vue
<script setup lang="ts">
import {
  XhButton,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardDescription,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const following = ref(false);
</script>

<template>
  <div>
    最近这批组件由
    <XhHoverCardRoot placement="bottom-start">
      <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <XhHoverCardTitle>XiHan.UI</XhHoverCardTitle>
          <XhHoverCardDescription>
            框架无关的设计系统运行时，Vue 与 Web Components 共用同一套无头内核。
          </XhHoverCardDescription>
          <XhButton size="sm" variant="outline" @click="following = !following">
            {{ following ? "已关注" : "关注" }}
          </XhButton>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
    推上来。
  </div>
</template>
```

```html
<div>
  最近这批组件由
  <xh-hover-card placement="bottom-start">
    <div data-xh-part="root">
      <button data-xh-part="trigger">@xihan</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <h2 data-xh-part="title">XiHan.UI</h2>
          <p data-xh-part="description">
            框架无关的设计系统运行时，Vue 与 Web Components 共用同一套无头内核。
          </p>
          <xh-button size="sm" variant="outline">
            <button data-xh-part="root" id="hover-card-basic-follow">
              关注
            </button>
          </xh-button>
        </div>
      </div>
    </div>
  </xh-hover-card>
  推上来。
</div>

<script type="module">
  // 卡片里的按钮点得到：在关注与已关注之间切换
  const follow = document.getElementById("hover-card-basic-follow");
  follow.addEventListener("click", () => {
    follow.textContent = follow.textContent === "关注" ? "已关注" : "关注";
  });
</script>
```

### 延时

openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间

```vue
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhHoverCardRoot placement="bottom-start">
      <XhHoverCardTrigger>默认（700 / 300）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>停够 700ms 才展开，指针移开 300ms 才收起。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>

    <XhHoverCardRoot placement="bottom-start" :open-delay="0" :close-delay="800">
      <XhHoverCardTrigger>快开慢收（0 / 800）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>指针一进就展开，移开后还留 800ms 给你走回来。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card placement="bottom-start">
    <div data-xh-part="root">
      <button data-xh-part="trigger">默认（700 / 300）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>停够 700ms 才展开，指针移开 300ms 才收起。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-start" open-delay="0" close-delay="800">
    <div data-xh-part="root">
      <button data-xh-part="trigger">快开慢收（0 / 800）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>指针一进就展开，移开后还留 800ms 给你走回来。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
```

### 受控

传了 open 就由宿主说了算；悬停与 Escape 都只发意图，最终写不写由外面这颗按钮同一份状态决定

```vue
<script setup lang="ts">
import {
  XhButton,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhHoverCardRoot v-model:open="open" placement="bottom-start">
      <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <strong>XiHan.UI</strong>
          <span>卡片从不抢焦点，也不锁页面滚动。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>

    <XhButton variant="outline" @click="open = !open">
      {{ open ? "收起" : "展开" }}
    </XhButton>
    <span>当前：{{ open ? "展开" : "收起" }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-hover-card id="hover-card-controlled" open="false" placement="bottom-start">
    <div data-xh-part="root">
      <button data-xh-part="trigger">@xihan</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>XiHan.UI</strong>
          <span>卡片从不抢焦点，也不锁页面滚动。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-button id="hover-card-controlled-toggle" variant="outline">
    <button data-xh-part="root">展开</button>
  </xh-button>
  <span>当前：<span id="hover-card-controlled-state">收起</span></span>
</div>

<script type="module">
  // 展开态由这段脚本持有：组件只发意图，写回 open 才真的展开
  const card = document.getElementById("hover-card-controlled");
  const toggle = document.getElementById("hover-card-controlled-toggle");
  const label = toggle.querySelector('[data-xh-part="root"]');
  const readout = document.getElementById("hover-card-controlled-state");

  function apply(open) {
    card.open = open;
    label.textContent = open ? "收起" : "展开";
    readout.textContent = open ? "展开" : "收起";
  }

  toggle.addEventListener("click", () => apply(!card.open));
  card.addEventListener("open-change", (event) => apply(event.detail.open));
</script>
```

### 尺寸

三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别

```vue
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhHoverCardRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.value"
      placement="bottom-start"
      :open-delay="0"
    >
      <XhHoverCardTrigger>{{ s.label }}</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <strong>{{ s.label }}档</strong>
          <span>size = {{ s.value ?? "未指定" }}。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card size="sm" placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">小</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>小档</strong>
          <span>size = sm。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">缺省</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>缺省档</strong>
          <span>size = 未指定。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card size="lg" placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">大</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>大档</strong>
          <span>size = lg。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
```

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离

```vue
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";

const cases = [
  { placement: "top", offset: 8, label: "上方" },
  { placement: "right", offset: 8, label: "右侧" },
  { placement: "bottom-end", offset: 20, label: "下方靠尾（间距 20）" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <XhHoverCardRoot
      v-for="c in cases"
      :key="c.placement"
      :placement="c.placement"
      :offset="c.offset"
      :open-delay="0"
    >
      <XhHoverCardTrigger>{{ c.label }}</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <strong>{{ c.label }}</strong>
          <span>请求的朝向是 {{ c.placement }}，间距 {{ c.offset }}px。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-hover-card placement="top" offset="8" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">上方</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>上方</strong>
          <span>请求的朝向是 top，间距 8px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="right" offset="8" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">右侧</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>右侧</strong>
          <span>请求的朝向是 right，间距 8px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>

  <xh-hover-card placement="bottom-end" offset="20" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">下方靠尾（间距 20）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <strong>下方靠尾（间距 20）</strong>
          <span>请求的朝向是 bottom-end，间距 20px。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
</div>
```

### 禁用

disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待

```vue
<script setup lang="ts">
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const clicks = ref(0);
</script>

<template>
  <div style="display: flex; align-items: center; gap: 16px">
    <XhHoverCardRoot disabled placement="bottom-start" :open-delay="0">
      <XhHoverCardTrigger @click="clicks++">@xihan（卡片已关）</XhHoverCardTrigger>
      <XhHoverCardPositioner>
        <XhHoverCardContent>
          <XhHoverCardArrow />
          <span>这张卡片不会出现。</span>
        </XhHoverCardContent>
      </XhHoverCardPositioner>
    </XhHoverCardRoot>
    <span>已点 {{ clicks }} 次</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 16px">
  <xh-hover-card id="hover-card-disabled" disabled placement="bottom-start" open-delay="0">
    <div data-xh-part="root">
      <button data-xh-part="trigger">@xihan（卡片已关）</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="arrow"></div>
          <span>这张卡片不会出现。</span>
        </div>
      </div>
    </div>
  </xh-hover-card>
  <span>已点 <span id="hover-card-disabled-count">0</span> 次</span>
</div>

<script type="module">
  // 触发器照样可点，计数落在后面那行文字上
  const card = document.getElementById("hover-card-disabled");
  const trigger = card.querySelector('[data-xh-part="trigger"]');
  const readout = document.getElementById("hover-card-disabled-count");
  let count = 0;
  trigger.addEventListener("click", () => {
    count += 1;
    readout.textContent = String(count);
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hover-card>` |
| Vue 组件 | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardDescription` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTitle` `XhHoverCardTrigger` |
| 组合式函数 | `useHoverCard` |
| 状态机 | `hoverCardMachine` |
| 皮肤 | `@xihan-ui/styles/hover-card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="hover-card"`：`root` · **`trigger`** · `positioner` · **`content`** · `title` · `description` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 |
| `dir` | `Direction` |  | 文字方向，仅在显式给出时写到根节点上。 |
| `disabled` | `boolean` |  | 只关掉卡片本身，不影响 trigger 元素自身的可用性。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定卡片的内边距档位。 |
| `onOpenChange` | `(details: HoverCardOpenChangeDetails) => void` |  | open 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `HoverCardOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHoverCardRoot` | `default` | `HoverCardRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusHeld`

## connect API

`useHoverCard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开卡片即收起，都不走延时 |
| `Escape` | 浮层可见（含收起等待期） | 立即收起，不等 closeDelay |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id \| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id \| `trigger` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/hover-card.css` 按部件选择：`[data-scope="hover-card"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-hover-card-arrow-size` · `--xh-hover-card-bg` · `--xh-hover-card-border` · `--xh-hover-card-description-fg` · `--xh-hover-card-fg` · `--xh-hover-card-gap` · `--xh-hover-card-layer` · `--xh-hover-card-max-h` · `--xh-hover-card-max-w` · `--xh-hover-card-px` · `--xh-hover-card-py` · `--xh-hover-card-radius` · `--xh-hover-card-shadow` · `--xh-hover-card-title-fg` · `--xh-hover-card-title-font-size` · `--xh-hover-card-title-font-weight` · `--xh-hover-card-trigger-gap`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器常是[头像](./avatar)或链接；卡片里放[卡片](./card)式的排版。

## 最佳实践

- 打开延时给到几百毫秒，否则鼠标扫过一段文字会弹出一串卡片。
- 卡片里的信息在别处也要有正式入口。

## 反模式

- 卡片里放操作按钮：指针过去的路上可能就关了。
- 延时为 0。
