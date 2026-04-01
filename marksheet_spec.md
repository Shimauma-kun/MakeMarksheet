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
| perp方向 | perp | along方向と直交する方向。縦型＝右→（x増加）、横型＝上↑（y減少）。 |
| 外枠 | outer | A4サイズの印刷領域枠（マージンなし）。座標計算の基準。 |
| 物理MB番号 | - | スキャナー基準のMB番号。TM配置辺（基準辺）に最も近いMBが第1MB。 |
| 論理問題番号 | - | 受験者が読む問題の順番。シートの上側または左側から問1となる。 |
| 開始オフセット | skipMB | MBを何個ぶん空けてから開始するか。縦型・横型ともに有効。 |

---

## 2. pitchとtmIntervalの違い

**pitchとtmIntervalは互いに直交する方向の間隔であり、独立して設定する。**

| | 縦型 | 横型 |
|---|---|---|
| tmInterval（TM間隔） | along（下↓）方向 | along（右→）方向 |
| pitch（MB間隔） | perp（右→）方向 | perp（下↓）方向 |

---

## 3. 座標系

- 原点はA4外枠の**左上隅**（outer.x1=0, outer.y1=0）
- **Web座標系**を採用：右方向がx増加、**下方向がy増加**

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
- **firstX**: 外枠基準辺からMB中心第1番目までの距離（縦型=左辺、横型=下辺）
- **tmS**: TMのalong方向の寸法（短辺）
- **tmL**: TMのperp方向の寸法（長辺）
- **tmPos**: 外枠基準辺からTM端までのオフセット。**負値=外枠の外側**にはみ出す
- **maxMB**: along方向に配置できるMBの最大数
- **maxRowsL**: 横型におけるperp方向の最大行数（ピッチ別デフォルト値。ユーザー変更可）

---

## 6. TM・MBのサイズと形状

### 6.1 TM（タイミングマーク）

黒塗りの矩形（K100%）。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | tmS（短辺） | tmS（短辺） |
| perp方向の寸法 | tmL（長辺） | tmL（長辺） |
| 形状 | 横長の矩形 | 縦長の矩形 |
| 配置辺 | 左辺（外枠外） | 下辺（外枠外） |

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
縦型: TM左端x = outer.x1 + tmPos   ※tmPos<0なら外枠外
横型: TM上端y = outer.y2 - tmPos - tmL   ※tmPos<0なら外枠外（下）
```

---

## 8. along方向の両端余白

外枠端からTM/MBの**端**まで **9mm** を確保する（縦型=上下、横型=左右）。

```
enStart（開始側MB中心） = 9 + tmS × 1.5 + MB_SHORT / 2
  ※制御型の場合: TMの上端/左端 = enStart - tmS×1.5 = 9mm（外枠端からちょうど9mm）

終端側MB中心の上限 = outer端 - 9 - tmS × 1.5 - MB_SHORT / 2
```

---

## 9. 物理MB番号と論理番号の方向

### 9.1 縦型（逆転なし）

```
outer.x1=0（左辺・TM配置辺）
│
TM─── 第1MB 第2MB 第3MB ... ───→ perp（右→・pitch間隔）
TM─── （問2）
↓ along（下↓）＝問題番号増加方向（tmInterval間隔）
```

### 9.2 横型（問題番号とMB番号が逆方向）

```
outer.y1=0（上辺）
第maxRowsL番MB（問1）─ 選択肢1 選択肢2 ... ──→ along（右→・tmInterval間隔）
...
第1MB（問maxRowsL）─
outer.y2（下辺・TM配置辺）
TM    TM    TM    ──→
```

横型では**MB番号の増加方向（上↑）と問題番号の増加方向（下↓）が逆転する**。

---

## 10. 解答欄レイアウト

### 10.1 座標計算

**縦型:**

```
問題番号qi（along=下↓、tmInterval間隔）:
  MB中心y = ansStartY + qi × tmInterval

選択肢ci（perp=右→、pitch間隔）:
  MB中心x = colBaseX + ci × pitch
  colBaseX = outer.x1 + firstX + skipMB×pitch
             + colIndex × ((choiceCount-1)×pitch + columnGap)

終端制限: MB中心y ≤ outer.y2 - 9 - tmS×1.5 - MB_SHORT/2
```

**横型:**

```
選択肢ci（along=右→、tmInterval間隔）:
  MB中心x = colBaseX + ci × tmInterval
  colBaseX = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)

問題番号qi（perp=下↓、pitch間隔）:
  MB中心y = ansStartY + qi × pitch
  ansStartY = outer.y2 - firstX - (maxRowsL-1) × pitch（第maxRowsL番MB・固定）

終端制限: MB中心x ≤ outer.x2 - 9 - tmS×1.5 - MB_SHORT/2
1列あたりの最大行数: maxRowsL - skipMB
```

### 10.2 skipMBの効果

| 向き | skipMB=0 | skipMB=2 | skipMB=N |
|---|---|---|---|
| 縦型 | 第1MBから開始（perp方向） | 第3MBから開始 | 第(N+1)MBから開始 |
| 横型 | 第1〜第maxRowsL番MB全使用 | 第3〜第maxRowsL番MB使用 | 第(N+1)〜第maxRowsL番MB使用 |

---

## 11. 受験番号欄レイアウト

### 11.1 縦型

```
数字0〜9（along=下↓、tmInterval間隔）:
  MB中心y = enStart + ri × tmInterval    （ri=0〜9）

