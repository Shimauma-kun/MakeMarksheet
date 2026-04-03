# マークシート生成ツール 仕様書

**対象機器:** セコニック SR-3500  
**出力:** アートボード上に外枠中央配置のプレビュー（Canvas描画）およびPDF出力  
**対応向き:** 縦型 / 横型  
**対応ピッチ:** 0.25 / 1/6 / 0.2 / 0.2s / 0.3 / 0.3F

---

## 1. 用語定義

| 用語 | 略称 | 説明 |
|---|---|---|
| タイミングマーク | TM | スキャナーがMBの位置を検出するための黒塗り矩形。外枠の辺に沿って等間隔に並ぶ。 |
| マークボックス | MB | 受験者が鉛筆でマークする楕円形の枠。 |
| TM間隔 | tmInterval | TMが並ぶ方向（along方向）のTM中心間距離（mm）。 |
| MB間隔 | pitch | MBが並ぶ方向（perp方向）のMB中心間距離（mm）。ピッチマスターで定義。 |
| along方向 | along | TMが並ぶ方向。縦型＝下↓（y増加）、横型＝右→（x増加）。 |
| perp方向 | perp | along方向と直交する方向。縦型＝左右（x方向）、横型＝上下（y方向）。 |
| 外枠 | outer | 印刷領域枠（マージンなし）。サイズはユーザーが設定。座標計算の基準。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺に最も近いMBが第1MB。 |
| MBインターバル | skipMB | TM側から使用しないMBの個数。物理第1〜第skipMB番を除外。 |
| 表面 | front | シートの表側。受験番号欄あり。縦型TM=左側、横型TM=下側（人間視点）。 |
| 裏面 | back | シートの裏側。受験番号欄なし。表面の続き番号から解答欄を配置。縦型TM=右側、横型TM=下側（表面と同じ辺）。 |

**左右の基準:** 本仕様書における「左・右・上・下」はすべて人間がシートを正面から見たときの方向。Web座標系（x増加=右、y増加=下）とは別概念。

---

## 2. pitchとtmIntervalの違い

| | 縦型 | 横型 |
|---|---|---|
| tmInterval | along（下↓）方向の中心間距離 | along（右→）方向の中心間距離 |
| pitch | perp（左右）方向の中心間距離 | perp（上下）方向の中心間距離 |

---

## 3. 座標系

- 原点は外枠の左上隅（outer.x1=0, outer.y1=0）
- Web座標系：右方向がx増加、下方向がy増加
- 人間視点の「左」= x小、「右」= x大、「上」= y小、「下」= y大

---

## 4. 外枠・アートボードサイズ

### 4.1 外枠サイズ

ユーザーが設定する印刷領域のサイズ。縦型基準で `sheetW`（短辺）× `sheetH`（長辺）で管理。

| プリセット | sheetW(mm) | sheetH(mm) |
|---|---|---|
| A4 | 210 | 297 |
| JIS | 82.55 | 187.3 |
| 幅広 | 101.5 | 226 |
| カスタム | 任意 | 任意 |

向きによる実際の外枠サイズ:
```
縦型: outerW = sheetW、outerH = sheetH
横型: outerW = sheetH、outerH = sheetW  （長辺と短辺を入れ替え）
```

### 4.2 アートボードサイズ

| 条件 | アートボード |
|---|---|
| 外枠が縦横ともにA4未満（outerW < A4W かつ outerH < A4H） | A4サイズ |
| 外枠がA4以上（A4を含む、またはA4より大きい） | B4サイズ |

| 向き | A4（mm） | B4（mm） |
|---|---|---|
| 縦型 | 210 × 297 | 257 × 364 |
| 横型 | 297 × 210 | 364 × 257 |

外枠はアートボードの中央に配置。オフセット = (アートボード − 外枠) ÷ 2。

---

## 5. ピッチマスター

スキャナー仕様に基づく固定パラメータ。ユーザーは変更不可。

