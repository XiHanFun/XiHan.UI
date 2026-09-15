来源：https://ui.docs.xihanfun.com/components/scroll-area

# ScrollArea 滚动区域 `alpha`

提供带自定义滚动条的内容区域。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/scroll-area" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/scroll-area.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/scroll-area" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/scroll-area" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/scroll-area.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

创建纵向滚动区域

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

const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "构建流程", "发布记录", "迁移指南", "常见问题"];
</script>

<template>
  <XhScrollAreaRoot type="always" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <div v-for="item in items" :key="item" style="padding-block: 7px">{{ item }}</div>
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
<xh-scroll-area type="always" style="display: contents">
  <div data-xh-part="root" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 12px 16px">
        <div style="padding-block: 7px">项目概览</div><div style="padding-block: 7px">组件规范</div>
        <div style="padding-block: 7px">设计令牌</div><div style="padding-block: 7px">无障碍</div>
        <div style="padding-block: 7px">交互状态</div><div style="padding-block: 7px">主题配置</div>
        <div style="padding-block: 7px">构建流程</div><div style="padding-block: 7px">发布记录</div>
        <div style="padding-block: 7px">迁移指南</div><div style="padding-block: 7px">常见问题</div>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
```

## 组件结构

加粗的是必需部件。

`data-scope="scroll-area"`：**`root`** · **`viewport`** · **`content`** · `scrollbar`

## 示例

### 双轴滚动

同时显示横向和纵向滚动条

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

const rows = Array.from({ length: 10 }, (_, index) => `ORD-${String(index + 1).padStart(4, "0")} · 华东区域 · 企业版年度订阅 · 已完成`);
</script>

<template>
  <XhScrollAreaRoot
    type="always"
    style="block-size: 160px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <p
          v-for="row in rows"
          :key="row"
          style="margin: 0; line-height: 28px; white-space: nowrap"
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
<xh-scroll-area type="always" style="display: contents">
  <div data-xh-part="root" style="block-size: 160px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 12px 16px">
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0001 · 华东区域 · 企业版年度订阅 · 已完成</p>
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0002 · 华东区域 · 企业版年度订阅 · 已完成</p>
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0003 · 华东区域 · 企业版年度订阅 · 已完成</p>
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0004 · 华东区域 · 企业版年度订阅 · 已完成</p>
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0005 · 华东区域 · 企业版年度订阅 · 已完成</p>
        <p style="margin: 0; line-height: 28px; white-space: nowrap">ORD-0006 · 华东区域 · 企业版年度订阅 · 已完成</p>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div><div data-xh-part="corner"></div></div>
    <div data-xh-part="scrollbar" orientation="horizontal"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
```

### 横向滚动

只启用横向滚动

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

const cards = ["概览", "分析", "报告", "成员", "设置", "发布"];
</script>

<template>
  <XhScrollAreaRoot
    orientation="horizontal"
    type="always"
    style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)"
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
            border-radius: var(--xh-shape-surface);
            background: var(--xh-bg-subtle);
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
<style>
  #scroll-area-horizontal [data-card] { flex: none; display: grid; place-items: center; inline-size: 96px; block-size: 64px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-scroll-area id="scroll-area-horizontal" orientation="horizontal" type="always" style="display: contents">
  <div data-xh-part="root" style="block-size: 110px; inline-size: min(420px, 100%); border-radius: var(--xh-shape-surface)">
    <div data-xh-part="viewport"><div data-xh-part="content" style="display: flex; gap: 10px; padding: 10px 12px"><div data-card>概览</div><div data-card>分析</div><div data-card>报告</div><div data-card>成员</div><div data-card>设置</div><div data-card>发布</div></div></div>
    <div data-xh-part="scrollbar" orientation="horizontal"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
