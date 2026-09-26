来源：https://ui.docs.xihanfun.com/components/transfer

# Transfer 穿梭框

左右两栏，把条目从一侧移到另一侧。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/transfer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/transfer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/transfer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/transfer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/transfer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

collection 是条目全集的唯一事实源，value 只承载落在右侧的一批

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

const value = ref<string[]>(["read"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="items">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <!-- 两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden，不卸载节点 -->
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>

    <p style="margin-block-start: 12px; font-size: 13px">
      已选：{{ value.length ? value.join("、") : "（无）" }}
    </p>
  </div>
</template>
```

```html
<div id="transfer-basic" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选权限</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <!-- 两侧各挂一份全集，不属于本侧的那一份由元素打上 hidden，不卸载节点 -->
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">导出</span>
          </div>
          <div data-xh-part="item" value="audit">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">审计</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选权限</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">导出</span>
          </div>
          <div data-xh-part="item" value="audit">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">审计</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <p style="margin-block-start: 12px; font-size: 13px">
    已选：<span id="transfer-basic-value"></span>
  </p>
</div>

<script type="module">
  // 条目全集与右侧的值都是数组，只能走 property
  const stage = document.getElementById("transfer-basic");
  const transfer = stage.querySelector("xh-transfer");
  const readout = stage.querySelector("#transfer-basic-value");

  transfer.collection = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    { value: "update", label: "编辑" },
    { value: "delete", label: "删除" },
    { value: "export", label: "导出" },
    { value: "audit", label: "审计" },
  ];

  function apply(value) {
    transfer.value = value;
    readout.textContent = value.length ? value.join("、") : "（无）";
  }

  apply(["read"]);
  transfer.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="transfer"`：`root` · `hidden-input` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `group` · `group-label` · `item` · `item-text` · `item-description` · `item-suffix` · `item-checkbox` · `empty` · `loading` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

## 示例

### 搜索过滤

searchable 为每侧配一个搜索框，筛选后剩余的才参与方向键、全选与移动

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" },
  { value: "hangzhou", label: "杭州" },
  { value: "chengdu", label: "成都" },
  { value: "wuhan", label: "武汉" },
  { value: "xian", label: "西安" },
];

const value = ref<string[]>([]);

// 默认按标签大小写不敏感包含匹配，这里换成同时认拼音代号
function filter(item: { value: string; label: string }, query: string) {
  const q = query.toLowerCase();
  return item.label.includes(query) || item.value.includes(q);
}
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot
      v-model:value="value"
      :collection="items"
      :filter="filter"
      searchable
    >
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <!-- 搜索框没有可见标签，借本侧标题当可及名字，标题因此不能省 -->
          <XhTransferPanelTitle>待选城市</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索，也认 beijing" />
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选城市</XhTransferPanelTitle>
          <XhTransferPanelCount />
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索" />
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div id="transfer-search" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer searchable>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <!-- 搜索框没有可见标签，借本侧标题当可及名字，标题因此不能省 -->
          <span data-xh-part="panel-title">待选城市</span>
          <span data-xh-part="panel-count"></span>
          <button data-xh-part="select-all-trigger">全选</button>
        </div>
        <input data-xh-part="search" placeholder="搜索，也认 beijing" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">北京</span>
          </div>
          <div data-xh-part="item" value="shanghai">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">上海</span>
          </div>
          <div data-xh-part="item" value="guangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">广州</span>
          </div>
          <div data-xh-part="item" value="shenzhen">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">深圳</span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">杭州</span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">成都</span>
          </div>
          <div data-xh-part="item" value="wuhan">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">武汉</span>
          </div>
          <div data-xh-part="item" value="xian">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">西安</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选城市</span>
          <span data-xh-part="panel-count"></span>
          <button data-xh-part="select-all-trigger">全选</button>
        </div>
        <input data-xh-part="search" placeholder="搜索" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">北京</span>
          </div>
          <div data-xh-part="item" value="shanghai">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">上海</span>
          </div>
          <div data-xh-part="item" value="guangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">广州</span>
          </div>
          <div data-xh-part="item" value="shenzhen">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">深圳</span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">杭州</span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">成都</span>
          </div>
          <div data-xh-part="item" value="wuhan">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">武汉</span>
          </div>
          <div data-xh-part="item" value="xian">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">西安</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-search");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = [
    { value: "beijing", label: "北京" },
    { value: "shanghai", label: "上海" },
    { value: "guangzhou", label: "广州" },
    { value: "shenzhen", label: "深圳" },
    { value: "hangzhou", label: "杭州" },
    { value: "chengdu", label: "成都" },
    { value: "wuhan", label: "武汉" },
    { value: "xian", label: "西安" },
  ];

  // 默认按标签大小写不敏感包含匹配，这里换成同时认拼音代号
  transfer.filter = (item, query) =>
    item.label.includes(query) || item.value.includes(query.toLowerCase());

  transfer.value = [];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
  });
</script>
```

### 条目禁用

禁用写在 items 上：不可勾选也不可移动，但仍可聚焦、仍是方向键的起点

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  // 内置角色不许被挪走，禁用直接写在条目上
  { value: "owner", label: "所有者（内置）", disabled: true },
  { value: "delete", label: "删除" },
];

const value = ref<string[]>(["owner"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="items">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div id="transfer-disabled" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="owner">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">所有者（内置）</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="owner">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">所有者（内置）</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-disabled");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    // 内置角色不许被挪走，禁用直接写在条目上
    { value: "owner", label: "所有者（内置）", disabled: true },
    { value: "delete", label: "删除" },
  ];

  transfer.value = ["owner"];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
  });
</script>
```

### 单向移动

oneWay 把向回移动的路径整个封闭，右侧不再接受勾选，向回的按钮也不必编写

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "cpu", label: "CPU 用量" },
  { value: "mem", label: "内存用量" },
  { value: "disk", label: "磁盘 IO" },
  { value: "net", label: "网络吞吐" },
  { value: "qps", label: "请求量" },
];

const value = ref<string[]>([]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="items" one-way>
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>可订阅指标</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已订阅</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <!-- 右侧的勾选格由组件自己隐去：这一侧勾不了任何东西 -->
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div id="transfer-one-way" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer one-way>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">可订阅指标</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="cpu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">CPU 用量</span>
          </div>
          <div data-xh-part="item" value="mem">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">内存用量</span>
          </div>
          <div data-xh-part="item" value="disk">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">磁盘 IO</span>
          </div>
          <div data-xh-part="item" value="net">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">网络吞吐</span>
          </div>
          <div data-xh-part="item" value="qps">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">请求量</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已订阅</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <!-- 右侧的勾选格由元素自己隐去：这一侧勾不了任何东西 -->
          <div data-xh-part="item" value="cpu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">CPU 用量</span>
          </div>
          <div data-xh-part="item" value="mem">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">内存用量</span>
          </div>
          <div data-xh-part="item" value="disk">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">磁盘 IO</span>
          </div>
          <div data-xh-part="item" value="net">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">网络吞吐</span>
          </div>
          <div data-xh-part="item" value="qps">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">请求量</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-one-way");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = [
    { value: "cpu", label: "CPU 用量" },
    { value: "mem", label: "内存用量" },
    { value: "disk", label: "磁盘 IO" },
    { value: "net", label: "网络吞吐" },
    { value: "qps", label: "请求量" },
  ];

  transfer.value = [];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
  });
</script>
```

### 条目自定义内容

条目的外观归作者：勾选格与文本各就各位，前后再各加一段自己的标记

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// label 与 disabled 归组件读，其余字段是作者自己的，只用来渲染
const members = [
  { value: "lin", label: "林可", role: "前端工程师" },
  { value: "zhou", label: "周宁", role: "服务端工程师" },
  { value: "he", label: "何雨", role: "交互设计" },
  { value: "qin", label: "秦朗", role: "测试工程师" },
  { value: "xu", label: "许知", role: "产品经理" },
];

