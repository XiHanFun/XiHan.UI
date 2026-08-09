<script setup lang="ts">
import { computed, ref, type Component } from "vue";

const props = defineProps<{
  /** 示例路径，相对 .vitepress/demos 且不带扩展名，如 "switch/01-basic" */
  src: string;
}>();

// 预览与源码取自同一个文件，两者不可能对不上
const modules = import.meta.glob<{ default: Component }>("../demos/**/*.vue", {
  eager: true,
});
const sources = import.meta.glob<string>("../demos/**/*.vue", {
  eager: true,
  query: "?raw",
  import: "default",
});

const key = computed(() => `../demos/${props.src}.vue`);
const demo = computed(() => modules[key.value]?.default);
const raw = computed(() => sources[key.value] ?? "");

// 示例文件首行注释写「标题 | 说明」，它同时供本组件取标题、并从展示的源码里剔除
const header = computed(() => raw.value.match(/^<!--([\s\S]*?)-->/)?.[1]?.trim() ?? "");
const title = computed(() => header.value.split("|")[0]?.trim() ?? "");
const description = computed(() => header.value.split("|").slice(1).join("|").trim());
const code = computed(() => raw.value.replace(/^<!--[\s\S]*?-->\s*/, "").trimEnd());

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
    <div v-if="title || description" class="xh-demo__head">
      <p v-if="title" class="xh-demo__title">{{ title }}</p>
      <p v-if="description" class="xh-demo__desc">{{ description }}</p>
    </div>

    <div class="xh-demo__stage">
      <component :is="demo" v-if="demo" />
      <p v-else class="xh-demo__missing">示例缺失：{{ src }}</p>
    </div>

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
      <pre><code>{{ code }}</code></pre>
    </div>
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
.xh-demo__head {
  padding: 14px 20px 0;
}
.xh-demo__title {
  margin: 0;
  font-weight: 600;
  line-height: 1.5;
}
.xh-demo__desc {
  margin: 4px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.6;
}
.xh-demo__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 28px 20px;
}
.xh-demo__missing {
  margin: 0;
  color: var(--vp-c-danger-1);
  font-size: 14px;
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
