来源：https://ui.docs.xihanfun.com/components/editable

# Editable `就地编辑`

一段文本平时是只读的展示，点一下就地变成输入框。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/editable" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/editable.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/editable" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/editable" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/editable.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

预览与编辑两态轮流上场：点预览区或按「编辑」进编辑态，preview 不写内容、显示什么由组件填

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot default-value="曦寒" placeholder="未填写">
    <XhEditableLabel>昵称</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
```

```html
<xh-editable default-value="曦寒" placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">昵称</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
  </div>
</xh-editable>
```

## 示例

### 提交方式

submitMode 决定编辑态怎么收尾，不算提交的那些出口一律按撤销处理，值还回上一次提交的那个

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const blurCommitted = ref("失焦即提交");
const enterCommitted = ref("回车才提交");
</script>

<template>
  <XhEditableRoot
    default-value="失焦即提交"
    placeholder="未填写"
    submit-mode="blur"
    @value-commit="blurCommitted = $event.value"
  >
    <XhEditableLabel>submitMode = blur</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
    <span>上次提交：{{ blurCommitted || "（空）" }}</span>
  </XhEditableRoot>

  <XhEditableRoot
    default-value="回车才提交"
    placeholder="未填写"
    submit-mode="enter"
    @value-commit="enterCommitted = $event.value"
  >
    <XhEditableLabel>submitMode = enter</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
      <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
      <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
    </XhEditableControl>
    <span>上次提交：{{ enterCommitted || "（空）" }}</span>
  </XhEditableRoot>
</template>
```

```html
<xh-editable id="editable-blur" default-value="失焦即提交" placeholder="未填写" submit-mode="blur">
  <div data-xh-part="root">
    <label data-xh-part="label">submitMode = blur</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
    <span>上次提交：<span id="editable-blur-committed">失焦即提交</span></span>
  </div>
</xh-editable>

<xh-editable id="editable-enter" default-value="回车才提交" placeholder="未填写" submit-mode="enter">
  <div data-xh-part="root">
    <label data-xh-part="label">submitMode = enter</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
      <button data-xh-part="submit-trigger">保存</button>
      <button data-xh-part="cancel-trigger">取消</button>
    </div>
    <span>上次提交：<span id="editable-enter-committed">回车才提交</span></span>
  </div>
</xh-editable>

<script type="module">
  // 提交那一刻的值回显在各自那行文字里
  for (const id of ["editable-blur", "editable-enter"]) {
    const editable = document.getElementById(id);
    const readout = document.getElementById(`${id}-committed`);
    editable.addEventListener("value-commit", (event) => {
      readout.textContent = event.detail.value || "（空）";
    });
  }
</script>
```

### 受控

value 与 edit 都能受控，传了就由宿主说了算，用户交互只发出意图；外部按钮同样进得了编辑态

```vue
<script setup lang="ts">
import {
  XhEditableControl,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const signature = ref("这个人很懒");
const editing = ref(false);
</script>

<template>
  <XhEditableRoot v-model:value="signature" v-model:edit="editing" placeholder="未填写">
    <XhEditableLabel>签名</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
    </XhEditableControl>
  </XhEditableRoot>
  <span>当前：{{ signature || "（空）" }} · {{ editing ? "编辑中" : "预览中" }}</span>
  <button type="button" @click="editing = true">从外部进编辑态</button>
</template>
```

```html
<xh-editable id="editable-controlled" value="这个人很懒" edit="false" placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">签名</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
    </div>
  </div>
</xh-editable>
<span>
  当前：<span id="editable-controlled-value">这个人很懒</span> ·
  <span id="editable-controlled-state">预览中</span>
</span>
<button type="button" id="editable-controlled-open">从外部进编辑态</button>

<script type="module">
  // 两份状态都由宿主持有，组件发的事件宿主写回才算数
  const editable = document.getElementById("editable-controlled");
  const valueOut = document.getElementById("editable-controlled-value");
  const stateOut = document.getElementById("editable-controlled-state");

  function setEdit(edit) {
    editable.edit = edit;
    stateOut.textContent = edit ? "编辑中" : "预览中";
  }

  editable.addEventListener("value-change", (event) => {
    editable.value = event.detail.value;
    valueOut.textContent = event.detail.value || "（空）";
  });
  editable.addEventListener("edit-change", (event) => setEdit(event.detail.edit));
  document
    .getElementById("editable-controlled-open")
    .addEventListener("click", () => setEdit(true));
</script>
```

