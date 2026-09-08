来源：https://ui.docs.xihanfun.com/components/image

# 图片 `image`

一张图，带加载状态与失败回退。

## 何时使用

- 任何需要显示远端图片、且要处理加载与失败的地方。

## 何时不用

- 图是纯装饰且不会失败：直接写 `<img>`。
- 是人的形象：用[头像](./avatar)。
- 是矢量图元：用[图标](./icon)。

## 特性

- 状态会回调；`fallbackDelay` 避免快速加载时闪一下回退内容。
- 回退内容可以按状态分流：加载中与失败给不同的东西。
- 取图时机可以由作者自己决定（懒加载）。

## 示例

### 基础用法

图片与回退内容始终同挂 DOM、靠 hidden 互斥显隐，换人时盒子不塌也不跳

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

// 内联的示例图，省得示例依赖外部资源
const cover
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";
</script>

<template>
  <!-- 尺寸由这两个自定义属性给：不给就是满宽、高度 auto -->
  <XhImageRoot
    :src="cover"
    alt="示例封面图"
    style="--xh-image-w: 220px; --xh-image-ratio: 16 / 9;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>
</template>
```

```html
<!-- 来源写在宿主上，src/alt 由它落到底层图片元素；地址用内联的示例图，省得示例依赖外部资源 -->
<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E"
  alt="示例封面图"
>
  <!-- 尺寸由这两个自定义属性给：不给就是满宽、高度 auto -->
  <div data-xh-part="root" style="--xh-image-w: 220px; --xh-image-ratio: 16 / 9">
    <img data-xh-part="image" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>
```

### 回退与状态

地址写坏和压根没给 src 是同一个落点，status-change 把三态报出来，root 上的 data-state 也有一份

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";
import { reactive } from "vue";

const cover
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

const status = reactive<Record<string, string>>({
  ok: "idle",
  broken: "idle",
  none: "idle",
});
</script>

<template>
  <XhImageRoot
    :src="cover"
    alt="正常加载的图"
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.ok = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    src="https://example.invalid/broken.png"
    alt="地址写坏的图"
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.broken = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>图挂了</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9;"
    @status-change="(d: { status: string }) => (status.none = d.status)"
  >
    <XhImageImage />
    <XhImageFallback>没有来源</XhImageFallback>
  </XhImageRoot>

  <span style="font-size: 13px;">
    状态：正常 {{ status.ok }} · 坏地址 {{ status.broken }} · 无 src {{ status.none }}
  </span>
</template>
```

```html
<div id="image-fallback" style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 12px">
  <xh-image
    data-case="ok"
    src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E"
    alt="正常加载的图"
  >
    <div data-xh-part="root" style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9">
      <img data-xh-part="image" />
      <div data-xh-part="fallback">加载中</div>
    </div>
  </xh-image>

  <xh-image data-case="broken" src="https://example.invalid/broken.png" alt="地址写坏的图">
    <div data-xh-part="root" style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9">
      <img data-xh-part="image" />
      <div data-xh-part="fallback">图挂了</div>
    </div>
  </xh-image>

  <xh-image data-case="none">
    <div data-xh-part="root" style="--xh-image-w: 160px; --xh-image-ratio: 16 / 9">
      <img data-xh-part="image" />
      <div data-xh-part="fallback">没有来源</div>
    </div>
  </xh-image>
</div>

<span id="image-fallback-readout" style="font-size: 13px">
  状态：正常 idle · 坏地址 idle · 无 src idle
</span>

<script type="module">
  // 三处状态字各跟着本行图片的 status-change 走
  const readout = document.getElementById("image-fallback-readout");
  const status = { ok: "idle", broken: "idle", none: "idle" };

  for (const host of document.getElementById("image-fallback").children) {
    host.addEventListener("status-change", (event) => {
      status[host.dataset.case] = event.detail.status;
      readout.textContent = `状态：正常 ${status.ok} · 坏地址 ${status.broken} · 无 src ${status.none}`;
    });
  }
</script>
```

### 尺寸与裁切

