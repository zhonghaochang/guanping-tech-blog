# 常中豪的技术博客

一个无需构建工具的静态个人技术博客。

在线地址：<https://zhonghaochang.github.io/guanping-tech-blog/>

## 本地预览

```bash
cd guanping-tech-blog
python -m http.server 8000
```

然后在浏览器打开 `http://localhost:8000`。

## 部署

本站通过 GitHub Pages 发布。仓库 `main` 分支根目录是发布源，不需要构建命令。

## 文件结构

- `index.html`：主页
- `archives.html`：文章归档
- `about.html`：关于页
- `posts/deepsearch-from-zero.html`：DeepSearch 轨迹、SFT 与 RL 拆解
- `posts/agent-harness-multimodal-search.html`：多模态 DeepSearch 训练路线调研
- `assets/styles.css`：全站样式
- `assets/app.js`：深色模式、阅读进度、代码复制和目录高亮
