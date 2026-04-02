# マークシート生成ツール 仕様書

**対象機器:** セコニック SR-3500  
**出力:** B4アートボード上にA4中央配置のプレビュー（Canvas描画）およびPDF出力  
**対応向き:** 縦型A4 / 横型A4  
**対応ピッチ:** 0.25 / 1/6 / 0.2 / 0.2s / 0.3 / 0.3F

---

## 1. 用語定義

| 用語 | 略称 | 説明 |
|---|---|---|
| タイミングマーク | TM | スキャナーがMBの位置を検出するための黒塗り矩形。外枠の辺に沿って等間隔に並ぶ。 |
| マークボックス | MB | 受験者が鉛筆でマークする楕円形の枠。 |
| TM間隔 | tmInterval | TMが並ぶ方向（along方向）のTM中心間距離（mm）。最小値4.23mm。 |
| MB間隔 | pitch | MBが並ぶ方向（perp方向）のMB中心間距離（mm）。ピッチマスターで定義。 |
| along方向 | along | TMが並ぶ方向。縦型＝下↓（y増加）、横型＝右→（x増加）。 |
| perp方向 | perp | along方向と直交する方向。縦型＝左右（x方向）、横型＝上下（y方向）。 |
| 外枠 | outer | A4サイズの印刷領域枠（マージンなし）。座標計算の基準。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺に最も近いMBが第1MB。 |
| 開始オフセット | skipMB | TM側から使用しないMBの個数。物理第1〜第skipMB番を除外。 |
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

- 原点はA4外枠の左上隅（outer.x1=0, outer.y1=0）
- Web座標系：右方向がx増加、下方向がy増加
- 人間視点の「左」= x小、「右」= x大、「上」= y小、「下」= y大

---

## 4. 用紙・アートボードサイズ

| 種別 | 幅(mm) | 高さ(mm) |
|---|---|---|
| 縦型A4（外枠） | 210 | 297 |
| 横型A4（外枠） | 297 | 210 |
| 縦型B4（アートボード） | 257 | 364 |
| 横型B4（アートボード） | 364 | 257 |

A4外枠はB4アートボードの中央に配置。オフセット = (B4 − A4) ÷ 2。

---

## 5. ピッチマスター

スキャナー仕様に基づく固定パラメータ。ユーザーは変更不可。

| ピッチ名 | pitch(mm) | firstX(mm) | maxMB | tmS(mm) | tmL(mm) | tmPos(mm) | maxRowsL |
|---|---|---|---|---|---|---|---|
| 0.25 | 6.35 | 6.35 | 33 | 0.89 | 5.9 | -2.0 | 30 |
| 1/6 | 4.233 | 11.43 | 48 | 1.27 | 3.81 | 5.085 | 43 |
| 0.2 | 5.08 | 11.75 | 40 | 0.89 | 5.9 | -2.0 | 36 |
| 0.2s | 5.08 | 12.7 | 40 | 0.89 | 3.81 | 5.095 | 36 |
| 0.3 | 7.62 | 14.50 | 27 | 0.89 | 7.0 | -2.0 | 24 |
| 0.3F | 7.62 | 17.78 | 24 | 0.5 | 5.08 | 7.62 | 24 |

**パラメータの意味:**

- **pitch**: perp方向のMB中心間距離
- **firstX**: TM配置辺から物理第1MB中心までの距離
- **tmS**: TMのalong方向寸法（短辺）
- **tmL**: TMのperp方向寸法（長辺）
- **tmPos**: TM配置辺からTM端までのオフセット。負値=外枠外にはみ出す
- **maxMB**: perp方向の総MB数（スキャナー仕様上限）
- **maxRowsL**: 使用するMBの上限番号（TM反対側の除外基準）。ピッチ別デフォルト値。ユーザー変更可。ピッチ変更時にデフォルト値へリセット。

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

---

## 8. along方向の両端余白（MARGIN）

外枠端からTM/MBの端まで **9mm（MARGIN）** を確保する。縦型=上下、横型=左右。

```
enStart（along方向の開始MB中心）= MARGIN + tmS × 1.5 + MB_SHORT / 2
終端側MB中心の上限 = outer端 − MARGIN − tmS × 1.5 − MB_SHORT / 2
```

---

## 9. skipMBとmaxRowsLの役割

perp方向のMB使用範囲を両端から制限する。

```
TM側（使用不可）        使用範囲                TM反対側（使用不可）
|← skipMB個 →|← 第(skipMB+1)〜第(maxRowsL)番 →|← (maxMB−maxRowsL)個 →|
              使用可能MB数 = maxRowsL − skipMB
```

