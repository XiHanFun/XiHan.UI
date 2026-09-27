<script setup lang="ts">
import {
  XhGridListRoot,
  XhGridListRow,
  XhGridListRowAction,
  XhGridListRowActions,
  XhGridListRowContent,
  XhGridListRowSelectionIndicator,
  XhGridListRowText,
} from "@xihan-ui/vue";
</script>

<template>
  <XhGridListRoot default-value="design">
    <XhGridListRow value="design">
      <XhGridListRowSelectionIndicator />
      <XhGridListRowContent><XhGridListRowText>设计规范</XhGridListRowText></XhGridListRowContent>
      <XhGridListRowActions><XhGridListRowAction>查看</XhGridListRowAction></XhGridListRowActions>
    </XhGridListRow>
    <XhGridListRow value="code">
      <XhGridListRowSelectionIndicator />
      <XhGridListRowContent><XhGridListRowText>实现代码</XhGridListRowText></XhGridListRowContent>
    </XhGridListRow>
  </XhGridListRoot>
</template>
