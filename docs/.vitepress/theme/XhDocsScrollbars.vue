<script setup lang="ts">
import {
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
} from "@xihan-ui/vue";
import { useData } from "vitepress";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const page = ref<HTMLElement | null>(null);
const sidebar = ref<HTMLElement | null>(null);
const { page: currentPage } = useData();

function forwardPageScroll(): void {
  page.value?.dispatchEvent(new Event("scroll"));
}

onMounted(() => {
  page.value = document.scrollingElement as HTMLElement | null;
  sidebar.value = document.querySelector<HTMLElement>(".VPSidebar");
  window.addEventListener("scroll", forwardPageScroll, { passive: true });
});

watch(
  () => currentPage.value.relativePath,
  async () => {
    await nextTick();
    sidebar.value = document.querySelector<HTMLElement>(".VPSidebar");
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", forwardPageScroll);
});
</script>

<template>
  <div v-if="page" class="xh-doc-scrollbar xh-doc-scrollbar--page">
    <XhScrollbarRoot :scrollable="page" orientation="vertical" type="scroll" size="sm">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>

  <div v-if="sidebar" class="xh-doc-scrollbar xh-doc-scrollbar--sidebar">
    <XhScrollbarRoot :scrollable="sidebar" orientation="vertical" type="scroll" size="sm">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>

<style>
.xh-doc-scrollbar {
  --xh-scrollbar-track-bg: transparent;
  --xh-scrollbar-thumb-bg: color-mix(in oklab, var(--vp-c-text-2) 38%, transparent);
  --xh-scrollbar-thumb-bg-hover: color-mix(in oklab, var(--vp-c-text-1) 58%, transparent);
  --xh-scrollbar-thumb-bg-active: color-mix(in oklab, var(--vp-c-text-1) 72%, transparent);

  position: fixed;
  z-index: 60;
  top: var(--vp-nav-height);
  bottom: 0;
  width: var(--xh-scrollbar-thickness-sm);
}

.xh-doc-scrollbar--page {
  right: 0;
}

.xh-doc-scrollbar--sidebar {
  left: calc(var(--vp-sidebar-width) - var(--xh-scrollbar-thickness-sm));
}

@media (max-width: 959px), (pointer: coarse) {
  .xh-doc-scrollbar {
    display: none;
  }
}
</style>
