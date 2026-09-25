---
'@xihan-ui/styles': patch
---

几何过渡改用专属的时长令牌：换位与尺寸变化取 `--xh-motion-duration-move`，紧跟操作的小幅几何变化取 `--xh-motion-duration-nudge`，内容展开收起取 `--xh-motion-duration-expand` / `--xh-motion-duration-collapse`，抽屉与轻提示的整幅位移取 `--xh-motion-travel`。基础时长与此前相同，以下几处有可见差异：

- Accordion、Collapsible、Reasoning、ToolCall 的展开箭头随正文开合同档：收起 120ms、展开 200ms。
- FileUpload 的上传进度条增长 200ms。
- Progress 环形进度与 Rating 星级填充改走 `--xh-motion-ease-continuous` 曲线。
- 减弱动效下，抽屉与轻提示的进退场不再整幅位移。
