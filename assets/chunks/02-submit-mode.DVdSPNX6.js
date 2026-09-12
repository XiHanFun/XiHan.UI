const e=`// 提交方式 | submitMode 决定编辑态怎么收尾，不算提交的那些出口一律按撤销处理，值还回上一次提交的那个
import type { ReactNode } from "react";
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [blurCommitted, setBlurCommitted] = useState("失焦即提交");
  const [enterCommitted, setEnterCommitted] = useState("回车才提交");

  return (
    <>
      <XhEditableRoot
        defaultValue="失焦即提交"
        placeholder="未填写"
        submitMode="blur"
        onValueCommit={details => setBlurCommitted(details.value)}
      >
        <XhEditableLabel>submitMode = blur</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
          <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
          <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
        </XhEditableControl>
        <span>
          上次提交：
          {blurCommitted || "（空）"}
        </span>
      </XhEditableRoot>

      <XhEditableRoot
        defaultValue="回车才提交"
        placeholder="未填写"
        submitMode="enter"
        onValueCommit={details => setEnterCommitted(details.value)}
      >
        <XhEditableLabel>submitMode = enter</XhEditableLabel>
        <XhEditableControl>
          <XhEditablePreview />
          <XhEditableInput />
          <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
          <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
          <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
        </XhEditableControl>
        <span>
          上次提交：
          {enterCommitted || "（空）"}
        </span>
      </XhEditableRoot>
    </>
  );
}
`;export{e as default};
