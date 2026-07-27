# マークシート生成ツール 仕様書

**対象機器:** OMR機
**出力:** アートボード上に外枠中央配置のプレビュー（Canvas描画）／PDF出力  
**対応向き:** 縦型 / 横型  
**対応ピッチ:** 0.25 / 1/6 / 0.2 / 0.2s / 0.3 / 0.3F

---

## 1. 用語定義

| 用語 | 略称 | 説明 |
|---|---|---|
| タイミングマーク | TM | スキャナーがMBの位置を検出するための黒塗り矩形。外枠の辺に沿って等間隔に並ぶ。 |
| スタートタイミングマーク | スタートTM | 0.3F専用。対となるTMのうち上側（along方向の先頭側）のTM。 |
| ストップタイミングマーク | ストップTM | 0.3F専用。対となるTMのうち下側（along方向の末尾側）のTM。 |
| マークボックス | MB | 受験者が鉛筆でマークする楕円形の枠。各TMに対応して配置される。 |
| TM間隔 | tmInterval | TMが並ぶ方向（along方向）のTM中心間距離（mm）。0.3Fはスタート→次スタートのTOP間距離。 |
| MB間隔 | pitch | MBが並ぶ方向（perp方向）のMB中心間距離（mm）。ピッチマスターで定義。 |
| along方向 | along | TMが並ぶ方向。縦型＝下↓（y増加）、横型＝右→（x増加）。 |
| perp方向 | perp | along方向と直交する方向。縦型＝右→（x増加）、横型＝上↑（y減少）。 |
| 外枠 | outer | 印刷領域枠（マージンなし）。座標計算の基準。デフォルトA4サイズ。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺（基準辺）に最も近いMBが第1MB。 |
| 論理問題番号 | - | 受験者が読む問題の順番。シートの上側または左側から問1となる。 |
| MBインターバル | skipMB | 表面でMBを何個ぶん空けてから開始するか。縦型・横型ともに有効。 |
| 裏面のMBインターバル | backSkipMB | 縦型裏面・横型裏面でMBを何個ぶん空けてから開始するか。 |

---

## 2. 座標系

- 原点は外枠の**左上隅**（outer.x1=0, outer.y1=0）
- **Web座標系**を採用：右方向がx増加、**下方向がy増加**

---

## 3. 外枠・アートボードサイズ

### 3.1 外枠プリセット（縦型基準、横型は幅と高さをswap）

| プリセット名 | 幅(mm) | 高さ(mm) |
|---|---|---|
| A4（デフォルト） | 210 | 297 |
| JIS | 82.55 | 187.3 |
| 幅広 | 101.5 | 226 |
| カスタム | 任意 | 任意 |

横型時は幅と高さを自動でswapして使用。

### 3.2 アートボードサイズ

| 条件 | アートボード |
|---|---|
| 外枠 ≤ A4サイズ | B4固定（縦型: 257×364mm / 横型: 364×257mm） |
| 外枠 > A4サイズ | 外枠 + 周囲23.5mm余白（可変） |

外枠はアートボードの中央に配置。オフセット＝(アートボード－外枠)÷2。

---

## 4. ピッチマスター

スキャナーの読み取り仕様に基づく固定パラメータ。ユーザーは変更不可（maxRowsLのみ上書き可）。

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
- **firstX**: 外枠基準辺からMB中心第1番目までの距離（縦型=左辺、横型=下辺）
- **tmS**: TMのalong方向の寸法（短辺）
- **tmL**: TMのperp方向の寸法（長辺）
- **tmPos**: 外枠基準辺からTM端までのオフセット。**負値=外枠の外側**にはみ出す
- **maxMB**: along方向に配置できるMBの最大数
- **maxRowsL**: 1TMに対してperp方向に並ぶMBの最大数。縦型・横型ともに有効。ピッチ変更時にデフォルト値へリセットされるが、ユーザーが上書き可能。

---

## 5. TM・MBのサイズと形状

