# マークシート生成ツール 仕様書

**対象機器:** セコニック SR-3500  
**出力:** B4アートボード上にA4中央配置のプレビュー（Canvas描画）／PDF出力  
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
| perp方向 | perp | along方向と直交する方向。縦型＝右→（x増加）、横型＝上↑（y減少）。 |
| 外枠 | outer | A4サイズの印刷領域枠（マージンなし）。座標計算の基準。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺（基準辺）に最も近いMBが第1MB。 |
| 論理問題番号 | - | 受験者が読む問題の順番。シートの上側または左側から問1となる。 |
| 開始オフセット | skipMB | MBを何個ぶん空けてから開始するか。縦型・横型ともに有効。 |

---

## 2. 座標系

- 原点はA4外枠の**左上隅**（outer.x1=0, outer.y1=0）
- **Web座標系**を採用：右方向がx増加、**下方向がy増加**

---

## 3. 用紙・アートボードサイズ

| 種別 | 幅(mm) | 高さ(mm) |
|---|---|---|
| 縦型A4（外枠） | 210 | 297 |
| 横型A4（外枠） | 297 | 210 |
| 縦型B4（アートボード） | 257 | 364 |
| 横型B4（アートボード） | 364 | 257 |

A4外枠はB4アートボードの中央に配置。オフセット＝(B4－A4)÷2。

| | x方向オフセット(mm) | y方向オフセット(mm) |
|---|---|---|
| 縦型 | 23.5 | 33.5 |
| 横型 | 33.5 | 23.5 |

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
- **maxRowsL**: perp方向（横型では上↑方向）のMB最大行数。ピッチ変更時にデフォルト値へリセットされるが、ユーザーが上書き可能。縦型・横型ともに有効。

---

## 5. TM・MBのサイズと形状

### 5.1 TM（タイミングマーク）

黒塗り（K100%）の矩形。

| | 縦型表面 | 縦型裏面 | 横型表面 | 横型裏面 |
|---|---|---|---|---|
| along方向寸法 | tmS | tmS | tmS | tmS |
| perp方向寸法 | tmL | tmL | tmL | tmL |
| 配置辺 | 左辺 | 右辺 | 下辺 | 下辺（制御型は位置が異なる） |

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

### 6.1 制御型（デフォルト）

```
縦型表面: TM上端y = MB中心y - tmS × 1.5
縦型裏面: TM上端y = MB中心y - tmS × 1.5  （配置辺は右辺）
横型表面: TM上端y = outer.y2 - tmPos - tmL （下辺基準・固定）
横型裏面: TM上端y = (outer.y2 - firstX) + tmS × 1.5  （第1MB中心yの下方向）
```

### 6.2 直下型

```
縦型: TM上端y = MB中心y - tmS / 2  （TM中心=MB中心）
横型: TM上端y = outer.y2 - tmPos - tmL  （表裏ともに変わらず）
```

**TM along方向位置:**

```
縦型: TM左端x = outer.x1 + tmPos  （表面）/ outer.x2 - tmPos - tmL  （裏面）
横型: TM左端x = MB中心x - tmS × 1.5  （制御型）/ MB中心x - tmS / 2  （直下型）
```

---

## 7. along方向の両端余白

外枠端からTM/MBの**端**まで **9mm** を確保する（縦型=上下、横型=左右）。

```
enStart（開始側MB中心） = 9 + tmS × 1.5 + MB_SHORT / 2
終端側MB中心の上限      = outer端 - 9 - tmS × 1.5 - MB_SHORT / 2
```

---

## 8. ギャップ（間隔）仕様

値=0のとき隣接（中心間距離1pitch/tmInterval分）、値=Nのとき(N+1)個分の間隔。

```
sectionGap = tmInterval × (sectionGapMult + 1)
columnGap  = pitch      × (columnGapMult + 1)  ← 縦型
columnGap  = tmInterval × (columnGapMult + 1)  ← 横型
```

| パラメータ | UIラベル | 縦型単位 | 横型単位 |
|---|---|---|---|
| columnGapMult | 解答欄インターバル | pitch × (N+1) | tmInterval × (N+1) |
| sectionGapMult | 受験番号インターバル | tmInterval × (N+1) | tmInterval × (N+1) |

---

