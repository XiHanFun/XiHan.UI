来源：https://ui.docs.xihanfun.com/components/command

# 命令面板 `command`

一块盖在页面上的检索面板：打字筛出命令，方向键选，回车执行。

## 何时使用

- 功能散在很多层菜单里，用户知道要做什么却找不到入口。
- 需要一条跨页面的统一入口：搜页面、搜设置、搜数据、跑动作，都从这里进。
- 熟手要靠键盘一路走完：唤起、打字、回车，全程不碰鼠标。

## 何时不用

- 只是从一份清单里选一个值填进表单：用[组合框](./combobox)或[选择器](./select)。
- 只是右键菜单或按钮菜单：用[上下文菜单](./context-menu)或[菜单](./menu)。
- 面板里要放表单、要分步骤：那是[对话框](./dialog)。

## 特性

- 内置过滤：清单交进来，按检索串逐词筛、按 `group` 归组，空组自动丢掉。`keywords` 让一条命令同时认英文名、拼音与旧称。
- 过滤可以关掉（`filter` 置否），改由调用方自己筛——远端检索走这一档。
- 面板是模态浮层：陷焦点、锁滚动、背景失活，Escape 与点击遮罩收起，收起后焦点还给触发按钮。
- 焦点全程在检索框，锚点经 `aria-activedescendant` 报给读屏；打字后锚点自动钉回首条。
- 两种非条目相位各有部件：空（`empty`）与在途（`loading`）。取数期间在途占位顶上来，空态让位，两者不同屏。
- `closeOnSelect` 决定选中后收不收；连着执行多条命令时关掉它。

## 示例

### 基础用法

交一份命令清单，过滤、归组与空态都由组件包办

```vue
<script setup lang="ts">
import type { CommandNode, CommandSelectDetails } from "@xihan-ui/headless";
import { XhCommandRoot } from "@xihan-ui/vue";
import { ref } from "vue";

// keywords 让一条命令同时认英文名与旧称：打 export 也能搜到「导出报表」
const commands: CommandNode[] = [
  { value: "users", label: "用户管理", group: "nav", keywords: ["users"] },
  { value: "roles", label: "角色管理", group: "nav", keywords: ["roles"] },
  { value: "profile", label: "个人资料", group: "nav" },
  { value: "export", label: "导出报表", group: "action", keywords: ["export"] },
  { value: "invite", label: "邀请成员", group: "action" },
  { value: "archive", label: "归档项目", group: "action", disabled: true },
];

const groups = [
  { value: "nav", label: "页面" },
  { value: "action", label: "动作" },
];

const last = ref("还没执行过命令");

function run(details: CommandSelectDetails) {
  last.value = `执行了：${details.label}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhCommandRoot
      :collection="commands"
      :groups="groups"
      placeholder="搜命令…"
      empty="没有匹配的命令"
      @select="run"
    >
      <template #trigger>打开命令面板</template>
      <template #footer>↑↓ 选择 · ↵ 执行 · Esc 关闭</template>
    </XhCommandRoot>
    <span>{{ last }}</span>
  </div>
</template>
```

```html
<xh-command
  id="command-basic"
  placeholder="搜命令…"
>
  <button data-xh-part="trigger">打开命令面板</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <input data-xh-part="input" />
      <div data-xh-part="list">
        <div data-xh-part="group" value="nav">
          <span data-xh-part="group-label">页面</span>
          <div data-xh-part="item" value="users">
            <span data-xh-part="item-text">用户管理</span>
          </div>
          <div data-xh-part="item" value="roles">
            <span data-xh-part="item-text">角色管理</span>
          </div>
          <div data-xh-part="item" value="profile">
            <span data-xh-part="item-text">个人资料</span>
          </div>
        </div>
        <div data-xh-part="group" value="action">
          <span data-xh-part="group-label">动作</span>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-text">导出报表</span>
          </div>
          <div data-xh-part="item" value="invite">
            <span data-xh-part="item-text">邀请成员</span>
          </div>
          <div data-xh-part="item" value="archive">
            <span data-xh-part="item-text">归档项目</span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的命令</div>
      <div data-xh-part="loading">正在取命令…</div>
      <footer data-xh-part="footer">↑↓ 选择 · ↵ 执行 · Esc 关闭</footer>
    </div>
  </div>