同一个组件既当封面图也当缩略图：宽高比由 --xh-image-ratio 定，画面怎么填由 --xh-image-fit 定

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

// 竖幅素材，放进方形盒子里才看得出 cover 与 contain 的差别
const portrait
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%204%22%3E%3Crect%20width=%223%22%20height=%224%22%20fill=%22%230f766e%22/%3E%3Ccircle%20cx=%221.5%22%20cy=%221.4%22%20r=%220.7%22%20fill=%22%235eead4%22/%3E%3C/svg%3E";
</script>

<template>
  <XhImageRoot
    :src="portrait"
    alt="裁掉多余部分"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: cover;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <XhImageRoot
    :src="portrait"
    alt="整幅装进去"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: contain;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 圆形缩略图：圆角也是一个变量，不必另建一个组件 -->
  <XhImageRoot
    :src="portrait"
    alt="圆形缩略图"
    style="--xh-image-w: 64px; --xh-image-ratio: 1; --xh-image-radius: 50%;"
  >
    <XhImageImage />
    <XhImageFallback>无</XhImageFallback>
  </XhImageRoot>

  <span style="font-size: 13px;">cover（裁切）· contain（留边）· 圆形缩略图</span>
</template>
```

```html
<!-- 竖幅素材，放进方形盒子里才看得出 cover 与 contain 的差别 -->
<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%204%22%3E%3Crect%20width=%223%22%20height=%224%22%20fill=%22%230f766e%22/%3E%3Ccircle%20cx=%221.5%22%20cy=%221.4%22%20r=%220.7%22%20fill=%22%235eead4%22/%3E%3C/svg%3E"
  alt="裁掉多余部分"
>
  <div
    data-xh-part="root"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: cover"
  >
    <img data-xh-part="image" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>

<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%204%22%3E%3Crect%20width=%223%22%20height=%224%22%20fill=%22%230f766e%22/%3E%3Ccircle%20cx=%221.5%22%20cy=%221.4%22%20r=%220.7%22%20fill=%22%235eead4%22/%3E%3C/svg%3E"
  alt="整幅装进去"
>
  <div
    data-xh-part="root"
    style="--xh-image-w: 120px; --xh-image-ratio: 1; --xh-image-fit: contain"
  >
    <img data-xh-part="image" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>

<!-- 圆形缩略图：圆角也是一个变量，不必另建一个组件 -->
<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%204%22%3E%3Crect%20width=%223%22%20height=%224%22%20fill=%22%230f766e%22/%3E%3Ccircle%20cx=%221.5%22%20cy=%221.4%22%20r=%220.7%22%20fill=%22%235eead4%22/%3E%3C/svg%3E"
  alt="圆形缩略图"
>
  <div
    data-xh-part="root"
    style="--xh-image-w: 64px; --xh-image-ratio: 1; --xh-image-radius: 50%"
  >
    <img data-xh-part="image" />
    <div data-xh-part="fallback">无</div>
  </div>
</xh-image>

<span style="font-size: 13px">cover（裁切）· contain（留边）· 圆形缩略图</span>
```

### 回退延迟与原生属性

fallback-delay 决定回退内容多久才露面，Infinity 表示加载期间一直不露面、只有失败才显；写在 image 部件上的原生属性照常落到底层图片元素上

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";

const shot
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%231e293b%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%220.5%22%20fill=%22%2338bdf8%22/%3E%3Crect%20x=%220.4%22%20y=%221.2%22%20width=%222%22%20height=%220.4%22%20fill=%22%2364748b%22/%3E%3C/svg%3E";

// 加载期间一直不让回退内容露面
const untilFailed = Number.POSITIVE_INFINITY;
</script>

<template>
  <!-- 缺省 0：加载还没完成的那一刻回退内容就顶上 -->
  <XhImageRoot
    :src="shot"
    alt="立刻顶上回退内容"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 600 毫秒内加载完就一次都不闪 -->
  <XhImageRoot
    :src="shot"
    alt="慢过 600 毫秒才顶上回退内容"
    :fallback-delay="600"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <!-- loading 是原生图片属性，组件不拦，直接落到图片元素上 -->
    <XhImageImage loading="lazy" />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- Infinity：加载途中什么都不显，只有失败才换人 -->
  <XhImageRoot
    src="https://example.invalid/shot.png"
    alt="只在失败时顶上回退内容"
    :fallback-delay="untilFailed"
    style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3;"
  >
    <XhImageImage />
    <XhImageFallback>图挂了</XhImageFallback>
  </XhImageRoot>
</template>
```

