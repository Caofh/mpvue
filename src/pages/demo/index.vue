<template>
  <div>
    <div @click="click">
      牛逼啦
    </div>

    <view>

      123
    </view>

    <div>
      <span>12345</span>
    </div>

    <div @click="jump">
      跳转分包的示例页面{{}}
    </div>

    <div class="content">
      引个图片
      <img class="img" :src="img">
      <img class="img" :src="invite">
    </div>

    <div class="bg">

    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      motto: 'Hello miniprograme',
      img: require('../../assets/img/root_demo_demo.jpeg'),
      invite: require('../../assets/img/root_demo_invite.png'),

    }
  },

  components: {

  },

  methods: {
      click () {
          wx.showModal({
              title: '提示',
              showCancel: false,
              content: '陈宫1235',
              confirmText: '确定',
              success: res => {
                  if (res.confirm) {
                      console.log(123)
                  }
              }
          })
      },
      jump () {
          wx.navigateTo({
              url: '/pages/c2c/pages/home/main'
          })


      },


  },

  created () {
    // let app = getApp()
  }
}
</script>

<style lang="scss" scoped>
  .content {
    .img {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }
  }

  .bg {
    background: url("../../assets/img/root_demo_demo.jpeg") no-repeat center / 100% 100%;
    width: 200rpx;
    height: 200rpx;
  }
</style>
