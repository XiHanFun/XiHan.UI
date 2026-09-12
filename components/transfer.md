来源：https://ui.docs.xihanfun.com/components/transfer

# Transfer `穿梭框`

左右两栏，把条目从一边搬到另一边。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/transfer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/transfer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/transfer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/transfer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/transfer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

collection 是条目全集的唯一事实源，value 只装落在右侧的那批

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

## 示例

### 搜索过滤

searchable 给每侧配一个搜索框，筛剩下的才参与方向键、全选与搬运

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

禁用写在 items 上：勾不动也搬不动，但仍可聚焦、仍是方向键的起点

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

### 单向搬运

oneWay 把往回搬那条路整个封死，右侧不再接受勾选，往回的按钮也就不必写

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

条目里长什么样归作者：勾选格与文本各就各位，前后再各加一段自己的标记

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

本侧此刻看得见的条目由组件给出，据此分组渲染；group 是 role=group 的段落壳，段标题不入方向键也不入搬运

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

### 一万条只渲可视区

面板插槽给的是本侧此刻看得见的全集，作者按滚动位置切一段挂出来，上下各留一个撑高块；全选、计数与搬运不读 DOM，照样管到窗口外

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

### 范围选

按住 Shift 点某一项，选中锚点到它那一段；锚点跨到另一侧时退化成普通勾选

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

### 整块换档

面板高度、表头、条目行、勾选格与搬运按钮各是一个令牌，写在根上整块一起换档

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

tone 换勾选标记的色族，size 换条目行与勾选格的几何档；两轴打在根上，两侧面板一起走

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

- 从一份候选里挑出一个子集，且用户需要同时看见"没选的"和"已选的"。
- 已选项的顺序或数量需要一目了然（分配权限、选人）。

### 何时不用

- 候选很少：用[复选框组](./checkbox-group)。
- 只需要选中不需要对照：用[选择器](./select)的多选。

### 特性

- 两栏都可搜索，`filter` 可自定义匹配规则。
- `oneWay` 单向搬运：只能往目标搬，搬完不再退回。
- 一万条时只渲可视区。
- 每一侧的空（`empty`）与在途（`loading`）各有部件；`loading` 为真时两侧列表报 `aria-busy`，空态让位。
- 设置 `name` 后，目标侧每个值以一个同名原生字段提交；源侧勾选 `selection` 不参与提交。三端自动装配隐藏出口，无需手写节点。
- 值内逗号保留原样，使用 `new FormData(form).getAll(name)` 读取数组；目标为空时没有该字段，显式选中的空字符串则是一个有效字段值。
- `form` 可指定同一文档或影子树内的原生表单 ID；指定无效 ID 时不关联其他表单。整体 `disabled` 不提交，只读和禁用条目已经存在的目标值仍提交。
- 原生 `form.reset()` 恢复 `defaultValue` 与 `defaultSelection`，清理搜索与导航状态。受控值没有声明默认值时保持业务数据；声明默认值时只通知重置意图，由业务回写受控值。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-transfer>` |
| Vue 组件 | `XhTransferEmpty` `XhTransferGroup` `XhTransferGroupLabel` `XhTransferItem` `XhTransferItemCheckbox` `XhTransferItemText` `XhTransferList` `XhTransferLoading` `XhTransferPanelCount` `XhTransferPanelHeader` `XhTransferPanelTitle` `XhTransferRoot` `XhTransferSearch` `XhTransferSelectAllTrigger` `XhTransferSourcePanel` `XhTransferTargetPanel` `XhTransferToSourceTrigger` `XhTransferToTargetTrigger` |
| 组合式函数 | `useTransfer` |
| 状态机 | `transferMachine` |
| 皮肤 | `@xihan-ui/styles/transfer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="transfer"`：`root` · `hidden-input` · **`source-panel`** · **`target-panel`** · `panel-header` · `panel-title` · `panel-count` · `search` · **`list`** · `group` · `group-label` · `item` · `item-text` · `item-checkbox` · `empty` · `loading` · **`to-target-trigger`** · `to-source-trigger` · `select-all-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `TransferItem[]` |  | 条目全集，元信息的唯一事实源。缺省为空。 |
| `value` | `string[]` |  | 落在 target 侧的值。给定即受控：cell 直读 prop，写只发 onValueChange 不落内部值。 |
| `defaultValue` | `string[]` |  |  |
| `name` | `string` |  | 原生表单字段名；目标侧每个值提交一个同名字段。 |
| `form` | `string` |  | 原生表单 ID；显式指定时覆盖祖先表单归属。 |
| `selection` | `string[]` |  | 两侧合起来被勾中的值（用于搬运）。给定即受控，语义同上。 |
| `defaultSelection` | `string[]` |  |  |
| `searchable` | `boolean` |  | 每侧带一个搜索框；关掉时搜索框仍在 DOM 里但带 hidden，且搜索串一律按空处理。 |
| `filter` | `TransferFilter` |  | 自定义匹配规则；缺省是标签大小写不敏感包含。 |
| `disabled` | `boolean` |  | 整个控件禁用：条目转 aria-disabled，三个按钮与搜索框用原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：两侧照常浏览与搜索，但勾选改不动、也搬不动。禁用还额外收走键盘入口。 |
| `invalid` | `boolean` |  | 校验失败：两侧列表报 aria-invalid，各角色节点带 data-invalid。 |
| `loading` | `boolean` |  | 条目还在取：两侧列表报 aria-busy，在途占位顶上来、空态占位让位。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定勾选标记用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定条目与勾选格的几何档位。 |
| `oneWay` | `boolean` |  | 只能往右不能往回：往回搬那条路整个封死，target 侧也不再接受勾选。 |
| `loop` | `boolean` |  | 列表内方向键走到尽头是否回绕，默认 true。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；决定列表内哪个横向方向键是"搬向对面"。 |
| `translations` | `Partial<TransferTranslations>` |  |  |
| `onValueChange` | `(details: TransferValueChangeDetails) => void` |  |  |
| `onSelectionChange` | `(details: TransferSelectionChangeDetails) => void` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `TransferValueChangeDetails` | 落在右侧的值变化；detail 为 `{ value: string[] }` |
| `selection-change` | `TransferSelectionChangeDetails` | 勾选集合变化；detail 为 `{ value: string[] }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTransferRoot` | `default` | `TransferRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `select-all-trigger` | checkStates[panel.side] |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle`

