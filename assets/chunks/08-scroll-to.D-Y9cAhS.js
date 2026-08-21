const n=`<!-- 跳到指定的一条 | 视口节点与消息节点都在宿主手上：滚到顶、定位到某一条都是一次普通的 DOM 操作 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhButton, XhThreadContent, XhThreadRoot, XhThreadViewport } from "@xihan-ui/vue";

const messages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  text: \`第 \${i + 1} 条 · 会话记录\`,
}));
const jumped = ref("（还没跳过）");

let viewport: HTMLElement | null = null;
const items = new Map<number, HTMLElement>();

// 视口只渲染一个 div，实例上的 $el 就是那个滚动容器
function bindViewport(instance: unknown): void {
  viewport = (instance as { $el: HTMLElement } | null)?.$el ?? null;
}

function bindItem(id: number, el: unknown): void {
  if (el)
    items.set(id, el as HTMLElement);
  else
    items.delete(id);
}

function scrollToTop(): void {
  viewport?.scrollTo({ top: 0, behavior: "smooth" });
  jumped.value = "跳到了顶部";
}

function scrollToItem(id: number): void {
  const item = items.get(id);
  if (!viewport || !item)
    return;
  // 两个 offsetTop 同参照系，相减就是这一条在滚动内容里的位置
  viewport.scrollTo({ top: item.offsetTop - viewport.offsetTop, behavior: "smooth" });
  jumped.value = \`跳到了第 \${id} 条\`;
}
<\/script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <XhThreadRoot style="block-size: 220px">
      <XhThreadViewport :ref="bindViewport">
        <XhThreadContent>
          <p
            v-for="m in messages"
            :key="m.id"
            :ref="el => bindItem(m.id, el)"
            style="margin: 0"
          >
            {{ m.text }}
          </p>
        </XhThreadContent>
      </XhThreadViewport>
    </XhThreadRoot>

    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="scrollToTop">回到顶部</XhButton>
      <XhButton variant="outline" size="sm" @click="scrollToItem(8)">跳到第 8 条</XhButton>
      <XhButton variant="outline" size="sm" @click="scrollToItem(20)">跳到第 20 条</XhButton>
    </div>
    <span>{{ jumped }}</span>
  </div>
</template>
`;export{n as default};