const value = ref<string[]>(["he"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 560px">
    <XhTransferRoot v-model:value="value" :collection="members">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>候选成员</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="m in members" :key="m.value" :value="m.value">
            <XhTransferItemCheckbox />
            <span
              aria-hidden="true"
              style="
                display: inline-flex;
                flex: none;
                inline-size: 24px;
                block-size: 24px;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: var(--xh-bg-subtle);
                font-size: 12px;
              "
            >
              {{ m.label.slice(0, 1) }}
            </span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <XhTransferItemText>{{ m.label }}</XhTransferItemText>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ m.role }}</span>
            </span>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>项目组</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="m in members" :key="m.value" :value="m.value">
            <XhTransferItemCheckbox />
            <span
              aria-hidden="true"
              style="
                display: inline-flex;
                flex: none;
                inline-size: 24px;
                block-size: 24px;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                background: var(--xh-bg-subtle);
                font-size: 12px;
              "
            >
              {{ m.label.slice(0, 1) }}
            </span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <XhTransferItemText>{{ m.label }}</XhTransferItemText>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">{{ m.role }}</span>
            </span>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div id="transfer-rich" style="inline-size: 100%; max-inline-size: 560px">
  <xh-transfer>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">候选成员</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="lin">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">林</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">林可</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">前端工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="zhou">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">周</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">周宁</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">服务端工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="he">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">何</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">何雨</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">交互设计</span>
            </span>
          </div>
          <div data-xh-part="item" value="qin">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">秦</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">秦朗</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">测试工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="xu">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">许</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">许知</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">产品经理</span>
            </span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">项目组</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="lin">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">林</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">林可</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">前端工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="zhou">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">周</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">周宁</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">服务端工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="he">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">何</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">何雨</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">交互设计</span>
            </span>
          </div>
          <div data-xh-part="item" value="qin">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">秦</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">秦朗</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">测试工程师</span>
            </span>
          </div>
          <div data-xh-part="item" value="xu">
            <span data-xh-part="item-checkbox"></span>
            <span aria-hidden="true" style="display: inline-flex; flex: none; inline-size: 24px; block-size: 24px; align-items: center; justify-content: center; border-radius: 999px; background: var(--xh-bg-subtle); font-size: 12px">许</span>
            <span style="display: flex; flex: 1; min-inline-size: 0; flex-direction: column">
              <span data-xh-part="item-text">许知</span>
              <span style="color: var(--xh-fg-subtle); font-size: 12px">产品经理</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  // label 与 disabled 归元素读，标记里那些头像与职位是作者自己的
  const stage = document.getElementById("transfer-rich");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = [
    { value: "lin", label: "林可" },
    { value: "zhou", label: "周宁" },
    { value: "he", label: "何雨" },
    { value: "qin", label: "秦朗" },
    { value: "xu", label: "许知" },
  ];

  transfer.value = ["he"];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
  });