### 禁用与只读

两者都进不了编辑态；值为空时预览区退回压淡的占位文字

```vue
<script setup lang="ts">
import {
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhEditableRoot default-value="改不动" placeholder="未填写" disabled>
    <XhEditableLabel>禁用</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot default-value="只能看" placeholder="未填写" read-only>
    <XhEditableLabel>只读</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>

  <XhEditableRoot placeholder="未填写">
    <XhEditableLabel>空值占位</XhEditableLabel>
    <XhEditableControl>
      <XhEditablePreview />
      <XhEditableInput />
      <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
    </XhEditableControl>
  </XhEditableRoot>
</template>
```

```html
<xh-editable default-value="改不动" placeholder="未填写" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>

<xh-editable default-value="只能看" placeholder="未填写" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>

<xh-editable placeholder="未填写">
  <div data-xh-part="root">
    <label data-xh-part="label">空值占位</label>
    <div data-xh-part="control">
      <span data-xh-part="preview"></span>
      <input data-xh-part="input" />
      <button data-xh-part="edit-trigger">编辑</button>
    </div>
  </div>
</xh-editable>
```

### 表格里的单元格

一格一个就地编辑：点开就是输入框，收尾即写回行数据；autoResize 让输入框按内容宽窄走，不把列撑变形

```vue
<script setup lang="ts">
import {
  XhEditableControl,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";
import { reactive } from "vue";

const rows = reactive([
  { id: "u1", name: "赵一", dept: "平台研发", phone: "13800000001" },
  { id: "u2", name: "钱二", dept: "前端体验", phone: "13800000002" },
  { id: "u3", name: "孙三", dept: "基础架构", phone: "13800000003" },
]);

const cell = "padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)";

const head = `${cell}; text-align: start; font-weight: 500; color: var(--xh-fg-muted)`;
</script>

<template>
  <div style="width: 100%; max-width: 520px; display: grid; gap: 12px">
    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th :style="head">姓名</th>
          <th :style="head">部门</th>
          <th :style="head">手机号</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td :style="cell">
            <XhEditableRoot v-model:value="row.name" placeholder="未填写" auto-resize>
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot v-model:value="row.dept" placeholder="未填写" auto-resize>
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.phone"
              placeholder="未填写"
              :max-length="11"
              auto-resize
            >
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
        </tr>
      </tbody>
    </table>

    <span>数据源：{{ rows.map((row) => `${row.name}/${row.dept}`).join("，") }}</span>
  </div>
</template>
```

```html
<div id="editable-table" style="width: 100%; max-width: 520px; display: grid; gap: 12px">
  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          姓名
        </th>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          部门
        </th>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          手机号
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable data-row="0" data-field="name" value="赵一" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="0"
            data-field="dept"
            value="平台研发"
            placeholder="未填写"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="0"
            data-field="phone"
            value="13800000001"
            placeholder="未填写"
            max-length="11"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable data-row="1" data-field="name" value="钱二" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="1"
            data-field="dept"
            value="前端体验"
            placeholder="未填写"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="1"
            data-field="phone"
            value="13800000002"
            placeholder="未填写"
            max-length="11"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable data-row="2" data-field="name" value="孙三" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="2"
            data-field="dept"
            value="基础架构"
            placeholder="未填写"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable
            data-row="2"
            data-field="phone"
            value="13800000003"
            placeholder="未填写"
            max-length="11"
            auto-resize
          >
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
    </tbody>
  </table>

  <span>数据源：<span id="editable-table-source"></span></span>
</div>

<script type="module">
  // 每格的值受控于行数据，改一格就写回那一行
  const host = document.getElementById("editable-table");
  const readout = document.getElementById("editable-table-source");
  const rows = [
    { name: "赵一", dept: "平台研发", phone: "13800000001" },
    { name: "钱二", dept: "前端体验", phone: "13800000002" },
    { name: "孙三", dept: "基础架构", phone: "13800000003" },
  ];

  function render() {
    readout.textContent = rows.map((row) => `${row.name}/${row.dept}`).join("，");
  }

  for (const cell of host.querySelectorAll("xh-editable")) {
    cell.addEventListener("value-change", (event) => {
      rows[Number(cell.dataset.row)][cell.dataset.field] = event.detail.value;
      cell.value = event.detail.value;
      render();
    });
  }
  render();
</script>
```

