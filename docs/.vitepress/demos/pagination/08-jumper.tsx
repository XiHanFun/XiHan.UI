// 快速跳页 | 输入框按 Enter 调插槽给的 setPage；越界页码由它夹回合法区间
import type { ReactNode } from "react";
import {
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [target, setTarget] = useState("");

  // 只放正整数进去，其余按无效输入丢掉
  function jump(setPage: (page: number) => void): void {
    const next = Number(target);
    if (Number.isInteger(next) && next > 0) {
      setPage(next);
    }
    setTarget("");
  }

  return (
    <XhPaginationRoot
      count={1000}
      pageSize={10}
      defaultPage={5}
      style={{ inlineSize: "100%" }}
    >
      {({ pages, setPage }) => (
        <>
          <XhPaginationPrevTrigger />
          {pages.map((p, i) => (p === "ellipsis"
            ? <XhPaginationEllipsisTrigger key={`${p}-${i}`}>…</XhPaginationEllipsisTrigger>
            : <XhPaginationItem key={`${p}-${i}`} value={p}>{p}</XhPaginationItem>))}
          <XhPaginationNextTrigger />

          <XhTextFieldRoot
            value={target}
            onValueChange={details => setTarget(details.value)}
            size="sm"
            placeholder="页码"
          >
            <XhTextFieldControl style={{ inlineSize: "72px" }}>
              <XhTextFieldInput
                aria-label="跳至页码"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    jump(setPage);
                  }
                }}
              />
            </XhTextFieldControl>
          </XhTextFieldRoot>
        </>
      )}
    </XhPaginationRoot>
  );
}
