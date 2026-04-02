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
| マークボックス | MB | 受験者が鉛筆でマークする楕円形の枠。各TMに対応して配置される。 |
| TM間隔 | tmInterval | TMが並ぶ方向（along方向）のTM中心間距離（mm）。最小値4.23mm。 |
| MB間隔 | pitch | MBが並ぶ方向（perp方向）のMB中心間距離（mm）。ピッチマスターで定義。 |
| along方向 | along | TMが並ぶ方向。縦型＝下↓（y増加）、横型＝右→（x増加）。 |
| perp方向 | perp | along方向と直交する方向。縦型＝左右（x方向）、横型＝上下（y方向）。 |
| 外枠 | outer | A4サイズの印刷領域枠（マージンなし）。座標計算の基準。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺（基準辺）に最も近いMBが第1MB。 |
| 論理問題番号 | - | 受験者が読む問題の順番。シートの上側または左側から問1となる。 |
| 開始オフセット | skipMB | TM側から使用しないMBの個数。 |
| 表面 | front | シートの表側。受験番号欄あり。人間視点で縦型のTMは左側、横型のTMは下側。 |
| 裏面 | back | シートの裏側。受験番号欄なし、表面の続き番号から解答欄を配置。人間視点で縦型のTMは右側、横型のTMは下側（表面と同じ辺）。 |

**左右の基準:** 本仕様書における「左・右」はすべて人間がシートを正面から見たときの方向を指す。Web座標系（x増加=右）とは独立した概念。

---

## 2. pitchとtmIntervalの違い

**pitchとtmIntervalは互いに直交する方向の間隔であり、独立して設定する。**

| | 縦型 | 横型 |
|---|---|---|
| tmInterval（TM間隔） | along（下↓）方向 | along（右→）方向 |
| pitch（MB間隔） | perp（左右）方向 | perp（上下）方向 |

---

## 3. 座標系

- 原点はA4外枠の**左上隅**（outer.x1=0, outer.y1=0）
- **Web座標系**を採用：右方向がx増加、**下方向がy増加**
- 人間視点の「左」= x小、「右」= x大、「上」= y小、「下」= y大

---

## 4. 用紙・アートボードサイズ

| 種別 | 幅(mm) | 高さ(mm) |
|---|---|---|
| 縦型A4（外枠） | 210 | 297 |
| 横型A4（外枠） | 297 | 210 |
| 縦型B4（アートボード） | 257 | 364 |
| 横型B4（アートボード） | 364 | 257 |

A4外枠はB4アートボードの中央に配置。オフセット＝(B4－A4)÷2。

---

## 5. ピッチマスター

スキャナーの読み取り仕様に基づく固定パラメータ。ユーザーは変更不可。

| ピッチ名 | pitch(mm) | firstX(mm) | maxMB | tmS(mm) | tmL(mm) | tmPos(mm) | maxRowsL |
|---|---|---|---|---|---|---|---|
| 0.25 | 6.35 | 6.35 | 33 | 0.89 | 5.9 | -2.0 | 30 |
| 1/6 | 4.233 | 11.43 | 48 | 1.27 | 3.81 | 5.085 | 43 |
| 0.2 | 5.08 | 11.75 | 40 | 0.89 | 5.9 | -2.0 | 36 |
| 0.2s | 5.08 | 12.7 | 40 | 0.89 | 3.81 | 5.095 | 36 |
| 0.3 | 7.62 | 14.50 | 27 | 0.89 | 7.0 | -2.0 | 24 |
| 0.3F | 7.62 | 17.78 | 24 | 0.5 | 5.08 | 7.62 | 24 |

**パラメータの意味:**