</script>
```

### 列表分组

本侧当前可见的条目由组件给出，据此分组渲染；group 是 role=group 的段落壳，段标题不进入方向键也不参与移动

```vue
<script setup lang="ts">
import {
  XhTransferGroup,
  XhTransferGroupLabel,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const groups = [
  { key: "read", label: "读取" },
  { key: "write", label: "写入" },
  { key: "admin", label: "管理" },
];

const permissions = [
  { value: "list", label: "查看列表", group: "read" },
  { value: "detail", label: "查看详情", group: "read" },
  { value: "export", label: "导出数据", group: "read" },
  { value: "create", label: "新建", group: "write" },
  { value: "update", label: "编辑", group: "write" },
  { value: "remove", label: "删除", group: "write" },
  { value: "grant", label: "授权", group: "admin" },
  { value: "audit", label: "审计", group: "admin" },
];

// 面板插槽给的条目只带 value / label，分组信息回自己那份数据里查
function inGroup(
  list: readonly { value: string; label: string }[],
  group: string,
): { value: string; label: string }[] {
  return list.filter(item =>
    permissions.some(p => p.value === item.value && p.group === group),
  );
}

const value = ref<string[]>(["list"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <XhTransferRoot v-model:value="value" :collection="permissions" searchable>
      <XhTransferSourcePanel v-slot="{ items }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>可授予</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索" />
        <XhTransferList>
          <XhTransferGroup v-for="g in groups" :key="g.key" :value="g.key">
            <XhTransferGroupLabel>{{ g.label }}</XhTransferGroupLabel>
            <XhTransferItem
              v-for="item in inGroup(items, g.key)"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferGroup>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel v-slot="{ items }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已授予</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索" />
        <XhTransferList>
          <XhTransferGroup v-for="g in groups" :key="g.key" :value="g.key">
            <XhTransferGroupLabel>{{ g.label }}</XhTransferGroupLabel>
            <XhTransferItem
              v-for="item in inGroup(items, g.key)"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferGroup>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div id="transfer-grouped" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer searchable>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">可授予</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索" />
        <div data-xh-part="list"></div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已授予</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索" />
        <div data-xh-part="list"></div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-grouped");
  const transfer = stage.querySelector("xh-transfer");

  const groups = [
    { key: "read", label: "读取" },
    { key: "write", label: "写入" },
    { key: "admin", label: "管理" },
  ];

  const permissions = [
    { value: "list", label: "查看列表", group: "read" },
    { value: "detail", label: "查看详情", group: "read" },
    { value: "export", label: "导出数据", group: "read" },
    { value: "create", label: "新建", group: "write" },
    { value: "update", label: "编辑", group: "write" },
    { value: "remove", label: "删除", group: "write" },
    { value: "grant", label: "授权", group: "admin" },
    { value: "audit", label: "审计", group: "admin" },
  ];

  // 面板给的条目只带 value / label，分组信息回自己那份数据里查
  const groupOf = new Map(permissions.map((item) => [item.value, item.group]));

  transfer.collection = permissions;
  transfer.value = ["list"];

  const panels = ["source", "target"].map((side) => ({
    side,
    list: stage.querySelector(
      `[data-xh-part="${side}-panel"] [data-xh-part="list"]`,
    ),
  }));

  // 段落壳自报 value，组内标题由元素接上 aria-labelledby
  function groupNode(group, items) {
    const el = document.createElement("div");
    el.dataset.xhPart = "group";
    el.setAttribute("value", group.key);
    const label = document.createElement("span");
    label.dataset.xhPart = "group-label";
    label.textContent = group.label;
    el.append(label, ...items.map(itemNode));
    return el;
  }

  function itemNode(item) {
    const el = document.createElement("div");
    el.dataset.xhPart = "item";
    el.setAttribute("value", item.value);
    const box = document.createElement("span");
    box.dataset.xhPart = "item-checkbox";
    const text = document.createElement("span");
    text.dataset.xhPart = "item-text";
    text.textContent = item.label;
    el.append(box, text);
    return el;
  }

  // 本侧此刻看得见哪些条目由组件给：落在哪一侧、被搜索筛掉没有都在它里面算完了
  function render() {
    for (const panel of panels) {
      const shown = transfer.visibleItems(panel.side);
      const nodes = [];
      for (const group of groups) {
        const inGroup = shown.filter(
          (item) => groupOf.get(item.value) === group.key,
        );
        // 本组一条都不剩时整段跟着不出
        if (inGroup.length === 0) continue;
        nodes.push(groupNode(group, inGroup));
      }
      panel.list.replaceChildren(...nodes);
    }
  }

  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
    render();
  });
  // 搜索串住在组件里、不对外派事件；这一条挂在宿主上，跑在组件写给搜索框的处理器之后
  transfer.addEventListener("input", render);

  render();
</script>
```

### 范围选择

按住 Shift 点击某一项，选中锚点到它的一段；锚点跨到另一侧时退化为普通勾选

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

const value = ref<string[]>(["read"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 520px">
    <p style="margin-block-end: 12px; color: var(--xh-fg-muted)">
      点左侧第一项，再<strong>按住 Shift</strong> 点更下面的一项 —— 中间整段一起勾上。
      两侧是各自独立的列表，锚点跨到另一侧时退化成普通勾选。
    </p>
    <XhTransferRoot v-model:value="value" :collection="items">
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <!-- 两侧各挂一份全集，不属于本侧的那一份由组件打上 hidden，不卸载节点 -->
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>

    <p style="margin-block-start: 12px; font-size: 13px">
      已选：{{ value.length ? value.join("、") : "（无）" }}
    </p>
  </div>
</template>
```

```html
<div id="transfer-range" style="inline-size: 100%; max-inline-size: 520px">
  <p style="margin-block-end: 12px; color: var(--xh-fg-muted)">
    点左侧第一项，再<strong>按住 Shift</strong> 点更下面的一项 —— 中间整段一起勾上。
    两侧是各自独立的列表，锚点跨到另一侧时退化成普通勾选。
  </p>
  <xh-transfer>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选权限</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <!-- 两侧各挂一份全集，不属于本侧的那一份由元素打上 hidden，不卸载节点 -->
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">导出</span>
          </div>
          <div data-xh-part="item" value="audit">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">审计</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选权限</span>
          <span data-xh-part="panel-count"></span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
          <div data-xh-part="item" value="delete">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">删除</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">导出</span>
          </div>
          <div data-xh-part="item" value="audit">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">审计</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <p id="transfer-range-out" style="margin-block-start: 12px; font-size: 13px">
    已选：read
  </p>
</div>

<script type="module">
  const stage = document.getElementById("transfer-range");
  const transfer = stage.querySelector("xh-transfer");
  const out = document.getElementById("transfer-range-out");

  transfer.collection = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    { value: "update", label: "编辑" },
    { value: "delete", label: "删除" },
    { value: "export", label: "导出" },
    { value: "audit", label: "审计" },
  ];

  transfer.value = ["read"];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
    out.textContent = `已选：${event.detail.value.length ? event.detail.value.join("、") : "（无）"}`;
  });
</script>
```

### 一万条只渲染可视区

面板插槽给出的是本侧当前可见的全集，作者按滚动位置切一段挂载，上下各留一个撑高块；全选、计数与移动不读 DOM，照常管理到窗口外

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

// 行高与列表高度写死，窗口才算得出来
const ROW = 30;
const VIEW = 240;
const OVERSCAN = 6;

const listStyle
  = "--xh-transfer-list-h: 240px";

interface PanelItem {
  value: string;
  label: string;
}

const items: PanelItem[] = Array.from({ length: 10000 }, (_, i) => ({
  value: `sku-${i + 1}`,
  label: `商品 SKU-${String(i + 1).padStart(5, "0")}`,
}));

// 两侧各记一份滚动位置
const scrolled = ref<Record<string, number>>({ source: 0, target: 0 });

function onScroll(side: string, event: Event) {
  scrolled.value = {
    ...scrolled.value,
    [side]: (event.target as HTMLElement).scrollTop,
  };
}

// 该挂出来的那一段：可视区前后各多铺几条，方向键走到边上时下一条已经在 DOM 里
function range(side: string, list: PanelItem[]) {
  const max = Math.max(0, list.length * ROW - VIEW);
  const top = Math.min(scrolled.value[side] ?? 0, max);
  const start = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
  const end = Math.min(list.length, Math.ceil((top + VIEW) / ROW) + OVERSCAN);
  return { start, end };
}

function rowsOf(side: string, list: PanelItem[]): PanelItem[] {
  const { start, end } = range(side, list);
  return list.slice(start, end);
}

function padStartOf(side: string, list: PanelItem[]): number {
  return range(side, list).start * ROW;
}

function padEndOf(side: string, list: PanelItem[]): number {
  return (list.length - range(side, list).end) * ROW;
}

const value = ref<string[]>(["sku-3"]);
</script>

<template>
  <div style="inline-size: 100%; max-inline-size: 560px">
    <XhTransferRoot v-model:value="value" :collection="items" searchable>
      <XhTransferSourcePanel v-slot="{ items: shown }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>全部商品</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索编号" />
        <XhTransferList :style="listStyle" @scroll="onScroll('source', $event)">
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padStartOf('source', shown)}px` }"
          />
          <XhTransferItem
            v-for="item in rowsOf('source', shown)"
            :key="item.value"
            :value="item.value"
            :style="{ blockSize: `${ROW}px` }"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padEndOf('source', shown)}px` }"
          />
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel v-slot="{ items: shown }">
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>本次上架</XhTransferPanelTitle>
          <XhTransferSelectAllTrigger>全选</XhTransferSelectAllTrigger>
          <XhTransferPanelCount />
        </XhTransferPanelHeader>
        <XhTransferSearch placeholder="搜索编号" />
        <XhTransferList :style="listStyle" @scroll="onScroll('target', $event)">
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padStartOf('target', shown)}px` }"
          />
          <XhTransferItem
            v-for="item in rowsOf('target', shown)"
            :key="item.value"
            :value="item.value"
            :style="{ blockSize: `${ROW}px` }"
          >
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
          <div
            aria-hidden="true"
            :style="{ flex: 'none', blockSize: `${padEndOf('target', shown)}px` }"
          />
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>

    <p style="margin-block-start: 12px; font-size: 13px">
      已上架 {{ value.length }} 件
    </p>
  </div>
</template>
```

```html
<div id="transfer-long" style="inline-size: 100%; max-inline-size: 560px">
  <!-- 行高与列表高度写死，窗口才算得出来 -->
  <xh-transfer searchable style="--xh-transfer-list-h: 240px">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">全部商品</span>
          <button data-xh-part="select-all-trigger">全选</button>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索编号" />
        <div data-xh-part="list"></div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">本次上架</span>
          <button data-xh-part="select-all-trigger">全选</button>
          <span data-xh-part="panel-count"></span>
        </div>
        <input data-xh-part="search" placeholder="搜索编号" />
        <div data-xh-part="list"></div>
      </div>
    </div>
  </xh-transfer>

  <p id="transfer-long-out" style="margin-block-start: 12px; font-size: 13px">
    已上架 1 件
  </p>
</div>

<script type="module">
  // 行高与列表高度写死，窗口才算得出来
  const ROW = 30;
  const VIEW = 240;
  const OVERSCAN = 6;

  const items = Array.from({ length: 10000 }, (_, i) => ({
    value: `sku-${i + 1}`,
    label: `商品 SKU-${String(i + 1).padStart(5, "0")}`,
  }));

  const stage = document.getElementById("transfer-long");
  const transfer = stage.querySelector("xh-transfer");
  const out = document.getElementById("transfer-long-out");

  transfer.collection = items;

  let value = ["sku-3"];
  transfer.value = value;

  // 两侧各记一份滚动位置；本侧看得见哪些条目不记，每次都问组件要
  const sides = ["source", "target"].map((side) => {
    const panel = stage.querySelector(`[data-xh-part="${side}-panel"]`);
    const state = {
      side,
      list: panel.querySelector('[data-xh-part="list"]'),
      scrolled: 0,
    };
    state.list.addEventListener("scroll", () => {
      state.scrolled = state.list.scrollTop;
      render(state);
    });
    return state;
  });

  function pad(size) {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.flex = "none";
    el.style.blockSize = `${size}px`;
    return el;
  }

  function itemNode(item) {
    const el = document.createElement("div");
    el.dataset.xhPart = "item";
    el.setAttribute("value", item.value);
    el.style.blockSize = `${ROW}px`;
    el.innerHTML =
      '<span data-xh-part="item-checkbox"></span><span data-xh-part="item-text"></span>';
    el.querySelector('[data-xh-part="item-text"]').textContent = item.label;
    return el;
  }

  // 该挂出来的那一段：可视区前后各多铺几条，方向键走到边上时下一条已经在 DOM 里。
  // 本侧看得见的全集由组件给——落在哪一侧、被搜索筛掉没有都在它里面算完了
  function render(state) {
    const shown = transfer.visibleItems(state.side);
    const max = Math.max(0, shown.length * ROW - VIEW);
    const top = Math.min(state.scrolled, max);
    const start = Math.max(0, Math.floor(top / ROW) - OVERSCAN);
    const end = Math.min(shown.length, Math.ceil((top + VIEW) / ROW) + OVERSCAN);
    state.list.replaceChildren(
      pad(start * ROW),
      ...shown.slice(start, end).map(itemNode),
      pad((shown.length - end) * ROW)
    );
  }

  function renderAll() {
    for (const state of sides) render(state);
  }

  transfer.addEventListener("value-change", (event) => {
    value = event.detail.value;
    transfer.value = value;
    out.textContent = `已上架 ${value.length} 件`;
    renderAll();
  });
  // 搜索串住在组件里、不对外派事件；这一条挂在宿主上，跑在组件写给搜索框的处理器之后
  transfer.addEventListener("input", renderAll);

  renderAll();
</script>
```

