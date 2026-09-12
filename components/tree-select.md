来源：https://ui.docs.xihanfun.com/components/tree-select

# TreeSelect `树选择`

浮层里放一棵树的选择器：层级不规整、深浅不一时用它。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/tree-select" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/tree-select.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/tree-select" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/tree-select" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/tree-select.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

收起时整个控件只占触发器一个 Tab 位，展开那一刻焦点真的进树、落在已选中的那行上

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 层级、显示文本与节点禁用都查这份树数据，标记只管长相
const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

const doc = ref<string[]>([]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="doc"
    :collection="files"
    :default-expanded-value="['docs']"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="docs">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="guide">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="api">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
          <XhTreeSelectBranch value="assets">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="logo">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
          <XhTreeSelectItem value="readme">
            <XhTreeSelectItemIndicator />
            <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
          </XhTreeSelectItem>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ doc.length ? doc.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select id="tree-select-basic" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="api">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">api.md</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">assets</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-basic-value">（无）</span></p>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const treeSelect = document.getElementById("tree-select-basic");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
    { value: "readme", label: "README.md" },
  ];

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  treeSelect.expandedValue = ["docs"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-basic-value");
  treeSelect.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

## 示例

### 选中与展开双受控

两份集合都由宿主持有：组件只发事件，宿主写回它才动，回显的就是写回的那两份

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectClearTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

// draft.md 是禁用叶子：方向键与连打检索跳过它，确认键也不认它
const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "draft", label: "draft.md（禁用）", disabled: true },
      {
        value: "i18n",
        label: "i18n",
        children: [
          { value: "zh", label: "zh-CN.md" },
          { value: "en", label: "en-US.md" },
        ],
      },
    ],
  },
];

const value = ref<string[]>(["guide"]);
const expanded = ref<string[]>(["docs"]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="value"
    v-model:expanded-value="expanded"
    :collection="files"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
      <XhTreeSelectClearTrigger />
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="docs">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="guide">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="draft">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>draft.md（禁用）</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectBranch value="i18n">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>i18n</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="zh">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>zh-CN.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                  <XhTreeSelectItem value="en">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>en-US.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ value.join("、") || "（无）" }} · 展开：{{ expanded.join("、") || "（无）" }}</p>
</template>
```

```html
<xh-tree-select id="tree-select-controlled" value="guide" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="draft">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">draft.md（禁用）</span>
              </div>
              <div data-xh-part="branch" value="i18n">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger"></span>
                  <span data-xh-part="branch-text">i18n</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="zh">
                    <span data-xh-part="item-indicator"></span>
                    <span data-xh-part="item-text">zh-CN.md</span>
                  </div>
                  <div data-xh-part="item" value="en">
                    <span data-xh-part="item-indicator"></span>
                    <span data-xh-part="item-text">en-US.md</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-controlled-value">guide</span> · 展开：<span id="tree-select-controlled-expanded">docs</span></p>