## 9. 表面レイアウト

### 9.1 縦型表面

**受験番号欄:**
```
桁di（perp=右→）: MB中心x = outer.x1 + firstX + (skipMB + di) × pitch
数字ri（along=下↓）: MB中心y = enStart + ri × tmInterval  （ri=0〜9）
```

**解答欄:**
```
問題qi（along=下↓）: MB中心y = ansStartY + qi × tmInterval
選択肢ci（perp=右→）: MB中心x = colBaseX + ci × pitch
colBaseX = (outer.x1 + firstX + skipMB×pitch) + colIndex × ((choiceCount-1)×pitch + columnGap)
ansStartY = (enStart + 9×tmInterval) + sectionGap

下端制限: MB中心y ≤ outer.y2 - 9 - tmS×1.5 - MB_SHORT/2
右端制限: colBaseX + (choiceCount-1)×pitch + MB_LONG/2 ≤ outer.x2 - 9 - MB_LONG/2
```

### 9.2 横型表面

**受験番号欄:**
```
桁di（along=右→）: MB中心x = enStart + di × tmInterval
数字ri（perp=下↓）: MB中心y = ansStartY + ri × pitch  （ri=0〜9）
```

**解答欄:**
```
選択肢ci（along=右→）: MB中心x = colBaseX + ci × tmInterval
問題qi（perp=下↓）: MB中心y = ansStartY + qi × pitch
ansStartY = outer.y2 - firstX - (maxRowsL - 1) × pitch  （第maxRowsL番MB位置・固定）
colBaseX  = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)
ansStart  = (enStart + (examDigits-1)×tmInterval) + sectionGap

右端制限: colBaseX + (choiceCount-1)×tmInterval + MB_SHORT/2 ≤ outer.x2 - 9 - tmS×1.5 - MB_SHORT/2
1列あたりの最大行数: maxRowsL - skipMB
```

---

## 10. 裏面レイアウト

### 10.1 共通仕様

- 受験番号欄なし
- 表面で全問収まる場合 → 外枠のみ表示（MB/TM描画なし）
- 問題番号は表面からの連続（frontQ + 1 〜）

**表面の描画問題数（frontQ）の計算:**

縦型: `qPerCol × 列数`（列全体が収まるかチェック）  
横型: `(maxRowsL - skipMB) × 列数`

### 10.2 縦型裏面

```
TM配置辺: 右辺（outer.x2 - tmPos - tmL）
MB perp方向: 右→左（x減少）
選択肢①のx = outer.x2 - firstX - (maxRowsL - 1) × pitch  （人間視点で左端）
列展開: 右方向（x増加）
問題番号ラベル: 選択肢①MBの左側
```

解答欄のalong方向（上下）は表面と同一。受験番号欄なしのため `ansStartY = enStart` から直接解答欄を開始。

### 10.3 横型裏面

along・perpの方向は表面と同一（反転なし）。受験番号欄なしのため `ansStart = enStart` から開始。

制御型のみTM上端yが異なる:
```
制御型: TM上端y = (outer.y2 - firstX) + tmS × 1.5  （第1MB中心yの下方向）
直下型: TM上端y = outer.y2 - tmPos - tmL  （表面と同じ）
```

---

## 11. skipMBの効果

| 向き | skipMB=0 | skipMB=N |
|---|---|---|
| 縦型表面 | 第1MBから開始（perp方向） | 第(N+1)MBから開始 |
| 縦型裏面 | 第maxRowsL番MBを左端として全列使用 | 右側N列ぶん使用不可 |
| 横型 | maxRowsL行全使用 | (maxRowsL-N)行使用（下側スキップ） |

---

## 12. テキスト要素

### 12.1 MB内の数値

| 項目 | 値 |
|---|---|
| 色 | マゼンタ100%（CMYK: 0,100,0,0） |
| フォント | MS ゴシック |
| サイズ | **7pt**（PDF）/ MB_SHORT × 0.65mm（Canvasプレビュー） |
| 配置 | MB中心 |

### 12.2 問題番号ラベル

| 項目 | 値 |
|---|---|
| 色 | マゼンタ100% |
| フォント | Noto Sans JP |
| サイズ | **3mm固定**（MB短辺変更の影響を受けない） |
| オフセット | **pitch / 2** mm（MB端からの距離） |
| 位置 | 縦型表面・横型: 選択肢①MBの左側 / 縦型裏面: 選択肢①MBの左側 |