### 整块换档

面板高度、表头、条目行、勾选格与移动按钮各是一个令牌，写在根上整块一起换档

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审计" },
];

// 一档尺寸就是一组令牌：两栏间距、面板高度、表头、搜索框、条目、勾选格与搬运按钮
const compact
  = "--xh-transfer-gap: 8px; --xh-transfer-list-h: 7rem; --xh-transfer-panel-header-py: 2px; --xh-transfer-panel-title-font-size: 12px; --xh-transfer-search-h: 26px; --xh-transfer-search-font-size: 12px; --xh-transfer-item-py: 1px; --xh-transfer-item-font-size: 12px; --xh-transfer-checkbox-size: 13px; --xh-transfer-checkbox-font-size: 10px; --xh-transfer-trigger-size: 22px; --xh-transfer-trigger-font-size: 12px";
const roomy
  = "--xh-transfer-gap: 20px; --xh-transfer-list-h: 14rem; --xh-transfer-panel-header-py: 10px; --xh-transfer-panel-title-font-size: 16px; --xh-transfer-search-h: 40px; --xh-transfer-search-font-size: 16px; --xh-transfer-item-py: 6px; --xh-transfer-item-font-size: 16px; --xh-transfer-checkbox-size: 20px; --xh-transfer-checkbox-font-size: 14px; --xh-transfer-trigger-size: 36px; --xh-transfer-trigger-font-size: 16px";

const tight = ref<string[]>(["read"]);
const loose = ref<string[]>(["read"]);
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 24px;
      inline-size: 100%;
      max-inline-size: 520px;
    "
  >
    <div>
      <p style="margin-block-end: 8px; font-size: 13px">紧凑</p>
      <XhTransferRoot v-model:value="tight" :collection="items" searchable :style="compact">
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
          <XhTransferList>
            <XhTransferItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferList>
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
          <XhTransferList>
            <XhTransferItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferList>
        </XhTransferTargetPanel>
      </XhTransferRoot>
    </div>

    <div>
      <p style="margin-block-end: 8px; font-size: 13px">宽松</p>
      <XhTransferRoot v-model:value="loose" :collection="items" searchable :style="roomy">
        <XhTransferSourcePanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>待选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
          <XhTransferList>
            <XhTransferItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferList>
        </XhTransferSourcePanel>

        <XhTransferToTargetTrigger />
        <XhTransferToSourceTrigger />

        <XhTransferTargetPanel>
          <XhTransferPanelHeader>
            <XhTransferPanelTitle>已选权限</XhTransferPanelTitle>
            <XhTransferPanelCount />
          </XhTransferPanelHeader>
          <XhTransferSearch placeholder="搜索" />
          <XhTransferList>
            <XhTransferItem
              v-for="item in items"
              :key="item.value"
              :value="item.value"
            >
              <XhTransferItemCheckbox />
              <XhTransferItemText>{{ item.label }}</XhTransferItemText>
            </XhTransferItem>
          </XhTransferList>
        </XhTransferTargetPanel>
      </XhTransferRoot>
    </div>
  </div>
</template>
```

```html
<div
  id="transfer-scale"
  style="
    display: flex;
    flex-direction: column;
    gap: 24px;
    inline-size: 100%;
    max-inline-size: 520px;
  "
>
  <div>
    <p style="margin-block-end: 8px; font-size: 13px">紧凑</p>
    <!-- 一档尺寸就是一组令牌：两栏间距、面板高度、表头、搜索框、条目、勾选格与搬运按钮 -->
    <xh-transfer searchable style="--xh-transfer-gap: 8px; --xh-transfer-list-h: 7rem; --xh-transfer-panel-header-py: 2px; --xh-transfer-panel-title-font-size: 12px; --xh-transfer-search-h: 26px; --xh-transfer-search-font-size: 12px; --xh-transfer-item-py: 1px; --xh-transfer-item-font-size: 12px; --xh-transfer-checkbox-size: 13px; --xh-transfer-checkbox-font-size: 10px; --xh-transfer-trigger-size: 22px; --xh-transfer-trigger-font-size: 12px">
      <div data-xh-part="root">
        <div data-xh-part="source-panel">
          <div data-xh-part="panel-header">
            <span data-xh-part="panel-title">待选权限</span>
            <span data-xh-part="panel-count"></span>
          </div>
          <input data-xh-part="search" placeholder="搜索" />
          <div data-xh-part="list">
            <div data-xh-part="item" value="read">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">查看</span>
            </div>
            <div data-xh-part="item" value="create">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="update">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">编辑</span>
            </div>
            <div data-xh-part="item" value="delete">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">删除</span>
            </div>
            <div data-xh-part="item" value="export">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">导出</span>
            </div>
            <div data-xh-part="item" value="audit">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">审计</span>
            </div>
          </div>
        </div>

        <button data-xh-part="to-target-trigger"></button>
        <button data-xh-part="to-source-trigger"></button>

        <div data-xh-part="target-panel">
          <div data-xh-part="panel-header">
            <span data-xh-part="panel-title">已选权限</span>
            <span data-xh-part="panel-count"></span>
          </div>
          <input data-xh-part="search" placeholder="搜索" />
          <div data-xh-part="list">
            <div data-xh-part="item" value="read">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">查看</span>
            </div>
            <div data-xh-part="item" value="create">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="update">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">编辑</span>
            </div>
            <div data-xh-part="item" value="delete">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">删除</span>
            </div>
            <div data-xh-part="item" value="export">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">导出</span>
            </div>
            <div data-xh-part="item" value="audit">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">审计</span>
            </div>
          </div>
        </div>
      </div>
    </xh-transfer>
  </div>

  <div>
    <p style="margin-block-end: 8px; font-size: 13px">宽松</p>
    <xh-transfer searchable style="--xh-transfer-gap: 20px; --xh-transfer-list-h: 14rem; --xh-transfer-panel-header-py: 10px; --xh-transfer-panel-title-font-size: 16px; --xh-transfer-search-h: 40px; --xh-transfer-search-font-size: 16px; --xh-transfer-item-py: 6px; --xh-transfer-item-font-size: 16px; --xh-transfer-checkbox-size: 20px; --xh-transfer-checkbox-font-size: 14px; --xh-transfer-trigger-size: 36px; --xh-transfer-trigger-font-size: 16px">
      <div data-xh-part="root">
        <div data-xh-part="source-panel">
          <div data-xh-part="panel-header">
            <span data-xh-part="panel-title">待选权限</span>
            <span data-xh-part="panel-count"></span>
          </div>
          <input data-xh-part="search" placeholder="搜索" />
          <div data-xh-part="list">
            <div data-xh-part="item" value="read">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">查看</span>
            </div>
            <div data-xh-part="item" value="create">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="update">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">编辑</span>
            </div>
            <div data-xh-part="item" value="delete">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">删除</span>
            </div>
            <div data-xh-part="item" value="export">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">导出</span>
            </div>
            <div data-xh-part="item" value="audit">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">审计</span>
            </div>
          </div>
        </div>

        <button data-xh-part="to-target-trigger"></button>
        <button data-xh-part="to-source-trigger"></button>

        <div data-xh-part="target-panel">
          <div data-xh-part="panel-header">
            <span data-xh-part="panel-title">已选权限</span>
            <span data-xh-part="panel-count"></span>
          </div>
          <input data-xh-part="search" placeholder="搜索" />
          <div data-xh-part="list">
            <div data-xh-part="item" value="read">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">查看</span>
            </div>
            <div data-xh-part="item" value="create">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="update">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">编辑</span>
            </div>
            <div data-xh-part="item" value="delete">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">删除</span>
            </div>
            <div data-xh-part="item" value="export">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">导出</span>
            </div>
            <div data-xh-part="item" value="audit">
              <span data-xh-part="item-checkbox"></span>
              <span data-xh-part="item-text">审计</span>
            </div>
          </div>
        </div>
      </div>
    </xh-transfer>
  </div>
