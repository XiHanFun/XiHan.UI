// 外框与悬停 | bordered 为整份列表绘制一圈描边，hoverable 使条目在指针悬停时更换底色
import type { ReactNode } from "react";
import { XhListItem, XhListItemContent, XhListItemTitle, XhListRoot } from "@xihan-ui/react";

const files = ["设计稿.fig", "接口文档.md", "会议纪要.docx"];

export default function Demo(): ReactNode {
  return (
    <XhListRoot bordered hoverable split style={{ maxInlineSize: "360px" }}>
      {files.map(file => (
        <XhListItem key={file}>
          <XhListItemContent>
            <XhListItemTitle>{file}</XhListItemTitle>
          </XhListItemContent>
        </XhListItem>
      ))}
    </XhListRoot>
  );
}
