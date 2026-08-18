<script setup lang="ts">
import { computed, ref, watchPostEffect, type Component } from "vue";
import { demoFramework, demoFrameworks, setDemoFramework } from "./demo-framework";

const props = defineProps<{
  /** 示例路径，相对 .vitepress/demos 且不带扩展名，如 "switch/01-basic" */
  src: string;
}>();

// 预览与源码取自同一个文件，两者不可能对不上
const vueModules = import.meta.glob<{ default: Component }>("../demos/**/*.vue", {
  eager: true,
});
const vueSources = import.meta.glob<string>("../demos/**/*.vue", {
  eager: true,
  query: "?raw",
  import: "default",
});
const wcSources = import.meta.glob<string>("../demos/**/*.html", {
  eager: true,
  query: "?raw",
  import: "default",
});

// 一个框架一份源码表，键是 glob 给出的文件路径。加框架时这里多一条
const sourcesByFramework: Record<string, Record<string, string>> = {
  "vue": vueSources,
  "web-components": wcSources,
};

// 本示例在各框架下的源码，缺席的框架不进表
const rawByFramework = computed(() => {
  const out: Record<string, string> = {};
  for (const framework of demoFrameworks) {
    const raw = sourcesByFramework[framework.id]?.[`../demos/${props.src}${framework.ext}`];
    if (raw !== undefined) out[framework.id] = raw;
  }
  return out;
});

// 示例文件首行注释写「标题 | 说明」，标题与说明由生成器落成 h3 与段落，
// 这里只负责把它从展示的源码里剔除
const code = computed(() =>
  (rawByFramework.value[demoFramework.value] ?? "")
    .replace(/^(<!--[\s\S]*?-->|\/\/[^\n]*)\s*/, "")
    .trimEnd()
);

const lang = computed(
  () => demoFrameworks.find((framework) => framework.id === demoFramework.value)?.lang ?? ""
);
const activeName = computed(
  () => demoFrameworks.find((framework) => framework.id === demoFramework.value)?.name ?? ""
);
// 当前框架没有这份示例时，切到有的那个
const fallback = computed(() =>
  demoFrameworks.find(
    (framework) => framework.id !== demoFramework.value && framework.id in rawByFramework.value
  )
);

const vueDemo = computed(() =>
  demoFramework.value === "vue" ? vueModules[`../demos/${props.src}.vue`]?.default : undefined
);
const wcHtml = computed(() => (demoFramework.value === "web-components" ? code.value : ""));

const wcHost = ref<HTMLElement | null>(null);

// 自定义元素全站注册一次，且只在浏览器里注册
let defined: Promise<void> | undefined;
function defineElements(): Promise<void> {
  defined ??= import("@xihan-ui/web-components/define").then((m) => m.defineXhElements());
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
  if (wcHost.value !== host) return;
  // 重写 innerHTML 会摘掉上一份的全部节点，元素随之断开、挂在它们身上的监听一并撤走
  host.innerHTML = html;
  reviveScripts(host);
}

// 切到别的框架时 Vue 直接摘掉整个容器，这条不再触发
watchPostEffect(() => {
  const host = wcHost.value;
  const html = wcHtml.value;
  if (host && html) void mountWebComponents(host, html);
});

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
    <div class="xh-demo__stage">
      <component :is="vueDemo" v-if="vueDemo" />
      <div v-else-if="wcHtml" ref="wcHost" class="xh-demo__wc" />
      <div v-else class="xh-demo__missing">
        <p>这个示例还没有 {{ activeName }} 版：{{ src }}</p>
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

    <template v-if="code">
      <div class="xh-demo__bar">
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

      <div v-show="expanded" class="xh-demo__code">
        <pre :data-lang="lang"><code>{{ code }}</code></pre>
      </div>
    </template>
  </div>
</template>

<style scoped>
.xh-demo {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.xh-demo__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 28px 20px;
}
/* 自定义元素的示例整体挂在这一层，摆位与 Vue 那份一致 */
.xh-demo__wc {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.xh-demo__missing {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.xh-demo__missing p {
  margin: 0;
}
.xh-demo__bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.xh-demo__btn {
  padding: 3px 10px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 20px;
  transition: color 0.2s, background-color 0.2s;
}
.xh-demo__btn:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
}
.xh-demo__code {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-code-block-bg);
}
.xh-demo__code pre {
  margin: 0;
  padding: 20px 0;
  overflow-x: auto;
}
.xh-demo__code code {
  display: block;
  padding: 0 24px;
  width: fit-content;
  min-width: 100%;
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
  line-height: var(--vp-code-line-height);
  color: var(--vp-c-text-1);
  white-space: pre;
}
</style>