</div>

<script type="module">
  // 两块换的只是令牌，条目全集与值两边各自一份
  const items = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    { value: "update", label: "编辑" },
    { value: "delete", label: "删除" },
    { value: "export", label: "导出" },
    { value: "audit", label: "审计" },
  ];

  const stage = document.getElementById("transfer-scale");
  for (const transfer of stage.querySelectorAll("xh-transfer")) {
    transfer.collection = items;
    transfer.value = ["read"];
    transfer.addEventListener("value-change", (event) => {
      transfer.value = event.detail.value;
    });
  }
</script>
```

### 语气与尺寸

tone 更换勾选标记的色族，size 更换条目行与勾选格的几何档；两轴写在根上，两侧面板一起变化

```vue
<script setup lang="ts">
import {
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "read", label: "查看" },
  { value: "create", label: "新建" },
  { value: "update", label: "编辑" },
];

const rows = [
  { tone: "success", size: "md", label: "success" },
  { tone: "danger", size: "md", label: "danger" },
  { tone: "brand", size: "sm", label: "sm" },
  { tone: "brand", size: "lg", label: "lg" },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 520px">
    <XhTransferRoot
      v-for="row in rows"
      :key="row.label"
      :collection="items"
      :default-value="['read']"
      :tone="row.tone"
      :size="row.size"
    >
      <XhTransferSourcePanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>待选 · {{ row.label }}</XhTransferPanelTitle>
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="item in items" :key="item.value" :value="item.value">
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferSourcePanel>

      <XhTransferToTargetTrigger />
      <XhTransferToSourceTrigger />

      <XhTransferTargetPanel>
        <XhTransferPanelHeader>
          <XhTransferPanelTitle>已选</XhTransferPanelTitle>
        </XhTransferPanelHeader>
        <XhTransferList>
          <XhTransferItem v-for="item in items" :key="item.value" :value="item.value">
            <XhTransferItemCheckbox />
            <XhTransferItemText>{{ item.label }}</XhTransferItemText>
          </XhTransferItem>
        </XhTransferList>
      </XhTransferTargetPanel>
    </XhTransferRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 520px">
  <xh-transfer class="transfer-axes" tone="success" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · success</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" tone="danger" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · danger</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" size="sm" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · sm</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" size="lg" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · lg</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  // 条目全集是数组，只走 property：四份共用同一份
  const collection = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    { value: "update", label: "编辑" },
  ];
  for (const transfer of document.querySelectorAll(".transfer-axes")) transfer.collection = collection;
</script>
```

## 设计指引

### 何时使用

- 从一份候选中选出一个子集，且用户需要同时看到未选与已选。
- 已选项的顺序或数量需要一目了然（分配权限、选人）。

### 何时不用

- 候选很少时，使用[复选框组](./checkbox-group)。
- 只需要选中不需要对照时，使用[选择器](./select)的多选。

### 特性

- 两栏都可搜索，`filter` 可自定义匹配规则。
- 勾中的条目铺品牌淡底行面并由行首的方框标记，与表格选中行同一副外观；两侧定高列表挂自绘滚动条。
- `oneWay` 单向移动：只能移向目标，不可退回。
- 条目可逐条声明语气，搬到另一侧仍带着自己的那一份。
- 条目可写副文本，第 2 行放一句解释，搬到另一侧一并带着。
- 条目行尾留一格给作者（计数、徽标）；行首那一格归勾选框。
- 万级条目时只渲染可视区。
- 每一侧的空（`empty`）与在途（`loading`）各有部件；`loading` 为真时两侧列表报 `aria-busy`，空态让位。
- 设置 `name` 后，目标侧每个值以一个同名原生字段提交；源侧勾选 `selection` 不参与提交。三端自动装配隐藏出口，无需手写节点。
- 值内逗号保留原样，使用 `new FormData(form).getAll(name)` 读取数组；目标为空时没有该字段，显式选中的空字符串则是一个有效字段值。
- `form` 可指定同一文档或影子树内的原生表单 ID；指定无效 ID 时不关联其他表单。整体 `disabled` 不提交，只读和禁用条目已经存在的目标值仍提交。
- 原生 `form.reset()` 恢复 `defaultValue` 与 `defaultSelection`，清理搜索与导航状态。受控值没有声明默认值时保持业务数据；声明默认值时只通知重置意图，由业务回写受控值。

### 组合

- 内层是[列表框](./listbox)；长列表配[虚拟滚动](./virtualizer)。

### 最佳实践

- 两栏都显示计数，用户才知道剩余数量。
- 候选很大时把搜索做成远端过滤，不把全量数据载入前端。

### 反模式

- 在窄屏上使用：两栏加中间的按钮列放不下。
- 移动后不保留滚动位置，用户每移动一条都要重新定位。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-transfer>` |
| Vue 组件 | `XhTransferEmpty` `XhTransferGroup` `XhTransferGroupLabel` `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemDescription` `XhTransferItemSuffix` `XhTransferItemText` `XhTransferList` `XhTransferLoading` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| 组合式函数 | `useTransfer` |
| 状态机 | `transferMachine` |
| 皮肤 | `@xihan-ui/styles/transfer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TransferItem[]` |  | 条目全集，元信息的唯一事实源。默认为空。 |
| `value` | `string[]` |  | 落在 target 侧的值。提供即受控：cell 直读 prop，写入只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `name` | `string` |  | 原生表单字段名；目标侧每个值提交一个同名字段。 |
| `form` | `string` |  | 原生表单 ID；显式指定时覆盖祖先表单归属。 |
| `selection` | `string[]` |  | 两侧合计被勾选的值（用于移动）。提供即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `searchable` | `boolean` |  | 每侧带一个搜索框；关闭时搜索框仍在 DOM 中但带 hidden，且搜索串一律按空处理。 |
| `filter` | `TransferFilter` |  | 自定义匹配规则；默认为标签大小写不敏感包含。 |
| `disabled` | `boolean` |  | 整个控件禁用：条目为 aria-disabled，三个按钮与搜索框使用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：两侧照常浏览与搜索，但勾选不可修改、也不可移动。禁用还额外移除键盘入口。 |
| `invalid` | `boolean` |  | 校验失败：两侧列表报告 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 条目加载中：两侧列表报告 aria-busy，显示在途占位、隐藏空态占位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目与勾选格的几何档位。 |
| `oneWay` | `boolean` |  | 只能向右不能向回：向回移动的路径整体关闭，target 侧也不再接受勾选。 |
| `loop` | `boolean` |  | 列表内方向键到达末尾是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；决定列表内哪个横向方向键是移向对面。 |
| `translations` | `Partial<TransferTranslations>` |  |  |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |  |

