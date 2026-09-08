/**
 * 張り紙メーカー v0.9.1 - メインアプリケーションロジック
 */

// モジュールまたはグローバルから参照
const PRESETS_DATA = typeof PRESETS !== 'undefined' ? PRESETS : window.PRESETS;
const PALETTES_DATA = typeof COLOR_PALETTES !== 'undefined' ? COLOR_PALETTES : window.COLOR_PALETTES;
const SIZES_DATA = typeof PAPER_SIZES !== 'undefined' ? PAPER_SIZES : window.PAPER_SIZES;

const renderPoster = typeof renderPosterToCanvas !== 'undefined' ? renderPosterToCanvas : window.renderPosterToCanvas;
const savePNG = typeof downloadPNG !== 'undefined' ? downloadPNG : window.downloadPNG;
const savePDF = typeof downloadPDF !== 'undefined' ? downloadPDF : window.downloadPDF;
const printPosterFunc = typeof printPoster !== 'undefined' ? printPoster : window.printPoster;

// ==========================================================================
// 1. アプリケーション状態 (State)
// ==========================================================================
const state = {
  title: PRESETS_DATA[0].title,
  subtitle: PRESETS_DATA[0].subtitle,
  activePresetId: PRESETS_DATA[0].id,
  
  paperSize: SIZES_DATA[0], // A4
  orientation: 'landscape', // landscape | portrait
  
  bgColor: PALETTES_DATA[0].bg,
  textColor: PALETTES_DATA[0].text,
  
  bgImageUrl: null,
  bgImage: null,
  
  showCropMarks: false, // デフォルトOFF (つけたい人だけ付けられる)
  showDivider: true,
  
  titleFontSize: 100,
  subtitleFontSize: 70,
  
  logoUrl: null,
  logoImage: null,
  logoPosition: 'top',
  logoScale: 100,
  
  zoom: 0.55
};

// DOM要素キャッシュ
let DOM = {};

function initDOM() {
  DOM = {
    canvas: document.getElementById('posterCanvas'),
    canvasWrapper: document.getElementById('canvasWrapper'),
    canvasViewport: document.getElementById('canvasViewport'),
    
    // タブ
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    
    // プリセット & カラー
    presetGrid: document.getElementById('presetGrid'),
    colorGrid: document.getElementById('colorGrid'),
    
    // フォームコントロール
    inputTitle: document.getElementById('inputTitle'),
    inputSubtitle: document.getElementById('inputSubtitle'),
    sliderTitleSize: document.getElementById('sliderTitleSize'),
    sliderSubtitleSize: document.getElementById('sliderSubtitleSize'),
    valTitleSize: document.getElementById('valTitleSize'),
    valSubtitleSize: document.getElementById('valSubtitleSize'),
    chkDivider: document.getElementById('chkDivider'),
    
    // ロゴコントロール
    inputLogo: document.getElementById('inputLogo'),
    selectLogoPos: document.getElementById('selectLogoPos'),
    sliderLogoScale: document.getElementById('sliderLogoScale'),
    valLogoScale: document.getElementById('valLogoScale'),
    btnRemoveLogo: document.getElementById('btnRemoveLogo'),
    logoPreviewName: document.getElementById('logoPreviewName'),
    
    // 用紙 & カラー & 背景画像
    selectPaperSize: document.getElementById('selectPaperSize'),
    btnOrientationLandscape: document.getElementById('btnOrientationLandscape'),
    btnOrientationPortrait: document.getElementById('btnOrientationPortrait'),
    pickerBg: document.getElementById('pickerBg'),
    pickerText: document.getElementById('pickerText'),
    inputBgImg: document.getElementById('inputBgImg'),
    btnRemoveBgImg: document.getElementById('btnRemoveBgImg'),
    bgImgPreviewName: document.getElementById('bgImgPreviewName'),
    
    // トンボ
    chkCropMarks: document.getElementById('chkCropMarks'),
    
    // ズーム & 情報
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomReset: document.getElementById('btnZoomReset'),
    txtZoomLevel: document.getElementById('txtZoomLevel'),
    badgePaperSize: document.getElementById('badgePaperSize'),
    
    // アクション
    btnPrint: document.getElementById('btnPrint'),
    btnDownloadPDF: document.getElementById('btnDownloadPDF'),
    btnDownloadPNG: document.getElementById('btnDownloadPNG')
  };
}

