//*********************************
// */10 * * * * * https://raw.githubusercontent.com/chouchoui/QuanX/master/Scripts/testflight/Auto_join_TF.js, tag=TestFlight自动加入, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/testflight.png, enabled=true
//*********************************

!(async () => {
  ids = $prefs.valueForKey("APP_ID");
  if (ids == "") {
    $notify("APP_ID là rỗng, cần thêm APP_ID mới", "Đóng App thôi", "");
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
          console.log(ID + " " + "không tồn tại và đã xoá APP_ID đó");
          $notify(ID, "TF không tồn tại", "đã xoá APP_ID đó");
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
              $notify(jsonBody.data.name, "đã tham gia thành công", "");
              console.log(jsonBody.data.name + " đã tham gia thành công");
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
          $notify("Tự động tham gia TF: ", error, "");
          console.log(ID + " " + error);
          resolve();
        }
      }
    );
  });
}