</xh-command>
<p id="command-basic-readout">还没执行过命令</p>

<script type="module">
  // 命令清单只走 property：过滤、归组与禁用都以它为准，
  // 标记里那几个条目节点只报 value，露不露面由元素打的 hidden 说了算
  const host = document.getElementById("command-basic");
  host.collection = [
    { value: "users", label: "用户管理", group: "nav", keywords: ["users"] },
    { value: "roles", label: "角色管理", group: "nav", keywords: ["roles"] },
    { value: "profile", label: "个人资料", group: "nav" },
    { value: "export", label: "导出报表", group: "action", keywords: ["export"] },
    { value: "invite", label: "邀请成员", group: "action" },
    { value: "archive", label: "归档项目", group: "action", disabled: true },
  ];
  host.groups = [
    { value: "nav", label: "页面" },
    { value: "action", label: "动作" },
  ];

  const readout = document.getElementById("command-basic-readout");
  host.addEventListener("select", (event) => {
    readout.textContent = `执行了：${event.detail.label}`;
  });
</script>
```

### 快捷键唤起 + 手写部件

Mod+K 打开，命中的字由文本高亮标出来，行尾挂各命令自己的快捷键

```vue
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import {
  XhCommandContent,
  XhCommandEmpty,
  XhCommandFooter,
  XhCommandGroup,
  XhCommandGroupLabel,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandRoot,
  XhHighlight,
  XhHotkeys,
} from "@xihan-ui/vue";
import { ref } from "vue";

const open = ref(false);

// 行尾那一串是这条命令自己的快捷键，与全局绑定同一套写法
const commands: (CommandNode & { hotkey?: string[] })[] = [
  { value: "new", label: "新建文档", group: "file", hotkey: ["Mod", "N"] },
  { value: "save", label: "保存", group: "file", hotkey: ["Mod", "S"] },
  { value: "search", label: "全局搜索", group: "file", keywords: ["search"] },
  { value: "theme", label: "切换主题", group: "view" },
  { value: "zen", label: "专注模式", group: "view" },
];

const groups = [
  { value: "file", label: "文件" },
  { value: "view", label: "视图" },
];
</script>

<template>
  <!-- 唤起的入口：监听装在整篇文档上，面板收着也按得出来 -->
  <div style="display: flex; align-items: center; gap: 8px">
    <XhHotkeys :keys="['Mod', 'K']" @hot-key="open = true" />
    <span>按一下唤起命令面板</span>
  </div>

  <!-- 写了默认插槽即整套手写：铺开的那一份让位，行为一模一样 -->
  <XhCommandRoot
    v-model:open="open"
    :collection="commands"
    :groups="groups"
    placeholder="搜命令…"
  >
    <template #default="{ inputValue }">
      <XhCommandContent>
        <XhCommandInput />
        <XhCommandList>
          <XhCommandGroup v-for="group in groups" :key="group.value" :value="group.value">
            <XhCommandGroupLabel>{{ group.label }}</XhCommandGroupLabel>
            <!-- 铺的是整份清单，不是筛出来的那几条：此刻露不露面由组件打的 hidden 说了算 -->
            <template v-for="command in commands" :key="command.value">
              <XhCommandItem v-if="command.group === group.value" :value="command.value">
                <XhCommandItemText>
                  <!-- 检索串就是高亮的关键词，用户看得见这条为什么被选出来 -->
                  <XhHighlight :text="command.label!" :keyword="inputValue" />
                </XhCommandItemText>
                <XhHotkeys v-if="command.hotkey" :keys="command.hotkey" :enabled="false" size="sm" />
              </XhCommandItem>
            </template>
          </XhCommandGroup>
        </XhCommandList>
        <XhCommandEmpty>没有匹配的命令</XhCommandEmpty>
        <XhCommandFooter>↑↓ 选择 · ↵ 执行 · Esc 关闭</XhCommandFooter>
      </XhCommandContent>
    </template>
  </XhCommandRoot>