```

### 边缘渐隐

提示还有更多内容

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

const rows = ["概览", "组件", "指南", "示例", "设计令牌", "无障碍", "主题", "动效", "国际化", "发布记录", "迁移指南", "常见问题"];
</script>

<template>
  <XhScrollAreaRoot
    variant="fade"
    size="lg"
    style="block-size: 180px; inline-size: min(320px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhScrollAreaViewport>
      <XhScrollAreaContent style="padding: 12px 16px">
        <p v-for="row in rows" :key="row" style="margin: 0; line-height: 30px">
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
<xh-scroll-area variant="fade" size="lg" style="display: contents">
  <div data-xh-part="root" style="block-size: 180px; inline-size: min(320px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 12px 16px">
        <p style="margin: 0; line-height: 30px">概览</p><p style="margin: 0; line-height: 30px">组件</p><p style="margin: 0; line-height: 30px">指南</p><p style="margin: 0; line-height: 30px">示例</p>
        <p style="margin: 0; line-height: 30px">设计令牌</p><p style="margin: 0; line-height: 30px">无障碍</p><p style="margin: 0; line-height: 30px">主题</p><p style="margin: 0; line-height: 30px">动效</p>
        <p style="margin: 0; line-height: 30px">国际化</p><p style="margin: 0; line-height: 30px">发布记录</p><p style="margin: 0; line-height: 30px">迁移指南</p><p style="margin: 0; line-height: 30px">常见问题</p>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
```

## 设计指引

### 何时使用

- 统一不同平台的滚动区域样式。
- 控制滚动条的方向和显示时机。

### 何时不用

- 整页滚动交给浏览器。
- 大量列表数据使用[虚拟滚动](./virtualizer)。
- 滚动加载使用[无限滚动](./infinite-scroll)。

### 特性

- 支持横向、纵向和双轴滚动。
- 支持五种滚动条显示时机。
- `fade` 变体在可滚动边缘显示渐隐提示。
- 触屏设备默认保留原生滚动体验。

### 组合

- 可用于[分栏](./splitter)、[对话框](./dialog)、[菜单](./menu)和[表格](./table)。

### 最佳实践

- 根节点应设置明确高度。
- 内容可滚动时提供渐隐边缘或可见滚动条提示。

### 反模式

- 不要让内容决定滚动区域高度。
- 不要嵌套过多滚动区域。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scroll-area>` |
| Vue 组件 | `XhScrollAreaContent` `XhScrollAreaCorner` `XhScrollAreaRoot` `XhScrollAreaScrollbar` `XhScrollAreaThumb` `XhScrollAreaTrack` `XhScrollAreaViewport` |
| 组合式函数 | `useScrollArea` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/scroll-area.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dir` | `Direction` |  | 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻一次。 必须显式给：组件不读计算样式，看不见从 RTL 祖先继承来的方向。 |
| `forceVisible` | `boolean` |  | 触屏（粗指针）上也画自绘滚动条，默认 false：缺省交给原生滚动。 |
| `hideDelay` | `number` |  | 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 |
| `orientation` | `ScrollAreaOrientation` |  | 哪几条轴归本组件管，默认 both。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，换的是滚动条厚度，也是边缘渐隐的带宽。 |
| `type` | `ScrollbarType` |  | 滚动条露面的时机，默认 scroll-hover。 |
| `variant` | `ScrollAreaVariant` |  | 形态：plain / fade，默认 plain。 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhScrollAreaRoot` | `default` | `ScrollAreaRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `scrollbar` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

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

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | 焦点走到滚动区 | 视口带 tabindex=0，键盘用户能停在滚动区上；组件只在这一处动过 Tab 序列 |
| `PageUp` / `PageDown` | focus in viewport | 按视口高度翻页滚动；组件不监听、不拦截 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus in viewport | 逐行/逐列滚动；组件不监听、不拦截 |
| `Home` / `End` | focus in viewport | 滚到内容两端；组件不监听、不拦截 |
| `Space` / `Shift+Space` | focus in viewport | 整屏翻页；组件不监听、不拦截 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `scrollbar` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/scroll-area.css` 使用 `[data-scope="scroll-area"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

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

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-scroll-area-fade-size` | `viewport` | `-webkit-mask-image`<br>`mask-image` | `at-max-horizontal`<br>`at-max-vertical`<br>`at-min-horizontal`<br>`at-min-vertical`<br>`not([data-at-max-horizontal])`<br>`not([data-at-max-vertical])`<br>`not([data-at-min-horizontal])`<br>`not([data-at-min-vertical])`<br>`size=lg`<br>`size=sm`<br>`variant=fade` | `--xh-space-4`<br>`--xh-space-6`<br>`--xh-space-8` | scroll-area 的 viewport 部件 -webkit-mask-image、mask-image 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`opacity` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
