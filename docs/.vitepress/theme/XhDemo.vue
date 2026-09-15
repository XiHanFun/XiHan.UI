<script setup lang="ts">
import type { ComponentType } from "react";
import type { Root as ReactRoot } from "react-dom/client";
import type { Component } from "vue";
import { XhCodeViewCode, XhCodeViewPre, XhCodeViewRoot } from "@xihan-ui/vue";
import { useData } from "vitepress";
import {
  computed,
  defineAsyncComponent,
  onScopeDispose,
  ref,
  watchEffect,
  watchPostEffect,
} from "vue";
import {
  demoFramework,
  demoFrameworks,
  demoNotApplicable,
  setDemoFramework,
} from "./demo-framework";
import { stageAttrs, stageTheme } from "./demo-stage";
import XhStageAxes from "./XhStageAxes.vue";

const props = defineProps<{
  /** 示例路径，相对 .vitepress/demos 且不带扩展名，如 "switch/01-basic" */
  src: string;
}>();

// 预览与源码取自同一个文件，两者不可能对不上。
// 不用 eager：示例有一千多份，全量打进主题块的话每页都要下载整套
const vueModules = import.meta.glob<{ default: Component }>("../demos/**/*.vue");
const reactModules = import.meta.glob<{ default: ComponentType }>("../demos/**/*.tsx");
const vueSources = import.meta.glob<string>("../demos/**/*.vue", {
  query: "?raw",
  import: "default",
});
const wcSources = import.meta.glob<string>("../demos/**/*.html", {
  query: "?raw",
  import: "default",
});
const reactSources = import.meta.glob<string>("../demos/**/*.tsx", {
  query: "?raw",
  import: "default",
});

// 一个框架一份源码表，键是 glob 给出的文件路径。加框架时这里多一条
const sourcesByFramework: Record<string, Record<string, () => Promise<string>>> = {
  "vue": vueSources,
  "web-components": wcSources,
  "react": reactSources,
};

function sourceKey(framework: { id: string; ext: string }): string {
  return `../demos/${props.src}${framework.ext}`;
}

// 哪些框架有这份示例：glob 的键是同步的，不必把文件读进来才知道
const availableIds = computed(
  () =>
    new Set(
      demoFrameworks
        .filter(framework => sourceKey(framework) in (sourcesByFramework[framework.id] ?? {}))
        .map(framework => framework.id),
    ),
);

// 当前框架这份示例的源码，加载完才有值
const raw = ref("");

if (import.meta.hot) {
  const reloadWhenDemoChanges = (payload: { updates: { acceptedPath: string; path: string }[] }) => {
    const demoPath = `/demos/${props.src}`;
    if (payload.updates.some(update =>
      update.path.includes(demoPath) || update.acceptedPath.includes(demoPath))) {
      window.location.reload();
    }
  };
  import.meta.hot.on("vite:beforeUpdate", reloadWhenDemoChanges);
  onScopeDispose(() => import.meta.hot?.off("vite:beforeUpdate", reloadWhenDemoChanges));
}

watchEffect(async () => {
  const framework = demoFrameworks.find(item => item.id === demoFramework.value);
  const load = framework && sourcesByFramework[framework.id]?.[sourceKey(framework)];
  const requested = demoFramework.value;
  raw.value = "";
  const text = load ? await load() : "";
  // 加载期间可能已经切走，晚到的结果不许覆盖当前框架的
  if (demoFramework.value === requested)
    raw.value = text;
});

// 示例首行注释写「标题 | 说明」，标题与说明由生成器落成 h3 与段落，
// 这里只负责把它从展示和复制的源码里剔除
function stripDemoHeading(source: string): string {
  return source
    .replace(/^(<!--[\s\S]*?-->|\/\/[^\n]*)\s*/, "")
    .trimEnd();
}

const code = computed(() => stripDemoHeading(raw.value));

const lang = computed(
  () => demoFrameworks.find(framework => framework.id === demoFramework.value)?.lang ?? "",
);
const activeName = computed(
  () => demoFrameworks.find(framework => framework.id === demoFramework.value)?.name ?? "",
);
// 当前框架没有这份示例时，切到有的那个
const fallback = computed(() =>
  demoFrameworks.find(
    framework => framework.id !== demoFramework.value && availableIds.value.has(framework.id),
  ),
);

