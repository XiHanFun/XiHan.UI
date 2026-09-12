来源：https://ui.docs.xihanfun.com/components/breadcrumb

# Breadcrumb `面包屑`

把当前位置在层级里的路径摊开，每一层都能点回去。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/breadcrumb" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/breadcrumb.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/breadcrumb" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/breadcrumb" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/breadcrumb.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

href 归作者写，末级只多一个 current：它拿到 aria-current="page"、点不动、也不占 Tab 位

```vue
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhBreadcrumbRoot>
    <XhBreadcrumbList>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/components">组件</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/components/breadcrumb" current>
          面包屑
        </XhBreadcrumbLink>
      </XhBreadcrumbItem>
    </XhBreadcrumbList>
  </XhBreadcrumbRoot>
</template>
```

```html
<xh-breadcrumb>
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/">首页</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/components">组件</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/components/breadcrumb" current>面包屑</a>
      </li>
    </ol>
  </nav>
</xh-breadcrumb>
```

## 示例

### 折叠中间层级

省略号与分隔符同为 ol 的直接子 li，两者都对读屏隐藏，念出来仍是「列表，共 3 项」

```vue
<script setup lang="ts">
import {
  XhBreadcrumbEllipsis,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";
</script>

<template>
  <XhBreadcrumbRoot>
    <XhBreadcrumbList>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator />
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/docs">文档</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator />
      <!-- 被折叠掉的那几层，只是视觉占位，不参与列表项计数 -->
      <XhBreadcrumbEllipsis>…</XhBreadcrumbEllipsis>
      <XhBreadcrumbSeparator />
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/docs/deep/current" current>
          当前页
        </XhBreadcrumbLink>
      </XhBreadcrumbItem>
    </XhBreadcrumbList>
  </XhBreadcrumbRoot>
</template>
```

```html
<xh-breadcrumb>
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/">首页</a>
      </li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/docs">文档</a>
      </li>
      <li data-xh-part="separator"></li>
      <!-- 被折叠掉的那几层，只是视觉占位，不参与列表项计数 -->
      <li data-xh-part="ellipsis">…</li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/docs/deep/current" current>当前页</a>
      </li>
    </ol>
  </nav>
</xh-breadcrumb>
```

### 读屏文案

root 是 nav 地标，translations.root 换掉它的 aria-label，同页有多个地标时靠它区分

```vue
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";

const translations = { root: "文章位置" };
</script>

<template>
  <XhBreadcrumbRoot :translations="translations">
    <XhBreadcrumbList>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/blog">博客</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/blog/2026">2026</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/blog/2026/design-system" current>
          设计系统运行时
        </XhBreadcrumbLink>
      </XhBreadcrumbItem>
    </XhBreadcrumbList>
  </XhBreadcrumbRoot>
</template>
```

```html
<xh-breadcrumb id="breadcrumb-translations">
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog">博客</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog/2026">2026</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog/2026/design-system" current>
          设计系统运行时
        </a>
      </li>
    </ol>
  </nav>
</xh-breadcrumb>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("breadcrumb-translations").translations = {
    root: "文章位置",
  };
</script>
```

### 语气

tone 换的是当前项的文字色，以及可点那几层悬停时的文字色；末级预置为当前项

```vue
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <div
      v-for="t in tones"
      :key="t"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 80px; flex: none; font-size: 12px">{{ t }}</span>
      <XhBreadcrumbRoot :tone="t">
        <XhBreadcrumbList>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components">组件</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components/breadcrumb" current>
              面包屑
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">brand</span>
    <xh-breadcrumb tone="brand">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">neutral</span>
    <xh-breadcrumb tone="neutral">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">success</span>
    <xh-breadcrumb tone="success">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">warning</span>
    <xh-breadcrumb tone="warning">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">danger</span>
    <xh-breadcrumb tone="danger">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 80px; flex: none; font-size: 12px">info</span>
    <xh-breadcrumb tone="info">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
</div>
```

### 尺寸

size 换整条路径的字号与各层之间的间距，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 16px">
    <div
      v-for="s in sizes"
      :key="s.label"
      style="display: flex; align-items: center; gap: 12px"
    >
      <span style="inline-size: 40px; flex: none; font-size: 12px">
        {{ s.label }}
      </span>
      <XhBreadcrumbRoot :size="s.size">
        <XhBreadcrumbList>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/">首页</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components">组件</XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components/breadcrumb" current>
              面包屑
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 16px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">小</span>
    <xh-breadcrumb size="sm">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <!-- 这一档不写 size，落在默认 -->
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">默认</span>
    <xh-breadcrumb>
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 40px; flex: none; font-size: 12px">大</span>
    <xh-breadcrumb size="lg">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/">首页</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components">组件</a>
          </li>
          <li data-xh-part="separator">/</li>
          <li data-xh-part="item">
            <a data-xh-part="link" href="#/components/breadcrumb" current>
              面包屑
            </a>
          </li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