<script type="module">
  // draft.md 是禁用叶子：方向键与连打检索跳过它，确认键也不认它
  const treeSelect = document.getElementById("tree-select-controlled");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "draft", label: "draft.md（禁用）", disabled: true },
        {
          value: "i18n",
          label: "i18n",
          children: [
            { value: "zh", label: "zh-CN.md" },
            { value: "en", label: "en-US.md" },
          ],
        },
      ],
    },
  ];
  treeSelect.expandedValue = ["docs"];

  const valueOut = document.getElementById("tree-select-controlled-value");
  const expandedOut = document.getElementById("tree-select-controlled-expanded");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    valueOut.textContent = event.detail.value.join("、") || "（无）";
  });
  treeSelect.addEventListener("expanded-value-change", (event) => {
    treeSelect.expandedValue = event.detail.value;
    expandedOut.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 多选与表单

multiple 下确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，多个值按逗号拼成一串

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectHiddenInput,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const files = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const picked = ref<string[]>(["index"]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="files"
    :default-expanded-value="['src']"
    multiple
    name="docs"
    placeholder="可以多选"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>提交范围</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="src">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>src</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="index">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>index.ts</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectItem value="app">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>app.vue</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
          <XhTreeSelectItem value="readme">
            <XhTreeSelectItemIndicator />
            <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
          </XhTreeSelectItem>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
    <XhTreeSelectHiddenInput />
  </XhTreeSelectRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select
  id="tree-select-multiple"
  value="index"
  multiple
  name="docs"
  placeholder="可以多选"
>
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">提交范围</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="src">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">src</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="index">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">index.ts</span>
              </div>
              <div data-xh-part="item" value="app">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">app.vue</span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
    <input data-xh-part="hidden-input" />
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-multiple-value">index</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-multiple");
  treeSelect.collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "index", label: "index.ts" },
        { value: "app", label: "app.vue" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.expandedValue = ["src"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-multiple-value");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 形态

variant 只换触发框的描边与底色，浮层与树的长相不跟着变

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const variants = ["outline", "subtle", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeSelectRoot
      v-for="v in variants"
      :key="v"
      :collection="files"
      :variant="v"
      :default-expanded-value="['docs']"
      placeholder="选一个文件"
      style="inline-size: 220px"
    >
      <XhTreeSelectLabel>{{ v }}</XhTreeSelectLabel>
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>
            <XhTreeSelectBranch value="docs">
              <XhTreeSelectBranchControl>
                <XhTreeSelectBranchTrigger />
                <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                <XhTreeSelectItemIndicator />
              </XhTreeSelectBranchControl>
              <XhTreeSelectBranchContent>
                <XhTreeSelectItem value="guide">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
                <XhTreeSelectItem value="api">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
              </XhTreeSelectBranchContent>
            </XhTreeSelectBranch>
            <XhTreeSelectItem value="readme">
              <XhTreeSelectItemIndicator />
              <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
            </XhTreeSelectItem>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </div>
</template>
```

```html
<div
  id="tree-select-variant"
  style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start"
>
  <xh-tree-select variant="outline" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">outline</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">subtle</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="ghost" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">ghost</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>
</div>

<script type="module">
  // 三份控件共用同一份树数据与同一套展开写回
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  for (const el of document.getElementById("tree-select-variant").children) {
    el.collection = files;
    el.expandedValue = ["docs"];
    el.addEventListener("expanded-value-change", (event) => (el.expandedValue = event.detail.value));
  }
</script>
```

### 语气

tone 决定用哪族颜色，与 variant 正交，这里统一用 subtle 形态

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeSelectRoot
      v-for="t in tones"
      :key="t"
      :collection="files"
      variant="subtle"
      :tone="t"
      :default-value="['guide']"
      :default-expanded-value="['docs']"
      placeholder="选一个文件"
      style="inline-size: 220px"
    >
      <XhTreeSelectLabel>{{ t }}</XhTreeSelectLabel>
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>
            <XhTreeSelectBranch value="docs">
              <XhTreeSelectBranchControl>
                <XhTreeSelectBranchTrigger />
                <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                <XhTreeSelectItemIndicator />
              </XhTreeSelectBranchControl>
              <XhTreeSelectBranchContent>
                <XhTreeSelectItem value="guide">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
                <XhTreeSelectItem value="api">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
              </XhTreeSelectBranchContent>
            </XhTreeSelectBranch>
            <XhTreeSelectItem value="readme">
              <XhTreeSelectItemIndicator />
              <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
            </XhTreeSelectItem>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </div>
</template>
```

```html
<div id="tree-select-tone" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
  <xh-tree-select variant="subtle" tone="brand" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" tone="neutral" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" tone="success" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">success</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" tone="warning" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" tone="danger" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select variant="subtle" tone="info" default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">info</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>
</div>

<script type="module">
  // 六份控件共用同一份树数据与同一套展开写回
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  for (const el of document.getElementById("tree-select-tone").children) {
    el.collection = files;
    el.expandedValue = ["docs"];
    el.addEventListener("expanded-value-change", (event) => (el.expandedValue = event.detail.value));
  }
</script>
```

### 尺寸

size 换掉行高、内边距与字号，不写就是缺省档

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  { value: "readme", label: "README.md" },
];

// 中间一档不传 size，走皮肤的缺省尺寸
const sizes = [
  { key: "sm", size: "sm", label: "sm" },
  { key: "default", size: undefined, label: "缺省" },
  { key: "lg", size: "lg", label: "lg" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeSelectRoot
      v-for="s in sizes"
      :key="s.key"
      :collection="files"
      :size="s.size"
      :default-expanded-value="['docs']"
      placeholder="选一个文件"
      style="inline-size: 220px"
    >
      <XhTreeSelectLabel>{{ s.label }}</XhTreeSelectLabel>
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>
            <XhTreeSelectBranch value="docs">
              <XhTreeSelectBranchControl>
                <XhTreeSelectBranchTrigger />
                <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                <XhTreeSelectItemIndicator />
              </XhTreeSelectBranchControl>
              <XhTreeSelectBranchContent>
                <XhTreeSelectItem value="guide">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
                <XhTreeSelectItem value="api">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
              </XhTreeSelectBranchContent>
            </XhTreeSelectBranch>
            <XhTreeSelectItem value="readme">
              <XhTreeSelectItemIndicator />
              <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
            </XhTreeSelectItem>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </div>
</template>
```

```html
<div id="tree-select-size" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
  <xh-tree-select size="sm" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">缺省</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select size="lg" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>
</div>

<script type="module">
  // 三份控件共用同一份树数据与同一套展开写回；中间那份不写 size，走皮肤的缺省尺寸
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  for (const el of document.getElementById("tree-select-size").children) {
    el.collection = files;
    el.expandedValue = ["docs"];
    el.addEventListener("expanded-value-change", (event) => (el.expandedValue = event.detail.value));
  }
</script>
```

### 禁用、只读与校验失败

disabled 连键盘入口都没有；readOnly 照常展开浏览但值改不动也清不掉；invalid 只报校验态，交互一切照旧

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  { value: "readme", label: "README.md" },
];

const states = [
  { key: "disabled", label: "禁用", disabled: true, readOnly: false, invalid: false },
  { key: "readonly", label: "只读", disabled: false, readOnly: true, invalid: false },
  { key: "invalid", label: "校验失败", disabled: false, readOnly: false, invalid: true },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
    <XhTreeSelectRoot
      v-for="s in states"
      :key="s.key"
      :collection="files"
      :disabled="s.disabled"
      :read-only="s.readOnly"
      :invalid="s.invalid"
      :default-value="['guide']"
      :default-expanded-value="['docs']"
      placeholder="选一个文件"
      style="inline-size: 220px"
    >
      <XhTreeSelectLabel>{{ s.label }}</XhTreeSelectLabel>
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>
            <XhTreeSelectBranch value="docs">
              <XhTreeSelectBranchControl>
                <XhTreeSelectBranchTrigger />
                <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                <XhTreeSelectItemIndicator />
              </XhTreeSelectBranchControl>
              <XhTreeSelectBranchContent>
                <XhTreeSelectItem value="guide">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
                <XhTreeSelectItem value="api">
                  <XhTreeSelectItemIndicator />
                  <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                </XhTreeSelectItem>
              </XhTreeSelectBranchContent>
            </XhTreeSelectBranch>
            <XhTreeSelectItem value="readme">
              <XhTreeSelectItemIndicator />
              <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
            </XhTreeSelectItem>
          </XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>
  </div>
</template>
```

```html
<div id="tree-select-state" style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start">
  <xh-tree-select disabled default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">禁用</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select read-only default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">只读</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>

  <xh-tree-select invalid default-value="guide" placeholder="选一个文件">
    <div data-xh-part="root" style="inline-size: 220px">
      <span data-xh-part="label">校验失败</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="tree">
            <div data-xh-part="branch" value="docs">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-text">docs</span>
                <span data-xh-part="item-indicator"></span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="guide">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">guide.md</span>
                </div>
                <div data-xh-part="item" value="api">
                  <span data-xh-part="item-indicator"></span>
                  <span data-xh-part="item-text">api.md</span>
                </div>
              </div>
            </div>
            <div data-xh-part="item" value="readme">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">README.md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree-select>
</div>

<script type="module">
  // 三份控件共用同一份树数据与同一套展开写回
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];
  for (const el of document.getElementById("tree-select-state").children) {
    el.collection = files;
    el.expandedValue = ["docs"];
    el.addEventListener("expanded-value-change", (event) => (el.expandedValue = event.detail.value));
  }
</script>
```

### 首次全量加载与空集合

第一次展开才取整棵树；正式 Loading/Empty 与候选树互斥，状态文字不进入选值或键盘导航，底部按钮可重放有数据与零集合响应

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectEmpty,
  XhTreeSelectFooter,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectLoading,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref } from "vue";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const CITY_TREE: Node[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "east-shanghai", label: "上海" },
      { value: "east-hangzhou", label: "杭州" },
      { value: "east-nanjing", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "north-beijing", label: "北京" },
      { value: "north-tianjin", label: "天津" },
    ],
  },
];

const collection = ref<Node[]>([]);
const expanded = ref<string[]>([]);
const picked = ref<string[]>([]);
const loading = ref(false);
let requested = false;
let timer: number | undefined;

function load(mode: "cities" | "empty"): void {
  if (timer !== undefined)
    window.clearTimeout(timer);
  loading.value = true;
  collection.value = [];
  expanded.value = [];
  picked.value = [];
  timer = window.setTimeout(() => {
    timer = undefined;
    collection.value = mode === "cities" ? CITY_TREE : [];
    loading.value = false;
  }, 800);
}

function onOpenChange(details: { open: boolean }): void {
  if (!details.open || requested)
    return;
  requested = true;
  load("cities");
}

onBeforeUnmount(() => {
  if (timer !== undefined)
    window.clearTimeout(timer);
});
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="collection"
    :expanded-value="expanded"
    :loading="loading"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @expanded-value-change="expanded = $event.value"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="region in collection"
            :key="region.value"
            :value="region.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ region.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children ?? []"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
        <XhTreeSelectLoading>正在加载城市…</XhTreeSelectLoading>
        <XhTreeSelectEmpty>暂无可选城市</XhTreeSelectEmpty>
        <XhTreeSelectFooter>
          <button type="button" :disabled="loading" @click="load('cities')">加载城市</button>
          <button type="button" :disabled="loading" @click="load('empty')">加载空集合</button>
        </XhTreeSelectFooter>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select id="tree-select-async" placeholder="选一个城市">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">投放城市</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree"></div>
        <div data-xh-part="loading">正在加载城市…</div>
        <div data-xh-part="empty">暂无可选城市</div>
        <div data-xh-part="footer">
          <button type="button" data-load-mode="cities">加载城市</button>
          <button type="button" data-load-mode="empty">加载空集合</button>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-async-value">（无）</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-async");
  const tree = treeSelect.querySelector('[data-xh-part="tree"]');
  const readout = document.getElementById("tree-select-async-value");
  const buttons = [...treeSelect.querySelectorAll("[data-load-mode]")];

  const CITY_TREE = [
    {
      value: "east",
      label: "华东",
      children: [
        { value: "east-shanghai", label: "上海" },
        { value: "east-hangzhou", label: "杭州" },
        { value: "east-nanjing", label: "南京" },
      ],
    },
    {
      value: "north",
      label: "华北",
      children: [
        { value: "north-beijing", label: "北京" },
        { value: "north-tianjin", label: "天津" },
      ],
    },
  ];

  function part(tag, name, text) {
    const node = document.createElement(tag);
    node.dataset.xhPart = name;
    if (text !== undefined)
      node.textContent = text;
    return node;
  }

  function renderRegion(region) {
    const branch = part("div", "branch");
    branch.setAttribute("value", region.value);

    const control = part("div", "branch-control");
    control.append(
      part("span", "branch-trigger"),
      part("span", "branch-text", region.label),
      part("span", "item-indicator"),
    );

    const content = part("div", "branch-content");
    for (const city of region.children) {
      const item = part("div", "item");
      item.setAttribute("value", city.value);
      item.append(
        part("span", "item-indicator"),
        part("span", "item-text", city.label),
      );
      content.append(item);
    }

    branch.append(control, content);
    return branch;
  }

  let requested = false;
  let timer;

  function load(mode) {
    if (timer !== undefined)
      window.clearTimeout(timer);
    treeSelect.loading = true;
    treeSelect.value = [];
    treeSelect.expandedValue = [];
    tree.replaceChildren();
    treeSelect.collection = [];
    readout.textContent = "（无）";
    for (const button of buttons)
      button.disabled = true;

    timer = window.setTimeout(() => {
      timer = undefined;
      const result = mode === "cities" ? CITY_TREE : [];
      tree.replaceChildren(...result.map(renderRegion));
      treeSelect.collection = result;
      treeSelect.loading = false;
      for (const button of buttons)
        button.disabled = false;
    }, 800);
  }

  treeSelect.collection = [];
  treeSelect.expandedValue = [];

  treeSelect.addEventListener("open-change", (event) => {
    if (!event.detail.open || requested)
      return;
    requested = true;
    load("cities");
  });

  for (const button of buttons)
    button.addEventListener("click", () => load(button.dataset.loadMode));

  treeSelect.addEventListener("expanded-value-change", (event) => {
    treeSelect.expandedValue = event.detail.value;
  });

  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 浮层里的操作区

