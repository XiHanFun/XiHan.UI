<!-- 列设置与工具条 | 工具条渲成表的兄弟排在表前（root 是 grid，工具条进不去它里面）；列设置区照 columnSettings 渲，藏起来的列也在其中，只剩最后一列显示着时那颗把手转禁用 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnList,
  XhTableColumnVisibilityTrigger,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableToolbar,
} from "@xihan-ui/vue";

interface Member {
  id: string;
  name: string;
  dept: string;
  city: string;
  level: string;
}

const columns = [
  { id: "name", label: "姓名", width: "7rem" },
  { id: "dept", label: "部门", width: "9rem" },
  { id: "city", label: "城市", width: "7rem" },
  { id: "level", label: "职级" },
];

const members: Member[] = [
  { id: "u1", name: "赵一", dept: "平台研发", city: "杭州", level: "P6" },
  { id: "u2", name: "钱二", dept: "前端体验", city: "上海", level: "P7" },
  { id: "u3", name: "孙三", dept: "基础架构", city: "北京", level: "P6" },
  { id: "u4", name: "李四", dept: "前端体验", city: "杭州", level: "P5" },
];

const rows = members.map((m) => ({ id: m.id }));

// 偏好存哪儿归使用者：这里只把它显示出来，存 localStorage 还是存后端都是应用的事
const saved = ref<string>("尚未改过");
const rowStyle = { display: "flex", alignItems: "center", gap: "8px" };
const nameStyle = { cursor: "pointer" };
const cell = (m: Member, id: string) => m[id as keyof Member];
const toolbarTitle = computed(() => `成员 ${members.length} 人`);
</script>

<template>
  <div style="width: 100%; max-width: 560px; display: grid; gap: 12px">
    <XhTableRoot
      :columns="columns"
      :rows="rows"
      @column-preference-change="saved = JSON.stringify($event.value)"
    >
      <template #toolbar="{ columnSettings, setColumnHidden }">
        <XhTableToolbar>
          <span>{{ toolbarTitle }}</span>
          <XhPopoverRoot placement="bottom-end" size="sm">
            <XhPopoverTrigger aria-label="列设置">列设置</XhPopoverTrigger>
            <XhPopoverPositioner>
              <XhPopoverContent>
                <XhPopoverTitle>列设置</XhPopoverTitle>
                <XhTableColumnList>
                  <div v-for="col in columnSettings" :key="col.id" :style="rowStyle">
                    <XhTableColumnVisibilityTrigger :value="col.id" />
                    <span
                      :style="nameStyle"
                      @click="col.toggleable && setColumnHidden(col.id, !col.hidden)"
                    >
                      {{ col.label }}
                    </span>
                  </div>
                </XhTableColumnList>
              </XhPopoverContent>
            </XhPopoverPositioner>
          </XhPopoverRoot>
        </XhTableToolbar>
      </template>
      <template #default="{ columns: shown }">
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader v-for="col in shown" :key="col.id" :value="col.id">
              {{ col.label }}
            </XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          <XhTableRow v-for="m in members" :key="m.id" :value="m.id">
            <XhTableCell v-for="col in shown" :key="col.id" :value="col.id">
              {{ cell(m, col.id) }}
            </XhTableCell>
          </XhTableRow>
        </XhTableBody>
      </template>
    </XhTableRoot>
    <span>存下来的列偏好：{{ saved }}</span>
  </div>
</template>
