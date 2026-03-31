# マークシート生成ツール 仕様書

**対象機器:** セコニック SR-3500  
**出力:** B4アートボード上にA4中央配置のプレビュー（Canvas描画）  
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

```
縦型イメージ:
  TM ─── MB  MB  MB  MB  MB  →（pitch間隔・perp方向）
  ↓tmInterval間隔
  TM ─── MB  MB  MB  MB  MB
  ↓
  ...

横型イメージ:
  MB  MB  MB  →（tmInterval間隔・along方向）
  MB  MB  MB
  ↓pitch間隔（perp方向）
  MB  MB  MB
  TM  TM  TM  →
```

---

## 3. 座標系

- 原点はA4外枠の**左上隅**（outer.x1=0, outer.y1=0）
- **Web座標系**を採用：右方向がx増加、**下方向がy増加**
- 「上↑」はy減少方向を意味する

---

## 4. 用紙・アートボードサイズ

| 種別 | 幅(mm) | 高さ(mm) |
|---|---|---|
| 縦型A4（外枠） | 210 | 297 |
| 横型A4（外枠） | 297 | 210 |
| 縦型B4（アートボード） | 257 | 364 |
| 横型B4（アートボード） | 364 | 257 |

A4外枠はB4アートボードの中央に配置する。オフセット＝(B4－A4)÷2。

| | x方向オフセット(mm) | y方向オフセット(mm) |
|---|---|---|
| 縦型 | (257－210)÷2 ＝ 23.5 | (364－297)÷2 ＝ 33.5 |
| 横型 | (364－297)÷2 ＝ 33.5 | (257－210)÷2 ＝ 23.5 |

---

## 5. ピッチマスター

スキャナーの読み取り仕様に基づく固定パラメータ。ユーザーは変更不可。

| ピッチ名 | pitch(mm) | firstX(mm) | maxMB | tmS(mm) | tmL(mm) | tmPos(mm) |
|---|---|---|---|---|---|---|
| 0.25 | 6.35 | 6.35 | 33 | 0.89 | 5.9 | -2.0 |
| 1/6 | 4.233 | 11.43 | 48 | 1.27 | 3.81 | 5.085 |
| 0.2 | 5.08 | 11.75 | 40 | 0.89 | 5.9 | -2.0 |
| 0.2s | 5.08 | 12.7 | 40 | 0.89 | 3.81 | 5.095 |
| 0.3 | 7.62 | 14.50 | 27 | 0.89 | 7.0 | -2.0 |
| 0.3F | 7.62 | 17.78 | 24 | 0.5 | 5.08 | 7.62 |

**パラメータの意味:**

- **pitch**: MBが並ぶ方向（perp方向）のMB中心間距離
- **firstX**: 外枠基準辺からMB中心第1番目までの距離（縦型=左辺、横型=下辺）
- **tmS**: TMのalong方向の寸法（短辺）
- **tmL**: TMのperp方向の寸法（長辺）
- **tmPos**: 外枠基準辺からTM端までのオフセット。**負値=外枠の外側**にはみ出す
- **maxMB**: along方向に配置できるMBの最大数

---

## 6. TM・MBのサイズと形状

### 6.1 TM（タイミングマーク）

黒塗りの矩形。向きによって縦長・横長が変わる。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | tmS（短辺） | tmS（短辺） |
| perp方向の寸法 | tmL（長辺） | tmL（長辺） |
| 形状 | 横長の矩形 | 縦長の矩形 |
| 配置辺 | 左辺（外枠外） | 下辺（外枠外） |

### 6.2 MB（マークボックス）

標準サイズ: **長辺4mm × 短辺2mm**（MB_LONG=4, MB_SHORT=2）。塗りなし・マゼンタ線の楕円形。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法 | MB_SHORT = 2mm | MB_SHORT = 2mm |
| perp方向の寸法 | MB_LONG = 4mm | MB_LONG = 4mm |
| 形状 | 横長の楕円 | 縦長の楕円 |

---

## 7. TMとMBの位置関係（SR-3500仕様・変更不可）

スキャナーはTMを検出した後、along方向に `tmS × 1.5` 進んだ位置でMBを読み取る。

```
縦型: MB中心y = TM上端y + tmS × 1.5
横型: MB中心x = TM左端x + tmS × 1.5
```

**TM配置座標:**

```
縦型:
  TM左端x = outer.x1 + tmPos      ※tmPos<0なら外枠外
  TM上端y = alongPos - tmS × 1.5

横型:
  TM左端x = alongPos - tmS × 1.5
  TM上端y = outer.y2 - tmPos - tmL  ※tmPos<0なら外枠外（下）
```

