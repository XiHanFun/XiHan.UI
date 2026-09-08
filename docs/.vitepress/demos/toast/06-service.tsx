// 全局服务 | 轻提示没有容器组件，那一摞由 createToastService 渲染；模块作用域随处可调（请求拦截器、store）
import type { ToastService } from "@xihan-ui/react";
import type { ReactNode } from "react";
import { createToastService, XhButton } from "@xihan-ui/react";
import { useEffect, useRef } from "react";

export default function Demo(): ReactNode {
  // 惰性建单例：服务要 document，等到第一次调用（必然在客户端）再建
  const toast = useRef<ToastService | undefined>(undefined);
  function use(): ToastService {
    toast.current ??= createToastService({ placement: "top" });
    return toast.current;
  }
  useEffect(() => () => toast.current?.dispose(), []);

  function save(): void {
    const id = use().loading("保存中");
    setTimeout(() => use().update(id, { type: "success", title: "已保存" }), 900);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      <XhButton variant="solid" onClick={() => save()}>保存（loading 转 success）</XhButton>
      <XhButton variant="outline" onClick={() => use().success("已发布")}>success</XhButton>
      <XhButton variant="outline" onClick={() => use().warning("配额即将用尽")}>warning</XhButton>
      <XhButton variant="outline" onClick={() => use().error("同步失败")}>error</XhButton>
    </div>
  );
}