- **pitch**: MBが並ぶ方向（perp方向）のMB中心間距離
- **firstX**: 外枠TM配置辺からMB中心第1番目までの距離
- **tmS**: TMのalong方向の寸法（短辺）
- **tmL**: TMのperp方向の寸法（長辺）
- **tmPos**: 外枠TM配置辺からTM端までのオフセット。**負値=外枠の外側**にはみ出す
- **maxMB**: perp方向に配置できるMBの総数（スキャナー仕様上限）
- **maxRowsL**: TM反対側から使用しないMBの個数の反転値（=使用上限番号）。ピッチ別デフォルト値。ユーザー変更可。

---

## 6. TM・MBのサイズと形状

### 6.1 TM（タイミングマーク）

黒塗りの矩形（K100%）。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | tmS（短辺） | tmS（短辺） |
| perp方向の寸法 | tmL（長辺） | tmL（長辺） |
| 形状 | 横長の矩形 | 縦長の矩形 |
| TM配置辺（表面） | 左辺（人間視点） | 下辺（人間視点） |
| TM配置辺（裏面） | 右辺（人間視点） | 下辺（人間視点・表面と同じ） |

### 6.2 MB（マークボックス）

塗りなし・マゼンタ100%線の楕円形。デフォルトサイズ **長辺4mm × 短辺2mm**（ユーザー変更可）。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | MB_SHORT（短辺） | MB_SHORT（短辺） |
| perp方向の寸法 | MB_LONG（長辺） | MB_LONG（長辺） |
| 形状 | 横長の楕円 | 縦長の楕円 |

---

## 7. TM配置方式

TMとMBのalong方向の位置関係は2種類から選択する。

| 方式 | 縦型 TM上端y | 横型 TM左端x |
|---|---|---|
| **制御型** | MB中心y - tmS × 1.5 | MB中心x - tmS × 1.5 |
| **直下型** | MB中心y - tmS / 2（TM中心=MB中心） | MB中心x - tmS / 2 |

TM perp方向の配置（方式によらず共通）:

```
縦型表面: TM左端x  = outer.x1 + tmPos              ※tmPos<0なら外枠外（左）
縦型裏面: TM左端x  = outer.x2 - tmPos - tmL         ※右辺基準（tmPos<0なら外枠外・右）

横型表面・裏面共通: TM上端y = outer.y2 - tmPos - tmL ※tmPos<0なら外枠外（下）
```

---

## 8. along方向の両端余白

外枠端からTM/MBの**端**まで **9mm（MARGIN）** を確保する（縦型=上下、横型=左右）。

```
enStart（開始側MB中心） = MARGIN + tmS × 1.5 + MB_SHORT / 2
  ※制御型の場合: TMの上端/左端 = enStart - tmS×1.5 = 9mm（外枠端からちょうど9mm）

終端側MB中心の上限 = outer端 - MARGIN - tmS × 1.5 - MB_SHORT / 2
```

---

## 9. skipMBとmaxRowsLの役割

縦型・横型ともに、perp方向のMB使用範囲を両端から制限する。

```
TM側（使用不可）         使用範囲                  TM反対側（使用不可）
|←  skipMB個  →|←  使用可能MB  →|← (maxMB - maxRowsL)個 →|
  物理第1〜skipMB番     第(skipMB+1)〜第(maxRowsL)番
```

| パラメータ | 役割 |
|---|---|
| skipMB | TM側から使用しないMB数。物理第1〜第skipMB番を除外。 |
| maxRowsL | 使用するMBの上限番号。物理第(maxRowsL+1)〜第maxMB番を除外。ユーザー変更可。ピッチ変更時にデフォルト値へリセット。 |
| 使用可能MB数 | maxRowsL - skipMB 個 |

| 向き・面 | TM側 | MB第1番（TM最近傍） | 使用開始MB |
|---|---|---|---|
| 縦型表面 | 左 | 左端 | 左から(skipMB+1)番目 |
| 縦型裏面 | 右 | 右端 | 右から(skipMB+1)番目＝左から第maxRowsL番 |
| 横型表面・裏面 | 下 | 下端 | 下から(skipMB+1)番目＝上から第maxRowsL番 |

---

## 10. 解答欄レイアウト