| 向き・面 | TM側 | 使用開始MB | 使用終了MB |
|---|---|---|---|
| 縦型表面 | 左 | 左から第(skipMB+1)番 | 右方向へ自由展開 |
| 縦型裏面 | 右 | 左から第maxRowsL番 | 右から第(skipMB+1)番 |
| 横型（表・裏） | 下 | 上から第maxRowsL番（ansStartY） | 下から第(skipMB+1)番 |

---

## 10. ギャップ（間隔）仕様

値Nのとき「MB N個分のインターバル」。N=0でインターバルなし（隣接）。

```
columnGap（列ギャップ）:
  縦型: pitch      × (columnGapMult + 1)
  横型: tmInterval × (columnGapMult + 1)

sectionGap（セクションギャップ、受験番号欄〜解答欄間）:
  縦型・横型共通: tmInterval × (sectionGapMult + 1)
```

| columnGapMult | 隣列との中心間距離（縦型） |
|---|---|
| 0 | pitch × 1（隣接） |
| 1 | pitch × 2（MB1個分の空き） |
| 2 | pitch × 3（MB2個分の空き） |

---

## 11. 解答欄レイアウト

### 11.1 縦型表面

```
perpBase = outer.x1 + firstX + skipMB × pitch   （選択肢①のx）

選択肢ci: MB中心x = colBaseX + ci × pitch
          colBaseX = perpBase + colIndex × (colWidth + columnGap)
          colWidth = (choiceCount − 1) × pitch

問題番号qi: MB中心y = ansStartY + r × tmInterval
            ansStartY = enStart + 9 × tmInterval + sectionGap

列右端チェック: colBaseX + colWidth + MB_LONG/2 ≤ outer.x2 − MARGIN − MB_LONG/2
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

問題番号ラベル: 選択肢①MBの右側（cx + MB_LONG/2 + QLABEL_OFFSET、left揃え）
問題番号: 表面の続き番号（frontQ + qi + 1）
MB内数字: 選択肢番号（ci + 1）
列の展開方向: 右（x増加）
```

### 11.3 横型表面

```
ansStartY = outer.y2 − firstX − (maxRowsL − 1) × pitch   （第maxRowsL番MB・固定）
maxRowsPerCol = maxRowsL − skipMB   （1列あたりの最大問題数）

ansStart = enStart + (examDigits − 1) × tmInterval + sectionGap

選択肢ci: MB中心x = colBaseX + ci × tmInterval
          colBaseX = ansStart + colIndex × (colWidth + columnGap)
          colWidth = (choiceCount − 1) × tmInterval

問題番号qi: MB中心y = ansStartY + r × pitch

列右端チェック: colBaseX + colWidth + MB_SHORT/2 ≤ outer.x2 − MARGIN − tmS × 1.5 − MB_SHORT/2
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
| 縦型裏面 | cx + MB_LONG/2 + QLABEL_OFFSET | left |
| 縦型表面 | cx − MB_LONG/2 − QLABEL_OFFSET | right |
| 横型（表面・裏面） | cx − MB_SHORT/2 − QLABEL_OFFSET | right |

横型はMBが縦長楕円のため、along方向（x）の幅はMB_SHORT。そのためx方向のオフセットにはMB_SHORT/2を使用する。

```
QLABEL_OFFSET = pitch / 2 （mm）
フォントサイズ = MB_SHORT × 1.5 mm
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

baseX  = outer.x1 + firstX + skipMB × pitch
maxXmm = outer.x2 − MARGIN − MB_LONG / 2
cols   = baseX + cols×(colWidth+columnGap) + colWidth + MB_LONG/2 ≤ maxXmm を満たす列数
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
| MB（線）・MB内数字・問題番号ラベル・枠線・A4外枠 | #ff00ff | CMYK(0, 100, 0, 0) |

### 16.2 線幅・フォント

| オブジェクト | 値 |
|---|---|
| A4外枠 | 0.4pt（= 0.4/2.835 mm） |
| MB（楕円） | 0.6pt・塗りなし |
| MB内数字 | 7pt（= 7/2.835 mm）・MSゴシック・center揃え・y座標はMB中心（baseline: 'middle'） |
| 問題番号ラベル | MB_SHORT × 1.5 mm・Noto Sans JP |
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
- 全問が表面に収まる場合（remainQ ≤ 0）はA4外枠のみ描画

### 17.3 はみ出し時の挙動

- ある列が外枠（またはskipMB境界）に収まらない場合、**その列ごと描画しない**
- 表面＋裏面で全問が収まらない場合、警告「マークがはみ出ています」を表示

