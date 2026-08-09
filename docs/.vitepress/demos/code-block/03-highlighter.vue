<!-- 着色端口 | 着色是可换的端口：认不出的语言退回纯文本，接自己的实现组件侧一行不用改，传 null 则整个关掉 -->
<script setup lang="ts">
import { XhCodeBlock } from "@xihan-ui/vue";

const manifest = `# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production`;

// 端口只有一个方法：给代码与语言，返回记号序列；返回 null 表示这一次不着色
const yamlComments = {
  highlight(code: string, lang: string) {
    if (lang !== "yaml") return null;
    return code
      .split(/(#[^\n]*)/)
      .filter((text) => text !== "")
      .map((text) => ({
        text,
        kind: text.startsWith("#") ? ("comment" as const) : ("plain" as const),
      }));
  },
};
</script>

<template>
  <!-- 自带的着色实现不认识 yaml，退回纯文本；不着色是合法结果 -->
  <XhCodeBlock :code="manifest" lang="yaml" complete style="inline-size: 100%;" />

  <!-- 换成自己的实现：只把注释挑出来 -->
  <XhCodeBlock
    :code="manifest"
    lang="yaml"
    complete
    :highlighter="yamlComments"
    style="inline-size: 100%;"
  />

  <!-- 显式 null：一个记号都不产，code 里就一个文本节点 -->
  <XhCodeBlock
    :code="manifest"
    lang="yaml"
    complete
    :highlighter="null"
    style="inline-size: 100%;"
  />
</template>
