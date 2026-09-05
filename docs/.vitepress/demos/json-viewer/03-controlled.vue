<!-- 受控展开 | 传了 expandedValue 就由宿主说了算，组件只发 expanded-value-change 不落内部值，写回它才动 -->
<script setup lang="ts">
import { ref } from "vue";
import { JSON_VIEWER_ROOT_PATH, jsonExpandedPathsToDepth } from "@xihan-ui/headless";
import { XhButton, XhJsonViewerRoot } from "@xihan-ui/vue";

const payload = {
  request: { method: "POST", path: "/api/login" },
  response: { code: 200, body: { token: "eyJhbGciOi…", expiresIn: 7200 } },
};

const expanded = ref<string[]>([JSON_VIEWER_ROOT_PATH]);

function onExpandedValueChange(details: { value: string[] }) {
  expanded.value = details.value;
}
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="expanded = jsonExpandedPathsToDepth(payload, 9)">
        全部展开
      </XhButton>
      <XhButton size="sm" @click="expanded = []">全部收起</XhButton>
    </div>

    <XhJsonViewerRoot
      :value="payload"
      :expanded-value="expanded"
      @expanded-value-change="onExpandedValueChange"
    />

    <span>展开了 {{ expanded.length }} 处</span>
  </div>
</template>