```html
<!-- 缺省 0：加载还没完成的那一刻回退内容就顶上 -->
<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%231e293b%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%220.5%22%20fill=%22%2338bdf8%22/%3E%3Crect%20x=%220.4%22%20y=%221.2%22%20width=%222%22%20height=%220.4%22%20fill=%22%2364748b%22/%3E%3C/svg%3E"
  alt="立刻顶上回退内容"
>
  <div data-xh-part="root" style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3">
    <img data-xh-part="image" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>

<!-- 600 毫秒内加载完就一次都不闪 -->
<xh-image
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%231e293b%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%220.5%22%20fill=%22%2338bdf8%22/%3E%3Crect%20x=%220.4%22%20y=%221.2%22%20width=%222%22%20height=%220.4%22%20fill=%22%2364748b%22/%3E%3C/svg%3E"
  alt="慢过 600 毫秒才顶上回退内容"
  fallback-delay="600"
>
  <div data-xh-part="root" style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3">
    <!-- loading 是原生图片属性，组件不拦，直接落到图片元素上 -->
    <img data-xh-part="image" loading="lazy" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>

<!-- Infinity：加载途中什么都不显，只有失败才换人 -->
<xh-image
  src="https://example.invalid/shot.png"
  alt="只在失败时顶上回退内容"
  fallback-delay="Infinity"
>
  <div data-xh-part="root" style="--xh-image-w: 140px; --xh-image-ratio: 4 / 3">
    <img data-xh-part="image" />
    <div data-xh-part="fallback">图挂了</div>
  </div>
</xh-image>
```

### 按状态分流的回退内容

状态一落位就报出来：加载中给占位、失败给提示与重试入口，两套内容共用同一个回退部件

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const good
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%202%22%3E%3Crect%20width=%223%22%20height=%222%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%222.2%22%20cy=%220.6%22%20r=%220.3%22%20fill=%22%23fde68a%22/%3E%3Cpath%20d=%22M0%202%201.2%200.8%202%201.5%202.6%201%203%201.4V2z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

// 一开始给个取不到的地址，重试时换成能取到的
const src = ref("https://example.invalid/photo.png");
</script>

<template>
  <XhImageRoot
    :src="src"
    alt="风景照"
    style="--xh-image-w: 200px; --xh-image-ratio: 3 / 2;"
  >
    <template #default="{ status }">
      <XhImageImage />
      <XhImageFallback>
        <!-- 失败与加载中是两回事，文案与可操作性都该不一样 -->
        <span v-if="status === 'error'" style="display: inline-flex; gap: 8px; align-items: center;">
          取不到这张图
          <button type="button" @click="src = good">重试</button>
        </span>
        <span v-else>正在加载…</span>
      </XhImageFallback>
    </template>
  </XhImageRoot>
</template>
```

```html
<!-- 一开始给个取不到的地址，重试时换成能取到的 -->
<xh-image id="image-status" src="https://example.invalid/photo.png" alt="风景照">
  <div data-xh-part="root" style="--xh-image-w: 200px; --xh-image-ratio: 3 / 2">
    <img data-xh-part="image" />
    <div data-xh-part="fallback">
      <span id="image-status-failed" style="display: none; align-items: center; gap: 8px">
        取不到这张图
        <button type="button" id="image-status-retry">重试</button>
      </span>
      <span id="image-status-loading">正在加载…</span>
    </div>
  </div>
</xh-image>

