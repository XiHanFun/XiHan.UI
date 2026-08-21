const n=`<!-- 着色端口 | 着色是可换的端口：认不出的语言退回纯文本，接自己的实现组件侧一行不用改，传 null 则整个关掉 -->
<!-- 自带的着色实现不认识 yaml，退回纯文本；不着色是合法结果 -->
<xh-code-block
  code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
  code-lang="yaml"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <span data-xh-part="lang-label">yaml</span>
    <pre data-xh-part="pre"><code data-xh-part="code"># 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production</code></pre>
  </div>
</xh-code-block>

<!-- 换成自己的实现：只把注释挑出来 -->
<xh-code-block
  id="code-block-custom"
  code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
  code-lang="yaml"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <span data-xh-part="lang-label">yaml</span>
    <pre data-xh-part="pre"><code data-xh-part="code"># 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production</code></pre>
  </div>
</xh-code-block>

<!-- 显式 null：一个记号都不产，code 里就一个文本节点 -->
<xh-code-block
  id="code-block-off"
  code="# 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production"
  code-lang="yaml"
  complete
  style="inline-size: 100%"
>
  <div data-xh-part="root">
    <span data-xh-part="lang-label">yaml</span>
    <pre data-xh-part="pre"><code data-xh-part="code"># 部署清单
image: xihan/ui:latest
replicas: 2
env:
  - name: MODE
    value: production</code></pre>
  </div>
</xh-code-block>

<script type="module">
  // 端口只有一个方法：给代码与语言，返回记号序列；返回 null 表示这一次不着色
  const yamlComments = {
    highlight(code, lang) {
      if (lang !== "yaml") return null;
      return code
        .split(/(#[^\\n]*)/)
        .filter((text) => text !== "")
        .map((text) => ({ text, kind: text.startsWith("#") ? "comment" : "plain" }));
    },
  };

  document.getElementById("code-block-custom").highlighter = yamlComments;
  document.getElementById("code-block-off").highlighter = null;
<\/script>
`;export{n as default};
