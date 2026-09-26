来源：https://ui.docs.xihanfun.com/components/floating-panel

# FloatingPanel 浮动面板

浮在页面上、可移动、可调整大小、可收拢与铺满的非模态面板。页面照常可读可点，面板停留在用户放置的位置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/floating-panel" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/floating-panel.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/floating-panel" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/floating-panel" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/floating-panel.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击触发器打开面板：标题栏的把手可以拖动，右下角可以改变大小，Esc 关闭

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

## 组件结构

加粗的是必需部件。

`data-scope="floating-panel"`：`root` · `trigger` · **`positioner`** · **`content`** · `header` · `title` · `drag-trigger` · `resize-trigger` · `window-state-trigger` · `close-trigger` · `body`

## 示例

### 三种形态

收拢只保留标题栏、铺满占满视口；已按下的按钮再按一次回到常规

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

### 八个尺寸把手

四条边加四个角；min-size 与 max-size 在拖动、推动、setDimensions 三处同时生效

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

open 与 position 都由外部持有：面板只报告意图，值写回后才变化

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

不可移动、不可改变尺寸、不可切换形态；关闭与开合照常，面板不会被锁定在屏幕上

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

把手与几个按钮只有图标，可及名一律经 translations

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

- 长时间存在的辅助界面：调试面板、图层属性、进行中的通话、播放器。
- 用户需要一边查看页面一边修改内容，弹窗“必须先处理”的语气不合适。
- 位置和大小由用户决定并值得保存（`onPositionChange` / `onDimensionsChange` / `onWindowStateChange` 为此提供）。

### 何时不用

- 必须先处理完才能继续时，使用[对话框](./dialog)，它会捕获焦点、锁定背景。
- 从边缘滑出的整块面板使用[抽屉](./drawer)。
- 挂在某个元素旁、点击他处即收起时，使用[气泡卡片](./popover)。
- 只是把一块区域分成可拖动的几片时，使用[分栏](./splitter)。

### 特性

- 三种形态：常规、收拢（只留标题栏）、铺满（占满视口），由 `windowState` 一个值表达，可受控。
- 位置与尺寸各自成对（`position` / `defaultPosition`、`dimensions` / `defaultDimensions`），受控与非受控齐全。
- 八个调整尺寸的把手在节点上声明各自守护的边，西边与北边的把手会同时改变位置。
- 默认皮肤使用 M2 磨砂面：描边、顶边高光、投影与光学采样同出一份配方；高对比、减少透明、强制色与打印时原位收敛为实体面；浮层内标题 14 / 600。
- 开合触发器走 Action Control text 档：默认 `outline` 描边、md 高度，按下缩放并换底。标题栏的形态按钮与关闭按钮走 icon 档 sm、`ghost` 面：磨砂白面上悬停 100 → 按下 200，焦点面透明吃库环；当前形态的那颗按钮是按下的开关（`aria-pressed`），取品牌淡底 `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`，悬停 20% → 按下 28%。Space / Enter 与触屏按住期间由连接层投影 `data-pressed`。
- 正文是浮在页面之上的滚动面：原生细条，`overscroll-behavior: contain` 让滚到头不带走页面。
- 键盘全程可达：拖拽把手上方向键平移、Shift 快速移动、Enter / Space 送回初始位置；调整把手上方向键推动边缘；Esc 关闭。
- `minSize` / `maxSize` 在每一处入口都生效：拖动、键盘推动、`setDimensions` 使用同一个夹取函数。
- 内建默认矩形在挂载时按视口夹取一次：先收尺寸再调位置，窄屏上面板与右侧的调整把手不会落在屏幕外。提供 `defaultPosition` / `defaultDimensions` 时按提供的值。

### 组合

- 标题栏放[按钮组](./button-group)承载三个形态按钮与关闭按钮。
- 正文放[滚动区域](./scroll-area)：面板缩小后正文自行滚动，不撑破面板。

### 最佳实践