<script type="module">
  const host = document.getElementById("image-status");
  const failed = document.getElementById("image-status-failed");
  const loading = document.getElementById("image-status-loading");
  const good
    = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%203%202%22%3E%3Crect%20width=%223%22%20height=%222%22%20fill=%22%23334155%22/%3E%3Ccircle%20cx=%222.2%22%20cy=%220.6%22%20r=%220.3%22%20fill=%22%23fde68a%22/%3E%3Cpath%20d=%22M0%202%201.2%200.8%202%201.5%202.6%201%203%201.4V2z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

  // 失败与加载中是两回事，文案与可操作性都该不一样
  function render(status) {
    const broken = status === "error";
    failed.style.display = broken ? "inline-flex" : "none";
    loading.style.display = broken ? "none" : "inline";
  }

  render(host.querySelector('[data-xh-part="root"]').dataset.status);
  host.addEventListener("status-change", (event) => render(event.detail.status));
  document.getElementById("image-status-retry").addEventListener("click", () => {
    host.src = good;
  });
</script>
```

### 点开看大图

缩略图的点击与键盘自己接，放大层是一个对话框，里面再放一份独立的图片实例

```vue
<script setup lang="ts">
import {
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
  XhToolbarItem,
  XhToolbarRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const photo
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%230f172a%22/%3E%3Ccircle%20cx=%223.1%22%20cy=%220.8%22%20r=%220.35%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%203%201.4%201.4%202.4%202.3%203.1%201.6%204%202.4V3z%22%20fill=%22%2334d399%22/%3E%3C/svg%3E";

const open = ref(false);
const scale = ref(1);
const rotate = ref(0);

// 每次打开都从原始比例起看
function openPreview(): void {
  scale.value = 1;
  rotate.value = 0;
  open.value = true;
}

function zoom(step: number): void {
  scale.value = Math.min(3, Math.max(0.5, scale.value + step));
}

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <!-- 缩略图当触发器：角色、Tab 位与两个按键都写在根上，组件原样透传 -->
  <XhImageRoot
    :src="photo"
    alt="山间日出"
    role="button"
    tabindex="0"
    aria-label="放大查看 山间日出"
    style="--xh-image-w: 160px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
    @click="openPreview"
    @keydown.enter.prevent="openPreview"
    @keydown.space.prevent="openPreview"
  >
    <XhImageImage />
    <XhImageFallback>加载中</XhImageFallback>
  </XhImageRoot>

  <!-- 遮罩、居中定位与焦点圈禁都由对话框给，Esc 与点遮罩就是关闭预览 -->
  <XhDialogRoot v-model:open="open" size="lg" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>山间日出</XhDialogTitle>

      <!-- 放大层里是另一份图片实例：它的 alt、裁切方式与缩略图那份互不相干 -->
      <XhImageRoot
        :src="photo"
        alt="山间日出，放大查看"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
      >
        <XhImageImage
          :style="{
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            transition:
              'transform var(--xh-motion-duration-micro) var(--xh-motion-ease-continuous)',
          }"
        />
        <XhImageFallback>加载中</XhImageFallback>
      </XhImageRoot>

      <!-- 缩放与旋转是两个数值加一条 transform，工具条只负责把这几颗按钮串成一个 Tab 位 -->
      <XhToolbarRoot>
        <XhToolbarItem value="zoom-in" :style="itemStyle" @click="zoom(0.25)">
          放大
        </XhToolbarItem>
        <XhToolbarItem value="zoom-out" :style="itemStyle" @click="zoom(-0.25)">
          缩小
        </XhToolbarItem>
        <XhToolbarItem value="rotate" :style="itemStyle" @click="rotate += 90">
          旋转
        </XhToolbarItem>
        <XhToolbarItem
          value="reset"
          :style="itemStyle"
          @click="scale = 1; rotate = 0"
        >
          还原
        </XhToolbarItem>
      </XhToolbarRoot>

      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<!-- 缩略图当触发器：角色、Tab 位与两个按键都写在根上 -->
<xh-image
  id="image-preview-thumb"
  src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%230f172a%22/%3E%3Ccircle%20cx=%223.1%22%20cy=%220.8%22%20r=%220.35%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%203%201.4%201.4%202.4%202.3%203.1%201.6%204%202.4V3z%22%20fill=%22%2334d399%22/%3E%3C/svg%3E"
  alt="山间日出"
