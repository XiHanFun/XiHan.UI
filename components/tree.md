来源：https://ui.docs.xihanfun.com/components/tree

# 树 `tree`

层级数据的展开与选择：分支可展开，节点可选。

## 何时使用

- 文件目录、组织架构、权限节点这类任意深度的层级数据。
- 需要在树上多选并处理父子级联。

## 何时不用

- 树只是为了选一个值：用[树选择](./tree-select)，它把树收进浮层。
- 层级规整、层数固定且只为选值：用[级联选择](./cascader)。
- 数据是平的：用[列表](./list)或[表格](./table)。

## 特性

- 展开集合与选中集合两套值各自可受控。
- `variant` 决定带不带外框，缺省 `surface`；`plain` 让树直接落在页面上。
- `cascade` 与 `checkedStrategy` 决定勾父带不带子、以及回显给哪一层。
- 支持只让叶子进选中集合、关键词过滤、子节点异步加载、拖放换父。
- `expandOnClick` 决定点整行是否展开。
- 空（`empty`）与在途（`loading`）两个相位各有部件，都放在 `root` 里当 `tree` 的兄弟；`loading` 为真时树报 `aria-busy`，空态让位。
- `leafOrientation` 按结构判据横排：子节点全是叶子的那层跟着它走，其余恒竖排。
- 节点上标 `childrenOrientation: 'horizontal' | 'vertical'` 指定「我这一层子节点怎么排」，
  比 `leafOrientation` 优先；标 `vertical` 能把树级的 `horizontal` 按回竖排。根层不受影响，恒竖排。

## 示例

### 基础用法

collection 是层级元信息的唯一事实源，标记只管长相；缩进由子层容器自己顶着

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      {
        value: "components",
        label: "components",
        children: [
          { value: "button", label: "Button.vue" },
          { value: "dialog", label: "Dialog.vue" },
        ],
      },
      { value: "main", label: "main.ts" },
    ],
  },
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
</script>

<template>
  <XhTreeRoot
    :collection="collection"
    :default-expanded-value="['src']"
    style="inline-size: 100%; max-inline-size: 320px"
  >
    <XhTreeLabel>项目文件</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch value="src">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>src</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeBranch value="components">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>components</XhTreeBranchText>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="button">
                <XhTreeItemIndicator />
                <XhTreeItemText>Button.vue</XhTreeItemText>
              </XhTreeItem>
              <XhTreeItem value="dialog">
                <XhTreeItemIndicator />
                <XhTreeItemText>Dialog.vue</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <XhTreeItem value="main">
            <XhTreeItemIndicator />
            <XhTreeItemText>main.ts</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeBranch value="docs">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>docs</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="guide">
            <XhTreeItemIndicator />
            <XhTreeItemText>guide.md</XhTreeItemText>
          </XhTreeItem>
          <XhTreeItem value="api">
            <XhTreeItemIndicator />
            <XhTreeItemText>api.md</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeItem value="readme">
        <XhTreeItemIndicator />
        <XhTreeItemText>README.md</XhTreeItemText>
      </XhTreeItem>
    </XhTreeTree>
  </XhTreeRoot>
</template>
```

```html
<xh-tree id="tree-basic">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">项目文件</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="src">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">src</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="branch" value="components">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">components</span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="button">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">Button.vue</span>
              </div>
              <div data-xh-part="item" value="dialog">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">Dialog.vue</span>
              </div>
            </div>
          </div>
          <div data-xh-part="item" value="main">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">main.ts</span>
          </div>
        </div>
      </div>

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
</xh-tree>

<script type="module">
  // 层级、显示文本与节点禁用都查这份树数据，标记只管长相
  const tree = document.getElementById("tree-basic");
  tree.collection = [
    {
      value: "src",
      label: "src",
      children: [
        {
          value: "components",
          label: "components",
          children: [
            { value: "button", label: "Button.vue" },
            { value: "dialog", label: "Dialog.vue" },
          ],
        },
        { value: "main", label: "main.ts" },
      ],
    },
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

  // 展开集合是数组，只走属性；这里由宿主持有，组件发的事件宿主写回才算数
  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );
</script>
```

### 多选

multiple 关着是单选，打开后点击与确认键都变成切换，选中集合形状不变仍是数组

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "cn",
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
];

const selected = ref<string[]>(["hz"]);
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      v-model:selection="selected"
      :collection="collection"
      :default-expanded-value="['cn', 'north']"
      multiple
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="cn">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华东</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="sh">
              <XhTreeItemIndicator />
              <XhTreeItemText>上海</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="hz">
              <XhTreeItemIndicator />
              <XhTreeItemText>杭州</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="nj">
              <XhTreeItemIndicator />
              <XhTreeItemText>南京</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="north">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华北</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="bj">
              <XhTreeItemIndicator />
              <XhTreeItemText>北京</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="tj">
              <XhTreeItemIndicator />
              <XhTreeItemText>天津</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-multiple" multiple>
    <div data-xh-part="root">
      <span data-xh-part="label">投放城市</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="cn">
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
      </div>
    </div>
  </xh-tree>
  <span>选中：<span id="tree-multiple-value">hz</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-multiple");
  const readout = document.getElementById("tree-multiple-value");

  tree.collection = [
    {
      value: "cn",
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
  ];

  // 展开集合与选中集合都是数组，只走属性；宿主写回它们才动
  tree.expandedValue = ["cn", "north"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  tree.selection = ["hz"];
  tree.addEventListener("selection-change", (event) => {
    tree.selection = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 受控

传了 expandedValue / selection 就由宿主说了算，组件只发事件不落内部值，宿主写回它才动

```vue
<script setup lang="ts">
import {
  XhButton,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "api",
    label: "接口",
    children: [
      { value: "auth", label: "鉴权" },
      { value: "user", label: "用户" },
    ],
  },
  {
    value: "guide",
    label: "指南",
    children: [{ value: "start", label: "快速开始" }],
  },
];

const expanded = ref<string[]>(["api"]);
const selected = ref<string[]>([]);

function onExpandedValueChange(details: { value: string[] }) {
  expanded.value = details.value;
}

