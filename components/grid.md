来源：https://ui.docs.xihanfun.com/components/grid

# Grid `栅格`

二维排布容器：`cols` 定分几列，每一格按文档序依次落格。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/grid" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/grid.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/grid" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/grid" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/grid.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

二维排布容器：cols 定分几列，gap 走间距档位，每一格按文档序依次落格

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cells = ["甲", "乙", "丙", "丁", "戊", "己"];
</script>

<template>
  <XhGridRoot :cols="3" gap="md">
    <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-basic [data-cell] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-basic" cols="3" gap="md" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item" data-cell>甲</div>
    <div data-xh-part="item" data-cell>乙</div>
    <div data-xh-part="item" data-cell>丙</div>
    <div data-xh-part="item" data-cell>丁</div>
    <div data-xh-part="item" data-cell>戊</div>
    <div data-xh-part="item" data-cell>己</div>
  </div>
</xh-grid>
```

## 示例

### 列数

cols 收 1 到 12 的整数；各列等宽，放不下的格子自动换到下一行

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const columns = [2, 3, 4, 6];
const cells = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑"];
</script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem v-for="n in columns" :key="n">
      <div :style="labelStyle">cols = {{ n }}</div>
      <XhGridRoot :cols="n" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cells.slice(0, n * 2)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 各列等宽不够用时，直接给使用者槽位写一份轨道表，它排在所有列数档之前 -->
    <XhGridItem>
      <div :style="labelStyle">槽位覆盖：侧栏定宽、正文吃掉剩下的宽度</div>
      <XhGridRoot gap="sm" style="--xh-grid-columns: 160px 1fr; margin-block-start: 6px">
        <XhGridItem :style="cellStyle">侧栏</XhGridItem>
        <XhGridItem :style="cellStyle">正文</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-cols [data-cell] {
    padding: 10px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
    text-align: center;
  }
  #grid-cols [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-cols [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-cols" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item">
      <div data-label>cols = 2</div>
      <xh-grid cols="2" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>cols = 3</div>
      <xh-grid cols="3" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>cols = 4</div>
      <xh-grid cols="4" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>cols = 6</div>
      <xh-grid cols="6" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
          <div data-xh-part="item" data-cell>壬</div>
          <div data-xh-part="item" data-cell>癸</div>
          <div data-xh-part="item" data-cell>子</div>
          <div data-xh-part="item" data-cell>丑</div>
        </div>
      </xh-grid>
    </div>

    <!-- 各列等宽不够用时，直接给使用者槽位写一份轨道表，它排在所有列数档之前 -->
    <div data-xh-part="item">
      <div data-label>槽位覆盖：侧栏定宽、正文吃掉剩下的宽度</div>
      <xh-grid gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner style="--xh-grid-columns: 160px 1fr">
          <div data-xh-part="item" data-cell>侧栏</div>
          <div data-xh-part="item" data-cell>正文</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

### 间距档位

gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，行距与列距同吃这一份

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 8px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
const cells = ["甲", "乙", "丙", "丁", "戊", "己"];
</script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem v-for="g in gaps" :key="g">
      <div :style="labelStyle">gap = {{ g }}</div>
      <XhGridRoot :cols="3" :gap="g" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 -->
    <XhGridItem>
      <div :style="labelStyle">槽位覆盖</div>
      <XhGridRoot :cols="3" gap="xs" style="--xh-grid-gap: 32px; margin-block-start: 6px">
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-gap [data-cell] {
    padding: 8px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
    text-align: center;
  }
  #grid-gap [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-gap [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-gap" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item">
      <div data-label>gap = xs</div>
      <xh-grid cols="3" gap="xs" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>gap = sm</div>
      <xh-grid cols="3" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>gap = md</div>
      <xh-grid cols="3" gap="md" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>gap = lg</div>
      <xh-grid cols="3" gap="lg" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>gap = xl</div>
      <xh-grid cols="3" gap="xl" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <!-- 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 -->
    <div data-xh-part="item">
      <div data-label>槽位覆盖</div>
      <xh-grid cols="3" gap="xs" style="display: contents">
        <div data-xh-part="root" data-inner style="--xh-grid-gap: 32px">
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

### 跨列与错列

span 让一格横跨几列；offset 让一格改从第 offset + 1 条列线起排，把它前面那几列空出来

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const markStyle
  = "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const offsets = [1, 2, 3];
</script>

<template>
  <XhGridRoot gap="lg">
    <XhGridItem>
      <div :style="labelStyle">span：横跨几列就占几格宽，放不下的自动挤到下一行</div>
      <XhGridRoot :cols="4" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :span="4" :style="markStyle">span = 4</XhGridItem>
        <XhGridItem :span="2" :style="markStyle">span = 2</XhGridItem>
        <XhGridItem :style="cellStyle">甲</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <XhGridItem>
      <div :style="labelStyle">offset：起排的列线往后挪，前面那几列空着</div>
      <!-- 每档单独一行来看：同一行里前面已经排了东西时，空出来的是那几条列线而不是紧挨着的几格 -->
      <XhGridRoot gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="n in offsets" :key="n">
          <XhGridRoot :cols="4" gap="sm">
            <XhGridItem :offset="n" :span="4 - n" :style="markStyle">offset = {{ n }}</XhGridItem>
          </XhGridRoot>
        </XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <XhGridItem>
      <div :style="labelStyle">两者同写：从第三条列线起排，横跨两列</div>
      <XhGridRoot :cols="4" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :offset="2" :span="2" :style="markStyle">offset = 2，span = 2</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-span-offset [data-cell],
  #grid-span-offset [data-mark] {
    padding: 10px;
    border-radius: var(--xh-radius-md);
    text-align: center;
  }
  #grid-span-offset [data-cell] {
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
  #grid-span-offset [data-mark] {
    background: var(--xh-bg-brand-subtle);
    color: var(--xh-fg-brand-strong);
  }
  #grid-span-offset [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-span-offset [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-span-offset" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="item">
      <div data-label>span：横跨几列就占几格宽，放不下的自动挤到下一行</div>
      <xh-grid cols="4" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" span="4" data-mark>span = 4</div>
          <div data-xh-part="item" span="2" data-mark>span = 2</div>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>offset：起排的列线往后挪，前面那几列空着</div>
      <!-- 每档单独一行来看：同一行里前面已经排了东西时，空出来的是那几条列线而不是紧挨着的几格 -->
      <xh-grid gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item">
            <xh-grid cols="4" gap="sm" style="display: contents">
              <div data-xh-part="root">
                <div data-xh-part="item" offset="1" span="3" data-mark>offset = 1</div>
              </div>
            </xh-grid>
          </div>
          <div data-xh-part="item">
            <xh-grid cols="4" gap="sm" style="display: contents">
              <div data-xh-part="root">
                <div data-xh-part="item" offset="2" span="2" data-mark>offset = 2</div>
              </div>
            </xh-grid>
          </div>
          <div data-xh-part="item">
            <xh-grid cols="4" gap="sm" style="display: contents">
              <div data-xh-part="root">
                <div data-xh-part="item" offset="3" span="1" data-mark>offset = 3</div>
              </div>
            </xh-grid>
          </div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>两者同写：从第三条列线起排，横跨两列</div>
      <xh-grid cols="4" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" offset="2" span="2" data-mark>offset = 2，span = 2</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

### 格内对齐

align 管每一项在自己那格里的块向落点，justify-items 管行内落点；两轴缺省都是铺满整格

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 8px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const tallStyle = `${cellStyle}; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong)`;
const trackStyle
  = "border: 1px solid var(--xh-border-default); border-radius: var(--xh-radius-md); padding: 8px; margin-block-start: 6px";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const aligns = ["start", "center", "end", "stretch"] as const;
const justifies = ["start", "center", "end", "stretch"] as const;
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 第一格把整行撑高，另外两格才有块向落点可看 -->
    <XhGridItem v-for="a in aligns" :key="a">
      <div :style="labelStyle">align = {{ a }}</div>
      <XhGridRoot :cols="3" gap="sm" :align="a" :style="trackStyle">
        <XhGridItem :style="tallStyle">这一格内容多<br>把整行撑高<br>共三行</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
        <XhGridItem :style="cellStyle">丙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 内容比列窄，才看得出行内落点；stretch 下每一格铺满整列 -->
    <XhGridItem v-for="j in justifies" :key="j">
      <div :style="labelStyle">justify-items = {{ j }}</div>
      <XhGridRoot :cols="3" gap="sm" :justify-items="j" :style="trackStyle">
        <XhGridItem :style="cellStyle">甲</XhGridItem>
        <XhGridItem :style="cellStyle">乙</XhGridItem>
        <XhGridItem :style="cellStyle">丙</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-align-justify [data-cell],
  #grid-align-justify [data-tall] {
    padding: 8px 12px;
    border-radius: var(--xh-radius-md);
  }
  #grid-align-justify [data-cell] {
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
  #grid-align-justify [data-tall] {
    background: var(--xh-bg-brand-subtle);
    color: var(--xh-fg-brand-strong);
  }
  #grid-align-justify [data-track] {
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-radius-md);
    padding: 8px;
    margin-block-start: 6px;
  }
  #grid-align-justify [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-align-justify" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <!-- 第一格把整行撑高，另外两格才有块向落点可看 -->
    <div data-xh-part="item">
      <div data-label>align = start</div>
      <xh-grid cols="3" gap="sm" align="start" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-tall>这一格内容多<br />把整行撑高<br />共三行</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>align = center</div>
      <xh-grid cols="3" gap="sm" align="center" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-tall>这一格内容多<br />把整行撑高<br />共三行</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>align = end</div>
      <xh-grid cols="3" gap="sm" align="end" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-tall>这一格内容多<br />把整行撑高<br />共三行</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>align = stretch</div>
      <xh-grid cols="3" gap="sm" align="stretch" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-tall>这一格内容多<br />把整行撑高<br />共三行</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <!-- 内容比列窄，才看得出行内落点；stretch 下每一格铺满整列 -->
    <div data-xh-part="item">
      <div data-label>justify-items = start</div>
      <xh-grid cols="3" gap="sm" justify-items="start" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>justify-items = center</div>
      <xh-grid cols="3" gap="sm" justify-items="center" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>justify-items = end</div>
      <xh-grid cols="3" gap="sm" justify-items="end" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>

    <div data-xh-part="item">
      <div data-label>justify-items = stretch</div>
      <xh-grid cols="3" gap="sm" justify-items="stretch" style="display: contents">
        <div data-xh-part="root" data-track>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

### 响应式列数

cols 除了整数也收断点对象，逐档写各自的列数：窄视口一列，越宽排得越密，拖动窗口即可看到换档

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

const cards = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛"];
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 一面卡片墙：窄屏一列到底，宽屏一行摆四张 -->
    <XhGridItem>
      <div :style="labelStyle">cols = { base: 1, sm: 2, lg: 4 }</div>
      <XhGridRoot :cols="{ base: 1, sm: 2, lg: 4 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 没写的档沿用比它窄的那一档：这里只在 md 换一次，md 往上都是三列 -->
    <XhGridItem>
      <div :style="labelStyle">只写两档：cols = { base: 2, md: 3 }</div>
      <XhGridRoot :cols="{ base: 2, md: 3 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards.slice(0, 6)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>

    <!-- 不写 base 就还是一列，从 lg 起才分栏 -->
    <XhGridItem>
      <div :style="labelStyle">不写 base：cols = { lg: 3 }</div>
      <XhGridRoot :cols="{ lg: 3 }" gap="sm" style="margin-block-start: 6px">
        <XhGridItem v-for="c in cards.slice(0, 3)" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-responsive-cols [data-cell] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
    text-align: center;
  }
  #grid-responsive-cols [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-responsive-cols [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-responsive-cols" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <!-- 一面卡片墙：窄屏一列到底，宽屏一行摆四张 -->
    <div data-xh-part="item">
      <div data-label>cols = { base: 1, sm: 2, lg: 4 }</div>
      <xh-grid cols='{"base":1,"sm":2,"lg":4}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
        </div>
      </xh-grid>
    </div>

    <!-- 没写的档沿用比它窄的那一档：这里只在 md 换一次，md 往上都是三列 -->
    <div data-xh-part="item">
      <div data-label>只写两档：cols = { base: 2, md: 3 }</div>
      <xh-grid cols='{"base":2,"md":3}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
        </div>
      </xh-grid>
    </div>

    <!-- 不写 base 就还是一列，从 lg 起才分栏 -->
    <div data-xh-part="item">
      <div data-label>不写 base：cols = { lg: 3 }</div>
      <xh-grid cols='{"lg":3}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

### 断点档位一览

四档断点取自令牌：sm 640px、md 768px、lg 1024px、xl 1280px；自窄到宽依次接管，视口到哪一档就用哪一档的列数

```vue
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle
  = "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const headStyle = `${cellStyle}; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong)`;
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