**MB中心の固定座標（perp方向の起点）:**

```
縦型: 第1MBのx = outer.x1 + firstX
横型: 第1MBのy = outer.y2 - firstX
```

TMの最小間隔（along方向）: **4.23mm**

---

## 8. 物理MB番号と論理番号の方向

### 8.1 縦型（逆転なし）

```
outer.x1=0（左辺・TM配置辺）
│
TM─── 第1MB 第2MB 第3MB 第4MB 第5MB ───→ perp（右→・pitch間隔）
│     選択肢1 選択肢2 選択肢3 選択肢4 選択肢5
TM───  （問2）
│
↓ along（下↓）＝問題番号増加方向（tmInterval間隔）
```

### 8.2 横型（問題番号とMB番号が逆方向）

```
outer.y1=0（上辺）
↑
第30MB（問1）─ 選択肢1 選択肢2 選択肢3 ──→ along（右→・tmInterval間隔）
第29MB（問2）─
...
第1MB（問30）─
outer.y2=210mm（下辺・TM配置辺）
TM    TM    TM    ──→
```

横型では**MB番号の増加方向（上↑）と問題番号の増加方向（下↓）が逆転する**。

---

## 9. along方向の両端余白

外枠端からMB/TMの**端**まで **9mm** を確保する（縦型=上下、横型=左右）。

along方向のMBサイズは MB_SHORT = 2mm なので、MB中心への換算:

```
enStart（開始側MB中心） = 9 + MB_SHORT / 2 = 10mm
終端側MB中心の上限     = outer端 - 9 - MB_SHORT / 2 = outer端 - 10mm
```

| | 開始側MB中心 | 終端側MB中心の上限 |
|---|---|---|
| 縦型（上下） | outer.y1 + 10mm | outer.y2 - 10mm |
| 横型（左右） | outer.x1 + 10mm | outer.x2 - 10mm |

**enStart = 10mm** は受験番号欄・解答欄で共通のalong方向開始基準。

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
```

**横型:**

```
選択肢ci（along=右→、tmInterval間隔）:
  MB中心x = colBaseX + ci × tmInterval
  colBaseX = ansStart + colIndex × ((choiceCount-1)×tmInterval + columnGap)

問題番号qi（perp=下↓、pitch間隔）:
  MB中心y = ansStartY + qi × pitch
  ansStartY = outer.y2 - firstX - 29 × pitch（第30MB位置・固定）

1列あたりの最大行数: 30 - skipMB
```

### 10.2 skipMBの効果

| 向き | skipMB=0 | skipMB=2 | skipMB=4 |
|---|---|---|---|
| 縦型 | 第1MBから開始（perp方向） | 第3MBから開始 | 第5MBから開始 |
| 横型 | 第1〜第30MB全使用（30行） | 第3〜第30MB使用（28行） | 第5〜第30MB使用（26行） |

横型は `ansStartY`（第30MB位置）を固定し、`maxRowsPerCol = 30 - skipMB` で行数を制限する。

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
  examTopY = outer.y2 - firstX - 29 × pitch（第30MB位置・固定）
```

---

## 12. ギャップ（間隔）仕様

値=N のとき TM/pitch N個分のインターバルとなる（値=0で間隔なし）。  
ギャップ値はMB中心間距離として計算式に直接加算される。

| パラメータ | 縦型 | 横型 |
|---|---|---|
| 列ギャップ（columnGap） | 値 × **pitch** | 値 × **tmInterval** |
| セクションギャップ（sectionGap） | 値 × **tmInterval** | 値 × **tmInterval** |

**適用箇所:**

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

## 13. テキスト要素

### 13.1 MB内の数値（選択肢番号・受験番号の数字）

| 項目 | 値 |
|---|---|
| 色 | マゼンタ（ドロップアウトカラー） |
| フォント | IBM Plex Mono |
| サイズ | `MB_SHORT × 1.25` をmm→px換算 |
| 配置 | MB中心 |

### 13.2 問題番号ラベル

| 項目 | 値 |
|---|---|
| 色 | マゼンタ |
| フォント | Noto Sans JP |
| サイズ | `MB_SHORT × 1.5` をmm→px換算 |
| 位置 | 選択肢1のMB左端より左側 0.5mm オフセット、右揃え |

### 13.3 桁ラベル

不要。MBのみ描画する。

---

## 14. 枠の描画

受験番号欄・解答欄それぞれにマゼンタの実線矩形を描画する。

