var sel_objs = documents[0].selection
var path_objs,MB_obj=[],arr_SampleMB_Group=[],arr_Sotowaku=[]
var doc = app.documents[0];
var i,j,err_MB_cnt_ALL,ID_Skew_cnt,chk_MB_cnt_ALL,x_diff,y_diff,ngFlg,kagi_MB_num=0
var MB_size_chouhen_kagi = 4   // かぎ型MB長辺
var MB_size_tanpen_kagi  = 2   // かぎ型MB短辺
var flg_kagi_other = 1         // カギ型以外を使うか（1=使う）
var ptkansan = 25.4 / 72 
var mm=1 / ptkansan
var TateYokoFlg=0;//0が縦
var ID_size_height=1
var ID_size_width=3.5

//許容範囲の初期値
var Tolerance = 0.001 //誤差の許容範囲(mm)
var Tolerance_waku_posi = 0.001   //アートボードと外枠の位置のズレの許容範囲
var Tolerance_MB_size = 0.002 //MBのサイズの誤差（この誤差のものはMBとして含める）

//マークサイズ（縦）（mm）
var MB_size_chouhen=4
//マークサイズ（横）（mm）
var MB_size_tanpen=2
//ピッチ（mm）
var pitch=6.35
//最大MB数
var MB_max=32
//第1MBの位置（mm）
var MB_first_x_position=6.35
//制御の場合付加する値
var MB_Control_add=1.335
//制御/直下/マーク間（0:制御、1:直下、2:マーク間、3:0.3F）
var MB_Control=0
//表裏のフラグ（0=表）
var flg_panelHyouri=0


//MBの形（0=カギ以外、1=カギ型）
var flg_kagi =0

// カギ型以外のMB数
var kagi_other_MB_num = 0

//TMチェック分
var sitei_size_a,sitei_size_b; //TM: a：短辺、b：長辺
var size_tate,size_yoko;
var TM_position=-2;
var facomFlg=0;//1がfacom型
var facomTmKankaku=3.43;
var TMkankaku=4.23;
var const_kyori = "間隔",const_size = "サイズ",const_position = "位置";
var const_OK = "【ＯＫ】",const_NG = "【ＮＧ】";

//アートボードのセンター取得
app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;   //ドキュメント単位での座標
var abRect = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect
var abRectX = Math.abs(((abRect[0] + abRect[2]) / 2))
var abRectY = Math.abs(((abRect[1] + abRect[3]) / 2))

app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
// app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;

//ダイアログ設定
var dialog = new Window("dialog","スケールチェック",[100,100,630,850],{closeButton:true,resizable:true}); // -> [^FootNote1]

dialog.panelHyouri = dialog.add('panel', {x:20, y:20, width:190, height:110}, "", {borderStyle:"inset"});
dialog.panelHyouri.add("statictext",{x:5, y:5, width:150, height:20},"【おもて／うらを選択】");
dialog.panelHyouri.omote = dialog.panelHyouri.add('radiobutton',{x:20, y:40, width:80, height:20},'おもて');
dialog.panelHyouri.ura = dialog.panelHyouri.add('radiobutton',{x:100, y:40, width:80, height:20},'うら');


dialog.panelPitch = dialog.add('panel', {x:220, y:20, width:290, height:110}, "", {borderStyle:"inset"});
dialog.panelPitch.add("statictext",{x:5, y:5, width:140, height:20},"【ピッチを選択】");
dialog.panelPitch.a = dialog.panelPitch.add('radiobutton',{x:20, y:40, width:60, height:20},'1/6');
dialog.panelPitch.b = dialog.panelPitch.add('radiobutton',{x:80, y:40, width:60, height:20},'0.2');
dialog.panelPitch.c = dialog.panelPitch.add('radiobutton',{x:140, y:40, width:60, height:20},'0.25');
dialog.panelPitch.d = dialog.panelPitch.add('radiobutton',{x:200, y:40, width:60, height:20},'0.3');
dialog.panelPitch.e = dialog.panelPitch.add('radiobutton',{x:20, y:70, width:60, height:20},'0.2s');
dialog.panelPitch.f = dialog.panelPitch.add('radiobutton',{x:80, y:70, width:60, height:20},'0.3F');

dialog.panelControl = dialog.add('panel', {x:20, y:140, width:260, height:80}, "", {borderStyle:"inset"});
dialog.panelControl.add("statictext",{x:5, y:5, width:140, height:20},"【制御／直下を選択】");
dialog.panelControl.seigyo = dialog.panelControl.add('radiobutton',{x:20, y:40, width:80, height:20},'制御');
dialog.panelControl.chokka = dialog.panelControl.add('radiobutton',{x:90, y:40, width:80, height:20},'直下');
dialog.panelControl.markkan = dialog.panelControl.add('radiobutton',{x:155, y:40, width:100, height:20},'マーク間');

dialog.panelMBform = dialog.add('panel', {x:290, y:140, width:220, height:80}, "", {borderStyle:"inset"});
dialog.panelMBform.add("statictext",{x:5, y:5, width:130, height:20},"【ＭＢの形】");
dialog.panelMBform.other = dialog.panelMBform.add('checkbox',{x:20, y:40, width:100, height:20},'カギ型以外');
dialog.panelMBform.kagi  = dialog.panelMBform.add('checkbox',{x:120, y:40, width:60, height:20},'カギ型');

dialog.panelMBSize = dialog.add('panel', {x:20, y:230, width:240, height:130}, "", {borderStyle:"inset"});
dialog.panelMBSize.add("statictext",{x:5, y:5, width:200, height:20},"【カギ型以外のＭＢサイズ】");
dialog.panelMBSize.add("statictext",{x:20, y:40, width:120, height:20},"ＭＢ短辺の値(mm):");
dialog.panelMBSize.tate = dialog.panelMBSize.add('edittext',{x:160, y:40, width:60, height:20},"2");
dialog.panelMBSize.add("statictext",{x:20, y:80, width:120, height:20},"ＭＢ長辺の値(mm):");
dialog.panelMBSize.yoko = dialog.panelMBSize.add('edittext',{x:160, y:80, width:60, height:20},"4");

dialog.panelMBSizeKagi = dialog.add('panel', {x:270, y:230, width:240, height:130}, "", {borderStyle:"inset"});
dialog.panelMBSizeKagi.add("statictext",{x:5, y:5, width:200, height:20},"【かぎ型のＭＢサイズ】");
dialog.panelMBSizeKagi.add("statictext",{x:20, y:40, width:120, height:20},"ＭＢ短辺の値(mm):");
dialog.panelMBSizeKagi.tate = dialog.panelMBSizeKagi.add('edittext',{x:160, y:40, width:60, height:20},"2");
dialog.panelMBSizeKagi.add("statictext",{x:20, y:80, width:120, height:20},"ＭＢ長辺の値(mm):");
dialog.panelMBSizeKagi.yoko = dialog.panelMBSizeKagi.add('edittext',{x:160, y:80, width:60, height:20},"4");