### 10.1 縦型表面

```
選択肢ci（perp=右→、pitch間隔）:
  MB中心x = colBaseX + ci × pitch
  colBaseX = outer.x1 + firstX + skipMB×pitch
             + colIndex × ((choiceCount-1)×pitch + columnGap)

問題番号qi（along=下↓、tmInterval間隔）:
  MB中心y = ansStartY + r × tmInterval
  ansStartY = enEndY + sectionGap    （enEndY = enStart + 9×tmInterval）

列の右端チェック:
  colBaseX + (choiceCount-1)×pitch + MB_LONG/2 ≤ outer.x2 - MARGIN - MB_LONG/2
  → 超える場合はその列ごと描画しない（裏面へ）
```

### 10.2 縦型裏面

受験番号欄なし。enStartから直接解答欄を配置。

```
人間視点の並び: 左端が選択肢①、右へ②③…（表面と同じ見た目）
物理MB対応:    左端が第maxRowsL番MB（TM反対側境界）、右端が第(skipMB+1)番MB（TM側境界）

選択肢①のx（左端・第maxRowsL番MB）:
  backChoice1x = outer.x2 - firstX - (maxRowsL - 1) × pitch

選択肢ci（左→右・pitch間隔）:
  MB中心x = colBaseX + ci × pitch    ※ci=0が選択肢①（左端）
  colBaseX = backChoice1x + colIndex × ((choiceCount-1)×pitch + columnGap)

右端使用禁止境界（TM側・skipMB分）:
  backRightLimit = outer.x2 - firstX - skipMB × pitch

列の右端チェック:
  colBaseX + (choiceCount-1)×pitch + MB_LONG/2 + PAD ≤ backRightLimit
  → 超える場合はその列ごと描画しない

問題番号qi（along=下↓、tmInterval間隔）:
  MB中心y = enStart + r × tmInterval

問題番号: 表面の続き番号（frontQ + qi + 1）
MB内数字: 選択肢番号（ci + 1）
問題番号ラベル: 選択肢①MBの左側
列の展開方向: 右（x増加）
```

### 10.3 横型表面

```
選択肢ci（along=右→、tmInterval間隔）:
  MB中心x = colBaseX + ci × tmInterval
  colBaseX = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)
  ansStart = enEndX + sectionGap    （enEndX = enStart + (examDigits-1)×tmInterval）

問題番号qi（perp=下↓、pitch間隔）:
  MB中心y = ansStartY + qi × pitch
  ansStartY = outer.y2 - firstX - (maxRowsL - 1) × pitch（第maxRowsL番MB・固定）

1列あたりの最大問題数: maxRowsL - skipMB

列の右端チェック:
  colBaseX + (choiceCount-1)×tmInterval + MB_SHORT/2 ≤ outer.x2 - MARGIN - tmS×1.5 - MB_SHORT/2
  → 超える場合はその列ごと描画しない（裏面へ）
```

### 10.4 横型裏面

受験番号欄なし。enStartから直接解答欄を配置。

```
ansStart = enStart    （受験番号欄なしのためsectionGap不要）
それ以外の座標計算・チェックは横型表面と同じ

問題番号: 表面の続き番号（frontQ + qi + 1）
```

---

## 11. 受験番号欄レイアウト

受験番号欄は**表面のみ**に配置する。

### 11.1 縦型（表面のみ）

```
桁di（perp=右→、pitch間隔）:
  MB中心x = outer.x1 + firstX + (skipMB + di) × pitch    （di=0〜examDigits-1）

数字ri（along=下↓、tmInterval間隔）:
  MB中心y = enStart + ri × tmInterval    （ri=0〜9）
```

### 11.2 横型（表面のみ）

```
桁di（along=右→、tmInterval間隔）:
  MB中心x = enStart + di × tmInterval    （di=0〜examDigits-1）

数字ri（perp=下↓、pitch間隔）:
  MB中心y = ansStartY + ri × pitch    （ri=0〜9）
  ansStartY = outer.y2 - firstX - (maxRowsL-1) × pitch（第maxRowsL番MB・固定）
```