footer 写在 content 里、tree 的兄弟：它不进 role=tree 的拥有关系，方向键也走不到；在浮层内点按钮不算点在外面，浮层不会因此收起

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectFooter,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
];
</script>

<template>
  <!-- 根部件的插槽把操作入口交出来，浮层里的按钮直接调它们 -->
  <XhTreeSelectRoot
    v-slot="{ canClear, clear, setExpandedValue }"
    :collection="files"
    :default-expanded-value="['docs']"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
  >
    <XhTreeSelectLabel>文档</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch v-for="dir in files" :key="dir.value" :value="dir.value">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ dir.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="file in dir.children"
                :key="file.value"
                :value="file.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ file.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>

        <XhTreeSelectFooter>
          <button type="button" @click="setExpandedValue(['docs', 'assets'])">全部展开</button>
          <button type="button" @click="setExpandedValue([])">全部收起</button>
          <button type="button" :disabled="!canClear" @click="clear()">清空</button>
        </XhTreeSelectFooter>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
```

```html
<xh-tree-select id="tree-select-action" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="api">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">api.md</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">assets</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 浮层内的按钮直接改选中集合与展开集合 -->
        <div data-xh-part="footer">
          <button type="button" id="tree-select-action-expand">全部展开</button>
          <button type="button" id="tree-select-action-collapse">全部收起</button>
          <button type="button" id="tree-select-action-clear" disabled>清空</button>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>

<script type="module">
  const treeSelect = document.getElementById("tree-select-action");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
  ];
  treeSelect.value = [];
  treeSelect.expandedValue = ["docs"];

  const clear = document.getElementById("tree-select-action-clear");

  function setValue(next) {
    treeSelect.value = next;
    clear.disabled = next.length === 0;
  }

  treeSelect.addEventListener("value-change", (event) => setValue(event.detail.value));
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  document
    .getElementById("tree-select-action-expand")
    .addEventListener("click", () => (treeSelect.expandedValue = ["docs", "assets"]));
  document
    .getElementById("tree-select-action-collapse")
    .addEventListener("click", () => (treeSelect.expandedValue = []));
  clear.addEventListener("click", () => setValue([]));
</script>
```

### 级联勾选与回显策略

multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛，parent 档整组选满只报组名

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "user",
    label: "用户管理",
    children: [
      { value: "user:view", label: "查看" },
      { value: "user:edit", label: "编辑" },
      { value: "user:del", label: "删除" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    children: [
      { value: "order:view", label: "查看" },
      { value: "order:export", label: "导出" },
    ],
  },
];

const value = ref<string[]>(["user:view"]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="value"
    :collection="collection"
    :default-expanded-value="['user', 'order']"
    multiple
    cascade
    checked-strategy="parent"
    style="max-inline-size: 340px"
  >
    <XhTreeSelectLabel>权限</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <!-- parent 收敛下整组选满值就是组名，缺省显示文本直接可用 -->
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="group in collection"
            :key="group.value"
            :value="group.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectItemIndicator />
              <XhTreeSelectBranchText>{{ group.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="item in group.children"
                :key="item.value"
                :value="item.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ item.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>对外值（parent 收敛）：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select
  id="tree-select-checkable"
  value="user:view"
  multiple
  cascade
  checked-strategy="parent"
>
  <div data-xh-part="root" style="max-inline-size: 340px">
    <span data-xh-part="label">权限</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <!-- parent 收敛下整组选满值就是组名，缺省显示文本直接可用 -->
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="user">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="branch-text">用户管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="user:view">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="user:edit">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">编辑</span>
              </div>
              <div data-xh-part="item" value="user:del">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">删除</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="order">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="branch-text">订单管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="order:view">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="order:export">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">导出</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>对外值（parent 收敛）：<span id="tree-select-checkable-value">user:view</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-checkable");
  treeSelect.collection = [
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user:view", label: "查看" },
        { value: "user:edit", label: "编辑" },
        { value: "user:del", label: "删除" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order:view", label: "查看" },
        { value: "order:export", label: "导出" },
      ],
    },
  ];
  treeSelect.expandedValue = ["user", "order"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-checkable-value");
  treeSelect.addEventListener("value-change", (event) => {
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 浮层内关键词过滤

输入框是树的兄弟节点，树的键盘处理器挂在 tree 上，打字不会被连打检索收走；换掉 collection 可见行与方向键顺序跟着重算

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { computed, ref, watch } from "vue";

interface City {
  value: string;
  label: string;
}

interface Region {
  value: string;
  label: string;
  children: City[];
}

const source: Region[] = [
  {
    value: "east",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
  {
    value: "south",
    label: "华南",
    children: [
      { value: "gz", label: "广州" },
      { value: "sz", label: "深圳" },
    ],
  },
];

const keyword = ref("");

// 分区名命中就整枝留下，否则只留命中的城市；一个都不剩的分区整枝去掉
const collection = computed<Region[]>(() => {
  const key = keyword.value.trim();
  if (!key)
    return source;
  return source
    .map(region => ({
      ...region,
      children: region.label.includes(key)
        ? region.children
        : region.children.filter(city => city.label.includes(key)),
    }))
    .filter(region => region.children.length > 0);
});

const expanded = ref<string[]>([]);

watch(keyword, () => {
  expanded.value = keyword.value.trim()
    ? collection.value.map(region => region.value)
    : [];
});

// 收起浮层顺手把关键词清掉，下次展开还是整棵树
function onOpenChange(details: { open: boolean }): void {
  if (!details.open)
    keyword.value = "";
}
</script>

<template>
  <XhTreeSelectRoot
    v-model:expanded-value="expanded"
    :collection="collection"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>投放城市</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <!-- 浮层里的输入框不算点在外面，浮层不会因此收起 -->
        <input
          v-model="keyword"
          type="search"
          aria-label="城市关键词"
          placeholder="输入关键词"
          style="inline-size: 100%; margin-block-end: 6px"
        >
        <XhTreeSelectTree>
          <XhTreeSelectBranch
            v-for="region in collection"
            :key="region.value"
            :value="region.value"
          >
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>{{ region.label }}</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="city in region.children"
                :key="city.value"
                :value="city.value"
              >
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>{{ city.label }}</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>
        </XhTreeSelectTree>
        <p v-if="!collection.length" style="margin: 0; padding: 4px">
          没有匹配「{{ keyword }}」的城市
        </p>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
</template>
```