dialog.paneKyoyoHani = dialog.add('panel', {x:20, y:370, width:490, height:140}, "", {borderStyle:"inset"});
dialog.paneKyoyoHani.add("statictext",{x:5, y:5, width:140, height:20},"【許容範囲】");
dialog.paneKyoyoHani.add("statictext",{x:20, y:35, width:160, height:20},"ピッチ誤差許容範囲(mm):");
dialog.paneKyoyoHani.txt=dialog.paneKyoyoHani.add('edittext',{x:200, y:35, width:60, height:20},Tolerance);    
dialog.paneKyoyoHani.add("statictext",{x:20, y:65, width:180, height:20},"MBサイズ誤差許容範囲(mm):");
dialog.paneKyoyoHani.txt_mbsize=dialog.paneKyoyoHani.add('edittext',{x:200, y:65, width:60, height:20},Tolerance_MB_size);    
dialog.paneKyoyoHani.add("statictext",{x:20, y:95, width:180, height:20},"外枠位置誤差許容範囲(mm):");
dialog.paneKyoyoHani.txt_wakuposi=dialog.paneKyoyoHani.add('edittext',{x:200, y:95, width:60, height:20},Tolerance_waku_posi);    

dialog.markkan_chuui=dialog.add("statictext",{x:20, y:600, width:400, height:70},"※マーク間は、ＴＭで挟まれたＭＢのみ正とします。\r\n※マーク間は、「余分なＴＭチェック」は行いません。");
dialog.facom_chuui=dialog.add("statictext",{x:20, y:600, width:400, height:70},"※FACOMは、「余分なＴＭチェック」は行いません。\r\n※FACOMは、IDサイズを0.5*5.08とします。");

dialog.panelTMDetail = dialog.add('panel', {x:20, y:520, width:490, height:100}, "", {borderStyle:"inset"});
dialog.panelTMDetail.enable = dialog.panelTMDetail.add('checkbox',{x:5, y:5, width:300, height:20},'【ＴＭのサイズ／間隔／位置も詳細チェックする】');

dialog.panelTMDetail.panelSize = dialog.panelTMDetail.add('panel', {x:20, y:28, width:450, height:60}, "", {borderStyle:"inset"});
dialog.panelTMDetail.panelSize.add("statictext",{x:5, y:5, width:150, height:20},"《ＴＭのサイズ、間隔最小値を設定(mm)》");
dialog.panelTMDetail.panelSize.tanpen_lbl = dialog.panelTMDetail.panelSize.add("statictext",{x:20, y:25, width:60, height:20},"短辺:");
dialog.panelTMDetail.panelSize.tanpen = dialog.panelTMDetail.panelSize.add('edittext',{x:70, y:25, width:50, height:20},"0.89");
dialog.panelTMDetail.panelSize.chohen_lbl = dialog.panelTMDetail.panelSize.add("statictext",{x:130, y:25, width:60, height:20},"長辺:");
dialog.panelTMDetail.panelSize.chohen = dialog.panelTMDetail.panelSize.add('edittext',{x:180, y:25, width:50, height:20},"5.9");
dialog.panelTMDetail.panelSize.kankaku_lbl = dialog.panelTMDetail.panelSize.add("statictext",{x:240, y:25, width:60, height:20},"間隔:");
dialog.panelTMDetail.panelSize.kankaku = dialog.panelTMDetail.panelSize.add('edittext',{x:290, y:25, width:50, height:20},"4.23");

dialog.panelTMDetail.enable.onClick = function(){
    dialog.panelTMDetail.panelSize.enabled = dialog.panelTMDetail.enable.value;
}
dialog.panelTMDetail.panelSize.enabled = false;

dialog.bt_ok = dialog.add('button',{x:270, y:700, width:100, height:25},'OK');
dialog.bt_cancel = dialog.add('button',{x:380, y:700, width:100, height:25},'キャンセル');


dialog.panelMBform.enabled = true;
dialog.paneKyoyoHani.txt_mbsize.enabled = true;
dialog.paneKyoyoHani.txt_wakuposi.enabled = true;
dialog.markkan_chuui.visible = false;
dialog.facom_chuui.visible = false;

dialog.panelControl.seigyo.value  = true;
dialog.panelPitch.c.value = true;
dialog.panelHyouri.omote.value  = true;
dialog.panelMBform.other.value = true;   // チェックボックスはvalueでtrue/false
dialog.panelMBform.kagi.value  = false;
dialog.panelMBSizeKagi.enabled = false;  // 初期状態は非活性

dialog.panelPitch.a.onClick =funChange_panelPitch 
dialog.panelPitch.b.onClick =funChange_panelPitch 
dialog.panelPitch.c.onClick =funChange_panelPitch 
dialog.panelPitch.d.onClick =funChange_panelPitch 
dialog.panelPitch.e.onClick =funChange_panelPitch 
dialog.panelPitch.f.onClick =funChange_panelPitch 

//かぎ型以外チェックボックス
dialog.panelMBform.other.onClick = function() {
    dialog.panelMBSize.enabled = dialog.panelMBform.other.value;
}
//かぎ型チェックボックス
dialog.panelMBform.kagi.onClick = function() {
    dialog.panelMBSizeKagi.enabled = dialog.panelMBform.kagi.value;
}

//制御
dialog.panelControl.seigyo.onClick = function() {
    dialog.markkan_chuui.visible = false;
}

//直下
dialog.panelControl.chokka.onClick = function() {
    dialog.markkan_chuui.visible = false;
}

//マーク間
dialog.panelControl.markkan.onClick = function() {
    dialog.markkan_chuui.visible = true;
}


//ＯＫボタン
dialog.bt_ok.onClick = function() {
    dialog.close();        
    Main(dialog)
    redraw();
}
//キャンセルボタン
dialog.bt_cancel.onClick = function() {
  dialog.close();
}
    
dialog.center();
dialog.show();