### 5.1 TM（タイミングマーク）

黒塗り（K100%）の矩形。

**通常ピッチ（0.25 / 1/6 / 0.2 / 0.2s / 0.3）:**

| | 縦型表面 | 縦型裏面 | 横型表面 | 横型裏面 |
|---|---|---|---|---|
| along方向寸法 | tmS | tmS | tmS | tmS |
| perp方向寸法 | tmL | tmL | tmL | tmL |
| 配置辺 | 左辺 | 右辺 | 下辺 | 下辺 |
| 個数/MB | 1 | 1 | 1 | 1 |

**0.3Fピッチ（スタート/ストップTMペア構造）:**

| | 縦型 | 横型 |
|---|---|---|
| 個数/MB | 2（スタートTM + ストップTM） | 2（スタートTM + ストップTM） |
| スタートTM TOP → ストップTM BOTTOM | 3.43mm固定 | 3.43mm固定 |
| MB中心 | スタートTM TOP + 1.715mm | スタートTM LEFT + 1.715mm（along方向） |
| TM間隔の基準 | スタートTM TOP → 次スタートTM TOP | スタートTM LEFT → 次スタートTM LEFT |

### 5.2 MB（マークボックス）

塗りなし・マゼンタ100%（CMYK: 0,100,0,0）線の楕円形。線幅 0.6pt。  
デフォルトサイズ: **長辺 MB_LONG=4mm × 短辺 MB_SHORT=2mm**（ユーザー変更可能）。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | MB_SHORT | MB_SHORT |
| perp方向の寸法 | MB_LONG | MB_LONG |
| 形状 | 横長の楕円 | 縦長の楕円 |

---

## 6. TM配置方式

### 6.1 制御型（デフォルト）/ 直下型

通常ピッチのみ適用。0.3Fは常にペア構造を使用。

**縦型:**
```
制御型: TM上端y = MB中心y - tmS × 1.5
直下型: TM上端y = MB中心y - tmS / 2
```

**横型:**
```
制御型: TM左端x = MB中心x - tmS × 1.5
直下型: TM左端x = MB中心x - tmS / 2
```

### 6.2 0.3F専用ペア構造

```
スタートTM 上端y（縦型）/ 左端x（横型） = MB中心 - 1.715
ストップTM 上端y（縦型）/ 左端x（横型） = MB中心 + 1.715 - tmS（= MB中心 + 1.215）
```

### 6.3 TM配置辺

```
縦型表面: TM左端x = outer.x1 + tmPos  （tmPos<0なら外枠外）
縦型裏面: TM左端x = outer.x2 - tmPos - tmL  （右辺基準）
横型表面: TM上端y = outer.y2 - tmPos - tmL  （下辺基準）
横型裏面（制御型）: TM上端y = (outer.y2 - firstX) + tmS × 1.5
横型裏面（直下型）: TM上端y = outer.y2 - tmPos - tmL  （表面と同じ）
```

---

## 7. along方向の両端余白

外枠端からTM/MBの**端**まで **9mm** を確保する（縦型=上下、横型=左右）。

**通常ピッチ:**
```
enStart（開始側MB中心） = 9 + tmS × 1.5 + MB_SHORT / 2
終端側MB中心の上限      = outer端 - 9 - tmS × 1.5 - MB_SHORT / 2
```

**0.3F:**
```
enStart（開始側MB中心） = 9 + 1.715 + MB_SHORT / 2
終端側MB中心の上限      = outer端 - 9 - 1.715 - MB_SHORT / 2
```

---

## 8. MB最大（maxRowsL）の意味と使い方

**maxRowsL = 1TMに対してperp方向に並ぶMBの最大数**（縦型・横型共通）。

