来源：https://ui.docs.xihanfun.com/components/signature-pad

# SignaturePad 签名板

用指针书写的画布：按下落笔、移动成迹、抬起收笔，输出可缩放、可直接提交的 SVG。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/signature-pad" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/signature-pad.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/signature-pad" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/signature-pad" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/signature-pad.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一块画布加一条笔迹路径即可：按下落笔、移动成迹、抬起收笔

```vue
<script setup lang="ts">
import { XhSignaturePadControl, XhSignaturePadPath, XhSignaturePadRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhSignaturePadRoot style="max-inline-size: 22rem">
    <!-- 画布是 svg，笔迹全落在它里面那一条 path 上 -->
    <XhSignaturePadControl>
      <XhSignaturePadPath />
    </XhSignaturePadControl>
  </XhSignaturePadRoot>
</template>
```

```html
<xh-signature-pad>
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <!-- 画布是 svg，笔迹全落在它里面那一条 path 上 -->
    <svg data-xh-part="control">
      <path data-xh-part="path"></path>
    </svg>
  </div>
</xh-signature-pad>
```

## 组件结构

加粗的是必需部件。

`data-scope="signature-pad"`：**`root`** · `label` · **`control`** · `guide` · **`path`** · `clear-trigger` · `status` · `hidden-input`

## 示例

### 标题、基准线与清空

基准线是纯画面（带 aria-hidden），清空按钮是原生 button，读屏朗读的是 translations 中的文案

```vue
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhSignaturePadRoot
    :translations="{ label: '手写签名', clearTrigger: '清空签名' }"
    style="max-inline-size: 22rem"
  >
    <XhSignaturePadLabel>请在下方签名</XhSignaturePadLabel>
    <XhSignaturePadControl>
      <XhSignaturePadGuide />
      <XhSignaturePadPath />
    </XhSignaturePadControl>
    <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
  </XhSignaturePadRoot>
</template>
```

```html
<xh-signature-pad id="xh-signature-guide">
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <span data-xh-part="label">请在下方签名</span>
    <svg data-xh-part="control">
      <line data-xh-part="guide"></line>
      <path data-xh-part="path"></path>
    </svg>
    <button data-xh-part="clear-trigger">清空</button>
  </div>
</xh-signature-pad>

<script type="module">
  // 文案是对象，只走 property；属性装不下它
  document.getElementById("xh-signature-guide").translations = {
    label: "手写签名",
    clearTrigger: "清空签名",
  };
</script>
```

### 参与表单

提供 name 后带上表单影子，提交的是一份独立 SVG；表单重置会把画布清空

```vue
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadHiddenInput,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
  XhSignaturePadStatus,
} from "@xihan-ui/vue";
</script>

<template>
  <form style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 22rem" @submit.prevent>
    <XhSignaturePadRoot
      name="signature"
      required
      :translations="{ statusEmpty: '尚未签名', statusSigned: '已签名' }"
    >
      <XhSignaturePadLabel>验收签名（必填）</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      <!-- 画布是一张图，签没签只能从这块活区域听出来；签上与清空都会播报一次 -->
      <XhSignaturePadStatus />
      <!-- 表单影子视觉隐藏，但 required 会拦住空签名的提交 -->
      <XhSignaturePadHiddenInput />
    </XhSignaturePadRoot>
    <div style="display: flex; gap: 8px">
      <button type="submit">提交</button>
      <button type="reset">重置</button>
    </div>
  </form>
</template>
```

```html
<form id="xh-signature-form" style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 22rem">
  <xh-signature-pad id="xh-signature-form-pad" name="signature" required>
    <div data-xh-part="root">
      <span data-xh-part="label">验收签名（必填）</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
      <!-- 画布是一张图，签没签只能从这块活区域听出来；签上与清空都会播报一次 -->
      <span data-xh-part="status"></span>
      <!-- 表单影子视觉隐藏，但 required 会拦住空签名的提交 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-signature-pad>
  <div style="display: flex; gap: 8px">
    <button type="submit">提交</button>
    <button type="reset">重置</button>
  </div>
</form>

<script type="module">
  // 演示页不真发请求，拦下提交即可；required 的拦截由浏览器自己完成
  document
    .getElementById("xh-signature-form")
    .addEventListener("submit", (event) => event.preventDefault());

  // 文案是对象，只走 property；属性装不下它
  document.getElementById("xh-signature-form-pad").translations = {
    statusEmpty: "尚未签名",
    statusSigned: "已签名",
  };
</script>
```

