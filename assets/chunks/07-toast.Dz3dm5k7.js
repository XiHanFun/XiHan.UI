var e=`<!-- 轻提示预设 | preset="toast" 换成一句话的轻提示：落底部居中、最多 3 条、叠成一摞，鼠标或焦点进入即展开；卡片要把队列交下来的 preset 带上 -->
<script setup lang="ts">
import {
  XhButton,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
} from "@xihan-ui/vue";

type Create = (options: Record<string, unknown>) => string;
type Update = (id: string, options: Record<string, unknown>) => void;

const itemTranslations = { close: "关闭" };

// 加载中不自动消失，落定成 success 后才开始计时
function save(create: Create, update: Update): void {
  const id = create({ loading: true, title: "保存中" });
  window.setTimeout(update, 900, id, { loading: false, tone: "success", title: "已保存" });
}
<\/script>

<template>
  <XhNotificationRoot v-slot="{ create, update, dismiss }" preset="toast">
    <XhButton variant="solid" @click="save(create, update)">保存</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'success', title: '已发布' })">success</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'warning', title: '配额即将用尽' })">warning</XhButton>
    <XhButton variant="outline" @click="create({ tone: 'danger', title: '同步失败' })">danger</XhButton>

    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem
          :id="item.id"
          :preset="item.preset"
          :title="item.title"
          :description="item.description"
          :tone="item.tone"
          :loading="item.loading"
          :duration="item.duration"
          :closable="item.closable"
          :pause-on-page-idle="item.pauseOnPageIdle"
          :translations="itemTranslations"
          @status-change="
            ({ id, status }) => status === 'unmounted' && dismiss(id)
          "
        >
          <XhNotificationItemIndicator />
          <XhNotificationItemContent>
            <XhNotificationItemTitle />
            <XhNotificationItemDescription />
          </XhNotificationItemContent>
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
</template>
`;export{e as default};