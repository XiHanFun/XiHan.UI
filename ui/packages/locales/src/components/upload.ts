// 上传组件国际化
import type { DeepPartial } from "../types";

export interface UploadLocale {
  loading: string;
  noData: string;
  noResult: string;
  upload: string;
  download: string;
  preview: string;
  remove: string;
  retry: string;
  cancel: string;
  delete: string;
  drag: string;
  dragTip: string;
  browse: string;
  browseTip: string;
  maxSize: string;
  maxCount: string;
  accept: string;
  acceptTip: string;
  error: string;
  success: string;
  uploading: string;
  uploaded: string;
  failed: string;
}

export const UploadLocale: Record<string, DeepPartial<UploadLocale>> = {
  "zh-CN": {
    loading: "加载中",
    noData: "暂无数据",
    noResult: "无匹配结果",
    upload: "上传",
    download: "下载",
    preview: "预览",
    remove: "删除",
    retry: "重试",
    cancel: "取消",
    delete: "删除",
    drag: "拖拽",
    dragTip: "将文件拖到此处，或点击上传",
    browse: "浏览",
    browseTip: "点击或拖拽文件到此区域上传",
    maxSize: "最大文件大小",
    maxCount: "最大文件数量",
    accept: "支持的文件类型",
    acceptTip: "支持的文件类型：",
    error: "上传失败",
    success: "上传成功",
    uploading: "上传中",
    uploaded: "已上传",
    failed: "上传失败",
  },
  "en-US": {
    loading: "Loading",
    noData: "No data",
    noResult: "No matching results",
    upload: "Upload",
    download: "Download",
    preview: "Preview",
    remove: "Remove",
    retry: "Retry",
    cancel: "Cancel",
    delete: "Delete",
    drag: "Drag",
    dragTip: "Drag files here, or click to upload",
    browse: "Browse",
    browseTip: "Click or drag files to this area to upload",
    maxSize: "Maximum file size",
    maxCount: "Maximum file count",
    accept: "Supported file types",
    acceptTip: "Supported file types:",
    error: "Upload failed",
    success: "Upload successful",
    uploading: "Uploading",
    uploaded: "Uploaded",
    failed: "Upload failed",
  },
};
