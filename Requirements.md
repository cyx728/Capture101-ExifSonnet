# 读取Exif信息和自动书写文案

## 项目基本信息

项目路径：C:\Users\chen\OneDrive - Beijing 101 Middle High School\101ID_Documents\25-26 #2\PBL II\ExifSonnet

项目技术栈：项目为一个纯前端网页，主页面为index.html，允许使用css，js/ts等前端语言，将配置放入json文件中命名为config.json；不允许使用Python，C等后端语言。该项目将被部署到GitHub Pages。需书写一个完整的README.md。

项目功能：允许上传图片，网站在本地读取图片所有EXIF信息并显示，并允许从前端调用OpenAI兼容API，为图片书写文艺文案。

## 前端页面说明

页面顶端为标题独占一个高度约10%的顶部栏，内容为项目名称“Exif&Sonnet 读取Exif信息及文案自动书写小工具”，右侧有若干功能按键（定义见下）。

假设页面剩余部分被分为3*3网格。中间、左中、中上、左上四格合并为上传图片框；右侧上中下为Exif信息表格；左下及中下为文案生成处。

文案生成处下方保留版权说明位置。

### 按键

以下列表列出了按键名称，功能用斜体标出，无需加入按键显示。以下所述“文件名”不包括文件扩展名。

- 上传图片
- 强制重新读取Exif信息
- 导出Exif信息表
  *xlsx (Unicode支持)格式直接下载，表格格式与显示的Exif表格一致，仅保留转换值，命名为"exif_{图片名}.xlsx"*
- 导出文案
  *txt格式直接下载，命名为"文案_{图片名}.txt"*
- 导出打包文件
  *将图片本身、exif的xlsx，及文案（若有）三个文件放入zip压缩包中并直接下载*
- 批处理
  *弹出config窗口，允许多重导入图片，并为所有的图片选择文案模式“不生成文案/默认配置/随机生成/自定义”（自定义文案所有共用），后展示一个进度条提升剩余进度和当前处理图片的文件名，最后将所有的文件打包zip，格式见下，无需包括错误报告和处理日志。单张图片处理失败不终止整个批次，继续处理后续图片；EXIF 失败时仍保留原图，AI失败时不生成对应TXT；完成后显示成功数量和失败数量（Exif错误和文案错误分别显示），但 ZIP 内不加入错误日志。*

#### 批处理导出文件目录

ExifSonnet_{时间戳}.zip
    /{图片名1}
        {图片名1}.jpg
        exif_{图片名1}.xlsx (仅当成功)
        文案_{图片名1}.txt (仅当选择生成文案)
    /{图片名2}
        {图片名2}.png
        exif_{图片名2}.xlsx (仅当成功)
        文案_{图片名2}.txt (仅当选择生成文案)
    /{图片名3}
        {图片名3}.png
        exif_{图片名3}.xlsx (仅当成功)
        文案_{图片名3}.txt (仅当选择生成文案)
    /{图片名...}
        {图片名...}.png
        exif_{图片名...}.xlsx (仅当成功)
        文案_{图片名...}.txt (仅当选择生成文案)

### 上传图片框

上传图片框占页面主要部分。在未上传图片时此处置空并显示“请拖拽或点击上传图片”。用户可以直接将图片拖入浏览器窗口或点击占位框选择图片上传。上传后网站将图片在此显示（最大边适应，不拉伸），自动读取Exif信息并显示在表格中。

### Exif表格

Exif表格显示所有读取到的Exif信息，适配jpg/jpeg/png，保留其它适配但不保证一定可读取，单张文件大小上限50MB。需要对常见Exif信息（机型、镜头、ISO等设备及拍摄参数）进行预占位“———”，整个表格可滚动，下面部分为其它读取到的Exif信息。表格需列出中英文，下面案例仅展示英文。若读取后以下某项信息仍缺失，则该项仍显示占位符。显示与导出格式均转换为人类可读格式

至少包括以下信息。File至Position所有字段均为说明的“主要EXIF”：
- File
  - FileType
  - ImageWidth
  - ImageHeight
  - BitsPerSample
- IFD0
  - Make
  - Model
  - Orientation
  - XResolution
  - YResolution
  - ResolutionUnit
  - Software
  - ModifyDate
  - LensInfo
  - LensModel
- ExifIFD
  - CreateDate
  - ExposureTime
  - FNumber
  - ISO
  - ExposureCompensation
  - FocalLength
- Position
  - GPSX
  - GPSY
- OtherInfo
  - ...
  - ...

### 文案生成器

文案生成器左侧有竖排的三个按钮，分别为“默认配置生成”“随机生成”“自定义生成”；右侧大部分为一文本框，当AI生成完内容后放入此处。文本框不允许编辑，但不能显示为灰色或禁止符号；文本框内部右上角有一个Copy按钮。

“默认配置生成”使用普通提示词，要求生成文艺深意文案；“随机生成”增加温度并要求风格随机，可引用Exif时间信息；自定义生成在点击后会弹出对话框要求输入自定义prompt。所有生成模式均应附加所有主要Exif信息，prompt必须保证每次生成结果略有差异，最终输出结果仅包含文字。

具体文案由本文档实现的大模型补全。

每次请求之后在文案文本框处显示跳动的三个点与\[强制结束此次生成]下划线按钮，生成式需阻碍直接点击生成键，除非获取并解析了生成结果或此次生成已被强制结束。

#### API说明

前端调用API和base url应使用base64加密并分别放入json中的字符串，调用时实时解密。我会保证API key限额。

base_url = "aHR0cHM6Ly9jZG4uanVhaWFwaS5jb20v"
API_key = "<redacted; store only in the Worker secret JUAI_API_KEY>"

调用模型为GPT 5.4.

model = "gpt-5.4"
endpoint = "/v1/chat/completions"

允许流式输出，CORS允许 GitHub Pages 直接请求，我将自行保证API key本身调用安全性。

### 交互异常

未上传图片时各处理按钮（不包含批处理和上传）禁用，重新上传图片后清空旧文案，强制重新读取时绕过缓存，复制失败页面弹窗提示，API超时（max 60s）或调用错误将原错误显示在文案文本框并标记为红色；允许取消批处理，若取消则将已完成的图片及其它附加文件按标准格式打包下载。

## 版权信息

2026 PBL: 拾光101 (Exif&Sonnet Module) *Special Adapted Version For Snap Snap club摄影社*
Authors: 陈禹翔Lambert, 孙昊跃Jude
GitHub: (link留空)
