# マークシート生成ツール 仕様書

**対象機器:** セコニック SR-3500  
**出力:** B4アートボード上にA4中央配置のPDF  
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
| 開始オフセット | skipMB | **縦型専用。** perp方向にMBを何個ぶん空けてから開始するか。 |

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

標準サイズ: **長辺4mm × 短辺2mm**。塗りなし・マゼンタ線の楕円形。

| | 縦型 | 横型 |
|---|---|---|
| along方向の寸法（mbS） | 2mm（短辺） | 2mm（短辺） |
| perp方向の寸法（mbL） | 4mm（長辺） | 4mm（長辺） |
| 形状 | 横長の楕円 | 縦長の楕円 |

---

## 7. TMとMBの位置関係（SR-3500仕様・変更不可）

スキャナーはTMを検出した後、along方向に `tmS × 1.5` 進んだ位置でMBを読み取る。

```
縦型: MB中心y = TM上端y + tmS × 1.5    （along=下↓方向にずれる）
横型: MB中心x = TM左端x + tmS × 1.5    （along=右→方向にずれる）
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

TMの最小間隔（along方向、上端から次の上端まで）: **4.23mm**

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
↓ along（下↓）＝TM番号増加方向＝問題番号増加方向（tmInterval間隔）
```

| 要素 | 方向 | 間隔 | 備考 |
|---|---|---|---|
| TM番号 | along（下↓） | tmInterval | 第1TM→第2TM→... |
| 問題番号 | along（下↓） | tmInterval | 問1→問2→... TMと同方向 |
| MB番号 | perp（右→） | pitch | 第1MB→第2MB→... |
| 選択肢番号 | perp（右→） | pitch | 選択肢1→2→... MBと同方向 |

縦型では**すべての番号が同方向で逆転が発生しない**。

### 8.2 横型（問題番号とMB番号が逆方向）

```
outer.y1=0（上辺）
↑
第30MB（問1）─ 選択肢1 選択肢2 選択肢3 ──→ along（右→・tmInterval間隔）
第29MB（問2）─ 選択肢1 選択肢2 選択肢3
...
第2MB（問29）─ 選択肢1 選択肢2 選択肢3
第1MB（問30）─ 選択肢1 選択肢2 選択肢3
outer.y2=210mm（下辺・TM配置辺）
TM    TM    TM    ──→ along（右→）
```

| 要素 | 方向 | 間隔 | 備考 |
|---|---|---|---|
| TM番号 | along（右→） | tmInterval | 第1TM→第2TM→... |
| 選択肢番号 | along（右→） | tmInterval | 選択肢1→2→... TMと同方向 |
| MB番号 | perp（上↑、y減少） | pitch | 第1MB=下辺最寄り |
| 問題番号 | perp（下↓、y増加） | pitch | 問1=上側（第30MB位置） |

横型では**MB番号の増加方向（上↑）と問題番号の増加方向（下↓）が逆転する**。

**座標の対応:**

```
第nMBのy = outer.y2 - firstX - (n-1) × pitch   （上↑、y減少）
問mのy   = ansStartY + (m-1) × pitch             （下↓、y増加）

横型固定値: ansStartY = outer.y2 - firstX - 29 × pitch（第30MB位置）
```

---

## 9. 解答欄レイアウト

### 9.1 座標計算

**縦型:**

```
問題番号qi（along=下↓、tmInterval間隔）:
  MB中心y = ansStartY + qi × tmInterval

選択肢ci（perp=右→、pitch間隔）:
  MB中心x = colBaseX + ci × pitch
  colBaseX = outer.x1 + firstX + skipMB×pitch + colIndex×(choiceCount×pitch + columnGap)

列折返し: colBaseXをperp（右→）方向に増加
```

**横型:**

```
選択肢ci（along=右→、tmInterval間隔）:
  MB中心x = colBaseX + ci × tmInterval
  colBaseX = ansStart + colIndex × choiceCount × tmInterval

問題番号qi（perp=下↓、pitch間隔）:
  MB中心y = ansStartY + qi × pitch
  ansStartY = outer.y2 - firstX - 29 × pitch（第30MB位置・固定）

列折返し: colBaseXをalong（右→）方向に増加
```