const vueDemo = computed(() => {
  if (demoFramework.value !== "vue")
    return undefined;
  const load = vueModules[`../demos/${props.src}.vue`];
  return load ? defineAsyncComponent(load) : undefined;
});
const wcHtml = computed(() =>
  demoFramework.value === "web-components" ? code.value : "",
);
// 源码还在路上时不显示「暂无此框架版本」
const missing = computed(() => !availableIds.value.has(demoFramework.value));
// 这个目录本就不出当前框架的版本时，把结论摆出来，不说成「还没写」
const notApplicable = computed(() =>
  demoNotApplicable(demoFramework.value, props.src),
);

const wcHost = ref<HTMLElement | null>(null);
const reactHost = ref<HTMLElement | null>(null);
let reactRoot: ReactRoot | undefined;
let reactRequest = 0;

function unmountReact() {
  reactRequest += 1;
  reactRoot?.unmount();
  reactRoot = undefined;
}

watchPostEffect(() => {
  const host = reactHost.value;
  if (demoFramework.value !== "react" || !host) {
    unmountReact();
    return;
  }
  const load = reactModules[`../demos/${props.src}.tsx`];
  if (!load)
    return;
  const request = ++reactRequest;
  reactRoot?.unmount();
  reactRoot = undefined;
  void Promise.all([import("react"), import("react-dom/client"), load()]).then(
    ([React, ReactDOM, module]) => {
      if (request !== reactRequest || reactHost.value !== host)
        return;
      reactRoot = ReactDOM.createRoot(host);
      reactRoot.render(React.createElement(module.default));
    },
  );
});

onScopeDispose(unmountReact);

// 自定义元素全站注册一次，且只在浏览器里注册
let defined: Promise<void> | undefined;
function defineElements(): Promise<void> {
  defined ??= import("@xihan-ui/web-components/define").then(m => m.defineXhElements());
  return defined;
}

// innerHTML 收下的 <script> 不会执行，逐个重建成新节点才跑得起来
function reviveScripts(host: HTMLElement): void {
  for (const stale of Array.from(host.querySelectorAll("script"))) {
    const script = document.createElement("script");
    for (const attr of Array.from(stale.attributes)) {
      script.setAttribute(attr.name, attr.value);
    }
    script.textContent = stale.textContent;
    stale.replaceWith(script);
  }
}

async function mountWebComponents(host: HTMLElement, html: string): Promise<void> {
  await defineElements();
  // 等注册期间可能已经切走，容器换了就不再往旧的写
  if (wcHost.value !== host)
    return;
  // 重写 innerHTML 会摘掉上一份的全部节点，元素随之断开、挂在它们身上的监听一并撤走
  host.innerHTML = html;
  reviveScripts(host);
}

// 切到别的框架时 Vue 直接摘掉整个容器，这条不再触发
watchPostEffect(() => {
  const host = wcHost.value;
  const html = wcHtml.value;
  if (host && html)
    void mountWebComponents(host, html);
});

const { isDark } = useData();

// 工具条选的档位打在舞台上而不是 html 上：令牌的各档选择器都是 :where([data-*])，
// 落在任意容器上即对这棵子树生效，页面其余部分不受影响
const stageBindings = computed(() => stageAttrs(isDark.value));
// 主题轴离开「跟随站点」时舞台自备底色，否则深浅两套颜色会撞在一起
const themed = computed(() => stageTheme.value !== "site");

const expanded = ref(false);
const copied = ref(false);