### 笔迹外形

drawing 调整笔宽与压感：thinning 越大，划得越快笔画越细，simulatePressure 决定压感取设备值还是按速度计算

```vue
<script setup lang="ts">
import { XhSignaturePadControl, XhSignaturePadGuide, XhSignaturePadPath, XhSignaturePadRoot } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
    <!-- 默认：4px 恒定粗细，压感不参与 -->
    <XhSignaturePadRoot>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
    </XhSignaturePadRoot>
    <!-- 粗笔加重压感：起笔厚、划快了收细 -->
    <XhSignaturePadRoot :drawing="{ size: 10, thinning: 0.8 }">
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
    </XhSignaturePadRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
  <!-- 默认：4px 恒定粗细，压感不参与 -->
  <xh-signature-pad>
    <div data-xh-part="root">
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
    </div>
  </xh-signature-pad>
  <!-- 粗笔加重压感：起笔厚、划快了收细 -->
  <xh-signature-pad id="xh-signature-pen">
    <div data-xh-part="root">
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
    </div>
  </xh-signature-pad>
</div>

<script type="module">
  // 笔迹外形是对象，只走 property
  document.getElementById("xh-signature-pen").drawing = { size: 10, thinning: 0.8 };
</script>
```

### 只读与禁用

只读时已绘制的笔迹可见但不可修改，禁用时连清空按钮都不可按下；两者都使用原生 disabled，不只是视觉置灰

```vue
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadLabel,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
    <XhSignaturePadRoot read-only>
      <XhSignaturePadLabel>只读</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
    <XhSignaturePadRoot disabled>
      <XhSignaturePadLabel>禁用</XhSignaturePadLabel>
      <XhSignaturePadControl>
        <XhSignaturePadGuide />
        <XhSignaturePadPath />
      </XhSignaturePadControl>
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
    </XhSignaturePadRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 22rem">
  <xh-signature-pad read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
  <xh-signature-pad disabled>
    <div data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="path"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
    </div>
  </xh-signature-pad>
</div>
```

### 取出签名

签名定稿时 draw-end 带上一份可直接入库的 SVG；提交前用 empty 拦截一次，空签名不应离开客户端

```vue
<script setup lang="ts">
import {
  XhSignaturePadClearTrigger,
  XhSignaturePadControl,
  XhSignaturePadGuide,
  XhSignaturePadPath,
  XhSignaturePadRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const size = ref(0);

// 签名定稿才发一次：抬笔、清空与表单重置三条路径都会走到这里
function onDrawEnd(details: { paths: string[]; svg: string }) {
  size.value = details.svg.length;
}
</script>

<template>
  <XhSignaturePadRoot v-slot="{ empty }" style="max-inline-size: 22rem" @draw-end="onDrawEnd">
    <XhSignaturePadControl>
      <XhSignaturePadGuide />
      <XhSignaturePadPath />
    </XhSignaturePadControl>
    <div style="display: flex; gap: 8px; align-items: center">
      <XhSignaturePadClearTrigger>清空</XhSignaturePadClearTrigger>
      <!-- 空签名与"签了但很潦草"是两回事，前者应该在客户端就挡住 -->
      <button type="button" :disabled="empty">提交</button>
      <span style="font-size: 12px">SVG {{ size }} 字节</span>
    </div>
  </XhSignaturePadRoot>
</template>
```