**事件**：`FORM.RESET` · `VALUE.SET` · `SELECTION.SET` · `ITEM.TOGGLE` · `SIDE.TOGGLE_ALL` · `ITEMS.MOVE` · `SEARCH.SET` · `ITEM.FOCUS` · `LIST.BLUR`

## connect API

`useTransfer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly TransferItem[]` | 条目全集（作者给的那份，原样透出）。 |
| `value` | `string[]` | 落在 target 侧的值。 |
| `selection` | `string[]` | 两侧合起来被勾中的值。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `oneWay` | `boolean` |  |
| `searchable` | `boolean` |  |
| `visibleItems` | `(side: TransferSide) => readonly TransferItem[]` | 某一侧当下看得见的条目（分侧 + 搜索之后），顺序恒为 collection 原序。 |
| `checkedValues` | `(side: TransferSide) => string[]` | 某一侧此刻真正勾中的值（只算可见且未禁用的那些，与三态、搬运同一口径）。 |
| `checkState` | `(side: TransferSide) => TransferCheckState` |  |
| `query` | `(side: TransferSide) => string` |  |
| `canMove` | `(to: TransferSide) => boolean` | 往 to 侧搬此刻可不可行：对面有勾中的可操作条目，且这条路没被 oneWay 封死。 |
| `isChecked` | `(value: string) => boolean` |  |
| `sideOf` | `(value: string) => TransferSide` |  |
| `setValue` | `(next: string[]) => void` |  |
| `setSelection` | `(next: string[]) => void` |  |
| `setQuery` | `(side: TransferSide, query: string) => void` |  |
| `toggle` | `(value: string, options?: { extend?: boolean }) => void` | 切换某一项的勾选。extend 为真时选中锚点到这一项那一段（同侧才成立）。 |
| `toggleAll` | `(side: TransferSide) => void` |  |
| `move` | `(to: TransferSide) => void` | 程序化搬运；焦点安排不在这里做，那要知道是哪个节点触发的。 |
| `getRootProps` | `() => T['element']` |  |
| `getHiddenInputProps` | `(props: { value: string }) => T['input']` | 单个目标值的原生出口；适配器按 value 数组逐项渲染，空集合不提交字段。 |
| `getPanelProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelHeaderProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelTitleProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getPanelCountProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSearchProps` | `(props: TransferPanelProps) => T['input']` |  |
| `getListProps` | `(props: TransferPanelProps) => T['element']` |  |
| `getSelectAllTriggerProps` | `(props: TransferPanelProps) => T['button']` |  |
| `getEmptyProps` | `(props: TransferPanelProps) => T['element']` | 空态占位：放在面板里、list 的兄弟；本侧一条可见条目都没有时露面，其余时候带 hidden。 |
| `getLoadingProps` | `(props: TransferPanelProps) => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏——取数期间它顶上来，空态让位。 |
| `getGroupProps` | `(props: TransferGroupProps) => T['element']` | 分组容器：role=group，条目挂在它里面；分组标题经 aria-labelledby 关联。 |
| `getGroupLabelProps` | `(props: TransferGroupProps) => T['element']` | 分组标题：不是选项、不进导航，只作为本组的可及名字。 |
| `getItemProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: TransferItemProps) => T['element']` |  |
| `getItemCheckboxProps` | `(props: TransferItemProps) => T['element']` |  |
| `getToTargetTriggerProps` | `() => T['button']` |  |
| `getToSourceTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | focus outside a list | 每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列 |
| `ArrowDown` | focus in a list | 焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去 |
| `ArrowUp` | focus in a list | 焦点移到本侧上一个可停留条目 |
| `Home` | focus in a list | 焦点移到本侧首个可停留条目 |
| `End` | focus in a list | 焦点移到本侧末个可停留条目 |
| `Space` / `Enter` / `Ctrl+Space` | focus on item, 本侧可勾选 | 切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认 |
| `Shift+ArrowDown` / `Shift+ArrowUp` | focus in a list, 本侧可勾选 | 焦点移到相邻条目并切换它的勾选态；往回走即把刚扩进来的那个摘掉 |
| `Ctrl+A` / `Cmd+A` | focus in a list, 本侧可勾选 | 勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消 |
| `ArrowRight` / `ArrowLeft` | focus in a list, 该方向指向对面且对面搬得动 | 把本侧勾中的条目搬到对面（dir=rtl 时左右语义对调）；搬完焦点落到目的地那一侧的列表上。方向指向本侧、或此刻搬不动时这个键放行给页面 |
| `Enter` / `Space` | focus on to-target-trigger / to-source-trigger | 把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上 |
| `Enter` / `Space` | focus on select-all-trigger | 全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/transfer.css` 按部件选择：`[data-scope="transfer"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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
| `empty` | `data-disabled` | ''（条件成立时才出现） |
| `empty` | `data-side` | panel.side |
| `loading` | `data-disabled` | ''（条件成立时才出现） |
| `loading` | `data-side` | panel.side |
| `to-target-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `to-source-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `select-all-trigger` | `data-side` | panel.side |
| `select-all-trigger` | `data-state` | checkStates[panel.side] |
| `panel` | `data-disabled` | ''（条件成立时才出现） |
| `panel` | `data-side` | panel.side |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-transfer-checkbox-bg` | `item-checkbox`<br>`select-all-trigger` | `background` | `default` | `--xh-bg-canvas` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-checked` | `item-checkbox`<br>`select-all-trigger` | `background` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-bg-disabled` | `item-checkbox` | `background` | `disabled` | `--xh-bg-muted` | transfer 的 item-checkbox 部件 background 覆盖槽。 |
| `--xh-transfer-checkbox-border` | `item-checkbox`<br>`select-all-trigger` | `border` | `default` | `--xh-border-control` | transfer 的 item-checkbox、select-all-trigger 部件 border 覆盖槽。 |
| `--xh-transfer-checkbox-border-checked` | `item-checkbox`<br>`select-all-trigger` | `border-color` | `is([data-state='checked'], [data-state='indeterminate'])`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-accent` | transfer 的 item-checkbox、select-all-trigger 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-border-disabled` | `item-checkbox` | `border-color` | `disabled` | `--xh-border-subtle` | transfer 的 item-checkbox 部件 border-color 覆盖槽。 |
| `--xh-transfer-checkbox-fg` | `item-checkbox`<br>`select-all-trigger` | `background-color`<br>`color` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-on-accent` | transfer 的 item-checkbox、select-all-trigger 部件 background-color、color 覆盖槽。 |
| `--xh-transfer-checkbox-font-size` | `item-checkbox`<br>`select-all-trigger` | `font-size` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-checkbox-radius` | `item-checkbox`<br>`select-all-trigger` | `border-radius` | `default` | `--xh-shape-inset` | transfer 的 item-checkbox、select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-checkbox-size` | `item-checkbox`<br>`select-all-trigger` | `block-size`<br>`inline-size`<br>`margin-inline-start` | `default`<br>`state=checked`<br>`state=indeterminate` | `--xh-_transfer-box` | transfer 的 item-checkbox、select-all-trigger 部件 block-size、inline-size、margin-inline-start 覆盖槽。 |
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
| `--xh-transfer-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | transfer 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-transfer-item-bg-hover` | `item` | `background` | `disabled`<br>`highlighted`<br>`is(:hover, [data-highlighted])`<br>`not([data-disabled])` | `--xh-bg-subtle` | transfer 的 item 部件 background 覆盖槽。 |
| `--xh-transfer-item-fg` | `item` | `color` | `default` | `--xh-fg-default` | transfer 的 item 部件 color 覆盖槽。 |
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
| `--xh-transfer-panel-title-font-weight` | `panel-title` | `font-weight` | `default` | `--xh-text-label-weight` | transfer 的 panel-title 部件 font-weight 覆盖槽。 |
| `--xh-transfer-search-bg` | `search` | `background` | `default` | `transparent` | transfer 的 search 部件 background 覆盖槽。 |
| `--xh-transfer-search-border` | `search` | `border-block-end` | `default` | `--xh-border-control` | transfer 的 search 部件 border-block-end 覆盖槽。 |
| `--xh-transfer-search-fg` | `search` | `color` | `default` | `--xh-fg-default` | transfer 的 search 部件 color 覆盖槽。 |
| `--xh-transfer-search-font-size` | `search` | `font-size` | `default` | `--xh-_transfer-font-size` | transfer 的 search 部件 font-size 覆盖槽。 |
| `--xh-transfer-search-h` | `search` | `block-size` | `default` | `--xh-control-h-sm` | transfer 的 search 部件 block-size 覆盖槽。 |
| `--xh-transfer-search-px` | `search` | `padding-inline` | `default` | `--xh-_transfer-px` | transfer 的 search 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-select-all-fg` | `select-all-trigger` | `color` | `default` | `--xh-fg-muted` | transfer 的 select-all-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-select-all-font-size` | `select-all-trigger` | `font-size` | `default` | `--xh-text-caption-size` | transfer 的 select-all-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-select-all-gap` | `select-all-trigger` | `gap` | `default` | `--xh-control-gap-sm` | transfer 的 select-all-trigger 部件 gap 覆盖槽。 |
| `--xh-transfer-select-all-radius` | `select-all-trigger` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 select-all-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-bg` | `to-source-trigger`<br>`to-target-trigger` | `background` | `default` | `--xh-bg-subtle` | transfer 的 to-source-trigger、to-target-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-trigger-bg-active` | `to-source-trigger`<br>`to-target-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | transfer 的 to-source-trigger、to-target-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-trigger-bg-hover` | `to-source-trigger`<br>`to-target-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | transfer 的 to-source-trigger、to-target-trigger 部件 background 覆盖槽。 |
| `--xh-transfer-trigger-border` | `to-source-trigger`<br>`to-target-trigger` | `border` | `default` | `--xh-border-default` | transfer 的 to-source-trigger、to-target-trigger 部件 border 覆盖槽。 |
| `--xh-transfer-trigger-fg` | `to-source-trigger`<br>`to-target-trigger` | `color` | `default` | `--xh-fg-default` | transfer 的 to-source-trigger、to-target-trigger 部件 color 覆盖槽。 |
| `--xh-transfer-trigger-font-size` | `to-source-trigger`<br>`to-target-trigger` | `font-size` | `default` | `--xh-text-label-size` | transfer 的 to-source-trigger、to-target-trigger 部件 font-size 覆盖槽。 |
| `--xh-transfer-trigger-px` | `to-source-trigger`<br>`to-target-trigger` | `padding-inline` | `default` | `--xh-space-2` | transfer 的 to-source-trigger、to-target-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-transfer-trigger-radius` | `to-source-trigger`<br>`to-target-trigger` | `border-radius` | `default` | `--xh-shape-control` | transfer 的 to-source-trigger、to-target-trigger 部件 border-radius 覆盖槽。 |
| `--xh-transfer-trigger-shadow-active` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `active`<br>`not(:disabled)` | `none` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-shadow-hover` | `to-source-trigger`<br>`to-target-trigger` | `box-shadow` | `hover`<br>`not(:disabled)` | `--xh-elevation-raised` | transfer 的 to-source-trigger、to-target-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-transfer-trigger-size` | `to-source-trigger`<br>`to-target-trigger` | `block-size`<br>`min-inline-size` | `default` | `--xh-control-h-sm` | transfer 的 to-source-trigger、to-target-trigger 部件 block-size、min-inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤按视口分档：`min-width: 640px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 内层是[列表框](./listbox)；长列表配[虚拟滚动](./virtualizer)。

## 最佳实践

- 两栏都显示计数，用户才知道还剩多少没挑。
- 候选很大时把搜索做成远端过滤，别把全量灌进前端。

## 反模式

- 在窄屏上用它：两栏加中间的按钮列放不下。
- 搬运后不保留滚动位置，用户每搬一条都要重新找位置。