桁（perp=右→、pitch間隔）:
  MB中心x = outer.x1 + firstX + (skipMB + di) × pitch    （di=0〜examDigits-1）
```

### 11.2 横型

```
桁（along=右→、tmInterval間隔）:
  MB中心x = enStart + di × tmInterval    （di=0〜examDigits-1）

数字0〜9（perp=下↓、pitch間隔）:
  MB中心y = examTopY + ri × pitch    （ri=0〜9）
  examTopY = outer.y2 - firstX - (maxRowsL-1) × pitch（第maxRowsL番MB・固定）
```

---

## 12. ギャップ（間隔）仕様

値=N のとき TM/pitch N個分のインターバル（値=0で間隔なし）。

| パラメータ | 縦型 | 横型 |
|---|---|---|
| 列ギャップ（columnGap） | 値 × **pitch** | 値 × **tmInterval** |
| セクションギャップ（sectionGap） | 値 × **tmInterval** | 値 × **tmInterval** |

```
縦型:
  sectionGap = sectionGapMult × tmInterval
  columnGap  = columnGapMult  × pitch
  ansStartY  = enEndY + sectionGap
  colBaseX   = baseX + colIndex × ((choiceCount-1)×pitch + columnGap)

横型:
  sectionGap = sectionGapMult × tmInterval
  columnGap  = columnGapMult  × tmInterval
  ansStart   = examEndX + sectionGap
  colBaseX   = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)
```

---

## 13. 描画仕様

### 13.1 色

| オブジェクト | Canvas | PDF（CMYK） |
|---|---|---|
| TM | #000000 | CMYK(0, 0, 0, 100) |
| MB（線） | #ff00ff | CMYK(0, 100, 0, 0) |
| MB内数字 | #ff00ff | CMYK(0, 100, 0, 0) |
| 問題番号ラベル | #ff00ff | CMYK(0, 100, 0, 0) |
| A4外枠（線） | #ff00ff | CMYK(0, 100, 0, 0) |
| 枠線（受験番号欄・解答欄） | #ff00ff | CMYK(0, 100, 0, 0) |

### 13.2 線幅・フォント

| オブジェクト | 線幅 / サイズ |
|---|---|
| A4外枠 | 0.4pt |
| MB（楕円） | 0.6pt・塗りなし |
| MB内数字 | 7pt・MSゴシック |
| 問題番号ラベル | MB_SHORT × 1.5mm・Noto Sans JP |
| 枠（受験番号欄・解答欄） | 0.4pt・パディング2mm |

---

## 14. TM重複排除

`tmAlongPositions`（Set）にalong座標を収集し、一括描画することで同座標のTMを自動排除する。

---

## 15. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値未満 |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄がはみ出す |

---

## 16. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | 説明 |
|---|---|---|
| orientation | 縦型 | シートの向き（縦型 / 横型） |
| tmType | 制御型 | TM配置方式（制御型 / 直下型） |
| pitchName | 0.25 | ピッチ種別（ピッチマスター参照） |
| tmInterval | 4.23mm | TM間隔（along方向）。最小値4.23mm |
| examDigits | 5 | 受験番号の桁数 |
| questionCount | 50 | 問題数 |
| choiceCount | 5 | 選択肢数 |
| mbLong | 4mm | MB長辺（変更可） |
| mbShort | 2mm | MB短辺（変更可） |
| skipMB | 2 | MBをいくつぶん空けて開始するか |
| columnGapMult | 2 | 列ギャップの倍数（縦型=pitch×、横型=tmInterval×） |
| sectionGapMult | 2 | セクションギャップの倍数（tmInterval×） |
| maxRowsL | ピッチ別 | 横型の最大行数（ピッチ変更時にデフォルト値へリセット。横型時のみUI表示） |

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
| enStart | `9 + tmS×1.5 + MB_SHORT/2` | along方向の開始MB中心 |
| MARGIN | 9mm | 外枠端からTM/MB端までの距離 |
| 横型 ansStartY | `outer.y2 - firstX - (maxRowsL-1)×pitch` | 第maxRowsL番MB位置 |
| PAD | 2mm | MBの端から枠線まで |

---

## 17. PDF出力仕様

- ライブラリ: jsPDF（クライアントサイド）
- 用紙サイズ: B4（アートボードサイズ）
- 単位: mm
- カラー: CMYK（マゼンタ=CMYK(0,100,0,0)、黒=CMYK(0,0,0,100)）
- ファイル名: `marksheet_{orientation}_{pitchName}.pdf`
- 描画ロジック: Canvas・PDF共通の `drawLayout(api)` 関数で統一

---

## 18. 未実装・今後の課題

- [ ] along方向のオーバーフロー検知（外枠からはみ出す場合の警告）
- [ ] うら面のレイアウト検証
- [ ] GitHub push
