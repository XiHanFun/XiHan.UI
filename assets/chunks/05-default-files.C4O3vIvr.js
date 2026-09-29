async function r(){const i=[new File(["甲方与乙方就本次合作达成如下条款……"],"合同正文.txt",{type:"text/plain"}),new File([`# 交付说明

分三批交付。`],"交付说明.md",{type:"text/markdown"})],t=document.createElement("xh-file-upload");t.setAttribute("max-files","4"),t.innerHTML=`
    <div data-xh-part="root">
      <label data-xh-part="label">随件资料</label>
      <div data-xh-part="dropzone">
        <span>已经带了两份进来</span>
        <span>再拖几份也收，最多 4 份</span>
      </div>
      <div>
        <button data-xh-part="trigger">继续添加</button>
      </div>
      <input data-xh-part="hidden-input" />
      <div data-xh-part="list"></div>
      <button data-xh-part="clear-trigger">清空</button>
    </div>`,t.defaultFiles=i,document.getElementById("file-upload-default").append(t);const d=t.querySelector('[data-xh-part="list"]');function n(e){d.replaceChildren(...e.map(()=>{const a=document.createElement("div");return a.dataset.xhPart="item",a.innerHTML='<span data-xh-part="item-preview"></span><span data-xh-part="item-name"></span><span data-xh-part="item-size-text"></span><button data-xh-part="item-delete-trigger"></button>',a}))}t.addEventListener("files-change",e=>{n(e.detail.files)}),n(t.acceptedFiles)}export{r as default};
