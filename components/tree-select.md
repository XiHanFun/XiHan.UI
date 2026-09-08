来源：https://ui.docs.xihanfun.com/components/tree-select

# 树选择 `tree-select`

浮层里放一棵树的选择器：层级不规整、深浅不一时用它。

## 何时使用

- 选项是任意形状的树（组织架构、目录、权限节点）。
- 需要在浮层里展开、勾选，并把选中项回显在触发器上。

## 何时不用

- 层级规整、层数固定：[级联选择](./cascader)的分列展开更快。
- 树本身就是页面主体：用[树](./tree)。

## 特性

- 选中与展开两套值各自可受控。
- `cascade` 与 `checkedStrategy` 决定勾选是否带子级、回显给哪一层。
- 支持只挑叶子不挑分支、浮层内关键词过滤、子节点异步加载。
- 空（`empty`）与在途（`loading`）两个相位各有部件；`loading` 为真时树报 `aria-busy`，空态让位。

## 示例

### 基础用法

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

### 异步加载子节点

展开某个分支才去要它的子节点：先摆一行禁用占位，数据回来就地换掉，显示文本随之取到新 label

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
  disabled?: boolean;
  children?: Node[];
}

// 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
function pending(owner: string): Node[] {
  return [{ value: `${owner}-pending`, label: "加载中…", disabled: true }];
}

const collection = ref<Node[]>([
  { value: "east", label: "华东", children: pending("east") },
  { value: "north", label: "华北", children: pending("north") },
]);

const cities: Record<string, string[]> = {
  east: ["上海", "杭州", "南京"],
  north: ["北京", "天津"],
};

const expanded = ref<string[]>([]);
const picked = ref<string[]>([]);
const loaded = new Set<string>();

function fetchChildren(value: string): void {
  if (loaded.has(value))
    return;
  loaded.add(value);
  window.setTimeout(() => {
    const branch = collection.value.find(node => node.value === value);
    if (!branch)
      return;
    branch.children = cities[value].map((name, index) => ({
      value: `${value}-${index}`,
      label: name,
    }));
  }, 800);
}

function onExpandedValueChange(details: { value: string[] }): void {
  expanded.value = details.value;
  for (const value of details.value) fetchChildren(value);
}
</script>

<template>
  <XhTreeSelectRoot
    v-model:value="picked"
    :collection="collection"
    :expanded-value="expanded"
    placeholder="选一个城市"
    style="max-inline-size: 320px"
    @expanded-value-change="onExpandedValueChange"
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
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="east">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华东</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="east-pending">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">加载中…</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="north">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华北</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="north-pending">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">加载中…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree-select>
<p>已选：<span id="tree-select-async-value">（无）</span></p>

<script type="module">
  const treeSelect = document.getElementById("tree-select-async");

  // 占位行也是一个真节点：它得在树数据里，方向键才走得到它
  const pending = (owner) => [{ value: `${owner}-pending`, label: "加载中…", disabled: true }];

  const collection = [
    { value: "east", label: "华东", children: pending("east") },
    { value: "north", label: "华北", children: pending("north") },
  ];
  const cities = { east: ["上海", "杭州", "南京"], north: ["北京", "天津"] };

  treeSelect.collection = collection;
  treeSelect.expandedValue = [];

  // 数据回来后就地换掉那一枝的标记，节点身份写在 value 属性上
  function renderBranch(value) {
    const branch = treeSelect.querySelector(`[data-xh-part="branch"][value="${value}"]`);
    const content = branch.querySelector('[data-xh-part="branch-content"]');
    const rows = collection.find((node) => node.value === value).children;
    content.replaceChildren(
      ...rows.map((row) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", row.value);
        const indicator = document.createElement("span");
        indicator.dataset.xhPart = "item-indicator";
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = row.label;
        item.append(indicator, text);
        return item;
      }),
    );
  }

  const loaded = new Set();

  function fetchChildren(value) {
    if (loaded.has(value)) return;
    loaded.add(value);
    setTimeout(() => {
      const branch = collection.find((node) => node.value === value);
      branch.children = cities[value].map((name, index) => ({
        value: `${value}-${index}`,
        label: name,
      }));
      treeSelect.collection = [...collection];
      renderBranch(value);
    }, 800);
  }

  treeSelect.addEventListener("expanded-value-change", (event) => {
    treeSelect.expandedValue = event.detail.value;
    for (const value of event.detail.value) fetchChildren(value);
  });

  const readout = document.getElementById("tree-select-async-value");
  treeSelect.addEventListener("value-change", (event) => {
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
import { CheckIcon, MinusIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
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

const boxStyle = {
  display: "inline-flex",
  flex: "none",
  alignItems: "center",
  justifyContent: "center",
  inlineSize: "1rem",
  blockSize: "1rem",
  border: "1px solid var(--xh-border-strong)",
  borderRadius: "3px",
  fontSize: "0.75rem",
  lineHeight: "1",
};
</script>

<template>
  <XhTreeSelectRoot
    v-slot="{ isSelected, isIndeterminate }"
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
              <span aria-hidden="true" :style="boxStyle">
                <XhIcon v-if="isSelected(group.value)" :icon="CheckIcon" />
                <XhIcon v-else-if="isIndeterminate(group.value)" :icon="MinusIcon" />
              </span>
              <XhTreeSelectBranchText>{{ group.label }}</XhTreeSelectBranchText>
            </XhTreeSelectBranchControl>
            <XhTreeSelectBranchContent>
              <XhTreeSelectItem
                v-for="item in group.children"
                :key="item.value"
                :value="item.value"
              >
                <span aria-hidden="true" :style="boxStyle">
                  <XhIcon v-if="isSelected(item.value)" :icon="CheckIcon" />
                </span>
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
<style>
  #tree-select-checkable [data-demo-box] {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    inline-size: 1rem;
    block-size: 1rem;
    border: 1px solid var(--xh-border-strong);
    border-radius: 3px;
    font-size: 0.75rem;
    line-height: 1;
  }

  /* 勾选态与半选态都写在节点自己身上，方框按这两个标记用令牌里的字形蒙版画勾与横杠 */
  #tree-select-checkable [data-demo-box]::after {
    display: inline-block;
    inline-size: 1em;
    block-size: 1em;
    background-color: currentColor;
    -webkit-mask: var(--xh-glyph-mark-check) center / contain no-repeat;
    mask: var(--xh-glyph-mark-check) center / contain no-repeat;
  }

  #tree-select-checkable
    [data-part="branch"][data-selected]
    > [data-part="branch-control"]
    > [data-demo-box]::after {
    content: "";
  }

  #tree-select-checkable
    [data-part="branch"][data-indeterminate]
    > [data-part="branch-control"]
    > [data-demo-box]::after {
    content: "";
    -webkit-mask-image: var(--xh-glyph-mark-minus);
    mask-image: var(--xh-glyph-mark-minus);
  }

  #tree-select-checkable [data-part="item"][data-selected] > [data-demo-box]::after {
    content: "";
  }