| 向き | 制限の適用先 | 計算 |
|---|---|---|
| 縦型表面 | perp方向（列の右端MB中心）の上限 | `perpMax = outer.x1 + firstX + (maxRowsL-1) × pitch` |
| 縦型裏面 | perp方向（列の左端MB中心）の起点 | `backChoice1x = outer.x2 - firstX - (maxRowsL-1-backSkipMB) × pitch` |
| 横型表面 | 1列あたりの最大行数 | `maxRowsPerCol = maxRowsL - skipMB` |
| 横型裏面 | 1列あたりの最大行数 | `maxRowsPerCol = maxRowsL - backSkipMB` |

---

## 9. ギャップ（間隔）仕様

値=0のとき間隔なし（MB同士が隣接）、値=Nのときその個数ぶんの空きが生まれる。

```
sectionGap = tmInterval × (sectionGapMult + 1)
columnGap  = pitch      × (columnGapMult + 1)   ← 縦型
columnGap  = tmInterval × (columnGapMult + 1)   ← 横型
```

| UIラベル | パラメータ | 縦型単位 | 横型単位 |
|---|---|---|---|
| 解答欄インターバル | columnGapMult | pitch × (N+1) | tmInterval × (N+1) |
| 受験番号インターバル | sectionGapMult | tmInterval × (N+1) | tmInterval × (N+1) |

---

## 10. 表面レイアウト

### 10.1 受験番号欄（hasExamNum=true のとき描画）

**縦型:**
```
桁di（perp=右→）: MB中心x = outer.x1 + firstX + (skipMB + di) × pitch
数字ri（along=下↓）: MB中心y = enStart + ri × tmInterval  （ri=0〜9）
```

**横型:**
```
桁di（along=右→）: MB中心x = enStart + di × tmInterval
数字ri（perp=下↓）: MB中心y = ansStartY + ri × pitch  （ri=0〜9）
ansStartY = outer.y2 - firstX - (maxRowsL - 1) × pitch
```

### 10.2 解答欄開始位置

```
縦型:
  受験番号欄あり: ansStartY = (enStart + 9×tmInterval) + sectionGap
  受験番号欄なし: ansStartY = enStart

横型:
  受験番号欄あり: ansStart = (enStart + (examDigits-1)×tmInterval) + sectionGap
  受験番号欄なし: ansStart = enStart
```

### 10.3 解答欄座標

**縦型:**
```
問題qi（along=下↓）: MB中心y = ansStartY + qi × tmInterval
選択肢ci（perp=右→）: MB中心x = colBaseX + ci × pitch
colBaseX = (outer.x1 + firstX + skipMB×pitch) + colIndex × ((choiceCount-1)×pitch + columnGap)
列右端制限: colBaseX + (choiceCount-1)×pitch ≤ outer.x1 + firstX + (maxRowsL-1)×pitch
下端制限: MB中心y ≤ outer.y2 - 9 - tmToMBCenter - MB_SHORT/2
```

**横型:**
```
選択肢ci（along=右→）: MB中心x = colBaseX + ci × tmInterval
問題qi（perp=下↓）: MB中心y = ansStartY + qi × pitch
colBaseX = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)
右端制限: colBaseX + (choiceCount-1)×tmInterval + MB_SHORT/2 ≤ outer.x2 - 9 - tmToMBCenter - MB_SHORT/2
1列あたりの最大行数: maxRowsL - skipMB
```

---

## 11. 裏面レイアウト

### 11.1 共通仕様

- 受験番号欄なし（常に）
- 表面で全問収まる場合 → 外枠のみ表示（MB/TM描画なし）
- 問題番号は表面からの連続（frontQ + 1 〜）
- 解答欄開始位置: `enStart`（受験番号欄なし固定）

### 11.2 縦型裏面

```
TM配置辺: 右辺（outer.x2 - tmPos - tmL）
MB perp方向: 右→左（x減少）

選択肢①のx（最右端使用可能MB）:
  = outer.x2 - firstX - (maxRowsL - 1 - backSkipMB) × pitch

列展開: 選択肢①から左方向へ 1列=(choiceCount-1)×pitch
列数制限: 選択肢最左端が outer.x1 を下回らないかチェック

問題番号ラベル: 選択肢①MBの右側（MB_LONG/2 + QLABEL_OFFSET）
```

