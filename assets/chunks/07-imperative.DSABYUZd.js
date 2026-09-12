const n=`// 命令式确认框 | 一次函数调用把描述符推进表里并展开对话框；拿回的对象随后可改标题、正文与按钮状态，表里就是当前所有实例
import type { ReactNode } from "react";
import {
  XhButton,
  XhButtonIndicator,
  XhButtonLabel,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
} from "@xihan-ui/react";
import { useRef, useState } from "react";

interface Spec {
  id: number;
  title: string;
  text: string;
  confirmLabel: string;
  loading: boolean;
}

export default function Demo(): ReactNode {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);

  const current = specs.find(spec => spec.id === currentId) ?? null;

  // 一行调用：造描述符、入表、置为当前并展开，最后把它交回调用方
  function ask(title: string, text: string): Spec {
    seq.current += 1;
    const spec: Spec = { id: seq.current, title, text, confirmLabel: "确认", loading: false };
    setSpecs(prev => [...prev, spec]);
    setCurrentId(spec.id);
    setOpen(true);
    return spec;
  }

  function patch(id: number, next: Partial<Spec>): void {
    setSpecs(prev => prev.map(spec => (spec.id === id ? { ...spec, ...next } : spec)));
  }

  // 改的是描述符本身，对话框跟着变
  function submit(): void {
    if (!current) {
      return;
    }
    const { id } = current;
    patch(id, { loading: true, confirmLabel: "提交中", text: "正在提交，稍等一下。" });
    setTimeout(() => {
      patch(id, { loading: false, confirmLabel: "确认", text: "这次已经提交完成。" });
      setOpen(false);
    }, 1200);
  }

  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: "12px", justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <XhButton variant="solid" onClick={() => ask("删除工作区", "删除后 30 天内还能恢复。")}>
          删除工作区
        </XhButton>
        <XhButton
          variant="outline"
          onClick={() => ask("导出数据", "导出任务在后台跑，完成后发一条通知。")}
        >
          导出数据
        </XhButton>
      </div>

      <ol style={{ display: "grid", gap: "4px", margin: 0, paddingInlineStart: "20px" }}>
        {specs.map(spec => (
          <li key={spec.id}>{\`\${spec.title} — \${spec.loading ? "提交中" : "空闲"}\`}</li>
        ))}
        {specs.length === 0 ? <li>（还没有描述符）</li> : null}
      </ol>

      <XhDialogRoot
        open={open}
        onOpenChange={details => setOpen(details.open)}
        closeOnEscape={!current?.loading}
        closeOnInteractOutside={!current?.loading}
      >
        {current
          ? (
              <XhDialogContent>
                <XhDialogTitle>{current.title}</XhDialogTitle>
                <XhDialogDescription>{current.text}</XhDialogDescription>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                  <XhButton variant="ghost" disabled={current.loading} onClick={() => setOpen(false)}>
                    取消
                  </XhButton>
                  <XhButton variant="solid" loading={current.loading} onClick={submit}>
                    {current.loading ? <XhButtonIndicator /> : null}
                    <XhButtonLabel>{current.confirmLabel}</XhButtonLabel>
                  </XhButton>
                </div>
              </XhDialogContent>
            )
          : null}
      </XhDialogRoot>
    </div>
  );
}
`;export{n as default};