### 12.3 桁ラベル

不要。MBのみ描画する。

---

## 13. 枠・外枠の描画

| オブジェクト | 色 | 線幅 | 塗り |
|---|---|---|---|
| A4外枠 | マゼンタ100%（CMYK: 0,100,0,0） | 0.4pt | なし |
| 受験番号欄・解答欄枠 | マゼンタ100% | 0.4pt | なし |
| MB | マゼンタ100% | 0.6pt | なし |
| TM | K100%（CMYK: 0,0,0,100） | — | 塗りつぶし |

枠パディング(PAD): **2mm**（MBの端から枠線まで）

---

## 14. PDF出力

- ライブラリ: **jsPDF**（CDN: cdnjs.cloudflare.com）
- 用紙サイズ: B4（mm単位）
- カラーモード: **CMYK**
  - マゼンタ: `CMYK(0, 100, 0, 0)` → `setFillColor` + `setTextColor` 両方設定
  - 黒: `CMYK(0, 0, 0, 100)`
- 裏面あり: **表面・裏面を1ファイル2ページ**で出力（プレビューの表示面選択に関係なく常に両面）
- ファイル名: `marksheet_{portrait|landscape}_{ピッチ名}.pdf`

---

## 15. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値(4.23mm)未満です |
| 横型受験番号欄の数字9行が外枠外 | 受験番号欄の数字9行が外枠外にはみ出します |
| 表面＋裏面の総収容数 < 問題数 | マークがはみ出ています |

警告は**PDF出力ボタンの上**に表示。

---

## 16. UIパラメータ一覧

### 常時表示

| UIラベル | パラメータ | 初期値 | 備考 |
|---|---|---|---|
| 向き | orientation | 縦型 | 縦型 / 横型 |
| TM配置方式 | tmType | 制御型 | 制御型 / 直下型 |
| 裏面 | hasBack | なし | なし / あり |
| 表示面 | side | 表面 | 裏面ありのとき表示 |
| ピッチ | pitchName | 0.25 | ピッチマスター参照 |
| TM間隔 (mm) | tmInterval | 4.23 | 最小値4.23mm |
| 桁数 | examDigits | 5 | 受験番号の桁数 |
| 問題数 | questionCount | 50 | |
| 選択肢数 | choiceCount | 5 | |
| MB長辺 (mm) | mbLong | 4 | ユーザー変更可能 |
| MB短辺 (mm) | mbShort | 2 | ユーザー変更可能 |

### 詳細設定（アコーディオン・デフォルト閉）

| UIラベル | パラメータ | 初期値 | 備考 |
|---|---|---|---|
| MBインターバル | skipMB | 2 | 縦型・横型ともに有効 |
| MB最大 | maxRowsL | ピッチ別 | 縦型・横型ともに有効。ピッチ変更時にデフォルトリセット |
| 解答欄インターバル | columnGapMult | 2 | 縦型=pitch×(N+1)、横型=tmInterval×(N+1) |
| 受験番号インターバル | sectionGapMult | 2 | tmInterval×(N+1) |

### ピッチマスター参照（アコーディオン・デフォルト閉）

ピッチ別の固定値（pitch, firstX, maxMB）と計算済み値を表示。

---

## 17. 固定値（変更不可）

| パラメータ | 値 | 説明 |
|---|---|---|
| enStart | `9 + tmS×1.5 + MB_SHORT/2` mm | along方向の開始位置 |
| MARGIN | 9mm | 外枠端からTM/MB端までの距離 |
| PAD | 2mm | MBの端から枠線まで |
| FS_QLABEL | 3mm | 問題番号ラベルフォントサイズ（固定） |
| QLABEL_OFFSET | pitch / 2 mm | 問題番号ラベルのMBからの距離 |
| 横型 ansStartY | `outer.y2 - firstX - (maxRowsL-1)×pitch` | 第maxRowsL番MB位置（固定） |

---

## 18. 未実装・今後の課題

- [ ] along方向のオーバーフロー検知の精緻化
- [ ] うら面のレイアウト検証
- [ ] GitHub push