//////////////メイン処理
function Main(para){
    
    var orig_names = [];

    try {
        var  obj_box
        ID_Skew_cnt=0
        chk_MB_cnt_ALL=0
        
        app.executeMenuCommand("ungroup")
        sel_objs = documents[0].selection

        //パラメータの整理
        funStrage_para(para)

        //マークシートの縦横判定
        for (var i = 0;  i < sel_objs.length && funChange_mm(sel_objs[i].width)<=7; i++) {
        }
        var sotowaku_jun=i

        if (i >= sel_objs.length){
            alert ('【エラー】外枠も選択してください')
            return
        }

        //外枠がアートボードのセンターにいるかのチェック
        funCheckSotowakuPosition()

        if(sel_objs[i].width>sel_objs[i].height){
            TateYokoFlg=1;//横型マークシート
            //IDのサイズ変更
            ID_size_height=3.5
            ID_size_width=1
        }
        else{
            var a = MB_size_chouhen
            var b = MB_size_tanpen
            MB_size_chouhen = b
            MB_size_tanpen = a
            // かぎ型用も同様に入れ替え
            var c = MB_size_chouhen_kagi
            var d = MB_size_tanpen_kagi
            MB_size_chouhen_kagi = d
            MB_size_tanpen_kagi  = c
        }    
        //マークの中央値の算出
        if(MB_Control==0){  //2022/08/12 制御の時のみ
            for (i = 0; i<sel_objs.length; i++) {//TM数分
                if(funChange_mm(sel_objs[i].width)<=7){
                    if (TateYokoFlg==0){
                        MB_Control_add=funChange_mm(sel_objs[i].height)*3/2;
                    }
                    else{
                        MB_Control_add=funChange_mm(sel_objs[i].width)*3/2;
                    }
                    break;
                }
            }
        }
        
        // TMサイズが既定のサイズより大きい場合の注意喚起
        var msg_TMsizecheck = funTMSizeChk(sel_objs); 

        //TMソート処理
        sortByPosition(sel_objs);

        for(var i = 0, iEnd=sel_objs.length; i < iEnd; i++){
            orig_names[i] = sel_objs[i].name;
            sel_objs[i].name = "sel_obj" + (i+1);
        }

        //外枠の左端のx座標を取得[x、y]
        funGetSotowaku()
        var len=(MB_Control==2 || MB_Control==3)? sel_objs.length-1: sel_objs.length;
        //    chk_TM_cnt_ALL=new Array(sel_objs.length)
        chk_TM_cnt_ALL=new Array(len)
        for (var i = 0; i < chk_TM_cnt_ALL.length; i++) { chk_TM_cnt_ALL[i] = 0}

        //select されたTMに対する正しいMBの位置の配列を作成    
        funMakeSampleMB_Group()

        path_objs = activeDocument.pathItems;

        //ai上のMBオブジェクトのグループを作成
        if(flg_kagi_other) funMakeMB_obj()
        if(flg_kagi)       funMakeMB_obj_kagi()

        err_MB_cnt_ALL=0
        
        funMainComparison()

        //※※selectしたobjectの位置をarr_SampleMB_Groupと比較※※
        if((chk_MB_cnt_ALL-ID_Skew_cnt)<=0){
            alert ('【エラー】チェック対象となるＭＢが見つかりませんでした。\r\nＭＢのサイズ等を確認してください。')
        }
        else{
            var msg=""
            if(err_MB_cnt_ALL>0){
                msg = msg+"[スケールチェック]：【ＮＧ】です。\r\n"
            }
            else{
                msg = msg+"[スケールチェック]：【ＯＫ】です。\r\n"
            }
            if(MB_Control!=2 && MB_Control!=3){
                if(!funNotNeedTM()){
                    msg = msg+"注意：余分なＴＭがあります。\r\n"
                }
            }

            // TMサイズが既定のサイズより大きい場合の注意喚起
            msg = msg + msg_TMsizecheck

            //テキストエリア色チェック
            var txtareachk_msg=funTxtAreaColorChk()
            if(txtareachk_msg!=""){
                msg = msg+"\r\n\r\n"+txtareachk_msg
            }
            
            msg = msg + "チェックオブジェクト数："+ (chk_MB_cnt_ALL) + "（うちスキュー & ＩＤ：" + ID_Skew_cnt + "）"

            //TMサイズ＆間隔チェック
            if(para.panelTMDetail.enable.value){
                msg = msg + "\r\n" + funCheckTMDetail(para)
            }

            //errメッセージ出力
            alert (msg)
        }
    } catch(e) {
        alert('【エラー】\r\n' + e.message + '\r\n(行:' + e.line + ')'
            + '\r\n--- デバッグ情報 ---'
            + '\r\ni = ' + i
            + '\r\nMB_obj[i] = ' + (MB_obj[i] ? MB_obj[i].join(",") : 'undefined')
            + '\r\nkagi_other_MB_num = ' + kagi_other_MB_num
            + '\r\nkagi_MB_num = ' + kagi_MB_num
            + '\r\ndoc.groupItems.length = ' + doc.groupItems.length
            + '\r\nMB_obj.length = ' + MB_obj.length)
    } finally {
        // 名前を付けた分だけ戻す（orig_names.lengthが0なら何もしない）
        for (var k = 0; k < orig_names.length; k++) {
            sel_objs[k].name = orig_names[k];
        }
    }
}


//////////////サブ処理系
// TMサイズが既定のサイズより大きい場合の注意喚起
function funTMSizeChk(sel_objs){

	var flg=false
    var TM_tanpen = 0
    var TM = MB_Control==0? 0.89 : 1;
    for (i = 0; i<sel_objs.length; i++) {//TM数分
        if(funChange_mm(sel_objs[i].width)<=7){
            if (TateYokoFlg==0){
                TM_tanpen=funChange_mm(sel_objs[i].height)
            }
            else{
                TM_tanpen=funChange_mm(sel_objs[i].width)
            }
            break;
        }
    }
    if(TM < TM_tanpen){
        return("注意：TMサイズが" + TM + "mm以上です。(" + TM_tanpen +"mm)\r\n　　   ＴＭ同士の距離の確保に十分注意してください。")
	}
	else{
		return("")
	}
}


// テキストエリア色チェック
function funTxtAreaColorChk(){

	app.executeMenuCommand('deselectall')  //全オブジェクト選択解除
	var g_actDoc = activeDocument.layers
	const nameTextFrame="TextFrame"
	var layerObj,flg=false
	for (var i = 0; i < g_actDoc.length; i++) {
		layerObj=g_actDoc[i]
		for (var j = 0; j < layerObj.pageItems.length; j++){
			if(layerObj.pageItems[j].typename==nameTextFrame){
				if(layerObj.pageItems[j].kind==TextType.AREATEXT){
					if(layerObj.pageItems[j].textPath.filled){
						flg=true
						layerObj.pageItems[j].selected=true
					}
				}
			}
		}
	}
	if(flg){
		return("注意：塗り有りのテキストエリアがあります。")
	}
	else{
		return("")
	}
}

function sortByPosition(r){
    var hs = [];
    var vs = [];
    for(var i = 0, iEnd = r.length; i < iEnd; i++){
        hs.push(r[i].left);
        vs.push(r[i].top);
    }
    if(rMax(hs) - rMin(hs) > rMax(vs) - rMin(vs)){
        r.sort(function(a,b){ return compPosition(a.left, b.left, b.top, a.top) });
    } else {
        r.sort(function(a,b){ return compPosition(b.top, a.top, a.left, b.left) });
    }
}
function compPosition(a1, b1, a2, b2){
    return a1 == b1 ? a2 - b2 : a1 - b1;
}
function rMax(r){
    return Math.max.apply(null, r);
}
function rMin(r){
    return Math.min.apply(null, r);
}