</template>
```

```html
<!-- 唤起的入口：监听装在整篇文档上，面板收着也按得出来 -->
<div style="display: flex; align-items: center; gap: 8px">
  <xh-hotkeys id="command-hotkey-trigger" keys="Mod,K">
    <span data-xh-part="root"></span>
  </xh-hotkeys>
  <span>按一下唤起命令面板</span>
</div>

<xh-command id="command-hotkey" placeholder="搜命令…">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <input data-xh-part="input" />
      <div data-xh-part="list">
        <div data-xh-part="group" value="file">
          <span data-xh-part="group-label">文件</span>
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">
              <xh-highlight text="新建文档"><span data-xh-part="root"></span></xh-highlight>
            </span>
            <xh-hotkeys keys="Mod,N" enabled="false" size="sm">
              <span data-xh-part="root"></span>
            </xh-hotkeys>
          </div>
          <div data-xh-part="item" value="save">
            <span data-xh-part="item-text">
              <xh-highlight text="保存"><span data-xh-part="root"></span></xh-highlight>
            </span>
            <xh-hotkeys keys="Mod,S" enabled="false" size="sm">
              <span data-xh-part="root"></span>
            </xh-hotkeys>
          </div>
          <div data-xh-part="item" value="search">
            <span data-xh-part="item-text">
              <xh-highlight text="全局搜索"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
        </div>
        <div data-xh-part="group" value="view">
          <span data-xh-part="group-label">视图</span>
          <div data-xh-part="item" value="theme">
            <span data-xh-part="item-text">
              <xh-highlight text="切换主题"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
          <div data-xh-part="item" value="zen">
            <span data-xh-part="item-text">
              <xh-highlight text="专注模式"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的命令</div>
      <footer data-xh-part="footer">↑↓ 选择 · ↵ 执行 · Esc 关闭</footer>
    </div>
  </div>
</xh-command>

<script type="module">
  const host = document.getElementById("command-hotkey");
  host.collection = [
    { value: "new", label: "新建文档", group: "file" },
    { value: "save", label: "保存", group: "file" },
    { value: "search", label: "全局搜索", group: "file", keywords: ["search"] },
    { value: "theme", label: "切换主题", group: "view" },
    { value: "zen", label: "专注模式", group: "view" },
  ];
  host.groups = [
    { value: "file", label: "文件" },
    { value: "view", label: "视图" },
  ];

  // 组合命中即打开：面板收着的时候监听照样在整篇文档上
  document
    .getElementById("command-hotkey-trigger")
    .addEventListener("hot-key", () => host.setOpen(true));

  // 检索串就是高亮的关键词，用户看得见这条为什么被选出来
  const marks = host.querySelectorAll("xh-highlight");
  host.addEventListener("input-value-change", (event) => {
    for (const mark of marks) mark.keyword = event.detail.inputValue;
  });
</script>
```

### 遮罩形态

variant 只落在 backdrop 那一层：opaque 压一层底、blur 糊掉背后、transparent 只挡点击

```vue
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import { XhCommandRoot } from "@xihan-ui/vue";