function onSelectionChange(details: { value: string[] }) {
  selected.value = details.value;
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="expanded = ['api', 'guide']">全部展开</XhButton>
      <XhButton size="sm" @click="expanded = []">全部收起</XhButton>
    </div>

    <XhTreeRoot
      :collection="collection"
      :expanded-value="expanded"
      :selection="selected"
      @expanded-value-change="onExpandedValueChange"
      @selection-change="onSelectionChange"
    >
      <XhTreeLabel>文档目录</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="api">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>接口</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="auth">
              <XhTreeItemIndicator />
              <XhTreeItemText>鉴权</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="user">
              <XhTreeItemIndicator />
              <XhTreeItemText>用户</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="guide">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>指南</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="start">
              <XhTreeItemIndicator />
              <XhTreeItemText>快速开始</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>

    <span>
      展开：{{ expanded.length ? expanded.join("、") : "（无）" }} · 选中：{{
        selected.length ? selected.join("、") : "（无）"
      }}
    </span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <xh-button id="tree-controlled-expand" size="sm">
      <button data-xh-part="root">全部展开</button>
    </xh-button>
    <xh-button id="tree-controlled-collapse" size="sm">
      <button data-xh-part="root">全部收起</button>
    </xh-button>
  </div>

  <xh-tree id="tree-controlled">
    <div data-xh-part="root">
      <span data-xh-part="label">文档目录</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="api">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">接口</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="auth">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">鉴权</span>
            </div>
            <div data-xh-part="item" value="user">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">用户</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="guide">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">指南</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="start">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">快速开始</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>

  <span>展开：<span id="tree-controlled-expanded">api</span> · 选中：<span id="tree-controlled-selected">（无）</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-controlled");
  const expandedOut = document.getElementById("tree-controlled-expanded");
  const selectedOut = document.getElementById("tree-controlled-selected");

  tree.collection = [
    {
      value: "api",
      label: "接口",
      children: [
        { value: "auth", label: "鉴权" },
        { value: "user", label: "用户" },
      ],
    },
    {
      value: "guide",
      label: "指南",
      children: [{ value: "start", label: "快速开始" }],
    },
  ];

  // 两份集合都由这段脚本持有：组件只发意图，写回才真的改
  function setExpanded(value) {
    tree.expandedValue = value;
    expandedOut.textContent = value.join("、") || "（无）";
  }

  function setSelected(value) {
    tree.selection = value;
    selectedOut.textContent = value.join("、") || "（无）";
  }

  setExpanded(["api"]);
  setSelected([]);

  tree.addEventListener("expanded-value-change", (event) => setExpanded(event.detail.value));
  tree.addEventListener("selection-change", (event) => setSelected(event.detail.value));

  const button = (id) =>
    document.getElementById(id).querySelector('[data-xh-part="root"]');

  button("tree-controlled-expand").addEventListener("click", () =>
    setExpanded(["api", "guide"]),
  );
  button("tree-controlled-collapse").addEventListener("click", () => setExpanded([]));
</script>
```

### 点行不展开与禁用节点

expandOnClick 关掉后只有箭头与左右方向键能改展开态；禁用节点仍可聚焦，只是确认键不认它

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "build",
    label: "build",
    children: [
      { value: "vite", label: "vite.config.ts" },
      { value: "lock", label: "pnpm-lock.yaml", disabled: true },
    ],
  },
  // 空数组也算分支：展得开，只是里头没有行
  { value: "dist", label: "dist", children: [] },
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <XhTreeRoot
    :collection="collection"
    :default-expanded-value="['build']"
    :expand-on-click="false"
    style="inline-size: 100%; max-inline-size: 320px"
  >
    <XhTreeLabel>构建产物</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch value="build">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>build</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="vite">
            <XhTreeItemIndicator />
            <XhTreeItemText>vite.config.ts</XhTreeItemText>
          </XhTreeItem>
          <XhTreeItem value="lock">
            <XhTreeItemIndicator />
            <XhTreeItemText>pnpm-lock.yaml（禁用）</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeBranch value="dist">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>dist</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent />
      </XhTreeBranch>

      <XhTreeItem value="readme">
        <XhTreeItemIndicator />
        <XhTreeItemText>README.md</XhTreeItemText>
      </XhTreeItem>
    </XhTreeTree>
  </XhTreeRoot>
</template>
```

```html
<xh-tree id="tree-expand-on-click" expand-on-click="false">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">构建产物</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="build">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">build</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="vite">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">vite.config.ts</span>
          </div>
          <div data-xh-part="item" value="lock">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">pnpm-lock.yaml（禁用）</span>
          </div>
        </div>
      </div>

      <div data-xh-part="branch" value="dist">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">dist</span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>

      <div data-xh-part="item" value="readme">
        <span data-xh-part="item-indicator"></span>
        <span data-xh-part="item-text">README.md</span>
      </div>
    </div>
  </div>
</xh-tree>

<script type="module">
  const tree = document.getElementById("tree-expand-on-click");
  tree.collection = [
    {
      value: "build",
      label: "build",
      children: [
        { value: "vite", label: "vite.config.ts" },
        { value: "lock", label: "pnpm-lock.yaml", disabled: true },
      ],
    },
    // 空数组也算分支：展得开，只是里头没有行
    { value: "dist", label: "dist", children: [] },
    { value: "readme", label: "README.md" },
  ];

  tree.expandedValue = ["build"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );
</script>
```

### 关键词过滤

collection 换一份树就换一棵：标记跟着数据重铺，过滤剩下的分支顺手全展开

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
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

// 分支名命中就整枝留下，否则只留命中的子节点；一个子节点都不剩的分支整枝去掉
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

const expanded = ref<string[]>(["east"]);

watch(keyword, () => {
  expanded.value = collection.value.map(region => region.value);
});
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <input v-model="keyword" type="search" aria-label="城市关键词" placeholder="输入城市名">

    <XhTreeRoot v-model:expanded-value="expanded" :collection="collection">
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in collection" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <XhTreeItemIndicator />
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>

    <span v-if="!collection.length">没有匹配「{{ keyword }}」的城市</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <input
    id="tree-filter-keyword"
    type="search"
    aria-label="城市关键词"
    placeholder="输入城市名"
  />

  <xh-tree id="tree-filter">
    <div data-xh-part="root">
      <span data-xh-part="label">投放城市</span>
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
    </div>
  </xh-tree>

  <span id="tree-filter-empty" style="display: none"></span>
</div>

<script type="module">
  const host = document.getElementById("tree-filter");
  const keyword = document.getElementById("tree-filter-keyword");
  const empty = document.getElementById("tree-filter-empty");
  const tree = host.querySelector('[data-xh-part="tree"]');

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

  host.collection = source;
  host.expandedValue = ["east"];
  host.addEventListener(
    "expanded-value-change",
    (event) => (host.expandedValue = event.detail.value),
  );

  function part(name, text) {
    const node = document.createElement("div");
    node.dataset.xhPart = name;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // 树数据换了，标记跟着重铺
  function renderTree(regions) {
    tree.replaceChildren(
      ...regions.map((region) => {
        const branch = part("branch");
        branch.setAttribute("value", region.value);
        const control = part("branch-control");
        control.append(part("branch-trigger"), part("branch-text", region.label));
        const content = part("branch-content");
        content.append(
          ...region.children.map((city) => {
            const item = part("item");
            item.setAttribute("value", city.value);
            item.append(part("item-indicator"), part("item-text", city.label));
            return item;
          }),
        );
        branch.append(control, content);
        return branch;
      }),
    );
  }

  // 分支名命中就整枝留下，否则只留命中的子节点；一个子节点都不剩的分支整枝去掉
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
    host.collection = regions;
    renderTree(regions);
    host.expandedValue = regions.map((region) => region.value);
    empty.textContent = `没有匹配「${key}」的城市`;
    empty.style.display = regions.length ? "none" : "block";
  });
