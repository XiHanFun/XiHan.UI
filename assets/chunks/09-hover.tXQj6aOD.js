const n=`// 悬停触发 | open-on-hover 一个 prop：进触发器延时展开，离开后指针经安全三角赶往浮层不误收，走岔或停滞才收起；延时可调
import type { ReactNode } from "react";
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot openOnHover hoverOpenDelay={80} onSelect={() => {}}>
      <XhMenuTrigger>悬停打开</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="profile">个人资料</XhMenuItem>
          <XhMenuItem value="settings">偏好设置</XhMenuItem>
          <XhMenuItem value="logout">退出登录</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  );
}
`;export{n as default};