function funNotNeedTM(){
    var flg=true
    for (i = 0; i < chk_TM_cnt_ALL.length; i++) {
        if(chk_TM_cnt_ALL[i]<=0){
            if(sel_objs[i].filled){
                sel_objs[i].fillColor.black=0
                sel_objs[i].fillColor.cyan=100
                flg=false
            }
        }
    }
    return flg
}

function funMainComparison(){
    for (i = 0; i < MB_obj.length; i++) {
        ngFlg=0
        //サイズ比較
        j = 0
        Comparison_x:while(j <arr_SampleMB_Group.length){
            y_diff=(TateYokoFlg==0)?y_diff=MB_obj[i][1]:y_diff=MB_obj[i][0]
            y_diff = (y_diff>0)?(y_diff-arr_SampleMB_Group[j][1]):(-(y_diff)-arr_SampleMB_Group[j][1])
            y_diff=  (y_diff>0)?y_diff:-(y_diff)
            y_diff=Math.round(y_diff*1000)/1000
            if (y_diff<=Tolerance){
                var k = 0
                Comparison_y:while(k <MB_max){
                    x_diff=(TateYokoFlg==0)?x_diff=MB_obj[i][0]:x_diff=MB_obj[i][1]
                    x_diff = (x_diff>0)?x_diff:-(x_diff)
                    if(TateYokoFlg==0){ //たて
                       x_diff=flg_panelHyouri==0?
                                            x_diff-(parseFloat(arr_SampleMB_Group[j][0])+k*pitch):
                                            x_diff-(parseFloat(arr_SampleMB_Group[j][0])-k*pitch)
                    }
                    else{
                        x_diff=x_diff-(parseFloat(arr_SampleMB_Group[j][0])-k*pitch)
                    }
                    x_diff=  (x_diff>0)?x_diff:-(x_diff)
                    x_diff=Math.round(x_diff*1000)/1000
                    if (x_diff<=Tolerance){
                        ngFlg=1 //見つけた
                        // chk_MB_cnt_ALL++
                        chk_TM_cnt_ALL[arr_SampleMB_Group[j][2]]++
                        break;
                    }
                    else if(x_diff<0){
                        break Comparison_x;
                    }
                k++
                }
            }
            j++
        }
        if(ngFlg==0){
            if(i < kagi_other_MB_num){
                // カギ型以外の処理
                if(path_objs[MB_obj[i][2]].strokeColor.magenta>=50){
                    path_objs[MB_obj[i][2]].strokeColor.magenta=0
                    path_objs[MB_obj[i][2]].strokeColor.cyan=100
                }
                else{
                    if(path_objs[MB_obj[i][2]].fillColor.black>=70){
                        path_objs[MB_obj[i][2]].fillColor.black=0
                        path_objs[MB_obj[i][2]].fillColor.cyan=100
                    }
                }
            }
            else{
                if(i < kagi_MB_num && MB_obj[i][2].pathItems[0].strokeColor.magenta>=50){
                    MB_obj[i][2].pathItems[0].strokeColor.magenta=0
                    MB_obj[i][2].pathItems[0].strokeColor.cyan=100
                    MB_obj[i][2].pathItems[1].strokeColor.magenta=0
                    MB_obj[i][2].pathItems[1].strokeColor.cyan=100
                }
                else{
                    if(path_objs[MB_obj[i][2]].fillColor.black>=70){
                        path_objs[MB_obj[i][2]].fillColor.black=0
                        path_objs[MB_obj[i][2]].fillColor.cyan=100
                    }
                }
            }
            err_MB_cnt_ALL++
        }    
    }
}
//ai上のMBを配列に格納
function funMakeMB_obj(){
    j=0
    var path_len = path_objs.length
    for (i = 0; i < path_len; i++) {
        if((funChange_mm(path_objs[i].width)>7) || (path_objs[i].locked == true) || (path_objs[i].hidden == true)||(path_objs[i].editable==false)){
            continue;
        }
        if((funChkMBColor(path_objs[i]) && funChkMBSize_w(funChange_mm(path_objs[i].width)) && funChkMBSize_h(funChange_mm(path_objs[i].height)))
            || (funChkIDColor(path_objs[i])&& funChkIDSize_w(funChange_mm(path_objs[i].width)) && funChkIDSize_h(funChange_mm(path_objs[i].height))&&path_objs[i].name.indexOf("sel_obj")==-1)
            || (funChkIDColor(path_objs[i]) && funChkMBSize_w(funChange_mm(path_objs[i].width)) && funChkMBSize_h(funChange_mm(path_objs[i].height))&&path_objs[i].name.indexOf("sel_obj")==-1)
            ){
                
            MB_obj[j] = new Array();
            MB_obj[j][0]=funChange_mm(path_objs[i].position[0])+funChange_mm(path_objs[i].width)/2
            MB_obj[j][1]=-(funChange_mm(path_objs[i].position[1]))+funChange_mm(path_objs[i].height)/2
            MB_obj[j][2]=i
            j++
            if(funChkIDColor(path_objs[i])){
                ID_Skew_cnt++
                chk_MB_cnt_ALL++
            }
            else{
                chk_MB_cnt_ALL++
            }
        }
    }
    kagi_other_MB_num = j  // ← この1行を追加
}
//ai上のMBを配列に格納の処理（かぎ型）
function funMakeMB_obj_kagi(){
    // var k=0,mb_top=0,mb_bottom=1,active_obj
    var k=kagi_other_MB_num,mb_top=0,mb_bottom=1,active_obj
    var doc_len =doc.groupItems.length
    for (var i=0; i < doc_len; i++) {
        if(doc.groupItems[i].typename == "GroupItem"){
            var cnt=0
            //オブジェクトの個数が2個になるまでグループの入れ子の中を回す
            if(doc.groupItems[i].pathItems.length==2){
                active_obj=doc.groupItems[i]
                for (var j=0; j < active_obj.pathItems.length; j++) {
                    if(active_obj.pathItems[j].typename == "GroupItem"){
                        break
                    }
                    cnt++
                }
                if((active_obj.pathItems[mb_top].locked == true) || (active_obj.pathItems[mb_top].hidden == true)||(active_obj.pathItems[mb_top].editable==false)){
                    continue;
                }
                if(cnt>0){
                    //どちらが見た目上の上下かを判定する為の値を設定
                    if((TateYokoFlg == 0 && active_obj.pathItems[0].position[0]<active_obj.pathItems[1].position[0])||(TateYokoFlg==1 && active_obj.pathItems[0].position[1]>active_obj.pathItems[1].position[1])){
                        mb_top=0
                        mb_bottom=1
                    }
                    else{
                        mb_top=1
                        mb_bottom=0
                    }
                    if((funChkMBColorKagi(active_obj.pathItems[mb_top],active_obj.pathItems[mb_bottom]) && funChkMBsize_w_kagi(active_obj.pathItems[mb_top].position[0],active_obj.pathItems[mb_bottom].position[0],active_obj.pathItems[mb_top].width,0) && funChkMBsize_h_kagi(active_obj.pathItems[mb_top].position[1],active_obj.pathItems[mb_bottom].position[1],active_obj.pathItems[mb_top].height,0))
                        ){
                        MB_obj[k] = new Array();
                        if (funChkMBsize_w_kagi(active_obj.pathItems[mb_top].position[0],active_obj.pathItems[mb_bottom].position[0],active_obj.pathItems[mb_top].width,0)
                            && funChkMBsize_h_kagi(active_obj.pathItems[mb_top].position[1],active_obj.pathItems[mb_bottom].position[1],active_obj.pathItems[mb_top].height,0)){
                            MB_obj[k][0]=funChange_mm(active_obj.pathItems[mb_top].position[0])+MB_size_tanpen_kagi/2
                            MB_obj[k][1]=-(funChange_mm(active_obj.pathItems[mb_top].position[1]))+MB_size_chouhen_kagi/2
                            chk_MB_cnt_ALL++
                        }
                        MB_obj[k][2]=active_obj  //グループの番号
                        k++
                    }
                }
            }
        }
    }
    kagi_MB_num=k//カギ型の場合のMBの数
    //ID、スキューの格納(ID_Skew_cnt>0の時は、既に格納済み（カギ型以外で）なので処理しない)
    if (ID_Skew_cnt<=0){
        var path_len = path_objs.length
        for (i = 0; i < path_len; i++) {
            if((funChange_mm(path_objs[i].width)>7) || (path_objs[i].locked == true) || (path_objs[i].hidden == true)||(path_objs[i].editable==false)){
                continue;
            }
            if((funChkIDColor(path_objs[i])&& funChkIDSize_w(funChange_mm(path_objs[i].width)) && funChkIDSize_h(funChange_mm(path_objs[i].height)))
                || (funChkIDColor(path_objs[i]) && funChkMBSize_w(funChange_mm(path_objs[i].width)) && funChkMBSize_h(funChange_mm(path_objs[i].height)))
                ){
                    
                MB_obj[k] = new Array();
                MB_obj[k][0]=funChange_mm(path_objs[i].position[0])+funChange_mm(path_objs[i].width)/2
                MB_obj[k][1]=-(funChange_mm(path_objs[i].position[1]))+funChange_mm(path_objs[i].height)/2
                MB_obj[k][2]=i
                k++
                ID_Skew_cnt++
                chk_MB_cnt_ALL++
            }
        }
    }
}

