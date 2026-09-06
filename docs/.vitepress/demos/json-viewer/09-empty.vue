<!-- 空态与形态 | 一行也摊不出来时空态那一格站出来说话；variant="plain" 去掉外框与底色 -->
<script setup lang="ts">
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const payload = ref<unknown>(undefined);

function toggle(): void {
  payload.value = payload.value === undefined ? { id: 7, label: "曦寒" } : undefined;
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <XhButton size="sm" variant="outline" @click="toggle">
      {{ payload === undefined ? "喂一份数据" : "把数据撤掉" }}
    </XhButton>

    <!-- 不写插槽即铺 translations.empty 那句话 -->
    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2">
      <template #empty>这份接口还没有返回内容</template>
    </XhJsonViewerRoot>

    <XhJsonViewerRoot :value="payload" :default-expanded-depth="2" variant="plain" />
  </div>
</template>