---

## 12. ギャップ（間隔）仕様

値=N のとき「MB N個分のインターバル」。N=0 でインターバルなし（隣接）。

```
columnGap（列ギャップ）:
  縦型: pitch      × (columnGapMult + 1)
  横型: tmInterval × (columnGapMult + 1)

sectionGap（セクションギャップ）:
  縦型・横型共通: tmInterval × (sectionGapMult + 1)
```

| columnGapMult | 列間の中心間距離（縦型） | 見た目 |
|---|---|---|
| 0 | pitch × 1 | 隣接（インターバルなし） |
| 1 | pitch × 2 | MB1個分の空き |
| 2 | pitch × 3 | MB2個分の空き |

sectionGap はセクション（受験番号欄→解答欄）間の along 方向の中心間距離に同様の式を適用する。

---

## 13. 表面の描画問題数計算（裏面用）

裏面を描画する際、表面で何問描いたかを計算して続き番号を決定する。

### 13.1 縦型（calcFrontQPortrait）

```
enEndY    = enStart + 9 × tmInterval
ansStartY = enEndY + sectionGap
maxYmm    = outer.y2 - MARGIN - tmS×1.5 - MB_SHORT/2
qPerCol   = floor((maxYmm - ansStartY) / tmInterval) + 1

baseX  = outer.x1 + firstX + skipMB×pitch
maxXmm = outer.x2 - MARGIN - MB_LONG/2
cols   = 列全体（右端MB含む）が maxXmm 以内に収まる列数
         条件: baseX + cols×(colWidth+columnGap) + colWidth + MB_LONG/2 ≤ maxXmm
         ※ cols=0 の場合は cols=1 として扱う

frontQ = min(qPerCol × cols, questionCount)
```

### 13.2 横型（calcFrontQLandscape）

```
qPerCol  = maxRowsL - skipMB
enEndX   = enStart + (examDigits-1) × tmInterval
ansStart = enEndX + sectionGap
maxXmm   = outer.x2 - MARGIN - tmS×1.5 - MB_SHORT/2
cols     = 列全体が maxXmm 以内に収まる列数
           条件: ansStart + cols×(colWidth+columnGap) + colWidth + MB_SHORT/2 ≤ maxXmm

frontQ = min(qPerCol × max(cols,1), questionCount)
```

---

## 14. 描画仕様

### 14.1 色

| オブジェクト | Canvas | PDF（CMYK） |
|---|---|---|
| TM | #000000 | CMYK(0, 0, 0, 100) |
| MB（線） | #ff00ff | CMYK(0, 100, 0, 0) |
| MB内数字 | #ff00ff | CMYK(0, 100, 0, 0) |
| 問題番号ラベル | #ff00ff | CMYK(0, 100, 0, 0) |
| A4外枠（線） | #ff00ff | CMYK(0, 100, 0, 0) |
| 枠線（受験番号欄・解答欄） | #ff00ff | CMYK(0, 100, 0, 0) |

### 14.2 線幅・フォント

| オブジェクト | 線幅 / サイズ |
|---|---|
| A4外枠 | 0.4pt（= 0.4/2.835 mm） |
| MB（楕円） | 0.6pt・塗りなし |
| MB内数字 | 7pt（= 7/2.835 mm）・MSゴシック |
| 問題番号ラベル | MB_SHORT × 1.5 mm・Noto Sans JP |
| 枠線（受験番号欄・解答欄） | 0.4pt・パディング PAD=2mm |

### 14.3 問題番号ラベルの配置

縦型・横型・表面・裏面すべて共通: 選択肢①MBの左側（`cx - MB_LONG/2 - 0.5mm`、right揃え）

### 14.4 MB内数字

