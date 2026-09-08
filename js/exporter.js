/**
 * 張り紙メーカー v0.9.1 - 高解像度出力＆描画ユーティリティ
 */

function renderPosterToCanvas(canvas, config, scale = 2) {
  const ctx = canvas.getContext('2d');
  
  // 用紙サイズ (mm)
  const isLandscape = config.orientation === 'landscape';
  const paperWidthMm = isLandscape ? config.paperSize.width : config.paperSize.height;
  const paperHeightMm = isLandscape ? config.paperSize.height : config.paperSize.width;
  
  // 300 DPI相当の解像度換算 (1mm = 11.811px)
  const dpiScale = 11.811 * (scale || 1);
  const bleedMm = config.showCropMarks ? 3 : 0;
  const marginMm = config.showCropMarks ? 12 : 0; // トンボ描画エリア用マージン
  
  const trimWidthPx = paperWidthMm * dpiScale;
  const trimHeightPx = paperHeightMm * dpiScale;
  const bleedPx = bleedMm * dpiScale;
  const marginPx = marginMm * dpiScale;
  
  // キャンバス総サイズ
  const canvasWidth = trimWidthPx + (bleedPx + marginPx) * 2;
  const canvasHeight = trimHeightPx + (bleedPx + marginPx) * 2;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // 背景をクリア（トンボ枠外は白）
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 塗りたし（Bleed）領域を含む張り紙本体の位置
  const posterX = marginPx;
  const posterY = marginPx;
  const posterW = trimWidthPx + bleedPx * 2;
  const posterH = trimHeightPx + bleedPx * 2;
  
  // 1. 張り紙背景の描画（オリジナル背景画像がある場合はそれを描画）
  if (config.bgImage) {
    ctx.drawImage(config.bgImage, posterX, posterY, posterW, posterH);
  } else {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(posterX, posterY, posterW, posterH);
  }
  
  // 仕上げ領域の内側位置 (trim box)
  const trimX = marginPx + bleedPx;
  const trimY = marginPx + bleedPx;
  
  // 2. 張り紙コンテンツの描画
  ctx.save();
  // trimX, trimY を基準原点とする
  ctx.translate(trimX, trimY);
  
  // コンテンツ描画パラメータ
  const textX = trimWidthPx / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = config.textColor;
  
  // ロゴ描画（上部配置の場合）
  let topOffset = 0;
  if (config.logoUrl && config.logoPosition === 'top') {
    topOffset = renderLogo(ctx, config, trimWidthPx, trimHeightPx, 'top');
  }
  
  // =========================================================================
  // 1. テキスト行と動的領域・中央区切り線の高さ計算
  // =========================================================================
  const titleText = config.title || '';
  const titleLines = titleText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const subtitleText = config.subtitle || '';
  const subtitleLines = subtitleText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const minY = topOffset + (trimHeightPx * 0.03);
  let maxY = trimHeightPx * 0.97;
  if (config.logoUrl && config.logoPosition === 'bottom') {
    maxY = trimHeightPx * 0.82;
  }
  const availableH = maxY - minY;
  
  let titleRatio = 0.38;
  if (titleLines.length > 0 && subtitleLines.length > 0) {
    const titleWeight = titleLines.length * 1.3 * ((config.titleFontSize || 100) / 100);
    const subWeight = subtitleLines.length * 1.0 * ((config.subtitleFontSize || 70) / 70);
    const rawRatio = titleWeight / (titleWeight + subWeight);
    titleRatio = Math.max(0.20, Math.min(0.80, rawRatio * 0.65 + 0.18));
  } else if (titleLines.length > 0 && subtitleLines.length === 0) {
    titleRatio = 0.85;
  } else if (titleLines.length === 0 && subtitleLines.length > 0) {
    titleRatio = 0.15;
  }
  
  const dividerY = minY + availableH * titleRatio;
  
  // =========================================================================
  // 2. メイン文言（日本語）描画
  // =========================================================================
  if (titleLines.length > 0) {
    const maxTitleW = trimWidthPx * 0.90;
    const maxTitleTotalH = (dividerY - minY) * 0.82;
    
    let baseTitleFontSize = titleLines.length === 1 
      ? Math.min((dividerY - minY) * 0.65, trimHeightPx * 0.22)
      : (maxTitleTotalH / (titleLines.length * 1.15));
      
    ctx.font = `900 ${baseTitleFontSize}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "メイリオ", sans-serif`;
    let maxLineW = 0;
    titleLines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxLineW) maxLineW = w;
    });
    
    if (maxLineW > maxTitleW && maxLineW > 0) {
      baseTitleFontSize = baseTitleFontSize * (maxTitleW / maxLineW);
    }
    
    const finalTitleFontSize = baseTitleFontSize * ((config.titleFontSize || 100) / 100);
    ctx.font = `900 ${finalTitleFontSize}px "Noto Sans JP", "Hiragino Kaku Gothic ProN", "メイリオ", sans-serif`;
    ctx.textBaseline = 'middle';
    
    const titleLineHeight = finalTitleFontSize * 1.15;
    const titleCenterY = minY + (dividerY - minY) / 2;
    const startTitleY = titleCenterY - ((titleLines.length - 1) * titleLineHeight) / 2;
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, textX, startTitleY + index * titleLineHeight);
    });
  }
  
  // =========================================================================
  // 3. 区切り線（中央の白線）描画
  // =========================================================================
  if (config.showDivider) {
    const dividerMargin = trimWidthPx * 0.05;
    ctx.strokeStyle = config.textColor;
    ctx.lineWidth = Math.max(3, trimHeightPx * 0.007);
    ctx.beginPath();
    ctx.moveTo(dividerMargin, dividerY);
    ctx.lineTo(trimWidthPx - dividerMargin, dividerY);
    ctx.stroke();
  }
  
  // =========================================================================
  // 4. サブタイトル（英語）描画
  // =========================================================================
  if (subtitleLines.length > 0) {
    const maxSubW = trimWidthPx * 0.88;
    const maxSubTotalH = (maxY - dividerY) * 0.82;
    
    let baseSubFontSize = subtitleLines.length === 1 
      ? Math.min((maxY - dividerY) * 0.60, trimHeightPx * 0.24)
      : (maxSubTotalH / (subtitleLines.length * 1.15));
    
    ctx.font = `900 ${baseSubFontSize}px "Inter", "Arial Black", "Montserrat", sans-serif`;
    let maxLineW = 0;
    subtitleLines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxLineW) maxLineW = w;
    });
    
    if (maxLineW > maxSubW && maxLineW > 0) {
      baseSubFontSize = baseSubFontSize * (maxSubW / maxLineW);
    }
    
    const finalSubFontSize = baseSubFontSize * ((config.subtitleFontSize || 70) / 70);
    ctx.font = `900 ${finalSubFontSize}px "Inter", "Arial Black", "Montserrat", sans-serif`;
    ctx.textBaseline = 'middle';
    
    const lineHeight = finalSubFontSize * 1.12;
    const subCenterY = dividerY + (maxY - dividerY) / 2;
    const startSubY = subCenterY - ((subtitleLines.length - 1) * lineHeight) / 2;
    
    subtitleLines.forEach((line, index) => {
      ctx.fillText(line, textX, startSubY + index * lineHeight);
    });
  }
  
  // ロゴ描画（下部配置）
  if (config.logoUrl && config.logoPosition === 'bottom') {
    renderLogo(ctx, config, trimWidthPx, trimHeightPx, 'bottom');
  }
  
  ctx.restore();
  
  // 3. トンボ（トリムマーク）の描画
  if (config.showCropMarks) {
    drawCropMarks(ctx, marginPx, bleedPx, trimWidthPx, trimHeightPx);
  }
  
  return canvas;
}

