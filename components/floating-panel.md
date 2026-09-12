来源：https://ui.docs.xihanfun.com/components/floating-panel

# FloatingPanel `浮动面板`

一块浮在页面上、能搬走、能改大小、能收拢与铺满的非模态面板。页面照常可读可点，面板停在用户放它的地方。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/floating-panel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/floating-panel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/floating-panel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/floating-panel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/floating-panel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点触发器打开面板：标题栏那条把手可以拖，右下角可以改大小，Esc 关闭

```vue
<script setup lang="ts">
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <!-- 不传 open 即非受控；位置与尺寸同理，default-* 只给初值 -->
  <XhFloatingPanelRoot :default-position="{ x: 160, y: 140 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>调试面板</XhFloatingPanelTitle>
          <!-- 把手自己不显示内容，它铺满标题栏剩下的横向空间 -->
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">面板不挡住页面，底下的内容照常能点。</p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<!-- 不传 open 即非受控；位置与尺寸同理，default-* 只给初值 -->
<xh-floating-panel default-position="160,140" style="display: contents">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">调试面板</h2>
          <!-- 把手自己不显示内容，它铺满标题栏剩下的横向空间 -->
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">面板不挡住页面，底下的内容照常能点。</p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>
```

## 示例

### 三种形态

收拢只留标题栏、铺满占满视口；按着的那个钮再按一次回到常规

```vue
<script setup lang="ts">
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
  XhFloatingPanelWindowStateTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhFloatingPanelRoot :default-position="{ x: 200, y: 180 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>播放器</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <!-- 当前形态的那个钮会被压住（aria-pressed=true） -->
          <XhFloatingPanelWindowStateTrigger window-state="minimized" />
          <XhFloatingPanelWindowStateTrigger window-state="maximized" />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            收拢时这段正文带上 hidden，Tab 与读屏都进不来。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<xh-floating-panel default-position="200,180" style="display: contents">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">播放器</h2>
          <button data-xh-part="drag-trigger"></button>
          <!-- 当前形态的那个钮会被压住（aria-pressed=true） -->
          <button data-xh-part="window-state-trigger" window-state="minimized"></button>
          <button data-xh-part="window-state-trigger" window-state="maximized"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">
            收拢时这段正文带上 hidden，Tab 与读屏都进不来。
          </p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>
```

### 八个改尺把手

四条边加四个角；min-size 与 max-size 在拖、推、setDimensions 三处同时生效

```vue
<script setup lang="ts">
import type { FloatingPanelResizeEdge } from "@xihan-ui/headless";
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";

// 边先角后：角上的把手要盖在两条边的交叠处
const edges: FloatingPanelResizeEdge[] = [
  "n",
  "e",
  "s",
  "w",
  "ne",
  "se",
  "sw",
  "nw",
];
</script>

<template>
  <XhFloatingPanelRoot
    :default-position="{ x: 240, y: 220 }"
    :default-dimensions="{ width: 320, height: 200 }"
    :min-size="{ width: 240, height: 160 }"
    :max-size="{ width: 520, height: 420 }"
  >
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>图层属性</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            往任一边拖到底就停在 240×160；把手聚焦后方向键推 10px、Shift 推
            50px。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger
          v-for="edge in edges"
          :key="edge"
          :edge="edge"
        />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<xh-floating-panel
  default-position="240,220"
  default-dimensions="320,200"
  min-size="240,160"
  max-size="520,420"
  style="display: contents"
>
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">图层属性</h2>
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">
            往任一边拖到底就停在 240×160；把手聚焦后方向键推 10px、Shift 推
            50px。
          </p>
        </div>
        <!-- 边先角后：角上的把手要盖在两条边的交叠处 -->
        <div data-xh-part="resize-trigger" edge="n"></div>
        <div data-xh-part="resize-trigger" edge="e"></div>
        <div data-xh-part="resize-trigger" edge="s"></div>
        <div data-xh-part="resize-trigger" edge="w"></div>
        <div data-xh-part="resize-trigger" edge="ne"></div>
        <div data-xh-part="resize-trigger" edge="se"></div>
        <div data-xh-part="resize-trigger" edge="sw"></div>
        <div data-xh-part="resize-trigger" edge="nw"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>
```

