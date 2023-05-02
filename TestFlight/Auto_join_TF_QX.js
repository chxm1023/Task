/*
**************************************
项目名称：自动加入TF
脚本作者：DecoAri
引用链接：https://github.com/DecoAri/JavaScript/blob/main/Surge/Auto_join_TF.js

**************************************

Boxjs订阅链接：https://raw.githubusercontent.com/githubdulong/Script/master/boxjs.json

使用方法: 订阅以上Boxjs链接，填写你要加入的TF的ID，（ID为链接 https://testflight.apple.com/join/LPQmtkUs 的join后的字符串（也就是此例子的“LPQmtkUs”）⚠️：支持无限个TF链接，每个链接需要用英文逗号“,”隔开（如： LPQmtkUs,Hgun65jg,8yhJgv）

温馨提示：
1: 除beta已满的其他情况才会通知，可自行看日志
2: 报错1012是因为未执行使用方法的步骤2
3: 已支持同时挤🚪，支持无限TF链接
4: 获取tf信息的脚本与TestFlight账户管理模块冲突，使用的时候先关一下该模块

**************************************

[rewrite_remote]
# 获取TF信息/APP_ID获取
https://raw.githubusercontent.com/chxm1023/Task/main/TestFlight/TF_keys_QX.js, tag=TF获取APP_ID, update-interval=172800, opt-parser=true, enabled=true

[task_local]
# 自动加入TF(每1小时执行一次)
0 0-23/1 * * ? https://raw.githubusercontent.com/chxm1023/Task/main/TestFlight/Auto_join_TF_QX.js, tag=自动加入TF, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/testflight.png, enabled=true

**************************************
*/


!(async () => {
  ids = $prefs.valueForKey("APP_ID");
  if (ids == "") {
    $notify("所有TF已加入完毕", "请手动关闭", "");
    $done();
  } else {
    ids = ids.split(",");
    try {
      for await (const ID of ids) {
        await autoPost(ID);
      }
    } catch (error) {
      console.log(error);
      $done();
    }
  }
  $done();
})();

function autoPost(ID) {
  let Key = $prefs.valueForKey("key");
  let testurl = "https://testflight.apple.com/v3/accounts/" + Key + "/ru/";
  let header = {
    "X-Session-Id": `${$prefs.valueForKey("session_id")}`,
    "X-Session-Digest": `${$prefs.valueForKey("session_digest")}`,
    "X-Request-Id": `${$prefs.valueForKey("request_id")}`,
  };
  return new Promise(function (resolve) {
    $task.fetch({ url: testurl + ID, method: "GET", headers: header }).then(
      (resp) => {
        const { body: data } = resp;
        if (resp.status == 404) {
          ids = $prefs.valueForKey("APP_ID").split(",");
          ids = ids.filter((ids) => ids !== ID);
          $prefs.setValueForKey(ids.toString(), "APP_ID");
          console.log(ID + " " + "不存在该TF，已自动删除该APP_ID");
          $notify(ID, "不存在该TF", "已自动删除该APP_ID");
          resolve();
        } else {
          let jsonData = JSON.parse(data);
          if (jsonData.data == null) {
            console.log(ID + " " + jsonData.messages[0].message);
            resolve();
          } else if (jsonData.data.status == "FULL") {
            console.log(ID + " " + jsonData.data.message);
            resolve();
          } else {
            $task.fetch({ url: testurl + ID + "/accept", method: "POST", headers: header }).then((res) => {
              const { body } = res;
              let jsonBody = JSON.parse(body);
              $notify(jsonBody.data.name, "TestFlight加入成功", "");
              console.log(jsonBody.data.name + " TestFlight加入成功");
              ids = $prefs.valueForKey("APP_ID").split(",");
              ids = ids.filter((ids) => ids !== ID);
              $prefs.setValueForKey(ids.toString(), "APP_ID");
              resolve();
            });
          }
        }
      },
      (error) => {
        if (error == "The request timed out.") {
          resolve();
        } else {
          $notify("自动加入TF", error, "");
          console.log(ID + " " + error);
          resolve();
        }
      }
    );
  });
}
