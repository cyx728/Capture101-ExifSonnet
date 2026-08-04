# Exif&Sonnet

`Exif&Sonnet` 是一个部署到 GitHub Pages 的纯前端图片 EXIF 阅读与摄影文案工具。图片解析、预览、XLSX 导出和 ZIP 打包均在浏览器本地完成；生成文案时，浏览器会把筛选后的 EXIF 和本地压缩图像发送到 OpenAI 兼容的 Chat Completions API。

默认界面使用浅色模式，并提供“浅色/深色”和“中文/ENGLISH”两个胶囊切换开关。

## 功能

- 拖拽或选择单张 JPG、JPEG、PNG、WEBP 图片；本地读取可用 EXIF 标签并转换为人类可读值。
- 常用字段固定显示中英文和缺失占位符，其他读取到的标签显示在 `OtherInfo` 中。
- 导出 `exif_{图片名}.xlsx`、`文案_{图片名}.txt`，或下载 `ExifSonnet_{图片名}.zip`。
- 批量选择图片，统一使用“不生成文案 / 默认配置 / 随机生成 / 自定义”模式；逐张处理，单张失败不终止批次，最后下载 `ExifSonnet_{时间戳}.zip`。
- 文案生成支持流式显示、60 秒超时、强制结束、复制和错误显示。
- 发送前在本地将图像等比压缩为最长边不超过 1600 px、文件不超过约 850 KB 的 JPEG；原图不发送。
- `config.json` 预留 `prompts.default` 与 `prompts.random`，后续可直接填入两版提示词。

## 本地运行

这是静态站点，不能直接通过 `file://` 打开，因为浏览器会阻止读取 `config.json`。在项目目录启动任意静态服务器即可，例如：

```powershell
npx --yes serve . -l 4173
```

然后打开 <http://localhost:4173>。

## API 配置

`config.json` 包含：

```json
{
  "proxy_url": "<Cloudflare Worker URL 的 base64；未配置时留空>",
  "base_url": "<base64>",
  "API_key": "<base64>",
  "model": "gpt-5.4",
  "endpoint": "/v1/chat/completions",
  "timeoutMs": 60000,
  "prompts": {
    "default": "默认配置提示词，稍后填入",
    "random": "随机生成提示词，稍后填入"
  }
}
```

当 `proxy_url` 非空时，页面只请求 Cloudflare Worker，不会读取或发送 `API_key`；Worker 从 Secret 中取得 Key 并转发到上游。`proxy_url` 为空时才使用 `base_url` 与 `API_key` 直连，直连要求上游正确提供 CORS 响应头。

`proxy_url`、`base_url` 和 `API_key` 均可使用 Base64 字符串。Base64 不是加密；公开部署时应使用代理模式，并清空 `config.json` 中的 `API_key` 和 `base_url`。已经进入公开文件或提交历史的 Key 应当撤销并重新创建。

`prompts.default` 和 `prompts.random` 分别是默认配置、随机生成两种模式的提示词。它们可以稍后直接填写到 `config.json`，无需修改 `app.js`；留空时程序使用内置兜底提示词。自定义模式的 prompt 只从弹窗读取。

直连模式要求 API 允许 GitHub Pages 来源的 CORS，并兼容 `POST {base_url}/v1/chat/completions`、多模态 `messages[].content` 中的 `text` 与 `image_url`、`temperature`、`stream` 字段和 OpenAI 风格 SSE 流。图像使用 `data:image/jpeg;base64,...` Data URL 发送。代理模式由项目内的 `worker.js` 处理 CORS 与 SSE 转发。

## Cloudflare Worker 代理部署

项目根目录已经包含 `worker.js` 与 `wrangler.toml`。学校项目的请求量通常可以覆盖在 Cloudflare Workers 免费额度内。

1. 编辑 `wrangler.toml`，把 `YOUR-GITHUB-USERNAME` 替换为 GitHub 用户名。这里填写的是来源域名，不包含仓库路径；本地测试地址 `http://localhost:4173` 可以保留。
2. 在项目目录登录并部署 Worker：

```powershell
npx --yes wrangler login
npx --yes wrangler deploy
```

3. 把解码后的真实 API Key 保存为 Worker Secret。命令会在终端中安全提示输入，不要把 Key 写入命令行：

```powershell
npx --yes wrangler secret put JUAI_API_KEY
```

4. 记录部署结果中的 `https://...workers.dev` 地址，并转换为 Base64：

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("https://你的-worker.workers.dev"))
```

5. 将结果填入 `config.json` 的 `proxy_url`，同时把 `base_url` 与 `API_key` 改为空字符串：

```json
{
  "proxy_url": "<上一步生成的 Base64>",
  "base_url": "",
  "API_key": "",
  "model": "gpt-5.4",
  "endpoint": "/v1/chat/completions"
}
```

Worker 仅接受配置来源的 `POST` 与 `OPTIONS`，固定转发到 `gpt-5.4`，并把上游 SSE 响应原样流式返回。来源限制只能阻止普通网页跨域调用，不能代替 API 额度限制；上游 Key 仍应设置独立额度并定期轮换。

## 处理边界

- 当前输入控件主要适配 JPG/JPEG、PNG 和 WEBP。浏览器或 EXIF 库无法解析的格式仍可能预览，但会显示读取失败，并在批处理时保留原图、不生成 XLSX。
- 未上传图片时，上传和批处理按钮保持可用；重新读取、导出和文案生成按钮禁用。
- EXIF 失败不写入 XLSX；AI 失败不写入 TXT；批处理完成后页面仅显示成功/失败数量，不在 ZIP 中加入错误日志。
- 批处理重名图片会在 ZIP 中自动使用 ` (2)`、` (3)` 等目录后缀避免覆盖。

## 依赖

运行时从 CDN 加载以下浏览器库：ExifR、SheetJS、JSZip 和 Lucide。部署环境需要能够访问对应 CDN；若学校网络屏蔽 CDN，请将这些依赖下载到项目内并替换 `index.html` 中的 `<script>` 地址。

## 作者

2026 PBL: 拾光101 (Exif&Sonnet Module)  
Special Adapted Version For Snap Snap club 摄影社  
陈禹翔 Lambert · 孙昊跃 Jude
