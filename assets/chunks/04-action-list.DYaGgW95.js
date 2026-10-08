var e=`<!-- Action List | 不保留选择，Enter 或点击行触发主操作，行内按钮仍独立 -->
<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowText,
} from "@xihan-ui/vue";
import { ref } from "vue";

const commands = [
  { value: "open", label: "打开项目" },
  { value: "duplicate", label: "复制项目" },
  { value: "archive", label: "归档项目" },
];
const result = ref("等待操作");
<\/script>

<template>
  <div data-demo-stack>
    <XhGridListRoot :collection="commands" selection-mode="none" @action="result = \`主操作：\${$event.value}\`">
      <XhGridListRow v-for="command in commands" :key="command.value" :value="command.value">
        <XhGridListRowContent><XhGridListRowText>{{ command.label }}</XhGridListRowText></XhGridListRowContent>
        <XhGridListRowActions>
          <XhGridListRowAction @click="result = \`说明：\${command.label}\`">说明</XhGridListRowAction>
        </XhGridListRowActions>
      </XhGridListRow>
    </XhGridListRoot>
    <span data-label>{{ result }}</span>
  </div>
</template>
`;export{e as default};