// 档位名与生效宽度，与断点令牌逐字一致
const tiers = [
  { name: "base", width: "0（起始档）" },
  { name: "sm", width: "≥ 640px" },
  { name: "md", width: "≥ 768px" },
  { name: "lg", width: "≥ 1024px" },
  { name: "xl", width: "≥ 1280px" },
];

const cells = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑"];
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 一档一行：左边档位名，右边这一档从多宽起生效 -->
    <XhGridItem>
      <div :style="labelStyle">档位与生效宽度</div>
      <XhGridRoot :cols="2" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :style="headStyle">档位</XhGridItem>
        <XhGridItem :style="headStyle">生效宽度</XhGridItem>
        <template v-for="tier in tiers" :key="tier.name">
          <XhGridItem :style="cellStyle">{{ tier.name }}</XhGridItem>
          <XhGridItem :style="cellStyle">{{ tier.width }}</XhGridItem>
        </template>
      </XhGridRoot>
    </XhGridItem>

    <!-- 五档写全：一路拉宽窗口，每过一道断点这片格子就少排一行 -->
    <XhGridItem>
      <div :style="labelStyle">五档写全：cols = { base: 1, sm: 2, md: 3, lg: 4, xl: 6 }</div>
      <XhGridRoot
        :cols="{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }"
        gap="sm"
        style="margin-block-start: 6px"
      >
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
```

```html
<style>
  #grid-breakpoints [data-cell],
  #grid-breakpoints [data-head] {
    padding: 10px;
    border-radius: var(--xh-radius-md);
    text-align: center;
  }
  #grid-breakpoints [data-cell] {
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
  #grid-breakpoints [data-head] {
    background: var(--xh-bg-brand-subtle);
    color: var(--xh-fg-brand-strong);
  }
  #grid-breakpoints [data-label] {
    font-size: 13px;
    color: var(--xh-fg-muted);
  }
  #grid-breakpoints [data-inner] {
    margin-block-start: 6px;
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<xh-grid id="grid-breakpoints" gap="lg" style="display: contents">
  <div data-xh-part="root">
    <!-- 一档一行：左边档位名，右边这一档从多宽起生效 -->
    <div data-xh-part="item">
      <div data-label>档位与生效宽度</div>
      <xh-grid cols="2" gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-head>档位</div>
          <div data-xh-part="item" data-head>生效宽度</div>
          <div data-xh-part="item" data-cell>base</div>
          <div data-xh-part="item" data-cell>0（起始档）</div>
          <div data-xh-part="item" data-cell>sm</div>
          <div data-xh-part="item" data-cell>≥ 640px</div>
          <div data-xh-part="item" data-cell>md</div>
          <div data-xh-part="item" data-cell>≥ 768px</div>
          <div data-xh-part="item" data-cell>lg</div>
          <div data-xh-part="item" data-cell>≥ 1024px</div>
          <div data-xh-part="item" data-cell>xl</div>
          <div data-xh-part="item" data-cell>≥ 1280px</div>
        </div>
      </xh-grid>
    </div>

    <!-- 五档写全：一路拉宽窗口，每过一道断点这片格子就少排一行 -->
    <div data-xh-part="item">
      <div data-label>五档写全：cols = { base: 1, sm: 2, md: 3, lg: 4, xl: 6 }</div>
      <xh-grid cols='{"base":1,"sm":2,"md":3,"lg":4,"xl":6}' gap="sm" style="display: contents">
        <div data-xh-part="root" data-inner>
          <div data-xh-part="item" data-cell>甲</div>
          <div data-xh-part="item" data-cell>乙</div>
          <div data-xh-part="item" data-cell>丙</div>
          <div data-xh-part="item" data-cell>丁</div>
          <div data-xh-part="item" data-cell>戊</div>
          <div data-xh-part="item" data-cell>己</div>
          <div data-xh-part="item" data-cell>庚</div>
          <div data-xh-part="item" data-cell>辛</div>
          <div data-xh-part="item" data-cell>壬</div>
          <div data-xh-part="item" data-cell>癸</div>
          <div data-xh-part="item" data-cell>子</div>
          <div data-xh-part="item" data-cell>丑</div>
        </div>
      </xh-grid>
    </div>
  </div>