</script>
```

### 异步加载子节点

展开那一刻才去要数据：先摆一行禁用的占位，取回来就地换掉，收起再展开不重复请求

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
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
  { value: "rd", label: "研发中心", children: pending("rd") },
  { value: "ops", label: "运维中心", children: pending("ops") },
  { value: "biz", label: "业务中心", children: pending("biz") },
]);

const staff: Record<string, string[]> = {
  rd: ["赵一", "钱二"],
  ops: ["孙三"],
  biz: ["李四", "周五", "吴六"],
};

const expanded = ref<string[]>([]);
const loaded = new Set<string>();

function fetchChildren(value: string): void {
  if (loaded.has(value))
    return;
  loaded.add(value);
  window.setTimeout(() => {
    const branch = collection.value.find(node => node.value === value);
    if (!branch)
      return;
    branch.children = staff[value].map((name, index) => ({
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
  <XhTreeRoot
    :collection="collection"
    :expanded-value="expanded"
    style="inline-size: 100%; max-inline-size: 320px"
    @expanded-value-change="onExpandedValueChange"
  >
    <XhTreeLabel>组织架构</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch v-for="node in collection" :key="node.value" :value="node.value">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>{{ node.label }}</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem v-for="child in node.children" :key="child.value" :value="child.value">
            <XhTreeItemIndicator />
            <XhTreeItemText>{{ child.label }}</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>
    </XhTreeTree>
  </XhTreeRoot>
</template>
```

```html
<xh-tree id="tree-async">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 320px">
    <span data-xh-part="label">组织架构</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="rd">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">研发中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="rd-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="ops">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">运维中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="ops-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="biz">
        <div data-xh-part="branch-control">
          <span data-xh-part="branch-trigger"></span>
          <span data-xh-part="branch-text">业务中心</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="biz-pending">
            <span data-xh-part="item-indicator"></span>
            <span data-xh-part="item-text">加载中…</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-tree>

<script type="module">
  const tree = document.getElementById("tree-async");

  // 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
  const pending = (owner) => [
    { value: `${owner}-pending`, label: "加载中…", disabled: true },
  ];

  const collection = [
    { value: "rd", label: "研发中心", children: pending("rd") },
    { value: "ops", label: "运维中心", children: pending("ops") },
    { value: "biz", label: "业务中心", children: pending("biz") },
  ];
  tree.collection = collection;

  const staff = {
    rd: ["赵一", "钱二"],
    ops: ["孙三"],
    biz: ["李四", "周五", "吴六"],
  };

  // 这一支的子层标记照当下的树数据重铺
  function renderChildren(node) {
    const content = tree.querySelector(
      `[data-xh-part="branch"][value="${node.value}"] > [data-xh-part="branch-content"]`,
    );
    content.replaceChildren(
      ...node.children.map((child) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", child.value);
        const mark = document.createElement("span");
        mark.dataset.xhPart = "item-indicator";
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = child.label;
        item.append(mark, text);
        return item;
      }),
    );
  }

  const loaded = new Set();

  // 这里用定时器代替一次请求
  function fetchChildren(value) {
    if (loaded.has(value)) return;
    loaded.add(value);
    setTimeout(() => {
      const branch = collection.find((node) => node.value === value);
      branch.children = staff[value].map((name, index) => ({
        value: `${value}-${index}`,
        label: name,
      }));
      renderChildren(branch);
      tree.collection = [...collection];
    }, 800);
  }

  tree.expandedValue = [];
  tree.addEventListener("expanded-value-change", (event) => {
    tree.expandedValue = event.detail.value;
    for (const value of event.detail.value) fetchChildren(value);
  });
</script>
```

### 前缀与行尾

行里放什么由标记说了算：文字前塞图标、文字后塞操作，方向指示也可以挪到行尾去

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [{ value: "guide", label: "guide.md" }],
  },
];

const log = ref("（还没动过）");

function rename(label: string): void {
  log.value = `重命名 ${label}`;
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot :collection="collection" :default-expanded-value="['src']">
      <XhTreeLabel>工作区</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <span aria-hidden="true">📁</span>
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
            <!-- 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state -->
            <XhTreeBranchIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="file in dir.children" :key="file.value" :value="file.value">
              <span aria-hidden="true">📄</span>
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
              <!-- 掐断冒泡，否则点按钮连带把这一行也选上 -->
              <button type="button" @click.stop="rename(file.label)">重命名</button>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-prefix-suffix">
    <div data-xh-part="root">
      <span data-xh-part="label">工作区</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span aria-hidden="true">📁</span>
            <span data-xh-part="branch-text">src</span>
            <!-- 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state -->
            <span data-xh-part="branch-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="index">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">index.ts</span>
              <button type="button" data-rename="index.ts">重命名</button>
            </div>
            <div data-xh-part="item" value="app">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">app.vue</span>
              <button type="button" data-rename="app.vue">重命名</button>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="docs">
          <div data-xh-part="branch-control">
            <span aria-hidden="true">📁</span>
            <span data-xh-part="branch-text">docs</span>
            <span data-xh-part="branch-indicator"></span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="guide">
              <span aria-hidden="true">📄</span>
              <span data-xh-part="item-text">guide.md</span>
              <button type="button" data-rename="guide.md">重命名</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
  <span id="tree-prefix-suffix-log">（还没动过）</span>
</div>

<script type="module">
  const tree = document.getElementById("tree-prefix-suffix");
  const log = document.getElementById("tree-prefix-suffix-log");

  tree.collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "index", label: "index.ts" },
        { value: "app", label: "app.vue" },
      ],
    },
    {
      value: "docs",
      label: "docs",
      children: [{ value: "guide", label: "guide.md" }],
    },
  ];

  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  for (const button of tree.querySelectorAll("[data-rename]")) {
    button.addEventListener("click", (event) => {
      // 掐断冒泡，否则点按钮连带把这一行也选上
      event.stopPropagation();
      log.textContent = `重命名 ${button.dataset.rename}`;
    });
  }