</style>

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
              <span aria-hidden="true" data-demo-box></span>
              <span data-xh-part="branch-text">用户管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="user:view">
                <span aria-hidden="true" data-demo-box></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="user:edit">
                <span aria-hidden="true" data-demo-box></span>
                <span data-xh-part="item-text">编辑</span>
              </div>
              <div data-xh-part="item" value="user:del">
                <span aria-hidden="true" data-demo-box></span>
                <span data-xh-part="item-text">删除</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="order">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span aria-hidden="true" data-demo-box></span>
              <span data-xh-part="branch-text">订单管理</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="order:view">
                <span aria-hidden="true" data-demo-box></span>
                <span data-xh-part="item-text">查看</span>
              </div>
              <div data-xh-part="item" value="order:export">
                <span aria-hidden="true" data-demo-box></span>
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
        control.append(part("span", "branch-trigger"), part("span", "branch-text", region.label));
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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree-select>` |
| Vue 组件 | `XhTreeSelectBranch` `XhTreeSelectBranchContent` `XhTreeSelectBranchControl` `XhTreeSelectBranchIndicator` `XhTreeSelectBranchText` `XhTreeSelectBranchTrigger` `XhTreeSelectClearTrigger` `XhTreeSelectContent` `XhTreeSelectControl` `XhTreeSelectEmpty` `XhTreeSelectFooter` `XhTreeSelectHiddenInput` `XhTreeSelectIndicator` `XhTreeSelectItem` `XhTreeSelectItemIndicator` `XhTreeSelectItemText` `XhTreeSelectLabel` `XhTreeSelectLoading` `XhTreeSelectPositioner` `XhTreeSelectRoot` `XhTreeSelectTree` `XhTreeSelectTrigger` `XhTreeSelectValueText` |
| 组合式函数 | `useTreeSelect` |
| 状态机 | `treeSelectMachine` |
| 皮肤 | `@xihan-ui/styles/tree-select.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tree-select"`：`root` · `label` · `control` · **`trigger`** · `value-text` · `indicator` · `clear-trigger` · `positioner` · **`content`** · **`tree`** · **`item`** · `item-text` · `item-indicator` · `branch` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `empty` · `loading` · `footer` · `hidden-input`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeNode[]` |  | 树数据，层级元信息与显示文本的唯一事实源。缺省为空树。 |
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
| `onValueChange` | `(details: TreeSelectValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |
| `onExpandedValueChange` | `(details: TreeSelectExpandedValueChangeDetails) => void` |  | 展开集合变化意图回调；语义同上。 |
| `onOpenChange` | `(details: TreeSelectOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

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

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `NODE.FOCUS` · `NODE.LOST` · `NODE.SELECT` · `VALUE.SET` · `VALUE.CLEAR` · `EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `FORM.RESET`

**判据**：`isOpenControlled` · `isMultiple`

## connect API

`useTreeSelect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `collection` | `readonly TreeNode[]` | 作者给的原始树数据。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。 |
| `value` | `string[]` | 选中集合；单选下长度 ≤ 1，形状不随模式变。 |
| `expandedValue` | `string[]` |  |
| `valueText` | `string \| null` | 选中项的显示文本（多选用逗号加空格连接）；无选中时为 null。取自 collection 的 label。 |
| `displayText` | `string` | value-text 实际显示的文字：有选中取其文本，否则取 placeholder。 |
| `focusedValue` | `string \| null` | 焦点锚点；收起、或它已被收起而不可见时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `canClear` | `boolean` | 清空按钮此刻可不可按。 |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `isExpanded` | `(value: string) => boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
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
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、tree 的兄弟。 给了 collection 时由连接层按条数收放；节点手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；节点手写时只按 loading 收放。 |
| `getFooterProps` | `() => T['element']` | 浮层底部的操作区：放在 content 里、tree 的兄弟，不入树的拥有关系，方向键也走不到。 |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：一份 type=hidden 的原生 input，选中值按逗号拼成一串随表单提交。 |

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
| `Enter` / `Space` | open, 焦点节点未禁用 | 选中焦点节点：单选替换并收起浮层、焦点归还 trigger；多选切换且浮层不收起 |
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
| `clear-trigger` | `aria-label` | props.translations.clearTrigger |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-label` | props.translations.tree |
| `tree` | `aria-labelledby` | `label` 部件的 id `value-text` 部件的 id |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `role` | 'tree' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | metaOf(node.value)?.label |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |

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
| `tree` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tree-select-action-bg` · `--xh-tree-select-action-bg-active` · `--xh-tree-select-action-bg-hover` · `--xh-tree-select-action-fg` · `--xh-tree-select-action-fg-hover` · `--xh-tree-select-action-font-size` · `--xh-tree-select-action-radius` · `--xh-tree-select-action-size` · `--xh-tree-select-branch-content-gap` · `--xh-tree-select-branch-gap` · `--xh-tree-select-branch-indicator-fg` · `--xh-tree-select-branch-indicator-size` · `--xh-tree-select-content-bg` · `--xh-tree-select-content-border` · `--xh-tree-select-content-fg` · `--xh-tree-select-content-max-h` · `--xh-tree-select-content-max-w` · `--xh-tree-select-content-min-w` · `--xh-tree-select-content-px` · `--xh-tree-select-content-py` · `--xh-tree-select-content-radius` · `--xh-tree-select-content-shadow` · `--xh-tree-select-control-bg` · `--xh-tree-select-control-bg-disabled` · `--xh-tree-select-control-bg-hover` · `--xh-tree-select-control-bg-readonly` · `--xh-tree-select-control-border` · `--xh-tree-select-control-border-focus` · `--xh-tree-select-control-border-hover` · `--xh-tree-select-control-border-invalid` · `--xh-tree-select-control-fg` · `--xh-tree-select-control-gap` · `--xh-tree-select-control-h` · `--xh-tree-select-control-min-w` · `--xh-tree-select-control-px` · `--xh-tree-select-control-radius` · `--xh-tree-select-control-shadow` · `--xh-tree-select-empty-fg` · `--xh-tree-select-empty-font-size` · `--xh-tree-select-empty-px` · `--xh-tree-select-empty-py` · `--xh-tree-select-footer-border` · `--xh-tree-select-footer-fg` · `--xh-tree-select-footer-font-size` · `--xh-tree-select-footer-gap` · `--xh-tree-select-footer-px` · `--xh-tree-select-footer-py` · `--xh-tree-select-gap` · `--xh-tree-select-icon-size` · `--xh-tree-select-indent` · `--xh-tree-select-indicator-fg` · `--xh-tree-select-item-bg-hover` · `--xh-tree-select-item-fg` · `--xh-tree-select-item-fg-selected` · `--xh-tree-select-item-font-size` · `--xh-tree-select-item-gap` · `--xh-tree-select-item-indicator-fg` · `--xh-tree-select-item-indicator-size` · `--xh-tree-select-item-leading` · `--xh-tree-select-item-px` · `--xh-tree-select-item-py` · `--xh-tree-select-item-radius` · `--xh-tree-select-item-selected-font-weight` · `--xh-tree-select-label-fg` · `--xh-tree-select-label-font-size` · `--xh-tree-select-label-font-weight` · `--xh-tree-select-layer` · `--xh-tree-select-loading-fg` · `--xh-tree-select-loading-font-size` · `--xh-tree-select-loading-px` · `--xh-tree-select-loading-py` · `--xh-tree-select-placeholder-fg` · `--xh-tree-select-tree-gap` · `--xh-tree-select-trigger-fg` · `--xh-tree-select-trigger-font-size` · `--xh-tree-select-trigger-gap` · `--xh-tree-select-value-leading`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `rotate` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 外面套[表单字段](./field)。

## 最佳实践

- 大树一定要开浮层内过滤，逐级展开找一个节点非常慢。
- 明确"只能选叶子"还是"分支也能选"，并在界面上让分支看起来点得动或点不动。

## 反模式

- 一次把整棵大树塞进浮层：首屏就卡住。
- 勾选策略与后端理解不一致。