// ==========================================================================
// 2. 初期化 & UI生成
// ==========================================================================
function init() {
  initDOM();
  renderPresetCards();
  renderColorSwatches();
  bindEvents();
  autoFitZoom();
  updatePoster();
}

// 11種類のプリセットカード描画
function renderPresetCards() {
  DOM.presetGrid.innerHTML = PRESETS_DATA.map(preset => `
    <div class="preset-card ${preset.id === state.activePresetId ? 'active' : ''}" data-id="${preset.id}">
      <div class="preset-icon">${preset.icon}</div>
      <div class="preset-title">${preset.title}</div>
      <div class="preset-sub">${preset.subtitle}</div>
    </div>
  `).join('');
  
  DOM.presetGrid.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      selectPreset(id);
    });
  });
}

// カラーパレット描画
function renderColorSwatches() {
  DOM.colorGrid.innerHTML = PALETTES_DATA.map(c => `
    <div class="color-swatch ${c.bg === state.bgColor ? 'active' : ''}" 
         data-bg="${c.bg}" data-text="${c.text}"
         style="background-color: ${c.bg};">
      ${c.bg === state.bgColor ? '<span class="color-swatch-check">✓</span>' : ''}
    </div>
  `).join('');
  
  DOM.colorGrid.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.bgColor = swatch.dataset.bg;
      state.textColor = swatch.dataset.text;
      DOM.pickerBg.value = state.bgColor;
      DOM.pickerText.value = state.textColor;
      renderColorSwatches();
      updatePoster();
    });
  });
}

// ==========================================================================
// 3. イベントバインディング
// ==========================================================================
function bindEvents() {
  // タブ切り替え
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      DOM.tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // メイン文言・サブ文言
  DOM.inputTitle.addEventListener('input', (e) => {
    state.title = e.target.value;
    state.activePresetId = null;
    highlightActivePreset();
    updatePoster();
  });
  
  DOM.inputSubtitle.addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    state.activePresetId = null;
    highlightActivePreset();
    updatePoster();
  });

  // スライダー
  DOM.sliderTitleSize.addEventListener('input', (e) => {
    state.titleFontSize = parseInt(e.target.value, 10);
    DOM.valTitleSize.textContent = state.titleFontSize;
    updatePoster();
  });
  
  DOM.sliderSubtitleSize.addEventListener('input', (e) => {
    state.subtitleFontSize = parseInt(e.target.value, 10);
    DOM.valSubtitleSize.textContent = state.subtitleFontSize;
    updatePoster();
  });
  
  DOM.chkDivider.addEventListener('change', (e) => {
    state.showDivider = e.target.checked;
    updatePoster();
  });

  // ロゴアップロード
  DOM.inputLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        state.logoImage = img;
        state.logoUrl = evt.target.result;
        DOM.logoPreviewName.textContent = `選択中: ${file.name}`;
        DOM.btnRemoveLogo.disabled = false;
        updatePoster();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  DOM.selectLogoPos.addEventListener('change', (e) => {
    state.logoPosition = e.target.value;
    updatePoster();
  });
  
  DOM.sliderLogoScale.addEventListener('input', (e) => {
    state.logoScale = parseInt(e.target.value, 10);
    DOM.valLogoScale.textContent = state.logoScale;
    updatePoster();
  });
  
  DOM.btnRemoveLogo.addEventListener('click', () => {
    state.logoUrl = null;
    state.logoImage = null;
    DOM.inputLogo.value = '';
    DOM.logoPreviewName.textContent = '';
    DOM.btnRemoveLogo.disabled = true;
    updatePoster();
  });

  // 用紙サイズ & 向き
  DOM.selectPaperSize.addEventListener('change', (e) => {
    const sizeObj = SIZES_DATA.find(p => p.id === e.target.value);
    if (sizeObj) {
      state.paperSize = sizeObj;
      updatePaperBadge();
      updatePoster();
    }
  });

  DOM.btnOrientationLandscape.addEventListener('click', () => {
    state.orientation = 'landscape';
    DOM.btnOrientationLandscape.classList.add('active');
    DOM.btnOrientationPortrait.classList.remove('active');
    updatePaperBadge();
    updatePoster();
  });

  DOM.btnOrientationPortrait.addEventListener('click', () => {
    state.orientation = 'portrait';
    DOM.btnOrientationPortrait.classList.add('active');
    DOM.btnOrientationLandscape.classList.remove('active');
    updatePaperBadge();
    updatePoster();
  });

  // カラーピッカー
  DOM.pickerBg.addEventListener('input', (e) => {
    state.bgColor = e.target.value;
    renderColorSwatches();
    updatePoster();
  });

  DOM.pickerText.addEventListener('input', (e) => {
    state.textColor = e.target.value;
    renderColorSwatches();
    updatePoster();
  });

  // 背景画像アップロード
  DOM.inputBgImg.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        state.bgImage = img;
        state.bgImageUrl = evt.target.result;
        DOM.bgImgPreviewName.textContent = `選択中: ${file.name}`;
        DOM.btnRemoveBgImg.disabled = false;
        updatePoster();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  DOM.btnRemoveBgImg.addEventListener('click', () => {
    state.bgImageUrl = null;
    state.bgImage = null;
    DOM.inputBgImg.value = '';
    DOM.bgImgPreviewName.textContent = '';
    DOM.btnRemoveBgImg.disabled = true;
    updatePoster();
  });

  // トンボ
  DOM.chkCropMarks.addEventListener('change', (e) => {
    state.showCropMarks = e.target.checked;
    updatePoster();
  });

  // ズームコントロール
  DOM.btnZoomIn.addEventListener('click', () => setZoom(state.zoom + 0.05));
  DOM.btnZoomOut.addEventListener('click', () => setZoom(state.zoom - 0.05));
  DOM.btnZoomReset.addEventListener('click', () => autoFitZoom());

  // ダウンロード・印刷ボタン
  DOM.btnDownloadPNG.addEventListener('click', () => {
    const name = `${state.title.replace(/\s+/g, '_')}_${state.paperSize.name}.png`;
    savePNG(state, name);
  });

  DOM.btnDownloadPDF.addEventListener('click', () => {
    const name = `${state.title.replace(/\s+/g, '_')}_${state.paperSize.name}.pdf`;
    savePDF(state, name);
  });

  DOM.btnPrint.addEventListener('click', () => {
    printPosterFunc(state);
  });
}