| 対象 | 表示内容 |
|---|---|
| 解答欄（縦型・横型、表面・裏面） | 選択肢番号（1, 2, 3 … choiceCount） |
| 受験番号欄 | 数字（0〜9） |

---

## 15. TM重複排除

`tmAlongPositions`（Set）にalong座標を収集し、一括描画することで同座標のTMを自動排除する。

---

## 16. 裏面レイアウト

### 16.1 裏面の有無・表示切替

- `hasBack`（初期値: false）で裏面の有無を制御する
- `hasBack=true` のとき `side`（'front' / 'back'）で表示面を切替
- `side` UIは `hasBack=true` のときのみ表示する

### 16.2 裏面描画の基本ルール

- 受験番号欄なし
- 解答欄は `enStart` から直接開始（sectionGap 不要）
- 問題番号は表面の続き番号（frontQ + 1 から）
- 全問が表面に収まる場合（remainQ ≤ 0）はA4外枠のみ描画

### 16.3 はみ出し時の挙動

- ある列が外枠（またはskipMB境界）に収まらない場合、**その列ごと描画しない**
- 表面＋裏面で全問が収まらない場合、警告「マークがはみ出ています」を表示

---

## 17. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値(4.23mm)未満です |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄の数字9行が外枠外にはみ出します |
| 表面＋裏面の総収容数 < 問題数 | マークがはみ出ています |

横型受験番号欄チェック:
```
examTopY = outer.y2 - firstX - 29 × pitch
y9 = examTopY + 9 × pitch
警告条件: y9 > outer.y2
```

---

## 18. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | 説明 |
|---|---|---|
| orientation | portrait（縦型） | シートの向き（縦型 / 横型） |
| tmType | control（制御型） | TM配置方式（制御型 / 直下型） |
| hasBack | false | 裏面の有無（あり / なし） |
| side | front | 現在の表示面（表面 / 裏面）。hasBack=trueのときのみUI表示 |
| pitchName | 0.25 | ピッチ種別（ピッチマスター参照） |
| tmInterval | 4.23mm | TM間隔（along方向）。最小値4.23mm |
| examDigits | 5 | 受験番号の桁数 |
| questionCount | 50 | 問題数 |
| choiceCount | 5 | 選択肢数 |
| mbLong | 4mm | MB長辺（変更可） |
| mbShort | 2mm | MB短辺（変更可） |
| skipMB | 2 | TM側から使用しないMB数 |
| columnGapMult | 2 | 列ギャップのMB個数（0=隣接、N=N個分の空き） |
| sectionGapMult | 2 | セクションギャップのMB個数（0=隣接、N=N個分の空き） |
| maxRowsL | ピッチ別 | 使用するMBの上限番号（TM反対側の除外基準）。ピッチ変更時にデフォルト値へリセット。横型・縦型裏面で使用。横型時のみUI表示。 |

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
| 縦型 ansStartY（表面） | `enStart + 9×tmInterval + sectionGap` | 解答欄開始y座標 |
| 縦型 ansStartY（裏面） | `enStart` | 受験番号欄なしのため直接開始 |
| 横型 ansStartY | `outer.y2 - firstX - (maxRowsL-1)×pitch` | 第maxRowsL番MB位置（固定） |

---

## 19. PDF出力仕様

- ライブラリ: jsPDF（クライアントサイド）
- 用紙サイズ: B4（アートボードサイズ）
- 単位: mm
- カラー: CMYK（マゼンタ=CMYK(0,100,0,0)、黒=CMYK(0,0,0,100)）
- ファイル名: `marksheet_{orientation}_{pitchName}.pdf`
- 描画ロジック: Canvas・PDF共通の `drawLayout(api)` 関数で統一
- 出力面: `state.side`（'front' / 'back'）に基づき表面または裏面を出力

---

## 20. 未実装・今後の課題

- [ ] 横型警告チェックの固定値 `29` を動的な `maxRowsL - 1` に変更する検討
- [ ] うら面のレイアウト検証
- [ ] GitHub push