- 位置与尺寸值得保存：拖动途中每帧都发回调，写入存储前先节流。
- 面板被移到视口外后，再点触发按钮不会把它移回：重新展开只是在同一坐标上再次展开。能收回的只有两条路径：焦点落在拖拽把手上按 Enter / Space（送回初始位置），或受控接管 `position` 并在打开时写回视口内的坐标。要求“永远拖不出屏幕”时使用后者。
- 面板关闭或被移走后，焦点会回到 `<body>`：本组件不接管焦点归还，作者应在关闭后把焦点送回触发按钮。
- 同屏多块面板时给它们不同的初始位置，否则会叠在一起，只有最上面一块可以点击。
- 位置不做视口夹取：组件不测量视口，`onPositionChange` 发出的坐标就是指针计算的原值。
- 面板的位置是视口坐标（`position: fixed` + `left` / `top`）。Vue 侧定位层会被移到统一的浮层落点，祖先的写法不影响；Web Components 侧不移动（角色节点写在哪就在哪），把 `<xh-floating-panel>` 放进带 `transform` / `filter` / `backdrop-filter` / `contain: paint` 的容器时，该祖先会成为包含块，面板会落到错误的位置；展开时元素会发出 `overlay.stacking-trap` 诊断。
- Web Components 侧“是否可移动”的属性名是 `panel-draggable` 而不是 `draggable`：`draggable` 是 HTML 全局属性，占用它会把宿主元素变成原生拖放源，`dragstart` 触发后浏览器派发 `pointercancel`，指针拖动立即中止。property 名同样是 `panelDraggable`；Vue 侧不受影响，仍是 `draggable`。

### 反模式