| ピッチ名 | pitch(mm) | firstX(mm) | maxMB | tmS(mm) | tmL(mm) | tmPos(mm) |
|---|---|---|---|---|---|---|
| 0.25 | 6.35 | 6.35 | 33 | 0.89 | 5.9 | -2.0 |
| 1/6 | 4.233 | 11.43 | 48 | 1.27 | 3.81 | 5.085 |
| 0.2 | 5.08 | 11.75 | 40 | 0.89 | 5.9 | -2.0 |
| 0.2s | 5.08 | 12.7 | 40 | 0.89 | 3.81 | 5.095 |
| 0.3 | 7.62 | 14.50 | 27 | 0.89 | 7.0 | -2.0 |
| 0.3F | 7.62 | 17.78 | 24 | 0.5 | 5.08 | 7.62 |

**パラメータの意味:**

- **pitch**: perp方向のMB中心間距離
- **firstX**: TM配置辺から物理第1MB中心までの距離
- **tmS**: TMのalong方向寸法（短辺）
- **tmL**: TMのperp方向寸法（長辺）
- **tmPos**: TM配置辺からTM端までのオフセット。負値=外枠外にはみ出す
- **maxMB**: perp方向の総MB数（スキャナー仕様上限）

---

## 6. TM・MBのサイズと形状

### 6.1 TM（タイミングマーク）

黒塗り矩形（K100%）。

| | 縦型 | 横型 |
|---|---|---|
| along方向寸法 | tmS（短辺） | tmS（短辺） |
| perp方向寸法 | tmL（長辺） | tmL（長辺） |
| 形状 | 横長矩形 | 縦長矩形 |
| TM配置辺（表面） | 左辺 | 下辺 |
| TM配置辺（裏面） | 右辺 | 下辺（表面と同じ） |

### 6.2 MB（マークボックス）

塗りなし・マゼンタ100%線の楕円形。デフォルトサイズ 長辺4mm × 短辺2mm（ユーザー変更可）。

| | 縦型 | 横型 |
|---|---|---|
| along方向寸法 | MB_SHORT（短辺） | MB_SHORT（短辺） |
| perp方向寸法 | MB_LONG（長辺） | MB_LONG（長辺） |
| 形状 | 横長の楕円 | 縦長の楕円 |

---

## 7. TM配置方式

| 方式 | 縦型 TM上端y | 横型 TM左端x |
|---|---|---|
| 制御型 | MB中心y − tmS × 1.5 | MB中心x − tmS × 1.5 |
| 直下型 | MB中心y − tmS / 2 | MB中心x − tmS / 2 |

TM perp方向座標（方式共通）:

```
縦型表面: TM左端x = outer.x1 + tmPos          ※tmPos<0なら外枠外（左）
縦型裏面: TM左端x = outer.x2 − tmPos − tmL    ※右辺基準（tmPos<0なら外枠外・右）

横型（表面・裏面共通）: TM上端y = outer.y2 − tmPos − tmL  ※tmPos<0なら外枠外（下）
```

**TMの最小間隔:**
- 制御型: 4.23mm未満で警告
- 直下型: 2.21mm未満で警告

---

## 8. along方向の両端余白（MARGIN）

外枠端からTM/MBの端まで **9mm（MARGIN）** を確保する。縦型=上下、横型=左右。

```
enStart（along方向の開始MB中心）= MARGIN + tmS × 1.5 + MB_SHORT / 2
終端側MB中心の上限 = outer端 − MARGIN − tmS × 1.5 − MB_SHORT / 2
```

---

## 9. skipMB（MBインターバル）とmaxRowsL（MB最大）の役割

perp方向のMB使用範囲を両端から制限する。

```
TM側（使用不可）        使用範囲                TM反対側（使用不可）
|← skipMB個 →|← 第(skipMB+1)〜第(maxRowsL)番 →|← (maxMB−maxRowsL)個 →|
              使用可能MB数 = maxRowsL − skipMB
```

