/*
脚本作者：DecoAri
Link Tham Khao：https://github.com/DecoAri/JavaScript/blob/main/Surge/TF_keys.js
Các bước sử dụng cụ thể
1: Nhập plugin
2: Tới trang Mitm để kích hoạt Mitm over Http2
3: Bắt đầu VPN，Đi vào TestFlight App，Hiển thị thông tin thông báo thu được thành công
4: Đi tới Cấu hình->Dữ liệu liên tục->Nhập dữ liệu được chỉ định  Điền chính vào Key APP_ID，Điền ID của TF bạn muốn tham gia，（ID là liên kết https://testflight.apple.com/join/LPQmtkUs Chuỗi sau phép nối (nghĩa là "LPQmtkUs" trong ví dụ này)⚠️：Hỗ trợ liên kết TF không giới hạn, mỗi liên kết cần phân tách bằng dấu phẩy tiếng Anh ","（VD： LPQmtkUs,Hgun65jg,8yhJgv）
）
*/
const reg1 = /^https:\/\/testflight\.apple\.com\/v3\/accounts\/(.*)\/apps$/;
const reg2 = /^https:\/\/testflight\.apple\.com\/join\/(.*)/;
if (reg1.test($request.url)) {
    $persistentStore.write(null, 'request_id')
    let url = $request.url
    let key = url.replace(/(.*accounts\/)(.*)(\/apps)/, '$2')
    let session_id = $request.headers['X-Session-Id'] || $request.headers['x-session-id']
    let session_digest = $request.headers['X-Session-Digest'] || $request.headers['x-session-digest']
    let request_id = $request.headers['X-Request-Id'] || $request.headers['x-request-id']
    let ua = $request.headers['User-Agent'] || $request.headers['user-agent']
    $persistentStore.write(key, 'key')
    $persistentStore.write(session_id, 'session_id')
    $persistentStore.write(session_digest, 'session_digest')
    $persistentStore.write(request_id, 'request_id')
    $persistentStore.write(ua, 'tf_ua')
    console.log($request.headers)
    if ($persistentStore.read('request_id') !== null) {
      $notification.post('Lấy thông tin TF', 'Lấy thành công, vui lòng đóng kịch bản','')

    } else {
      $notification.post('Lấy thông tin TF','Không lấy được thông tin, bật Mitm => HTTP2, khởi động lại VPN và TestFlight App','')
    }
    $done({})
}
if (reg2.test($request.url)) {
  let appId = $persistentStore.read("APP_ID");
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
  $persistentStore.write(appId, "APP_ID");
  $notification.post("Tự động tham gia TestFlight", `Đã thêm APP_ID: ${id}`, `Còn lại ID(s): ${appId}`);
  $done({})
}
function unique(arr) {
  return Array.from(new Set(arr));
}