- 用它确认删除：非模态面板允许用户绕开，重要的确认必须阻断。
- 一屏挂五六块浮动面板：互相遮挡，用户需要先整理才能工作。
- 面板既不可关闭也不可收拢：浮层遮住的正是用户要看的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-floating-panel>` |
| Vue 组件 | `XhFloatingPanelBody` `XhFloatingPanelCloseTrigger` `XhFloatingPanelContent` `XhFloatingPanelDragTrigger` `XhFloatingPanelHeader` `XhFloatingPanelPositioner` `XhFloatingPanelResizeTrigger` `XhFloatingPanelRoot` `XhFloatingPanelTitle` `XhFloatingPanelTrigger` `XhFloatingPanelWindowStateTrigger` |
| 组合式函数 | `useFloatingPanel` |
| 状态机 | `floatingPanelMachine` |
| 皮肤 | `@xihan-ui/styles/floating-panel.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  | 展开态。提供即受控：内部不再自行修改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `position` | `FloatingPanelPosition` |  | 面板左上角坐标（px，相对视口）。提供即受控。 |
| `defaultPosition` | `FloatingPanelPosition` |  |  |
| `dimensions` | `FloatingPanelSize` |  | 面板尺寸（px）。提供即受控。 |
| `defaultDimensions` | `FloatingPanelSize` |  |  |
| `minSize` | `FloatingPanelSize` |  | 尺寸下限，默认 160×120。 |
| `maxSize` | `FloatingPanelSize` |  | 尺寸上限，未提供时不封顶。与 minSize 冲突时以 minSize 为准。 |
| `windowState` | `FloatingPanelWindowState` |  | 形态。提供即受控。 |
| `defaultWindowState` | `FloatingPanelWindowState` |  |  |
| `draggable` | `boolean` |  | 是否允许移动面板，默认 true；铺满形态下恒不可移动。 |
| `resizable` | `boolean` |  | 是否允许改尺寸，默认 true；只有常规形态下可以改尺寸。 |
| `disabled` | `boolean` |  | 禁用：不可移动、不可改尺寸、不可切换形态；开合与关闭不受影响。 |
| `translations` | `Partial<FloatingPanelTranslations>` |  |  |
| `onOpenChange` | `(details: FloatingPanelOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onPositionChange` | `(details: FloatingPanelPositionChangeDetails) => void` |  | 位置变化意图回调；拖动过程中连续发出。 |
| `onDimensionsChange` | `(details: FloatingPanelDimensionsChangeDetails) => void` |  | 尺寸变化意图回调；改尺过程中连续发出。 |
| `onWindowStateChange` | `(details: FloatingPanelWindowStateChangeDetails) => void` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `FloatingPanelOpenChangeDetails` | 展开态变化；detail 为 `{ open: boolean }` |
| `position-change` | `FloatingPanelPositionChangeDetails` | 落点变化（拖动途中连续发出）；detail 为 `{ position: { x, y } }` |
| `dimensions-change` | `FloatingPanelDimensionsChangeDetails` | 尺寸变化（改尺途中连续发出）；detail 为 `{ dimensions: { width, height } }` |
| `window-state-change` | `FloatingPanelWindowStateChangeDetails` | 形态变化；detail 为 `{ windowState: 'default' \| 'minimized' \| 'maximized' }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatingPanelRoot` | `default` | `FloatingPanelRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhFloatingPanelPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhFloatingPanelResizeTrigger` | `edge` | `FloatingPanelResizeEdge` | 是 | 该把手负责哪条边：n / e / s / w 四条边与 ne / nw / se / sw 四个角。 |
| `XhFloatingPanelRoot` | `children` | `SlotChildren<FloatingPanelRootSlotProps>` |  |  |
| `XhFloatingPanelWindowStateTrigger` | `windowState` | `FloatingPanelWindowState` | 是 | 按下它切换到哪个形态；已处于该形态时再按一次回到常规。 |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `window-state-trigger` | 'on' \| 'off' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open` · `open.dragging` · `open.idle` · `open.resizing`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `POSITION.SET` · `POSITION.NUDGE` · `DIMENSIONS.SET` · `DIMENSIONS.NUDGE` · `WINDOW_STATE.SET` · `DRAG.START` · `RESIZE.START` · `DRAG.MOVE` · `DRAG.END` · `PRESS.START` · `PRESS.END`

**判据**：`canDrag` · `canInteract` · `canResize` · `isOpenControlled` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `windowState` | `FloatingPanelWindowState` |  |
| `position` | `FloatingPanelPosition` |  |
| `dimensions` | `FloatingPanelSize` |  |
| `dragging` | `boolean` | 正在被指针移动。 |
| `resizing` | `boolean` | 正在被指针改尺。 |
| `disabled` | `boolean` |  |
| `canDrag` | `boolean` | 当前是否可移动：作者允许、未禁用、且不是铺满形态。 |
| `canResize` | `boolean` | 当前是否可改尺寸：作者允许、未禁用、且是常规形态。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setPosition` | `(next: FloatingPanelPosition) => void` |  |
| `setDimensions` | `(next: FloatingPanelSize) => void` | 尺寸会被夹进 minSize / maxSize 之后才落定。 |
| `setWindowState` | `(next: FloatingPanelWindowState) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDragTriggerProps` | `() => T['button']` |  |
| `getResizeTriggerProps` | `(props: FloatingPanelResizeTriggerProps) => T['element']` | 把手是 role=separator 的元素而不是按钮：方向键推动边，激活键在这里没有语义。 |
| `getWindowStateTriggerProps` | `(props: FloatingPanelWindowStateTriggerProps) => T['button']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getBodyProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Escape` | focus in content, 面板展开 | 关闭面板；面板不是模态的，焦点在页面别处时这一键不归它管 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把整块面板往该方向平移 10px |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 同上，一下走 50px |
| `Enter` / `Space` | focus on drag-trigger, 未禁用、draggable 开启且不是铺满形态 | 把面板送回初始落点（defaultPosition，未提供时是按视口夹取后的 24,24）；面板被拖出视口后依靠该键收回 |
| `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 把这个把手守的那条边往该方向推 10px；推不动的那根轴上不拦键（上下把手放行左右键） |
| `Shift+ArrowUp` / `Shift+ArrowDown` / `Shift+ArrowLeft` / `Shift+ArrowRight` | focus on resize-trigger, 未禁用、resizable 开启且是常规形态 | 同上，一下推 50px |
| `Enter` / `Space` | held in trigger / close-trigger / window-state-trigger（形态钮须未禁用） | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

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

- 面板是 `role="dialog"` 且 `aria-modal="false"`：它不夺取焦点，页面其余部分照常可达。
- 标题部件的 id 始终被 `aria-labelledby` 指向，因此面板必须写标题，否则读屏只能读出“对话框”。
- 拖拽把手、八个调整把手、三个形态按钮、关闭按钮都只有图标，可访问名称一律来自 `translations`。
- 八个调整把手是 `role="separator"`：`aria-valuenow` 报告它推动的轴的像素值（左右两侧与四角报宽度、上下两条报高度），`aria-valuetext` 把宽高一并读出。未提供 `maxSize` 时 `aria-valuemax` 缺席，播报以 `aria-valuetext` 为准。
- 拖拽把手是原生按钮，激活键（Enter / Space）有实际含义：把面板送回初始位置。
- 把手不可推动时使用 `aria-disabled` 而不是原生 `disabled`：后者会把它移出 Tab 序列，键盘用户无法得知此处可移动。调整把手同理始终带 `tabindex="0"`。
- 收拢时正文带 `hidden`，其中的可聚焦元素一并退出 Tab 序列；只压缩高度时读屏与 Tab 仍可进入。

## 样式参考

### 皮肤

`@xihan-ui/styles/floating-panel.css` 使用 `[data-scope="floating-panel"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-resizing` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-window-state` | context.get('windowState') |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-window-state` | context.get('windowState') |
| `content` | `data-disabled` | ''（条件成立时才出现） |
| `content` | `data-dragging` | ''（条件成立时才出现） |
| `content` | `data-resizing` | ''（条件成立时才出现） |
| `content` | `data-state` | 'open' \| 'closed' |
| `content` | `data-window-state` | context.get('windowState') |
| `content` | `data-xh-material` | 'frosted' |
| `header` | `data-dragging` | ''（条件成立时才出现） |
| `header` | `data-window-state` | context.get('windowState') |
| `drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `resize-trigger` | `data-edge` | item.edge |
| `resize-trigger` | `data-resizing` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `window-state-trigger` | `data-state` | 'on' \| 'off' |
| `window-state-trigger` | `data-target-window-state` | item.windowState |
| `window-state-trigger` | `data-xh-action-control` | '' |
| `window-state-trigger` | `data-xh-action-display` | 'always' |
| `window-state-trigger` | `data-xh-action-profile` | 'icon' |
| `window-state-trigger` | `data-xh-action-size` | 'sm' |
| `window-state-trigger` | `data-xh-action-variant` | 'ghost' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |
| `body` | `data-window-state` | context.get('windowState') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-floating-panel-action-bg-active` | `close-trigger`<br>`window-state-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | floating-panel 的 close-trigger、window-state-trigger 部件 background-color 覆盖槽。 |
| `--xh-floating-panel-action-bg-hover` | `close-trigger`<br>`window-state-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | floating-panel 的 close-trigger、window-state-trigger 部件 background-color 覆盖槽。 |
| `--xh-floating-panel-action-bg-on` | `window-state-trigger` | `--xh-ink-surface`<br>`background-color` | `focus-visible`<br>`state=on`<br>`xh-ink-surface` | `--xh-bg-brand-subtle` | floating-panel 的 window-state-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-floating-panel-action-bg-on-active` | `window-state-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-bg-brand-subtle-active` | floating-panel 的 window-state-trigger 部件 background-color 覆盖槽。 |
| `--xh-floating-panel-action-bg-on-hover` | `window-state-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-bg-brand-subtle-hover` | floating-panel 的 window-state-trigger 部件 background-color 覆盖槽。 |
| `--xh-floating-panel-action-fg` | `close-trigger`<br>`window-state-trigger` | `color` | `default` | `--xh-material-frosted-fg-muted` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-active` | `close-trigger`<br>`window-state-trigger` | `color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-pressed` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-hover` | `close-trigger`<br>`window-state-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover` | floating-panel 的 close-trigger、window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-fg-on` | `window-state-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed`<br>`state=on` | `--xh-fg-on-brand-subtle` | floating-panel 的 window-state-trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-action-radius` | `window-state-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 window-state-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-action-size` | `window-state-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | floating-panel 的 window-state-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-bg` | `content` | `background` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-bg` | floating-panel 的 content 部件 background 覆盖槽。 |
| `--xh-floating-panel-body-px` | `body` | `padding-inline` | `default` | `--xh-surface-px-sm` | floating-panel 的 body 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-body-py` | `body` | `padding-block` | `default` | `--xh-surface-py-sm` | floating-panel 的 body 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-border` | `content` | `border` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-border` | floating-panel 的 content 部件 border 覆盖槽。 |
| `--xh-floating-panel-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | floating-panel 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-corner-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=ne`<br>`edge=nw`<br>`edge=se`<br>`edge=sw` | `--xh-space-4` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-fg` | `content` | `color` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-fg` | floating-panel 的 content 部件 color 覆盖槽。 |
| `--xh-floating-panel-handle-size` | `positioner`<br>`resize-trigger` | `height`<br>`width` | `edge=e`<br>`edge=n`<br>`edge=s`<br>`edge=w` | `--xh-space-2` | floating-panel 的 positioner、resize-trigger 部件 height、width 覆盖槽。 |
| `--xh-floating-panel-header-bg` | `header` | `background` | `default` | `--xh-material-frosted-bg` | floating-panel 的 header 部件 background 覆盖槽。 |
| `--xh-floating-panel-header-border` | `header` | `border-block-end` | `default` | `--xh-material-frosted-separator` | floating-panel 的 header 部件 border-block-end 覆盖槽。 |
| `--xh-floating-panel-header-gap` | `header` | `gap` | `default` | `--xh-control-gap-sm` | floating-panel 的 header 部件 gap 覆盖槽。 |
| `--xh-floating-panel-header-px` | `header` | `padding-inline` | `default` | `--xh-space-3` | floating-panel 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-header-py` | `header` | `padding-block` | `default` | `--xh-space-2` | floating-panel 的 header 部件 padding-block 覆盖槽。 |
| `--xh-floating-panel-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger`<br>`window-state-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | floating-panel 的 close-trigger、content、root、trigger、window-state-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-floating-panel-layer` | `positioner` | `z-index` | `default` | `--xh-layer-drawer` | floating-panel 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-floating-panel-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | floating-panel 的 content 部件 border-radius 覆盖槽。 |
| `--xh-floating-panel-shadow` | `content` | `box-shadow` | `not([data-xh-action-control])`<br>`xh-material=frosted` | `--xh-_material-shadow` | floating-panel 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-floating-panel-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | floating-panel 的 title 部件 color 覆盖槽。 |
| `--xh-floating-panel-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | floating-panel 的 title 部件 font-size 覆盖槽。 |
| `--xh-floating-panel-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | floating-panel 的 title 部件 font-weight 覆盖槽。 |
| `--xh-floating-panel-trigger-bg` | `trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`focus-visible`<br>`xh-ink-surface` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | floating-panel 的 trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-floating-panel-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | floating-panel 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-floating-panel-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | floating-panel 的 trigger 部件 color 覆盖槽。 |
| `--xh-floating-panel-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | floating-panel 的 trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-floating-panel-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | floating-panel 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-floating-panel-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | floating-panel 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态 · 出现（锚定面板） · 出现（无锚定弹出）（见[动效规范](../design/motion#角色)）。

共享关键帧 `xh-pop-in` · `xh-pop-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立；`box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 面板的坐标、八个把手的方位、方向键推动的方向都是屏幕方位，不随 `dir` 翻转。`w` 把手在 RTL 下仍位于物理左侧，按右方向键面板仍向屏幕右侧移动；指针位移本身就是屏幕坐标，跟随 `dir` 翻转会让手的方向与面板的动向不一致。
- 因此皮肤中调整把手的规则刻意使用物理的 `inset` / `width` / `height`，连接层写的也是 `left` / `top`。不要改成 `inset-inline-*`：把手会跑到对侧，向右拖动却从左侧收缩。
- 面板内的正文照常跟随文档方向：标题栏的排布、正文的书写方向都由外部的 `dir` 决定，本组件不干预。
