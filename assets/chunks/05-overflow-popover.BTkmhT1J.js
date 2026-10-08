var e=`// 「+N」展开其余成员 | 计数那一枚要能点开时换成按钮，作浮层的触发器：浮层里列出没摆出来的人，排成一行的只留前几位
import type { CSSProperties, ReactNode } from "react";
import {
  XhAvatarFallback,
  XhAvatarGroupRoot,
  XhAvatarRoot,
  XhButton,
  XhListItem,
  XhListItemContent,
  XhListItemDescription,
  XhListItemMedia,
  XhListItemTitle,
  XhListRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/react";

const members = [
  { initial: "曦", name: "曦寒", role: "负责人" },
  { initial: "寒", name: "寒松", role: "前端" },
  { initial: "懿", name: "懿安", role: "设计" },
  { initial: "承", name: "承泽", role: "后端" },
  { initial: "临", name: "临川", role: "测试" },
  { initial: "旭", name: "旭东", role: "运维" },
  { initial: "言", name: "言蹊", role: "产品" },
  { initial: "知", name: "知远", role: "数据" },
];
const max = 4;

const shown = members.slice(0, max);
const rest = members.slice(max);

// 计数那一枚换成按钮：直径、圆形与字号跟着组走。自定义属性不在 CSSProperties 的键里，整份样式按它断言
const countStyle = {
  "--xh-button-h": "var(--xh-avatar-size)",
  "--xh-button-radius": "var(--xh-shape-circle)",
  "--xh-button-font-size": "var(--xh-avatar-font-size)",
} as CSSProperties;

export default function Demo(): ReactNode {
  return (
    <XhAvatarGroupRoot max={max}>
      {shown.map(m => (
        <XhAvatarRoot key={m.name}>
          <XhAvatarFallback>{m.initial}</XhAvatarFallback>
        </XhAvatarRoot>
      ))}

      <XhPopoverRoot placement="bottom-start">
        <XhPopoverTrigger asChild>
          <XhButton variant="subtle" iconOnly aria-label={\`还有 \${rest.length} 位成员\`} style={countStyle}>
            {\`+\${rest.length}\`}
          </XhButton>
        </XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>{\`还有 \${rest.length} 位成员\`}</XhPopoverTitle>
            <XhListRoot size="sm">
              {rest.map(m => (
                <XhListItem key={m.name}>
                  <XhListItemMedia>
                    <XhAvatarRoot size="sm">
                      <XhAvatarFallback>{m.initial}</XhAvatarFallback>
                    </XhAvatarRoot>
                  </XhListItemMedia>
                  <XhListItemContent>
                    <XhListItemTitle>{m.name}</XhListItemTitle>
                    <XhListItemDescription>{m.role}</XhListItemDescription>
                  </XhListItemContent>
                </XhListItem>
              ))}
            </XhListRoot>
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </XhAvatarGroupRoot>
  );
}
`;export{e as default};