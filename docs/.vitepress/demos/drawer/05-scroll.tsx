// 头尾固定、正文滚动 | header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚
import type { CSSProperties, ReactNode } from "react";
import {
  XhButton,
  XhDrawerBody,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerFooter,
  XhDrawerHeader,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
} from "@xihan-ui/react";

const records = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  text: `第 ${i + 1} 条操作记录`,
}));

const row: CSSProperties = {
  margin: 0,
  padding: "8px 0",
  borderBlockEnd: "1px solid var(--xh-border-subtle)",
};

export default function Demo(): ReactNode {
  return (
    <XhDrawerRoot translations={{ close: "关闭" }}>
      {({ setOpen }) => (
        <>
          <XhDrawerTrigger>查看操作记录</XhDrawerTrigger>
          <XhDrawerContent>
            <XhDrawerHeader>
              <XhDrawerTitle>操作记录</XhDrawerTitle>
              <XhDrawerDescription>{`共 ${records.length} 条，往下翻。`}</XhDrawerDescription>
            </XhDrawerHeader>
            <XhDrawerBody>
              {records.map(r => (
                <p key={r.id} style={row}>{r.text}</p>
              ))}
            </XhDrawerBody>
            <XhDrawerFooter>
              <XhButton variant="solid" onClick={() => setOpen(false)}>看完了</XhButton>
            </XhDrawerFooter>
            <XhDrawerCloseTrigger />
          </XhDrawerContent>
        </>
      )}
    </XhDrawerRoot>
  );
}
