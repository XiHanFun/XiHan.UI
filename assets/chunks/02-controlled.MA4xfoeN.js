const n=`// 受控 | 传了 value 就由宿主说了算，null 表示都收起
import type { ReactNode } from "react";
import {
  XhButton,
  XhNavigationMenuContent,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

const groups = [
  {
    value: "solution",
    label: "解决方案",
    links: [
      { href: "#/solution/saas", label: "多租户 SaaS" },
      { href: "#/solution/portal", label: "门户站点" },
    ],
  },
  {
    value: "support",
    label: "支持",
    links: [
      { href: "#/support/faq", label: "常见问题" },
      { href: "#/support/contact", label: "联系我们" },
    ],
  },
];

export default function Demo(): ReactNode {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ inlineSize: "100%", paddingBlockEnd: "150px" }}>
      <XhNavigationMenuRoot value={open} onValueChange={details => setOpen(details.value)}>
        <XhNavigationMenuList>
          {groups.map(g => (
            <XhNavigationMenuItem key={g.value}>
              <XhNavigationMenuTrigger value={g.value}>
                {g.label}
              </XhNavigationMenuTrigger>
              <XhNavigationMenuContent value={g.value}>
                {g.links.map(l => (
                  <XhNavigationMenuLink key={l.href} href={l.href}>
                    {l.label}
                  </XhNavigationMenuLink>
                ))}
              </XhNavigationMenuContent>
            </XhNavigationMenuItem>
          ))}
        </XhNavigationMenuList>
      </XhNavigationMenuRoot>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBlockStart: "12px" }}>
        <XhButton variant="outline" onClick={() => setOpen("support")}>展开「支持」</XhButton>
        <XhButton variant="outline" onClick={() => setOpen(null)}>全部收起</XhButton>
        <span>
          展开的面板：
          {open ?? "（都收着）"}
        </span>
      </div>
    </div>
  );
}
`;export{n as default};