const commands: CommandNode[] = [
  { value: "users", label: "用户管理" },
  { value: "roles", label: "角色管理" },
  { value: "export", label: "导出报表" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhCommandRoot
      v-for="variant in ['opaque', 'blur', 'transparent']"
      :key="variant"
      :variant="variant"
      :collection="commands"
      placeholder="搜命令…"
      empty="没有匹配的命令"
    >
      <template #trigger>{{ variant }} 遮罩</template>
    </XhCommandRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-command class="command-variant" variant="opaque" placeholder="搜命令…">
    <button data-xh-part="trigger">opaque 遮罩</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="users">
            <span data-xh-part="item-text">用户管理</span>
          </div>
          <div data-xh-part="item" value="roles">
            <span data-xh-part="item-text">角色管理</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-text">导出报表</span>
          </div>
        </div>
        <div data-xh-part="empty">没有匹配的命令</div>
      </div>
    </div>
  </xh-command>

  <xh-command class="command-variant" variant="blur" placeholder="搜命令…">
    <button data-xh-part="trigger">blur 遮罩</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="users">
            <span data-xh-part="item-text">用户管理</span>
          </div>
          <div data-xh-part="item" value="roles">
            <span data-xh-part="item-text">角色管理</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-text">导出报表</span>
          </div>
        </div>
        <div data-xh-part="empty">没有匹配的命令</div>
      </div>
    </div>
  </xh-command>

  <xh-command class="command-variant" variant="transparent" placeholder="搜命令…">
    <button data-xh-part="trigger">transparent 遮罩</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="users">
            <span data-xh-part="item-text">用户管理</span>
          </div>
          <div data-xh-part="item" value="roles">
            <span data-xh-part="item-text">角色管理</span>
          </div>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-text">导出报表</span>
          </div>
        </div>
        <div data-xh-part="empty">没有匹配的命令</div>
      </div>
    </div>
  </xh-command>
</div>

<script type="module">
  // 命令清单只走 property：三档遮罩共用同一份
  const commands = [
    { value: "users", label: "用户管理" },
    { value: "roles", label: "角色管理" },
    { value: "export", label: "导出报表" },
  ];
  for (const host of document.querySelectorAll(".command-variant")) host.collection = commands;
</script>
```

### 远程检索

filter 关掉：交进来的 collection 就是此刻该显示的那几条，筛选归服务端；取数期间 loading 让在途占位顶上来、列表压暗一档，空态让位

```vue
<script setup lang="ts">
import type { CommandNode } from "@xihan-ui/headless";
import {
  XhCommandContent,
  XhCommandEmpty,
  XhCommandFooter,
  XhCommandInput,
  XhCommandItem,
  XhCommandItemText,
  XhCommandList,
  XhCommandLoading,
  XhCommandRoot,
  XhCommandTrigger,
} from "@xihan-ui/vue";
import { onBeforeUnmount, ref, watch } from "vue";

// 站在服务端那一头的整份名册，示例里用一次延迟冒充网络
const roster = [
  { value: "zhangsan", label: "张三 · 平台组" },
  { value: "lisi", label: "李四 · 平台组" },
  { value: "wangwu", label: "王五 · 交易组" },
  { value: "zhaoliu", label: "赵六 · 交易组" },
  { value: "sunqi", label: "孙七 · 风控组" },
];

const open = ref(false);
const query = ref("");
const loading = ref(false);
const results = ref<CommandNode[]>(roster.slice(0, 3));
const picked = ref("还没选过人");

let timer = 0;
// 回来的顺序不保证与发出的顺序一致，只认最后一次请求的结果
let latest = 0;

watch(query, (keyword) => {
  window.clearTimeout(timer);
  loading.value = true;
  const seq = ++latest;
  timer = window.setTimeout(() => {
    if (seq !== latest) {
      return;
    }
    const text = keyword.trim();
    results.value = text ? roster.filter(one => one.label.includes(text)) : roster.slice(0, 3);
    loading.value = false;
  }, 400);
});

onBeforeUnmount(() => window.clearTimeout(timer));

function onSelect(details: { label: string }) {
  picked.value = `选了：${details.label}`;
}
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhCommandRoot
      v-model:open="open"
      v-model:input-value="query"
      :collection="results"
      :filter="false"
      :loading="loading"
      placeholder="搜同事…"
      @select="onSelect"
    >
      <template #default>
        <XhCommandTrigger>找一个人</XhCommandTrigger>
        <XhCommandContent>
          <XhCommandInput />
          <!-- 交进来的就是该显示的那几条，这里照单铺开 -->
          <XhCommandList>
            <XhCommandItem v-for="one in results" :key="one.value" :value="one.value">
              <XhCommandItemText>{{ one.label }}</XhCommandItemText>
            </XhCommandItem>
          </XhCommandList>
          <XhCommandEmpty>名册里没有这个人</XhCommandEmpty>
          <XhCommandLoading>正在从服务端取…</XhCommandLoading>
          <XhCommandFooter>不输字时给的是最近协作过的三位</XhCommandFooter>
        </XhCommandContent>
      </template>
    </XhCommandRoot>
    <span>{{ picked }}</span>
  </div>
</template>
```

```html
<div style="display: flex; align-items: center; gap: 12px">
  <xh-command id="command-async" placeholder="搜同事…" filter="false">
    <button data-xh-part="trigger">找一个人</button>
    <div data-xh-part="backdrop"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" />
        <!-- 交进来的就是该显示的那几条，条目由脚本照单铺开 -->
        <div data-xh-part="list"></div>
        <div data-xh-part="empty">名册里没有这个人</div>
        <div data-xh-part="loading">正在从服务端取…</div>
        <footer data-xh-part="footer">不输字时给的是最近协作过的三位</footer>
      </div>
    </div>
  </xh-command>
  <span id="command-async-picked">还没选过人</span>
</div>

<script type="module">
  const host = document.getElementById("command-async");
  const list = host.querySelector('[data-xh-part="list"]');
  const picked = document.getElementById("command-async-picked");

  // 站在服务端那一头的整份名册，示例里用一次延迟冒充网络
  const roster = [
    { value: "zhangsan", label: "张三 · 平台组" },
    { value: "lisi", label: "李四 · 平台组" },
    { value: "wangwu", label: "王五 · 交易组" },
    { value: "zhaoliu", label: "赵六 · 交易组" },
    { value: "sunqi", label: "孙七 · 风控组" },
  ];

  let timer = 0;
  // 回来的顺序不保证与发出的顺序一致，只认最后一次请求的结果
  let latest = 0;

  function paint(results) {
    host.collection = results;
    list.replaceChildren(
      ...results.map((one) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", one.value);
        const text = document.createElement("span");
        text.dataset.xhPart = "item-text";
        text.textContent = one.label;
        item.append(text);
        return item;
      }),
    );
  }

  paint(roster.slice(0, 3));

  host.addEventListener("input-value-change", (event) => {
    clearTimeout(timer);
    host.loading = true;
    const seq = ++latest;
    const keyword = event.detail.inputValue.trim();
    timer = setTimeout(() => {
      if (seq !== latest) return;
      paint(keyword ? roster.filter((one) => one.label.includes(keyword)) : roster.slice(0, 3));
      host.loading = false;
    }, 400);
  });

  host.addEventListener("select", (event) => {
    picked.textContent = `选了：${event.detail.label}`;
  });
</script>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-command>` |
| Vue 组件 | `XhCommandContent` `XhCommandEmpty` `XhCommandFooter` `XhCommandGroup` `XhCommandGroupLabel` `XhCommandInput` `XhCommandItem` `XhCommandItemText` `XhCommandList` `XhCommandLoading` `XhCommandRoot` `XhCommandTrigger` |
| 组合式函数 | `useCommand` |
| 状态机 | `commandMachine` |
| 皮肤 | `@xihan-ui/styles/command.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="command"`：`trigger` · `backdrop` · `positioner` · **`content`** · **`input`** · **`list`** · `group` · `group-label` · `item` · `item-text` · `empty` · `loading` · `footer`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly CommandNode[]` |  | 命令清单，标题、别名、归组与禁用的事实源。 |
| `groups` | `readonly CommandGroup[]` |  | 分组声明，决定组名与组序；清单里出现而这里没声明的组排在后面。 |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `inputValue` | `string` |  |  |
| `defaultInputValue` | `string` |  |  |
| `filter` | `boolean` |  | 内置过滤，默认开。关掉即由调用方自己筛，交进来的 collection 就是此刻该显示的那几条。 |
| `caseSensitive` | `boolean` |  | 过滤区分大小写，缺省不区分。 |
| `closeOnSelect` | `boolean` |  | 选中一条命令后收起面板，默认 true。 |
| `modal` | `boolean` |  | 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `loading` | `boolean` |  | 命令还在取：列表报 aria-busy，在途占位顶上来，空态占位让位。 |
| `placeholder` | `string` |  | 检索框的占位文字。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只换面板宽度与条目的几何档位。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<CommandTranslations>` |  |  |
| `onOpenChange` | `(details: CommandOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onInputValueChange` | `(details: CommandInputValueChangeDetails) => void` |  | 检索串变化意图回调。 |
| `onSelect` | `(details: CommandSelectDetails) => void` |  | 选中一条命令：库不执行任何动作，做什么全归这里。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CommandOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean, reason?: string }` |
| `input-value-change` | `CommandInputValueChangeDetails` | 检索串变化；detail 为 `{ inputValue: string }` |
| `select` | `CommandSelectDetails` | 选中一条命令；detail 为 `{ value: string, label: string }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhCommandRoot` | `default` | `CommandRootSlotProps` |  |
| `XhCommandRoot` | `trigger` | — | 铺开时的触发按钮内容；不给即不渲染触发器（面板改由快捷键或 v-model:open 唤起）。 |
| `XhCommandRoot` | `item` | `CommandNodeMeta` |  |
| `XhCommandRoot` | `empty` | — |  |
| `XhCommandRoot` | `footer` | — |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `input` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |
| `empty` | 'open' \| 'closed' |
| `loading` | 'open' \| 'closed' |
| `footer` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `INPUT.CHANGE` · `INPUT.SET` · `ITEM.HIGHLIGHT` · `HIGHLIGHT.CLEAR` · `ITEM.SELECT`

**判据**：`isOpenControlled` · `keepsOpenOnSelect`

## connect API

`useCommand` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `inputValue` | `string` | 当前检索串。 |
| `groups` | `readonly CommandGroupMeta[]` | 过滤归组之后此刻该显示的命令，空组已经丢掉。 |
| `results` | `readonly CommandNodeMeta[]` | 上面那份分组视图摊平的结果，次序即方向键走的次序。 |
| `highlightedValue` | `string \| null` | 键盘锚点；收起时为 null。 |
| `empty` | `boolean` | 一条都没剩下。 |
| `loading` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `setInputValue` | `(next: string) => void` |  |
| `select` | `(value: string) => void` | 直接选中某条命令，等同于在它上面按回车。 |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getInputProps` | `() => T['input']` |  |
| `getListProps` | `() => T['element']` |  |
| `getGroupProps` | `(props: CommandGroupProps) => T['element']` |  |
| `getGroupLabelProps` | `(props: CommandGroupProps) => T['element']` |  |
| `getItemProps` | `(props: CommandItemProps) => T['element']` |  |
| `getItemTextProps` | `(props: CommandItemProps) => T['element']` |  |
| `getEmptyProps` | `() => T['element']` | 空态占位：放在 content 里、list 的兄弟。 给了 collection 时由连接层按条数收放；条目手写时不写 hidden，露不露面归作者。 |
| `getLoadingProps` | `() => T['element']` | 在途占位：与空态占位同一个位置，两者不同屏。 |
| `getFooterProps` | `() => T['element']` | 面板底部的提示条：作者放什么由作者定，这里只给位置与观感。 |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开面板并把焦点移入检索框 |
| `Escape` | open | 关闭面板并把焦点还给 trigger |
| `ArrowDown` | open | 锚点移到下一条命令，禁用的跳过 |
| `ArrowUp` | open | 锚点移到上一条命令，禁用的跳过 |
| `Home` | open | 锚点移到首条命令 |
| `End` | open | 锚点移到末条命令 |
| `Enter` | open, 锚点落在可用命令上 | 选中该命令；长按连发的重复键不重复选中 |
| `Tab` | open, modal | 在面板内循环焦点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-label` | translations?.title |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | 'dialog' |
| `input` | `aria-activedescendant` | `item` 部件的 id \| undefined |
| `input` | `aria-autocomplete` | 'list' |
| `input` | `aria-controls` | `list` 部件的 id |
| `input` | `aria-expanded` | 'true' |
| `input` | `aria-haspopup` | 'listbox' |
| `input` | `aria-label` | translations?.input |
| `input` | `role` | 'combobox' |
| `list` | `aria-busy` | 'true' \| undefined |
| `list` | `aria-label` | translations?.list |
| `list` | `role` | 'listbox' |
| `group` | `aria-labelledby` | `group-label` 部件的 id |
| `group` | `role` | 'group' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-selected` | 'false' |
| `item` | `role` | 'option' |
| `empty` | `role` | 'status' |
| `loading` | `role` | 'status' |

## 样式

默认皮肤 `@xihan-ui/styles/command.css` 按部件选择：`[data-scope="command"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-size` | props.size |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `input` | `data-state` | 'open' \| 'closed' |
| `list` | `data-state` | 'open' \| 'closed' |
| `empty` | `data-state` | 'open' \| 'closed' |
| `loading` | `data-state` | 'open' \| 'closed' |
| `footer` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-command-backdrop-bg` · `--xh-command-backdrop-blur` · `--xh-command-backdrop-layer` · `--xh-command-bg` · `--xh-command-empty-fg` · `--xh-command-empty-font-size` · `--xh-command-empty-px` · `--xh-command-empty-py` · `--xh-command-fg` · `--xh-command-footer-border` · `--xh-command-footer-fg` · `--xh-command-footer-font-size` · `--xh-command-footer-gap` · `--xh-command-footer-px` · `--xh-command-footer-py` · `--xh-command-group-gap` · `--xh-command-group-label-fg` · `--xh-command-group-label-font-size` · `--xh-command-group-label-font-weight` · `--xh-command-group-label-px` · `--xh-command-group-label-py` · `--xh-command-group-spacing` · `--xh-command-icon-size` · `--xh-command-input-autofill-bg` · `--xh-command-input-autofill-fg` · `--xh-command-input-border` · `--xh-command-input-fg` · `--xh-command-input-font-size` · `--xh-command-input-h` · `--xh-command-input-px` · `--xh-command-inset-block-start` · `--xh-command-item-bg-hover` · `--xh-command-item-fg` · `--xh-command-item-font-size` · `--xh-command-item-gap` · `--xh-command-item-leading` · `--xh-command-item-px` · `--xh-command-item-py` · `--xh-command-item-radius` · `--xh-command-layer` · `--xh-command-list-busy-opacity` · `--xh-command-list-gap` · `--xh-command-list-px` · `--xh-command-list-py` · `--xh-command-loading-fg` · `--xh-command-loading-font-size` · `--xh-command-loading-px` · `--xh-command-loading-py` · `--xh-command-max-h` · `--xh-command-max-w` · `--xh-command-placeholder-fg` · `--xh-command-positioner-pb` · `--xh-command-positioner-px` · `--xh-command-radius` · `--xh-command-shadow`

## 动效

关键帧 `xh-fade-in` · `xh-fade-out` · `xh-overlay-pop-in` · `xh-pop-out` · `xh-rise-in` 随皮肤自带，不引用别处文件里的名字；`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 唤起用[快捷键](./hotkeys)：把 `mod+k` 绑到 `setOpen(true)` 上。
- 条目文字里标出命中的那几个字用[文本高亮](./highlight)，检索串就是它的关键词。
- 行尾的快捷键提示用[快捷键](./hotkeys)的按键部件，与全局绑定同一套写法。

## 最佳实践

- 命令名写成「动词 + 宾语」（新建用户、导出报表），用户按动作找东西。
- 分组按用户的心智分（页面 / 设置 / 动作），不要按代码模块分。
- 底部提示条写清三件事：上下键选、回车执行、Escape 关闭。
- 命令来自远端时给在途占位，别让面板停在一片空白上。

## 反模式

- 把整个后台的每个按钮都塞进来——面板变成第二份菜单树，检索反而更慢。
- 只认命令的中文全名：用户打 `export` 什么也搜不到，别名该写进 `keywords`。
- 选中后什么反馈都没有：命令要么当场生效，要么导航过去，要么给一条轻提示。