</xh-grid>
```

## 设计指引

### 何时使用

- 表单字段、卡片墙、统计面板这类需要列对齐的结构。
- 列数要随视口换档。

### 何时不用

- 只沿一条轴排：用[弹性布局](./flex)。
- 每一格的高度由内容决定且不要求行对齐（瀑布流）：栅格做不了，需要另外的实现。

### 特性

- 各列等宽，且每列的下限是 0：长内容不会把自己那列撑宽。
- `cols` 除了整数也收断点对象，逐档写各自的列数，没写的档沿用比它窄的那一档。
- `rows` 排出显式行轨道；不写则行数由内容自己撑出来。
- `minColWidth` 换一条路排列：给一档列宽下限，容器放得下几列就分几列，`cols` 那条轨道表让位。
  卡片墙用它比逐档写 `cols` 省事。
- `gap` 管两条轴，`rowGap` 与 `columnGap` 各自只管一条，不写则跟着 `gap` 走。
- `span` 让一格横跨几列，`offset` 把它前面几列空出来；两者与 `cols` 一样收断点对象，
  窄屏收成一列时把 `span` 也收回 1，那一格才不会溢出。
- 四档断点取自令牌：`sm` 640px、`md` 768px、`lg` 1024px、`xl` 1280px。
- `cols` / `rows` / `span`（含断点对象的每一档）收 1 至 12 的整数，`offset` 收 1 至 11 的整数；
  范围外的值——0、负数、小数、超过上限——一律按没写算：`cols` 落回一列、`span` 占一列、`offset` 不错列。
- DOM 上只出得来皮肤有规则接的取值：`data-cols` 恒在 1 至 12 之间，`data-span` 与 `data-offset`
  要么落在范围内、要么不出现。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-grid>` |