```html
<xh-signature-pad id="xh-signature-export">
  <div data-xh-part="root" style="max-inline-size: 22rem">
    <svg data-xh-part="control">
      <line data-xh-part="guide"></line>
      <path data-xh-part="path"></path>
    </svg>
    <div style="display: flex; gap: 8px; align-items: center">
      <button data-xh-part="clear-trigger">清空</button>
      <!-- 空签名与"签了但很潦草"是两回事，前者应该在客户端就挡住 -->
      <button type="button" id="xh-signature-submit" disabled>提交</button>
      <span id="xh-signature-size" style="font-size: 12px">SVG 0 字节</span>
    </div>
  </div>
</xh-signature-pad>

<script type="module">
  const host = document.getElementById("xh-signature-export");
  const submit = document.getElementById("xh-signature-submit");
  const size = document.getElementById("xh-signature-size");
  // 清空与表单重置同样发 draw-end，一个监听器就够，不必去嗅探清空按钮
  host.addEventListener("draw-end", (event) => {
    size.textContent = `SVG ${event.detail.svg.length} 字节`;
    submit.disabled = event.detail.svg.length === 0;
  });
</script>
```

## 设计指引

### 何时使用

- 承诺书、回执、验收单上需要手写签名。
- 交付确认、上门服务签收等需要留下确认痕迹的场景。

### 何时不用

- 需要已有的签名图片时，属于上传，使用[文件上传](./file-upload)。
- 需要打字签名或姓名核对时，属于一行文本，使用[文本字段](./text-field)。
- 需要在图片上圈画批注时，本组件只绘制自己的画布，不承载底图。

### 特性

- 笔迹是 SVG 填充路径，放大不模糊；每一笔是同一条路径上的一条子路径。
- 第一笔落下时测量一次画布并固定这套坐标，画布的 `viewBox` 与导出的 SVG 都使用它：容器变宽变窄时，已有笔迹跟随缩放而不是停留在原像素上错位。清空后重新测量。
- `drawing` 一组选项调整笔画外形：`size` 决定粗细，`thinning` 让粗细随压感变化，`simulatePressure` 决定压感取设备值还是按落笔速度计算。
- 带 `name` 即参与表单提交，提交的是一份独立的 SVG 文档；表单重置会清空画布。
- 笔迹变化时发出 `draw`，签名定稿时发出 `draw-end`：抬笔、点击清空、表单重置三条路径都发出。按 `draw-end` 缓存待提交的 SVG 不会取到过期版本。
- 指针划出画布甚至划出窗口都持续跟随，抬起即收笔；落笔的指针被捕获，手掌与第二根手指的移动不会续进这一笔。
- 画布是一块字段外壳：静息不填底 + `--xh-border-control` 描边 + 4px 控件圆角、无影；落笔时描边加深，只读只换淡底，禁用退到 `--xh-border-default` + `--xh-bg-subtle`。画布按宽高比撑高，吃不下字段家族配方钉死的控件行高，因此外壳按同一套字段规则自绘。
- 标签走字段标签档（14 / 500 / `--xh-fg-default`），贴画布 `--xh-space-1`；状态句是说明角色（13 / `--xh-fg-muted`）。
- 清空按钮走 Action Control text 档 sm：缺省 `outline` 描边，白底承载阶梯悬停 100 → 按下 200，按下缩放并换底；空画布时只把静息前景压淡，按钮照常可按。

### 组合

- 与[表单字段](./field)搭配：标题、说明与错误提示交给字段，签名板只负责画布。
- 放入[表单](./form)，提供 `name` 后随表单提交与重置。
- 与[对话框](./dialog)搭配做签名确认：确认按钮的可用状态读取 `empty`。

### 节点形状是硬约束

画布这一族部件必须落在特定标签上，写错不报错，但无法绘制：

- `control` 必须是 `<svg>`；
- `guide` 必须是 `control` 内的 `<line>`；
- `path` 必须是 `control` 内的 `<path>`；
- `clear-trigger` 必须是原生 `<button>`，`hidden-input` 必须是原生 `<input>`。

`viewBox` 由组件写入，作者不要在 `control` 上再写。

### 两个适配器的分工

- Vue：`XhSignaturePadRoot` 的默认插槽给出 `empty` / `paths` / `drawing` / `statusText` 与 `toSvg()` / `clear()`；也可以用 `useSignaturePad()` 自行获取。`XhSignaturePadGuide` 与 `XhSignaturePadPath` 必须写在 `XhSignaturePadControl` 内：SVG 命名空间由该子树带下，移出后会成为 HTML 元素，无法绘制。
- Web Components：结构由作者编写（Light DOM，不投影插槽）。`<xh-signature-pad>` 上有 `clear()`、`toSvg()` 与只读的 `empty`；提交前取签名用 `toSvg()`，不需要缓存上一次 `draw-end`。
- 两侧的 `status` 部件内都不需要自行写文字：节点为空时由适配器填入内建文案；写了文字则以作者的为准。