// ロゴ描画ヘルパー（文字との重なり・窮屈感を防止）
function renderLogo(ctx, config, trimW, trimH, position) {
  if (!config.logoImage) return 0;
  
  const scale = (config.logoScale || 100) / 100;
  const maxW = trimW * 0.22 * scale;
  const maxH = trimH * 0.14 * scale;
  
  let imgW = config.logoImage.width;
  let imgH = config.logoImage.height;
  const ratio = Math.min(maxW / imgW, maxH / imgH);
  
  imgW = imgW * ratio;
  imgH = imgH * ratio;
  
  let posX = (trimW - imgW) / 2;
  let posY = trimH * 0.04; // 上部配置
  
  if (position === 'bottom') {
    posY = trimH * 0.84;
    ctx.drawImage(config.logoImage, posX, posY, imgW, imgH);
    return 0;
  }
  
  // 上部ロゴの場合は文字を押し下げて被りを防ぐ（十分な余白を確保）
  ctx.drawImage(config.logoImage, posX, posY, imgW, imgH);
  return imgH * 0.85;
}

// トンボ（トリムマーク）描画
function drawCropMarks(ctx, marginPx, bleedPx, trimW, trimH) {
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2; // トンボ線の太さ
  
  const markLen = marginPx * 0.7; // トンボ線の長さ
  
  // トンボ基準位置
  const leftTrim = marginPx + bleedPx;
  const rightTrim = marginPx + bleedPx + trimW;
  const topTrim = marginPx + bleedPx;
  const bottomTrim = marginPx + bleedPx + trimH;
  
  const leftBleed = marginPx;
  const rightBleed = marginPx + bleedPx * 2 + trimW;
  const topBleed = marginPx;
  const bottomBleed = marginPx + bleedPx * 2 + trimH;
  
  // --- Corner Crop Marks (4箇所の二重トンボ) ---
  // 左上
  drawLine(ctx, leftTrim, topTrim - markLen, leftTrim, topTrim);
  drawLine(ctx, leftBleed, topBleed - markLen, leftBleed, topBleed);
  drawLine(ctx, leftTrim - markLen, topTrim, leftTrim, topTrim);
  drawLine(ctx, leftBleed - markLen, topBleed, leftBleed, topBleed);
  
  // 右上
  drawLine(ctx, rightTrim, topTrim - markLen, rightTrim, topTrim);
  drawLine(ctx, rightBleed, topBleed - markLen, rightBleed, topBleed);
  drawLine(ctx, rightTrim, topTrim, rightTrim + markLen, topTrim);
  drawLine(ctx, rightBleed, topBleed, rightBleed + markLen, topBleed);
  
  // 左下
  drawLine(ctx, leftTrim, bottomTrim, leftTrim, bottomTrim + markLen);
  drawLine(ctx, leftBleed, bottomBleed, leftBleed, bottomBleed + markLen);
  drawLine(ctx, leftTrim - markLen, bottomTrim, leftTrim, bottomTrim);
  drawLine(ctx, leftBleed - markLen, bottomBleed, leftBleed, bottomBleed);
  
  // 右下
  drawLine(ctx, rightTrim, bottomTrim, rightTrim, bottomTrim + markLen);
  drawLine(ctx, rightBleed, bottomBleed, rightBleed, bottomBleed + markLen);
  drawLine(ctx, rightTrim, bottomTrim, rightTrim + markLen, bottomTrim);
  drawLine(ctx, rightBleed, bottomBleed, rightBleed + markLen, bottomBleed);
  
  // --- Center Crop Marks (センタートンボ) ---
  const centerX = marginPx + bleedPx + trimW / 2;
  const centerY = marginPx + bleedPx + trimH / 2;
  
  drawLine(ctx, centerX, topTrim - markLen, centerX, topTrim);
  drawLine(ctx, centerX, bottomTrim, centerX, bottomTrim + markLen);
  drawLine(ctx, leftTrim - markLen, centerY, leftTrim, centerY);
  drawLine(ctx, rightTrim, centerY, rightTrim + markLen, centerY);
  
  ctx.restore();
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/**
 * 高画質PNG画像のダウンロード
 */
function downloadPNG(config, filename = '張り紙.png') {
  const tempCanvas = document.createElement('canvas');
  renderPosterToCanvas(tempCanvas, config, 1.5);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = tempCanvas.toDataURL('image/png');
  link.click();
}

/**
 * PDFファイルの直接ダウンロード保存（印刷ダイアログを開かずに100%直接.pdfファイルを生成・保存）
 */
function downloadPDF(config, filename = '張り紙.pdf') {
  const tempCanvas = document.createElement('canvas');
  renderPosterToCanvas(tempCanvas, config, 1.5);
  
  const isLandscape = config.orientation === 'landscape';
  const paperWMm = isLandscape ? config.paperSize.width : config.paperSize.height;
  const paperHMm = isLandscape ? config.paperSize.height : config.paperSize.width;
  const paperFormat = (config.paperSize.id || 'A4').toLowerCase();
  
  // 1. jsPDFが利用可能な場合
  if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: paperFormat
    });
    
    const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save(filename);
    return;
  }
  
  // 2. オフライン純粋JS PDF生成フォールバック (外部ライブラリ不要で直接.pdfファイルを生成)
  try {
    const imgDataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
    const pdfBlob = createDirectPDFBlob(imgDataUrl, paperWMm, paperHMm, tempCanvas.width, tempCanvas.height);
    
    const link = document.createElement('a');
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    link.href = URL.createObjectURL(pdfBlob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  } catch (err) {
    console.error('PDF generation error:', err);
    // 最終フォールバック
    const link = document.createElement('a');
    link.download = filename.replace('.pdf', '.png');
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }
}