| Vue 组件 | `XhGridItem` `XhGridRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/grid.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="grid"`：**`root`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `GridAlign` |  | 每一项在自己那格里的块向对齐：start / center / end / stretch / baseline，不写则铺满格高。 |
| `cols` | `GridCols` |  | 列数：1 至 12 的整数，不写按一列排；范围外的值也按一列排。 各列等宽，且每列的下限是 0，长内容不会把自己那列撑宽。 也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，没写的档沿用比它窄的那一档。 |
| `columnGap` | `GridGap` |  | 只改列间距，档位同 gap；不写则跟着 gap 走。 |
| `gap` | `GridGap` |  | 行列间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `justifyItems` | `GridJustifyItems` |  | 每一项在自己那格里的行内对齐：start / center / end / stretch，不写则铺满格宽。 |
| `minColWidth` | `GridMinColWidth` |  | 每列最少多宽：xs / sm / md / lg 四档，各指一个列宽下限令牌。写了它，列数改由容器宽度 除以这个下限得出（放得下几列就几列），`cols` 那条轨道表不再生效。不收裸像素值。 |
| `rowGap` | `GridGap` |  | 只改行间距，档位同 gap；不写则跟着 gap 走。 |
| `rows` | `GridRowCount` |  | 行数：1 至 12 的整数，不写则行数由内容自己撑出来；范围外的值也按不写算。 写了就把这几行排成显式轨道，超出的项落进隐式行。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: GridItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/grid.css` 按部件选择：`[data-scope="grid"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-cols` | cols.base |
| `root` | `data-cols-lg` | cols.lg |
| `root` | `data-cols-md` | cols.md |
| `root` | `data-cols-sm` | cols.sm |
| `root` | `data-cols-xl` | cols.xl |
| `root` | `data-column-gap` | props.columnGap |
| `root` | `data-gap` | props.gap |
| `root` | `data-justify-items` | props.justifyItems |
| `root` | `data-min-col` | props.minColWidth |
| `root` | `data-row-gap` | props.rowGap |
| `root` | `data-rows` | tier(props.rows, MAX_COLUMN_COUNT) |
| `item` | `data-offset` | offset.base |
| `item` | `data-offset-lg` | offset.lg |
| `item` | `data-offset-md` | offset.md |
| `item` | `data-offset-sm` | offset.sm |
| `item` | `data-offset-xl` | offset.xl |
| `item` | `data-span` | span.base |
| `item` | `data-span-lg` | span.lg |
| `item` | `data-span-md` | span.md |
| `item` | `data-span-sm` | span.sm |
| `item` | `data-span-xl` | span.xl |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-grid-column-gap` | `root` | `column-gap` | `column-gap=lg`<br>`column-gap=md`<br>`column-gap=sm`<br>`column-gap=xl`<br>`column-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 column-gap 覆盖槽。 |
| `--xh-grid-columns` | `root` | `grid-template-columns` | `default`<br>`min-col` | `--xh-_grid-col-min`<br>`--xh-_grid-cols` | grid 的 root 部件 grid-template-columns 覆盖槽。 |
| `--xh-grid-gap` | `root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | grid 的 root 部件 gap 覆盖槽。 |
| `--xh-grid-row-gap` | `root` | `row-gap` | `row-gap=lg`<br>`row-gap=md`<br>`row-gap=sm`<br>`row-gap=xl`<br>`row-gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs` | grid 的 root 部件 row-gap 覆盖槽。 |
| `--xh-grid-rows` | `root` | `grid-template-rows` | `rows` | `--xh-_grid-rows` | grid 的 root 部件 grid-template-rows 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

## 组合

- 表单里与[表单字段](./field)配合：字段占格，跨整行的字段写 `span`。

## 最佳实践

- 断点对象自窄到宽写，别只写 `lg`——比它窄的档会退回默认的一列。
- 需要多于 12 列的结构就拆成两块，别把列数往大了写——超过 12 的值按一列排。

## 反模式

- 用栅格做整页骨架：那是[布局](./layout)的事。
- 给格子写固定像素宽度，等宽约束当场失效。