| 向き・面 | TM側 | 使用開始MB | 使用終了MB |
|---|---|---|---|
| 縦型表面 | 左 | 左から第(skipMB+1)番 | 右方向へ列展開 |
| 縦型裏面 | 右 | 左から第maxRowsL番 | 右から第(skipMB+1)番 |
| 横型（表・裏） | 下 | 上から第maxRowsL番（ansStartY） | 下から第(skipMB+1)番 |

### 9.1 skipMBの自動設定（applyAutoSkipMB）

ピッチ変更時に自動設定される。

| ピッチ | skipMB デフォルト値 |
|---|---|
| 0.25 | 1 |
| 1/6 / 0.2 / 0.2s / 0.3 / 0.3F | 0 |

ユーザーによる手動上書きも可能。

### 9.2 maxRowsLの自動計算（calcAutoMaxRowsL）

外枠サイズ・ピッチ・向きが変わるたびに自動計算される。

```
perpSize = sheetW  （縦型・横型ともに縦型基準の短辺を使用）
  ※縦型: perp方向 = x方向 = outerW = sheetW
  ※横型: perp方向 = y方向 = outerH = sheetW（横にすると短辺がy方向）

収まる最大MB数 = floor((perpSize − firstX) / pitch) + 1
maxRowsL = 収まる最大数 − 1  （TM反対側1個を除外）
           ※最小値は1
```

**自動計算のタイミング（skipMB・maxRowsL共通）:**
- 初期化時（Init）
- ピッチ変更時（skipMBはピッチ基準、maxRowsLは外枠・ピッチ・向き基準）
- 外枠プリセット変更時（maxRowsLのみ）
- カスタムサイズ入力時（maxRowsLのみ）
- 向き変更時（maxRowsLのみ）

ユーザーによる手動上書きも可能。

---

## 10. ギャップ（間隔）仕様

値Nのとき「MB N個分のインターバル」。N=0でインターバルなし（隣接）。

```
columnGap（解答欄インターバル）:
  縦型: pitch      × (columnGapMult + 1)
  横型: tmInterval × (columnGapMult + 1)

sectionGap（受験番号インターバル、受験番号欄〜解答欄間）:
  縦型・横型共通: tmInterval × (sectionGapMult + 1)
```

| columnGapMult | 隣列との中心間距離（縦型） |
|---|---|
| 0 | pitch × 1（隣接） |
| 1 | pitch × 2（MB1個分の空き）← デフォルト |
| 2 | pitch × 3（MB2個分の空き） |

---

## 11. 解答欄レイアウト

### 11.1 縦型表面

```
perpBase = outer.x1 + firstX + skipMB × pitch   （選択肢①のx）
perpMax  = outer.x1 + firstX + (maxRowsL − 1) × pitch  （使用可能な最大MB中心x）

選択肢ci: MB中心x = colBaseX + ci × pitch
          colBaseX = perpBase + colIndex × (colWidth + columnGap)
          colWidth = (choiceCount − 1) × pitch

問題番号qi: MB中心y = ansStartY + r × tmInterval
            ansStartY = enStart + 9 × tmInterval + sectionGap

列右端チェック: colBaseX + colWidth ≤ perpMax
  → 超える場合はその列ごと描画しない（裏面へ）
```

### 11.2 縦型裏面

受験番号欄なし。enStartから直接解答欄を開始。

```
選択肢①のx（左端・第maxRowsL番MB）:
  backChoice1x = outer.x2 − firstX − (maxRowsL − 1) × pitch

右端使用禁止境界（skipMB分）:
  backRightLimit = outer.x2 − firstX − skipMB × pitch

選択肢ci: MB中心x = colBaseX + ci × pitch   （ci=0が選択肢①、左→右）
          colBaseX = backChoice1x + colIndex × (colWidth + columnGap)

問題番号qi: MB中心y = enStart + r × tmInterval   （sectionGapなし）

列右端チェック: colBaseX + colWidth + MB_LONG/2 + PAD ≤ backRightLimit
  → 超える場合はその列ごと描画しない

問題番号ラベル: 選択肢①MBの左側（cx − MB_LONG/2 − QLABEL_OFFSET、right揃え）
問題番号: 表面の続き番号（frontQ + qi + 1）
MB内数字: 選択肢番号（ci + 1）
列の展開方向: 右（x増加）
```

