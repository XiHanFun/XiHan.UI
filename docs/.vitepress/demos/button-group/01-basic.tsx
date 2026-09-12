// 基础用法 | 组合相关操作
import type { ReactNode } from "react";
import { Fragment } from "react";
import { XhButton, XhButtonGroup, XhButtonGroupSeparator } from "@xihan-ui/react";

const views = ["日", "周", "月"];

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup variant="solid">
      {views.map((view, index) => (
        <Fragment key={view}>
          {index > 0 && <XhButtonGroupSeparator />}
          <XhButton>{view}</XhButton>
        </Fragment>
      ))}
    </XhButtonGroup>
  );
}
