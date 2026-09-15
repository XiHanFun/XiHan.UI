const n=`// 异步确认 | 提交期间按钮转圈，Esc 与点遮罩这两条出口一并封住，落定之后才把 open 写回 false
import type { ReactNode } from "react";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [archived, setArchived] = useState(false);

  function submit(): void {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setArchived(true);
      setOpen(false);
    }, 1200);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <XhDialogRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        closeOnEscape={!submitting}
        closeOnInteractOutside={!submitting}
      >
        <XhDialogTrigger>归档这个项目</XhDialogTrigger>
        <XhDialogContent>
          <XhDialogTitle>归档项目</XhDialogTitle>
          <XhDialogDescription>
            {submitting ? "正在归档，先别走开。" : "归档后项目转为只读，随时可以恢复。"}
          </XhDialogDescription>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <XhButton variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
              取消
            </XhButton>
            <XhButton variant="solid" loading={submitting} onClick={submit}>
              {submitting ? <XhButtonIndicator /> : null}
              <XhButtonLabel>{submitting ? "归档中" : "确认归档"}</XhButtonLabel>
            </XhButton>
          </div>
        </XhDialogContent>
      </XhDialogRoot>
      <span>{archived ? "已归档" : "未归档"}</span>
    </div>
  );
}
`;export{n as default};