### 11.3 横型裏面

along・perpの方向は表面と同一（反転なし）。

```
TM perp方向（制御型）: TM上端y = (outer.y2 - firstX) + tmS × 1.5
TM perp方向（直下型）: TM上端y = outer.y2 - tmPos - tmL  （表面と同じ）
ansStart = enStart（受験番号欄なし固定）
1列あたりの最大行数: maxRowsL - backSkipMB
```

### 11.4 表面の描画問題数（frontQ）計算

**縦型:**
```
qPerCol = floor((maxYmm - ansStartY) / tmInterval) + 1  （座標ベース）
cols = perpMax範囲内に収まる列数
frontQ = min(qPerCol × cols, questionCount)
```

**横型:**
```
qPerCol = maxRowsL - skipMB
cols = 右端制限内に収まる列数（colBaseX + colWidth + MB_SHORT/2 ≤ maxXmm）
frontQ = min(qPerCol × cols, questionCount)
```

---

## 12. MBインターバル（skipMB / backSkipMB）の効果

| 向き/面 | skipMB=0 | skipMB=N |
|---|---|---|
| 縦型表面 | 第1MBから開始（perp方向） | 第(N+1)MBから開始 |
| 縦型裏面 | backSkipMB=0: 最大範囲を使用 | backSkipMB=N: 右側N個ぶん縮める |
| 横型表面 | maxRowsL行全使用 | (maxRowsL-N)行使用（下側スキップ） |
| 横型裏面 | maxRowsL行全使用 | (maxRowsL-backSkipMB)行使用 |

---

## 13. テキスト要素

### 13.1 MB内の数値

| 項目 | 値 |
|---|---|
| 色 | マゼンタ100%（CMYK: 0,100,0,0） |
| フォント | MS ゴシック |
| サイズ | 7pt（PDF出力時）/ MB_SHORT × 0.65mm（Canvasプレビュー） |
| 配置 | MB中心 |

### 13.2 問題番号ラベル

| 項目 | 値 |
|---|---|
| 色 | マゼンタ100% |
| フォント | Noto Sans JP |
| サイズ | **3mm固定**（MB短辺変更の影響を受けない） |
| オフセット | **pitch / 2** mm（MB端からの距離） |
| 位置 | 縦型表面・横型: 選択肢①MBの左側 / 縦型裏面: 選択肢①MBの右側 |

### 13.3 桁ラベル

不要。MBのみ描画する。

---

## 14. 枠・外枠の描画

| オブジェクト | 色 | 線幅 | 塗り |
|---|---|---|---|
| 外枠 | マゼンタ100%（CMYK: 0,100,0,0） | 0.4pt | なし |
| 受験番号欄・解答欄枠 | マゼンタ100% | 0.4pt | なし |
| MB | マゼンタ100% | 0.6pt | なし |
| TM | K100%（CMYK: 0,0,0,100） | — | 塗りつぶし |

枠パディング(PAD): **2mm**（MBの端から枠線まで）

---

## 15. PDF出力

- ライブラリ: **jsPDF**（CDN: cdnjs.cloudflare.com）
- 用紙サイズ: アートボードサイズ（mm単位）
- カラーモード: **CMYK**
  - マゼンタ: `CMYK(0, 100, 0, 0)` → `setFillColor` + `setTextColor` 両方設定
  - 黒: `CMYK(0, 0, 0, 100)`
- 裏面あり: **表面・裏面を1ファイル2ページ**で出力
- ファイル名: `marksheet_{portrait|landscape}_{ピッチ名}.pdf`

---

## 16. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| 制御型 かつ tmInterval < 4.23mm | TM間隔が最小値(4.23mm)未満です |
| 直下型 かつ tmInterval < 2.21mm | TM間隔が最小値(2.21mm)未満です |
| 横型・受験番号欄ありで数字9行が外枠外 | 受験番号欄の数字9行が外枠外にはみ出します |
| 表面＋裏面の総収容数 < 問題数 | マークがはみ出ています |

