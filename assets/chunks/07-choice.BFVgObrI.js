var e=`<!-- 选择型条目 | CheckboxItem 与 RadioGroup 修改持久设置，切换后菜单保持展开 -->
<script setup lang="ts">
import {
  XhButton,
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
    <XhMenuTrigger as-child>
      <XhButton variant="subtle">视图设置</XhButton>
    </XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuCheckboxItem value="wrap">
          <XhMenuItemText>自动换行</XhMenuItemText>
          <XhMenuItemIndicator />
        </XhMenuCheckboxItem>
        <XhMenuRadioGroup value="density">
          <XhMenuRadioItem value="comfortable">
            <XhMenuItemText>宽松</XhMenuItemText>
            <XhMenuItemIndicator />
          </XhMenuRadioItem>
          <XhMenuRadioItem value="compact">
            <XhMenuItemText>紧凑</XhMenuItemText>
            <XhMenuItemIndicator />
          </XhMenuRadioItem>
        </XhMenuRadioGroup>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
</template>
`;export{e as default};