### 受控

open 与 position 都交给外面握着：面板只报意图，值写回来才动

```vue
<script setup lang="ts">
import type { FloatingPanelPosition } from "@xihan-ui/headless";
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);
const position = ref<FloatingPanelPosition>({ x: 280, y: 260 });
</script>

<template>
  <p style="margin: 0 0 8px">
    面板落点：{{ Math.round(position.x) }} , {{ Math.round(position.y) }}
  </p>
  <XhFloatingPanelRoot v-model:open="open" v-model:position="position">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>受控面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            拖动时上面那行数字跟着走：值是外面这份 ref 说了算。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<p style="margin: 0 0 8px">
  面板落点：<span id="floating-panel-readout">280 , 260</span>
</p>
<xh-floating-panel id="floating-panel-controlled" style="display: contents">
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">受控面板</h2>
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">
            拖动时上面那行数字跟着走：值是宿主这一侧说了算。
          </p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>

<script type="module">
  // 值由宿主握着：变更经事件回来，写回去才生效
  const host = document.getElementById("floating-panel-controlled");
  const readout = document.getElementById("floating-panel-readout");
  host.open = false;
  host.position = { x: 280, y: 260 };
  host.addEventListener("open-change", (event) => {
    host.open = event.detail.open;
  });
  host.addEventListener("position-change", (event) => {
    host.position = event.detail.position;
    readout.textContent = `${Math.round(event.detail.position.x)} , ${Math.round(event.detail.position.y)}`;
  });
</script>
```

### 禁用

搬不动、改不了尺寸、切不了形态；关闭与开合照常，面板不会被锁死在屏幕上

```vue
<script setup lang="ts">
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
  XhFloatingPanelWindowStateTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhFloatingPanelRoot disabled :default-position="{ x: 320, y: 300 }">
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>只读面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelWindowStateTrigger window-state="minimized" />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            把手报的是 aria-disabled 而不是原生 disabled：它仍在 Tab
            序列里，读屏才念得到"这里本来能搬"。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<xh-floating-panel
  disabled
  default-position="320,300"
  style="display: contents"
>
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">只读面板</h2>
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="window-state-trigger" window-state="minimized"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">
            把手报的是 aria-disabled 而不是原生 disabled：它仍在 Tab
            序列里，读屏才念得到"这里本来能搬"。
          </p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>
```

### 文案本地化

把手与几个按钮只有图标，可及名一律走 translations