```html
<xh-tree-select id="tree-select-filter" placeholder="选一个城市">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">投放城市</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <!-- 浮层里的输入框不算点在外面，浮层不会因此收起 -->
        <input
          id="tree-select-filter-keyword"
          type="search"
          aria-label="城市关键词"
          placeholder="输入关键词"
          style="inline-size: 100%; margin-block-end: 6px"
        />
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="east">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华东</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="sh">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">上海</span>
              </div>
              <div data-xh-part="item" value="hz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">杭州</span>
              </div>
              <div data-xh-part="item" value="nj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">南京</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="north">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华北</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="bj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">北京</span>
              </div>
              <div data-xh-part="item" value="tj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">天津</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="south">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华南</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="gz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">广州</span>
              </div>
              <div data-xh-part="item" value="sz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">深圳</span>
              </div>
            </div>
          </div>
        </div>
        <p id="tree-select-filter-empty" style="margin: 0; padding: 4px; display: none"></p>
      </div>
    </div>
  </div>
</xh-tree-select>

<script type="module">
  const treeSelect = document.getElementById("tree-select-filter");
  const keyword = document.getElementById("tree-select-filter-keyword");
  const empty = document.getElementById("tree-select-filter-empty");
  const tree = treeSelect.querySelector('[data-xh-part="tree"]');

  const source = [
    {
      value: "east",
      label: "华东",
      children: [
        { value: "sh", label: "上海" },
        { value: "hz", label: "杭州" },
        { value: "nj", label: "南京" },
      ],
    },
    {
      value: "north",
      label: "华北",
      children: [
        { value: "bj", label: "北京" },
        { value: "tj", label: "天津" },
      ],
    },
    {
      value: "south",
      label: "华南",
      children: [
        { value: "gz", label: "广州" },
        { value: "sz", label: "深圳" },
      ],
    },
  ];

  treeSelect.collection = source;
  treeSelect.expandedValue = [];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  function part(tag, name, text) {
    const node = document.createElement(tag);
    node.dataset.xhPart = name;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 树数据换了，标记跟着重铺
  function renderTree(regions) {
    tree.replaceChildren(
      ...regions.map((region) => {
        const branch = part("div", "branch");
        branch.setAttribute("value", region.value);
        const control = part("div", "branch-control");
        control.append(
          part("span", "branch-trigger"),
          part("span", "branch-text", region.label),
          part("span", "item-indicator"),
        );
        const content = part("div", "branch-content");
        content.append(
          ...region.children.map((city) => {
            const item = part("div", "item");
            item.setAttribute("value", city.value);
            item.append(part("span", "item-indicator"), part("span", "item-text", city.label));
            return item;
          }),
        );
        branch.append(control, content);
        return branch;
      }),
    );
  }

  // 分区名命中就整枝留下，否则只留命中的城市；一个都不剩的分区整枝去掉
  function filter(key) {
    if (!key) return source;
    return source
      .map((region) => ({
        ...region,
        children: region.label.includes(key)
          ? region.children
          : region.children.filter((city) => city.label.includes(key)),
      }))
      .filter((region) => region.children.length > 0);
  }

  keyword.addEventListener("input", () => {
    const key = keyword.value.trim();
    const regions = filter(key);
    treeSelect.collection = regions;
    renderTree(regions);
    treeSelect.expandedValue = key ? regions.map((region) => region.value) : [];
    empty.textContent = `没有匹配「${key}」的城市`;
    empty.style.display = regions.length ? "none" : "block";
  });

  // 收起浮层顺手把关键词清掉，下次展开还是整棵树
  treeSelect.addEventListener("open-change", (event) => {
    if (event.detail.open) return;
    keyword.value = "";
    treeSelect.collection = source;
    renderTree(source);
    treeSelect.expandedValue = [];
    empty.style.display = "none";
  });
</script>
```

### 只挑文件不挑目录

选中值与展开态双受控：目录的值不写回，紧跟着那一次收起意图也一并吞掉，点目录就只剩展开收起

