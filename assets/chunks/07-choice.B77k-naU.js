var e=`<!-- 选择型条目 | CheckboxItem 与 RadioGroup 修改持久设置，切换后菜单保持展开 -->
<script setup lang="ts">
import {
  XhMenuCheckboxItem,
  XhMenuContent,
  XhMenuItemIndicator,
  XhMenuItemText,
  XhMenuPositioner,
  XhMenuRadioGroup,
  XhMenuRadioItem,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/vue";
import { ref } from "vue";

const checkboxValue = ref(["wrap"]);
const radioValue = ref({ density: "comfortable" });
<\/script>

<template>
  <XhMenuRoot
    :checkbox-value="checkboxValue"
    :radio-value="radioValue"
    @checkbox-value-change="checkboxValue = $event.value"
    @radio-value-change="radioValue = $event.value"
  >
    <XhMenuTrigger>视图设置</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuCheckboxItem value="wrap">
          <XhMenuItemIndicator />
          <XhMenuItemText>自动换行</XhMenuItemText>
        </XhMenuCheckboxItem>
        <XhMenuRadioGroup value="density">
          <XhMenuRadioItem value="comfortable">
            <XhMenuItemIndicator />
            <XhMenuItemText>宽松</XhMenuItemText>
          </XhMenuRadioItem>
          <XhMenuRadioItem value="compact">
            <XhMenuItemIndicator />
            <XhMenuItemText>紧凑</XhMenuItemText>
          </XhMenuRadioItem>
        </XhMenuRadioGroup>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{e as default};