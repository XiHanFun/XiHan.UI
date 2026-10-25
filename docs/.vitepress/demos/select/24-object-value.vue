<!-- 对象值 | 选项直接用接口取回来的对象：value 与值变化交出的都是对象本身，给 valueKey 按 id 认，同一个人换成内容相同的新对象也选得中 -->
<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";
import { ref } from "vue";

interface Member {
  id: number;
  name: string;
  team: string;
}

const members: Member[] = [
  { id: 1, name: "赵一", team: "平台研发" },
  { id: 2, name: "钱二", team: "前端体验" },
  { id: 3, name: "孙三", team: "基础架构" },
  { id: 4, name: "李四", team: "质量保障" },
];

const options = members.map(member => ({ value: member, label: member.name, description: member.team }));

// 初值是另一份内容相同的对象（比如从地址栏还原的），按 id 认得出来
const picked = ref<Member[]>([{ id: 2, name: "钱二", team: "前端体验" }]);
</script>

<template>
  <div style="display: grid; gap: 12px; width: 100%; max-width: 320px">
    <XhSelectRoot v-model:value="picked" multiple value-key="id" :collection="options" label="负责人" placeholder="请选择" />
    <span data-demo-output>{{ picked.map(member => `${member.name}（${member.team}）`).join("、") || "未选" }}</span>
  </div>
</template>