>
  <div
    data-xh-part="root"
    role="button"
    tabindex="0"
    aria-label="放大查看 山间日出"
    style="--xh-image-w: 160px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
  >
    <img data-xh-part="image" />
    <div data-xh-part="fallback">加载中</div>
  </div>
</xh-image>

<!-- 遮罩、居中定位与焦点圈禁都由对话框给，Esc 与点遮罩就是关闭预览 -->
<xh-dialog id="image-preview-dialog" size="lg" open="false">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">山间日出</h2>

      <!-- 放大层里是另一份图片实例：它的 alt、裁切方式与缩略图那份互不相干 -->
      <xh-image
        id="image-preview-large"
        src="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%230f172a%22/%3E%3Ccircle%20cx=%223.1%22%20cy=%220.8%22%20r=%220.35%22%20fill=%22%23fbbf24%22/%3E%3Cpath%20d=%22M0%203%201.4%201.4%202.4%202.3%203.1%201.6%204%202.4V3z%22%20fill=%22%2334d399%22/%3E%3C/svg%3E"
        alt="山间日出，放大查看"
      >
        <div
          data-xh-part="root"
          style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
        >
          <img
            data-xh-part="image"
            style="
              transition: transform var(--xh-motion-duration-micro)
                var(--xh-motion-ease-continuous);
            "
          />
          <div data-xh-part="fallback">加载中</div>
        </div>
      </xh-image>

      <!-- 缩放与旋转是两个数值加一条 transform，工具条只负责把这几颗按钮串成一个 Tab 位 -->
      <xh-toolbar id="image-preview-toolbar">
        <div data-xh-part="root">
          <button
            type="button"
            data-xh-part="item"
            value="zoom-in"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            放大
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="zoom-out"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            缩小
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="rotate"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            旋转
          </button>
          <button
            type="button"
            data-xh-part="item"
            value="reset"
            style="
              padding: 4px 10px;
              border-radius: 6px;
              border: 1px solid var(--xh-border-default);
              background: var(--xh-bg-surface);
            "
          >
            还原
          </button>
        </div>
      </xh-toolbar>

      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  const dialog = document.getElementById("image-preview-dialog");
  const thumb = document
    .getElementById("image-preview-thumb")
    .querySelector('[data-xh-part="root"]');
  const large = document
    .getElementById("image-preview-large")
    .querySelector('[data-xh-part="image"]');
  const toolbar = document.getElementById("image-preview-toolbar");

  let scale = 1;
  let rotate = 0;

  // 两个数值合成一条 transform 写回放大层那份图片
  function apply() {
    large.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
  }

  // 每次打开都从原始比例起看
  function openPreview() {
    scale = 1;
    rotate = 0;
    apply();
    dialog.open = true;
  }

  thumb.addEventListener("click", openPreview);
  thumb.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview();
    }
  });
  dialog.addEventListener("open-change", (event) => {
    dialog.open = event.detail.open;
  });

  const actions = {
    "zoom-in": () => (scale = Math.min(3, scale + 0.25)),
    "zoom-out": () => (scale = Math.max(0.5, scale - 0.25)),
    "rotate": () => (rotate += 90),
    "reset": () => ((scale = 1), (rotate = 0)),
  };

  for (const item of toolbar.querySelectorAll('[data-xh-part="item"]')) {
    item.addEventListener("click", () => {
      actions[item.value]();
      apply();
    });
  }