</script>
```

### 只让叶子进选中集合

选中受控就由宿主定夺：分支的值直接不写回，点目录只剩展开收起这一个效果

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
];

const leaves = new Set(collection.flatMap(dir => dir.children.map(file => file.value)));

const selected = ref<string[]>([]);

function onSelectionChange(details: { value: string[] }): void {
  selected.value = details.value.filter(value => leaves.has(value));
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :selection="selected"
      :default-expanded-value="['src']"
      multiple
      @selection-change="onSelectionChange"
    >
      <XhTreeLabel>要提交的文件</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="file in dir.children" :key="file.value" :value="file.value">
              <XhTreeItemIndicator />
              <XhTreeItemText>{{ file.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>已选：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <xh-tree id="tree-leaf-only" multiple>
    <div data-xh-part="root">
      <span data-xh-part="label">要提交的文件</span>
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
      </div>
    </div>
  </xh-tree>
  <span>已选：<span id="tree-leaf-only-value">（无）</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-leaf-only");
  const readout = document.getElementById("tree-leaf-only-value");

  const collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "index", label: "index.ts" },
        { value: "app", label: "app.vue" },
      ],
    },
    {
      value: "docs",
      label: "docs",
      children: [
        { value: "guide", label: "guide.md" },
        { value: "api", label: "api.md" },
      ],
    },
  ];
  tree.collection = collection;

  tree.expandedValue = ["src"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  const leaves = new Set(
    collection.flatMap((dir) => dir.children.map((file) => file.value)),
  );

  // 分支的值在写回时滤掉，选中集合里只留叶子
  tree.selection = [];
  tree.addEventListener("selection-change", (event) => {
    const value = event.detail.value.filter((one) => leaves.has(one));
    tree.selection = value;
    readout.textContent = value.join("、") || "（无）";
  });
</script>
```

### 级联勾选

multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；勾选框是行里的一段标记，勾选态与半选态都由组件报出

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
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
];

const selected = ref<string[]>(["hz"]);
</script>