### 最佳实践

- 给清空按钮一句可见文字或稳定的图标语义，不只依靠一个叉。
- 清空之后安置焦点：按钮被禁用或收起时焦点会回到 `<body>`，键盘用户每清空一次就丢失一次位置。要么让按钮始终可按（本组件的默认做法），要么清空后显式把焦点交给下一个落点。
- 提交前用 `empty` 拦截：空签名与潦草签名是两回事，前者应在客户端拦截。
- 需要缓存待提交的 SVG 时按 `draw-end` 缓存：清空与表单重置同样会发出它，缓存不会停留在旧版本。不要嗅探清空按钮的点击。
- 存储的是 SVG 文本，不是位图。需要位图时在服务端渲染，不在前端截屏。

### 反模式

- 把画布做得很窄：手写需要面积，过窄的画布只会产生无法辨认的字迹。
- 让签名成为唯一的确认方式却不提供替代路径，这是可达性问题。
- 把签名图当作身份凭证。它证明的是有人在画布上书写过，不是书写者的身份。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-signature-pad>` |
| Vue 组件 | `XhSignaturePadClearTrigger` `XhSignaturePadControl` `XhSignaturePadGuide` `XhSignaturePadHiddenInput` `XhSignaturePadLabel` `XhSignaturePadPath` `XhSignaturePadRoot` `XhSignaturePadStatus` |
| 组合式函数 | `useSignaturePad` |
| 状态机 | `signaturePadMachine` |
| 皮肤 | `@xihan-ui/styles/signature-pad.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 整块不可交互：不响应落笔，清空按钮也不可按下。 |
| `readOnly` | `boolean` |  | 只读：已绘制的签名照常显示，但不可修改。 |
| `required` | `boolean` |  |  |
| `invalid` | `boolean` |  | 校验未通过的标记，只改变外观与表单影子上的 aria-invalid。 |
| `name` | `string` |  | 表单字段名；提供后表单影子才带 name 并参与提交。 |
| `drawing` | `SignaturePadDrawingOptions` |  | 笔迹外形。默认为 4px 恒定粗细。 |
| `translations` | `Partial<SignaturePadTranslations>` |  |  |
| `onDraw` | `(details: SignaturePadDrawDetails) => void` |  | 每收进一个点通知一次，清空与表单重置时也通知一次（路径为空）。 |
| `onDrawEnd` | `(details: SignaturePadDrawEndDetails) => void` |  | 签名定稿时通知一次并附带可直接提交的 SVG：抬笔、清空、表单重置三条路径都发出。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `draw` | `SignaturePadDrawDetails` | 笔迹变化时通知一次（含清空与表单重置）；detail 为 `{ paths: string[], path: string }` |
| `draw-end` | `SignaturePadDrawEndDetails` | 签名定稿时通知一次（抬笔、清空、表单重置）；detail 为 `{ paths: string[], svg: string }`，svg 可直接存储 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSignaturePadRoot` | `default` | `SignaturePadRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhSignaturePadRoot` | `children` | `SlotChildren<SignaturePadRootSlotProps>` |  |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`drawing` · `idle`

**事件**：`DRAW.START` · `DRAW.MOVE` · `DRAW.END` · `STROKES.CLEAR` · `FORM.RESET` · `PRESS.START` · `PRESS.END`

**判据**：`canDraw` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `paths` | `readonly string[]` | 逐笔的填充轮廓 d 串，按落笔先后排列。 |
| `empty` | `boolean` | 没有任何笔迹。 |
| `drawing` | `boolean` | 笔正落在画布上。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `statusText` | `string` | 是否已签名的文案，写入 status 部件；适配器在作者未自行编写文字时把它填入节点。 |
| `toSvg` | `() => string` | 当前签名的独立 SVG 文档，与表单影子提交的是同一份；空签名为空串。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getGuideProps` | `() => T['element']` |  |
| `getPathProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getStatusProps` | `() => T['element']` | 状态出口：一块 role=status 的活区域，签名与清空都会播报一次。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份视觉隐藏的原生输入，随表单提交当前签名。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus on clear-trigger, 未禁用且非只读 | 清空整块画布；按钮是原生 button，这两个键由平台翻成 click |
| `Enter` / `Space` | held in clear-trigger, 未禁用且非只读 | 按住期间投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `control` | `aria-label` | translations?.label |
| `control` | `aria-labelledby` | `label` 部件的 id |
| `control` | `role` | 'img' |
| `guide` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations?.clearTrigger |
| `status` | `aria-atomic` | 'true' |
| `status` | `aria-live` | 'polite' |
| `status` | `role` | 'status' |
| `hidden-input` | `aria-hidden` | 'true' |
| `hidden-input` | `aria-invalid` | 'true' \| 'false' |