```vue
<script setup lang="ts">
import type { FloatingPanelSchema } from "@xihan-ui/headless";
import {
  XhFloatingPanelBody,
  XhFloatingPanelCloseTrigger,
  XhFloatingPanelContent,
  XhFloatingPanelDragTrigger,
  XhFloatingPanelHeader,
  XhFloatingPanelPositioner,
  XhFloatingPanelResizeTrigger,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhFloatingPanelTrigger,
  XhFloatingPanelWindowStateTrigger,
} from "@xihan-ui/vue";

// 八个把手与三个形态钮的名字带参数：读屏得念得出按的是哪一个
const EDGE_LABEL = {
  n: "上边",
  e: "右边",
  s: "下边",
  w: "左边",
  ne: "右上角",
  se: "右下角",
  sw: "左下角",
  nw: "左上角",
};

const WINDOW_STATE_LABEL = {
  default: "还原面板",
  minimized: "收起面板",
  maximized: "最大化面板",
};

const translations: FloatingPanelSchema["props"]["translations"] = {
  dragTrigger: "移动面板",
  resizeTrigger: edge => `拖动${EDGE_LABEL[edge]}改变大小`,
  resizeValueText: size => `宽 ${size.width}、高 ${size.height} 像素`,
  windowStateTrigger: windowState => WINDOW_STATE_LABEL[windowState],
  close: "关闭面板",
};
</script>

<template>
  <XhFloatingPanelRoot
    :translations="translations"
    :default-position="{ x: 360, y: 340 }"
  >
    <XhFloatingPanelTrigger>打开面板</XhFloatingPanelTrigger>
    <XhFloatingPanelPositioner>
      <XhFloatingPanelContent>
        <XhFloatingPanelHeader>
          <XhFloatingPanelTitle>中文面板</XhFloatingPanelTitle>
          <XhFloatingPanelDragTrigger />
          <XhFloatingPanelWindowStateTrigger window-state="minimized" />
          <XhFloatingPanelCloseTrigger />
        </XhFloatingPanelHeader>
        <XhFloatingPanelBody>
          <p style="margin: 0">
            这几处名字只出现在读屏里，界面上一个字都看不见。
          </p>
        </XhFloatingPanelBody>
        <XhFloatingPanelResizeTrigger edge="se" />
      </XhFloatingPanelContent>
    </XhFloatingPanelPositioner>
  </XhFloatingPanelRoot>
</template>
```

```html
<xh-floating-panel
  id="floating-panel-translations"
  default-position="360,340"
  style="display: contents"
>
  <div data-xh-part="root">
    <button data-xh-part="trigger">打开面板</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="header">
          <h2 data-xh-part="title">中文面板</h2>
          <button data-xh-part="drag-trigger"></button>
          <button data-xh-part="window-state-trigger" window-state="minimized"></button>
          <button data-xh-part="close-trigger"></button>
        </div>
        <div data-xh-part="body">
          <p style="margin: 0">
            这几处名字只出现在读屏里，界面上一个字都看不见。
          </p>
        </div>
        <div data-xh-part="resize-trigger" edge="se"></div>
      </div>
    </div>
  </div>
</xh-floating-panel>

<script type="module">
  // 八个把手与三个形态钮的名字带参数：读屏得念得出按的是哪一个
  const EDGE_LABEL = {
    n: "上边",
    e: "右边",
    s: "下边",
    w: "左边",
    ne: "右上角",
    se: "右下角",
    sw: "左下角",
    nw: "左上角",
  };

  const WINDOW_STATE_LABEL = {
    default: "还原面板",
    minimized: "收起面板",
    maximized: "最大化面板",
  };

  // 文案是对象，只走 property
  document.getElementById("floating-panel-translations").translations = {
    dragTrigger: "移动面板",
    resizeTrigger: (edge) => `拖动${EDGE_LABEL[edge]}改变大小`,
    resizeValueText: (size) => `宽 ${size.width}、高 ${size.height} 像素`,
    windowStateTrigger: (windowState) => WINDOW_STATE_LABEL[windowState],
    close: "关闭面板",
  };
</script>
```

## 设计指引

### 何时使用

- 长时间挂着的辅助界面：调试面板、图层属性、正在进行的通话、播放器。
- 用户需要一边看页面一边改东西，弹窗那种"必须先处理完"的语气不合适。
- 位置和大小要由用户自己定，并且值得记下来（`onPositionChange` / `onDimensionsChange` / `onWindowStateChange` 就是为此留的）。

### 何时不用

- 必须先处理完才能继续：用[对话框](./dialog)，它会陷住焦点、锁住背景。
- 从边上滑出的一整块面板：用[抽屉](./drawer)。
- 挂在某个元素旁边、点别处就收：用[气泡卡片](./popover)。
- 只是把一块区域分成可拖的几片：用[分栏](./splitter)。

### 特性

