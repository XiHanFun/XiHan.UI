// 基础用法 | 组合相关操作
import type { ReactNode } from "react";
import { XhButton, XhButtonGroup, XhButtonGroupSeparator } from "@xihan-ui/react";
import { Fragment } from "react";

const views = ["照片", "视频", "更多"];

export default function Demo(): ReactNode {
  return (
    <XhButtonGroup variant="subtle">
      {views.map((view, index) => (
        <Fragment key={view}>
          {index > 0 && <XhButtonGroupSeparator />}
          <XhButton>{view}</XhButton>
        </Fragment>
      ))}
    </XhButtonGroup>
  );
}