- 签名天然依赖指针，键盘和读屏无法完成。凡是要求签名的流程，必须同时提供一条不依赖指针的替代路径：打字签名、上传签名图或线下核验。只放一块画布等于把这些用户挡在流程之外。
- 画布报告为 `role="img"`，不是控件：它不接受键盘、不进入 Tab 序列，伪装成控件只会让读屏用户进入无法操作的位置。
- 画布的名称来自 `label` 部件；未渲染标题时退回 `translations.label`。
- 是否已签名由 `status` 部件播报。画布是 `role="img"`，名称固定，签名、清空、表单重置后读屏读出的都是同一句，用户无法确认笔迹是否保留。`status` 是 `role="status"` 的活动区域，值每变一次播报一次，文案使用 `translations.statusEmpty` / `translations.statusSigned`。要求签名的表单请渲染它。
- 基准线是纯画面，带 `aria-hidden`，读屏不读。没有 `translations.guide` 文案：给装饰线命名只会增加无信息量的播报。
- 清空按钮是原生 `<button>`，Enter / Space 由平台激活；按钮内只有图标时读屏读 `translations.clearTrigger`。

## 样式参考

### 皮肤

`@xihan-ui/styles/signature-pad.css` 使用 `[data-scope="signature-pad"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-drawing` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-drawing` | ''（条件成立时才出现） |
| `control` | `data-empty` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `guide` | `data-disabled` | ''（条件成立时才出现） |
| `path` | `data-empty` | ''（条件成立时才出现） |
| `clear-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `clear-trigger` | `data-empty` | ''（条件成立时才出现） |
| `clear-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `clear-trigger` | `data-xh-action-control` | '' |
| `clear-trigger` | `data-xh-action-display` | 'always' |
| `clear-trigger` | `data-xh-action-profile` | 'text' |
| `clear-trigger` | `data-xh-action-size` | 'sm' |
| `clear-trigger` | `data-xh-action-variant` | 'outline' |
| `status` | `data-empty` | ''（条件成立时才出现） |
| `hidden-input` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-signature-pad-aspect-ratio` | `control` | `aspect-ratio` | `default` | `5 / 2` | signature-pad 的 control 部件 aspect-ratio 覆盖槽。 |
| `--xh-signature-pad-bg` | `control` | `background` | `default` | `transparent` | signature-pad 的 control 部件 background 覆盖槽。 |
| `--xh-signature-pad-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | signature-pad 的 control 部件 background 覆盖槽。 |
| `--xh-signature-pad-bg-readonly` | `control` | `background` | `disabled`<br>`not([data-disabled])`<br>`readonly` | `--xh-bg-subtle` | signature-pad 的 control 部件 background 覆盖槽。 |
| `--xh-signature-pad-border` | `control` | `border` | `default` | `--xh-border-control` | signature-pad 的 control 部件 border 覆盖槽。 |
| `--xh-signature-pad-border-disabled` | `control` | `border-color` | `disabled` | `--xh-border-default` | signature-pad 的 control 部件 border-color 覆盖槽。 |
| `--xh-signature-pad-border-drawing` | `control` | `border-color` | `drawing` | `--xh-border-control-hover` | signature-pad 的 control 部件 border-color 覆盖槽。 |
| `--xh-signature-pad-clear-bg` | `clear-trigger` | `background-color` | `default`<br>`focus-visible` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | signature-pad 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-signature-pad-clear-bg-active` | `clear-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | signature-pad 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-signature-pad-clear-bg-disabled` | `clear-trigger` | `background-color` | `disabled` | `--xh-_action-variant-bg-disabled` | signature-pad 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-signature-pad-clear-bg-hover` | `clear-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | signature-pad 的 clear-trigger 部件 background-color 覆盖槽。 |
| `--xh-signature-pad-clear-border` | `clear-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | signature-pad 的 clear-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-signature-pad-clear-border-hover` | `clear-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | signature-pad 的 clear-trigger 部件 border-color 覆盖槽。 |
| `--xh-signature-pad-clear-fg` | `clear-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | signature-pad 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-signature-pad-clear-fg-empty` | `clear-trigger` | `color` | `empty` | `--xh-fg-muted` | signature-pad 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-signature-pad-clear-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | signature-pad 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-signature-pad-clear-gap` | `clear-trigger` | `gap` | `default` | `--xh-_action-profile-gap` | signature-pad 的 clear-trigger 部件 gap 覆盖槽。 |
| `--xh-signature-pad-clear-h` | `clear-trigger` | `block-size` | `default` | `--xh-_action-profile-visual-size` | signature-pad 的 clear-trigger 部件 block-size 覆盖槽。 |
| `--xh-signature-pad-clear-icon-size` | `clear-trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size` | signature-pad 的 clear-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-signature-pad-clear-px` | `clear-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | signature-pad 的 clear-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-signature-pad-clear-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | signature-pad 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-signature-pad-clear-shadow-hover` | `clear-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | signature-pad 的 clear-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-signature-pad-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | signature-pad 的 control 部件 border-color 覆盖槽。 |
| `--xh-signature-pad-gap` | `label`<br>`root` | `gap`<br>`margin-block-end` | `default` | `--xh-space-2` | signature-pad 的 label、root 部件 gap、margin-block-end 覆盖槽。 |
| `--xh-signature-pad-guide-stroke` | `guide` | `stroke` | `default` | `--xh-border-control` | signature-pad 的 guide 部件 stroke 覆盖槽。 |
| `--xh-signature-pad-ink` | `path` | `fill` | `default` | `--xh-fg-default` | signature-pad 的 path 部件 fill 覆盖槽。 |
| `--xh-signature-pad-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | signature-pad 的 label 部件 color 覆盖槽。 |
| `--xh-signature-pad-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | signature-pad 的 label 部件 color 覆盖槽。 |
| `--xh-signature-pad-label-font-size` | `label` | `font-size` | `default` | `--xh-text-label-size` | signature-pad 的 label 部件 font-size 覆盖槽。 |
| `--xh-signature-pad-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | signature-pad 的 label 部件 font-weight 覆盖槽。 |
| `--xh-signature-pad-label-gap` | `label` | `margin-block-end` | `default` | `--xh-space-1` | signature-pad 的 label 部件 margin-block-end 覆盖槽。 |
| `--xh-signature-pad-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | signature-pad 的 control 部件 border-radius 覆盖槽。 |
| `--xh-signature-pad-status-fg` | `status` | `color` | `default` | `--xh-fg-muted` | signature-pad 的 status 部件 color 覆盖槽。 |
| `--xh-signature-pad-status-font-size` | `status` | `font-size` | `default` | `--xh-text-secondary-size` | signature-pad 的 status 部件 font-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

- 画布宽度铺满外层容器，高度由宽高比（`--xh-signature-pad-aspect-ratio`，默认 5 / 2）决定，窄屏上自动变矮。
- 签名过程中转屏、拖动面板改变宽度时，已有笔迹按 `viewBox` 整体缩放，后续新笔与它落在同一套坐标。
- 触摸设备上画布关闭浏览器的滚动与缩放手势，避免手指划动时页面滚动。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

- 画布与基准线不区分左右：笔迹按落笔坐标记录，方向由书写者决定。
- 标题与清空按钮的排布跟随文档方向，皮肤全部使用逻辑属性。