// プリセット選択処理
function selectPreset(id) {
  const preset = PRESETS_DATA.find(p => p.id === id);
  if (!preset) return;
  
  state.title = preset.title;
  state.subtitle = preset.subtitle;
  state.activePresetId = id;
  
  DOM.inputTitle.value = preset.title;
  DOM.inputSubtitle.value = preset.subtitle;
  
  highlightActivePreset();
  updatePoster();
}

function highlightActivePreset() {
  DOM.presetGrid.querySelectorAll('.preset-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === state.activePresetId);
  });
}

function updatePaperBadge() {
  const isL = state.orientation === 'landscape';
  const w = isL ? state.paperSize.width : state.paperSize.height;
  const h = isL ? state.paperSize.height : state.paperSize.width;
  const dir = isL ? '横' : '縦';
  
  DOM.badgePaperSize.textContent = `${state.paperSize.name} (${dir}) ${w} × ${h} mm`;
}

function setZoom(newZoom) {
  state.zoom = Math.min(Math.max(0.2, newZoom), 1.5);
  DOM.txtZoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  DOM.canvasWrapper.style.transform = `scale(${state.zoom})`;
}

function autoFitZoom() {
  const viewportW = DOM.canvasViewport.clientWidth - 80;
  const viewportH = DOM.canvasViewport.clientHeight - 80;
  
  const isL = state.orientation === 'landscape';
  const paperW = isL ? state.paperSize.width : state.paperSize.height;
  const paperH = isL ? state.paperSize.height : state.paperSize.width;
  
  const totalW = paperW + (state.showCropMarks ? 30 : 0);
  const totalH = paperH + (state.showCropMarks ? 30 : 0);
  
  const scaleX = viewportW / (totalW * 3.78);
  const scaleY = viewportH / (totalH * 3.78);
  
  setZoom(Math.min(scaleX, scaleY, 0.8));
}

// 張り紙の再描画
function updatePoster() {
  renderPoster(DOM.canvas, state, 1.0);
}

// 起動実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