/**
 * 外部ライブラリ一切不要の純粋JS PDFバイナリエンコーダー
 */
function createDirectPDFBlob(jpegDataUrl, widthMm, heightMm, canvasPxW, canvasPxH) {
  const base64Data = jpegDataUrl.split(',')[1];
  const binaryImg = atob(base64Data);
  const imgLen = binaryImg.length;
  const imgBytes = new Uint8Array(imgLen);
  for (let i = 0; i < imgLen; i++) {
    imgBytes[i] = binaryImg.charCodeAt(i);
  }

  const ptW = (widthMm * 2.83465).toFixed(2);
  const ptH = (heightMm * 2.83465).toFixed(2);

  const pdfHeader = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Resources << /XObject << /I1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvasPxW} /Height ${canvasPxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`;
  const obj4Footer = `\nendstream\nendobj\n`;
  const contentStream = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/I1 Do\nQ\n`;
  const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

  const encoder = new TextEncoder();
  const chunks = [
    encoder.encode(pdfHeader),
    encoder.encode(obj1),
    encoder.encode(obj2),
    encoder.encode(obj3),
    encoder.encode(obj4Header),
    imgBytes,
    encoder.encode(obj4Footer),
    encoder.encode(obj5)
  ];

  let offset = pdfHeader.length;
  const offsets = [0, offset];
  offset += obj1.length; offsets.push(offset);
  offset += obj2.length; offsets.push(offset);
  offset += obj3.length; offsets.push(offset);
  const obj4TotalLen = obj4Header.length + imgLen + obj4Footer.length;
  offset += obj4TotalLen; offsets.push(offset);

  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }
  
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offset + obj5.length}\n%%EOF`;
  chunks.push(encoder.encode(xref));
  chunks.push(encoder.encode(trailer));

  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * クリーンな張り紙専用印刷プレビュー（ヘッダー・URL・日付を除外して張り紙本体のみ印刷）
 */
function printPoster(config) {
  const tempCanvas = document.createElement('canvas');
  renderPosterToCanvas(tempCanvas, config, 1.5);
  const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
  
  const win = window.open('', '_blank');
  if (!win) {
    alert('ポップアップがブロックされました。ブラウザのポップアップ許可設定をご確認ください。');
    return;
  }
  
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.title} - 張り紙印刷</title>
        <style>
          @page {
            size: auto;
            margin: 0mm;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #FFFFFF;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.focus(); setTimeout(function(){ window.print(); }, 200);" />
      </body>
    </html>
  `);
  win.document.close();
}

if (typeof window !== 'undefined') {
  window.renderPosterToCanvas = renderPosterToCanvas;
  window.downloadPNG = downloadPNG;
  window.downloadPDF = downloadPDF;
  window.printPoster = printPoster;
}