### 整表进出编辑态

edit 受控就由宿主统一调度：一个开关把整张表切进编辑，放弃时宿主拿自己留的底稿还原

```vue
<script setup lang="ts">
import {
  XhButton,
  XhEditableControl,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

interface Row {
  id: string;
  name: string;
  quota: string;
}

const rows = ref<Row[]>([
  { id: "a", name: "北区", quota: "1200" },
  { id: "b", name: "南区", quota: "980" },
  { id: "c", name: "东区", quota: "1450" },
]);

const editing = ref(false);
let backup: Row[] = [];

function start() {
  backup = rows.value.map(row => ({ ...row }));
  editing.value = true;
}

function save() {
  editing.value = false;
}

function discard() {
  rows.value = backup.map(row => ({ ...row }));
  editing.value = false;
}

const cell = "padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)";

const head = `${cell}; text-align: start; font-weight: 500; color: var(--xh-fg-muted)`;
</script>

<template>
  <div style="width: 100%; max-width: 460px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <XhButton v-if="!editing" size="sm" @click="start">编辑整表</XhButton>
      <template v-else>
        <XhButton size="sm" @click="save">完成</XhButton>
        <XhButton size="sm" @click="discard">放弃</XhButton>
      </template>
    </div>

    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th :style="head">区域</th>
          <th :style="head">配额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.name"
              :edit="editing"
              placeholder="未填写"
              auto-resize
            >
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.quota"
              :edit="editing"
              placeholder="未填写"
              auto-resize
            >
              <XhEditableControl>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableControl>
            </XhEditableRoot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

```html
<div id="editable-switchable" style="width: 100%; max-width: 460px; display: grid; gap: 12px">
  <div style="display: flex; gap: 8px">
    <div id="editable-switchable-idle" style="display: flex; gap: 8px">
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-start">编辑整表</button>
      </xh-button>
    </div>
    <div id="editable-switchable-busy" style="display: none; gap: 8px">
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-save">完成</button>
      </xh-button>
      <xh-button size="sm">
        <button data-xh-part="root" id="editable-switchable-discard">放弃</button>
      </xh-button>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse">
    <thead>
      <tr>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          区域
        </th>
        <th
          style="
            padding: 6px 10px;
            border-block-end: 1px solid var(--xh-border-subtle);
            text-align: start;
            font-weight: 500;
            color: var(--xh-fg-muted);
          "
        >
          配额
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="北区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="1200" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="南区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="980" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="东区" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
        <td style="padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)">
          <xh-editable value="1450" edit="false" placeholder="未填写" auto-resize>
            <div data-xh-part="root">
              <div data-xh-part="control">
                <span data-xh-part="preview"></span>
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-editable>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<script type="module">
  // 编辑态由这一处统一切，放弃时把开工前留的底稿写回去
  const host = document.getElementById("editable-switchable");
  const idle = document.getElementById("editable-switchable-idle");
  const busy = document.getElementById("editable-switchable-busy");
  const cells = [...host.querySelectorAll("xh-editable")];
  let backup = [];

  function setEditing(editing) {
    for (const cell of cells) cell.edit = editing;
    idle.style.display = editing ? "none" : "flex";
    busy.style.display = editing ? "flex" : "none";
  }

  for (const cell of cells) {
    cell.addEventListener("value-change", (event) => {
      cell.value = event.detail.value;
    });
  }

  document.getElementById("editable-switchable-start").addEventListener("click", () => {
    backup = cells.map((cell) => cell.value);
    setEditing(true);
  });
  document
    .getElementById("editable-switchable-save")
    .addEventListener("click", () => setEditing(false));
  document.getElementById("editable-switchable-discard").addEventListener("click", () => {
    cells.forEach((cell, i) => (cell.value = backup[i]));
    setEditing(false);
  });