| 項目 | 値 |
|---|---|
| 色 | マゼンタ |
| 線種 | 実線 |
| パディング(PAD) | 2mm（MBの端から枠線まで） |

---

## 15. セクション配置

along方向の先頭から「受験番号欄 → 解答欄」の順に固定。

```
縦型: 受験番号欄（y方向）→ sectionGap → 解答欄（y方向）
横型: 受験番号欄（x方向）→ sectionGap → 解答欄（x方向）
```

---

## 16. TM重複排除

`tmAlongPositions`（Set）にalong座標を収集し、一括描画することで同座標のTMを自動排除する。

---

## 17. バリデーション・警告

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値未満 |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄がはみ出す |

---

## 18. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | 説明 |
|---|---|---|
| orientation | 縦型 | シートの向き（縦型 / 横型） |
| pitchName | 0.25 | ピッチ種別（ピッチマスター参照） |
| tmInterval | 4.23mm | TM間隔（along方向）。最小値4.23mm |
| examDigits | 5 | 受験番号の桁数 |
| questionCount | 50 | 問題数 |
| choiceCount | 5 | 選択肢数 |
| skipMB | 2 | MBをいくつぶん空けて開始するか（縦型・横型ともに有効） |
| columnGapMult | 2 | 列ギャップの倍数（縦型=pitch×、横型=tmInterval×） |
| sectionGapMult | 2 | セクションギャップの倍数（縦型・横型ともにtmInterval×） |

**固定値（変更不可）:**

| パラメータ | 値 | 説明 |
|---|---|---|
| enStart | 10mm | along方向の開始位置（外枠端からMB端9mm + MB_SHORT/2） |
| 両端余白(MARGIN) | 9mm | 外枠端からMB/TM端までの距離 |
| 横型 ansStartY | outer.y2 - firstX - 29×pitch | 第30MB位置（問1の上端・固定） |
| 横型 examTopY | ansStartY と同じ | 受験番号欄の上端 |
| 横型 maxRowsPerCol | 30 - skipMB | 1列あたりの最大行数 |
| MB_LONG | 4mm | MBの長辺 |
| MB_SHORT | 2mm | MBの短辺 |
| PAD | 2mm | MBの端から枠線まで |

---

## 19. 座標計算例（ピッチ 0.25、tmInterval=4.23mm、skipMB=2）

### 縦型（outer: x1=0, y1=0, x2=210, y2=297）

```
pitch=6.35mm、firstX=6.35mm、tmS=0.89mm、tmL=5.9mm、tmPos=-2.0mm

enStart = 10mm
TM左端x = 0 + (-2.0) = -2.0mm（外枠外）

受験番号欄:
  数字ri=0のy = 10mm
  数字ri=9のy = 10 + 9×4.23 = 48.07mm
  桁di=0のx = 6.35 + 2×6.35 = 19.05mm（skipMB=2）
  桁di=1のx = 6.35 + 3×6.35 = 25.40mm

解答欄（sectionGapMult=2）:
  sectionGap = 2×4.23 = 8.46mm
  ansStartY = 48.07 + 8.46 = 56.53mm
  下端MB中心の上限 = 297 - 10 = 287mm
  列ギャップ（columnGapMult=2）= 2×6.35 = 12.70mm
  選択肢1 x = 19.05mm、選択肢2 x = 25.40mm
```

### 横型（outer: x1=0, y1=0, x2=297, y2=210）

```
pitch=6.35mm、firstX=6.35mm、tmS=0.89mm、tmL=5.9mm、tmPos=-2.0mm

enStart = 10mm
TM上端y = 210-(-2.0)-5.9 = 206.1mm（外枠外）
ansStartY = 210 - 6.35 - 29×6.35 = 19.50mm（第30MB・固定）
maxRowsPerCol = 30 - 2 = 28行

受験番号欄:
  桁di=0のx = 10mm
  数字ri=0のy = 19.50mm
  数字ri=9のy = 19.50 + 9×6.35 = 76.65mm

解答欄（sectionGapMult=2）:
  sectionGap = 2×4.23 = 8.46mm
  ansStart = examEndX + 8.46mm
  右端MB中心の上限 = 297 - 10 = 287mm
  列ギャップ（columnGapMult=2）= 2×4.23 = 8.46mm
```

---

## 20. 未実装・今後の課題

- [ ] PDF出力機能
- [ ] along方向のオーバーフロー検知（外枠からはみ出す場合の警告）
- [ ] うら面のレイアウト検証
- [ ] GitHub push