### 11.3 横型表面

```
ansStartY = outer.y2 − firstX − (maxRowsL − 1) × pitch   （第maxRowsL番MB・固定）
maxRowsPerCol = maxRowsL − skipMB   （1列あたりの最大問題数）
maxXmm = outer.x2 − MARGIN − tmS × 1.5 − MB_SHORT / 2

ansStart = enStart + (examDigits − 1) × tmInterval + sectionGap

選択肢ci: MB中心x = colBaseX + ci × tmInterval
          colBaseX = ansStart + colIndex × (colWidth + columnGap)
          colWidth = (choiceCount − 1) × tmInterval

問題番号qi: MB中心y = ansStartY + r × pitch

列右端チェック: colBaseX + colWidth + MB_SHORT/2 ≤ maxXmm
  → 超える場合はその列ごと描画しない（裏面へ）
```

### 11.4 横型裏面

受験番号欄なし。enStartから直接解答欄を開始。

```
ansStart = enStart   （sectionGapなし）

それ以外の座標計算・列チェック・ansStartY・maxRowsPerColは横型表面と同じ。
問題番号: 表面の続き番号（frontQ + qi + 1）
```

---

## 12. 受験番号欄レイアウト

受験番号欄は**表面のみ**。

### 12.1 縦型

```
桁di: MB中心x = outer.x1 + firstX + (skipMB + di) × pitch   （di=0〜examDigits−1）
数字ri: MB中心y = enStart + ri × tmInterval   （ri=0〜9）
```

### 12.2 横型

```
桁di: MB中心x = enStart + di × tmInterval   （di=0〜examDigits−1）
数字ri: MB中心y = ansStartY + ri × pitch   （ri=0〜9）
```

---

## 13. 問題番号ラベル（drawQLabel）

| 条件 | ラベルx位置 | 揃え |
|---|---|---|
| 縦型裏面 | cx − MB_LONG/2 − QLABEL_OFFSET | right |
| 縦型表面 | cx − MB_LONG/2 − QLABEL_OFFSET | right |
| 横型（表面・裏面） | cx − MB_SHORT/2 − QLABEL_OFFSET | right |

横型はMBが縦長楕円のため、along方向（x）の幅はMB_SHORT。

```
QLABEL_OFFSET = pitch / 2 （mm）
フォントサイズ = 3mm（固定）
フォント = Noto Sans JP
```

---

## 14. 表面の描画問題数計算（裏面用）

### 14.1 縦型（calcFrontQPortrait）

```
enEndY    = enStart + 9 × tmInterval
ansStartY = enEndY + sectionGap
maxYmm    = outer.y2 − MARGIN − tmS × 1.5 − MB_SHORT / 2
qPerCol   = floor((maxYmm − ansStartY) / tmInterval) + 1

baseX   = outer.x1 + firstX + skipMB × pitch
perpMax = outer.x1 + firstX + (maxRowsL − 1) × pitch
cols    = baseX + cols×(colWidth+columnGap) + colWidth ≤ perpMax を満たす列数
          ※ cols=0 の場合は cols=1 として扱う

frontQ = min(qPerCol × cols, questionCount)
```

### 14.2 横型（calcFrontQLandscape）

```
qPerCol  = maxRowsL − skipMB
enEndX   = enStart + (examDigits−1) × tmInterval
ansStart = enEndX + sectionGap
maxXmm   = outer.x2 − MARGIN − tmS × 1.5 − MB_SHORT / 2
cols     = ansStart + cols×(colWidth+columnGap) + colWidth + MB_SHORT/2 ≤ maxXmm を満たす列数

frontQ = min(qPerCol × max(cols, 1), questionCount)
```