</div>
```

### 层级下拉

某一层要换去处时，把菜单整套放进 item 里；面包屑只管这一层的排版

```vue
<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import {
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const projects = [
  { value: "web", label: "官网" },
  { value: "admin", label: "后台" },
  { value: "mobile", label: "移动端" },
];
const current = ref("admin");

function onSelect(details: { value: string }): void {
  current.value = details.value;
}
</script>

<template>
  <XhBreadcrumbRoot>
    <XhBreadcrumbList>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/">工作台</XhBreadcrumbLink>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <!-- 这一层不是链接而是一组可切换的去处 -->
        <XhMenuRoot @select="onSelect">
          <XhMenuTrigger>
            {{ projects.find((p) => p.value === current)?.label }}
            <XhIcon :icon="ChevronDownIcon" />
          </XhMenuTrigger>
          <XhMenuPositioner>
            <XhMenuContent>
              <XhMenuItem v-for="p in projects" :key="p.value" :value="p.value">
                {{ p.label }}
              </XhMenuItem>
            </XhMenuContent>
          </XhMenuPositioner>
        </XhMenuRoot>
      </XhBreadcrumbItem>
      <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
      <XhBreadcrumbItem>
        <XhBreadcrumbLink href="#/settings" current>设置</XhBreadcrumbLink>
      </XhBreadcrumbItem>
    </XhBreadcrumbList>
  </XhBreadcrumbRoot>
</template>
```

```html
<xh-breadcrumb>
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/">工作台</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <!-- 这一层不是链接而是一组可切换的去处 -->
        <xh-menu id="breadcrumb-menu">
          <button data-xh-part="trigger">
            <span id="breadcrumb-menu-label">后台</span>
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9L12 15L18 9"/></svg>
          </button>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="item" value="web">官网</div>
              <div data-xh-part="item" value="admin">后台</div>
              <div data-xh-part="item" value="mobile">移动端</div>
            </div>
          </div>
        </xh-menu>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/settings" current>设置</a>
      </li>
    </ol>
  </nav>
</xh-breadcrumb>

<script type="module">
  // 选中的那一项的文字回填到触发钮上
  const menu = document.getElementById("breadcrumb-menu");
  const label = document.getElementById("breadcrumb-menu-label");
  menu.addEventListener("select", (event) => {
    const picked = menu.querySelector(`[data-xh-part="item"][value="${event.detail.value}"]`);
    label.textContent = picked.textContent.trim();
  });
</script>
```

## 设计指引

### 何时使用

- 层级超过两级且用户可能从搜索或外链直接进到深层。
- 需要让用户知道"我在哪，上一层是什么"。

### 何时不用

- 站点是扁平的：路径只有一层，写它没有信息量。
- 用来表达步骤的先后：那是[步骤条](./steps)。

### 特性

- `href` 归作者写；末级只多一个 `current`：它拿到 `aria-current="page"`、点不动、也不占 Tab 位。
- 中间层级可以折叠成省略号；省略号与分隔符都对读屏隐藏，念出来仍是完整的列表项数。
- `root` 是 `nav` 地标，`translations.root` 换掉它的 `aria-label`。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-breadcrumb>` |
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbLinkIcon` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/breadcrumb.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="breadcrumb"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-icon` · `separator` · `ellipsis`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly BreadcrumbNode[]` |  | 层级数据，文字、链接与当前页的事实源。 缺省即回到「层级逐个写成部件」的老路。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `maxItems` | `number` |  | 最多展开几层，超出的中间层折成一个省略位；不给即全列。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `translations` | `Partial<BreadcrumbTranslations>` |  |  |

## connect API

`useBreadcrumb` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly BreadcrumbNodeMeta[]` | collection 推出的层级元信息，按数据顺序排列；没给 collection 即空数组。 |
| `items` | `readonly BreadcrumbItem[]` | 按 maxItems 折叠后的序列，省略位自带被折叠的那几层；没给 collection 即空数组。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |  |
| `getLinkIconProps` | `() => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getEllipsisProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `link-icon` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/breadcrumb.css` 按部件选择：`[data-scope="breadcrumb"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-breadcrumb-ellipsis-size` | `ellipsis` | `inline-size` | `default` | `--xh-space-5` | breadcrumb 的 ellipsis 部件 inline-size 覆盖槽。 |
| `--xh-breadcrumb-fg` | `root` | `color` | `default` | `--xh-fg-muted` | breadcrumb 的 root 部件 color 覆盖槽。 |
| `--xh-breadcrumb-font-size` | `root` | `font-size` | `default` | `--xh-_breadcrumb-font-size` | breadcrumb 的 root 部件 font-size 覆盖槽。 |
| `--xh-breadcrumb-gap` | `list` | `gap` | `default` | `--xh-_breadcrumb-gap` | breadcrumb 的 list 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-breadcrumb-leading` | `root` | `line-height` | `default` | `--xh-leading-tight` | breadcrumb 的 root 部件 line-height 覆盖槽。 |
| `--xh-breadcrumb-link-bg-hover` | `link` | `background` | `current`<br>`hover`<br>`not([data-current])` | `--xh-bg-subtle-hover` | breadcrumb 的 link 部件 background 覆盖槽。 |
| `--xh-breadcrumb-link-fg-current` | `link` | `color` | `current` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-hover` | `link` | `color` | `current`<br>`hover`<br>`not([data-current])` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-font-weight-current` | `link` | `font-weight` | `current` | `--xh-font-weight-medium` | breadcrumb 的 link 部件 font-weight 覆盖槽。 |
| `--xh-breadcrumb-link-gap` | `link` | `gap` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-link-icon-size` | `link-icon` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 link-icon 部件 block-size、inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | breadcrumb 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-px` | `link` | `padding-inline` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-breadcrumb-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | breadcrumb 的 link 部件 border-radius 覆盖槽。 |
| `--xh-breadcrumb-separator-fg` | `ellipsis`<br>`separator` | `color` | `default` | `--xh-fg-subtle` | breadcrumb 的 ellipsis、separator 部件 color 覆盖槽。 |
| `--xh-breadcrumb-separator-size` | `separator` | `inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 separator 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 放进[页头](./page-header)；某一层要换去处时把整套[菜单](./menu)放进那一项里。

## 最佳实践

- 末级写当前页标题，别写"详情"这种没有信息的词。
- 同页有多个 `nav` 地标时给面包屑单独的 `aria-label`。

## 反模式

- 拿面包屑记录浏览历史：它表达的是层级位置，不是来路。
- 末级也做成链接指向自己。