### TransferItem

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 |  |
| `label` | `string` | 是 | 展示名，也是搜索过滤的取字来源。 |
| `disabled` | `boolean` |  | 条目禁用：不可勾选、也不可移动，但它仍可聚焦、仍是方向键的起点。 |
| `tone` | `Tone` |  | 该条自身的性质：已失效的写 danger、需要留意的写 warning。不写即与其余条目同档。 只换字色与悬停 / 按下的面，不表达勾选与校验；勾选的标记与禁用都压过它。 两侧面板读同一份数据，条目搬到哪一侧都带着自己的语气。 |
| `description` | `string` |  | 副文本，写入 item-description 部件；未提供时本条不铺该部件。 它是第 2 行的说明，跟着条目走 muted 档，不跟语气；放不下一行的解释才用它， 一句话能说清的写进 label。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TransferValueChangeDetails` | 落在右侧的值变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TransferSelectionChangeDetails` | 勾选集合变化；detail 为 `{ value: string[] }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTransferRoot` | `default` | `TransferRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTransferGroup` | `value` | `string` | 是 |  |
| `XhTransferItem` | `value` | `string` | 是 |  |
| `XhTransferRoot` | `children` | `SlotChildren<TransferRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'checked' \| 'unchecked' |
| `item-text` | 'checked' \| 'unchecked' |
| `item-description` | 'checked' \| 'unchecked' |
| `item-suffix` | 'checked' \| 'unchecked' |
| `item-checkbox` | 'checked' \| 'unchecked' |
| `select-all-trigger` | checkStates[panel.side] |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`FORM.RESET` · `VALUE.SET` · `SELECTION.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `ITEM.FOCUS` · `LIST.BLUR` · `PRESS.START` · `PRESS.END`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TransferItem[]` | 条目全集（作者提供的数据，原样透出）。 |
| `value` | `string[]` | 落在 target 侧的值。 |
| `selection` | `string[]` | 两侧合计被勾选的值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `oneWay` | `boolean` |  |
| `searchable` | `boolean` |  |
| `visibleItems` | `(side: TransferSide) => readonly TransferItem[]` | 某一侧当前可见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 |
| `checkedValues` | `(side: TransferSide) => string[]` | 某一侧当前实际勾选的值（只计可见且未禁用的条目，与三态、移动同一口径）。 |
| `checkState` | `(side: TransferSide) => TransferCheckState` |  |
| `query` | `(side: TransferSide) => string` |  |
| `canMove` | `(to: TransferSide) => boolean` | 向 to 侧移动当前是否可行：对面有勾选的可操作条目，且该路径未被 oneWay 关闭。 |
| `isChecked` | `(value: string) => boolean` |  |
| `sideOf` | `(value: string) => TransferSide` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `setQuery` | `(side: TransferSide, query: string) => void` |  |
| `toggle` | `(value: string, options?: { extend?: boolean }) => void` | 切换某一项的勾选。extend 为真时选中锚点到该项的范围（同侧才成立）。 |
| `toggleAll` | `(side: TransferSide) => void` |  |
| `move` | `(to: TransferSide) => void` | 程序化移动；焦点安排不在这里处理，那需要知道触发的节点。 |
| `getRootProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单个目标值的原生出口；适配器按 value 数组逐项渲染，空集合不提交字段。 |
| `getPanelProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelHeaderProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelTitleProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelCountProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSearchProps` | `(props: TransferPanelProps) => T['input']` |  |
| `getListProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `(props: TransferPanelProps) => T['button']` |  |
| `getEmptyProps` | `(props: TransferPanelProps) => T['element']` | 空态占位：放在面板中、list 的兄弟；本侧没有任何可见条目时显示，其余时候带 hidden。 |
| `getLoadingProps` | `(props: TransferPanelProps) => T['element']` | 在途占位：与空态占位同一位置，两者不同时显示：加载期间显示它，空态让位。 |
| `getGroupProps` | `(props: TransferGroupProps) => T['element']` | 分组容器：role=group，条目挂在其中；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: TransferGroupProps) => T['element']` | 分组标题：不是选项、不进入导航，只作为本组的可及名。 |
| `getItemProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemDescriptionProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemSuffixProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TransferItemProps) => T['element']` |  |
| `getToTargetTriggerProps` | `() => T['button']` |  |
| `getToSourceTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | held on 条目 / 全选格 / 搬运按钮, 未禁用、未只读、未加载且部件自身可用 | 按住期间条目、全选格或搬运按钮投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下，搬完后按钮失去可搬的条目时由机器撤下。勾选与搬运语义照旧由这一次按键承担 |
| `Tab` / `Shift+Tab` | focus outside a list | 每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列 |
| `ArrowDown` | focus in a list | 焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去 |
| `ArrowUp` | focus in a list | 焦点移到本侧上一个可停留条目 |
| `Home` | focus in a list | 焦点移到本侧首个可停留条目 |
| `End` | focus in a list | 焦点移到本侧末个可停留条目 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 本侧可勾选 | 切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in a list, 本侧可勾选 | 焦点移到相邻条目并切换它的勾选态；反向移动即取消刚扩展进来的条目 |
| `Ctrl+A` / `Cmd+A` | focus in a list, 本侧可勾选 | 勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消 |
| `ArrowRight` / `ArrowLeft` | focus in a list, 该方向指向对面且可以移动 | 把本侧勾选的条目移动到对面（dir=rtl 时左右语义对调）；移动完成后焦点落到目标侧的列表上。方向指向本侧、或当前无法移动时该键放行给页面 |
| `Enter` / `Space` | focus on to-target-trigger / to-source-trigger | 把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上 |
| `Enter` / `Space` | focus on select-all-trigger | 全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `search` | `aria-controls` | listId[panel.side] |
| `search` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-disabled` | 'true' \| 'false' |
| `list` | `aria-invalid` | 'true' \| 'false' |
| `list` | `aria-labelledby` | titleId[panel.side] |
| `list` | `aria-multiselectable` | 'true' \| 'false' |
| `list` | `aria-readonly` | 'true' \| 'false' |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'true' \| 'false' |
| `item` | `role` | 'option' |
| `item-checkbox` | `aria-hidden` | 'true' |
| `to-target-trigger` | `aria-controls` | listId.target |
| `to-target-trigger` | `aria-label` | label.toTarget |
| `to-source-trigger` | `aria-controls` | listId.source |
| `to-source-trigger` | `aria-label` | label.toSource |
| `select-all-trigger` | `aria-checked` | 'true' \| 'mixed' \| 'false' |
| `select-all-trigger` | `aria-controls` | listId[panel.side] |
| `select-all-trigger` | `role` | 'checkbox' |

## 样式参考

### 皮肤