<template>
  <div style="display: grid; gap: 8px; justify-items: start">
    <XhTreeRoot
      v-model:selection="selected"
      :collection="collection"
      :default-expanded-value="['east', 'north']"
      multiple
      cascade
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="region in collection" :key="region.value" :value="region.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchCheckbox />
            <XhTreeBranchText>{{ region.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="city in region.children" :key="city.value" :value="city.value">
              <XhTreeItemCheckbox />
              <XhTreeItemText>{{ city.label }}</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <p>选中值（默认只收叶）：{{ selected.length ? selected.join("、") : "（无）" }}</p>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px; justify-items: start">
  <xh-tree id="tree-checkable" multiple cascade>
    <div data-xh-part="root">
      <span data-xh-part="label">投放城市</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="east">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-checkbox"></span>
            <span data-xh-part="branch-text">华东</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="sh">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">上海</span>
            </div>
            <div data-xh-part="item" value="hz">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">杭州</span>
            </div>
            <div data-xh-part="item" value="nj">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">南京</span>
            </div>
          </div>
        </div>

        <div data-xh-part="branch" value="north">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-checkbox"></span>
            <span data-xh-part="branch-text">华北</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="bj">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">北京</span>
            </div>
            <div data-xh-part="item" value="tj">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">天津</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
  <p>选中值（默认只收叶）：<span id="tree-checkable-value">hz</span></p>
</div>

<script type="module">
  const tree = document.getElementById("tree-checkable");
  const readout = document.getElementById("tree-checkable-value");

  tree.collection = [
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
  ];

  tree.expandedValue = ["east", "north"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  tree.selection = ["hz"];
  tree.addEventListener("selection-change", (event) => {
    tree.selection = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 拖拽搬家

整个节点都是拖动源：按住拖到别处松手，也可以 Tab 进树里用 Alt + 上下键在同层挪、Alt + 左右键改层级。三档落点（插在前 / 插在后 / 放进目录里）连同指示线、自我后代守卫与读屏播报都归库；树仍不拥有数据，宿主只管按库报的 value、parent、index 把数组搬一下，外加一条 allowDrop 说这次许不许

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeLiveRegion,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

/** 库报的落点：把 value 搬到 parent 下面的第 index 位；parent 为 null 即根层。 */
interface Move {
  value: string;
  parent: string | null;
  index: number;
}

/** 文件：叶子，收不下东西。 */
interface Doc {
  value: string;
  label: string;
}

/** 目录：装文件的那一层。 */
interface Folder extends Doc {
  children: Doc[];
}

type Entry = Doc | Folder;

const collection = ref<Entry[]>([
  {
    value: "inbox",
    label: "收件箱",
    children: [
      { value: "f1", label: "报价单.pdf" },
      { value: "f2", label: "周报.md" },
      { value: "f3", label: "会议纪要.md" },
    ],
  },
  {
    value: "archive",
    label: "归档",
    children: [{ value: "f4", label: "去年总结.docx" }],
  },
  { value: "trash", label: "回收站", children: [] },
]);

const log = ref("按住任意一行拖走，或 Tab 进树里按 Alt + 方向键搬");

const isFolder = (entry: Entry): entry is Folder => "children" in entry;

// 目录只待在根层（下面那条 allowDrop 保证了这点），找目录就是在根层找
function folderOf(value: string): Folder | undefined {
  return collection.value.filter(isFolder).find(folder => folder.value === value);
}

/** parent 指的那一层：根层是 collection 本身，目录是它的 children。 */
function levelOf(parent: string | null): Entry[] | undefined {
  return parent == null ? collection.value : folderOf(parent)?.children;
}

// 这一次搬家许不许。库自己兜住的是「落进自己的后代」与「落在禁用节点上」，
// 剩下的是这份数据的规矩：只有目录收得下东西，而且只收文件——
// 目录因此永远待在根层，回收站也收不到整个目录。
function allowDrop(move: Move): boolean {
  if (move.parent == null)
    return true;
  return folderOf(move.parent) != null && folderOf(move.value) == null;
}

// 树从不拥有数据：库只说搬到哪个父下面的第几位，改数组这一下归宿主。
// index 已经算过「先摘后插」，照着先摘再插即可。
function onNodeMove(move: Move): void {
  const levels: Entry[][] = [
    collection.value,
    ...collection.value.filter(isFolder).map(folder => folder.children),
  ];
  const from = levels.find(level => level.some(node => node.value === move.value));
  const into = levelOf(move.parent);
  if (!from || !into)
    return;
  const [moved] = from.splice(
    from.findIndex(node => node.value === move.value),
    1,
  );
  if (!moved)
    return;
  into.splice(move.index, 0, moved);
  const where = move.parent == null ? "根层" : (folderOf(move.parent)?.label ?? move.parent);
  log.value = `${moved.label} 搬到了${where}第 ${move.index + 1} 位`;
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <XhTreeRoot
      :collection="collection"
      :default-expanded-value="['inbox', 'archive', 'trash']"
      :allow-drop="allowDrop"
      node-draggable
      @node-move="onNodeMove"
    >
      <XhTreeLabel>邮箱目录</XhTreeLabel>
      <XhTreeTree>
        <template v-for="entry in collection" :key="entry.value">
          <XhTreeBranch v-if="isFolder(entry)" :value="entry.value">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>{{ entry.label }}</XhTreeBranchText>
              <span style="margin-inline-start: auto">{{ entry.children.length }}</span>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem v-for="file in entry.children" :key="file.value" :value="file.value">
                <span aria-hidden="true">📄</span>
                <XhTreeItemText>{{ file.label }}</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <!-- 文件退到根层就不在任何目录里了，那一层直接是它自己 -->
          <XhTreeItem v-else :value="entry.value">
            <span aria-hidden="true">📄</span>
            <XhTreeItemText>{{ entry.label }}</XhTreeItemText>
          </XhTreeItem>
        </template>
      </XhTreeTree>
      <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
      <XhTreeLiveRegion />
    </XhTreeRoot>
    <span>{{ log }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <!-- 属性名让开 HTML 全局的 draggable：写那个的话浏览器会拿它接管原生拖放 -->
  <xh-tree id="tree-drag-move" node-draggable>
    <span data-xh-part="label">邮箱目录</span>
    <div data-xh-part="tree">
      <div data-xh-part="branch" value="inbox">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">收件箱</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="f1">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">报价单.pdf</span>
          </div>
          <div data-xh-part="item" value="f2">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">周报.md</span>
          </div>
          <div data-xh-part="item" value="f3">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">会议纪要.md</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="archive">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">归档</span>
        </div>
        <div data-xh-part="branch-content">
          <div data-xh-part="item" value="f4">
            <span aria-hidden="true">📄</span>
            <span data-xh-part="item-text">去年总结.docx</span>
          </div>
        </div>
      </div>
      <div data-xh-part="branch" value="trash">
        <div data-xh-part="branch-control">
          <button data-xh-part="branch-trigger"></button>
          <span data-xh-part="branch-text">回收站</span>
        </div>
        <div data-xh-part="branch-content"></div>
      </div>
    </div>
    <!-- 播报区视觉隐藏，必须在拖动开始之前就在 DOM 上 -->
    <div data-xh-part="live-region"></div>
  </xh-tree>
  <span id="tree-drag-log">按住任意一行拖走，或 Tab 进树里按 Alt + 方向键搬</span>
</div>

<script type="module">
  const el = document.getElementById("tree-drag-move");
  const log = document.getElementById("tree-drag-log");

  // 层级数据是数组，只走属性
  const collection = [
    {
      value: "inbox",
      label: "收件箱",
      children: [
        { value: "f1", label: "报价单.pdf" },
        { value: "f2", label: "周报.md" },
        { value: "f3", label: "会议纪要.md" },
      ],
    },
    { value: "archive", label: "归档", children: [{ value: "f4", label: "去年总结.docx" }] },
    { value: "trash", label: "回收站", children: [] },
  ];
  el.collection = collection;
  el.defaultExpandedValue = ["inbox", "archive", "trash"];

  const isFolder = (entry) => Array.isArray(entry.children);
  const folderOf = (value) => collection.filter(isFolder).find((f) => f.value === value);
  const levelOf = (parent) => (parent == null ? collection : folderOf(parent)?.children);

  // 这一次搬家许不许。库自己兜住的是「落进自己的后代」与「落在禁用节点上」，
  // 剩下的是这份数据的规矩：只有目录收得下东西，而且只收文件
  el.allowDrop = (move) => {
    if (move.parent == null) return true;
    return folderOf(move.parent) != null && folderOf(move.value) == null;
  };

  // 树从不拥有数据：库只说搬到哪个父下面的第几位，改数组这一下归宿主。
  // index 已经算过「先摘后插」，照着先摘再插即可
  el.addEventListener("node-move", (event) => {
    const move = event.detail;
    const levels = [collection, ...collection.filter(isFolder).map((f) => f.children)];
    const from = levels.find((level) => level.some((node) => node.value === move.value));
    const into = levelOf(move.parent);
    if (!from || !into) return;
    const [moved] = from.splice(
      from.findIndex((node) => node.value === move.value),
      1,
    );
    if (!moved) return;
    into.splice(move.index, 0, moved);
    // 数组是就地改的，把同一份重新赋回去让元素重推层级
    el.collection = [...collection];
    const where = move.parent == null ? "根层" : (folderOf(move.parent)?.label ?? move.parent);
    log.textContent = `${moved.label} 搬到了${where}第 ${move.index + 1} 位`;
  });
</script>
```

### 末端横排

leaf-orientation 按结构判据横排「子节点全是叶子」的那层；要指定哪一层横排就在节点上标 childrenOrientation，它比树级值优先，标 vertical 也压得住

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "system",
    label: "系统管理",
    children: [
      {
        // 没标：跟着树级开关走
        value: "user",
        label: "用户管理",
        children: [
          { value: "user:add", label: "新增" },
          { value: "user:edit", label: "编辑" },
          { value: "user:del", label: "删除" },
          { value: "user:export", label: "导出" },
        ],
      },
      {
        // 标了横排：开关拨到竖排也照横
        value: "role",
        label: "角色管理",
        childrenOrientation: "horizontal" as const,
        children: [
          { value: "role:add", label: "新增" },
          { value: "role:grant", label: "授权" },
          { value: "role:del", label: "删除" },
        ],
      },
      {
        // 标了竖排：按住树级的横排
        value: "log",
        label: "日志管理",
        childrenOrientation: "vertical" as const,
        children: [
          { value: "log:view", label: "查看" },
          { value: "log:export", label: "导出" },
        ],
      },
    ],
  },
];

const wide = ref(true);
const selection = ref<string[]>(["user:add"]);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px; justify-items: start">
    <label style="display: inline-flex; gap: 6px; align-items: center">
      <input v-model="wide" type="checkbox">
      按钮那层横排
    </label>

    <XhTreeRoot
      v-model:selection="selection"
      :collection="collection"
      :leaf-orientation="wide ? 'horizontal' : 'vertical'"
      :default-expanded-value="['system', 'user', 'role', 'log']"
      multiple
      cascade
    >
      <XhTreeLabel>菜单授权</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchCheckbox />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeBranch v-for="menu in dir.children" :key="menu.value" :value="menu.value">
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchCheckbox />
                <XhTreeBranchText>{{ menu.label }}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                <XhTreeItem v-for="btn in menu.children" :key="btn.value" :value="btn.value">
                  <XhTreeItemCheckbox />
                  <XhTreeItemText>{{ btn.label }}</XhTreeItemText>
                </XhTreeItem>
              </XhTreeBranchContent>
            </XhTreeBranch>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px; justify-items: start">
  <label style="display: inline-flex; gap: 6px; align-items: center">
    <input id="tree-orientation-wide" type="checkbox" checked />
    按钮那层横排
  </label>

  <xh-tree id="tree-orientation" multiple cascade leaf-orientation="horizontal">
    <div data-xh-part="root">
      <span data-xh-part="label">菜单授权</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="system">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-checkbox"></span>
            <span data-xh-part="branch-text">系统管理</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="branch" value="user">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-checkbox"></span>
                <span data-xh-part="branch-text">用户管理</span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="user:add">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">新增</span>
                </div>
                <div data-xh-part="item" value="user:edit">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">编辑</span>
                </div>
                <div data-xh-part="item" value="user:del">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">删除</span>
                </div>
                <div data-xh-part="item" value="user:export">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">导出</span>
                </div>
              </div>
            </div>

            <div data-xh-part="branch" value="role">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-checkbox"></span>
                <span data-xh-part="branch-text">角色管理</span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="role:add">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">新增</span>
                </div>
                <div data-xh-part="item" value="role:grant">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">授权</span>
                </div>
                <div data-xh-part="item" value="role:del">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">删除</span>
                </div>
              </div>
            </div>

            <div data-xh-part="branch" value="log">
              <div data-xh-part="branch-control">
                <span data-xh-part="branch-trigger"></span>
                <span data-xh-part="branch-checkbox"></span>
                <span data-xh-part="branch-text">日志管理</span>
              </div>
              <div data-xh-part="branch-content">
                <div data-xh-part="item" value="log:view">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">查看</span>
                </div>
                <div data-xh-part="item" value="log:export">
                  <span data-xh-part="item-checkbox"></span>
                  <span data-xh-part="item-text">导出</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
</div>

<script type="module">
  const tree = document.getElementById("tree-orientation");
  const wide = document.getElementById("tree-orientation-wide");

  tree.collection = [
    {
      value: "system",
      label: "系统管理",
      children: [
        {
          // 没标：跟着树级开关走
          value: "user",
          label: "用户管理",
          children: [
            { value: "user:add", label: "新增" },
            { value: "user:edit", label: "编辑" },
            { value: "user:del", label: "删除" },
            { value: "user:export", label: "导出" },
          ],
        },
        {
          // 标了横排：开关拨到竖排也照横
          value: "role",
          label: "角色管理",
          childrenOrientation: "horizontal",
          children: [
            { value: "role:add", label: "新增" },
            { value: "role:grant", label: "授权" },
            { value: "role:del", label: "删除" },
          ],
        },
        {
          // 标了竖排：按住树级的横排
          value: "log",
          label: "日志管理",
          childrenOrientation: "vertical",
          children: [
            { value: "log:view", label: "查看" },
            { value: "log:export", label: "导出" },
          ],
        },
      ],
    },
  ];

  tree.expandedValue = ["system", "user", "role", "log"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  tree.selection = ["user:add"];
  tree.addEventListener(
    "selection-change",
    (event) => (tree.selection = event.detail.value),
  );

  wide.addEventListener("change", () => {
    tree.setAttribute("leaf-orientation", wide.checked ? "horizontal" : "vertical");
  });
</script>
```

### 范围选

按住 Shift 点某一项，选中锚点到它那一段；按可见序取，折叠起来的子节点选不进去

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";
import { ref } from "vue";

const collection = [
  {
    value: "cn",
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
];

const selected = ref<string[]>([]);
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <p style="color: var(--xh-fg-muted)">
      点「上海」，再<strong>按住 Shift</strong> 点「北京」 —— 中间整段一起选上。
      再按住 Shift 点「南京」，选区往回收，起点不变。
    </p>
    <XhTreeRoot
      v-model:selection="selected"
      :collection="collection"
      :default-expanded-value="['cn', 'north']"
      multiple
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="cn">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华东</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="sh">
              <XhTreeItemIndicator />
              <XhTreeItemText>上海</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="hz">
              <XhTreeItemIndicator />
              <XhTreeItemText>杭州</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="nj">
              <XhTreeItemIndicator />
              <XhTreeItemText>南京</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="north">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华北</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="bj">
              <XhTreeItemIndicator />
              <XhTreeItemText>北京</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="tj">
              <XhTreeItemIndicator />
              <XhTreeItemText>天津</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
```

```html
<div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
  <p style="color: var(--xh-fg-muted)">
    点「上海」，再<strong>按住 Shift</strong> 点「北京」 —— 中间整段一起选上。
    再按住 Shift 点「南京」，选区往回收，起点不变。
  </p>
  <xh-tree id="tree-range" multiple>
    <div data-xh-part="root">
      <span data-xh-part="label">投放城市</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="cn">
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
      </div>
    </div>
  </xh-tree>
  <span>选中：<span id="tree-range-value">（无）</span></span>
</div>

<script type="module">
  const tree = document.getElementById("tree-range");
  const readout = document.getElementById("tree-range-value");

  tree.collection = [
    {
      value: "cn",
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
  ];

  // 展开集合与选中集合都是数组，只走属性；宿主写回它们才动
  tree.expandedValue = ["cn", "north"];
  tree.addEventListener(
    "expanded-value-change",
    (event) => (tree.expandedValue = event.detail.value),
  );

  tree.selection = [];
  tree.addEventListener("selection-change", (event) => {
    tree.selection = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
</script>
```

### 形态

variant="plain" 去掉外框与底色，树直接落在页面上；缺省 surface 保持带框的样子

```vue
<script setup lang="ts">
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "main", label: "main.ts" },
      { value: "app", label: "App.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 320px">
    <XhTreeRoot
      v-for="variant in (['surface', 'plain'] as const)"
      :key="variant"
      :collection="collection"
      :variant="variant"
      :default-expanded-value="['src']"
    >
      <XhTreeTree>
        <XhTreeBranch value="src">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>src</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="main">
              <XhTreeItemIndicator />
              <XhTreeItemText>main.ts</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="app">
              <XhTreeItemIndicator />
              <XhTreeItemText>App.vue</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
        <XhTreeItem value="readme">
          <XhTreeItemIndicator />
          <XhTreeItemText>README.md</XhTreeItemText>
        </XhTreeItem>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: 100%; max-inline-size: 320px">
  <xh-tree id="tree-variant-surface" variant="surface">
    <div data-xh-part="root">
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">main.ts</span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">App.vue</span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">README.md</span>
        </div>
      </div>
    </div>
  </xh-tree>

  <xh-tree id="tree-variant-plain" variant="plain">
    <div data-xh-part="root">
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="src">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">src</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="main">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">main.ts</span>
            </div>
            <div data-xh-part="item" value="app">
              <span data-xh-part="item-indicator"></span>
              <span data-xh-part="item-text">App.vue</span>
            </div>
          </div>
        </div>
        <div data-xh-part="item" value="readme">
          <span data-xh-part="item-indicator"></span>
          <span data-xh-part="item-text">README.md</span>
        </div>
      </div>
    </div>
  </xh-tree>
</div>

<script type="module">
  const collection = [
    {
      value: "src",
      label: "src",
      children: [
        { value: "main", label: "main.ts" },
        { value: "app", label: "App.vue" },
      ],
    },
    { value: "readme", label: "README.md" },
  ];

  // 数据与展开集合都是数组，只走属性
  for (const id of ["tree-variant-surface", "tree-variant-plain"]) {
    const tree = document.getElementById(id);
    tree.collection = collection;
    tree.expandedValue = ["src"];
    tree.addEventListener(
      "expanded-value-change",
      (event) => (tree.expandedValue = event.detail.value),
    );
  }
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tree>` |
| Vue 组件 | `XhTreeBranch` `XhTreeBranchCheckbox` `XhTreeBranchContent` `XhTreeBranchControl` `XhTreeBranchIndicator` `XhTreeBranchText` `XhTreeBranchTrigger` `XhTreeEmpty` `XhTreeItem` `XhTreeItemCheckbox` `XhTreeItemIndicator` `XhTreeItemText` `XhTreeLabel` `XhTreeLiveRegion` `XhTreeLoading` `XhTreeNodeDragTrigger` `XhTreeRoot` `XhTreeTree` |
| 组合式函数 | `useTree` |
| 状态机 | `treeMachine` |
| 皮肤 | `@xihan-ui/styles/tree.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tree"`：`root` · `label` · **`tree`** · **`item`** · `item-checkbox` · `item-indicator` · `item-text` · `branch` · `branch-checkbox` · `branch-control` · `branch-trigger` · `branch-indicator` · `branch-text` · `branch-content` · `node-drag-trigger` · `empty` · `loading` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TreeNode[]` |  | 树数据，层级元信息的唯一事实源。缺省为空树。 |
| `variant` | `TreeVariant` |  | 外框形态：surface 带描边与底色（缺省），plain 去掉描边与底色，只留行。 |
| `leafOrientation` | `Orientation` |  | 末端那一层怎么排，默认 vertical（每行一个）。horizontal 让它们并排铺开。 只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层： 一个菜单下十几个按钮，横排一行铺完，省掉纵向翻找。中间层与整棵树恒是竖排， 它们承载的是层级本身，横过来层级就读没了。 这是结构判据，逐层自动认。要精确指定哪一层横排，在节点上标 `childrenOrientation`，它比本项优先。 只管排布，不动键盘：方向键在树上是层级操作（左右收展、上下走可见行）， 这是 treeview 的规范语义，不随排布方向改写。 |
| `expandedValue` | `string[]` |  | 展开集合。给定即受控：cell 直读 prop，写只发 onExpandedValueChange 不落内部值。 |
| `defaultExpandedValue` | `string[]` |  |  |
| `selection` | `string[]` |  | 选中集合。给定即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `multiple` | `boolean` |  | 复选：点击与确认键都是「切换」，tree 带 aria-multiselectable=true。默认 false（单选）。 |
| `cascade` | `boolean` |  | multiple 下父子级联勾选：点分支整枝传导、子全勾父勾、部分勾中半选， 禁用子树整棵冻结。默认 false（朴素切换）；single 下无效。 |
| `checkedStrategy` | `CascadeStrategy` |  | 级联下对外值的收敛策略，默认 child（只收叶）；parent = 最高整枝，all = 全部勾中节点。 |
| `expandOnClick` | `boolean` |  | 点分支行是否顺带展开/收起，默认 true。关掉后只有 branch-trigger 与左右方向键能改展开态。 |
| `disabled` | `boolean` |  | 整棵树禁用：所有节点转 aria-disabled，键盘与点击都不再改展开/选中。 |
| `loading` | `boolean` |  | 节点还在取：树报 aria-busy，在途占位顶上来、空态占位让位。 |
| `loop` | `boolean` |  | 上下键走到首尾是否回绕，默认 false。 |
| `typeahead` | `boolean` |  | 连打检索，默认开。关掉后可打印字符一律放行给页面。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调左右方向键的「展开/收起」语义。 |
| `translations` | `Partial<TreeTranslations>` |  |  |
| `nodeDraggable` | `boolean` |  | 节点可以拖着搬家。整个节点都是拖动源，不另出把手。 |
| `allowDrop` | `(move: TreeMove) => boolean` |  | 这一次搬家许不许。收到的是折算好的落点（搬到哪个父下面的第几位）。 不给即都许——「落进自己的后代」与「落在禁用节点上」两条库自己会拦。 |
| `onNodeMove` | `(move: TreeMove) => void` |  |  |
| `onExpandedValueChange` | `(details: TreeExpandedValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TreeSelectionChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `expanded-value-change` | `TreeExpandedValueChangeDetails` | 展开集合变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TreeSelectionChangeDetails` | 选中集合变化；detail 为 `{ value: string[] }` |
| `node-move` | `TreeNodeMoveDetails` | 节点搬了家；detail 为 `{ value, parent, index }`，parent 为 null 即根层，index 是在那一层的落位（已算过先摘后插） |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTreeRoot` | `default` | `TreeRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`EXPANDED.SET` · `BRANCH.EXPAND` · `BRANCH.COLLAPSE` · `BRANCH.TOGGLE` · `SELECTION.SET` · `NODE.SELECT` · `NODE.FOCUS` · `TREE.BLUR` · `NODE_DRAG.START` · `NODE_DRAG.MOVE` · `NODE_DRAG.END` · `NODE_DRAG.CANCEL` · `NODE.MOVE_BY`

## connect API

`useTree` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TreeNode[]` | 作者给的原始树数据。 |
| `visibleNodes` | `readonly TreeVisibleNode[]` | 当前可见行序列（收起分支的子树不在其中）。 方向键、Home/End 与连打检索都在它上面走，不是在原始树上走。 |
| `dropTarget` | `DropTarget \| null` | 此刻的落点；松手就落在这儿。不合法或没落在任何节点上时是 null。 |
| `announcement` | `string` | 读屏播报文本。渲进 live-region，不进视觉版面。 |
| `expandedValue` | `string[]` |  |
| `selection` | `string[]` |  |
| `focusedValue` | `string \| null` | 焦点锚点；焦点不在树内、或它已被收起而不可见时为 null。 |
| `multiple` | `boolean` | 生效的是不是复选。 |
| `disabled` | `boolean` |  |
| `isExpanded` | `(value: string) => boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `isIndeterminate` | `(value: string) => boolean` | 级联模式下该分支是否半选（有效叶后代有勾有不勾）；非级联恒 false。 |
| `setExpandedValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `expand` | `(value: string) => void` |  |
| `collapse` | `(value: string) => void` |  |
| `select` | `(value: string, options?: { extend?: boolean }) => void` | 选中某个节点。extend 为真时选中锚点到这一节点那一段（仅复选、且非级联）。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getTreeProps` | `() => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 root 里、tree 的兄弟（role=tree 只许拥有 treeitem 与 group）。 给了 collection 时由连接层按条数收放；节点手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 给了 collection 时由连接层按条数收放；节点手写时只按 loading 收放。 |
| `getNodeDragTriggerProps` | `(props: TreeNodeProps) => T['element']` | 节点拖动把手。触屏那一路唯一的入口，不占 Tab 位。 常挂即可：nodeDraggable 关着或这个节点禁用时它自报 data-disabled、也不再让出滚动， 渲了不会错。按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。 |
| `getLiveRegionProps` | `() => T['element']` |  |
| `getItemProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TreeNodeProps) => T['element']` | 勾选把手：把「勾这一项」与「点这一行」分成两个可点区域，不给它就没有独立把手。 |
| `getItemIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchCheckboxProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchControlProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTriggerProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchIndicatorProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchTextProps` | `(props: TreeNodeProps) => T['element']` |  |
| `getBranchContentProps` | `(props: TreeNodeProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside the tree | 整棵树只占一个 Tab 位：焦点进入锚点节点，无锚点时先落容器再由它转投 |
| `ArrowDown` | focus in tree | 焦点移到下一个可见行（禁用行跳过；loop 默认关，末行不回绕） |
| `ArrowUp` | focus in tree | 焦点移到上一个可见行（禁用行跳过；loop 默认关，首行不回绕） |
| `Home` | focus in tree | 焦点移到首个可见行 |
| `End` | focus in tree | 焦点移到末个可见行（展开着的子树也算行） |
| `ArrowRight` | focus on branch（dir=rtl 时改由 ArrowLeft 承担） | 收起的分支就地展开；已展开则把焦点移到首个子节点；叶子上什么都不做且不吞键 |
| `ArrowLeft` | focus in tree（dir=rtl 时改由 ArrowRight 承担） | 展开的分支就地收起；收起的分支与叶子则把焦点移到父节点；根层的行什么都不做 |
| `Enter` / `Space` | focus on node, 节点未禁用 | 选中焦点节点（单选替换、复选切换）；焦点在分支上且 expandOnClick 未关时顺带切换展开态 |
| `*` | focus in tree | 展开与焦点行同一父级的全部分支（已展开与禁用的不动）；同级没有可展开的分支时不吞这个键 |
| `单个可打印字符` | focus in tree, typeahead 未关 | 连打检索在可见行上按 label 首字母搬焦点，不改选中值，也不展开任何分支 |
| `Alt+ArrowUp` / `Alt+ArrowDown` | focus in tree, draggable 开着 | 把焦点节点在同一层的兄弟里往前 / 往后挪一位，按一下就是一次完整提交，不进拖动态；纵轴与文字方向无关，rtl 下两键不对调；已是同层首位 / 末位就不动，也不回绕；落点节点禁用或 allowDrop 不许就不搬。裸方向键仍是走可见行、确认键仍是选中 |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | focus in tree, draggable 开着 | 改焦点节点的缩进层级：往里去是认上一个兄弟当父、落进它子层末位，往外去是变成父节点的下一个兄弟；rtl 下两键对调，「往里去」的那个方向恒是缩进。没有上一个兄弟就缩不进去，已在根层就退不出去，两种情形都不动；落点节点禁用或 allowDrop 不许就不搬 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `tree` | `aria-busy` | 'true' \| undefined |
| `tree` | `aria-disabled` | 'true' \| 'false' |
| `tree` | `aria-labelledby` | `label` 部件的 id |
| `tree` | `aria-multiselectable` | 'true' \| 'false' |
| `tree` | `aria-orientation` | 'vertical' |
| `tree` | `role` | 'tree' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `item-indicator` | `aria-hidden` | 'true' |
| `branch` | `aria-expanded` | 'true' \| 'false' |
| `branch` | `aria-label` | metaOf(node.value)?.label |
| `branch-checkbox` | `aria-hidden` | 'true' |
| `branch-trigger` | `aria-hidden` | 'true' |
| `branch-indicator` | `aria-hidden` | 'true' |
| `branch-content` | `role` | 'group' |
| `node-drag-trigger` | `aria-hidden` | 'true' |
| `live-region` | `aria-atomic` | 'true' |
| `live-region` | `aria-live` | 'polite' |
| `live-region` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/tree.css` 按部件选择：`[data-scope="tree"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-orientation` | 'vertical' |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-disabled` | ''（条件成立时才出现） |
| `tree` | `data-orientation` | 'vertical' |
| `item` | `data-draggable` | ''（条件成立时才出现） |
| `item` | `data-dragging` | ''（条件成立时才出现） |
| `item` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-control` | `data-draggable` | ''（条件成立时才出现） |
| `branch-control` | `data-dragging` | ''（条件成立时才出现） |
| `branch-control` | `data-drop` | 'before' \| 'after' \| 'inside' |
| `branch-content` | `data-orientation` | 'horizontal' \| 'vertical' |
| `node-drag-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `node-drag-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tree-bg` · `--xh-tree-border` · `--xh-tree-branch-content-gap` · `--xh-tree-branch-gap` · `--xh-tree-branch-indicator-fg` · `--xh-tree-checkbox-bg` · `--xh-tree-checkbox-bg-checked` · `--xh-tree-checkbox-border` · `--xh-tree-checkbox-border-checked` · `--xh-tree-checkbox-border-disabled` · `--xh-tree-checkbox-fg` · `--xh-tree-checkbox-radius` · `--xh-tree-checkbox-size` · `--xh-tree-drag-fg` · `--xh-tree-drag-fg-active` · `--xh-tree-drag-fg-disabled` · `--xh-tree-drag-grip-long` · `--xh-tree-drag-grip-short` · `--xh-tree-drag-radius` · `--xh-tree-drag-size` · `--xh-tree-dragging-opacity` · `--xh-tree-drop-fg` · `--xh-tree-drop-inside-bg` · `--xh-tree-drop-line` · `--xh-tree-empty-fg` · `--xh-tree-empty-font-size` · `--xh-tree-empty-px` · `--xh-tree-empty-py` · `--xh-tree-fg` · `--xh-tree-gap` · `--xh-tree-icon-size` · `--xh-tree-indent` · `--xh-tree-indicator-size` · `--xh-tree-item-indicator-fg` · `--xh-tree-label-fg` · `--xh-tree-label-font-size` · `--xh-tree-label-font-weight` · `--xh-tree-leaf-row-gap` · `--xh-tree-loading-fg` · `--xh-tree-loading-font-size` · `--xh-tree-loading-px` · `--xh-tree-loading-py` · `--xh-tree-max-h` · `--xh-tree-px` · `--xh-tree-py` · `--xh-tree-radius` · `--xh-tree-row-bg-hover` · `--xh-tree-row-fg` · `--xh-tree-row-fg-selected` · `--xh-tree-row-font-size` · `--xh-tree-row-gap` · `--xh-tree-row-leading` · `--xh-tree-row-px` · `--xh-tree-row-py` · `--xh-tree-row-radius` · `--xh-tree-row-selected-font-weight` · `--xh-tree-tree-gap`

## 动效

`background` · `box-shadow` · `color` · `rotate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 前缀放[图标](./icon)，行尾放[菜单](./menu)；放进[分栏](./splitter)的一侧。

## 最佳实践

- 大树一定要虚拟化或按需加载，一次展开全部会卡住。
- 级联勾选的策略要与后端约定一致。
- 只想让某一层横排就标 `childrenOrientation`，别开树级 `leafOrientation`：
  后者认结构，别处凑巧「子节点全是叶子」的层也会跟着横过来，还会随数据增减变来变去。

## 反模式

- 展开状态不持久：用户每次进来都要重新展开一路。
- 拖放换父没有落点提示。