---

## 15. TM重複排除

`tmAlongPositions`（Set）にalong座標を収集し、一括描画することで同座標のTMを自動排除する。

---

## 16. 描画仕様

### 16.1 色

| オブジェクト | Canvas | PDF（CMYK） |
|---|---|---|
| TM | #000000 | CMYK(0, 0, 0, 100) |
| MB（線）・MB内数字・問題番号ラベル・枠線・外枠 | #ff00ff | CMYK(0, 100, 0, 0) |

### 16.2 線幅・フォント

| オブジェクト | 値 |
|---|---|
| 外枠 | 0.4pt（= 0.4/2.835 mm） |
| MB（楕円） | 0.6pt・塗りなし |
| MB内数字 | 7pt（= 7/2.835 mm）・MSゴシック・center揃え・y座標はMB中心（baseline: 'middle'） |
| 問題番号ラベル | 3mm固定・Noto Sans JP |
| 枠線（受験番号欄・解答欄） | 0.4pt・パディング PAD=2mm |

### 16.3 MB内数字

| 対象 | 表示内容 |
|---|---|
| 解答欄（全面） | 選択肢番号（1, 2, 3 … choiceCount） |
| 受験番号欄 | 数字（0〜9） |

---

## 17. 裏面レイアウト

### 17.1 有無・表示切替

- `hasBack`（初期値: false）で裏面の有無を制御
- `hasBack=true` のとき `side`（'front' / 'back'）で表示面を切替
- 表示面切替UIは `hasBack=true` のときのみ表示

### 17.2 描画の基本ルール

- 受験番号欄なし、解答欄は enStart から直接開始
- 問題番号は表面の続き番号（frontQ + 1 から）
- 全問が表面に収まる場合（remainQ ≤ 0）は外枠のみ描画

### 17.3 はみ出し時の挙動

- ある列が外枠（またはskipMB境界）に収まらない場合、**その列ごと描画しない**
- 表面＋裏面で全問が収まらない場合、警告「マークがはみ出ています」を表示

---

## 18. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| 制御型かつ tmInterval < 4.23mm | TM間隔が最小値(4.23mm)未満です |
| 直下型かつ tmInterval < 2.21mm | TM間隔が最小値(2.21mm)未満です |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄の数字9行が外枠外にはみ出します |
| 表面＋裏面の総収容数 < 問題数 | マークがはみ出ています |

**警告とプレビューの整合性:**  
縦型表面の収容数計算は描画側と同じ `perpMax`（maxRowsL基準）で統一。

```
横型受験番号欄チェック（固定値29を使用）:
  examTopY = outer.y2 − firstX − 29 × pitch
  y9 = examTopY + 9 × pitch
  警告条件: y9 > outer.y2
```

---

## 19. PDF出力仕様

- ライブラリ: jsPDF（クライアントサイド）
- 用紙サイズ: アートボードサイズ（セクション4.2参照）
- 単位: mm
- カラー: CMYK（マゼンタ=CMYK(0,100,0,0)、黒=CMYK(0,0,0,100)）
- ファイル名: `marksheet_{orientation}_{pitchName}.pdf`
- 表面は常に出力（1ページ目）。hasBack=trueのとき裏面を2ページ目として追加。
- 描画ロジック: Canvas・PDF共通の `drawLayout(api)` 関数で統一
- MB内数字のy座標: `baseline: 'middle'` 指定によりMB中心に配置（Canvasと同一）

---

