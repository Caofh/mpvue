const networkUtil = require("./networkUtil.js")

let req = {

    doGet: function (url, data, success, fail, type) {
        networkUtil.request("GET", url, data, success, fail, type);
    },

    doPost: function (url, data, success, fail, type) {
        networkUtil.request("POST", url, data, success, fail, type);
    },

}



export default req

