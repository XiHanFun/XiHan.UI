<!-- 手写部件 | 逐部件自己写，标签里就能塞头像、计数这类自带内容，摘除钮照旧归 cell 管；产出的结构与只交数据那一份完全一致，Tab 位与键盘也一样 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTagGroupCell,
  XhTagGroupItem,
  XhTagGroupItemDeleteTrigger,
  XhTagGroupItemText,
  XhTagGroupLabel,
  XhTagGroupList,
  XhTagGroupRoot,
} from "@xihan-ui/vue";

const members = ref([
  { value: "zhang", label: "张三", initial: "张", tasks: 3 },
  { value: "li", label: "李四", initial: "李", tasks: 8 },
  { value: "wang", label: "王五", initial: "王", tasks: 0 },
]);

const picked = ref<string[]>(["li"]);

// 条目的去留归宿主：组件只报「用户要摘这一枚」
function remove({ value }: { value: string }) {
  members.value = members.value.filter((member) => member.value !== value);
}

const avatar =
  "display: inline-flex; align-items: center; justify-content: center;" +
  " inline-size: 16px; block-size: 16px; border-radius: 50%;" +
  " background: var(--xh-bg-subtle); font-size: var(--xh-font-size-xs)";
</script>

<template>
  <XhTagGroupRoot
    v-model:value="picked"
    :collection="members"
    selection-mode="multiple"
    variant="outline"
    deletable
    @item-delete="remove"
  >
    <XhTagGroupLabel>协作成员</XhTagGroupLabel>
    <XhTagGroupList>
      <XhTagGroupItem v-for="member in members" :key="member.value" :value="member.value">
        <XhTagGroupCell>
          <!-- 首字头像只是装饰，连打检索取的是 item-text 里那几个字 -->
          <span aria-hidden="true" :style="avatar">{{ member.initial }}</span>
          <XhTagGroupItemText>{{ member.label }}</XhTagGroupItemText>
          <span aria-hidden="true" style="color: var(--xh-fg-muted)">
            {{ member.tasks }}
          </span>
          <XhTagGroupItemDeleteTrigger />
        </XhTagGroupCell>
      </XhTagGroupItem>
    </XhTagGroupList>
  </XhTagGroupRoot>
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