### 9.2 ユーザー設定

| パラメータ | 初期値 | 説明 |
|---|---|---|
| questionCount | 50 | 問題数 |
| choiceCount | 5 | 選択肢数 |
| skipMB | 2 | 【縦型専用】perp方向にMBいくつぶん空けて開始するか |
| columnGap | pitch × 2 | 列折返し時の間隔 |
| sectionGap | pitch × 2 | 受験番号欄と解答欄の間隔 |

---

## 10. 受験番号欄レイアウト

### 10.1 縦型

```
数字0〜9（along=下↓、tmInterval間隔）:
  MB中心y = enStart + ri × tmInterval    （ri=0〜9、0が上・9が下）

桁（perp=右→、pitch間隔）:
  MB中心x = outer.x1 + firstX + (skipMB + di) × pitch    （di=0〜examDigits-1）
```

### 10.2 横型

```
桁（along=右→、tmInterval間隔）:
  MB中心x = enStart + di × tmInterval    （di=0〜examDigits-1）

数字0〜9（perp=下↓、pitch間隔）:
  MB中心y = examTopY + ri × pitch    （ri=0〜9、0が上・9が下）
  examTopY = outer.y2 - firstX - 29 × pitch（第30MB位置・解答欄と同じ・固定）
```

### 10.3 ユーザー設定

| パラメータ | 初期値 | 説明 |
|---|---|---|
| examDigits | 5 | 受験番号の桁数 |
| enStart | firstX + tmInterval × 3 | 受験番号欄の先頭TM位置（along方向の第4TM） |

> **enStartについて:** SR-3500では第1TMは通常使用しない慣習がある。また第2・第3TM付近は印字領域として確保することを考慮し、デフォルトは第4TM（index=3）とする。

---

## 11. テキスト要素

### 11.1 MB内の数値（選択肢番号・受験番号の数字）

各MBの内部中央に数値を印字する。

| 項目 | 値 |
|---|---|
| 色 | マゼンタ（ドロップアウトカラー） |
| サイズ | MBの短辺に合わせたサイズ × 2 |
| 目的 | スキャナーにはドロップアウトされ、受験者の視認のみに使用 |

### 11.2 問題番号

各問の選択肢1のMB左側に横書きで表示。

| 項目 | 値 |
|---|---|
| 色 | マゼンタ |
| サイズ | MB内テキストと同等 |
| 位置 | 選択肢1のMB左端から左側 |

### 11.3 桁ラベル（百位・十位…）

**不要。** MBのみ描画する。

---

## 12. 枠の描画

受験番号欄・解答欄それぞれにマゼンタの実線矩形を描画する。

| 項目 | 値 |
|---|---|
| 色 | マゼンタ |
| 線種 | 実線 |
| パディング | 2mm（MBの端から枠線まで） |

---

## 13. セクション配置

along方向の先頭から「受験番号欄 → 解答欄」の順に固定。

**受験番号欄と解答欄の間隔:** `sectionGap = pitch × sectionGapMult`

**重なり防止チェック:**

```
縦型: 受験番号欄終端y < 解答欄開始y
横型: 受験番号欄終端x < 解答欄開始x
```

---

## 14. TM重複排除

受験番号欄と解答欄の境界付近でTMが重なる場合、along方向の座標が同じTMは1個のみ描画する。

---

## 15. バリデーション・警告

以下の条件に該当する場合、計算結果エリアに警告を表示する（PDF生成は行わない）。

| 条件 | 警告内容 |
|---|---|
| tmInterval < 4.23mm | TM間隔が最小値未満 |
| 横型受験番号欄の数字9が外枠外 | 受験番号欄がはみ出す |
| 受験番号欄と解答欄が重なる | セクションが重複 |

---

## 16. ユーザー入力パラメータ一覧