`@xihan-ui/styles/transfer.css` 使用 `[data-scope="transfer"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-loading` | ''（条件成立时才出现） |
| `root` | `data-one-way` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `panel-header` | `data-disabled` | ''（条件成立时才出现） |
| `panel-header` | `data-side` | panel.side |
| `panel-title` | `data-side` | panel.side |
| `panel-count` | `data-checked-count` | String(checked[panel.side].length) |
| `panel-count` | `data-count` | String(visible[panel.side].length) |
| `panel-count` | `data-side` | panel.side |
| `search` | `data-side` | panel.side |
| `list` | `data-disabled` | ''（条件成立时才出现） |
| `list` | `data-invalid` | ''（条件成立时才出现） |
| `list` | `data-readonly` | ''（条件成立时才出现） |
| `list` | `data-side` | panel.side |
| `group` | `data-disabled` | ''（条件成立时才出现） |
| `group` | `data-side` | group.side |
| `group-label` | `data-disabled` | ''（条件成立时才出现） |
| `group-label` | `data-side` | group.side |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-highlighted` | ''（条件成立时才出现） |
| `item` | `data-pressed` | ''（条件成立时才出现） |
| `item` | `data-side` | item.side |
| `item` | `data-state` | 'checked' \| 'unchecked' |
| `item` | `data-tone` | index.get(v)?.tone |
| `item` | `data-xh-collection-context` | 'page' |
| `item` | `data-xh-collection-item` | '' |
| `item` | `data-xh-collection-size` | props.size |
| `item-text` | `data-disabled` | ''（条件成立时才出现） |
| `item-text` | `data-highlighted` | ''（条件成立时才出现） |
| `item-text` | `data-side` | item.side |
| `item-text` | `data-state` | 'checked' \| 'unchecked' |
| `item-text` | `data-xh-collection-slot` | 'text' |
| `item-description` | `data-disabled` | ''（条件成立时才出现） |
| `item-description` | `data-highlighted` | ''（条件成立时才出现） |
| `item-description` | `data-side` | item.side |
| `item-description` | `data-state` | 'checked' \| 'unchecked' |
| `item-description` | `data-xh-collection-slot` | 'description' |
| `item-suffix` | `data-disabled` | ''（条件成立时才出现） |
| `item-suffix` | `data-highlighted` | ''（条件成立时才出现） |
| `item-suffix` | `data-side` | item.side |
| `item-suffix` | `data-state` | 'checked' \| 'unchecked' |
| `item-suffix` | `data-xh-collection-slot` | 'suffix' |
| `item-checkbox` | `data-disabled` | ''（条件成立时才出现） |
| `item-checkbox` | `data-highlighted` | ''（条件成立时才出现） |
| `item-checkbox` | `data-side` | item.side |
| `item-checkbox` | `data-state` | 'checked' \| 'unchecked' |
| `item-checkbox` | `data-xh-collection-slot` | 'prefix' |
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-side` | panel.side |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-side` | panel.side |
| `to-target-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-target-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `to-target-trigger` | `data-xh-action-control` | '' |
| `to-target-trigger` | `data-xh-action-display` | 'always' |
| `to-target-trigger` | `data-xh-action-profile` | 'icon' |
| `to-target-trigger` | `data-xh-action-size` | 'sm' |
| `to-target-trigger` | `data-xh-action-variant` | 'outline' |
| `to-source-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-xh-action-control` | '' |
| `to-source-trigger` | `data-xh-action-display` | 'always' |
| `to-source-trigger` | `data-xh-action-profile` | 'icon' |
| `to-source-trigger` | `data-xh-action-size` | 'sm' |
| `to-source-trigger` | `data-xh-action-variant` | 'outline' |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-side` | panel.side |
| `select-all-trigger` | `data-state` | checkStates[panel.side] |
| `select-all-trigger` | `data-xh-action-control` | '' |
| `select-all-trigger` | `data-xh-action-display` | 'always' |
| `select-all-trigger` | `data-xh-action-profile` | 'text' |
| `select-all-trigger` | `data-xh-action-size` | 'xs' |
| `select-all-trigger` | `data-xh-action-variant` | 'ghost' |
| `panel` | `data-disabled` | ''（条件成立时才出现） |
| `panel` | `data-side` | panel.side |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-transfer-checkbox-bg` | `item-checkbox`<br>`select-all-trigger` | `background` | `default` | `transparent` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-checked` | `item-checkbox`<br>`select-all-trigger` | `background` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-disabled` | `item-checkbox` | `background` | `disabled` | `--xh-bg-muted` | transfer 的 item-checkbox 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-border` | `item-checkbox`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | transfer 的 item-checkbox、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-transfer-checkbox-border-checked` | `item-checkbox`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-border-disabled` | `item-checkbox` | `border-color` | `disabled` | `--xh-border-default` | transfer 的 item-checkbox 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-fg` | `item-checkbox`<br>`select-all-trigger` | `background-color`<br>`color` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-on-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background-color、color 覆盖槽。 |
| `--xh-transfer-checkbox-font-size` | `item-checkbox`<br>`select-all-trigger` | `font-size` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-checkbox-radius` | `item-checkbox`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | transfer 的 item-checkbox、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-checkbox-size` | `item-checkbox`<br>`select-all-trigger` | `--xh-icon-size`<br>`block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 --xh-icon-size、block-size、inline-size、margin-inline-start 覆盖槽。 |
| `--xh-transfer-empty-fg` | `empty` | `color` | `default` | `--xh-fg-subtle` | transfer 的 empty 部件 color 覆盖槽。 |
| `--xh-transfer-empty-font-size` | `empty` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 empty 部件 font-size 覆盖槽。 |
| `--xh-transfer-empty-px` | `empty` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 empty 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-empty-py` | `empty` | `padding-block` | `default` | `--xh-space-3` | transfer 的 empty 部件 padding-block 覆盖槽。 |
| `--xh-transfer-fg` | `root` | `color` | `default` | `--xh-fg-default` | transfer 的 root 部件 color 覆盖槽。 |
| `--xh-transfer-gap` | `root` | `gap` | `default` | `--xh-space-3` | transfer 的 root 部件 gap 覆盖槽。 |
| `--xh-transfer-group-gap` | `group` | `gap` | `default` | `--xh-list-option-gap` | transfer 的 group 部件 gap 覆盖槽。 |
| `--xh-transfer-group-label-fg` | `group-label` | `color` | `default` | `--xh-fg-subtle` | transfer 的 group-label 部件 color 覆盖槽。 |
| `--xh-transfer-group-label-font-size` | `group-label` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 group-label 部件 font-size 覆盖槽。 |
| `--xh-transfer-group-label-font-weight` | `group-label` | `font-weight` | `default` | `--xh-font-weight-medium` | transfer 的 group-label 部件 font-weight 覆盖槽。 |
| `--xh-transfer-group-label-px` | `group-label` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 group-label 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-group-label-py` | `group-label` | `padding-block` | `default` | `--xh-space-1` | transfer 的 group-label 部件 padding-block 覆盖槽。 |
| `--xh-transfer-group-spacing` | `group` | `margin-block-start` | `default` | `--xh-space-1_5` | transfer 的 group 部件 margin-block-start 覆盖槽。 |
| `--xh-transfer-icon-size` | `item`<br>`root`<br>`to-source-trigger`<br>`to-target-trigger` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-_action-profile-glyph-size`<br>`--xh-_collection-glyph-size`<br>`--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | transfer 的 item、root、to-source-trigger、to-target-trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-transfer-item-bg-hover` | `item` | `background-color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])` | `--xh-bg-subtle` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-bg-pressed` | `item` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-bg-subtle-hover` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-bg-selected` | `item` | `background-color` | `disabled`<br>`error`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`selected`<br>`xh-collection-context=page` | `--xh-bg-brand-subtle` | transfer 的 item 部件 background-color 覆盖槽。 |
| `--xh-transfer-item-fg` | `item` | `color` | `default`<br>`disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed` | `--xh-fg-default` | transfer 的 item 部件 color 覆盖槽。 |
| `--xh-transfer-item-fg-selected` | `item` | `color` | `disabled`<br>`error`<br>`highlighted`<br>`hover`<br>`is(:active, [data-pressed])`<br>`is(:focus-visible, [data-highlighted])`<br>`is([aria-selected='true'], [data-selected])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`selected`<br>`xh-collection-context=page` | `--xh-fg-on-brand-subtle` | transfer 的 item 部件 color 覆盖槽。 |
| `--xh-transfer-item-font-size` | `item` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 item 部件 font-size 覆盖槽。 |
| `--xh-transfer-item-gap` | `item` | `gap` | `default` | `--xh-_transfer-gap` | transfer 的 item 部件 gap 覆盖槽。 |
| `--xh-transfer-item-leading` | `item` | `line-height` | `default` | `--xh-leading-normal` | transfer 的 item 部件 line-height 覆盖槽。 |
| `--xh-transfer-item-px` | `item` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-item-py` | `item` | `padding-block` | `default` | `--xh-_transfer-item-py` | transfer 的 item 部件 padding-block 覆盖槽。 |
| `--xh-transfer-item-radius` | `item` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 item 部件 border-radius 覆盖槽。 |
| `--xh-transfer-list-gap` | `list` | `gap` | `default` | `--xh-list-option-gap` | transfer 的 list 部件 gap 覆盖槽。 |
| `--xh-transfer-list-h` | `list` | `block-size` | `default` | `--xh-viewport-h-md` | transfer 的 list 部件 block-size 覆盖槽。 |
| `--xh-transfer-list-px` | `list` | `padding-inline` | `default` | `--xh-space-1` | transfer 的 list 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-list-py` | `list` | `padding-block` | `default` | `--xh-space-1` | transfer 的 list 部件 padding-block 覆盖槽。 |
| `--xh-transfer-loading-fg` | `loading` | `color` | `default` | `--xh-fg-subtle` | transfer 的 loading 部件 color 覆盖槽。 |
| `--xh-transfer-loading-font-size` | `loading` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 loading 部件 font-size 覆盖槽。 |
| `--xh-transfer-loading-px` | `loading` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 loading 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-loading-py` | `loading` | `padding-block` | `default` | `--xh-space-3` | transfer 的 loading 部件 padding-block 覆盖槽。 |
| `--xh-transfer-panel-bg` | `source-panel`<br>`target-panel` | `background` | `default` | `--xh-bg-surface` | transfer 的 source-panel、target-panel 部件 background 覆盖槽。 |
| `--xh-transfer-panel-bg-disabled` | `source-panel`<br>`target-panel` | `background` | `disabled` | `--xh-bg-muted` | transfer 的 source-panel、target-panel 部件 background 覆盖槽。 |
| `--xh-transfer-panel-border` | `panel-header`<br>`source-panel`<br>`target-panel` | `border`<br>`border-block-end` | `default` | `--xh-border-default` | transfer 的 panel-header、source-panel、target-panel 部件 border、border-block-end 覆盖槽。 |
| `--xh-transfer-panel-border-invalid` | `root`<br>`source-panel`<br>`target-panel` | `border-color` | `invalid`<br>`is([data-scope='transfer'][data-part='source-panel'], [data-scope='transfer'][data-part='target-panel'])` | `--xh-border-invalid` | transfer 的 root、source-panel、target-panel 部件 border-color 覆盖槽。 |
| `--xh-transfer-panel-count-fg` | `panel-count` | `color` | `default` | `--xh-fg-subtle` | transfer 的 panel-count 部件 color 覆盖槽。 |
| `--xh-transfer-panel-count-font-size` | `panel-count` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 panel-count 部件 font-size 覆盖槽。 |
| `--xh-transfer-panel-header-gap` | `panel-header` | `gap` | `default` | `--xh-_transfer-gap` | transfer 的 panel-header 部件 gap 覆盖槽。 |
| `--xh-transfer-panel-header-px` | `panel-header` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 panel-header 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-panel-header-py` | `panel-header` | `padding-block` | `default` | `--xh-space-2` | transfer 的 panel-header 部件 padding-block 覆盖槽。 |
| `--xh-transfer-panel-radius` | `source-panel`<br>`target-panel` | `border-radius` | `default` | `--xh-shape-surface` | transfer 的 source-panel、target-panel 部件 border-radius 覆盖槽。 |
| `--xh-transfer-panel-title-fg` | `panel-title` | `color` | `default` | `--xh-fg-default` | transfer 的 panel-title 部件 color 覆盖槽。 |
| `--xh-transfer-panel-title-font-size` | `panel-title` | `font-size` | `default` | `--xh-text-label-size` | transfer 的 panel-title 部件 font-size 覆盖槽。 |
| `--xh-transfer-panel-title-font-weight` | `panel-title` | `font-weight` | `default` | `--xh-font-weight-semibold` | transfer 的 panel-title 部件 font-weight 覆盖槽。 |
| `--xh-transfer-search-bg` | `search` | `background` | `default` | `transparent` | transfer 的 search 部件 background 覆盖槽。 |
| `--xh-transfer-search-border` | `search` | `border-block-end` | `default` | `--xh-border-control` | transfer 的 search 部件 border-block-end 覆盖槽。 |
| `--xh-transfer-search-fg` | `search` | `color` | `default` | `--xh-fg-default` | transfer 的 search 部件 color 覆盖槽。 |
| `--xh-transfer-search-font-size` | `search` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 search 部件 font-size 覆盖槽。 |
| `--xh-transfer-search-h` | `search` | `block-size` | `default` | `--xh-control-h-sm` | transfer 的 search 部件 block-size 覆盖槽。 |
| `--xh-transfer-search-px` | `search` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 search 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-select-all-bg-hover` | `select-all-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | transfer 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-select-all-bg-pressed` | `select-all-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | transfer 的 select-all-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-select-all-fg` | `select-all-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-muted` | transfer 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-select-all-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-select-all-gap` | `select-all-trigger` | `gap` | `default` | `--xh-control-gap-sm` | transfer 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-transfer-select-all-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | transfer 的 select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-bg` | `to-source-trigger`<br>`to-target-trigger` | `--xh-ink-surface`<br>`background-color` | `default`<br>`xh-ink-surface` | `--xh-_action-variant-bg-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 --xh-ink-surface、background-color 覆盖槽。 |
| `--xh-transfer-trigger-bg-active` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | transfer 的 to-source-trigger、to-target-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-trigger-bg-hover` | `to-source-trigger`<br>`to-target-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | transfer 的 to-source-trigger、to-target-trigger 部件 background-color 覆盖槽。 |
| `--xh-transfer-trigger-border` | `to-source-trigger`<br>`to-target-trigger` | `border`<br>`border-color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed`<br>`--xh-_action-variant-border-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-transfer-trigger-fg` | `to-source-trigger`<br>`to-target-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | transfer 的 to-source-trigger、to-target-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-trigger-font-size` | `to-source-trigger`<br>`to-target-trigger` | `font-size` | `default` | `--xh-text-label-size` | transfer 的 to-source-trigger、to-target-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-trigger-px` | `to-source-trigger`<br>`to-target-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | transfer 的 to-source-trigger、to-target-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-trigger-radius` | `to-source-trigger`<br>`to-target-trigger` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 to-source-trigger、to-target-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-shadow-active` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `none` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-shadow-hover` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `none` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-size` | `to-source-trigger`<br>`to-target-trigger` | `block-size`<br>`inline-size`<br>`min-inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | transfer 的 to-source-trigger、to-target-trigger 部件 block-size、inline-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

`background-color` · `border-color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 640px`。

皮肤另按输入能力分档：`pointer: coarse`：同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
