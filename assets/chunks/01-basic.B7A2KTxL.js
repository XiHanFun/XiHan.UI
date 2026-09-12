const e=`// 基础用法 | 不传 checked 即为非受控
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <>
      <XhCheckbox />
      <XhCheckbox defaultChecked />
      <XhCheckbox disabled />
    </>
  );
}
`;export{e as default};
