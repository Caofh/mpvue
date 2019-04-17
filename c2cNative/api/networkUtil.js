const isLogable = false;
const KEY_ACCOUNT_TOKEN = "smp_account_token"
const KEY_ACCOUNT_DETAILS = "smp_account_details"
const LOCATION_KEY = 'smp_user_location_';
const isMustBindPhone = true;
const DAY = 24 * 60 * 60 * 1000; // one day ms
// baidu api application access keys
const BAIDU_AK_ARRAY = [
  'uF0288769TCUpASGeWKRa7yjAopj1t5H',// 寺库有礼小程序
  'GW6H4lGwheGTKPOtDzAD3lkHXU1TQry2',// 寺库砍价小程序
  'gIrDGgfFOATGczZT2CuO3dQF53RU32Np',// 寺库247Bar小程序
  'SwsIqqbQCPzjqX0AABW90GmqtyC559gD',// 寺库商城小程序
  'nVdKRYLPOxomcT5iHy4MAp8Roqodb7B4',// 寺库红包小程序
  'ncpubaLWB9kfkguLR7vq9oOphUkcKeFm' // 寺库线下小程序
];

let header;

function getHeader() {
  if (header == null) {
    let defVal = "wxmp0000000000000000";
    header = {
      "upk": "",
      "mac": "0",
      "imei": "0",
      "channel": "wxscmp",
      "app-id": "1",//644873678
      "app-ver": "6.0.1",
      "uuid": defVal,
      "device-id": defVal,
      "platform": "0",
      "platform-ver": "6.2.1",
      "platform-type": 0,
      "platform_type": 0,// 模拟 ios
      "session_secoo_id": defVal,
      "appsource":40 // 固定不变；小程序渠道，图片webp，搜索商品列表价格标签等业务逻辑
    };
    let obj = wx.getStorageSync(LOCATION_KEY + 'data');
    if(obj && obj.province){
      undateHeaderLocation(obj);
    }
  }
  return header;
}

function updateHeader(openId) {
  let header = getHeader();
  header['uuid'] = openId;
  header['device-id'] = openId;
  header['imei'] = openId;
  header['session_secoo_id'] = openId;
}

function request(method,url,data,success,fail, type){
  if (isLogable) {
    console.log(url);
    if (data) console.log(data);
  }
  let app = getApp();
  if (!app.globalData.isNetworkConnected) {
    fail({ 'error': "network is unconnected!" });
    return;
  }
  let httpHeader = header;
  if(!httpHeader) httpHeader = getHeader();

  if (type == 'x-www') {
      if(method=="GET"){
        httpHeader["Content-Type"] = "application/x-www-form-urlencoded";
      }else{
        httpHeader["Content-Type"] = "application/x-www-form-urlencoded";
      }
  } else {
      httpHeader['Content-Type'] = "application/json"
  }


  httpHeader['upk'] = app.getAccountUPKey();
  httpHeader['device-id'] = app.getOpenId();
  
  wx.request({
    url: url,
    method: method,
    data: data,
    header: httpHeader,
    success: function(res){
      requestSuccess(res,success);
    },
    fail: fail
  });
}

function requestSuccess(res,success){
  let r = res.data;
  if(isLogable) console.log(r);
  let app = getApp();
  let code = app.getAPICode(r);
  let oldCode = app.getAPICode(r.rp_result);

  // new api code 1300 and old api code 1008 account session timeout
  if (code == 1300 || oldCode==1008) {
    app.accountLogout();
    wx.showModal({
      title: "安全提示",
      content: "您的账户已在另一设备上登录，如非您本人操作点击确认重新登录后尽快修改密码！",
      confirmText:"登录",
      complete:function(r){
        if (r.confirm){
          wx.navigateTo({
            url: "/pages/account/loginAccount/loginAccount"
          });
        }
      }
    });
  }
  success(res);
}

function queryAccountDetail(callback){
  let app = getApp();
  let url = "https://las.secoo.com/api/user/get_user_info";
  let data = {};
  request('GET',url,data,
    function(res){
      let data = res.data;
      let obj = data.userInfo;
      if(app.getAPICode(data)==0 && obj){
        callback && callback(res)
        app.globalData.accountData['details'] = obj;
        wx.setStorage({
          key: KEY_ACCOUNT_DETAILS,
          data: obj,
          success:function(res){
            console.log(res);
          }
        })
      }
    },function(res){
      callback && callback(res);
    });
}

function getWeChatPhone(iv, encryptedData, callback) {
  let app = getApp();
  let url = "https://user-center.secoo.com/service/appapi/joint/small/query/mobile";
  let tokenObj = app.getAccountToken();
  let token = tokenObj['token'];
  let data = {
    'businessId': 4,
    'clientId': 14,
    'sourceId': 2,
    'iv': iv,
    'encryptedData': encryptedData,
    'token': token
  };

  request('POST',url, data,
    function (res) {
      onGetWeChatPhoneCompleted(res, iv, encryptedData,callback);
    },
    function (res) {
      console.log(res);
      callback({});
    });
}

function onGetWeChatPhoneCompleted(res, iv, encryptedData,callback){
  let data = res.data;
  let app = getApp();
  let code = app.getAPICode(data);
  if (code == 10004) { // session time out then login agin
    wx.login({
      success: function (res) {
        queryWechatSessionByCode(res.code,
          function (m) {
            let obj;
            if (m) obj = m.object;
            if (obj) {
              getWeChatPhone(iv, encryptedData, callback);
            }else{
              if (callback) callback({});
            }
          })
      },
      fail:function(res){
        if (callback) callback({});
      }
    })
  } else {
    let obj = data.object;
    if (callback) callback(obj);
  }
}