| パラメータ | 初期値 | 対象 | 説明 |
|---|---|---|---|
| orientation | 縦型 | 両方 | シートの向き（縦型 / 横型） |
| pitchName | 0.25 | 両方 | ピッチ種別（ピッチマスター参照） |
| examDigits | 5 | 両方 | 受験番号の桁数 |
| questionCount | 50 | 両方 | 問題数 |
| choiceCount | 5 | 両方 | 選択肢数 |
| tmInterval | 4.23mm | 両方 | TM間隔（along方向）。最小値4.23mm |
| skipMB | 2 | **縦型のみ** | perp方向にMBいくつぶん空けて開始するか |
| columnGap | pitch × 2 | 両方 | 解答欄の列折返し間隔（pitch倍数で指定） |
| sectionGapMult | 2 | 両方 | 受験番号欄〜解答欄の間隔（pitch倍数で指定） |

**固定値（変更不可）:**

| パラメータ | 値 | 説明 |
|---|---|---|
| 横型 解答欄開始MB | 第30MB | `ansStartY = outer.y2 - firstX - 29×pitch` |
| 横型 受験番号欄開始MB | 第30MB | 解答欄と同じ位置 |
| enStart | firstX + tmInterval × 3 | along方向の第4TM位置 |

---

## 17. 座標計算例（ピッチ 0.25、tmInterval=4.23mm）

### 縦型（outer: x1=0, y1=0, x2=210, y2=297、skipMB=2）

```
pitch=6.35mm、firstX=6.35mm、tmS=0.89mm、tmL=5.9mm、tmPos=-2.0mm

TM左端x（固定） = 0 + (-2.0) = -2.0mm  ※外枠左辺より2mm外側
第1MBのx       = 0 + 6.35 = 6.35mm
enStart         = 6.35 + 4.23×3 = 19.04mm（along方向・第4TM位置）

受験番号欄:
  桁di=0のx = 6.35 + (2+0)×6.35 = 19.05mm（perp・skipMB=2個空け）
  桁di=1のx = 6.35 + (2+1)×6.35 = 25.40mm
  数字ri=0のy = 19.04mm（along・tmInterval間隔）
  数字ri=1のy = 19.04 + 4.23 = 23.27mm

解答欄:
  ansStartY = 19.04 + 9×4.23 + 6.35×2 = 72.81mm（examEnd + sectionGap）
  問1 y = 72.81mm、問2 y = 72.81 + 4.23 = 77.04mm（along）
  選択肢1 x = 19.05mm、選択肢2 x = 19.05 + 6.35 = 25.40mm（perp）
```

### 横型（outer: x1=0, y1=0, x2=297, y2=210）

```
pitch=6.35mm、firstX=6.35mm、tmS=0.89mm、tmL=5.9mm、tmPos=-2.0mm

TM上端y（固定） = 210 - (-2.0) - 5.9 = 206.1mm  ※外枠下辺より2mm外側
第1MBのy       = 210 - 6.35 = 203.65mm（下辺最寄り）
第30MBのy      = 210 - 6.35 - 29×6.35 = 19.50mm（開始位置・固定）
enStart         = 6.35 + 4.23×3 = 19.04mm（along方向・第4TM位置）

受験番号欄:
  examTopY = 19.50mm（第30MB位置、解答欄と同じ）
  桁di=0のx = 19.04mm（along=tmInterval）
  桁di=1のx = 19.04 + 4.23 = 23.27mm
  数字ri=0のy = 19.50mm（perp=pitch）
  数字ri=9のy = 19.50 + 9×6.35 = 76.65mm

解答欄:
  ansStartY = 19.50mm（第30MB固定）
  問1 y = 19.50mm、問2 y = 19.50 + 6.35 = 25.85mm（perp=pitch）
  選択肢1 x = ansStart、選択肢2 x = ansStart + 4.23mm（along=tmInterval）
```

---

## 18. 未実装・今後の課題

- [ ] PDF出力機能
- [ ] along方向のオーバーフロー検知（外枠からはみ出す場合の警告）
- [ ] うら面のレイアウト検証
- [ ] GitHub push