//外枠の座標を取得
function funGetSotowaku(){
    arr_Sotowaku = new Array(1)
    for (i = 0;  i < sel_objs.length && funChange_mm(sel_objs[i].width)<=7; i++) {//外枠のオブジェクトをサーチ
    }
    if(TateYokoFlg==0){
        arr_Sotowaku[0]=
                    (flg_panelHyouri==0)?
                            [funChange_mm(sel_objs[i].position[0]),  -(funChange_mm(sel_objs[i].position[1]))]:
                            [(funChange_mm(sel_objs[i].position[0])+funChange_mm(sel_objs[i].width)),  -(funChange_mm(sel_objs[i].position[1]))]
    }
    else{
        arr_Sotowaku[0]=
                           [funChange_mm(sel_objs[i].position[0]),  -(funChange_mm(sel_objs[i].position[1])-funChange_mm(sel_objs[i].height))]

    }
}

//外枠がアートボードのセンターにいるかのチェック
function funCheckSotowakuPosition(){
    for (i = 0;  i < sel_objs.length && funChange_mm(sel_objs[i].width)<=7; i++) {//外枠のオブジェクトをサーチ
    }
    //アートボードのセンター取得
    app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;   //ドキュメント単位での座標
    var SotowakuRect = sel_objs[i].geometricBounds
    var SotowakuRectX = Math.abs((SotowakuRect[0] + SotowakuRect[2]) / 2)
    var SotowakuRectY = Math.abs((SotowakuRect[1] + SotowakuRect[3]) / 2)
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;   //アートボード内での座標
    var diffX=0
    var diffY=0

    diffX = Math.abs((Math.round((SotowakuRectX - abRectX) * 1000) / 1000))
    diffY = Math.abs((Math.round((SotowakuRectY - abRectY) * 1000) / 1000))
    if (funChange_mm(diffX)>Tolerance_waku_posi || funChange_mm(diffY)>Tolerance_waku_posi){
        alert ('【注意】外枠がセンターに配置されていません\r\nX軸=' + funChange_mm(diffX) + ':  y軸=' + funChange_mm(diffY) +'\r\n（注意喚起のみです。スケールチェック処理を続行します。）')
    }
}
    
//基準となるMBのグループを作成
function funMakeSampleMB_Group(){
    var TM_top,TM2_top,TM_left,TM2_left,TM_width,TM_height

    var j=0

    var len
    
    if(MB_Control==2){
        len = sel_objs.length-1
    }
    else if(MB_Control==3){
        len = sel_objs.length-1
    }
    else{
        len = sel_objs.length
    }

    for (i = 0; i<len; i++) {//TM数分

        if(funChange_mm(sel_objs[i].width)>7){
            chk_TM_cnt_ALL[i]=99
            continue;
        }
        TM_top=funChange_mm(sel_objs[i].position[1])

        if (MB_Control==2) {
            TM2_top=funChange_mm(sel_objs[i+1].position[1])
        }
        else if(MB_Control==3){
            TM2_top=funChange_mm(sel_objs[i+1].position[1])
        }
        else{
            TM2_top=0
        }

        TM_left=funChange_mm(sel_objs[i].position[0])
        
        if (MB_Control==2) {
            TM2_left=funChange_mm(sel_objs[i+1].position[0])
        }
        else if(MB_Control==3){
            TM2_left=funChange_mm(sel_objs[i+1].position[0])
        }
        else{
            TM2_left=0
        }

        TM_width=funChange_mm(sel_objs[i].width)
        TM_height=funChange_mm(sel_objs[i].height)
        arr_SampleMB_Group[j] = new Array();
        if(TateYokoFlg==0){ //たて
            if(MB_Control==0){
                arr_SampleMB_Group[j][1]=-(TM_top)+MB_Control_add
            }
            else if(MB_Control==1){
                arr_SampleMB_Group[j][1]=-(TM_top)+TM_height/2+MB_Control_add
            }
            else{//MB_Control==2 or MB_Control==3
                arr_SampleMB_Group[j][1]=(-(TM_top)+(-(TM2_top)+(TM_height)))/2
            }
            arr_SampleMB_Group[j][0] = [flg_panelHyouri==0?
                                                            arr_Sotowaku[0][0]+MB_first_x_position:
                                                            arr_Sotowaku[0][0]-MB_first_x_position]
            arr_SampleMB_Group[j][2] = i

        }
        else{   //よこ
            if(flg_panelHyouri==0){
                if(MB_Control==0){
                    arr_SampleMB_Group[j][1]=-(-(TM_left)-MB_Control_add)
                }
                else if(MB_Control==1){
                    arr_SampleMB_Group[j][1]=-((-(TM_left)-TM_width/2)-MB_Control_add)
                }
                else{//MB_Control==2 or MB_Control==3
                    arr_SampleMB_Group[j][1]=-((-(TM_left)+(-(TM2_left)-(TM_width)))/2)
                }
            }
            else{
                if(MB_Control==0){
                    arr_SampleMB_Group[j][1]=(TM_left-TM_width*2)+MB_Control_add
                }
                else if(MB_Control==1){
                    arr_SampleMB_Group[j][1]=(TM_left+TM_width/2)+MB_Control_add
                }
                else{//MB_Control==2 or MB_Control==3
                    arr_SampleMB_Group[j][1]=(TM_left+(TM2_left+(TM_width)))/2
                }
    
            }
            arr_SampleMB_Group[j][0] = [arr_Sotowaku[0][1]-MB_first_x_position]
            arr_SampleMB_Group[j][2] = i
        }
        if(MB_Control==3) i++
        j++
    }
}

