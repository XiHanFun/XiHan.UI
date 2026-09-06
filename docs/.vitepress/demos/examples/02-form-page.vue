<!-- 表单页 | 一张值表喂七种控件：字段、文本框、下拉、单选组、数字、标签输入、滑块、开关、复选框同框，校验与错误摘要统一走表单 -->
<script setup lang="ts">
import type { RadioGroupNode, SelectNode } from "@xihan-ui/headless";
import {
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhCheckbox,
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhFormErrorSummary,
  XhFormErrorSummaryItem,
  XhFormFieldGroup,
  XhFormResetTrigger,
  XhFormRoot,
  XhFormSubmitTrigger,
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
  XhPageHeaderDescription,
  XhPageHeaderRoot,
  XhPageHeaderTitle,
  XhRadioGroupRoot,
  XhSelectRoot,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSwitch,
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
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const priorities: SelectNode[] = [
  { value: "p0", label: "P0 · 阻断" },
  { value: "p1", label: "P1 · 严重" },
  { value: "p2", label: "P2 · 一般" },
];

const kinds: RadioGroupNode[] = [
  { value: "bug", label: "缺陷" },
  { value: "feature", label: "需求" },
  { value: "ask", label: "咨询" },
];

const defaults = {
  title: "",
  detail: "",
  priority: ["p2"],
  kind: "bug",
  amount: "1",
  labels: [] as string[],
  impact: [40],
  notify: true,
  agree: false,
};

const submitted = ref("");

// 整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
function validate(values: Record<string, unknown>) {
  const title = String(values.title ?? "").trim();
  const detail = String(values.detail ?? "").trim();
  return {
    title: title ? "" : "标题不能为空",
    detail: detail.length >= 8 ? "" : "把现象说满 8 个字，值班的人才接得住",
    agree: values.agree === true ? "" : "要先确认这条工单可以对内公开",
  };
}

function onSubmit(details: { values: Record<string, unknown> }) {
  submitted.value = JSON.stringify(details.values);
}
</script>

<template>
  <div class="form-page">
    <XhPageHeaderRoot>
      <XhPageHeaderTitle>新建工单</XhPageHeaderTitle>
      <XhPageHeaderDescription>提交后进入值班队列，重复问题会被合并</XhPageHeaderDescription>
    </XhPageHeaderRoot>

    <XhAlertRoot tone="info">
      <XhAlertTitle>先看一眼已知问题</XhAlertTitle>
      <XhAlertDescription>近三天同类工单 12 条，其中 9 条已定位到同一处配置。</XhAlertDescription>
    </XhAlertRoot>

    <XhFormRoot
      class="form-page__form"
      :default-values="defaults"
      :validate="validate"
      @submit="onSubmit"
    >
      <!-- 摘要只在提交失败后显形，条目一次全写上 -->
      <XhFormErrorSummary v-slot="{ errorCount }">
        <span>共 {{ errorCount }} 处需要修改</span>
        <XhFormErrorSummaryItem v-slot="{ error }" value="title">{{ error }}</XhFormErrorSummaryItem>
        <XhFormErrorSummaryItem v-slot="{ error }" value="detail">{{ error }}</XhFormErrorSummaryItem>
        <XhFormErrorSummaryItem v-slot="{ error }" value="agree">{{ error }}</XhFormErrorSummaryItem>
      </XhFormErrorSummary>

      <XhFieldsetRoot class="form-page__group">
        <XhFieldsetLegend>问题本身</XhFieldsetLegend>

        <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="title">
          <XhFieldRoot :invalid="invalid" required>
            <XhFieldLabel>标题</XhFieldLabel>
            <XhFieldControl>
              <input
                :value="value"
                placeholder="一句话说清现象"
                @input="setValue(($event.target as HTMLInputElement).value)"
              >
            </XhFieldControl>
            <XhFieldErrorText>{{ error }}</XhFieldErrorText>
          </XhFieldRoot>
        </XhFormFieldGroup>

        <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="detail">
          <XhFieldRoot :invalid="invalid" required>
            <XhFieldLabel>详细描述</XhFieldLabel>
            <XhFieldControl>
              <XhTextFieldRoot
                :value="String(value ?? '')"
                :invalid="invalid"
                placeholder="复现步骤、期望结果、实际结果"
                @update:value="setValue($event)"
              >
                <XhTextFieldControl>
                  <XhTextFieldInput as="textarea" rows="3" />
                </XhTextFieldControl>
              </XhTextFieldRoot>
            </XhFieldControl>
            <XhFieldDescription>写清复现步骤，值班的人不必再来回问</XhFieldDescription>
            <XhFieldErrorText>{{ error }}</XhFieldErrorText>
          </XhFieldRoot>
        </XhFormFieldGroup>

        <div class="form-page__row">
          <XhFormFieldGroup v-slot="{ value, setValue }" value="priority">
            <XhSelectRoot
              :collection="priorities"
              :value="(value as string[])"
              label="优先级"
              placeholder="请选择"
              @update:value="setValue($event)"
            />
          </XhFormFieldGroup>

          <XhFormFieldGroup v-slot="{ value, setValue }" value="amount">
            <XhNumberFieldRoot
              :value="String(value ?? '')"
              :min="1"
              :max="99"
              @update:value="setValue($event)"
            >
              <XhNumberFieldLabel>受影响实例</XhNumberFieldLabel>
              <XhNumberFieldControl>
                <XhNumberFieldDecrementTrigger />
                <XhNumberFieldInput />
                <XhNumberFieldIncrementTrigger />
              </XhNumberFieldControl>
            </XhNumberFieldRoot>
          </XhFormFieldGroup>
        </div>

        <XhFormFieldGroup v-slot="{ value, setValue }" value="kind">
          <XhRadioGroupRoot
            :collection="kinds"
            :value="(value as string)"
            label="工单类型"
            @update:value="setValue($event)"
          />
        </XhFormFieldGroup>

        <XhFormFieldGroup v-slot="{ value, setValue }" value="labels">
          <XhTagsInputRoot
            v-slot="{ value: tags }"
            :value="(value as string[])"
            placeholder="回车落一个"
            @update:value="setValue($event)"
          >
            <XhTagsInputLabel>关联模块</XhTagsInputLabel>
            <XhTagsInputControl>
              <XhTagsInputItem v-for="tag in tags" :key="tag" :value="tag">
                <XhTagsInputItemPreview>
                  <XhTagsInputItemText>{{ tag }}</XhTagsInputItemText>
                  <XhTagsInputItemDeleteTrigger />
                </XhTagsInputItemPreview>
              </XhTagsInputItem>
              <XhTagsInputInput />
            </XhTagsInputControl>
          </XhTagsInputRoot>
        </XhFormFieldGroup>

        <XhFormFieldGroup v-slot="{ value, setValue }" value="impact">
          <XhSliderRoot
            v-slot="{ value: impact }"
            :value="(value as number[])"
            :min="0"
            :max="100"
            :step="5"
            :large-step="20"
            @update:value="setValue($event)"
          >
            <XhSliderLabel>影响面估计：{{ impact[0] }}%</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb />
            </XhSliderControl>
          </XhSliderRoot>
        </XhFormFieldGroup>
      </XhFieldsetRoot>

      <XhFieldsetRoot class="form-page__group">
        <XhFieldsetLegend>提交之前</XhFieldsetLegend>

        <XhFormFieldGroup v-slot="{ value, setValue }" value="notify">
          <label class="form-page__check">
            <XhSwitch :checked="value === true" @update:checked="setValue($event)" />
            有进展就通知我
          </label>
        </XhFormFieldGroup>

        <XhFormFieldGroup v-slot="{ value, error, invalid, setValue }" value="agree">
          <XhFieldRoot :invalid="invalid" required>
            <label class="form-page__check">
              <XhCheckbox
                :checked="value === true"
                :invalid="invalid"
                @update:checked="setValue($event)"
              />
              这条工单可以对内公开
            </label>
            <XhFieldErrorText>{{ error }}</XhFieldErrorText>
          </XhFieldRoot>
        </XhFormFieldGroup>
      </XhFieldsetRoot>

      <div class="form-page__actions">
        <XhFormSubmitTrigger>提交工单</XhFormSubmitTrigger>
        <XhFormResetTrigger>重置</XhFormResetTrigger>
      </div>

      <p v-if="submitted" class="form-page__result">已提交：{{ submitted }}</p>
    </XhFormRoot>
  </div>
</template>

<style scoped>
.form-page {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-4);
  inline-size: 100%;
  max-inline-size: 560px;
}

.form-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-4);
}

.form-page__group {
  display: flex;
  flex-direction: column;
  gap: var(--xh-space-4);
}

/* 两栏并排，窄屏落回一栏 */
.form-page__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--xh-space-4);
  align-items: end;
}

.form-page__check {
  display: flex;
  align-items: center;
  gap: var(--xh-space-2);
  font-size: var(--xh-font-size-md);
}

.form-page__actions {
  display: flex;
  gap: var(--xh-space-2);
}

.form-page__result {
  margin: 0;
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
  word-break: break-all;
}
</style>
