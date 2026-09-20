const o=`// 长内容滚动 | 浮层自身不限高，为内部容器设置上限并开启滚动，标题与关闭按钮就不随内容滚动
import type { ReactNode } from "react";
import {
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";

const versions = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  text: \`v1.\${18 - i} 更新了若干细节\`,
}));

export default function Demo(): ReactNode {
  return (
    <XhPopoverRoot placement="bottom-start" translations={{ close: "关闭" }}>
      <XhPopoverTrigger>历史版本</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>
          <XhPopoverTitle>历史版本</XhPopoverTitle>
          <div data-xh-scroll="" style={{ maxBlockSize: "160px", overflow: "auto" }}>
            {versions.map(v => (
              <p
                key={v.id}
                style={{
                  margin: 0,
                  padding: "6px 0",
                  borderBlockEnd: "1px solid var(--xh-border-subtle)",
                }}
              >
                {v.text}
              </p>
            ))}
          </div>
          <XhPopoverCloseTrigger />
          <XhPopoverArrow />
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  );
}
`;export{o as default};