//MBオブジェクトのソート
function funMB_objSort_tate(a, b) {
	if (a[1] < b[1]) return -1
	if (a[1] > b[1]) return 1
	if (a[0] < b[0]) return -1
	if (a[0] > b[0]) return 1
	return 0
}
function funMB_objSort_yoko(a, b) {
	if (a[0] < b[0]) return -1
	if (a[0] > b[0]) return 1
	if (a[1] < b[1]) return 1
	if (a[1] > b[1]) return -1
	return 0
}

//pt→mm変換
function funChange_mm(p_cngNum)
{
    p_cngNum=Math.round(((p_cngNum)/mm)*1000)/1000
	return p_cngNum
}

//かぎ型のMBのカラーチェック
function funChkMBColorKagi(p_objs0,p_objs1){
    if(funChkMBColor(p_objs0) && funChkMBColor(p_objs1)){
        return true
    }
    else{
        return false
    }
}

//かぎ型のMBのサイズチェック（横）
function funChkMBsize_w_kagi(p_position_0,p_position_1,p_width,id_flg){

    p_position_0=funChange_mm(p_position_0)
    p_position_1=funChange_mm(p_position_1)
    p_width=funChange_mm(p_width)

    var  w_size
    (TateYokoFlg==0)?
        w_size=(p_position_0<=p_position_1)?(p_position_1-p_position_0)+p_width:(p_position_0-p_position_1)+p_width:
        w_size=p_width
        
    if((id_flg==0)?funChkMBSize_w_kagi_inner(w_size):funChkIDSize_w(w_size)){
        return true
    }
    else{
        return false
    }
}

//かぎ型のMBのサイズチェック（縦）
function funChkMBsize_h_kagi(p_position_0,p_position_1,p_height,id_flg){

    p_position_0=funChange_mm(p_position_0)
    p_position_1=funChange_mm(p_position_1)
    p_height=funChange_mm(p_height)

    var  h_size
    (TateYokoFlg==0)?
        h_size=p_height:
        h_size=(p_position_0<=p_position_1)?(p_position_1-p_position_0)+p_height:(p_position_0-p_position_1)+p_height

    if((id_flg==0)?funChkMBSize_h_kagi_inner(h_size):funChkIDSize_h(h_size)){
        return true
    }
    else{
        return false
    }
}

//MBのカラーチェック
function funChkMBColor(p_objs){
    if(p_objs.strokeColor.magenta>=50){
        return true
    }
    else{
        return false
    }
}

//IDのカラーチェック
function funChkIDColor(p_objs){
    if(p_objs.fillColor.black>=70){
        return true
    }
    else{
        return false
    }
}

//MBのサイズチェック（横）
function funChkMBSize_w(p_w_size){
    var diff = p_w_size-MB_size_tanpen
    if(parseFloat(Math.abs(diff))<=Tolerance_MB_size){
        return true
    }
    else{
        return false
    }
}

//MBのサイズチェック（縦）
function funChkMBSize_h(p_h_size){
    var diff = p_h_size-MB_size_chouhen
    if(parseFloat(Math.abs(diff))<=Tolerance_MB_size){
        return true
    }
    else{
        return false
    }
}

//かぎ型MBのサイズチェック（横）※MB_size_tanpen_kagiと比較
function funChkMBSize_w_kagi_inner(p_w_size){
    var diff = p_w_size - MB_size_tanpen_kagi
    if(parseFloat(Math.abs(diff)) <= Tolerance_MB_size){
        return true
    }
    else{
        return false
    }
}

//かぎ型MBのサイズチェック（縦）※MB_size_chouhen_kagiと比較
function funChkMBSize_h_kagi_inner(p_h_size){
    var diff = p_h_size - MB_size_chouhen_kagi
    if(parseFloat(Math.abs(diff)) <= Tolerance_MB_size){
        return true
    }
    else{
        return false
    }
}

//IDのサイズチェック（横）
function funChkIDSize_w(p_w_size){
    var diff = p_w_size-ID_size_width
    if(parseFloat(Math.abs(diff))<=Tolerance_MB_size){
    // if(p_w_size==ID_size_width){
        return true
    }
    else{
        return false
    }
}

//IDのサイズチェック（縦）
function funChkIDSize_h(p_h_size){
    var diff = p_h_size-ID_size_height
    if(parseFloat(Math.abs(diff))<=Tolerance_MB_size){
    // if(p_h_size==ID_size_height){
        return true
    }
    else{
        return false
    }
}
//////////////画面制御系
//ピッチの選択による画面制御
function funChange_panelPitch() {
    facomFlg=0;//ピッチ切替のたびにリセット（0.3F以外を選んだ場合はFACOM扱いにしない）
    if(dialog.panelPitch.a.value==true){
        dialog.panelControl.enabled = true;
        dialog.panelControl.chokka.value = true;
        dialog.facom_chuui.visible = false;        
        dialog.panelTMDetail.panelSize.tanpen.text=1.27
        dialog.panelTMDetail.panelSize.chohen.text=3.81
    }
    else if(dialog.panelPitch.d.value==true){
        dialog.panelTMDetail.panelSize.chohen.text=7
    }
    else if(dialog.panelPitch.e.value==true){
        dialog.panelTMDetail.panelSize.tanpen.text=0.89
        dialog.panelTMDetail.panelSize.chohen.text=3.81
    }
    else if(dialog.panelPitch.f.value==true){
        dialog.panelControl.enabled = false;
        dialog.panelControl.markkan.value = true;
        dialog.markkan_chuui.visible = false;        
        dialog.facom_chuui.visible = true;
        dialog.panelTMDetail.panelSize.tanpen.text=0.5
        dialog.panelTMDetail.panelSize.chohen.text=5.08
        facomFlg=1;
    }
    else {
        dialog.panelControl.enabled = true;
        dialog.panelControl.seigyo.value = true;
        dialog.facom_chuui.visible = false;        
        dialog.panelTMDetail.panelSize.tanpen.text=0.89
        dialog.panelTMDetail.panelSize.chohen.text=5.9
    }
}