```vue
<script setup lang="ts">
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

const files: Node[] = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      {
        value: "i18n",
        label: "i18n",
        children: [
          { value: "zh", label: "zh-CN.md" },
          { value: "en", label: "en-US.md" },
        ],
      },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

// 目录的值集合：判定这次选中该不该写回
const dirs = new Set<string>();
function collectDirs(nodes: Node[]): void {
  for (const node of nodes) {
    if (!node.children)
      continue;
    dirs.add(node.value);
    collectDirs(node.children);
  }
}
collectDirs(files);

const value = ref<string[]>([]);
const open = ref(false);
let swallowClose = false;

function onValueChange(details: { value: string[] }): void {
  if (details.value.some(v => dirs.has(v))) {
    // 目录不进选中值；单选下紧跟着的那次收起随之作废
    swallowClose = true;
    return;
  }
  value.value = details.value;
}

function onOpenChange(details: { open: boolean }): void {
  if (!details.open && swallowClose) {
    swallowClose = false;
    return;
  }
  open.value = details.open;
}
</script>

<template>
  <XhTreeSelectRoot
    :collection="files"
    :value="value"
    :open="open"
    :default-expanded-value="['docs']"
    placeholder="选一个文件"
    style="max-inline-size: 320px"
    @value-change="onValueChange"
    @open-change="onOpenChange"
  >
    <XhTreeSelectLabel>附件</XhTreeSelectLabel>
    <XhTreeSelectControl>
      <XhTreeSelectTrigger>
        <XhTreeSelectValueText />
        <XhTreeSelectIndicator />
      </XhTreeSelectTrigger>
    </XhTreeSelectControl>
    <XhTreeSelectPositioner>
      <XhTreeSelectContent>
        <XhTreeSelectTree>
          <XhTreeSelectBranch value="docs">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="guide">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
              <XhTreeSelectBranch value="i18n">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>i18n</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="zh">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>zh-CN.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                  <XhTreeSelectItem value="en">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>en-US.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>

          <XhTreeSelectBranch value="assets">
            <XhTreeSelectBranchControl>
              <XhTreeSelectBranchTrigger />
              <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
              <XhTreeSelectItemIndicator />
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem value="logo">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectBranchContent>
          </XhTreeSelectBranch>

          <XhTreeSelectItem value="readme">
            <XhTreeSelectItemIndicator />
            <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
          </XhTreeSelectItem>
        </XhTreeSelectTree>
      </XhTreeSelectContent>
    </XhTreeSelectPositioner>
  </XhTreeSelectRoot>
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select id="tree-select-file-picker" open="false" placeholder="选一个文件">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">附件</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="branch" value="i18n">
                <div data-xh-part="branch-control">
                  <span data-xh-part="branch-trigger"></span>
                  <span data-xh-part="branch-text">i18n</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="branch-content">
                  <div data-xh-part="item" value="zh">
                    <span data-xh-part="item-indicator"></span>
                    <span data-xh-part="item-text">zh-CN.md</span>
                  </div>
                  <div data-xh-part="item" value="en">
                    <span data-xh-part="item-indicator"></span>
                    <span data-xh-part="item-text">en-US.md</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">assets</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>

          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-file-picker-value">（无）</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-file-picker");
  const files = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        {
          value: "i18n",
          label: "i18n",
          children: [
            { value: "zh", label: "zh-CN.md" },
            { value: "en", label: "en-US.md" },
          ],
        },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.collection = files;
  treeSelect.value = [];
  treeSelect.expandedValue = ["docs"];

  // 目录的值集合：判定这次选中该不该写回
  const dirs = new Set();
  const collectDirs = (nodes) => {
    for (const node of nodes) {
      if (!node.children) continue;
      dirs.add(node.value);
      collectDirs(node.children);
    }
  };
  collectDirs(files);

  const readout = document.getElementById("tree-select-file-picker-value");
  let swallowClose = false;

  treeSelect.addEventListener("value-change", (event) => {
    if (event.detail.value.some((v) => dirs.has(v))) {
      // 目录不进选中值；单选下紧跟着的那次收起随之作废
      swallowClose = true;
      return;
    }
    treeSelect.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });

  treeSelect.addEventListener("open-change", (event) => {
    if (!event.detail.open && swallowClose) {
      swallowClose = false;
      return;
    }
    treeSelect.open = event.detail.open;
  });

  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );
</script>
```

### 只交数据自动渲染

Vue 不写默认插槽时按 collection 铺开整套部件：带 children 的节点落成 branch、其余落成 item，文本与禁用都查数据；label 给标题，clearable 带上清空钮（手写部件不看它），产出的 DOM 与手写全套部件完全一致；Web Components 没有自动铺树，节点部件照常手写、只报 value

```vue
<script setup lang="ts">
import { XhTreeSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md", disabled: true },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
  { value: "readme", label: "README.md" },
];

const doc = ref<string[]>(["guide"]);
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="doc"
    :collection="files"
    :default-expanded-value="['docs']"
    :translations="{ clearTrigger: '清空所选' }"
    label="文档"
    placeholder="选一个文件"
    clearable
    style="max-inline-size: 320px"
  />
  <p>已选：{{ doc.length ? doc.join("、") : "（无）" }}</p>
</template>
```