</script>
```

### 形态与语气

variant 换编辑态输入框的底与描边，tone 换聚焦描边与提交钮的色族；预览态不吃这两轴

```vue
<script setup lang="ts">
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <XhEditableRoot
      v-for="row in [
        { variant: 'outline', tone: 'brand', label: '描边 · 品牌' },
        { variant: 'subtle', tone: 'brand', label: '弱底 · 品牌' },
        { variant: 'ghost', tone: 'brand', label: '无壳 · 品牌' },
        { variant: 'outline', tone: 'success', label: '描边 · 成功' },
        { variant: 'outline', tone: 'danger', label: '描边 · 危险' },
      ]"
      :key="row.label"
      :variant="row.variant"
      :tone="row.tone"
      default-value="曦寒"
      placeholder="未填写"
    >
      <XhEditableLabel>{{ row.label }}</XhEditableLabel>
      <XhEditableControl>
        <XhEditablePreview />
        <XhEditableInput />
        <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
        <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
        <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
      </XhEditableControl>
    </XhEditableRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-editable variant="outline" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="subtle" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">弱底 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="ghost" tone="brand" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">无壳 · 品牌</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="outline" tone="success" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 成功</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>

  <xh-editable variant="outline" tone="danger" default-value="曦寒" placeholder="未填写">
    <div data-xh-part="root">
      <label data-xh-part="label">描边 · 危险</label>
      <div data-xh-part="control">
        <span data-xh-part="preview"></span>
        <input data-xh-part="input" />
        <button data-xh-part="edit-trigger">编辑</button>
        <button data-xh-part="submit-trigger">保存</button>
        <button data-xh-part="cancel-trigger">取消</button>
      </div>
    </div>
  </xh-editable>