//パラメータの整理
function funStrage_para(para)
{
    //マークボックスのサイズ（たて）を格納
    MB_size_chouhen = para.panelMBSize.yoko.text;
    //マークボックスのサイズ（よこ）を格納
    MB_size_tanpen = para.panelMBSize.tate.text;
    
    //ピッチを格納
    if(para.panelPitch.a.value==true){  //1/6ピッチ
		pitch = 4.233
        MB_first_x_position=11.43
        MB_max=48
        TM_position=5.085
    }
    else if(para.panelPitch.b.value==true){ //0.2
		pitch = 5.08
        MB_first_x_position=11.75
        MB_max=40
        TM_position=-2
    }
    else if(para.panelPitch.c.value==true){ //0.25
		pitch = 6.35
        MB_first_x_position=6.35
        MB_max=33
        TM_position=-2
    }
    else if(para.panelPitch.d.value==true){ //0.3
		pitch = 7.62
        MB_first_x_position=14.50
        MB_max=27
        TM_position=-2
    }
    else if(para.panelPitch.e.value==true){ //0.2s
		pitch = 5.08
        MB_first_x_position=12.7
        MB_max=40
        TM_position=5.095
    }
    else if(para.panelPitch.f.value==true){ //0.3F
		pitch = 7.62
        MB_first_x_position=17.78
        MB_max=24
        TM_position=10.16-(para.panelTMDetail.panelSize.chohen.text/2)

    }
    else{}

    //制御の場合の付加する値を設定(デフォルト値:1.335)
    if(para.panelControl.chokka.value==true){
		MB_Control_add = 0
		MB_Control = 1  //直下
    }
    else if(para.panelControl.markkan.value==true && !(para.panelPitch.f.value==true)){
		MB_Control_add = 0
		MB_Control = 2  //マーク間
    }    
    else if(para.panelControl.markkan.value==true  && (para.panelPitch.f.value==true)){
		MB_Control_add = 0
		MB_Control = 3  //0.3F
    }    
    else{}

    //表裏を格納
    if(para.panelHyouri.ura.value==true){
            flg_panelHyouri = 1 //裏
    }
    //カギ型かどうかを格納
    // if(para.panelMBform.kagi.value==true){
    //         flg_kagi = 1 //裏
    // }
    flg_kagi_other = para.panelMBform.other.value ? 1 : 0
    flg_kagi       = para.panelMBform.kagi.value  ? 1 : 0

    // かぎ型用サイズの取得を追加
    MB_size_chouhen_kagi = para.panelMBSizeKagi.yoko.text
    MB_size_tanpen_kagi  = para.panelMBSizeKagi.tate.text

    //許容範囲
    Tolerance=para.paneKyoyoHani.txt.text

    Tolerance_MB_size=para.paneKyoyoHani.txt_mbsize.text

    Tolerance_waku_posi=para.paneKyoyoHani.txt_wakuposi.text

}

var actDoc = activeDocument