</script>
```

### 一组图共用一个预览层

图与图之间不必互相认识：宿主拿着地址数组与当前下标，预览层里只放一份图片实例

```vue
<script setup lang="ts">
import {
  XhButton,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

function tile(bg: string, mark: string): string {
  return `data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23${bg}%22/%3E%3Ccircle%20cx=%222%22%20cy=%221.5%22%20r=%220.8%22%20fill=%22%23${mark}%22/%3E%3C/svg%3E`;
}

const shots = [
  { src: tile("1e3a8a", "93c5fd"), title: "海面" },
  { src: tile("065f46", "6ee7b7"), title: "林地" },
  { src: tile("7c2d12", "fdba74"), title: "岩壁" },
];

const open = ref(false);
const index = ref(0);

function preview(at: number): void {
  index.value = at;
  open.value = true;
}

// 翻页就是下标加减，走到头回绕
function step(delta: number): void {
  index.value = (index.value + delta + shots.length) % shots.length;
}
</script>

<template>
  <div style="display: flex; gap: 8px">
    <XhImageRoot
      v-for="(shot, at) in shots"
      :key="shot.title"
      :src="shot.src"
      :alt="shot.title"
      role="button"
      tabindex="0"
      :aria-label="`放大查看 ${shot.title}`"
      style="--xh-image-w: 96px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
      @click="preview(at)"
      @keydown.enter.prevent="preview(at)"
      @keydown.space.prevent="preview(at)"
    >
      <XhImageImage />
      <XhImageFallback>加载中</XhImageFallback>
    </XhImageRoot>
  </div>

  <XhDialogRoot v-model:open="open" size="lg" :translations="{ close: '关闭' }">
    <XhDialogContent>
      <XhDialogTitle>{{ shots[index].title }}</XhDialogTitle>

      <!-- 只有一份实例，src 换了机器就重走一遍加载，回退内容照常顶位 -->
      <XhImageRoot
        :src="shots[index].src"
        :alt="shots[index].title"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
      >
        <XhImageImage />
        <XhImageFallback>加载中</XhImageFallback>
      </XhImageRoot>

      <div style="display: flex; align-items: center; gap: 12px">
        <XhButton size="sm" variant="outline" @click="step(-1)">上一张</XhButton>
        <span style="font-size: 13px">{{ index + 1 }} / {{ shots.length }}</span>
        <XhButton size="sm" variant="outline" @click="step(1)">下一张</XhButton>
      </div>

      <XhDialogCloseTrigger />
    </XhDialogContent>
  </XhDialogRoot>
</template>
```

```html
<div id="image-group-thumbs" style="display: flex; gap: 8px">
  <xh-image data-at="0" alt="海面">
    <div
      data-xh-part="root"
      role="button"
      tabindex="0"
      aria-label="放大查看 海面"
      style="--xh-image-w: 96px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
    >
      <img data-xh-part="image" />
      <div data-xh-part="fallback">加载中</div>
    </div>
  </xh-image>

  <xh-image data-at="1" alt="林地">
    <div
      data-xh-part="root"
      role="button"
      tabindex="0"
      aria-label="放大查看 林地"
      style="--xh-image-w: 96px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
    >
      <img data-xh-part="image" />
      <div data-xh-part="fallback">加载中</div>
    </div>
  </xh-image>

  <xh-image data-at="2" alt="岩壁">
    <div
      data-xh-part="root"
      role="button"
      tabindex="0"
      aria-label="放大查看 岩壁"
      style="--xh-image-w: 96px; --xh-image-ratio: 4 / 3; cursor: zoom-in"
    >
      <img data-xh-part="image" />
      <div data-xh-part="fallback">加载中</div>
    </div>
  </xh-image>
</div>

<xh-dialog id="image-group-dialog" size="lg" open="false">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <h2 data-xh-part="title">海面</h2>

      <!-- 只有一份实例，src 换了机器就重走一遍加载，回退内容照常顶位 -->
      <xh-image id="image-group-large">
        <div
          data-xh-part="root"
          style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3; --xh-image-fit: contain"
        >
          <img data-xh-part="image" />
          <div data-xh-part="fallback">加载中</div>
        </div>
      </xh-image>

      <div style="display: flex; align-items: center; gap: 12px">
        <xh-button id="image-group-prev" size="sm" variant="outline">
          <button data-xh-part="root">上一张</button>
        </xh-button>
        <span id="image-group-counter" style="font-size: 13px">1 / 3</span>
        <xh-button id="image-group-next" size="sm" variant="outline">
          <button data-xh-part="root">下一张</button>
        </xh-button>
      </div>

      <button data-xh-part="close-trigger" aria-label="关闭"></button>
    </div>
  </div>
</xh-dialog>

<script type="module">
  function tile(bg, mark) {
    return `data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23${bg}%22/%3E%3Ccircle%20cx=%222%22%20cy=%221.5%22%20r=%220.8%22%20fill=%22%23${mark}%22/%3E%3C/svg%3E`;
  }

  const shots = [
    { src: tile("1e3a8a", "93c5fd"), title: "海面" },
    { src: tile("065f46", "6ee7b7"), title: "林地" },
    { src: tile("7c2d12", "fdba74"), title: "岩壁" },
  ];

  const dialog = document.getElementById("image-group-dialog");
  const large = document.getElementById("image-group-large");
  const title = dialog.querySelector('[data-xh-part="title"]');
  const counter = document.getElementById("image-group-counter");

  let index = 0;

  // 预览层这一份换掉 src 与 alt，标题与计数跟着走
  function render() {
    large.src = shots[index].src;
    large.alt = shots[index].title;
    title.textContent = shots[index].title;
    counter.textContent = `${index + 1} / ${shots.length}`;
  }

  function preview(at) {
    index = at;
    render();
    dialog.open = true;
  }

  // 翻页就是下标加减，走到头回绕
  function step(delta) {
    index = (index + delta + shots.length) % shots.length;
    render();
  }

  for (const host of document.getElementById("image-group-thumbs").children) {
    const at = Number(host.dataset.at);
    host.src = shots[at].src;
    const root = host.querySelector('[data-xh-part="root"]');
    root.addEventListener("click", () => preview(at));
    root.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        preview(at);
      }
    });
  }

  document
    .getElementById("image-group-prev")
    .querySelector('[data-xh-part="root"]')
    .addEventListener("click", () => step(-1));
  document
    .getElementById("image-group-next")
    .querySelector('[data-xh-part="root"]')
    .addEventListener("click", () => step(1));
  dialog.addEventListener("open-change", (event) => {
    dialog.open = event.detail.open;
  });

  render();