---

## 18. PDF出力仕様

- ライブラリ: jsPDF（クライアントサイド）
- 用紙サイズ: B4（アートボードサイズ）
- 単位: mm
- カラー: CMYK（マゼンタ=CMYK(0,100,0,0)、黒=CMYK(0,0,0,100)）
- ファイル名: `marksheet_{orientation}_{pitchName}.pdf`
- **表面は常に出力（1ページ目）。hasBack=trueのとき裏面を2ページ目として追加。**
- 描画ロジック: Canvas・PDF共通の `drawLayout(api)` 関数で統一
- MB内数字のy座標: `baseline: 'middle'` 指定によりMB中心に配置（Canvasと同一）

---

## 19. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値(4.23mm)未満です |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄の数字9行が外枠外にはみ出します |
| 表面＋裏面の総収容数 < 問題数 | マークがはみ出ています |

横型受験番号欄チェック（固定値29を使用）:
```
examTopY = outer.y2 − firstX − 29 × pitch
y9 = examTopY + 9 × pitch
警告条件: y9 > outer.y2
```

---

## 20. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | UI区分 | 説明 |
|---|---|---|---|
| orientation | portrait | 基本設定 | 縦型 / 横型 |
| tmType | control | 基本設定 | TM配置方式（制御型 / 直下型） |
| hasBack | false | 基本設定 | 裏面あり / なし |
| side | front | 基本設定 | 表示面（表面 / 裏面）。hasBack=trueのときのみ表示 |
| pitchName | 0.25 | 基本設定（ピッチとTM間隔を横並び） | ピッチ種別。変更時にmaxRowsLをデフォルト値にリセットしてrender() |
| tmInterval | 4.23mm | 基本設定（ピッチとTM間隔を横並び） | TM間隔。最小値4.23mm |
| questionCount | 50 | 解答欄 | 問題数 |
| choiceCount | 5 | 解答欄 | 選択肢数 |
| mbLong | 4mm | 解答欄 | MB長辺 |
| mbShort | 2mm | 解答欄 | MB短辺 |
| maxRowsL | ピッチ別 | 詳細設定（アコーディオン） | 使用するMBの上限番号。ピッチ変更時にデフォルト値へリセット。縦型・横型・縦型裏面すべてで使用。 |
| skipMB | 2 | 詳細設定（アコーディオン） | TM側から使用しないMB数 |
| columnGapMult | 2 | 詳細設定（アコーディオン） | 列ギャップのMB個数（0=隣接） |
| sectionGapMult | 2 | 詳細設定（アコーディオン） | セクションギャップのMB個数（0=隣接） |
| examDigits | 5 | 受験番号欄 | 桁数 |

**ピッチ別maxRowsLデフォルト値:**

| ピッチ | maxRowsL |
|---|---|
| 0.25 | 30 |
| 1/6 | 43 |
| 0.2 / 0.2s | 36 |
| 0.3 / 0.3F | 24 |

**固定値（変更不可）:**

| パラメータ | 値 | 説明 |
|---|---|---|
| MARGIN | 9mm | 外枠端からTM/MB端までの距離 |
| enStart | `MARGIN + tmS×1.5 + MB_SHORT/2` | along方向の開始MB中心 |
| PAD | 2mm | MBの端から枠線まで |
| QLABEL_OFFSET | `pitch / 2` mm | 問題番号ラベルのMBからのx方向オフセット |

---

## 21. UI仕様

- **テーマ切替**: ヘッダー右端に 🌙 ボタン。クリックでダーク/ライトモードをトグル（🌙↔️☀️）。`body.light-mode` クラスで切替。
- **プレビュー更新ボタン**: 非表示（`display:none`）。パラメータ変更時にリアルタイム自動再描画。
- **PDF出力ボタン**: 常時表示。警告ボックスの下に配置。
- **警告ボックス**: 警告あり時のみ表示。PDF出力ボタンの上。
- **基本設定**: 向き・TM配置方式・裏面・表示面・ピッチ（セレクト）・TM間隔を含む。ピッチとTM間隔は横2列並び（`row2`）。
- **解答欄・受験番号欄ヘッダー**: `font-size:11px; font-weight:700; text-transform:none`（ctrl-labelと同等スタイル）。
- **詳細設定**: アコーディオンで折り畳み。最大MB数・skipMB・列ギャップ・セクションギャップを含む。
- **ピッチマスター参照**: アコーディオンで折り畳み。ピッチ・pitch・firstX・maxMBを一覧表示。

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