```html
<xh-tree-select
  id="tree-select-collection"
  default-value="guide"
  placeholder="选一个文件"
>
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文档</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="docs">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">docs</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="guide">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">guide.md</span>
              </div>
              <div data-xh-part="item" value="api">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">api.md</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="assets">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">assets</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="logo">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">logo.svg</span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="readme">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">README.md</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-collection-value">guide</span></p>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const treeSelect = document.getElementById("tree-select-collection");
  treeSelect.collection = [
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md", disabled: true },
      ],
    },
    {
      value: "assets",
      label: "assets",
      children: [{ value: "logo", label: "logo.svg" }],
    },
    { value: "readme", label: "README.md" },
  ];
  treeSelect.translations = { clearTrigger: "清空所选" };

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  treeSelect.expandedValue = ["docs"];
  treeSelect.addEventListener(
    "expanded-value-change",
    (event) => (treeSelect.expandedValue = event.detail.value),
  );

  const readout = document.getElementById("tree-select-collection-value");
  treeSelect.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

## 设计指引

### 何时使用

- 选项是任意形状的树（组织架构、目录、权限节点）。
- 需要在浮层里展开、勾选，并把选中项回显在触发器上。

### 何时不用

- 层级规整、层数固定：[级联选择](./cascader)的分列展开更快。
- 树本身就是页面主体：用[树](./tree)。

### 特性

- 选中与展开两套值各自可受控。
- 原生表单按每个选中值生成一个同名隐藏字段；`['a,b', 'c']` 用 `FormData.getAll(name)` 读取为两个原值，不使用逗号拼接。零选中没有提交项，禁用不提交，只读仍提交。
- 声明 `HiddenInput` 部件才参与原生表单。`form` 可指定外部表单 ID，提交与重置使用同一所有者；显式 ID 不存在时不回退祖先表单。非受控 reset 恢复 `defaultValue`，受控值由业务响应重置请求。
- 单选、多选、分支与叶子统一用末端对号表示选中，级联半选使用横线；正文保持正常颜色和字重，
  中性底只用于悬停和键盘高亮。展开箭头位于行首，与选择标记分开。
- `cascade` 与 `checkedStrategy` 决定勾选是否带子级、回显给哪一层。
- 支持只挑叶子不挑分支、浮层内关键词过滤、子节点异步加载：节点用 `hasChildren: true` 声明懒分支，首次展开由 `loadChildren({ node, signal })` 取直接子项；失败保留 cause，默认 `branch-error` 与 `branch-retry-trigger` 直接可用。
- 整树空（`empty`）与在途（`loading`）默认自动渲染；collection 看有效树长度，手写节点由适配器只上报挂载事实、Headless 统一判空。`loading` 为真时树报 `aria-busy`，空态让位；作者写同名部件时保留作者结构与文案。
- 输入框保持实体；浮层使用 M2 磨砂材质、内侧顶光和四向短位移，不缩放树中文字。
  树、空态与加载态共用一个外壳，底部操作使用同材质分隔线；增强对比度时材质自动实体化。
  面板宽度受定位后的可用空间约束，即使触发器更宽也不会强行撑大面板。
- 仅 `{ hasChildren: true, children: undefined }` 触发 `loadChildren({ node, signal })`；`children: []` 是已知为空目录，永不请求。成功子项、可见行、键盘导航与级联选择由 headless 的同一有效树计算，三端不各自缓存结果。
- 分支状态不互相降级：`api.branchLoadState(value)` 公开 `idle` / `loading` / `loaded` / `error`；`loaded` 的 `empty` 明确区分成功空数组，`error` 保留原始 cause。默认结构提供 `branch-loading`、`branch-error`、`branch-retry-trigger`、`branch-empty`，也可用同名部件替换文案；错误分支行上的 Enter/Space 是不破坏 tree roving 的正式键盘重试入口。
- `onBranchLoadStart`、`onBranchLoad`、`onBranchLoadError`（三端事件为 `branch-load-start` / `branch-load` / `branch-load-error`）公开有效请求生命周期。分支或整浮层收起、重试、节点移除/同 value 换代、组件卸载都会中止并作废旧请求；迟到兑现或拒绝不能写回当前树，也不发成功/失败事件。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree-select>` |
| Vue 组件 | `XhTreeSelectBranch` `XhTreeSelectBranchContent` `XhTreeSelectBranchControl` `XhTreeSelectBranchEmpty` `XhTreeSelectBranchError` `XhTreeSelectBranchIndicator` `XhTreeSelectBranchLoading` `XhTreeSelectBranchRetryTrigger` `XhTreeSelectBranchText` `XhTreeSelectBranchTrigger` `XhTreeSelectClearTrigger` `XhTreeSelectContent` `XhTreeSelectControl` `XhTreeSelectEmpty` `XhTreeSelectFooter` `XhTreeSelectHiddenInput` `XhTreeSelectIndicator` `XhTreeSelectItem` `XhTreeSelectItemIndicator` `XhTreeSelectItemText` `XhTreeSelectLabel` `XhTreeSelectLoading` `XhTreeSelectPositioner` `XhTreeSelectRoot` `XhTreeSelectTree` `XhTreeSelectTrigger` `XhTreeSelectValueText` |
| 组合式函数 | `useTreeSelect` |
| 状态机 | `treeSelectMachine` |
| 皮肤 | `@xihan-ui/styles/tree-select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tree-select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · **`tree`** · `item` · `item-text` · `item-indicator` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `branch-loading` · `branch-error` · `branch-retry-trigger` · `branch-empty` · `empty` · `loading` · `footer` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeSelectNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。`hasChildren` 且未给 children 是懒分支；已给 children 时它优先。缺省为空树。 |
| `loadChildren` | `(request: TreeSelectLoadChildrenRequest) => Promise<TreeSelectNode[] \| undefined \| void> \| TreeSelectNode[] \| undefined \| void` |  | 取回 `hasChildren: true` 分支的直接子项。首次展开自动调用，失败后用 api.retryBranch 显式重试。旧请求的兑现或拒绝不会覆盖更新的一轮，也不会写回已移除的分支。 |
| `value` | `string \| string[]` |  | 选中值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 单选写成裸串是简写，内部一律归一成数组。 |
| `defaultValue` | `string \| string[]` |  |  |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控，语义同上。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `open` | `boolean` |  | 展开态。给定即受控：内部不再自改，只发 onOpenChange。 |
| `defaultOpen` | `boolean` |  |  |
| `multiple` | `boolean` |  | 多选：选中是集合，选中后浮层不收起、焦点留在树里以便接着挑。 |
| `cascade` | `boolean` |  | 多选下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选， 禁用子树整棵冻结。默认 false（朴素切换）；单选下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 |
| `disabled` | `boolean` |  | 整个控件禁用：trigger 用原生 disabled，表单出口不参与提交。 |
| `readOnly` | `boolean` |  | 只读：浮层照常展开、树照常浏览与展开收起，但选中值改不动、也清不掉。 disabled 则连键盘入口都没有。 |
| `invalid` | `boolean` |  | 校验失败：trigger 报 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 节点还在取：树报 aria-busy，在途占位顶上来、空态占位让位。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定触发框的描边与底色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦与选中用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定触发框与树节点行的几何档位。 |
| `placeholder` | `string` |  | 无选中时 value-text 显示的占位文字。 |
| `translations` | `Partial<TreeSelectTranslations>` |  | 读屏用的文案，默认英文。 |
| `placement` | `Placement` |  |  |
| `offset` | `number` |  |  |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `name` | `string` |  | 表单字段名。给定后表单出口才带 name，选中值随表单一并提交。 |
| `form` | `string` |  | 原生表单 ID；显式关联外部表单，提交与 reset 使用同一所有者。 |
| `onValueChange` | `(details: TreeSelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: TreeSelectExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |
| `onOpenChange` | `(details: TreeSelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onBranchLoadStart` | `(details: TreeSelectBranchLoadStartDetails) => void` |  | 一轮有效分支请求开始；retry 与首次展开由 reason 区分。 |
| `onBranchLoad` | `(details: TreeSelectBranchLoadDetails) => void` |  | 一轮有效分支请求成功；children 为空仍是成功，不转换成错误或全局空态。 |
| `onBranchLoadError` | `(details: TreeSelectBranchLoadErrorDetails) => void` |  | 一轮有效分支请求失败；保留 loader 给出的原始 error。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TreeSelectValueChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `expanded-value-change` | `TreeSelectExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `open-change` | `TreeSelectOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTreeSelectRoot` | `default` | `TreeSelectRootSlotProps` |  |
| `XhTreeSelectRoot` | `label` | — |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `control` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `tree` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `NODE.FOCUS` · `NODE.LOST` · `NODE.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `BRANCH.RETRY` · `NODE.MOUNT` · `NODE.UNMOUNT` · `NODES.SYNC` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple`

## connect API

`useTreeSelect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly TreeSelectNode[]` | 当前有效树：含 headless 已成功取回的懒分支子项。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。 |
| `value` | `string[]` | 选中集合；单选下长度 ≤ 1，形状不随模式变。 |
| `expandedValue` | `string[]` |  |
| `valueText` | `string \| null` | 选中项的显示文本（多选用逗号加空格连接）；无选中时为 null。取自 collection 的 label。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取其文本，否则取 placeholder。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起、或它已被收起而不可见时为 null。 |
| `empty` | `boolean` | 整树当前是否没有任何节点；collection 与手写节点统一由 Headless 判定。 |
| `loading` | `boolean` | 外部整树 loading 状态。懒分支 loading 由 branchLoadState 单独表达。 |
| `translations` | `TreeSelectTranslations` |  |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `branchLoadState` | `(value: string) => TreeSelectBranchLoadSnapshot \| null` | 非懒分支返回 null；懒分支即使尚未请求也返回 idle。 |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `retryBranch` | `(value: string) => void` | 失败后重新取该分支；非懒分支与未知 value 不产生副作用。 |
| `select` | `(value: string) => void` | 单选替换、多选切换，与点节点同一语义。 |
| `clear` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getControlProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getValueTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getClearTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getItemTextProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getItemIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchLoadingProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchErrorProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getBranchRetryTriggerProps` | `(props: TreeSelectNodeProps) => T['button']` |  |
| `getBranchEmptyProps` | `(props: TreeSelectNodeProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、tree 的兄弟。 collection 与手写节点都由连接层按 Headless 空态收放；作者可换内容，不必自己重算。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 collection 与手写节点都由连接层按 Headless 空态收放。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区：放在 content 里、tree 的兄弟，不入树的拥有关系，方向键也走不到。 |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单值表单出口；按 api.value 逐个调用并生成同名 input，零选中不生成提交项。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | closed, focus in trigger | 展开浮层并把焦点落到选中节点（无选中或它藏在收起的分支里则落首个可用行） |
| `ArrowDown` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的下一个可用行 |
| `ArrowUp` | closed, focus in trigger | 展开浮层并把焦点落到选中节点的上一个可用行 |
| `Delete` | focus in trigger, 有值且未禁用/只读 | 清空全部选中值，焦点留在 trigger |
| `Backspace` | focus in trigger, 有值且未禁用/只读 | 单选清空；多选去掉最后一个选中值 |
| `ArrowDown` | open, focus in content | 焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕） |
| `ArrowUp` | open, focus in content | 焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | open, focus in content | 焦点移到首个可见行 |
| `End` | open, focus in content | 焦点移到末个可见行（展开着的子树也算行） |
| `ArrowRight` | open, focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键 |
| `ArrowLeft` | open, focus in content（dir=rtl 时改由 ArrowRight 承担） | 展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做 |
| `Enter` / `Space` | open, 焦点节点未禁用且不是错误分支 | 选中焦点节点：单选替换并收起浮层、焦点归还 trigger；多选切换且浮层不收起 |
| `Enter` / `Space` | open, focus on branch, 分支加载失败 | 重试该分支，焦点留在分支行；不改变选中值与展开集合 |
| `*` | open, focus in content | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | open, focus in content | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Escape` | open | 收起浮层并把焦点归还 trigger，选中值与展开集合都不变 |
| `Tab` / `Shift+Tab` | open | 收起浮层，焦点不归还 trigger，按 Tab 序列自然离开 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `tree` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'tree' |
| `trigger` | `aria-invalid` | 'true' \| 'false' |
| `trigger` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `trigger` | `aria-readonly` | 'true' \| 'false' |
| `trigger` | `role` | 'combobox' |
| `indicator` | `aria-hidden` | 'true' |
| `clear-trigger` | `aria-label` | translations.clearTrigger |
| `content` | `aria-hidden` | !open \|\| undefined |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-label` | translations.tree |
| `tree` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `role` | 'tree' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-busy` | 'true' \| undefined |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | metaOf(node.value)?.label |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `branch-loading` | `role` | 'status' |
| `branch-error` | `role` | 'alert' |
| `branch-retry-trigger` | `aria-label` | translations.retry |
| `branch-empty` | `role` | 'status' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/tree-select.css` 按部件选择：`[data-scope="tree-select"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-readonly` | ''（条件成立时才出现） |
| `control` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-invalid` | ''（条件成立时才出现） |
| `trigger` | `data-placeholder` | ''（条件成立时才出现） |
| `trigger` | `data-readonly` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `value-text` | `data-disabled` | ''（条件成立时才出现） |
| `value-text` | `data-placeholder` | ''（条件成立时才出现） |
| `indicator` | `data-clearable` | ''（条件成立时才出现） |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-tone` | props.tone |
| `positioner` | `data-variant` | props.variant |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-state` | 'open' \| 'closed' |
| `tree` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-empty` | ''（条件成立时才出现） |
| `tree` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-tree-select-action-bg` | `clear-trigger` | `background` | `default` | `transparent` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-bg-active` | `clear-trigger` | `background` | `active` | `--xh-bg-subtle-active` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-bg-hover` | `clear-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | tree-select 的 clear-trigger 部件 background 覆盖槽。 |
| `--xh-tree-select-action-fg` | `clear-trigger` | `color` | `default` | `--xh-fg-muted` | tree-select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-action-fg-hover` | `clear-trigger` | `color` | `hover` | `--xh-fg-default` | tree-select 的 clear-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-action-font-size` | `clear-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | tree-select 的 clear-trigger 部件 font-size 覆盖槽。 |
| `--xh-tree-select-action-radius` | `clear-trigger` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 clear-trigger 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-action-size` | `clear-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | tree-select 的 clear-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tree-select-branch-content-gap` | `branch-content` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 branch-content 部件 gap 覆盖槽。 |
| `--xh-tree-select-branch-gap` | `branch` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 branch 部件 gap 覆盖槽。 |
| `--xh-tree-select-branch-indicator-fg` | `branch-indicator`<br>`branch-trigger` | `color` | `default` | `--xh-fg-subtle` | tree-select 的 branch-indicator、branch-trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-branch-indicator-size` | `branch-indicator`<br>`branch-trigger`<br>`item` | `inline-size`<br>`padding-inline-start` | `default` | `--xh-control-indicator-size` | tree-select 的 branch-indicator、branch-trigger、item 部件 inline-size、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-content-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | tree-select 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-tree-select-content-bg` | `content` | `background` | `default` | `--xh-material-frosted-bg` | tree-select 的 content 部件 background 覆盖槽。 |
| `--xh-tree-select-content-border` | `content` | `border` | `default` | `--xh-material-frosted-border` | tree-select 的 content 部件 border 覆盖槽。 |
| `--xh-tree-select-content-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | tree-select 的 content 部件 color 覆盖槽。 |
| `--xh-tree-select-content-highlight` | `content` | `background` | `default` | `--xh-material-frosted-highlight` | tree-select 的 content 部件 background 覆盖槽。 |
| `--xh-tree-select-content-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | tree-select 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-tree-select-content-max-w` | `content` | `max-inline-size` | `default` | `--xh-overlay-max-w` | tree-select 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-tree-select-content-min-w` | `content` | `min-inline-size` | `default` | `--xh-overlay-min-w` | tree-select 的 content 部件 min-inline-size 覆盖槽。 |
| `--xh-tree-select-content-px` | `content` | `padding-inline` | `default` | `--xh-space-1` | tree-select 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-content-py` | `content` | `padding-block` | `default` | `--xh-space-1` | tree-select 的 content 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-content-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | tree-select 的 content 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-content-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | tree-select 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-tree-select-control-bg` | `control` | `background` | `default` | `--xh-_tree-select-bg` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-disabled` | `control` | `background` | `disabled` | `--xh-bg-subtle` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-hover` | `control` | `background` | `disabled`<br>`hover`<br>`not([data-disabled], [data-readonly])`<br>`readonly` | `--xh-_tree-select-bg-hover` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-bg-readonly` | `control` | `background` | `readonly` | `--xh-bg-subtle` | tree-select 的 control 部件 background 覆盖槽。 |
| `--xh-tree-select-control-border` | `control` | `border` | `default` | `--xh-_tree-select-border` | tree-select 的 control 部件 border 覆盖槽。 |
| `--xh-tree-select-control-border-focus` | `control` | `border-color` | `disabled`<br>`focus-within`<br>`not([data-disabled])` | `--xh-_tone` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-border-hover` | `control` | `border-color` | `disabled`<br>`hover`<br>`invalid`<br>`not([data-disabled], [data-invalid])` | `--xh-_tree-select-border-hover` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-border-invalid` | `control` | `border-color` | `invalid` | `--xh-border-invalid` | tree-select 的 control 部件 border-color 覆盖槽。 |
| `--xh-tree-select-control-fg` | `control` | `color` | `default` | `--xh-fg-default` | tree-select 的 control 部件 color 覆盖槽。 |
| `--xh-tree-select-control-gap` | `control` | `gap` | `default` | `--xh-_tree-select-gap` | tree-select 的 control 部件 gap 覆盖槽。 |
| `--xh-tree-select-control-h` | `control` | `block-size` | `default` | `--xh-_tree-select-h` | tree-select 的 control 部件 block-size 覆盖槽。 |
| `--xh-tree-select-control-min-w` | `control`<br>`root` | `min-inline-size` | `default` | `--xh-control-min-w` | tree-select 的 control、root 部件 min-inline-size 覆盖槽。 |
| `--xh-tree-select-control-px` | `control` | `padding-inline` | `default` | `--xh-_tree-select-px` | tree-select 的 control 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-control-radius` | `control` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 control 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-control-shadow` | `control` | `box-shadow` | `default` | `--xh-_tree-select-shadow` | tree-select 的 control 部件 box-shadow 覆盖槽。 |
| `--xh-tree-select-empty-fg` | `empty` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 empty 部件 color 覆盖槽。 |
| `--xh-tree-select-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 empty 部件 font-size 覆盖槽。 |
| `--xh-tree-select-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_tree-select-row-px` | tree-select 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | tree-select 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-footer-border` | `footer` | `border-block-start` | `default` | `--xh-material-frosted-separator` | tree-select 的 footer 部件 border-block-start 覆盖槽。 |
| `--xh-tree-select-footer-fg` | `footer` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 footer 部件 color 覆盖槽。 |
| `--xh-tree-select-footer-font-size` | `footer` | `font-size` | `default` | `--xh-text-secondary-size` | tree-select 的 footer 部件 font-size 覆盖槽。 |
| `--xh-tree-select-footer-gap` | `footer` | `gap` | `default` | `--xh-space-2` | tree-select 的 footer 部件 gap 覆盖槽。 |
| `--xh-tree-select-footer-px` | `footer` | `padding-inline` | `default` | `--xh-space-2` | tree-select 的 footer 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-footer-py` | `footer` | `padding-block` | `default` | `--xh-space-2` | tree-select 的 footer 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-gap` | `root` | `gap` | `default` | `--xh-space-1` | tree-select 的 root 部件 gap 覆盖槽。 |
| `--xh-tree-select-icon-size` | `positioner`<br>`root` | `--xh-icon-size` | `is([data-part='root'], [data-part='positioner'])`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | tree-select 的 positioner、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-tree-select-indent` | `branch-content` | `padding-inline-start` | `default` | `--xh-space-4` | tree-select 的 branch-content 部件 padding-inline-start 覆盖槽。 |
| `--xh-tree-select-indicator-fg` | `indicator` | `color` | `default` | `--xh-fg-muted` | tree-select 的 indicator 部件 color 覆盖槽。 |
| `--xh-tree-select-item-bg-hover` | `branch`<br>`branch-control`<br>`item` | `background` | `disabled`<br>`focus-visible`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`is(:hover, [data-highlighted], :focus-visible)`<br>`not([data-disabled])` | `--xh-bg-subtle` | tree-select 的 branch、branch-control、item 部件 background 覆盖槽。 |
| `--xh-tree-select-item-fg` | `branch-control`<br>`item` | `color` | `default`<br>`selected` | `--xh-material-frosted-fg` | tree-select 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-select-item-fg-selected` | `branch-control`<br>`item` | `color` | `selected` | `--xh-tree-select-item-fg` | tree-select 的 branch-control、item 部件 color 覆盖槽。 |
| `--xh-tree-select-item-font-size` | `branch-control`<br>`item` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 branch-control、item 部件 font-size 覆盖槽。 |
| `--xh-tree-select-item-gap` | `branch-control`<br>`item` | `gap`<br>`padding-inline-start` | `default` | `--xh-_tree-select-gap` | tree-select 的 branch-control、item 部件 gap、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-item-indicator-fg` | `item-indicator` | `color` | `default` | `--xh-_tree-select-accent` | tree-select 的 item-indicator 部件 color 覆盖槽。 |
| `--xh-tree-select-item-indicator-size` | `item-indicator` | `block-size`<br>`inline-size` | `default` | `--xh-control-indicator-size` | tree-select 的 item-indicator 部件 block-size、inline-size 覆盖槽。 |
| `--xh-tree-select-item-leading` | `branch-control`<br>`item` | `line-height` | `default` | `--xh-leading-normal` | tree-select 的 branch-control、item 部件 line-height 覆盖槽。 |
| `--xh-tree-select-item-px` | `branch-control`<br>`item` | `padding-inline`<br>`padding-inline-start` | `default` | `--xh-_tree-select-row-px` | tree-select 的 branch-control、item 部件 padding-inline、padding-inline-start 覆盖槽。 |
| `--xh-tree-select-item-py` | `branch-control`<br>`item` | `padding-block` | `default` | `--xh-_tree-select-row-py` | tree-select 的 branch-control、item 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-item-radius` | `branch-control`<br>`item` | `border-radius` | `default` | `--xh-shape-control` | tree-select 的 branch-control、item 部件 border-radius 覆盖槽。 |
| `--xh-tree-select-item-selected-font-weight` | `branch-control`<br>`item` | `font-weight` | `selected` | `--xh-font-weight-regular` | tree-select 的 branch-control、item 部件 font-weight 覆盖槽。 |
| `--xh-tree-select-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | tree-select 的 label 部件 color 覆盖槽。 |
| `--xh-tree-select-label-font-size` | `label` | `font-size` | `default` | `--xh-_tree-select-label-font-size` | tree-select 的 label 部件 font-size 覆盖槽。 |
| `--xh-tree-select-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | tree-select 的 label 部件 font-weight 覆盖槽。 |
| `--xh-tree-select-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | tree-select 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-tree-select-loading-fg` | `loading` | `color` | `default` | `--xh-material-frosted-fg-muted` | tree-select 的 loading 部件 color 覆盖槽。 |
| `--xh-tree-select-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 loading 部件 font-size 覆盖槽。 |
| `--xh-tree-select-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_tree-select-row-px` | tree-select 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-tree-select-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | tree-select 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-tree-select-placeholder-fg` | `value-text` | `color` | `placeholder` | `--xh-fg-subtle` | tree-select 的 value-text 部件 color 覆盖槽。 |
| `--xh-tree-select-tree-gap` | `tree` | `gap` | `default` | `--xh-list-option-gap` | tree-select 的 tree 部件 gap 覆盖槽。 |
| `--xh-tree-select-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | tree-select 的 trigger 部件 color 覆盖槽。 |
| `--xh-tree-select-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_tree-select-font-size` | tree-select 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-tree-select-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_tree-select-gap` | tree-select 的 trigger 部件 gap 覆盖槽。 |
| `--xh-tree-select-value-leading` | `value-text` | `line-height` | `default` | `--xh-leading-normal` | tree-select 的 value-text 部件 line-height 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

关键帧 `xh-overlay-slide-in` · `xh-overlay-slide-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 大树一定要开浮层内过滤，逐级展开找一个节点非常慢。
- 无头用法需要按 `api.value` 遍历，为每个值调用 `api.getHiddenInputProps({ value })` 并渲染原生 input；旧的无参调用与 CSV 提交合同已删除。Vue/React 的 `HiddenInput` 部件自动铺开，Web Components 仍只需声明一个原生 `input[data-xh-part="hidden-input"]`，额外字段由宿主管理。
- 明确"只能选叶子"还是"分支也能选"，并在界面上让分支看起来点得动或点不动。
- 自定义 `branch-control` 与 `item` 均应包含 `item-indicator`，分支标记直接读取所属分支的选择与半选状态，
  不另写一套状态判定或自绘复选框。Vue / React 自动结构已提供此部件。

## 反模式

- 一次把整棵大树塞进浮层：首屏就卡住。
- 勾选策略与后端理解不一致。