</script>
```

### 自己决定何时取图

src 是响应式的：进入视口前不给地址，观察器命中再换上，机器立刻走一遍完整加载

```vue
<script setup lang="ts">
import { XhImageFallback, XhImageImage, XhImageRoot } from "@xihan-ui/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

const remote
  = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23334155%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%221%22%20fill=%22%2360a5fa%22/%3E%3Crect%20x=%220.4%22%20y=%221.8%22%20width=%222%22%20height=%220.8%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

const viewport = ref<HTMLElement | null>(null);
const host = ref<HTMLElement | null>(null);
const src = ref<string | undefined>(undefined);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!host.value)
    return;
  // 观察器的三个参数都在这里定：拿哪个盒子当视口、提前多远开始取、露出几成算数
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some(entry => entry.isIntersecting))
        return;
      src.value = remote;
      observer?.disconnect();
    },
    { root: viewport.value, rootMargin: "24px", threshold: 0.1 },
  );
  observer.observe(host.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    ref="viewport"
    style="
      inline-size: 260px;
      block-size: 180px;
      overflow-y: auto;
      padding: 12px;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <p style="margin: 0 0 12px">往下滚，图片进视口才开始取。</p>
    <div style="block-size: 200px" />

    <div ref="host">
      <!-- 还没给地址时落的是无来源那一态，回退部件正好当占位 -->
      <XhImageRoot
        :src="src"
        alt="报表截图"
        style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3"
      >
        <XhImageImage />
        <XhImageFallback>{{ src ? "加载中" : "还没开始取" }}</XhImageFallback>
      </XhImageRoot>
    </div>
  </div>
</template>
```

```html
<div
  id="image-lazy-viewport"
  style="
    inline-size: 260px;
    block-size: 180px;
    overflow-y: auto;
    padding: 12px;
    border: 1px solid var(--xh-border-default);
    border-radius: 8px;
  "
>
  <p style="margin: 0 0 12px">往下滚，图片进视口才开始取。</p>
  <div style="block-size: 200px"></div>

  <div id="image-lazy-host">
    <!-- 还没给地址时落的是无来源那一态，回退部件正好当占位 -->
    <xh-image id="image-lazy" alt="报表截图">
      <div data-xh-part="root" style="--xh-image-w: 100%; --xh-image-ratio: 4 / 3">
        <img data-xh-part="image" />
        <div data-xh-part="fallback">还没开始取</div>
      </div>
    </xh-image>
  </div>
</div>

<script type="module">
  const remote
    = "data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%204%203%22%3E%3Crect%20width=%224%22%20height=%223%22%20fill=%22%23334155%22/%3E%3Crect%20x=%220.4%22%20y=%220.4%22%20width=%223.2%22%20height=%221%22%20fill=%22%2360a5fa%22/%3E%3Crect%20x=%220.4%22%20y=%221.8%22%20width=%222%22%20height=%220.8%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E";

  const viewport = document.getElementById("image-lazy-viewport");
  const host = document.getElementById("image-lazy-host");
  const image = document.getElementById("image-lazy");
  const fallback = image.querySelector('[data-xh-part="fallback"]');

  // 观察器的三个参数都在这里定：拿哪个盒子当视口、提前多远开始取、露出几成算数
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      image.src = remote;
      fallback.textContent = "加载中";
      observer.disconnect();
    },
    { root: viewport, rootMargin: "24px", threshold: 0.1 },
  );

  observer.observe(host);
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-image>` |
| Vue 组件 | `XhImageFallback` `XhImageImage` `XhImagePlaceholder` `XhImageRoot` |
| 组合式函数 | `useImage` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/image.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="image"`：**`root`** · **`image`** · `placeholder` · `fallback`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` |  |  |
| `alt` | `string` |  |  |
| `fallbackDelay` | `number` |  | 加载超过这么久（毫秒）才让回退内容露面，默认 0（立刻露面）。 Infinity 表示加载期间永不显示回退内容，只有失败才显。 |
| `onStatusChange` | `(details: ImageStatusChangeDetails) => void` |  | 状态每次真正落位时通知一次；过渡态 idle 不通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ImageStatusChangeDetails` | 加载状态变化；detail 为 `{ status: 'loading' \| 'loaded' \| 'error' }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhImageRoot` | `default` | `ImageRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | state.get() |
| `image` | state.get() |
| `placeholder` | state.get() |
| `fallback` | state.get() |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**事件**：`SRC.CHANGE` · `IMAGE.LOAD` · `IMAGE.ERROR` · `after.fallbackDelay`

**判据**：`hasSrc`

## connect API

`useImage` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ImageStatus` |  |
| `loaded` | `boolean` |  |
| `showFallback` | `boolean` | 回退内容此刻是否该露面：加载失败恒为真，加载途中要看 fallbackDelay 是否已过。 |
| `showPlaceholder` | `boolean` | 占位层此刻是否该露面：来源决议中与加载中为真，落位或失败后为假。 |
| `getRootProps` | `() => T['element']` |  |
| `getImageProps` | `() => T['img']` |  |
| `getPlaceholderProps` | `() => T['element']` | 加载期间铺在图位上的占位层，纯装饰。 |
| `getFallbackProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `placeholder` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/image.css` 按部件选择：`[data-scope="image"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | state.get() |
| `image` | `data-state` | state.get() |
| `placeholder` | `data-state` | state.get() |
| `fallback` | `data-state` | state.get() |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-image-bg` · `--xh-image-fallback-fg` · `--xh-image-fallback-font-size` · `--xh-image-fallback-min-h` · `--xh-image-fit` · `--xh-image-h` · `--xh-image-placeholder-bg` · `--xh-image-placeholder-fg` · `--xh-image-radius` · `--xh-image-ratio` · `--xh-image-w`

## 动效

关键帧 `xh-fade-in` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 与[图片预览](./image-viewer)配合点开看大图；一组图共用一个预览层。

## 最佳实践

- `alt` 写图里的信息，不写"图片"；纯装饰图写空 `alt`。
- 给容器预留宽高比，否则图加载出来时整页会跳。

## 反模式

- 失败时什么都不显示：用户以为页面坏了。
- 用大图当背景却不做任何降级。
