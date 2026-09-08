// 命令式服务 | createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认钮自动 pending 并拦住关闭；多次调用排队顺次弹
import type { DialogService } from "@xihan-ui/react";
import type { ReactNode } from "react";
import { createDialogService, XhButton } from "@xihan-ui/react";
import { useEffect, useRef, useState } from "react";

export default function Demo(): ReactNode {
  const modal = useRef<DialogService>(undefined);
  function use(): DialogService {
    modal.current ??= createDialogService();
    return modal.current;
  }
  useEffect(() => () => modal.current?.dispose(), []);

  const [lastAnswer, setLastAnswer] = useState("（还没问过）");

  async function remove(): Promise<void> {
    const ok = await use().confirm({
      title: "删除工作区",
      content: "删除后 30 天内还能恢复。",
      tone: "danger",
      okText: "删除",
      onOk: () => new Promise(r => setTimeout(r, 900)),
    });
    setLastAnswer(ok ? "已删除" : "取消了");
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      <XhButton variant="solid" tone="danger" onClick={() => remove()}>删除工作区</XhButton>
      <XhButton
        variant="outline"
        onClick={() => use().error({ title: "同步失败", content: "稍后重试。" })}
      >
        error 告知框
      </XhButton>
      <span>{`上次答复：${lastAnswer}`}</span>
    </div>
  );
}
