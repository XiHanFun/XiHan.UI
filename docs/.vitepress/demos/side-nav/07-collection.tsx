// 数据写法 | 只给 collection、不写结构时按标准结构铺：叶子是链接，带 children 的是可展开的分支，给了 icon 的入口在文字前带图标
import type { SideNavNode } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { HomeIcon, ShoppingCartIcon, UsersIcon } from "@xihan-ui/icons";
import { XhSideNavRoot } from "@xihan-ui/react";

const collection: SideNavNode[] = [
  { value: "dashboard", label: "工作台", href: "#/dashboard", icon: HomeIcon },
  {
    value: "user",
    label: "用户管理",
    icon: UsersIcon,
    children: [
      { value: "user-list", label: "用户列表", href: "#/user/list" },
      { value: "user-role", label: "角色权限", href: "#/user/role" },
    ],
  },
  {
    value: "order",
    label: "订单管理",
    icon: ShoppingCartIcon,
    children: [
      { value: "order-list", label: "订单列表", href: "#/order/list" },
      { value: "order-refund", label: "退款处理", href: "#/order/refund" },
    ],
  },
];

export default function Demo(): ReactNode {
  return <XhSideNavRoot collection={collection} defaultValue="user-list" defaultExpandedValue={["user"]} />;
}