function queryThirdMiniAppAccount(clientId, callback) {
  let url = "https://user-center.secoo.com/service/appapi/joint/update/upk/by/clientId";
  let app = getApp();
  let openId = app.getOpenId();
  let data = {
    'clientId': clientId
  };
  request('POST',url, data,
    function (res) {
      callback(clientId, res.data);
    },
    function (res) {
      callback(clientId, { 'retCode': -1, 'retMsg': "获取失败~" });
    })
}


/**
 * 小程序登录凭证校验
*/
function queryWechatSessionByCode(code, callback) {
  let url = "https://user-center.secoo.com/service/appapi/joint/small/query/sessionkey";
  let data = {
    'businessId': 4,
    'clientId': 14,
    'sourceId': 2,
    'code': code
  }
  request('POST',url, data, 
    function (res) {
      let m = res.data;
      let obj;
      if (m) obj = m.object;
      if (obj) {
        let app = getApp();
        app.globalData.accountData['token'] = obj;
        wx.setStorageSync("smp_account_token", obj);
      }
      if (callback) callback(m);
    },
    function(res){
      console.log(res);
      if (callback) callback({
        retCode:-1,
        'errMsg':"请求失败"
      });
    });
}

/**
 * 获取所有品牌并按照英文字母排序缓存，供后期使用
*/
function queryAndBuildAllBrandTags(){
  let key = "smp_brand_sort_tags";
  let timeout = wx.getStorageSync(key+"_timeout");
  if (!timeout || timeout == '') timeout = 0;
  let now = new Date().getTime();
  if (timeout>now) return;
  
  let url = "https://las.secoo.com/api/category/all_hot_brands";
  request('GET', url, null,
    function (res) {
      let m = res.data;
      let brands = m ? m.allBrands : null;
      if(brands && brands.length>1){
        let brand, tag;
        for(let p in brands){
          brand = brands[p];
          if(!brand) continue;
          tag = brand.brandEName;
          if (tag) tag = tag.substr(0,1); // 存在取首字母
          if (tag){
            tag = tag.match("^[a-zA-Z]$"); // 存在校验是否为英文字母
            if (tag) tag = tag.input;
          } 
          if (!tag) tag = "#";
          brand['tag'] = tag.toUpperCase();
        }
        let array = [];
        
        brands.sort(function(e,v){
          if(!e || e.tag=='#') return -1; // e<v
          if(!v || v.tag=='#') return 1; // e>v

          let tagE = e.tag;
          let tagV = v.tag;
          if(tagE==tagV) return 0;
          else if(tagE>tagV) return 1;
          else return -1;
        });

        let brandTags = {};
        let brandIds;
        tag = null;
        for(let i in brands){
          brand = brands[i];
          if(!brand) continue;
          if(tag != brand.tag){
            tag = brand.tag;
            brandIds = [];
            brandTags[tag] = brandIds;
          }
          brandIds.push(brand.brandId);
        }

        timeout = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;// cache timeout 7 days

        wx.setStorage({
          key: key,
          data: brandTags
        })
        wx.setStorage({
          key: key + "_timeout",
          data: timeout
        });
      }
    },
    function (res) {
      
    })
}

function undateHeaderLocation(location){
  let h = header;
  if(!h){
    h = getHeader();
  }
  if (h) {
    h['province'] = encodeURIComponent(location.province);
    h['city'] = encodeURIComponent(location.city);
    h['lat'] = location.x;
    h['lon'] = location.y;
  }
}

function queryLocationByPhone(callback){
  let key = LOCATION_KEY + 'time_out';
  let timeout = wx.getStorageSync(key);
  let now = new Date().getTime();
  if (!timeout || timeout == '') timeout = now;
  if (timeout>now && timeout - now < DAY){
    if(callback) callback();
    return;
  }

  // 控制【IP转城市】响应不能超过1s
  let timer = setTimeout(function(){
    if(callback) callback();
  }.bind(this),1000);
  // index [0,BAIDU_AK_ARRAY.length)
  let index = Math.floor((Math.random() * BAIDU_AK_ARRAY.length));
  console.log('baidu_ak_index', index);
  let ak = BAIDU_AK_ARRAY[index];
  let url = 'https://api.map.baidu.com/location/ip?ak=' + ak;
  request('GET',url,null,
    function(res){
      clearTimeout(timer);
      let m = res.data.content;
      if (m) {
        let obj = {
          province: m.address_detail.province,
          city: m.address_detail.city,
          x: m.point.x,
          y: m.point.y
        }
        // set location
        undateHeaderLocation(obj);
        key = LOCATION_KEY + 'data'
        wx.setStorage({
          key: key,
          data: obj
        })
        // time out is 1days
        timeout = now + DAY;
        key = LOCATION_KEY + 'time_out'
        wx.setStorage({
          key: key,
          data: timeout
        })
      }else{
        console.log('location fail', res);
      }
      if(callback) callback();
    },
    function(res){
      console.log('location fail',res);
      clearTimeout(timer);
      if(callback) callback();
      
    });
}

module.exports = {
  getHeader: getHeader,
  request: request,
  queryAccountDetail: queryAccountDetail,
  getWeChatPhone: getWeChatPhone,
  queryThirdMiniAppAccount: queryThirdMiniAppAccount,
  queryWechatSessionByCode: queryWechatSessionByCode,
  queryAndBuildAllBrandTags: queryAndBuildAllBrandTags,
  queryLocationByPhone: queryLocationByPhone
}