警告は**PDF出力ボタンの上**に表示。

**総収容数の計算:**
```
縦型:
  表面: qPerCol(座標ベース) × 列数(perpMax制限)
  裏面: qPerColB(座標ベース) × 列数(backChoice1x起点)

横型:
  表面: (maxRowsL - skipMB) × 列数(colBaseX + colWidth + MB_SHORT/2 ≤ maxXmm)
  裏面: (maxRowsL - backSkipMB) × 列数(同上)
```

---

## 17. UIパラメータ一覧

### 常時表示

| UIラベル | パラメータ | 初期値 | 備考 |
|---|---|---|---|
| 向き | orientation | 縦型 | 縦型 / 横型 |
| 外枠サイズ | sheetPreset | a4 | A4 / JIS / 幅広 / カスタム |
| 幅(mm) / 高さ(mm) | sheetW / sheetH | 210 / 297 | カスタム時のみ表示 |
| TM配置方式 | tmType | 制御型 | 制御型 / 直下型（0.3Fには不適用） |
| 裏面 | hasBack | なし | なし / あり |
| 表示面 | side | 表面 | 裏面ありのとき表示 |
| ピッチ | pitchName | 0.25 | ピッチマスター参照 |
| TM間隔 (mm) | tmInterval | 4.23 | 制御型最小値4.23mm、直下型最小値2.21mm |
| 受験番号欄 | hasExamNum | あり | あり / なし |
| 桁数 | examDigits | 5 | 受験番号欄ありのとき表示 |
| 問題数 | questionCount | 50 | |
| 選択肢数 | choiceCount | 5 | |
| MB長辺 (mm) | mbLong | 4 | ユーザー変更可能 |
| MB短辺 (mm) | mbShort | 2 | ユーザー変更可能 |

### 詳細設定（アコーディオン・デフォルト閉）

| UIラベル | パラメータ | 初期値 | 備考 |
|---|---|---|---|
| MBインターバル | skipMB | 1 | 縦型・横型表面に有効 |
| 裏面のMBインターバル | backSkipMB | 1 | 縦型裏面・横型裏面に有効 |
| MB最大 | maxRowsL | ピッチ別 | 縦型・横型ともに有効。ピッチ変更時にデフォルトリセット |
| 解答欄インターバル | columnGapMult | 1 | 縦型=pitch×(N+1)、横型=tmInterval×(N+1) |
| 受験番号インターバル | sectionGapMult | 1 | tmInterval×(N+1) |

### ピッチの仕様参照（アコーディオン・デフォルト閉）

ピッチ別の固定値（pitch, firstX, maxMB）と計算済み値を表示。

---

## 18. 固定値（変更不可）

| パラメータ | 値 | 説明 |
|---|---|---|
| enStart（通常） | `9 + tmS×1.5 + MB_SHORT/2` mm | along方向の開始位置 |
| enStart（0.3F） | `9 + 1.715 + MB_SHORT/2` mm | 0.3F専用。スタートTM TOPからMB中心まで1.715mm |
| MARGIN | 9mm | 外枠端からTM/MB端までの距離 |
| PAD | 2mm | MBの端から枠線まで |
| FS_QLABEL | 3mm | 問題番号ラベルフォントサイズ（固定） |
| QLABEL_OFFSET | pitch / 2 mm | 問題番号ラベルのMBからの距離 |
| START_STOP_SPAN | 3.43mm | 0.3F: スタートTM TOP〜ストップTM BOTTOM固定距離 |
| HALF_SPAN | 1.715mm | 0.3F: START_STOP_SPAN / 2 = MB中心からのオフセット |

---

## 19. 未実装・今後の課題

- [ ] along方向のオーバーフロー検知の精緻化
- [ ] うら面のレイアウト検証
- [ ] GitHub push