async function copy() {
  await navigator.clipboard.writeText(code.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
  <div class="xh-demo">
    <div
      class="xh-demo__stage"
      :class="{ 'xh-demo__stage--themed': themed }"
      v-bind="stageBindings"
    >
      <component :is="vueDemo" v-if="vueDemo" />
      <div
        v-else-if="demoFramework === 'react' && !missing"
        ref="reactHost"
        class="xh-demo__runtime"
      />
      <div
        v-else-if="demoFramework === 'web-components' && !missing"
        ref="wcHost"
        class="xh-demo__runtime"
      />
      <div v-else class="xh-demo__missing">
        <p v-if="notApplicable">{{ activeName }} 版不适用：{{ notApplicable }}</p>
        <p v-else>这个示例还没有 {{ activeName }} 版：{{ src }}</p>
        <button
          v-if="fallback"
          class="xh-demo__btn"
          type="button"
          @click="setDemoFramework(fallback.id)"
        >
          切到 {{ fallback.name }}
        </button>
      </div>
    </div>

    <div class="xh-demo__bar">
      <XhStageAxes />
      <div v-if="code" class="xh-demo__actions">
        <button
          class="xh-demo__btn"
          type="button"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? "收起代码" : "查看代码" }}
        </button>
        <button class="xh-demo__btn" type="button" @click="copy">
          {{ copied ? "已复制" : "复制" }}
        </button>
      </div>
    </div>

    <template v-if="code">
      <XhCodeViewRoot
        v-show="expanded"
        class="xh-demo__code"
        :code="code"
        :lang="lang"
        :translations="{ code: '示例代码' }"
        complete
      >
        <XhCodeViewPre>
          <XhCodeViewCode />
        </XhCodeViewPre>
      </XhCodeViewRoot>
    </template>
  </div>
</template>

<style scoped>
.xh-demo {
  margin: var(--xh-space-6) 0 var(--xh-space-8);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  overflow: hidden;
  background: var(--xh-bg-surface);
  box-shadow: var(--xh-elevation-raised);
}
.xh-demo__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-3);
  min-height: 236px;
  padding: var(--xh-space-8) var(--xh-space-6);
  background: var(--demo-stage-bg, var(--xh-bg-page));
}
/* 主题轴钉住深浅时舞台的底与字改由令牌给，与所选那一档同源 */
.xh-demo__stage--themed {
  --demo-stage-bg: var(--xh-bg-page);

  color: var(--xh-fg-default);
}
/* 自定义元素的示例整体挂在这一层，摆位与 Vue 那份一致 */
.xh-demo__runtime {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-3);
  width: 100%;
}
.xh-demo__missing {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-3);
  color: var(--xh-fg-muted);
  font-size: var(--xh-text-body-size);
  line-height: 1.7;
}
/* 结论是整句话，长过一行就折行，右边的按钮跟着落到下一行 */
.xh-demo__missing p {
  margin: 0;
  max-width: 68ch;
}
.xh-demo__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--xh-space-2) var(--xh-space-4);
  padding: var(--xh-space-2) var(--xh-space-3);
  border-top: var(--xh-stroke-thin) solid var(--xh-border-default);
  background: var(--xh-bg-surface);
}
/* 舞台的档位在左、代码的动作在右；行装不下时动作整组落到下一行右端 */
.xh-demo__actions {
  display: flex;
  gap: var(--xh-space-2);
  margin-left: auto;
}
.xh-demo__btn {
  min-height: var(--xh-control-h-sm);
  padding-inline: var(--xh-control-px-sm);
  border: var(--xh-stroke-thin) solid transparent;
  border-radius: var(--xh-shape-control);
  background: transparent;
  color: var(--xh-fg-muted);
  font-size: var(--xh-control-font-sm);
  line-height: var(--xh-leading-none);
  cursor: pointer;
  transition:
    color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    background-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    scale var(--xh-motion-duration-release) var(--xh-motion-ease-release);
}
.xh-demo__btn:hover {
  color: var(--xh-fg-default);
  background: var(--xh-bg-subtle-hover);
}
.xh-demo__btn:active {
  scale: var(--xh-motion-scale-press);
  transition-duration: var(--xh-motion-duration-press);
  transition-timing-function: var(--xh-motion-ease-press);
}
.xh-demo__btn:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}
/* 代码由 XhCodeView 渲染，语法着色随之接上。
   它自带的表面（圆角、发丝边、落影）在这里收掉：外壳已经画了一圈边，代码块是它的一段。 */
.xh-demo__code {
  --xh-code-view-bg: var(--vp-code-block-bg);
  --xh-code-view-fg: var(--vp-c-text-1);
  --xh-code-view-border: transparent;
  --xh-code-view-radius: 0;
  --xh-code-view-shadow: none;
  --xh-code-view-font-size: var(--vp-code-font-size);
  --xh-code-view-px: var(--xh-space-6);
  --xh-code-view-py: var(--xh-space-5);

  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 639px) {
  .xh-demo__stage {
    min-height: 188px;
    padding: var(--xh-space-8) var(--xh-space-4);
  }
}
</style>
