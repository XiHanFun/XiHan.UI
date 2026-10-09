<script setup lang="ts">
import {
  BoldIcon,
  ChevronDownIcon,
  HeartIcon,
  InboxIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "@xihan-ui/icons";
import { brandId } from "@xihan-ui/tokens/runtime";
import {
  provideXhConfig,
  XhAccordionRoot,
  XhAlertAction,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhAvatarFallback,
  XhAvatarGroupRoot,
  XhAvatarRoot,
  XhBadge,
  XhBreadcrumbRoot,
  XhButton,
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
  XhCardContent,
  XhCardRoot,
  XhCartesianChartRoot,
  XhCheckbox,
  XhComboboxRoot,
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerHiddenInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
  XhEmptyStateAction,
  XhEmptyStateDescription,
  XhEmptyStateIndicator,
  XhEmptyStateRoot,
  XhEmptyStateTitle,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadList,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhIcon,
  XhKbd,
  XhMenuRoot,
  XhNotificationGroup,
  XhNotificationItem,
  XhNotificationItemCloseTrigger,
  XhNotificationItemContent,
  XhNotificationItemDescription,
  XhNotificationItemIndicator,
  XhNotificationItemTitle,
  XhNotificationRoot,
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
  XhPopconfirmArrow,
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
  XhProgress,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingLabel,
  XhRatingRoot,
  XhSelectRoot,
  XhSeparator,
  XhSkeletonItem,
  XhSkeletonRoot,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSparkline,
  XhSpinner,
  XhStatisticLabel,
  XhStatisticRoot,
  XhStatisticValue,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
  XhSwitch,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhTimelineConnector,
  XhTimelineContent,
  XhTimelineDescription,
  XhTimelineIndicator,
  XhTimelineItem,
  XhTimelineRoot,
  XhTimelineTime,
  XhTimelineTitle,
  XhToggle,
  XhToggleGroupItem,
  XhToggleGroupRoot,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const props = defineProps<{
  /** 已注册的品牌 id */
  brand: string;
  mode: "light" | "dark";
  density: "comfortable" | "compact";
  contrast: "default" | "more";
}>();

const root = ref<HTMLElement | null>(null);

// 预览区自成一个视觉环境作用域：控制器把各轴写到根上，浮层由桥接带上同一套属性
provideXhConfig(() => ({
  visualEnvironment: root.value
    ? {
        root: root.value,
        initial: {
          mode: props.mode,
          brand: brandId(props.brand),
          density: props.density,
          contrast: props.contrast,
        },
      }
    : undefined,
}));

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
  { value: "durian", label: "榴莲" },
];
const fruitRadios = [
  { value: "apple", label: "苹果" },
  { value: "pear", label: "梨" },
];
const cities = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "hangzhou", label: "杭州" },
  { value: "shenzhen", label: "深圳" },
  { value: "chengdu", label: "成都" },
];
const cityQuery = ref("");
const filteredCities = computed(() => {
  const q = cityQuery.value.trim();
  return q === "" ? cities : cities.filter(city => city.label.includes(q));
});
const skills = ref<string[]>(["Vue", "TypeScript"]);
const steps = ["已完成", "进行中", "待开始"];
const ranges = [
  { value: "day", label: "1 天" },
  { value: "week", label: "7 天" },
  { value: "month", label: "1 月" },
  { value: "year", label: "1 年" },
  { value: "all", label: "全部" },
];
const statuses = [
  { tone: "success", label: "成功" },
  { tone: "danger", label: "错误" },
  { tone: "neutral", label: "默认" },
  { tone: "brand", label: "处理中" },
  { tone: "warning", label: "警告" },
] as const;
const members = [
  { label: "曦", tone: "brand" },
  { label: "寒", tone: "success" },
  { label: "懿", tone: "warning" },
  { label: "承", tone: "info" },
  { label: "启", tone: "danger" },
] as const;
const moreActions = [
  { value: "duplicate", label: "复制项目" },
  { value: "share", label: "共享给成员" },
  { value: "archive", label: "归档" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
const sales = [
  { month: "一月", amount: 1204 },
  { month: "二月", amount: 986 },
  { month: "三月", amount: 1530 },
  { month: "四月", amount: 1382 },
  { month: "五月", amount: 1745 },
  { month: "六月", amount: 1618 },
];
const visits = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548];
const events = [
  { tone: "success", at: "2026-10-08T09:12", label: "09:12", title: "构建通过", description: "全部检查均已通过" },
  { tone: "info", at: "2026-10-08T09:20", label: "09:20", title: "灰度发布", description: "一成流量切到新版本" },
  { tone: "warning", at: "2026-10-08T09:41", label: "09:41", title: "响应变慢", description: "已自动扩容一台实例" },
  { tone: undefined, at: "2026-10-08T10:05", label: "10:05", title: "全量上线", description: "等待值班同学确认" },
] as const;
const faqs = [
  { value: "install", label: "怎么安装", content: "装好组件包与样式包，样式在入口引入一次即可。" },
  { value: "theme", label: "怎么换主题", content: "复制本页导出的 CSS 与接入代码，品牌色与视觉环境随之生效。" },
  { value: "a11y", label: "键盘怎么操作", content: "方向键在标题之间移动焦点，回车或空格展开与收起。" },
];
const columns = [
  { id: "name", label: "成员" },
  { id: "role", label: "角色", width: "5rem" },
  { id: "status", label: "状态", width: "5rem" },
];
const people = [
  { id: "u1", name: "赵一", role: "管理员", status: "在线", tone: "success" },
  { id: "u2", name: "钱二", role: "开发者", status: "忙碌", tone: "warning" },
  { id: "u3", name: "孙三", role: "开发者", status: "离线", tone: "neutral" },
  { id: "u4", name: "李四", role: "访客", status: "在线", tone: "success" },
] as const;
const rows = people.map(person => ({ id: person.id }));
const trail = [
  { value: "home", label: "工作台", href: "#" },
  { value: "orders", label: "订单", href: "#" },
  { value: "detail", label: "订单详情", current: true },
];
const order = [
  { label: "订单号", value: "XH-20261008-0042" },
  { label: "下单时间", value: "2026-10-08 09:31" },
  { label: "支付方式", value: "余额支付" },
  { label: "实付金额", value: "¥ 3,240.00" },
];
const notificationTranslations = { close: "关闭" };
</script>

<template>
  <div ref="root" class="xh-preview">
    <div class="xh-preview__column">
      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <div class="xh-preview__pair">
            <XhTextFieldRoot name="preview-email" type="email" placeholder="hi@example.com">
              <XhTextFieldLabel>邮箱</XhTextFieldLabel>
              <XhTextFieldControl>
                <XhTextFieldInput />
              </XhTextFieldControl>
            </XhTextFieldRoot>
            <XhSelectRoot
              :collection="fruits"
              :default-value="['apple', 'banana']"
              multiple
              label="水果"
              placeholder="请选择"
            />
          </div>
          <XhDatePickerRoot v-slot="{ weeks, weekDays }" locale="zh-CN" name="preview-date">
            <XhDatePickerLabel>交付日期</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                <XhDatePickerSegment :index="0" />
                <span>/</span>
                <XhDatePickerSegment :index="1" />
                <span>/</span>
                <XhDatePickerSegment :index="2" />
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
              <XhDatePickerTrigger />
            </XhDatePickerControl>
            <XhDatePickerHiddenInput />
            <XhDatePickerPositioner>
              <XhDatePickerContent>
                <XhDatePickerCalendar>
                  <XhDatePickerHeader>
                    <XhDatePickerPrevTrigger aria-label="上个月" />
                    <XhDatePickerHeading />
                    <XhDatePickerNextTrigger aria-label="下个月" />
                  </XhDatePickerHeader>
                  <XhDatePickerGrid>
                    <XhDatePickerGridHead>
                      <XhDatePickerWeekRow>
                        <XhDatePickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                      </XhDatePickerWeekRow>
                    </XhDatePickerGridHead>
                    <XhDatePickerGridBody>
                      <XhDatePickerWeekRow v-for="week in weeks" :key="week[0].start">
                        <XhDatePickerCell v-for="day in week" :key="day.start" :value="day.start">
                          <XhDatePickerCellTrigger>{{ day.day }}</XhDatePickerCellTrigger>
                        </XhDatePickerCell>
                      </XhDatePickerWeekRow>
                    </XhDatePickerGridBody>
                  </XhDatePickerGrid>
                </XhDatePickerCalendar>
              </XhDatePickerContent>
            </XhDatePickerPositioner>
          </XhDatePickerRoot>
          <div class="xh-preview__row">
            <XhCheckbox name="preview-apple" default-checked>
              苹果
            </XhCheckbox>
            <XhCheckbox name="preview-pear">
              梨
            </XhCheckbox>
          </div>
          <XhRadioGroupRoot
            :collection="fruitRadios"
            default-value="apple"
            label="单选"
            orientation="horizontal"
            name="preview-fruit"
          />
          <div class="xh-preview__row">
            <XhSwitch name="preview-switch" default-checked aria-label="开关" />
            <XhSpinner label="加载中" />
          </div>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <XhPasswordInputRoot
            name="preview-password"
            default-value="xihan-2026"
            :translations="{ visibilityTriggerShow: '显示密码', visibilityTriggerHide: '隐藏密码' }"
          >
            <XhPasswordInputLabel>登录密码</XhPasswordInputLabel>
            <XhPasswordInputControl>
              <XhPasswordInputInput />
              <XhPasswordInputVisibilityTrigger />
            </XhPasswordInputControl>
          </XhPasswordInputRoot>
          <div class="xh-preview__pair">
            <XhNumberFieldRoot default-value="30" :min="5" :max="120" name="preview-timeout">
              <XhNumberFieldLabel>会话时长（分钟）</XhNumberFieldLabel>
              <XhNumberFieldControl>
                <XhNumberFieldDecrementTrigger />
                <XhNumberFieldInput />
                <XhNumberFieldIncrementTrigger />
              </XhNumberFieldControl>
            </XhNumberFieldRoot>
            <XhComboboxRoot
              v-model:input-value="cityQuery"
              :collection="filteredCities"
              label="常驻城市"
              empty="没有匹配的城市"
              open-on-click
              placeholder="搜索城市"
            />
          </div>
          <XhTagsInputRoot v-slot="{ value }" v-model:value="skills" placeholder="回车添加">
            <XhTagsInputLabel>技术栈</XhTagsInputLabel>
            <XhTagsInputControl>
              <XhTagsInputItem v-for="skill in value" :key="skill" :value="skill">
                <XhTagsInputItemPreview>
                  <XhTagsInputItemText>{{ skill }}</XhTagsInputItemText>
                  <XhTagsInputItemDeleteTrigger />
                </XhTagsInputItemPreview>
              </XhTagsInputItem>
              <XhTagsInputInput />
            </XhTagsInputControl>
          </XhTagsInputRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhStepsRoot :count="steps.length" :default-value="1">
            <XhStepsList>
              <XhStepsItem v-for="(title, i) in steps" :key="title" :value="i">
                <XhStepsTrigger>
                  <XhStepsIndicator>{{ i < 1 ? "" : i + 1 }}</XhStepsIndicator>
                  <XhStepsTitle>{{ title }}</XhStepsTitle>
                </XhStepsTrigger>
                <XhStepsSeparator />
              </XhStepsItem>
            </XhStepsList>
          </XhStepsRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <XhProgress :value="50" aria-label="上传进度" />
          <XhProgress :value="70" tone="danger" aria-label="磁盘占用" />
          <div class="xh-preview__row xh-preview__row--around">
            <XhProgress variant="circle" :value="30" size="sm" aria-label="本周完成度" />
            <XhProgress variant="circle" :value="72" size="sm" aria-label="本月完成度" />
            <XhProgress variant="circle" :value="100" size="sm" tone="success" aria-label="季度完成度" />
          </div>
          <div class="xh-preview__row">
            <XhTagRoot v-for="status in statuses" :key="status.label" :tone="status.tone">
              <XhTagLabel>{{ status.label }}</XhTagLabel>
            </XhTagRoot>
          </div>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <XhRatingRoot v-slot="{ items }" :default-value="3">
            <XhRatingLabel>满意度</XhRatingLabel>
            <XhRatingControl>
              <XhRatingItem v-for="i in items" :key="i" :value="i" />
            </XhRatingControl>
          </XhRatingRoot>
          <XhRadioGroupRoot variant="segmented" :collection="ranges" default-value="day" label="统计区间" size="sm" />
          <XhSliderRoot v-slot="{ value }" :default-value="[40]" :min="0" :max="100" name="preview-volume">
            <XhSliderLabel>音量：{{ value[0] }}</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb />
            </XhSliderControl>
          </XhSliderRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhNotificationRoot v-slot="{ create, dismiss }">
            <div class="xh-preview__toolbar">
              <XhToggleGroupRoot :default-value="['bold']" multiple size="sm">
                <XhToggleGroupItem value="bold" aria-label="粗体">
                  <XhIcon :icon="BoldIcon" />
                </XhToggleGroupItem>
                <XhToggleGroupItem value="italic" aria-label="斜体">
                  <XhIcon :icon="ItalicIcon" />
                </XhToggleGroupItem>
                <XhToggleGroupItem value="underline" aria-label="下划线">
                  <XhIcon :icon="UnderlineIcon" />
                </XhToggleGroupItem>
                <XhToggleGroupItem value="strike" aria-label="删除线">
                  <XhIcon :icon="StrikethroughIcon" />
                </XhToggleGroupItem>
              </XhToggleGroupRoot>
              <XhToggle size="sm" default-pressed>
                <XhIcon :icon="HeartIcon" />
                收藏
              </XhToggle>
              <XhTooltipRoot>
                <XhTooltipTrigger as-child>
                  <XhButton size="sm" @click="create({ title: '草稿已保存', description: '内容已同步到云端' })">
                    保存
                  </XhButton>
                </XhTooltipTrigger>
                <XhTooltipPositioner>
                  <XhTooltipContent>
                    保存草稿 <XhKbd :keys="['Mod', 'S']" />
                    <XhTooltipArrow />
                  </XhTooltipContent>
                </XhTooltipPositioner>
              </XhTooltipRoot>
            </div>
            <XhNotificationGroup>
              <template #default="{ item }">
                <XhNotificationItem
                  :id="item.id"
                  :title="item.title"
                  :description="item.description"
                  :tone="item.tone"
                  :duration="item.duration"
                  :closable="item.closable"
                  :translations="notificationTranslations"
                  @status-change="({ id, status }) => status === 'unmounted' && dismiss(id)"
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
          <p class="xh-preview__muted">
            按 <XhKbd :keys="['Mod', 'K']" /> 打开命令面板
          </p>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhFileUploadRoot v-slot="{ acceptedFiles }">
            <XhFileUploadLabel>附件</XhFileUploadLabel>
            <XhFileUploadDropzone>
              <span>把文件拖到这里</span>
            </XhFileUploadDropzone>
            <div>
              <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
            </div>
            <XhFileUploadHiddenInput />
            <XhFileUploadList>
              <XhFileUploadItem v-for="file in acceptedFiles" :key="file" :file="file">
                <XhFileUploadItemPreview />
                <XhFileUploadItemName />
                <XhFileUploadItemSizeText />
                <XhFileUploadItemDeleteTrigger />
              </XhFileUploadItem>
            </XhFileUploadList>
          </XhFileUploadRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhPaginationRoot v-slot="{ pages }" :count="50" :page-size="10">
            <XhPaginationPrevTrigger />
            <template v-for="(p, i) in pages" :key="`${p}-${i}`">
              <XhPaginationEllipsisTrigger v-if="p === 'ellipsis'" />
              <XhPaginationItem v-else :value="p">
                {{ p }}
              </XhPaginationItem>
            </template>
            <XhPaginationNextTrigger />
          </XhPaginationRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhEmptyStateRoot>
            <XhEmptyStateIndicator>
              <XhIcon :icon="InboxIcon" />
            </XhEmptyStateIndicator>
            <XhEmptyStateTitle>还没有消息</XhEmptyStateTitle>
            <XhEmptyStateDescription>有新的评论或提及时会出现在这里。</XhEmptyStateDescription>
            <XhEmptyStateAction>
              <XhButton variant="subtle" size="sm">
                去看看动态
              </XhButton>
            </XhEmptyStateAction>
          </XhEmptyStateRoot>
        </XhCardContent>
      </XhCardRoot>
    </div>

    <div class="xh-preview__column">
      <XhCardRoot>
        <XhCardContent class="xh-preview__stack xh-preview__center">
          <XhAvatarGroupRoot>
            <XhAvatarRoot v-for="member in members" :key="member.label" :tone="member.tone">
              <XhAvatarFallback>{{ member.label }}</XhAvatarFallback>
            </XhAvatarRoot>
          </XhAvatarGroupRoot>
          <div>
            <p class="xh-preview__title">
              验证账号
            </p>
            <p class="xh-preview__muted">
              验证码已发送至 a****@example.com
            </p>
          </div>
          <XhPinInputRoot :length="6" placeholder="·">
            <XhPinInputLabel class="xh-preview__sr">
              验证码
            </XhPinInputLabel>
            <div class="xh-preview__pin">
              <XhPinInputInput v-for="i in 6" :key="i" :index="i - 1" />
            </div>
          </XhPinInputRoot>
          <p class="xh-preview__muted">
            没收到验证码？<span class="xh-preview__link">重新发送</span>
          </p>
          <div class="xh-preview__row xh-preview__row--center">
            <XhButton>主要按钮</XhButton>
            <XhButton variant="outline" tone="danger">
              危险按钮
            </XhButton>
            <XhButton variant="outline">
              描边按钮
            </XhButton>
            <XhButton variant="subtle">
              浅色按钮
            </XhButton>
          </div>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <div class="xh-preview__profile">
            <XhBadge dot tone="success" placement="bottom-end" label="在线">
              <XhAvatarRoot tone="brand" size="lg">
                <XhAvatarFallback>曦</XhAvatarFallback>
              </XhAvatarRoot>
            </XhBadge>
            <div>
              <p class="xh-preview__title">
                曦寒懿
              </p>
              <p class="xh-preview__muted">
                @xihanfun
              </p>
              <p class="xh-preview__text">
                快速、轻量、高效、用心的开源生态。
              </p>
            </div>
          </div>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhCartesianChartRoot
            :data="sales"
            :series="[{ mark: 'bar', x: 'month', y: 'amount', name: '销售额' }]"
          >
            <template #caption>
              月度销售额
            </template>
          </XhCartesianChartRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <div class="xh-preview__stats">
            <XhStatisticRoot>
              <XhStatisticLabel>本月新增用户</XhStatisticLabel>
              <XhStatisticValue>12,480</XhStatisticValue>
            </XhStatisticRoot>
            <XhStatisticRoot>
              <XhStatisticLabel>转化率</XhStatisticLabel>
              <XhStatisticValue>23.6%</XhStatisticValue>
            </XhStatisticRoot>
          </div>
          <XhSparkline :data="visits" aria-label="近 12 周访问量" />
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhTimelineRoot>
            <XhTimelineItem v-for="event in events" :key="event.at" :tone="event.tone">
              <XhTimelineIndicator />
              <XhTimelineConnector />
              <XhTimelineContent>
                <XhTimelineTime :datetime="event.at">
                  {{ event.label }}
                </XhTimelineTime>
                <XhTimelineTitle>{{ event.title }}</XhTimelineTitle>
                <XhTimelineDescription>{{ event.description }}</XhTimelineDescription>
              </XhTimelineContent>
            </XhTimelineItem>
          </XhTimelineRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhAccordionRoot :collection="faqs" :default-value="['theme']" />
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhSkeletonRoot>
            <XhSkeletonItem shape="rect" class="xh-preview__skeleton-cover" />
            <XhSkeletonItem class="xh-preview__skeleton-long" />
            <XhSkeletonItem class="xh-preview__skeleton-short" />
          </XhSkeletonRoot>
        </XhCardContent>
      </XhCardRoot>
    </div>

    <div class="xh-preview__column">
      <XhCardRoot>
        <XhCardContent class="xh-preview__stack xh-preview__center">
          <XhAvatarRoot tone="brand" size="lg">
            <XhAvatarFallback>曦</XhAvatarFallback>
          </XhAvatarRoot>
          <div>
            <p class="xh-preview__title">
              创建账号
            </p>
            <p class="xh-preview__muted">
              免费试用 7 天，无需绑定支付方式。
            </p>
          </div>
          <XhButton class="xh-preview__block">
            开始使用
          </XhButton>
          <XhSeparator />
          <XhButton class="xh-preview__block" variant="outline" tone="neutral">
            使用 GitHub 继续
          </XhButton>
          <XhButton class="xh-preview__block" variant="outline" tone="neutral">
            使用 Gitee 继续
          </XhButton>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhCalendarPickerRoot
            v-slot="{ weeks, weekDays }"
            :default-value="['2026-10-18']"
            default-focused-value="2026-10-08"
            locale="zh-CN"
            fixed-weeks
          >
            <XhCalendarPickerHeader>
              <XhCalendarPickerPrevTrigger aria-label="上个月" />
              <XhCalendarPickerHeading />
              <XhCalendarPickerNextTrigger aria-label="下个月" />
            </XhCalendarPickerHeader>
            <XhCalendarPickerGrid>
              <XhCalendarPickerGridHead>
                <XhCalendarPickerWeekRow>
                  <XhCalendarPickerWeekDay v-for="d in weekDays" :key="d.value" :value="d.value" />
                </XhCalendarPickerWeekRow>
              </XhCalendarPickerGridHead>
              <XhCalendarPickerGridBody>
                <XhCalendarPickerWeekRow v-for="week in weeks" :key="week[0].start">
                  <XhCalendarPickerCell v-for="day in week" :key="day.start" :value="day.start">
                    <XhCalendarPickerCellTrigger>{{ day.day }}</XhCalendarPickerCellTrigger>
                  </XhCalendarPickerCell>
                </XhCalendarPickerWeekRow>
              </XhCalendarPickerGridBody>
            </XhCalendarPickerGrid>
          </XhCalendarPickerRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <div>
            <p class="xh-preview__title">
              删除项目
            </p>
            <p class="xh-preview__text">
              删除后项目里的数据无法恢复，确定继续吗？
            </p>
          </div>
          <div class="xh-preview__row xh-preview__row--end">
            <XhButton variant="outline" tone="neutral" size="sm">
              取消
            </XhButton>
            <XhButton tone="danger" size="sm">
              删除
            </XhButton>
          </div>
        </XhCardContent>
      </XhCardRoot>

      <XhAlertRoot tone="success">
        <XhAlertContent>
          <XhAlertTitle>部署完成</XhAlertTitle>
          <XhAlertDescription>所有检查均已通过，新版本已对外提供服务。</XhAlertDescription>
        </XhAlertContent>
      </XhAlertRoot>

      <XhAlertRoot tone="warning">
        <XhAlertContent>
          <XhAlertTitle>配额即将用尽</XhAlertTitle>
          <XhAlertDescription>本月还可处理 120 次请求。</XhAlertDescription>
        </XhAlertContent>
        <XhAlertAction>
          <XhButton size="sm" variant="outline" tone="neutral">
            查看用量
          </XhButton>
        </XhAlertAction>
      </XhAlertRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhTabsRoot default-value="overview">
            <XhTabsList aria-label="项目视图">
              <XhTabsTrigger value="overview">
                概览
              </XhTabsTrigger>
              <XhTabsTrigger value="members">
                成员
              </XhTabsTrigger>
              <XhTabsTrigger value="settings">
                设置
              </XhTabsTrigger>
              <XhTabsIndicator />
            </XhTabsList>
            <XhTabsContent value="overview">
              最近 7 天共有 12 次部署，全部成功。
            </XhTabsContent>
            <XhTabsContent value="members">
              当前项目有 5 位成员。
            </XhTabsContent>
            <XhTabsContent value="settings">
              在这里调整项目的通知与权限。
            </XhTabsContent>
          </XhTabsRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent>
          <XhTableRoot :columns="columns" :rows="rows" aria-label="项目成员">
            <XhTableHeader>
              <XhTableRow>
                <XhTableColumnHeader v-for="col in columns" :key="col.id" :value="col.id">
                  <XhTableColumnLabel>{{ col.label }}</XhTableColumnLabel>
                </XhTableColumnHeader>
              </XhTableRow>
            </XhTableHeader>
            <XhTableBody>
              <XhTableRow v-for="person in people" :key="person.id" :value="person.id">
                <XhTableCell value="name">
                  {{ person.name }}
                </XhTableCell>
                <XhTableCell value="role">
                  {{ person.role }}
                </XhTableCell>
                <XhTableCell value="status">
                  <XhTagRoot :tone="person.tone" size="sm">
                    <XhTagLabel>{{ person.status }}</XhTagLabel>
                  </XhTagRoot>
                </XhTableCell>
              </XhTableRow>
            </XhTableBody>
          </XhTableRoot>
        </XhCardContent>
      </XhCardRoot>

      <XhCardRoot>
        <XhCardContent class="xh-preview__stack">
          <XhBreadcrumbRoot :collection="trail" />
          <div class="xh-preview__head">
            <p class="xh-preview__title">
              订单详情
            </p>
            <XhMenuRoot :collection="moreActions" trigger-as-child>
              <template #trigger>
                <XhButton variant="ghost" tone="neutral" size="sm">
                  更多
                  <XhIcon :icon="ChevronDownIcon" />
                </XhButton>
              </template>
            </XhMenuRoot>
          </div>
          <XhDescriptionsRoot placement="left">
            <XhDescriptionsItem v-for="row in order" :key="row.label">
              <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
              <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
            </XhDescriptionsItem>
          </XhDescriptionsRoot>
          <div class="xh-preview__row xh-preview__row--end">
            <XhPopconfirmRoot size="sm">
              <XhPopconfirmTrigger as-child>
                <XhButton variant="outline" tone="danger" size="sm">
                  撤销订单
                </XhButton>
              </XhPopconfirmTrigger>
              <XhPopconfirmPositioner>
                <XhPopconfirmContent data-tone="danger">
                  <XhPopconfirmTitle>撤销这笔订单？</XhPopconfirmTitle>
                  <XhPopconfirmDescription>款项会原路退回，撤销后无法恢复。</XhPopconfirmDescription>
                  <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
                  <XhPopconfirmConfirmTrigger>撤销</XhPopconfirmConfirmTrigger>
                  <XhPopconfirmArrow />
                </XhPopconfirmContent>
              </XhPopconfirmPositioner>
            </XhPopconfirmRoot>
            <XhButton size="sm">
              确认收货
            </XhButton>
          </div>
        </XhCardContent>
      </XhCardRoot>
    </div>
  </div>
</template>

<style scoped>
.xh-preview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--xh-space-4);
  align-items: start;
  padding: var(--xh-space-5);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  color: var(--xh-fg-default);
  /* 预览区是一块页面：白卡放在页面底上，层级交给描边与底色差 */
  background: var(--xh-bg-page);
}

