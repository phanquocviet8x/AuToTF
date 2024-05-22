/*
脚本作者：DecoAri
修复作者: xream
引用地址：https://raw.githubusercontent.com/DecoAri/JavaScript/main/Surge/Auto_join_TF.js
感谢某位大佬将改写为Loon版脚本！
*/
!(async () => {
  ids = $persistentStore.read('APP_ID')
  if (ids == null) {
    $notification.post('APP_ID đang trống', 'Thêm APP_ID ngay', '')
  } else if (ids == '') {
    $notification.post('Đã thêm đủ, kiểm tra danh sách TestFlight app', 'Tắt Plugin và thêm các ứng dụng khác', '')
  } else {
    ids = ids.split(',')
    for await (const ID of ids) {
      await autoPost(ID)
    }
  }
  $done()
})()

function autoPost(ID) {
  let Key = $persistentStore.read('key')
  let testurl = 'https://testflight.apple.com/v3/accounts/' + Key + '/ru/'
  let header = {
    'X-Session-Id': `${$persistentStore.read('session_id')}`,
    'X-Session-Digest': `${$persistentStore.read('session_digest')}`,
    'X-Request-Id': `${$persistentStore.read('request_id')}`,
    'User-Agent': `${$persistentStore.read('tf_ua')}`,
  }
  return new Promise(function (resolve) {
    $httpClient.get({ url: testurl + ID, headers: header }, function (error, resp, data) {
      if (error == null) {
        if (resp.status == 404) {
          ids = $persistentStore.read('APP_ID').split(',')
          ids = ids.filter(ids => ids !== ID)
          $persistentStore.write(ids.toString(), 'APP_ID')
          console.log(ID + ' ' + 'TestFlight không tồn tại，APP_ID đã tự động xóa')
          $notification.post(ID + ' ' + 'TestFlight không tồn tại，APP_ID đã tự động xóa')
          resolve()
        } else {
          let jsonData = JSON.parse(data)
          if (jsonData.data == null) {
            console.log(ID + ' ' + jsonData.messages[0].message)
            resolve()
          } else if (jsonData.data.status == 'FULL') {
            console.log(jsonData.data.app.name + ' ' + ID + ' ' + jsonData.data.message)
            resolve()
          } else {
            $httpClient.post({ url: testurl + ID + '/accept', headers: header }, function (error, resp, body) {
              let jsonBody = JSON.parse(body)
              $notification.post(jsonBody.data.name, 'TestFlight đã tham gia thành công', '')
              console.log(jsonBody.data.name + ' ' + 'TestFlight đã tham gia thành công')
              ids = $persistentStore.read('APP_ID').split(',')
              ids = ids.filter(ids => ids !== ID)
              $persistentStore.write(ids.toString(), 'APP_ID')
              resolve()
            })
          }
        }
      } else {
        if (error == 'The request timed out.') {
          resolve()
        } else {
          $notification.post('TestFlight có lỗi: ', error, '')
          console.log(ID + ' ' + error)
          resolve()
        }
      }
    })
  })
}
