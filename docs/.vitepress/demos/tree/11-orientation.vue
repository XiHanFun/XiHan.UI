<!-- 末端横排 | leaf-orientation="horizontal" 只作用于子节点全是叶子的那层：菜单授权里按钮一行铺开就选完，目录与菜单这些中间层恒竖排，层级得靠竖排读出来 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchCheckbox,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemCheckbox,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

const collection = [
  {
    value: "system",
    label: "系统管理",
    children: [
      {
        value: "user",
        label: "用户管理",
        children: [
          { value: "user:add", label: "新增" },
          { value: "user:edit", label: "编辑" },
          { value: "user:del", label: "删除" },
          { value: "user:export", label: "导出" },
        ],
      },
      {
        value: "role",
        label: "角色管理",
        children: [
          { value: "role:add", label: "新增" },
          { value: "role:grant", label: "授权" },
          { value: "role:del", label: "删除" },
        ],
      },
    ],
  },
];

const wide = ref(true);
const selection = ref<string[]>(["user:add"]);
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px; justify-items: start">
    <label style="display: inline-flex; gap: 6px; align-items: center">
      <input v-model="wide" type="checkbox" />
      按钮那层横排
    </label>

    <XhTreeRoot
      v-model:selection="selection"
      :collection="collection"
      :leaf-orientation="wide ? 'horizontal' : 'vertical'"
      :default-expanded-value="['system', 'user', 'role']"
      selection-mode="multiple"
      cascade
    >
      <XhTreeLabel>菜单授权</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch v-for="dir in collection" :key="dir.value" :value="dir.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchCheckbox />
            <XhTreeBranchText>{{ dir.label }}</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeBranch v-for="menu in dir.children" :key="menu.value" :value="menu.value">
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchCheckbox />
                <XhTreeBranchText>{{ menu.label }}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                <XhTreeItem v-for="btn in menu.children" :key="btn.value" :value="btn.value">
                  <XhTreeItemCheckbox />
                  <XhTreeItemText>{{ btn.label }}</XhTreeItemText>
                </XhTreeItem>
              </XhTreeBranchContent>
            </XhTreeBranch>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
  </div>
</template>
