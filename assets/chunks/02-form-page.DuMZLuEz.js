const e=`// 表单页 | 一张值表喂七种控件：字段、文本框、下拉、单选组、数字、标签输入、滑块、开关、复选框同框，校验与错误摘要统一走表单
import type { FormErrorPatch, FormSubmitDetails, FormValues, RadioGroupNode, SelectNode } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
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
} from "@xihan-ui/react";
import { useState } from "react";

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

// 整表跑一遍，返回「字段名 → 错误文案」；空串表示这条没错
function validate(values: FormValues): FormErrorPatch {
  const title = String(values.title ?? "").trim();
  const detail = String(values.detail ?? "").trim();
  return {
    title: title ? "" : "标题不能为空",
    detail: detail.length >= 8 ? "" : "把现象说满 8 个字，值班的人才接得住",
    agree: values.agree === true ? "" : "要先确认这条工单可以对内公开",
  };
}

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-4)",
  inlineSize: "100%",
  maxInlineSize: "560px",
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-4)",
};

const groupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--xh-space-4)",
};

// 两栏并排，窄屏落回一栏
const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "var(--xh-space-4)",
  alignItems: "end",
};

const checkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--xh-space-2)",
  fontSize: "var(--xh-font-size-md)",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: "var(--xh-space-2)",
};

const resultStyle: CSSProperties = {
  margin: 0,
  color: "var(--xh-fg-muted)",
  fontSize: "var(--xh-font-size-sm)",
  wordBreak: "break-all",
};

export default function Demo(): ReactNode {
  const [submitted, setSubmitted] = useState("");

  function onSubmit(details: FormSubmitDetails): void {
    setSubmitted(JSON.stringify(details.values));
  }

  return (
    <div style={pageStyle}>
      <XhPageHeaderRoot>
        <XhPageHeaderTitle>新建工单</XhPageHeaderTitle>
        <XhPageHeaderDescription>提交后进入值班队列，重复问题会被合并</XhPageHeaderDescription>
      </XhPageHeaderRoot>

      <XhAlertRoot tone="info">
        <XhAlertTitle>先看一眼已知问题</XhAlertTitle>
        <XhAlertDescription>近三天同类工单 12 条，其中 9 条已定位到同一处配置。</XhAlertDescription>
      </XhAlertRoot>

      <XhFormRoot
        style={formStyle}
        defaultValues={defaults}
        validate={validate}
        onSubmit={onSubmit}
      >
        {/* 摘要只在提交失败后显形，条目一次全写上 */}
        <XhFormErrorSummary>
          {({ errorCount }) => (
            <>
              <span>{\`共 \${errorCount} 处需要修改\`}</span>
              <XhFormErrorSummaryItem name="title">{({ error }) => error}</XhFormErrorSummaryItem>
              <XhFormErrorSummaryItem name="detail">{({ error }) => error}</XhFormErrorSummaryItem>
              <XhFormErrorSummaryItem name="agree">{({ error }) => error}</XhFormErrorSummaryItem>
            </>
          )}
        </XhFormErrorSummary>

        <XhFieldsetRoot style={groupStyle}>
          <XhFieldsetLegend>问题本身</XhFieldsetLegend>

          <XhFormFieldGroup name="title">
            {({ value, error, invalid, setValue }) => (
              <XhFieldRoot invalid={invalid} required>
                <XhFieldLabel>标题</XhFieldLabel>
                <XhFieldControl>
                  <input
                    value={String(value ?? "")}
                    placeholder="一句话说清现象"
                    onChange={event => setValue(event.target.value)}
                  />
                </XhFieldControl>
                <XhFieldErrorText>{error}</XhFieldErrorText>
              </XhFieldRoot>
            )}
          </XhFormFieldGroup>

          <XhFormFieldGroup name="detail">
            {({ value, error, invalid, setValue }) => (
              <XhFieldRoot invalid={invalid} required>
                <XhFieldLabel>详细描述</XhFieldLabel>
                <XhFieldControl>
                  <XhTextFieldRoot
                    value={String(value ?? "")}
                    invalid={invalid}
                    placeholder="复现步骤、期望结果、实际结果"
                    onValueChange={details => setValue(details.value)}
                  >
                    <XhTextFieldControl>
                      {/* rows 只有 textarea 认，输入部件的属性表按 input 写，展开着传进去 */}
                      <XhTextFieldInput as="textarea" {...{ rows: 3 }} />
                    </XhTextFieldControl>
                  </XhTextFieldRoot>
                </XhFieldControl>
                <XhFieldDescription>写清复现步骤，值班的人不必再来回问</XhFieldDescription>
                <XhFieldErrorText>{error}</XhFieldErrorText>
              </XhFieldRoot>
            )}
          </XhFormFieldGroup>

          <div style={rowStyle}>
            <XhFormFieldGroup name="priority">
              {({ value, setValue }) => (
                <XhSelectRoot
                  collection={priorities}
                  value={value as string[]}
                  label="优先级"
                  placeholder="请选择"
                  onValueChange={details => setValue(details.value)}
                />
              )}
            </XhFormFieldGroup>

            <XhFormFieldGroup name="amount">
              {({ value, setValue }) => (
                <XhNumberFieldRoot
                  value={String(value ?? "")}
                  min={1}
                  max={99}
                  onValueChange={details => setValue(details.value)}
                >
                  <XhNumberFieldLabel>受影响实例</XhNumberFieldLabel>
                  <XhNumberFieldControl>
                    <XhNumberFieldDecrementTrigger />
                    <XhNumberFieldInput />
                    <XhNumberFieldIncrementTrigger />
                  </XhNumberFieldControl>
                </XhNumberFieldRoot>
              )}
            </XhFormFieldGroup>
          </div>

          <XhFormFieldGroup name="kind">
            {({ value, setValue }) => (
              <XhRadioGroupRoot
                collection={kinds}
                value={value as string}
                label="工单类型"
                onValueChange={details => setValue(details.value)}
              />
            )}
          </XhFormFieldGroup>

          <XhFormFieldGroup name="labels">
            {({ value, setValue }) => (
              <XhTagsInputRoot
                value={value as string[]}
                placeholder="回车落一个"
                onValueChange={details => setValue(details.value)}
              >
                {({ value: tags }) => (
                  <>
                    <XhTagsInputLabel>关联模块</XhTagsInputLabel>
                    <XhTagsInputControl>
                      {tags.map(tag => (
                        <XhTagsInputItem key={tag} value={tag}>
                          <XhTagsInputItemPreview>
                            <XhTagsInputItemText>{tag}</XhTagsInputItemText>
                            <XhTagsInputItemDeleteTrigger />
                          </XhTagsInputItemPreview>
                        </XhTagsInputItem>
                      ))}
                      <XhTagsInputInput />
                    </XhTagsInputControl>
                  </>
                )}
              </XhTagsInputRoot>
            )}
          </XhFormFieldGroup>

          <XhFormFieldGroup name="impact">
            {({ value, setValue }) => (
              <XhSliderRoot
                value={value as number[]}
                min={0}
                max={100}
                step={5}
                largeStep={20}
                onValueChange={details => setValue(details.value)}
              >
                {({ value: impact }) => (
                  <>
                    <XhSliderLabel>{\`影响面估计：\${impact[0]}%\`}</XhSliderLabel>
                    <XhSliderControl>
                      <XhSliderTrack>
                        <XhSliderRange />
                      </XhSliderTrack>
                      <XhSliderThumb />
                    </XhSliderControl>
                  </>
                )}
              </XhSliderRoot>
            )}
          </XhFormFieldGroup>
        </XhFieldsetRoot>

        <XhFieldsetRoot style={groupStyle}>
          <XhFieldsetLegend>提交之前</XhFieldsetLegend>

          <XhFormFieldGroup name="notify">
            {({ value, setValue }) => (
              <label style={checkStyle}>
                <XhSwitch
                  checked={value === true}
                  onCheckedChange={details => setValue(details.checked)}
                />
                有进展就通知我
              </label>
            )}
          </XhFormFieldGroup>

          <XhFormFieldGroup name="agree">
            {({ value, error, invalid, setValue }) => (
              <XhFieldRoot invalid={invalid} required>
                <label style={checkStyle}>
                  <XhCheckbox
                    checked={value === true}
                    invalid={invalid}
                    onCheckedChange={details => setValue(details.checked)}
                  />
                  这条工单可以对内公开
                </label>
                <XhFieldErrorText>{error}</XhFieldErrorText>
              </XhFieldRoot>
            )}
          </XhFormFieldGroup>
        </XhFieldsetRoot>

        <div style={actionsStyle}>
          <XhFormSubmitTrigger>提交工单</XhFormSubmitTrigger>
          <XhFormResetTrigger>重置</XhFormResetTrigger>
        </div>

        {submitted && <p style={resultStyle}>{\`已提交：\${submitted}\`}</p>}
      </XhFormRoot>
    </div>
  );
}
`;export{e as default};