</div>
```

## 设计指引

### 何时使用

- 标题、备注这类偶尔才改的单值，不值得为它单开一个表单。
- 表格单元格的快速修改。

### 何时不用

- 一次要改很多字段：打开表单或[对话框](./dialog)。
- 值需要复杂校验或多步确认。

### 特性

- `submitMode` 决定回车、失焦还是显式按钮提交。
- `activationMode` 决定单击、双击还是只能按编辑按钮进编辑态。
- 三个回调分开：提交、还原、编辑态变化。
- `autoResize` 让输入框跟着内容长。
- 形态 · 语气 · 尺寸三轴与[文本输入](./text-field)同源：形态只改编辑态那个框的底与描边，语气落在聚焦描边与提交钮上。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-editable>` |
| Vue 组件 | `XhEditableCancelTrigger` `XhEditableControl` `XhEditableEditTrigger` `XhEditableInput` `XhEditableLabel` `XhEditablePreview` `XhEditableRoot` `XhEditableSubmitTrigger` |
| 组合式函数 | `useEditable` |
| 状态机 | `editableMachine` |
| 皮肤 | `@xihan-ui/styles/editable.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="editable"`：**`root`** · `label` · `control` · **`preview`** · **`input`** · `edit-trigger` · `submit-trigger` · `cancel-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` |  | 受控值；给了就由宿主说了算，机器不自改（cell 原生受控，无影子事件）。 |
| `defaultValue` | `string` |  | 非受控初值。 |
| `edit` | `boolean` |  | 受控编辑态；给了就由宿主说了算，用户交互只发 onEditChange。 |
| `defaultEdit` | `boolean` |  | 非受控初始编辑态。为真时挂载即进编辑态并把焦点搬进输入框。 |
| `placeholder` | `string` |  | 值为空时预览区显示它，输入框也拿它当占位。 |
| `disabled` | `boolean` |  | 禁用：进不了编辑态，输入框带原生 disabled。 |
| `readOnly` | `boolean` |  | 只读：进不了编辑态，但已在编辑态时仍能退出（撤销/提交都通）。 |
| `invalid` | `boolean` |  | 校验失败标注。 |
| `maxLength` | `number` |  | 字符数上限；同时落成原生 maxlength 与机器侧截断。 |
| `name` | `string` |  | 表单字段名；给了输入框才参与提交。 |
| `submitMode` | `EditableSubmitMode` |  | 编辑态的收尾方式，默认 both。 |
| `activationMode` | `EditableActivationMode` |  | 预览区的激活方式，默认 click。 |
| `selectOnFocus` | `boolean` |  | 进编辑态时全选已有内容，默认开。关掉则光标停在原处。 |
| `autoResize` | `boolean` |  | 输入框宽度跟着内容走：连接层把字符数落成原生 size 属性。 |
| `variant` | `ControlVariant` |  | 形态：outline / subtle / ghost，决定编辑态输入框的底与描边怎么画。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定聚焦描边与提交钮用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定预览区、输入框与三颗按钮的几何档位。 |
| `onValueChange` | `(details: EditableValueChangeDetails) => void` |  | 值变化意图回调；编辑途中每次输入都发，受控时是唯一出口。 |
| `onValueCommit` | `(details: EditableValueCommitDetails) => void` |  | 提交那一刻才发；编辑途中的输入不会惊动它。 |
| `onValueRevert` | `(details: EditableValueRevertDetails) => void` |  | 撤销那一刻发（Escape、取消按钮、不算提交的离场）。 |
| `onEditChange` | `(details: EditableEditChangeDetails) => void` |  | 编辑态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `EditableValueChangeDetails` | 编辑途中的值变化；detail 为 `{ value: string }` |
| `value-commit` | `EditableValueCommitDetails` | 提交；detail 为 `{ value: string, previousValue: string }` |
| `value-revert` | `EditableValueRevertDetails` | 撤销；detail 为 `{ value: string, discardedValue: string }` |
| `edit-change` | `EditableEditChangeDetails` | 编辑态变化；detail 为 `{ edit: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhEditableRoot` | `default` | `EditableRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'edit' \| 'preview' |
| `label` | 'edit' \| 'preview' |
| `control` | 'edit' \| 'preview' |
| `preview` | 'edit' \| 'preview' |
| `input` | 'edit' \| 'preview' |
| `edit-trigger` | 'edit' \| 'preview' |
| `submit-trigger` | 'edit' \| 'preview' |
| `cancel-trigger` | 'edit' \| 'preview' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`preview` · `edit`

**事件**：`EDIT.START` · `EDIT.SUBMIT` · `EDIT.CANCEL` · `EDIT.LEAVE` · `VALUE.SET` · `CONTROLLED.EDIT` · `CONTROLLED.PREVIEW` · `FORM.RESET`

**判据**：`isEditControlled` · `canEdit` · `submitsOnLeave`

## connect API

`useEditable` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 当下的值（编辑途中就是输入框里的那串）。 |
| `committedValue` | `string` | 上一次提交的值，也是撤销的落点。 |
| `editing` | `boolean` | 正处在编辑态。 |
| `empty` | `boolean` | 值为空串。 |
| `displayValue` | `string` | 预览区当下该显示的文字：值为空时退回 placeholder。 |
| `disabled` | `boolean` |  |
| `readOnly` | `boolean` |  |
| `invalid` | `boolean` |  |
| `interactive` | `boolean` | 进得了编辑态（既没禁用也不只读）。 |
| `setValue` | `(next: string) => void` | 直接写值，只受 disabled/readOnly 与 maxLength 约束，与编辑态无关。 |
| `edit` | `() => void` | 进编辑态；禁用或只读时不动。 |
| `submit` | `() => void` | 提交当下的值并回到预览态。 |
| `cancel` | `() => void` | 撤销回上一次提交的值并回到预览态。 |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['label']` |  |
| `getPreviewProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getEditTriggerProps` | `() => T['button']` |  |
| `getSubmitTriggerProps` | `() => T['button']` |  |
| `getCancelTriggerProps` | `() => T['button']` |  |
| `getControlProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search))

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in input, submitMode 为 enter 或 both | 提交当下的值并回到预览态；其余模式不接管该键，交回给浏览器与外层表单 |
| `Escape` | focus in input | 撤销回上一次提交的值并回到预览态 |
| `Tab` / `Shift+Tab` | focus in input | 按 submitMode 收尾（blur/both 提交，enter/none 撤销）；不拦默认行为，焦点照常移出 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-labelledby` | `label` 部件的 id |
| `root` | `role` | 'group' |
| `preview` | `aria-disabled` | 'true' \| 'false' |
| `input` | `aria-invalid` | 'true' \| 'false' |
| `input` | `aria-labelledby` | `label` 部件的 id |
| `edit-trigger` | `aria-controls` | `input` 部件的 id |

## 样式

