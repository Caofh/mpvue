const app = getApp();
/****
 * 备注：
 * 功能名称：自定义导航栏 (支持home back refresh)
 * list:['back','home'] 或者
 * list:[{name: 'home',icon: '/icon/ic_home.png',path: '',isTabbar:false}]
 */
Component({

  properties: {
    title: {
      type: String,
      value: '寺库商城'
    },
    bgMark: {
      type: Boolean,
      value: false
    },
    spaceMark: {
      type: Boolean,
      value: false
    },
    navigationBarHeight: {
      type: Number,
      value: false
    },
    datas: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal) {
        if (newVal) {
          let list = [];
          let len = getCurrentPages().length;
          for (let val of newVal) {
            if (typeof val == 'string') {
              if (val == 'back') {
                if (len >= 1) {
                  list.push({
                    name: 'back',
                    // icon: '/icon/ic_back.png',
                    path: '',
                    isTabbar: false
                  });
                }
              } else if (val == 'home') {
                list.push({
                  name: 'home',
                  // icon: '/icon/ic_home.png',
                  path: '/pages/home/home',
                  isTabbar: true
                });
              } else if (val == 'refresh') {
                list.push({
                  name: 'refresh',
                  // icon: '/icon/ic_home.png',
                  path: '',
                  isTabbar: false
                });
              } else {}
            } else if (typeof val == 'object') {
              list.push(val);
            } else {}
          }
          this.setData({
            list
          });
        }
      }
    }
  },

  data: {
    statusBarHeight: app.statusBarHeight + 'px',
    list: []
  },

  methods: {
    onClick: function(e) {
      let model = e.currentTarget.dataset.model;
      switch (model.name) {
        case 'home':
          wx.switchTab({
            url: model.path,
          });
          break;
        case "back":
          wx.navigateBack({
            delta: 1
          });
          break;
        case 'refresh':
          wx.redirectTo({
            url: model.path,
          })
          break;
        default:
          break;
      }
    }
  }
})