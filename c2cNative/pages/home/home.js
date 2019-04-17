/*
c2c商品详情页
 */

let app = getApp();
import { baseConf } from '../../common/js/core.js'
import { getRandom } from '../../common/js/utils/utils.js'
import { deepClone } from '../../common/js/utils/deepClone.js'
import { formatMoney } from '../../common/js/utils/format-money.js'

// 接口地址
import req from '../../api/core'
import { listPage } from '../../api/pages/home'

let base = {
    /**
     * 页面的初始数据
     */
    data: {
        winWidth: 0, // 系统宽
        winHeight: 0, // 系统高
        scrollTop: 0, // 滚动容器的距上距离

        navbarData: ['back', 'home'],
        setNavigationBarTitle: 'FUN特卖',

        // navbar相关
        navigationBarHeight: app.navigationBarHeight + 10, // 头部高度
        headerBg: true, // 头部颜色标识（true: 白色；false: 透明色）

        // scroll-view相关
        scrollViewH: '', // scroll-view高度
        listData: [], // 商品列表页瀑布流

        // 瀑布流相关
        currTopArr: [0, 0],
        currTopArrH: [0, 0],

        // 急速发布弹窗显示标识
        publishShow: false,

        // loading动态图的距上距离
        loadingTopResult: 0,

        // 列表分页参数
        pageNo: 1,
        pageSize: 20


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        // 设置系统的宽高
        this.setting()

        // 设置系统及scroll-view的宽高
        this.settingScrollH()

        // 项目初始化
        this.start()

    },
    // 项目初始化
    start () {
        this.loadData((data) => {
            console.log(data)

            // let list = [
            //     {commodityImage: 'https://pic12.secooimg.com/res/contentERP/57/10/1ZVJDM9fe94f0306c147339212834a95b8a0c6.jpg'},
            //     {commodityImage: 'https://pic12.secooimg.com/res/contentERP/52/97/1ZWW404a3a871b387b4173a8c72c5e9d8168be.jpg'},
            //     {commodityImage: 'https://pic12.secooimg.com/res/contentERP/54/48/1ZWr3560a693d0225045abae988f151e805f1f.jpg'},
            //     {commodityImage: 'https://pic12.secooimg.com/res/contentERP/56/55/1ZWqym87bcc5f7ff7340f8afdf07990c519622.jpg'},
            //     {commodityImage: 'https://pic12.secooimg.com/res/contentERP/57/50/1ZWV0g92a1af1e45bd40ee83f89dbb0ce6619e.png'},
            //     {commodityImage: 'https://pic12.secooimg.com/res/commentImg/50/50/1ZZlRB22c946049aa644ebbd982f680f8493ea.gif'},
            // ]
            let list = data.data.list || []

            // 预处理数据
            list = this.handle(list)

            // 根据瀑布流处理数据
            list = this.waterFall(list)
            this.setData({
                pageNo: this.data.pageNo + 1, // 增加分页参数
                listData: list // 合并列表页数据
            })

        }, (error) => {
            console.log(error)

        })

    },

    // scroll-view滚动触底事件
    scrolltolower (e) {
        console.log('触底', e)

        this.setData({
            showLoading: true
        })

        this.loadData((data) => {

            let list = data.data.list || []

            // 预处理数据
            list = this.handle(list)

            // 根据瀑布流处理数据
            list = this.waterFall(list)
            this.setData({
                showLoading: false, // 隐藏loading动态图
                pageNo: this.data.pageNo + 1, // 增加分页参数
                listData: this.data.listData.concat(list) // 合并列表页数据
            })

        }, (error) => {
            console.log(error)

        })

    },
    // scroll-view滚动事件
    listenScroll (e) {
        // console.log(e)

    },

    // 请求数据公用
    loadData (callback, fail) {
        const json = {
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize,
        }

        req.doPost(listPage, json, (data) => {
            callback && callback(data.data)
        }, (error) => {
            fail && fail(error)
        })

    },

    // 预处理数据
    handle (list) {
        let data = deepClone(list)
        data.map((item) => {
            item.commodityImage = 'https://pic12.secooimg.com/res/contentERP/57/10/1ZVJDM9fe94f0306c147339212834a95b8a0c6.jpg'
            item.originalPrice = parseFloat(item.originalPrice)
            item.salePrice = parseFloat(item.salePrice)
            item.salePrice_new = formatMoney(item.salePrice, 0, "", ",")
            item.originalPrice_new = formatMoney(item.originalPrice, 0, "", ",")

        })

        return data
    },

    // 瀑布流处理数据
    waterFall (data) {
        let currTopArr = this.data.currTopArr
        let currTopArrH = this.data.currTopArrH

        let listData = deepClone(data)
        listData.map((item, index) => {
            const ran = getRandom(3) // 取0-3之间的随机整数
            const ranHeight = baseConf.waterSize[ran] // 在配置文件中随机取一高度
            const ranHeightNew = this.changePx(ranHeight)
            let cardHeight = ranHeightNew + this.changePx(95) + this.changePx(150) // 整个卡片高度

            let arrMin = Math.min.apply(null, currTopArr) // 数组中最小的值为当前瀑布流高度
            let arrMinIndex = currTopArr.indexOf(arrMin) // 数组中最小值的索引

            // 当前索引是奇是偶，来给left赋值
            let left = arrMinIndex == 0 ? this.changePx(20) : this.changePx(20 + 345 + 20)

            let top = 0
            if (currTopArr.includes(0)) {
                top = arrMin + this.changePx(1) // 新的值
            } else {
                let addHeight = currTopArrH[arrMinIndex] // 精髓

                top = arrMin + addHeight + this.changePx(20) // 新的值
            }

            // 更新当前数据
            item.height = ranHeightNew
            item.allHeight = cardHeight
            item.left = left
            item.top = top

            // 更新比较的基础数组
            this.setData({
                ['currTopArr['+arrMinIndex+']']: top,
                ['currTopArrH['+arrMinIndex+']']: cardHeight,
            })

        })

        // loading动态度位置变化
        let loadingTop = Math.max.apply(null, this.data.currTopArr)
        let loadingTopH = Math.max.apply(null, this.data.currTopArrH)
        let loadingTopResult = loadingTop + loadingTopH
        this.setData({
            loadingTopResult: loadingTopResult
        })

        return listData

    },

    jumpDetail () {
        let url = `/c2c/pages/wareDetail/wareDetail`

        wx.navigateTo({
            url: url
        })

    },

    // 我要出售
    sell () {
        this.setData({
            publishShow: true
        })
    },
    // 关闭急速发布弹窗
    closeDialog () {
        this.setData({
            publishShow: false
        })
    },
    // 急速发布
    quickPub () {
        if (!app.isLogin()) { // 没有登录必须登录才可以使用
            wx.navigateTo({
                url: '/pages/account/loginAccount/loginAccount'
            })
            return;
        }

        let jumpUrl = 'http://10.0.8.218:8080/release.html'
        let url = `../../../pages/web/webView?url=${jumpUrl}`

        wx.navigateTo({
            url: url
        })

    },
    // 一键转卖
    resell () {
        if (!app.isLogin()) { // 没有登录必须登录才可以使用
            wx.navigateTo({
                url: '/pages/account/loginAccount/loginAccount'
            })
            return;
        }
        let jumpUrl = 'http://10.0.8.218:8080/resell_goods.html'
        let url = `../../../pages/web/webView?url=${jumpUrl}`

        wx.navigateTo({
            url: url
        })
    },


    // 坐标像素转换
    changePx (count) {
        const stageWidth = this.data.winWidth
        const ratio = stageWidth / 750 // 比例

        return count * ratio

    },
    // 设置系统宽高
    setting () {
        const that = this

        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });

            }
        });
    },

    // 设置scroll-view高度
    settingScrollH () {
        // const winWidth = this.data.winWidth
        const winHeight = this.data.winHeight
        const barHeight = this.data.navigationBarHeight
        const bannerHeight = this.changePx(260)
        const scrollH = winHeight - ( barHeight + bannerHeight ) // 动态计算出scroll-view的高度

        this.setData({
            // scrollViewH: scrollH
            scrollViewH: winHeight - barHeight
        });
    },

    // 全局的scroll事件
    onPageScroll:function(e){
        // console.log(e);//{scrollTop:99}
    },










    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

}




Page(Object.assign({}, base))