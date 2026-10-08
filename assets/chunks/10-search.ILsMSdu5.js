var e=`<!-- 搜索 | search 标出键名与值里含有搜索词的行并展开它们的祖先，命中的那一段铺成 mark；工具条里的上一条 / 下一条在命中之间逐个走，停住的那一条换成实心并滚进视野 -->
<script setup lang="ts">
import {
  XhButton,
  XhJsonViewerRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const payload = {
  name: "曦寒视图",
  version: "1.0.0-alpha.2",
  author: { name: "曦寒", site: "xihanfun.com" },
  packages: [
    { name: "@xihan-ui/vue", size: 128 },
    { name: "@xihan-ui/react", size: 131 },
    { name: "@xihan-ui/web-components", size: 142 },
  ],
};

const query = ref("xihan");
<\/script>

<template>
  <XhJsonViewerRoot :value="payload" :search="query" style="inline-size: 100%; max-inline-size: 460px">
    <template #toolbar="{ searchMatches, activeMatch, nextMatch, prevMatch }">
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-block-end: 8px">
        <XhTextFieldRoot v-model:value="query" placeholder="搜索键名或值" size="sm">
          <XhTextFieldControl>
            <XhTextFieldInput aria-label="搜索 JSON" />
          </XhTextFieldControl>
        </XhTextFieldRoot>
        <XhButton variant="outline" size="sm" :disabled="!searchMatches.length" @click="prevMatch">上一条</XhButton>
        <XhButton variant="outline" size="sm" :disabled="!searchMatches.length" @click="nextMatch">下一条</XhButton>
        <span aria-live="polite">
          {{ searchMatches.length ? \`\${activeMatch ? searchMatches.indexOf(activeMatch) + 1 : 0} / \${searchMatches.length}\` : "无命中" }}
        </span>
      </div>
    </template>
  </XhJsonViewerRoot>
</template>
`;export{e as default};