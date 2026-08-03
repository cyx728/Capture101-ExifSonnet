(() => {
  "use strict";

  const PLACEHOLDER = "———";
  const DEFAULT_THEME = "light";
  const DEFAULT_LANG = "zh";
  const STORAGE_KEYS = { theme: "exifsonnet-theme", lang: "exifsonnet-lang" };
  const THEME_COLOR = { light: "#edf3f2", dark: "#08131d" };
  const TIMEOUT_MS = 60000;

  const CORE_FIELDS = [
    { group: "File", tag: "FileType", zh: "文件类型", en: "File type" },
    { group: "File", tag: "ImageWidth", zh: "图像宽度", en: "Image width" },
    { group: "File", tag: "ImageHeight", zh: "图像高度", en: "Image height" },
    { group: "File", tag: "BitsPerSample", zh: "每样本位数", en: "Bits per sample" },
    { group: "IFD0", tag: "Make", zh: "相机品牌", en: "Camera make" },
    { group: "IFD0", tag: "Model", zh: "相机型号", en: "Camera model" },
    { group: "IFD0", tag: "Orientation", zh: "方向", en: "Orientation" },
    { group: "IFD0", tag: "XResolution", zh: "水平分辨率", en: "Horizontal resolution" },
    { group: "IFD0", tag: "YResolution", zh: "垂直分辨率", en: "Vertical resolution" },
    { group: "IFD0", tag: "ResolutionUnit", zh: "分辨率单位", en: "Resolution unit" },
    { group: "IFD0", tag: "Software", zh: "软件", en: "Software" },
    { group: "IFD0", tag: "ModifyDate", zh: "修改时间", en: "Modified time" },
    { group: "IFD0", tag: "LensInfo", zh: "镜头信息", en: "Lens info" },
    { group: "IFD0", tag: "LensModel", zh: "镜头型号", en: "Lens model" },
    { group: "ExifIFD", tag: "CreateDate", zh: "拍摄时间", en: "Capture time" },
    { group: "ExifIFD", tag: "ExposureTime", zh: "曝光时间", en: "Exposure time" },
    { group: "ExifIFD", tag: "FNumber", zh: "光圈值", en: "Aperture" },
    { group: "ExifIFD", tag: "ISO", zh: "感光度", en: "ISO" },
    { group: "ExifIFD", tag: "ExposureCompensation", zh: "曝光补偿", en: "Exposure compensation" },
    { group: "ExifIFD", tag: "FocalLength", zh: "焦距", en: "Focal length" },
    { group: "Position", tag: "GPSX", zh: "GPS 纬度", en: "GPS latitude" },
    { group: "Position", tag: "GPSY", zh: "GPS 经度", en: "GPS longitude" }
  ];

  const TAG_ALIASES = {
    FileType: ["FileType", "MIMEType"],
    ImageWidth: ["ImageWidth", "ExifImageWidth", "PixelXDimension"],
    ImageHeight: ["ImageHeight", "ExifImageHeight", "PixelYDimension"],
    BitsPerSample: ["BitsPerSample"],
    Make: ["Make"],
    Model: ["Model"],
    Orientation: ["Orientation"],
    XResolution: ["XResolution"],
    YResolution: ["YResolution"],
    ResolutionUnit: ["ResolutionUnit"],
    Software: ["Software"],
    ModifyDate: ["ModifyDate", "ModifyDateTimeOriginal"],
    LensInfo: ["LensInfo"],
    LensModel: ["LensModel", "Lens"],
    CreateDate: ["CreateDate", "DateTimeOriginal", "DateTimeDigitized"],
    ExposureTime: ["ExposureTime"],
    FNumber: ["FNumber", "ApertureValue"],
    ISO: ["ISO", "ISOSpeedRatings"],
    ExposureCompensation: ["ExposureCompensation", "ExposureBiasValue"],
    FocalLength: ["FocalLength"],
    GPSX: ["GPSLatitude"],
    GPSY: ["GPSLongitude"]
  };

  const FIELD_LABELS = Object.fromEntries(CORE_FIELDS.map((item) => [item.tag, { zh: item.zh, en: item.en }]));
  const GROUP_LABELS = {
    zh: { File: "文件", IFD0: "IFD0", ExifIFD: "ExifIFD", Position: "位置", OtherInfo: "其他信息" },
    en: { File: "File", IFD0: "IFD0", ExifIFD: "ExifIFD", Position: "Position", OtherInfo: "Other info" }
  };

  const UI = {
    zh: {
      title: "Exif&Sonnet | 拾光 101",
      eyebrow: "拾光 101 · PBL II",
      subtitle: "读取 EXIF 信息及文案自动书写小工具",
      upload: "上传图片",
      refresh: "重新读取",
      exportExif: "导出 EXIF",
      exportCopy: "导出文案",
      downloadZip: "打包下载",
      batch: "批处理",
      light: "浅色",
      dark: "深色",
      imageInputSection: "IMAGE / INPUT",
      metadataSection: "METADATA / EXIF",
      writingSection: "WRITING / SONNET",
      generatedText: "生成文案",
      copy: "复制",
      dropTitle: "请拖拽或点击上传图片",
      dropHint: "图片只在当前浏览器中处理，不会自动上传",
      replace: "点击替换",
      captureInfo: "拍摄信息",
      tableEnglish: "Field Name / 字段名称",
      tableChinese: "Chinese Name / 中文名称",
      tableValue: "Value / 值",
      sonnetTitle: "让一帧画面，留下声音",
      defaultMode: "默认配置生成",
      randomMode: "随机生成",
      customMode: "自定义生成",
      copyPlaceholder: "选择左侧一种方式，为当前图片写下一段只属于它的文字。",
      stopGeneration: "[ 强制结束此次生成 ]",
      batchKicker: "BATCH / CONFIG",
      batchImages: "批处理图片",
      chooseImages: "选择多张图片",
      copyMode: "文案模式",
      noCopy: "不生成文案",
      defaultConfig: "默认配置",
      randomGenerate: "随机生成",
      custom: "自定义",
      customPromptLabel: "自定义文案提示词",
      sharedAll: "所有图片共用",
      batchPromptPlaceholder: "选择自定义模式后填写，其他模式可留空。",
      cancelAndPack: "取消并打包已完成项",
      startProcessing: "开始处理",
      customKicker: "CUSTOM / PROMPT",
      writeForPhoto: "写给这张照片",
      promptLabel: "提示词",
      cancel: "取消",
      startGenerate: "开始生成",
      fileOp: "文件操作",
      displaySettings: "显示设置",
      imageUpload: "图片上传",
      exifPanel: "EXIF 信息",
      copyPanel: "文案生成器",
      waiting: "等待图片",
      loading: "读取中",
      ready: "已读取",
      error: "读取失败",
      generating: "生成中",
      generated: "已生成",
      ended: "已结束",
      failed: "生成失败",
      noFiles: "尚未选择文件",
      exifIntro: "选择一张图片后，浏览器会在本地读取可用的 EXIF 信息。",
      exifParsed: "{count} 个字段已整理；缺失的标准字段保留占位符。",
      exifFailed: "无法解析此文件的 EXIF；原图仍可预览，但不会生成 EXIF 表格。",
      readyCopy: "准备就绪",
      fileReady: "{name} · {size}",
      toastApiLoadFail: "API 配置加载失败，EXIF 与导出功能仍可使用",
      toastInvalidFile: "请选择 JPG、PNG、WEBP 或其他图片文件",
      toastExifReadFail: "EXIF 读取失败，已保留原图",
      toastNoExportExif: "当前没有可导出的 EXIF 表格",
      toastNoExportCopy: "当前还没有可导出的文案",
      toastCopySuccess: "文案已复制",
      toastCopyFail: "复制失败，请手动选择文字",
      toastGenerateFail: "文案生成失败",
      toastNeedFiles: "请先选择至少一张图片",
      toastNeedPrompt: "自定义模式需要填写 prompt",
      toastZipFail: "ZIP 打包失败，请稍后重试",
      toastApiUnavailable: "API 配置不可用",
      toastApiEmpty: "API 返回了空文案",
      toastTimeout: "请求超时，请稍后重试",
      batchPreparing: "准备中",
      batchCancelled: "已取消",
      batchDone: "处理完成",
      batchAllDone: "全部完成",
      batchCancelWorking: "正在整理已完成项…",
      batchNeedFiles: "请先选择至少一张图片",
      batchNeedPrompt: "自定义模式需要填写 prompt",
      batchProgress: "{index} / {total}",
      batchSelectedFiles: "{count} 张图片已选择",
      batchSummary: "{status}：{success} 张成功，{failure} 张失败。",
      copyButtonText: "复制",
      copyrightHead: "2026 PBL: 拾光101 · Exif&Sonnet Module",
      copyrightTail: "Special Adapted Version For Snap Snap club 摄影社",
      authorLine: "陈禹翔 Lambert · 孙昊跃 Jude"
    },
    en: {
      title: "Exif&Sonnet | ExifSonnet",
      eyebrow: "PBL II · 拾光 101",
      subtitle: "A local EXIF reader and auto-writing caption tool",
      upload: "Upload",
      refresh: "Read again",
      exportExif: "Export EXIF",
      exportCopy: "Export copy",
      downloadZip: "Download ZIP",
      batch: "Batch",
      light: "Light",
      dark: "Dark",
      imageInputSection: "IMAGE / INPUT",
      metadataSection: "METADATA / EXIF",
      writingSection: "WRITING / SONNET",
      generatedText: "Generated text",
      copy: "Copy",
      dropTitle: "Drag or click to upload an image",
      dropHint: "Images stay in this browser and are never uploaded automatically",
      replace: "Replace",
      captureInfo: "Capture details",
      tableEnglish: "Field Name / 字段名称",
      tableChinese: "Chinese Name / 中文名称",
      tableValue: "Value / 值",
      sonnetTitle: "Let one frame keep a voice",
      defaultMode: "Default prompt",
      randomMode: "Random prompt",
      customMode: "Custom prompt",
      copyPlaceholder: "Pick a mode on the left, then write a line that belongs only to this image.",
      stopGeneration: "[ Force-stop this generation ]",
      batchKicker: "BATCH / CONFIG",
      batchImages: "Batch images",
      chooseImages: "Choose images",
      copyMode: "Copy mode",
      noCopy: "No copy",
      defaultConfig: "Default prompt",
      randomGenerate: "Random prompt",
      custom: "Custom",
      customPromptLabel: "Custom prompt",
      sharedAll: "shared by all images",
      batchPromptPlaceholder: "Fill this only in Custom mode. Leave it blank for other modes.",
      cancelAndPack: "Cancel and pack completed items",
      startProcessing: "Start processing",
      customKicker: "CUSTOM / PROMPT",
      writeForPhoto: "Write for this photo",
      promptLabel: "Prompt",
      cancel: "Cancel",
      startGenerate: "Start generation",
      fileOp: "File actions",
      displaySettings: "Display settings",
      imageUpload: "Image upload",
      exifPanel: "EXIF details",
      copyPanel: "Caption generator",
      waiting: "Waiting for image",
      loading: "Reading",
      ready: "Read",
      error: "Read failed",
      generating: "Generating",
      generated: "Generated",
      ended: "Stopped",
      failed: "Generation failed",
      noFiles: "No files selected",
      exifIntro: "Choose an image and the browser will read its EXIF data locally.",
      exifParsed: "{count} fields organized; missing standard fields remain as placeholders.",
      exifFailed: "This file's EXIF could not be parsed. The image still previews, but no EXIF table is produced.",
      readyCopy: "Ready",
      fileReady: "{name} · {size}",
      toastApiLoadFail: "API config failed to load, but EXIF and export features still work",
      toastInvalidFile: "Choose a JPG, PNG, WEBP, or other image file",
      toastExifReadFail: "EXIF read failed; the original image is kept",
      toastNoExportExif: "No EXIF table is available for export",
      toastNoExportCopy: "No copy is available for export",
      toastCopySuccess: "Copy copied",
      toastCopyFail: "Copy failed; please select the text manually",
      toastGenerateFail: "Copy generation failed",
      toastNeedFiles: "Select at least one image first",
      toastNeedPrompt: "Custom mode needs a prompt",
      toastZipFail: "ZIP packaging failed. Try again later",
      toastApiUnavailable: "API config is unavailable",
      toastApiEmpty: "The API returned empty copy",
      toastTimeout: "Request timed out. Try again later",
      batchPreparing: "Preparing",
      batchCancelled: "Cancelled",
      batchDone: "Done",
      batchAllDone: "All done",
      batchCancelWorking: "Packing completed items…",
      batchNeedFiles: "Select at least one image first",
      batchNeedPrompt: "Custom mode needs a prompt",
      batchProgress: "{index} / {total}",
      batchSelectedFiles: "{count} images selected",
      batchSummary: "{status}: {success} succeeded, {failure} failed.",
      copyButtonText: "Copy",
      copyrightHead: "2026 PBL: ExifSonnet module",
      copyrightTail: "Special adapted version for Snap Snap club photography society",
      authorLine: "Chen Yuxiang Lambert · Sun Haoyue Jude"
    }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    fileInput: $("fileInput"),
    uploadBtn: $("uploadBtn"),
    refreshExifBtn: $("refreshExifBtn"),
    exportExifBtn: $("exportExifBtn"),
    exportCopyBtn: $("exportCopyBtn"),
    exportZipBtn: $("exportZipBtn"),
    batchBtn: $("batchBtn"),
    themeToggle: $("themeToggle"),
    languageToggle: $("languageToggle"),
    dropZone: $("dropZone"),
    dropContent: $("dropContent"),
    previewWrap: $("previewWrap"),
    previewImage: $("previewImage"),
    exifBody: $("exifBody"),
    copyOutput: $("copyOutput"),
    copyBtn: $("copyBtn"),
    loadingState: $("loadingState"),
    stopGenerationBtn: $("stopGenerationBtn"),
    toast: $("toast"),
    batchModal: $("batchModal"),
    batchForm: $("batchForm"),
    batchInput: $("batchInput"),
    batchFileLabel: $("batchFileLabel"),
    batchMode: $("batchMode"),
    batchPrompt: $("batchPrompt"),
    batchProgress: $("batchProgress"),
    batchProgressText: $("batchProgressText"),
    batchProgressCount: $("batchProgressCount"),
    batchProgressBar: $("batchProgressBar"),
    batchCancelBtn: $("batchCancelBtn"),
    batchStartBtn: $("batchStartBtn"),
    batchMessage: $("batchMessage"),
    customModal: $("customModal"),
    customForm: $("customForm"),
    customPrompt: $("customPrompt"),
    customSubmitBtn: $("customSubmitBtn")
  };

  const state = {
    file: null,
    imageUrl: null,
    dimensions: null,
    exif: null,
    rows: [],
    copy: "",
    api: null,
    controller: null,
    generation: false,
    batchCancelled: false,
    theme: loadSetting(STORAGE_KEYS.theme, DEFAULT_THEME),
    lang: loadSetting(STORAGE_KEYS.lang, DEFAULT_LANG)
  };

  let toastTimer = 0;

  function loadSetting(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function saveSetting(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* localStorage may be unavailable in some contexts. */
    }
  }

  function t(key, vars = {}) {
    const value = UI[state.lang][key] ?? UI[DEFAULT_LANG][key] ?? key;
    return String(value).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function safeName(name) {
    return (name || "image").replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").trim() || "image";
  }

  function baseName(name) {
    return String(name || "image").replace(/\.[^.]+$/, "");
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "--";
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    let value = bytes;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return `${value.toFixed(index ? 1 : 0)} ${units[index]}`;
  }

  function formatValue(value) {
    if (value === null || value === undefined || value === "") return PLACEHOLDER;
    if (value instanceof Date) return value.toLocaleString(state.lang === "en" ? "en-US" : "zh-CN", { hour12: false });
    if (Array.isArray(value)) return value.map(formatValue).join(", ");
    if (typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${formatValue(item)}`).join("; ");
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    return String(value);
  }

  function getTagValue(data, tag) {
    for (const alias of TAG_ALIASES[tag] || [tag]) {
      if (data && data[alias] !== undefined && data[alias] !== null && data[alias] !== "") return data[alias];
    }
    return null;
  }

  function groupLabel(group) {
    return GROUP_LABELS[state.lang][group] || group;
  }

  function humanize(tag, value) {
    if (value === null || value === undefined) return PLACEHOLDER;
    if (tag === "FocalLength" && typeof value === "number") return `${formatValue(value)} mm`;
    if (tag === "FNumber" && typeof value === "number") return `f/${formatValue(value)}`;
    if (tag === "ExposureTime" && typeof value === "number") return value < 1 ? `1/${Math.round(1 / value)} s` : `${formatValue(value)} s`;
    if (tag === "ExposureCompensation" && typeof value === "number") return `${value > 0 ? "+" : ""}${formatValue(value)} EV`;
    if (["XResolution", "YResolution"].includes(tag) && typeof value === "number") return `${formatValue(value)} dpi`;
    if (["GPSX", "GPSY"].includes(tag) && typeof value === "number") return `${formatValue(value)}°`;
    return formatValue(value);
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => els.toast.classList.remove("show"), 3400);
  }

  function setTextByKey(selector, key) {
    document.querySelectorAll(selector).forEach((node) => {
      const value = t(key);
      if (node.tagName === "OPTION" || node.tagName === "SPAN" || node.tagName === "B" || node.tagName === "H2" || node.tagName === "LABEL" || node.tagName === "SMALL" || node.tagName === "P") {
        node.textContent = value;
      } else {
        node.textContent = value;
      }
    });
  }

  function applyTitles() {
    els.uploadBtn.title = state.lang === "en" ? "Upload one image" : "上传一张图片";
    els.refreshExifBtn.title = state.lang === "en" ? "Re-read EXIF from the current image" : "重新解析当前图片的 EXIF";
    els.exportExifBtn.title = state.lang === "en" ? "Export the current image EXIF" : "导出当前图片 EXIF";
    els.exportCopyBtn.title = state.lang === "en" ? "Export the generated copy" : "导出文案";
    els.exportZipBtn.title = state.lang === "en" ? "Export the image and attachments" : "导出当前图片及附件";
    els.batchBtn.title = state.lang === "en" ? "Batch-process multiple images" : "批量处理多张图片";
    els.themeToggle.title = state.lang === "en" ? "Switch between light and dark mode" : "切换浅色或深色模式";
    els.languageToggle.title = state.lang === "en" ? "Switch between Chinese and English" : "切换中文或英文";
    els.copyBtn.title = state.lang === "en" ? "Copy the generated copy" : "复制文案";
    els.stopGenerationBtn.title = state.lang === "en" ? "Stop this generation" : "强制结束此次生成";
    document.querySelectorAll(".icon-button[value='cancel']").forEach((button) => {
      button.title = state.lang === "en" ? "Close" : "关闭";
    });
  }

  function renderStaticCopy() {
    document.title = UI[state.lang].title;
    document.documentElement.lang = state.lang === "en" ? "en" : "zh-CN";
    document.body.dataset.theme = state.theme;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (!key) return;
      node.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      if (key) node.placeholder = t(key);
    });

    document.querySelectorAll("[data-status-key]").forEach((node) => {
      const key = node.dataset.statusKey;
      if (key) node.textContent = t(key);
    });

    document.querySelectorAll("[data-note-key]").forEach((node) => {
      const key = node.dataset.noteKey;
      if (key === "exifIntro") node.textContent = t("exifIntro");
    });




    setTextByKey(".editor-label", "generatedText");
    setTextByKey(".copy-action span", "copy");
    setTextByKey(".modal-kicker[data-i18n='batchKicker']", "batchKicker");
    setTextByKey(".modal-kicker[data-i18n='customKicker']", "customKicker");
    setTextByKey("label[for='customPrompt'][data-i18n='promptLabel']", "promptLabel");

    els.copyOutput.placeholder = t("copyPlaceholder");
    applyTitles();
    applyTheme(state.theme, false);
    applyLanguageControls(false);
    syncDynamicText();
  }

  function applyTheme(theme, persist = true) {
    state.theme = theme === "dark" ? "dark" : "light";
    document.body.dataset.theme = state.theme;
    document.documentElement.style.colorScheme = state.theme;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLOR[state.theme]);
    els.themeToggle.setAttribute("aria-checked", String(state.theme === "dark"));
    els.themeToggle.querySelectorAll(".switch-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.value === state.theme);
    });
    if (persist) saveSetting(STORAGE_KEYS.theme, state.theme);
  }

  function applyLanguageControls(persist = true) {
    els.languageToggle.setAttribute("aria-checked", String(state.lang === "en"));
    els.languageToggle.querySelectorAll(".switch-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.value === state.lang);
    });
    if (persist) saveSetting(STORAGE_KEYS.lang, state.lang);
  }

  function syncDynamicText() {
    els.batchFileLabel.textContent = els.batchInput.files.length ? t("batchSelectedFiles", { count: els.batchInput.files.length }) : t("noFiles");
  }

  function setBatchMessage(keyOrText, error = false, vars = {}, translated = true) {
    els.batchMessage.textContent = translated ? t(keyOrText, vars) : keyOrText;
    els.batchMessage.classList.toggle("error", error);
  }

  function finalizeRows(rows) {
    const result = [];
    let index = 0;
    while (index < rows.length) {
      const group = rows[index].group;
      let end = index + 1;
      while (end < rows.length && rows[end].group === group) end += 1;
      const span = end - index;
      result.push({
        type: "group",
        group,
        groupLabel: groupLabel(group),
        groupSpan: span
      });
      for (let offset = 0; offset < span; offset += 1) {
        result.push({
          type: "row",
          ...rows[index + offset],
          groupSpan: span,
          groupStart: offset === 0
        });
      }
      index = end;
    }
    return result;
  }

  function renderRows(rows) {
    els.exifBody.innerHTML = finalizeRows(rows).map((row) => {
      if (row.type === "group") {
        return `<tr class="group-row"><td class="group-cell" colspan="3">${escapeHtml(row.groupLabel)}</td></tr>`;
      }
      const placeholderClass = row.value === PLACEHOLDER ? "placeholder" : "";
      const chineseCell = row.chineseLabel ? `<td class="chinese-cell">${escapeHtml(row.chineseLabel)}</td>` : `<td class="chinese-cell empty"></td>`;
      return `<tr class="${placeholderClass}"><td class="english-cell">${escapeHtml(row.englishLabel)}</td>${chineseCell}<td class="value-cell">${escapeHtml(row.value)}</td></tr>`;
    }).join("");
  }

  function makeRows(data, file, dimensions) {
    const rows = [];
    for (const item of CORE_FIELDS) {
      let value = getTagValue(data, item.tag);
      if (item.tag === "FileType") value = file.type || value;
      if (item.tag === "ImageWidth") value = dimensions?.width || value;
      if (item.tag === "ImageHeight") value = dimensions?.height || value;
      rows.push({
        group: item.group,
        groupLabel: groupLabel(item.group),
        englishLabel: FIELD_LABELS[item.tag]?.en || item.tag,
        chineseLabel: FIELD_LABELS[item.tag]?.zh || "",
        value: humanize(item.tag, value)
      });
    }

    const known = new Set(Object.values(TAG_ALIASES).flat());
    Object.entries(data || {}).forEach(([tag, value]) => {
      if (known.has(tag) || tag.startsWith("GPS") || tag.startsWith("Thumbnail")) return;
      rows.push({
        group: "OtherInfo",
        groupLabel: groupLabel("OtherInfo"),
        englishLabel: tag,
        chineseLabel: "",
        value: formatValue(value)
      });
    });
    return rows;
  }

  function setProcessButtons(enabled) {
    [els.refreshExifBtn, els.exportExifBtn, els.exportZipBtn, els.exportCopyBtn, ...document.querySelectorAll(".mode-button")].forEach((button) => {
      button.disabled = !enabled;
    });
    els.exportCopyBtn.disabled = !enabled || !state.copy;
  }

  function clearCurrent() {
    if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
    state.file = null;
    state.imageUrl = null;
    state.dimensions = null;
    state.exif = null;
    state.rows = [];
    state.copy = "";

    els.fileInput.value = "";
    els.previewWrap.hidden = true;
    els.dropContent.hidden = false;
    els.copyOutput.value = "";
    els.copyOutput.classList.remove("error");
    els.copyBtn.disabled = true;
    renderRows(makeRows({}, { type: "" }, {}));
    setProcessButtons(false);
  }

  function decodeBase64(value) {
    try {
      return decodeURIComponent(escape(window.atob(String(value || ""))));
    } catch {
      return window.atob(String(value || ""));
    }
  }

  function decodeConfigValue(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      return decodeBase64(raw);
    } catch {
      // Accept a plain URL for proxy_url during local setup, while keeping
      // the documented Base64 format available for published config files.
      return raw;
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch("config.json", { cache: "no-store" });
      if (!response.ok) throw new Error("config.json load failed");
      const config = await response.json();
      state.api = {
        ...config,
        baseUrl: decodeConfigValue(config.base_url),
        apiKey: decodeConfigValue(config.API_key),
        proxyUrl: decodeConfigValue(config.proxy_url)
      };
    } catch {
      state.api = null;
      showToast(t("toastApiLoadFail"));
    }
  }

  async function getDimensions(file) {
    return new Promise((resolve) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const result = { width: image.naturalWidth, height: image.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(result);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
      image.src = url;
    });
  }

  function getTimeoutSignal(externalSignal, timeoutMs) {
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const forwardAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", forwardAbort, { once: true });
    }
    return {
      signal: controller.signal,
      timedOut: () => timedOut,
      cleanup() {
        clearTimeout(timer);
        if (externalSignal) externalSignal.removeEventListener("abort", forwardAbort);
      }
    };
  }

  async function parseExif(file, silent = false) {
    try {
      if (!window.exifr?.parse) throw new Error("exifr unavailable");
      state.dimensions = await getDimensions(file);
      const data = await window.exifr.parse(file, {
        tiff: true,
        exif: true,
        gps: true,
        ifd0: true,
        translateValues: true,
        mergeOutput: true
      });
      state.exif = data || {};
      state.rows = makeRows(state.exif, file, state.dimensions);
      renderRows(state.rows);
      setProcessButtons(true);
      return true;
    } catch {
      state.exif = null;
      state.dimensions = state.dimensions || {};
      state.rows = makeRows({}, file, state.dimensions);
      renderRows(state.rows);
      setProcessButtons(true);
      els.exportExifBtn.disabled = true;
      if (!silent) showToast(t("toastExifReadFail"));
      return false;
    }
  }

  async function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast(t("toastInvalidFile"));
      return;
    }

    clearCurrent();
    state.file = file;
    state.imageUrl = URL.createObjectURL(file);

    els.previewImage.src = state.imageUrl;
    els.previewWrap.hidden = false;
    els.dropContent.hidden = true;
    await parseExif(file);
  }

  function getRowsForExport() {
    return state.rows.map((row) => ({
      "Field Name / 字段名称": row.englishLabel,
      "Chinese Name / 中文名称": row.chineseLabel,
      "Value / 值": row.value
    }));
  }

  function makeWorkbook() {
    const worksheet = XLSX.utils.json_to_sheet(getRowsForExport());
    worksheet["!cols"] = [{ wch: 30 }, { wch: 28 }, { wch: 70 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EXIF");
    return workbook;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportExif() {
    if (!state.file || !state.exif || !window.XLSX) {
      showToast(t("toastNoExportExif"));
      return;
    }
    const data = XLSX.write(makeWorkbook(), { bookType: "xlsx", type: "array" });
    downloadBlob(new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `exif_${safeName(baseName(state.file.name))}.xlsx`);
  }

  function exportCopy() {
    if (!state.copy) {
      showToast(t("toastNoExportCopy"));
      return;
    }
    downloadBlob(new Blob([state.copy], { type: "text/plain;charset=utf-8" }), `文案_${safeName(baseName(state.file.name))}.txt`);
  }

  async function zipCurrent() {
    if (!state.file || !window.JSZip) return;
    const zip = new JSZip();
    const folder = zip.folder(safeName(baseName(state.file.name)));
    folder.file(state.file.name, state.file);
    if (state.exif) {
      const data = XLSX.write(makeWorkbook(), { bookType: "xlsx", type: "array" });
      folder.file(`exif_${safeName(baseName(state.file.name))}.xlsx`, data);
    }
    if (state.copy) folder.file(`文案_${safeName(baseName(state.file.name))}.txt`, state.copy);
    downloadBlob(await zip.generateAsync({ type: "blob" }), `ExifSonnet_${safeName(baseName(state.file.name))}.zip`);
  }

  function buildPrompt(mode, rows, customPrompt = "") {
    const values = Object.fromEntries(rows.filter((row) => row.value !== PLACEHOLDER).map((row) => [row.tag, row.value]));
    const variation = Math.random().toString(36).slice(2, 8);
    const configuredPrompt = mode === "custom" ? customPrompt : state.api?.prompts?.[mode];
    const fallbackPrompt = mode === "random"
      ? "请以随机但克制的文学风格写作，尝试不同的节奏、意象和视角。"
      : "请写一段有文学感、有余韵的中文摄影文案。";
    const intro = configuredPrompt?.trim() || fallbackPrompt;
    return `${intro}\n\n请根据以下照片 EXIF 信息创作文案：${JSON.stringify(values, null, 2)}\n要求：只输出最终文案文字，不要标题、引号、Markdown、解释或 JSON；内容要具体回应这张照片的拍摄时间与可用信息；本次创作变化标记为 ${variation}，请让结果与之前略有不同。`;
  }

  function extractContent(payload) {
    return payload?.choices?.[0]?.delta?.content ?? payload?.choices?.[0]?.message?.content ?? payload?.output_text ?? "";
  }

  async function requestCopy(mode, customPrompt, rows = state.rows, signal = null) {
    const useProxy = Boolean(state.api?.proxyUrl);
    if (!useProxy && (!state.api?.baseUrl || !state.api?.apiKey)) throw new Error(t("toastApiUnavailable"));
    const timeout = getTimeoutSignal(signal, state.api.timeoutMs || TIMEOUT_MS);
    try {
      const requestBase = useProxy ? state.api.proxyUrl : state.api.baseUrl;
      const url = `${requestBase.replace(/\/$/, "")}/${String(state.api.endpoint || "/v1/chat/completions").replace(/^\//, "")}`;
      const headers = { "Content-Type": "application/json" };
      if (!useProxy) headers.Authorization = `Bearer ${state.api.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        signal: timeout.signal,
        headers,
        body: JSON.stringify({
          model: state.api.model || "gpt-5.4",
          temperature: mode === "random" ? 1.15 : 0.82,
          stream: true,
          messages: [
            { role: "system", content: "你是一位中文摄影文案作者。" },
            { role: "user", content: buildPrompt(mode, rows, customPrompt) }
          ]
        })
      });

      if (!response.ok) {
        const raw = await response.text();
        throw new Error(raw || `HTTP ${response.status}`);
      }

      let result = "";
      if (response.body?.getReader) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const chunk = line.slice(5).trim();
            if (!chunk || chunk === "[DONE]") continue;
            try {
              const content = extractContent(JSON.parse(chunk));
              if (content) {
                result += content;
                if (!rows || rows === state.rows) els.copyOutput.value = result;
              }
            } catch {
              /* Ignore keepalive or non-JSON chunks. */
            }
          }
        }
      } else {
        result = extractContent(await response.json());
      }

      if (timeout.timedOut()) throw new Error(t("toastTimeout"));
      return result.trim();
    } catch (error) {
      if (timeout.timedOut()) throw new Error(t("toastTimeout"));
      throw error;
    } finally {
      timeout.cleanup();
    }
  }

  async function startGeneration(mode, customPrompt = "") {
    if (!state.file || state.generation) return;
    state.generation = true;
    state.copy = "";
    els.copyOutput.value = "";
    els.copyOutput.classList.remove("error");
    els.loadingState.hidden = false;
    setProcessButtons(false);
    state.controller = new AbortController();

    try {
      const result = await requestCopy(mode, customPrompt, state.rows, state.controller.signal);
      if (!result) throw new Error(t("toastApiEmpty"));
      state.copy = result;
      els.copyOutput.value = result;
      els.copyOutput.classList.remove("error");
      els.copyBtn.disabled = false;
    } catch (error) {
      if (error.name === "AbortError") {
        if (!els.copyOutput.value) els.copyOutput.value = state.lang === "en" ? "This generation was stopped." : "本次生成已被结束。";
      } else {
        els.copyOutput.classList.add("error");
        els.copyOutput.value = error.message || t("toastGenerateFail");
        showToast(error.message || t("toastGenerateFail"));
      }
    } finally {
      els.loadingState.hidden = true;
      state.generation = false;
      state.controller = null;
      setProcessButtons(Boolean(state.file));
      els.exportCopyBtn.disabled = !state.copy;
    }
  }

  async function chooseMode(mode) {
    if (mode === "custom") {
      els.customPrompt.value = "";
      els.customModal.showModal();
      return;
    }
    await startGeneration(mode);
  }

  function updateBatchLabel() {
    const count = els.batchInput.files.length;
    els.batchFileLabel.textContent = count ? t("batchSelectedFiles", { count }) : t("noFiles");
  }

  async function processBatch() {
    const files = Array.from(els.batchInput.files);
    if (!files.length) {
      setBatchMessage("batchNeedFiles", true);
      return;
    }

    const mode = els.batchMode.value;
    const customPrompt = els.batchPrompt.value.trim();
    if (mode === "custom" && !customPrompt) {
      setBatchMessage("batchNeedPrompt", true);
      return;
    }

    els.batchStartBtn.hidden = true;
    els.batchCancelBtn.hidden = false;
    els.batchProgress.hidden = false;
    els.batchInput.disabled = true;
    els.batchMode.disabled = true;
    els.batchPrompt.disabled = true;
    state.batchCancelled = false;

    const complete = [];
    let success = 0;
    let failure = 0;

    for (let index = 0; index < files.length; index += 1) {
      if (state.batchCancelled) break;
      const file = files[index];
      els.batchProgressText.textContent = file.name;
      els.batchProgressCount.textContent = t("batchProgress", { index: index + 1, total: files.length });
      els.batchProgressBar.style.width = `${(index / files.length) * 100}%`;

      try {
        const dimensions = await getDimensions(file);
        let exif = {};
        let exifOk = true;
        if (window.exifr?.parse) {
          try {
            exif = await window.exifr.parse(file, {
              tiff: true,
              exif: true,
              gps: true,
              ifd0: true,
              translateValues: true,
              mergeOutput: true
            }) || {};
          } catch {
            exifOk = false;
          }
        } else {
          exifOk = false;
        }

        const rows = makeRows(exif, file, dimensions);
        let copy = "";
        if (mode !== "none" && exifOk) copy = await requestCopy(mode, customPrompt, rows);
        complete.push({ file, exifOk, rows, copy, base: safeName(baseName(file.name)) });
        success += 1;
      } catch {
        failure += 1;
      }
    }

    els.batchProgressBar.style.width = `${(complete.length / files.length) * 100}%`;
    const cancelled = state.batchCancelled;

    if (complete.length) {
      try {
        await downloadBatchZip(complete);
      } catch {
        setBatchMessage("toastZipFail", true);
      }
    }

    els.batchInput.disabled = false;
    els.batchMode.disabled = false;
    els.batchPrompt.disabled = els.batchMode.value !== "custom";
    els.batchStartBtn.hidden = false;
    els.batchCancelBtn.hidden = true;
    setBatchMessage("batchSummary", false, {
      status: cancelled ? t("batchCancelled") : t("batchDone"),
      success,
      failure
    });
    els.batchProgressText.textContent = cancelled ? t("batchCancelled") : t("batchAllDone");
  }

  async function downloadBatchZip(items) {
    const zip = new JSZip();
    const used = new Set();

    for (const item of items) {
      let folderName = item.base;
      let suffix = 2;
      while (used.has(folderName)) folderName = `${item.base} (${suffix++})`;
      used.add(folderName);

      const folder = zip.folder(folderName);
      folder.file(item.file.name, item.file);
      if (item.exifOk) {
        const worksheet = XLSX.utils.json_to_sheet(item.rows.map((row) => ({
          "Field Name / 字段名称": row.englishLabel,
          "Chinese Name / 中文名称": row.chineseLabel,
          "Value / 值": row.value
        })));
        worksheet["!cols"] = [{ wch: 30 }, { wch: 28 }, { wch: 70 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "EXIF");
        folder.file(`exif_${item.base}.xlsx`, XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
      }
      if (item.copy) folder.file(`文案_${item.base}.txt`, item.copy);
    }

    const stamp = new Date().toISOString().replace(/[.:-]/g, "").slice(0, 15);
    downloadBlob(await zip.generateAsync({ type: "blob" }), `ExifSonnet_${stamp}.zip`);
  }

  function refreshLanguageAwareContent() {
    if (state.file) {
      state.rows = makeRows(state.exif || {}, state.file, state.dimensions || {});
      renderRows(state.rows);
    } else {
      renderRows(makeRows({}, { type: "" }, {}));
    }
    if (state.file && state.copy) els.copyOutput.value = state.copy;
  }

  function setLanguage(lang) {
    state.lang = lang === "en" ? "en" : "zh";
    applyLanguageControls();
    saveSetting(STORAGE_KEYS.lang, state.lang);
    renderStaticCopy();
    refreshLanguageAwareContent();
  }

  function setTheme(theme) {
    applyTheme(theme);
    saveSetting(STORAGE_KEYS.theme, state.theme);
  }

  function bindEvents() {
    els.uploadBtn.addEventListener("click", () => els.fileInput.click());
    els.dropZone.addEventListener("click", () => els.fileInput.click());
    els.dropZone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        els.fileInput.click();
      }
    });
    els.fileInput.addEventListener("change", (event) => loadFile(event.target.files[0]));

    ["dragenter", "dragover"].forEach((name) => {
      els.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        els.dropZone.classList.add("dragging");
      });
    });
    ["dragleave", "drop"].forEach((name) => {
      els.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        els.dropZone.classList.remove("dragging");
      });
    });
    els.dropZone.addEventListener("drop", (event) => loadFile(event.dataTransfer.files[0]));

    els.refreshExifBtn.addEventListener("click", () => state.file && parseExif(state.file));
    els.exportExifBtn.addEventListener("click", exportExif);
    els.exportCopyBtn.addEventListener("click", exportCopy);
    els.exportZipBtn.addEventListener("click", zipCurrent);
    els.copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(state.copy);
        showToast(t("toastCopySuccess"));
      } catch {
        showToast(t("toastCopyFail"));
      }
    });

    document.querySelectorAll(".mode-button").forEach((button) => {
      button.addEventListener("click", () => chooseMode(button.dataset.mode));
    });

    els.stopGenerationBtn.addEventListener("click", () => state.controller?.abort());

    els.customForm.addEventListener("submit", (event) => {
      if (event.submitter?.value !== "default") return;
      event.preventDefault();
      els.customModal.close();
      startGeneration("custom", els.customPrompt.value.trim());
    });

    els.themeToggle.addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));
    els.languageToggle.addEventListener("click", () => setLanguage(state.lang === "en" ? "zh" : "en"));

    els.batchBtn.addEventListener("click", () => {
      els.batchModal.showModal();
      updateBatchLabel();
    });
    els.batchInput.addEventListener("change", updateBatchLabel);
    els.batchMode.addEventListener("change", () => {
      els.batchPrompt.disabled = els.batchMode.value !== "custom";
    });
    els.batchStartBtn.addEventListener("click", processBatch);
    els.batchCancelBtn.addEventListener("click", () => {
      state.batchCancelled = true;
      els.batchCancelBtn.disabled = true;
      els.batchProgressText.textContent = t("batchCancelWorking");
    });
    els.batchForm.addEventListener("submit", (event) => {
      if (event.submitter?.value === "cancel") event.preventDefault();
    });
  }

  function init() {
    renderStaticCopy();
    bindEvents();
    clearCurrent();
    setTheme(state.theme, false);
    setLanguage(state.lang);
    loadConfig();
    if (window.lucide) window.lucide.createIcons();
  }

  init();
})();