//funCheckTMDetail：TMのサイズ・間隔・位置をチェックし、結果を「文字列」で返す。
//                  （独自のダイアログ表示・テキストファイル出力は行わない。呼び出し元でMain()の結果メッセージに連結する）
function funCheckTMDetail(para){

    var objs_len=sel_objs.length; 
    var str_size="",str_position="",str_kyori="";
    var str_size_NG_cnt=0,str_position_NG_cnt=0,str_kyori_NG_cnt=0;
    // var flg_omote_ura=0;
    var TMobj_a=0,TMobj_b=0; //間隔をチェックする対象のTM
    var array = new Array(objs_len);//配列初期化 １つめの要素は外枠

    //指定されたTMのサイズを格納
    funSetTMSize(para)

    //配列への格納
    //スクリプトは多次元配列がサポートされていないので見せかけの多次元配列作成
    for (var i = 0; i < objs_len; i++) {
        array[i] = ["", "","","","",""];
    }
    for (var i = 0; i < objs_len; i++) {//格納
        //array[TM位置,topの値]
        array[i][0]= i;

        if(TateYokoFlg==0){
            array[i][1] = sel_objs[i].top;
            if(sel_objs[i].stroked){
                array[i][4] =  (sel_objs[i].left+sel_objs[i].strokeWidth/2);
            }
            else{
                array[i][4] =  sel_objs[i].left
            }
        }
        else{
            array[i][1] = sel_objs[i].left
            if(sel_objs[i].stroked){
                array[i][4] = sel_objs[i].top-sel_objs[i].height-sel_objs[i].strokeWidth/2
            }
            else{
                array[i][4] =  sel_objs[i].top-sel_objs[i].height;
            }
        }
        array[i][2] = sel_objs[i].height;
        array[i][3] = sel_objs[i].width;
        array[i][5] = sel_objs[i].left+sel_objs[i].width;
    }
    array = sortDataTM(array,objs_len,TateYokoFlg);//配列のソート（topの値をキーに、昇順）
    if(array[0][2] <= 10 || array[0][3] <= 10)
    {
        return "\r\n【ＴＭ詳細チェック】\r\n【エラー】ＴＭ詳細チェック：選択オブジェクトの並び順から外枠を特定できませんでした。\r\n"
    }

    if(TateYokoFlg==0){
        size_tate = sitei_size_a;
        size_yoko = sitei_size_b;
    }
    else{
        size_tate = sitei_size_b;
        size_yoko = sitei_size_a;
    }

    for (var i=1; i<objs_len; i++)
    {
        if(i<objs_len-1){
            //TM間隔チェック
            TMobj_a=array[i][1];//現在アクティブなＴＭ
            if(facomFlg==0){
                TMobj_b=array[i+1][1];//現在アクティブなＴＭの隣のＴＭ
            }
            else{
                if(!(i%2 == 0)){//比較元のTMが奇数番目の場合、マークを挟むTMの間隔をチェック
                    str_kyori=str_kyori+f_facom_checkTM(TMobj_a,array[i+1][1],i)
                }
                TMobj_b=0
                if (!(i+2>=objs_len)){
                    TMobj_b=array[i+2][1];//現在アクティブなＴＭの２つ隣のＴＭ
                }
            }
            if(!(TMobj_b==0)){
                if(TateYokoFlg==0){
                    var kyori =Math.round(((TMobj_b-TMobj_a)/mm)*1000*-1)
                }
                else{
                    var kyori =Math.round(((TMobj_b-TMobj_a)/mm)*1000)
                }
                kyori=kyori/1000;
                if(kyori<TMkankaku){
                    str_kyori=str_kyori + "第"+i+"TMと第"+(i+parseInt([facomFlg==0?1:2]))+const_kyori+const_HA+TMkankaku+"以下です,　　⇒（"+kyori+"mm）"+"\n\r";
                    str_kyori_NG_cnt++;
                }
            }
        }
        //サイズチェック
        if(Math.round((array[i][2]/mm)*1000)/1000 != size_tate || Math.round((array[i][3]/mm)*1000)/1000 != size_yoko){
           str_size=str_size + "第"+i+const_size+"は"+const_NG +"　　"+Math.round((array[i][2]/mm)*1000)/1000 +"mm×"+Math.round((array[i][3]/mm)*1000)/1000 +"mm\r\n";
           str_size_NG_cnt++;
        }

        //位置チェック
        if(flg_panelHyouri==0 || TateYokoFlg==1){
            //おもての場合（横型は縦横問わずこちらの判定でOK）
            if(Math.round(((array[i][4]-array[0][4])/mm)*1000)/1000 != TM_position){
                str_position=str_position + "第"+i+const_position+"は"+const_NG+"　　"+((TM_position-Math.round(((array[i][4]-array[0][4])/mm)*1000)/1000))*-1+"mm\r\n";
                str_position_NG_cnt++;
            }
        }
        else{
            //うらの場合（縦型のみ）
            if(Math.round((((array[0][4]/mm+array[0][3]/mm)-(array[i][4]/mm+array[i][3]/mm)))*1000)/1000 != TM_position){
                str_position=str_position + "第"+i+const_position+"は"+const_NG+"　　"+((TM_position-Math.round((((array[0][4]/mm+array[0][3]/mm)-(array[i][4]/mm+array[i][3]/mm)))*1000)/1000))*-1+"mm\r\n";
                str_position_NG_cnt++;
            }
        }

    }

    //ここまでの結果を1つのメッセージ文字列にまとめる（独自ダイアログ・テキストファイル出力はしない）
    var msg_tm = "\r\n[ＴＭチェック]：\r\n"
    msg_tm = msg_tm + "ＴＭ数は" + (sel_objs.length-1) + "個です。" + (sel_objs.length-1<4 ? "（4未満です）" : "") + "\r\n"

    if(str_kyori_NG_cnt==0){
        msg_tm = msg_tm + const_kyori+"は"+const_OK+"、　";
    }
    else{
        msg_tm = msg_tm + const_kyori+"は"+const_NG+"、　";
    }
    if(str_size_NG_cnt==0){
        msg_tm = msg_tm + const_size+"は"+const_OK+"、　";
    }
    else{
        msg_tm = msg_tm + const_size+"は"+const_NG+"、　";
    }
    if(str_position_NG_cnt==0){
        msg_tm = msg_tm + const_position+"は"+const_OK+"です。\r\n"+"\r\n";
    }
    else{
        msg_tm = msg_tm + const_position+"は"+const_NG+"です。\r\n"+"\r\n";
    }


    /* ロックか非表示にされてるオブジェクトをサーチ */
    var locked_obj_flg=false //ロックフラグ
    var hidden_obj_flg=false //非表示フラグ
    var str_ng_msg=""
    for (var n=0; n<activeDocument.pageItems.length&&(locked_obj_flg==false||hidden_obj_flg==false); n++){//全部のオブジェクトを見るか、ロックor非表示のオブジェクトが見つかるまで回すよ
        if (activeDocument.pageItems[n].locked == true&&locked_obj_flg!=true){
            locked_obj_flg=true
            if(str_ng_msg!=""){str_ng_msg=str_ng_msg+"・"}
            str_ng_msg = str_ng_msg+"ロック"
        }
        if (activeDocument.pageItems[n].hidden == true&&hidden_obj_flg!=true){
            hidden_obj_flg=true
            if(str_ng_msg!=""){str_ng_msg=str_ng_msg+"・"}
            str_ng_msg = str_ng_msg+"非表示"
        }
    }
    if (str_ng_msg!=""){
        msg_tm = msg_tm + "注意："+str_ng_msg+"オブジェクトがあります\r\n";
    }
    if(actDoc.layers.length > 1){
        msg_tm = msg_tm + "注意：レイヤーが複数存在します\r\n";
    }

    /* 横or縦幅0mmのテキストオブジェクトをサーチ（併せて対象を選択状態にする） */
    var errcnt=0;
    for (var i=0; i<activeDocument.textFrames.length; i++) {
        if(checkTxtTM(activeDocument.textFrames[i])==false){
            if(errcnt==0){
                activeDocument.selection = null
            }
            activeDocument.textFrames[i].hidden = false
            activeDocument.textFrames[i].locked = false
            activeDocument.textFrames[i].selected=true
            errcnt++;
            }
    }
    if(errcnt>0){
        msg_tm = msg_tm + "注意：横幅が0mmのテキストオブジェクトがあります。\r\n";
    }
    
    return msg_tm;
}


//★TMチェック統合分：以下ヘルパー関数群★
function checkTxtTM(txtObj) {
    if (txtObj.width<=0 || txtObj.height<=0) {
        return false;
        }
    return true;
}

//topの値をキーに、昇順でのソート処理
function sortDataTM(p_array,pobjs_len,p_TateYokoFlg)
{
	for (var i=0; i<pobjs_len-1; i++)
	{
		for (var j=i+1; j<pobjs_len; j++)
		{
			if(p_TateYokoFlg==0){
				if (p_array[j][1] > p_array[i][1])//top値の比較
				{
                    cngDataTM(p_array,j,i);
				}
			}
			else{
				if (p_array[j][1] < p_array[i][1])//leftの値の比較
				{
                    cngDataTM(p_array,j,i);
				}
			}
		}
	}
	return p_array;
}
function cngDataTM(p_array,j,i)
{
    var tmp = new Array(6);//配列初期化
    for(var k=0; k<6; k++){
        tmp[k] = p_array[j][k];//TM位置退避
    }
    for(var k=0; k<6; k++){
        p_array[j][k] =  p_array[i][k];//TM位置入れ替え
    }
    for(var k=0; k<6; k++){
        p_array[i][k] = tmp[k];//退避したTM位置格納
    }
}


//facom型のペアTMの間隔チェック（マークを挟むTMの間隔をチェック）
function f_facom_checkTM(p_TM_a,p_TM_b, p_i)
{
    var kyori=0
    var str=""
    if(TateYokoFlg==0){
        kyori =Math.round(((p_TM_b-p_TM_a)/mm)*1000*-1)
    }
    else{
        kyori =Math.round(((p_TM_b-p_TM_a)/mm)*1000)
    }
    kyori=kyori/1000;
    if(!(kyori==(facomTmKankaku-sitei_size_a))){
        str = "ペアのTM間隔err_第"+p_i+"TMと第"+(p_i+1)+const_kyori+"は"+facomTmKankaku+"以外です,　　⇒（"+(kyori+sitei_size_a)+"mm）"+"\n\r";
    }
    return str
}

function funSetTMSize(para){
    //指定されたTMのサイズと間隔を格納
    var ps = para.panelTMDetail.panelSize
    sitei_size_a = ps.tanpen.text;
    sitei_size_b = ps.chohen.text;
    TMkankaku=ps.kankaku.text;
}