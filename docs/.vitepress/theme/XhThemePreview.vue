<script setup lang="ts">
import { brandId } from "@xihan-ui/tokens/runtime";
import {
  provideXhConfig,
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhAvatarFallback,
  XhAvatarGroupRoot,
  XhAvatarRoot,
  XhBadge,
  XhButton,
  XhCardContent,
  XhCardRoot,
  XhCheckbox,
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
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
  XhProgress,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingItem,
  XhRatingLabel,
  XhRatingRoot,
  XhSelectRoot,
  XhSeparator,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
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
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTagLabel,
  XhTagRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

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
            name="preview-fruit"
          />
          <div class="xh-preview__row">
            <XhSwitch name="preview-switch" default-checked aria-label="开关" />
            <XhSpinner label="加载中" />
          </div>
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

      <XhAlertRoot tone="success">
        <XhAlertContent>
          <XhAlertTitle>部署完成</XhAlertTitle>
          <XhAlertDescription>所有检查均已通过，新版本已对外提供服务。</XhAlertDescription>
        </XhAlertContent>
      </XhAlertRoot>

      <XhCardRoot>
        <XhCardContent>
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
  /* 淡底是半透明的墨色比例，叠在预览自己的画布色上 */
  background: linear-gradient(var(--xh-bg-subtle), var(--xh-bg-subtle)), var(--xh-bg-canvas);
}

.xh-preview__column {
  display: grid;
  gap: var(--xh-space-4);
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

.xh-preview__center {
  align-items: center;
  text-align: center;
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

@media (max-width: 1199px) {
  .xh-preview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .xh-preview {
    grid-template-columns: minmax(0, 1fr);
    padding: var(--xh-space-3);
  }
}
</style>