.xh-preview__column {
  display: grid;
  gap: var(--xh-space-4);
  align-items: start;
  min-width: 0;
}

/* 卡片内容区自带纵向排列，这里只放大条目间距 */
.xh-preview__stack {
  --xh-card-content-gap: var(--xh-space-4);
}

.xh-preview__pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--xh-space-3);
}

.xh-preview__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-3);
}

.xh-preview__row--center {
  justify-content: center;
}

.xh-preview__row--end {
  justify-content: flex-end;
}

.xh-preview__row--around {
  justify-content: space-around;
}

.xh-preview__center {
  align-items: center;
  text-align: center;
}

.xh-preview__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--xh-space-3);
}

.xh-preview__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-2);
  margin-block-end: var(--xh-space-3);
}

.xh-preview__profile {
  display: flex;
  align-items: flex-start;
  gap: var(--xh-space-4);
}

.xh-preview__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--xh-space-4);
}

.xh-preview__pin {
  display: flex;
}

.xh-preview__block {
  inline-size: 100%;
}

.xh-preview__skeleton-cover {
  --xh-skeleton-rect-block-size: calc(var(--xh-control-h-lg) * 2);
}

.xh-preview__skeleton-long {
  inline-size: 80%;
}

.xh-preview__skeleton-short {
  inline-size: 50%;
}

.xh-preview__title {
  margin: 0;
  color: var(--xh-fg-default);
  font-size: var(--xh-font-size-md);
  font-weight: var(--xh-font-weight-semibold);
  line-height: 24px;
}

.xh-preview__muted {
  margin: 0;
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
  line-height: 22px;
}

.xh-preview__text {
  margin: var(--xh-space-1) 0 0;
  color: var(--xh-fg-default);
  font-size: var(--xh-font-size-sm);
  line-height: 22px;
}

.xh-preview__link {
  color: var(--xh-fg-brand);
}

.xh-preview__sr {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* 两栏时第三栏横跨整行，内部再分两栏，避免右下角空出一块 */
@media (max-width: 1199px) {
  .xh-preview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .xh-preview__column:last-child {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .xh-preview {
    grid-template-columns: minmax(0, 1fr);
    padding: var(--xh-space-3);
  }

  .xh-preview__column:last-child {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
