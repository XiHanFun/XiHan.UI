const n=`<!-- 控件在薄封装里 | 封装的根不是可聚焦元素时，关掉 asChild、让封装内部用 useFieldControl 自取 -->
<script setup lang="ts">
import { useFieldControl, XhFieldControl, XhFieldDescription, XhFieldLabel, XhFieldRoot } from "@xihan-ui/vue";
import { defineComponent, h } from "vue";

// 典型的薄封装：根是个 div，真正可聚焦的 input 在里面
const MyInput = defineComponent({
  name: "MyInput",
  setup() {
    const controlProps = useFieldControl();
    return () =>
      h("div", { style: "display: flex; gap: 6px; align-items: center;" }, [
        h("span", "@"),
        h("input", { ...controlProps.value, placeholder: "you@example.com", style: "flex: 1;" }),
      ]);
  },
});
<\/script>

<template>
  <XhFieldRoot style="inline-size: 280px;">
    <XhFieldLabel>邮箱</XhFieldLabel>
    <!-- 不关 asChild 的话，id 与 aria-* 会落在封装的 div 上，标题的 for 就指不到 input -->
    <XhFieldControl :as-child="false">
      <MyInput />
    </XhFieldControl>
    <XhFieldDescription>点标题能聚焦到里面的输入框</XhFieldDescription>
  </XhFieldRoot>
</template>
`;export{n as default};
