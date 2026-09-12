const t=`// 给通知配声 | withToastSound 包一层现成服务，调用点一行都不用改；loading 不响，转成 success 那一刻才响
import type { ToastService } from "@xihan-ui/react";
import type { ReactNode } from "react";
import { createToastService, XhButton } from "@xihan-ui/react";
import { withToastSound } from "@xihan-ui/react/sound";
import { useEffect, useRef } from "react";

export default function Demo(): ReactNode {
  // 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
  const toast = useRef<ToastService | undefined>(undefined);
  function use(): ToastService {
    toast.current ??= withToastSound(createToastService({ placement: "top" }));
    return toast.current;
  }
  useEffect(() => () => toast.current?.dispose(), []);

  function upload(): void {
    const id = use().loading("上传中");
    setTimeout(() => use().update(id, { type: "success", title: "上传完成" }), 1200);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <XhButton variant="solid" onClick={() => upload()}>上传（静默转成功才响）</XhButton>
      <XhButton variant="outline" onClick={() => use().success("已保存")}>success</XhButton>
      <XhButton variant="outline" onClick={() => use().warning("磁盘快满了")}>warning</XhButton>
      <XhButton variant="outline" onClick={() => use().error("同步失败，稍后自动重试")}>
        error
      </XhButton>
    </div>
  );
}
`;export{t as default};
