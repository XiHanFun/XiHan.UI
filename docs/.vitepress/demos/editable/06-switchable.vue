<!-- 整表进出编辑态 | edit 受控就由宿主统一调度：一个开关把整张表切进编辑，放弃时宿主拿自己留的底稿还原 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhEditableArea,
  XhEditableInput,
  XhEditablePreview,
  XhEditableRoot,
} from "@xihan-ui/vue";

interface Row {
  id: string;
  name: string;
  quota: string;
}

const rows = ref<Row[]>([
  { id: "a", name: "北区", quota: "1200" },
  { id: "b", name: "南区", quota: "980" },
  { id: "c", name: "东区", quota: "1450" },
]);

const editing = ref(false);
let backup: Row[] = [];

function start() {
  backup = rows.value.map((row) => ({ ...row }));
  editing.value = true;
}

function save() {
  editing.value = false;
}

function discard() {
  rows.value = backup.map((row) => ({ ...row }));
  editing.value = false;
}

const cell = "padding: 6px 10px; border-block-end: 1px solid var(--xh-border-subtle)";

const head = `${cell}; text-align: start; font-weight: 500; color: var(--xh-fg-muted)`;
</script>

<template>
  <div style="width: 100%; max-width: 460px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <XhButton v-if="!editing" size="sm" @click="start">编辑整表</XhButton>
      <template v-else>
        <XhButton size="sm" @click="save">完成</XhButton>
        <XhButton size="sm" @click="discard">放弃</XhButton>
      </template>
    </div>

    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th :style="head">区域</th>
          <th :style="head">配额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.name"
              :edit="editing"
              placeholder="未填写"
              auto-resize
            >
              <XhEditableArea>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableArea>
            </XhEditableRoot>
          </td>
          <td :style="cell">
            <XhEditableRoot
              v-model:value="row.quota"
              :edit="editing"
              placeholder="未填写"
              auto-resize
            >
              <XhEditableArea>
                <XhEditablePreview />
                <XhEditableInput />
              </XhEditableArea>
            </XhEditableRoot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