默认皮肤 `@xihan-ui/styles/editable.css` 按部件选择：`[data-scope="editable"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-empty` | ''（条件成立时才出现） |
| `root` | `data-invalid` | ''（条件成立时才出现） |
| `root` | `data-readonly` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'edit' \| 'preview' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `label` | `data-disabled` | ''（条件成立时才出现） |
| `label` | `data-state` | 'edit' \| 'preview' |
| `control` | `data-disabled` | ''（条件成立时才出现） |
| `control` | `data-invalid` | ''（条件成立时才出现） |
| `control` | `data-state` | 'edit' \| 'preview' |
| `preview` | `data-activation-mode` | props.activationMode |
| `preview` | `data-disabled` | ''（条件成立时才出现） |
| `preview` | `data-invalid` | ''（条件成立时才出现） |
| `preview` | `data-placeholder` | ''（条件成立时才出现） |
| `preview` | `data-readonly` | ''（条件成立时才出现） |
| `preview` | `data-state` | 'edit' \| 'preview' |
| `input` | `data-auto-resize` | ''（条件成立时才出现） |
| `input` | `data-disabled` | ''（条件成立时才出现） |
| `input` | `data-invalid` | ''（条件成立时才出现） |
| `input` | `data-state` | 'edit' \| 'preview' |
| `edit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `edit-trigger` | `data-state` | 'edit' \| 'preview' |
| `submit-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `submit-trigger` | `data-state` | 'edit' \| 'preview' |
| `cancel-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `cancel-trigger` | `data-state` | 'edit' \| 'preview' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-editable-control-gap` | `control` | `gap` | `default` | `--xh-space-1` | editable 的 control 部件 gap 覆盖槽。 |
| `--xh-editable-control-min-h` | `control` | `min-block-size` | `default` | `--xh-_editable-h` | editable 的 control 部件 min-block-size 覆盖槽。 |
| `--xh-editable-control-min-w` | `control` | `min-inline-size` | `default` | `6ch` | editable 的 control 部件 min-inline-size 覆盖槽。 |
| `--xh-editable-gap` | `root` | `gap` | `default` | `--xh-space-2` | editable 的 root 部件 gap 覆盖槽。 |
| `--xh-editable-input-autofill-bg` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill` | `--xh-bg-canvas` | editable 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-editable-input-autofill-fg` | `input` | `-webkit-text-fill-color` | `-webkit-autofill`<br>`autofill` | `--xh-fg-default` | editable 的 input 部件 -webkit-text-fill-color 覆盖槽。 |
| `--xh-editable-input-bg` | `input` | `background` | `default`<br>`hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_editable-input-bg` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-disabled` | `input` | `background` | `disabled` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-hover` | `input` | `background` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-bg-readonly` | `input` | `background` | `default` | `--xh-bg-subtle` | editable 的 input 部件 background 覆盖槽。 |
| `--xh-editable-input-border` | `input` | `border` | `default` | `--xh-_editable-input-border` | editable 的 input 部件 border 覆盖槽。 |
| `--xh-editable-input-border-focus` | `input` | `border-color` | `focus-visible` | `--xh-_tone` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-border-hover` | `input` | `border-color` | `hover`<br>`invalid`<br>`not(:disabled, [readonly], [data-invalid])` | `--xh-_editable-input-border-hover` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-border-invalid` | `input` | `border-color` | `invalid` | `--xh-border-invalid` | editable 的 input 部件 border-color 覆盖槽。 |
| `--xh-editable-input-fg` | `input` | `color` | `default` | `--xh-fg-default` | editable 的 input 部件 color 覆盖槽。 |
| `--xh-editable-input-font-size` | `input` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 input 部件 font-size 覆盖槽。 |
| `--xh-editable-input-h` | `input` | `block-size` | `default` | `--xh-_editable-h` | editable 的 input 部件 block-size 覆盖槽。 |
| `--xh-editable-input-px` | `input` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 input 部件 padding-inline 覆盖槽。 |
| `--xh-editable-input-radius` | `input` | `border-radius` | `default` | `--xh-shape-control` | editable 的 input 部件 border-radius 覆盖槽。 |
| `--xh-editable-input-shadow` | `input` | `box-shadow` | `-webkit-autofill`<br>`autofill`<br>`default` | `--xh-_editable-input-shadow`<br>`--xh-elevation-raised` | editable 的 input 部件 box-shadow 覆盖槽。 |
| `--xh-editable-label-fg` | `label` | `color` | `default` | `--xh-fg-default` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-fg-disabled` | `label` | `color` | `disabled` | `--xh-fg-subtle` | editable 的 label 部件 color 覆盖槽。 |
| `--xh-editable-label-font-size` | `label` | `font-size` | `default` | `--xh-_editable-label-font-size` | editable 的 label 部件 font-size 覆盖槽。 |
| `--xh-editable-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | editable 的 label 部件 font-weight 覆盖槽。 |
| `--xh-editable-placeholder-fg` | `input`<br>`preview` | `color` | `placeholder` | `--xh-fg-subtle` | editable 的 input、preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-bg-hover` | `preview` | `background` | `activation-mode=none`<br>`disabled`<br>`hover`<br>`not([data-activation-mode='none'], [data-disabled], [data-readonly])`<br>`readonly` | `--xh-bg-subtle-hover` | editable 的 preview 部件 background 覆盖槽。 |
| `--xh-editable-preview-fg` | `preview` | `color` | `default` | `--xh-fg-default` | editable 的 preview 部件 color 覆盖槽。 |
| `--xh-editable-preview-font-size` | `preview` | `font-size` | `default` | `--xh-_editable-font-size` | editable 的 preview 部件 font-size 覆盖槽。 |
| `--xh-editable-preview-min-h` | `preview` | `min-block-size` | `default` | `--xh-_editable-h` | editable 的 preview 部件 min-block-size 覆盖槽。 |
| `--xh-editable-preview-px` | `preview` | `padding-inline` | `default` | `--xh-_editable-px` | editable 的 preview 部件 padding-inline 覆盖槽。 |
| `--xh-editable-preview-radius` | `preview` | `border-radius` | `default` | `--xh-shape-control` | editable 的 preview 部件 border-radius 覆盖槽。 |
| `--xh-editable-submit-bg` | `submit-trigger` | `background` | `not(:disabled)` | `--xh-_tone` | editable 的 submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-submit-bg-active` | `submit-trigger` | `background`<br>`border-color` | `active`<br>`not(:disabled)` | `--xh-_tone-active` | editable 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-editable-submit-bg-hover` | `submit-trigger` | `background`<br>`border-color` | `hover`<br>`not(:disabled)` | `--xh-_tone-hover` | editable 的 submit-trigger 部件 background、border-color 覆盖槽。 |
| `--xh-editable-submit-border` | `submit-trigger` | `border-color` | `not(:disabled)` | `--xh-_tone` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-border-active` | `submit-trigger` | `border-color` | `active`<br>`not(:disabled)` | `--xh-editable-submit-bg-active` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-border-hover` | `submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-editable-submit-bg-hover` | editable 的 submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-submit-fg` | `submit-trigger` | `color` | `not(:disabled)` | `--xh-_tone-on` | editable 的 submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-submit-shadow` | `submit-trigger` | `box-shadow` | `not(:disabled)` | `--xh-_editable-submit-highlight` | editable 的 submit-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-editable-trigger-bg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `default` | `--xh-bg-subtle` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-active` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `disabled` | `--xh-bg-muted` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-bg-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 background 覆盖槽。 |
| `--xh-editable-trigger-border` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border` | `default` | `--xh-border-control` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border 覆盖槽。 |
| `--xh-editable-trigger-border-disabled` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-color` | `disabled` | `--xh-border-subtle` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-trigger-border-hover` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-control-hover` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-color 覆盖槽。 |
| `--xh-editable-trigger-fg` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `color` | `default` | `--xh-fg-default` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 color 覆盖槽。 |
| `--xh-editable-trigger-font-size` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `font-size` | `default` | `--xh-text-secondary-size` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 font-size 覆盖槽。 |
| `--xh-editable-trigger-h` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `block-size` | `default` | `--xh-control-h-sm` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 block-size 覆盖槽。 |
| `--xh-editable-trigger-px` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-editable-trigger-radius` | `cancel-trigger`<br>`edit-trigger`<br>`submit-trigger` | `border-radius` | `default` | `--xh-shape-control` | editable 的 cancel-trigger、edit-trigger、submit-trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`background` · `border-color` · `box-shadow` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[表格](./table)的单元格；与[表单](./form)配合做整表进出编辑态。

## 最佳实践

- 展示态要有可编辑的暗示（悬停时的底色或一枚铅笔），否则没人知道能点。
- Escape 一定要能取消，且还原成原值。

## 反模式

- 失焦即提交却没有撤销：用户点到别处就把改动落库了。
- 展示态和编辑态的行高不一样，进出编辑时整行跳动。