- 三种形态：常规、收拢（只留标题栏）、铺满（占满视口），由 `windowState` 一个值表达，可受控。
- 位置与尺寸各自成对（`position` / `defaultPosition`、`dimensions` / `defaultDimensions`），两态齐全。
- 八个改尺把手在节点上自报守的是哪条边，西边与北边的把手会同时改位置。
- 默认皮肤使用 M3 桌面玻璃面：描边、顶边高光、投影与光学采样同出一张配方；高对比、减少透明、强制色与打印时原位收敛为实体面，标题栏按钮键盘聚焦时先铺实体隔离底。
- 键盘全程可达：拖拽把手上方向键平移、Shift 快移、Enter / Space 送回初始落点；改尺把手上方向键推边；Esc 关闭。
- `minSize` / `maxSize` 在每一处入口都生效——拖、推、`setDimensions` 走的是同一个夹取函数。
- 内建默认矩形挂载时按视口夹一次：先收尺寸再推落点，窄屏上面板与右侧那几个改尺把手不会落在屏外。写了 `defaultPosition` / `defaultDimensions` 就照写的来。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-floating-panel>` |
| Vue 组件 | `XhFloatingPanelBody` `XhFloatingPanelCloseTrigger` `XhFloatingPanelContent` `XhFloatingPanelDragTrigger` `XhFloatingPanelHeader` `XhFloatingPanelPositioner` `XhFloatingPanelResizeTrigger` `XhFloatingPanelRoot` `XhFloatingPanelTitle` `XhFloatingPanelTrigger` `XhFloatingPanelWindowStateTrigger` |
| 组合式函数 | `useFloatingPanel` |
| 状态机 | `floatingPanelMachine` |
| 皮肤 | `@xihan-ui/styles/floating-panel.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="floating-panel"`：`root` · `trigger` · **`positioner`** · **`content`** · `header` · `title` · `drag-trigger` · `resize-trigger` · `window-state-trigger` · `close-trigger` · `body`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `position` | `FloatingPanelPosition` |  | 面板左上角坐标（px，相对视口）。给定即受控。 |
| `defaultPosition` | `FloatingPanelPosition` |  |  |
| `dimensions` | `FloatingPanelSize` |  | 面板尺寸（px）。给定即受控。 |
| `defaultDimensions` | `FloatingPanelSize` |  |  |
| `minSize` | `FloatingPanelSize` |  | 尺寸下限，默认 160×120。 |
| `maxSize` | `FloatingPanelSize` |  | 尺寸上限，不给即不封顶。与 minSize 冲突时以 minSize 为准。 |
| `windowState` | `FloatingPanelWindowState` |  | 形态。给定即受控。 |
| `defaultWindowState` | `FloatingPanelWindowState` |  |  |
| `draggable` | `boolean` |  | 允不允许搬动面板，默认 true；铺满形态下恒不可搬。 |
| `resizable` | `boolean` |  | 允不允许改尺寸，默认 true；只有常规形态下才改得动。 |
| `disabled` | `boolean` |  | 禁用：搬不动、改不了尺寸、切不了形态；开合与关闭不受影响。 |
| `translations` | `Partial<FloatingPanelTranslations>` |  |  |
| `onOpenChange` | `(details: FloatingPanelOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onPositionChange` | `(details: FloatingPanelPositionChangeDetails) => void` |  | 位置变化意图回调；拖动过程中会连续发很多次。 |
| `onDimensionsChange` | `(details: FloatingPanelDimensionsChangeDetails) => void` |  | 尺寸变化意图回调；改尺过程中会连续发很多次。 |
| `onWindowStateChange` | `(details: FloatingPanelWindowStateChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `FloatingPanelOpenChangeDetails` | 展开态变化；detail 为 `{ open: boolean }` |
| `position-change` | `FloatingPanelPositionChangeDetails` | 落点变化（拖动途中会连发）；detail 为 `{ position: { x, y } }` |
| `dimensions-change` | `FloatingPanelDimensionsChangeDetails` | 尺寸变化（改尺途中会连发）；detail 为 `{ dimensions: { width, height } }` |
| `window-state-change` | `FloatingPanelWindowStateChangeDetails` | 形态变化；detail 为 `{ windowState: 'default' \| 'minimized' \| 'maximized' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatingPanelRoot` | `default` | `FloatingPanelRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `window-state-trigger` | 'on' \| 'off' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open` · `open.dragging` · `open.idle` · `open.resizing`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `POSITION.SET` · `POSITION.NUDGE` · `DIMENSIONS.SET` · `DIMENSIONS.NUDGE` · `WINDOW_STATE.SET` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END`

**判据**：`canDrag` · `canInteract` · `canResize` · `isOpenControlled`

## connect API

`useFloatingPanel` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `windowState` | `FloatingPanelWindowState` |  |
| `position` | `FloatingPanelPosition` |  |
| `dimensions` | `FloatingPanelSize` |  |
| `dragging` | `boolean` | 正在被指针搬动。 |
| `resizing` | `boolean` | 正在被指针改尺。 |
| `disabled` | `boolean` |  |
| `canDrag` | `boolean` | 眼下搬不搬得动：作者允许、未禁用、且不是铺满形态。 |
| `canResize` | `boolean` | 眼下改不改得了尺寸：作者允许、未禁用、且是常规形态。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setPosition` | `(next: FloatingPanelPosition) => void` |  |
| `setDimensions` | `(next: FloatingPanelSize) => void` | 尺寸会被夹进 minSize / maxSize 之后才落地。 |
| `setWindowState` | `(next: FloatingPanelWindowState) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDragTriggerProps` | `() => T['button']` |  |
| `getResizeTriggerProps` | `(props: FloatingPanelResizeTriggerProps) => T['element']` | 把手是 role=separator 的元素而不是按钮：方向键推边，激活键在这里没有语义。 |
| `getWindowStateTriggerProps` | `(props: FloatingPanelWindowStateTriggerProps) => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getBodyProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in content, 面板展开 | 关闭面板；面板不是模态的，焦点在页面别处时这一键不归它管 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把整块面板往该方向平移 10px |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 同上，一下走 50px |
| `Enter` / `Space` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把面板送回初始落点（defaultPosition，没给就是按视口夹过的 24,24）；面板被拖出视口后靠这一键收回来 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 把这个把手守的那条边往该方向推 10px；推不动的那根轴上不拦键（上下把手放行左右键） |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 同上，一下推 50px |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `drag-trigger` | `aria-disabled` | 'false' \| 'true' |
| `drag-trigger` | `aria-label` | label.dragTrigger |
| `resize-trigger` | `aria-controls` | `content` 部件的 id |
| `resize-trigger` | `aria-disabled` | 'false' \| 'true' |
| `resize-trigger` | `aria-label` | label.resizeTrigger(item.edge) |
| `resize-trigger` | `aria-orientation` | 'vertical' \| 'horizontal' |
| `resize-trigger` | `aria-valuemax` | String(Math.round(valueMax)) \| undefined |
| `resize-trigger` | `aria-valuemin` | String(Math.round(horizontal ? minSize.width : minSiz… |
| `resize-trigger` | `aria-valuenow` | String(Math.round(horizontal ? dimensions.width : dim… |
| `resize-trigger` | `aria-valuetext` | label.resizeValueText(dimensions) |
| `resize-trigger` | `role` | 'separator' |
| `window-state-trigger` | `aria-disabled` | 'true' \| 'false' |
| `window-state-trigger` | `aria-label` | label.windowStateTrigger(item.windowState) |
| `window-state-trigger` | `aria-pressed` | 'true' \| 'false' |
| `close-trigger` | `aria-label` | label.close |

- 面板是 `role="dialog"` 且 `aria-modal="false"`：它不夺走焦点，页面其余部分照常可达。
- 标题部件的 id 恒被 `aria-labelledby` 指向，因此**面板一定要写标题**，否则读屏只能念出"对话框"。
- 拖拽把手、八个改尺把手、三个形态按钮、关闭按钮都只有图标，可及名一律走 `translations`。
- 八个改尺把手是 `role="separator"`：`aria-valuenow` 报它推的那根轴的像素值（左右两侧与四角报宽度、上下两条报高度），`aria-valuetext` 把宽高一并念出来。不给 `maxSize` 时 `aria-valuemax` 缺席，播报以 `aria-valuetext` 为准。
- 拖拽把手是原生按钮，它的激活键（Enter / Space）有实义：把面板送回初始落点。按钮不响应自己的激活键是反模式。
- 把手在推不动时用 `aria-disabled` 而不是原生 `disabled`：后者会把它逐出 Tab 序列，键盘用户连"这里能搬"都读不到。改尺把手同理恒带 `tabindex="0"`。
- 收拢时正文带上 `hidden`，其中的可聚焦元素一并退出 Tab 序列——只压高度的话读屏与 Tab 照样进得去。

## 样式

默认皮肤 `@xihan-ui/styles/floating-panel.css` 按部件选择：`[data-scope="floating-panel"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-window-state` | context.get('windowState') |
| `header` | `data-dragging` | ''（条件成立时才出现） |
| `header` | `data-window-state` | context.get('windowState') |
| `drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `resize-trigger` | `data-edge` | item.edge |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-state` | 'on' \| 'off' |
| `window-state-trigger` | `data-target-window-state` | item.windowState |
| `body` | `data-window-state` | context.get('windowState') |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-floating-panel-action-bg-active` | `close-trigger`<br>`window-state-trigger` | `background` | `active`<br>`state=on` | `--xh-bg-subtle-active` | floating-panel 的 close-trigger、window-state-trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-action-bg-hover` | `close-trigger`<br>`window-state-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | floating-panel 的 close-trigger、window-state-trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-action-fg` | `close-trigger`<br>`window-state-trigger` | `color` | `default` | `--xh-material-glass-fg-muted` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-active` | `window-state-trigger` | `color` | `state=on` | `--xh-fg-default` | floating-panel 的 window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-hover` | `close-trigger`<br>`window-state-trigger` | `color` | `hover` | `--xh-fg-default` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-radius` | `window-state-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 window-state-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-action-size` | `window-state-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | floating-panel 的 window-state-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-bg` | `content` | `background` | `default` | `--xh-material-glass-bg` | floating-panel 的 content 部件 background 覆盖槽。 |
| `--xh-floating-panel-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` | floating-panel 的 body 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` | floating-panel 的 body 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-border` | `content` | `border` | `default` | `--xh-material-glass-border` | floating-panel 的 content 部件 border 覆盖槽。 |
| `--xh-floating-panel-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-h-sm` | floating-panel 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-corner-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `--xh-space-4` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-fg` | `content` | `color` | `default` | `--xh-material-glass-fg` | floating-panel 的 content 部件 color 覆盖槽。 |
| `--xh-floating-panel-handle-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `--xh-space-2` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-header-bg` | `header` | `background` | `default` | `--xh-material-glass-bg` | floating-panel 的 header 部件 background 覆盖槽。 |
| `--xh-floating-panel-header-border` | `header` | `border-block-end` | `default` | `--xh-material-glass-separator` | floating-panel 的 header 部件 border-block-end 覆盖槽。 |
| `--xh-floating-panel-header-gap` | `header` | `gap` | `default` | `--xh-control-gap-sm` | floating-panel 的 header 部件 gap 覆盖槽。 |
| `--xh-floating-panel-header-px` | `header` | `padding-inline` | `default` | `--xh-space-3` | floating-panel 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | floating-panel 的 header 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | floating-panel 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-floating-panel-layer` | `positioner` | `z-index` | `default` | `--xh-layer-drawer` | floating-panel 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-floating-panel-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | floating-panel 的 content 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-shadow` | `content` | `box-shadow` | `default` | `--xh-material-glass-shadow` | floating-panel 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-floating-panel-title-fg` | `title` | `color` | `default` | `--xh-material-glass-fg` | floating-panel 的 title 部件 color 覆盖槽。 |
| `--xh-floating-panel-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | floating-panel 的 title 部件 font-size 覆盖槽。 |
| `--xh-floating-panel-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-label-weight` | floating-panel 的 title 部件 font-weight 覆盖槽。 |
| `--xh-floating-panel-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-surface` | floating-panel 的 trigger 部件 background 覆盖槽。 |
| `--xh-floating-panel-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | floating-panel 的 trigger 部件 border 覆盖槽。 |
| `--xh-floating-panel-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | floating-panel 的 trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | floating-panel 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-floating-panel-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | floating-panel 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 面板的坐标、八个把手的方位、方向键推动的方向**都是屏幕方位，不随 `dir` 翻转**。`w` 把手在 RTL 下仍长在物理左侧，按右方向键面板仍往屏幕右边走——指针位移本来就是屏幕坐标，跟着 `dir` 翻会让手上的方向与面板的动向对不上。
- 因此皮肤里改尺把手那一段刻意写物理的 `inset` / `width` / `height`，连接层写的也是 `left` / `top`。**不要**把它们改成 `inset-inline-*`：把手会跑到对面，手往右拖却从左边收。
- 面板内的正文照常跟随文档方向：标题栏的排布、正文的书写方向都由外面的 `dir` 决定，本组件一个字都不管。

## 组合

- 标题栏里放[按钮组](./button-group)承载三个形态按钮与关闭按钮。
- 正文放[滚动区域](./scroll-area)：面板被改小后正文自己滚，而不是把面板撑破。

## 最佳实践

- 位置与尺寸值得存下来：拖动途中回调每帧都发，落存储前先节流。
- 面板被搬到视口外之后，**再点触发按钮不会把它挪回来**——重新展开只是在同一个坐标上再展开一次。真正能收回来的只有两条：焦点落在拖拽把手上按 Enter / Space（送回初始落点），或者受控接管 `position`、在打开时写回一个视口内的坐标。产品线要"永远拖不出屏幕"就得走后一条。
- 面板关闭或被搬走后，焦点会掉回 `<body>`：本组件不接管焦点归还，作者应在关闭后把焦点送回触发按钮。
- 同屏挂多块面板时给它们不同的初始落点，否则会叠成一摞、只有最上面那块点得到。
- 位置不做视口夹取：组件一次也不量视口，`onPositionChange` 里发出来的坐标就是指针算出来的原值。
- 面板的落位是视口坐标（`position: fixed` + `left` / `top`）。Vue 侧定位层会被搬到统一的浮层落点，祖先怎么写都不影响；**Web Components 侧搬不动**（角色节点作者写在哪就在哪），把 `<xh-floating-panel>` 放进带 `transform` / `filter` / `backdrop-filter` / `contain: paint` 的容器里，那个祖先会抢走包含块，面板会落到错误的位置——展开时元素会投一条 `overlay.stacking-trap` 诊断。
- Web Components 侧"能不能搬"这个开关的属性名是 `panel-draggable` 而不是 `draggable`：`draggable` 是 HTML 全局属性，占用它会把宿主元素变成原生拖放源，`dragstart` 一起浏览器就派 `pointercancel`，指针拖动当场中止。property 名同样是 `panelDraggable`；Vue 侧不受影响，仍是 `draggable`。

## 反模式

- 拿它当对话框用来确认删除：非模态面板允许用户绕开，重要的确认必须挡住去路。
- 一屏挂五六块浮动面板：它们互相遮挡，用户先要整理桌面才能干活。
- 把面板做成不可关闭也不可收拢：浮层挡住的正是用户要看的内容。