## 20. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | UI区分 | 説明 |
|---|---|---|---|
| orientation | portrait | 基本設定 | 縦型 / 横型 |
| sheetPreset | a4 | 基本設定 | 外枠サイズプリセット（A4 / JIS / 幅広 / カスタム） |
| sheetW | 210mm | 基本設定 | 外枠幅（縦型基準・短辺）。カスタム時のみ直接編集可 |
| sheetH | 297mm | 基本設定 | 外枠高さ（縦型基準・長辺）。カスタム時のみ直接編集可 |
| tmType | control | 基本設定 | TM配置方式（制御型 / 直下型） |
| hasBack | false | 基本設定 | 裏面あり / なし |
| side | front | 基本設定 | 表示面（表面 / 裏面）。hasBack=trueのときのみ表示 |
| pitchName | 0.25 | 基本設定（ピッチとTM間隔を横並び） | ピッチ種別。変更時にskipMB・maxRowsLを自動設定してrender() |
| tmInterval | 4.23mm | 基本設定（ピッチとTM間隔を横並び） | TM間隔 |
| examDigits | 5 | 受験番号欄 | 桁数 |
| questionCount | 50 | 解答欄 | 問題数 |
| choiceCount | 5 | 解答欄 | 選択肢数 |
| mbLong | 4mm | 解答欄 | MB長辺 |
| mbShort | 2mm | 解答欄 | MB短辺 |
| skipMB | 1（0.25ピッチ）/ 0（その他） | 詳細設定「MBインターバル」 | TM側から使用しないMB数。ピッチ変更時に自動設定。手動上書き可。 |
| maxRowsL | 自動計算 | 詳細設定「MB最大」 | 使用するMBの上限番号。外枠・ピッチ・向き変更時に自動計算。手動上書き可。 |
| columnGapMult | 1 | 詳細設定「解答欄インターバル」 | 列ギャップのMB個数（0=隣接） |
| sectionGapMult | 1 | 詳細設定「受験番号インターバル」 | セクションギャップのMB個数（0=隣接） |

**固定値（変更不可）:**

| パラメータ | 値 | 説明 |
|---|---|---|
| MARGIN | 9mm | 外枠端からTM/MB端までの距離 |
| enStart | `MARGIN + tmS×1.5 + MB_SHORT/2` | along方向の開始MB中心 |
| PAD | 2mm | MBの端から枠線まで |
| QLABEL_OFFSET | `pitch / 2` mm | 問題番号ラベルのMBからのx方向オフセット |
| FS_QLABEL | 3mm | 問題番号ラベルのフォントサイズ（固定） |

---

## 21. UI仕様

- **テーマ切替**: ヘッダー右端に 🌙 ボタン。クリックでダーク/ライトモードをトグル（🌙↔️☀️）。`body.light-mode` クラスで切替。
- **プレビュー更新ボタン**: 非表示（`display:none`）。パラメータ変更時にリアルタイム自動再描画。
- **PDF出力ボタン**: 常時表示。警告ボックスの下に配置。
- **警告ボックス**: 警告あり時のみ表示。PDF出力ボタンの上。
- **基本設定**: 向き・外枠サイズ（プリセット＋カスタム入力）・TM配置方式・裏面・表示面・ピッチ・TM間隔を含む。ピッチとTM間隔は横2列並び（`row2`）。
- **詳細設定**: アコーディオンで折り畳み。MBインターバル（skipMB）・MB最大（maxRowsL）・解答欄インターバル・受験番号インターバルを含む。
- **ピッチの仕様参照**: アコーディオンで折り畳み。ピッチ・pitch・firstX・maxMBを一覧表示。

**ダーク/ライトモードのCSS変数:**

| 変数 | ダーク | ライト |
|---|---|---|
| --bg | #0e0f11 | #f0f2f5 |
| --surface | #161820 | #ffffff |
| --panel | #1c1e24 | #f5f6f8 |
| --border | #2a2d38 | #d0d4de |
| --accent | #e84393 | #d42f82 |
| --accent2 | #00d4a0 | #009970 |
| --text | #e8eaf0 | #1a1c24 |
| --canvas-bg | #0a0b0d | #d8dae0 |

---

## 22. 未実装・今後の課題

- [ ] 横型警告チェックの固定値 `29` を動的な `maxRowsL − 1` に変更する検討
- [ ] うら面のレイアウト検証
- [ ] GitHub push
