/*************************************

项目名称：自动加入TF
脚本作者：DecoAri
引用链接：https://github.com/DecoAri/JavaScript/blob/main/Surge/TF_keys.js

**************************************

Boxjs订阅链接：https://raw.githubusercontent.com/githubdulong/Script/master/boxjs.json

使用方法: 订阅以上Boxjs链接，填写你要加入的TF的ID，（ID为链接 https://testflight.apple.com/join/LPQmtkUs 的join后的字符串（也就是此例子的“LPQmtkUs”）⚠️：支持无限个TF链接，每个链接需要用英文逗号“,”隔开（如： LPQmtkUs,Hgun65jg,8yhJgv）

温馨提示：
1: 除beta已满的其他情况才会通知，可自行看日志
2: 报错1012是因为未执行使用方法的步骤2
3: 已支持同时挤🚪，支持无限TF链接
4: 获取tf信息的脚本与TestFlight账户管理模块冲突，使用的时候先关一下该模块

**************************************

[rewrite_local]
# 获取TF信息(打开TF自动获取信息)
^https?:\/\/testflight\.apple\.com\/v3\/accounts/.*\/apps$ url script-request-header https://raw.githubusercontent.com/chxm1023/Task/main/TestFlight/TF_keys_QX.js
# APP_ID获取(打开TF链接获取APP_ID)
^https?:\/\/testflight\.apple\.com\/join\/(.*) url script-request-header https://raw.githubusercontent.com/chxm1023/Task/main/TestFlight/TF_keys_QX.js

[MITM]
hostname = testflight.apple.com

*************************************/


const reg1 = /^https:\/\/testflight\.apple\.com\/v3\/accounts\/(.*)\/apps$/;
const reg2 = /^https:\/\/testflight\.apple\.com\/join\/(.*)/;

if (reg1.test($request.url)) {
  $prefs.setValueForKey(null, "request_id");
  let url = $request.url;
  let key = url.replace(/(.*accounts\/)(.*)(\/apps)/, "$2");
  const headers = Object.keys($request.headers).reduce((t, i) => ((t[i.toLowerCase()] = $request.headers[i]), t), {});

  let session_id = headers["x-session-id"];
  let session_digest = headers["x-session-digest"];
  let request_id = headers["x-request-id"];
  $prefs.setValueForKey(key, "key");
  $prefs.setValueForKey(session_id, "session_id");
  $prefs.setValueForKey(session_digest, "session_digest");
  $prefs.setValueForKey(request_id, "request_id");
  if ($prefs.valueForKey("request_id") !== null) {
    $notify("TestFlight自动加入", "信息获取成功", "");
  } else {
    $notify("TestFlight自动加入", "信息获取失败", "请添加testflight.apple.com");
  }
  $done({});
} else if (reg2.test($request.url)) {
  let appId = $prefs.valueForKey("APP_ID");
  if (!appId) {
    appId = "";
  }
  let arr = appId.split(",");
  const id = reg2.exec($request.url)[1];
  arr.push(id);
  arr = unique(arr).filter((a) => a);
  if (arr.length > 0) {
    appId = arr.join(",");
  }
  $prefs.setValueForKey(appId, "APP_ID");
  $notify("TestFlight自动加入", `已添加APP_ID: ${id}`, `当前ID: ${appId}`);
  $done({});
}

function unique(arr) {
  return Array.from(new Set(arr));
}
