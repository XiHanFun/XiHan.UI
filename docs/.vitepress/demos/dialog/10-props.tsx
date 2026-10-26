// props 写法 | 不写结构时按标准结构铺：标题、说明与触发器文字三项写出一个确认对话框；确认动作返回 Promise 时等它落定才收起，期间确定钮转圈
import type { ReactNode } from "react";
import { XhDialogRoot } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [archived, setArchived] = useState(false);

  function archive(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        setArchived(true);
        resolve();
      }, 1200);
    });
  }

  return (
    <>
      <XhDialogRoot
        trigger="归档这个项目"
        title="归档项目"
        description="归档后项目转为只读，随时可以恢复。"
        confirmText="确认归档"
        onConfirm={archive}
      />
      <span data-demo-output>{`项目状态：${archived ? "已归档" : "未归档"}`}</span>
    </>
  );
}
