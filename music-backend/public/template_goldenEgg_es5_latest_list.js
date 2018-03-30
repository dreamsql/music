'use strict';
let Vue = window.Vue;
FastClick.attach(document.body);
Vue.prototype.$http = axios;
Vue.component('prize-item', {
    props: ['prizeitem'],
    template: '<div class=\'prizeitem-container\'>\n            <div class=\'prizeitem-img\'>\n                <img :src=\'prizeitem.url\'/>\n            </div>\n            <div class=\'prizeitem-text\'>{{prizeitem.text}}</div>\n        </div>'
});
var app = new Vue({
    el: '#app',
    data: {
        // preq_count 目前请求不重复广告的次数
        preq_count: 0,
        // preq_count_max 请求不重复广告的最大次数
        preq_count_max: 10,
        // 显示的广告具体信息
        prize: {},
        // 广告位id列表
        ad_idlist: [],
        // 备用广告
        ad_backup: {
            mainimage: 'http://oimagec7.ydstatic.com/image?id=-3617364665137034073&product=adpublish&w=640&h=360&sc=0',
            title: '不知道怎么学英语？',
            clktracker: 'http://p.clkservice.youdao.com/clk/request.s?slot=d02a67e02764cdb60f30d49df05a0da7&k=XxDt00UG3kzHg1LU8s3V3cDLgxMuKQbPWUvM%2FLT9jnTXxo%2BoRxcJpjjAgKuViCqvPU2GI1V3hMYjugRA0%2FY7i7E0W8X8tJLM8dhIJr39UWZCnfX%2FRivlmlh9xtiv5SzbPlTiC%2Fl7h7e83ESa%2FsiICrj%2FNbRC7PQkehgKI%2BAJQqsuuIaTCpdHiDy4UaOIOQQyyhnUY9hzdNkg8SHlsTnHqbMhxAo2FakpIVfRmBybFFJLg%2B0xzDX2v8lgWG0gIJ6ay725Gm8NosGmGEraT4UzNqNSPhpByNmvHobKYLKLH7cef5Zd9VTa7t8OcCzhXhOYmO28GLkowA4xS9dRlxQcjyyk77bpPR7aNIuji%2FTp3TvVXAo6syJgMmgBmqL7j2tKCD%2BMJsN3JDYkp4IOkG5hLcwkp6b8u0ebXvyiAOtaFvbWZSFm6gpUo4hJiMcseNh8barRsFI4KZK0mnvHG1hMZWwAzdFCWqWQ5Ff4aHyvUlLbmasp6ld7MFJQ9uxgKckq0AGlIjx9z3WdmxnIBMzYc5St2HMQnfhghZvshWevpVuxYNQrtKZ3MxcR%2BCrulIJe64pEFZxt3NHJwznkjozE6GGS4CZaWZZ8yN8fg2S4qwMk5Hm3xpdAqSVZO0F7CB1aVkCEQ13Xbq9qo4N%2BTVKCfGhNnZ7KRwCofh4AGyKvlWq4jmU3ZzVPVnC%2BbQ%2FXhORosFGpnkuJe%2FLG%2B0qVcvpzo0m8pXQ86Ttf3W9%2BtJ0G%2BuHIoM4HzgatCDI6GDJZfr8K4XD%2F%2BZ36XuazgpBnP5BbDNfGj6hHFwmmOMCAq5WIKq%2FXxo%2BoRxcJpjjAgKuViCqvfq6ek8aGJ66wfUclyFag%2FHD4rjHsexcduF9cf%2FhsVPY%3D&youdao_bid=29744cca-4752-48be-9cc7-e8fd40983998&youdao_deviceId=5adb0d4fa47f75255a703cc01f52efc1'
        },
        // touch事件锁
        touch_lock: false,
        // 锁住锤子 防止二次弹出显示框
        hammer_lock: true,
        // 锤子的向上偏移量
        hammer_offset: 200,
        // 锤子的样式
        hammerStyle: {},
        // 显示获得奖品flag
        show_prizelist: false,
        // 显示奖品flag
        show_prize: false,
        // 显示规则flag
        show_rule: false,
        // 当前active的金蛋
        active_egg: 0,
        // 打击最大次数
        egg_count_max: 9,
        // 剩余打击次数
        egg_count: 0,
        // 破碎鸡蛋的index
        egg_break: [],
        // 奖品栏偏移参数设置
        left_limit: 0,
        right_limit: 0,
        move_initial: 0,
        move_current: 0,
        move_scroll_current: 0,
        move_style: {
            transform: 'translate3d(-0px, 0px, 0px)',
            transitionDuration: '0s'
        },
        move_scroll_style: {
            transform: 'translate3d(-0px, 0px, 0px)',
            transitionDuration: '0s'
        },
        // 已获得奖品的列表
        getPrizeLists: [],
        // 奖品的列表（替换为静态资源）
        prizeLists: [{
            url: 'https://shared.ydstatic.com/ead/dynamic/img/288.png',
            text: '288红包'
        }, {
            url: 'https://shared.ydstatic.com/ead/dynamic/img/188.png',
            text: '188红包'
        }, {
            url: 'https://shared.ydstatic.com/ead/dynamic/img/88.png',
            text: '88红包'
        }, {
            url: 'https://shared.ydstatic.com/ead/dynamic/img/shoppingcar.png',
            text: '神秘好礼'
        }],
        // 鸡蛋的状态
        eggLists: [{ isstart: true, isbreak: false, isend: false, isshow: true }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }, { isstart: true, isbreak: false, isend: false, isshow: false }]
    },
    mounted: function mounted() {
        // 初始化获得广告位的列表，对应cms后台设置的json
        var index = this._bind_get_querystring('ad_index');
        var that = this;
        // 获取相应的广告配置list
        // this.$http.get('http://c.youdao.com/dsp/landing_dynamic_latest_list.json').then(function (response) {
        //     that.ad_idlist = response.data.ad_list[index];
        // });
        this.$http.get('http://localhost:3000/api/test').then(function (response) {
            that.ad_idlist = response.data.ad_list[index];
        });
        // 获得锤子的位置
        this.hammer_left = this.$refs.hammer.getBoundingClientRect().left;
        // 绑定yadk
        this.yadk = window.yadk;
        // 拿到当前落地页类型
        this.landing_type = this._bind_get_querystring('type');
        this.landing_app = this._bind_get_querystring('app');
        // 检查是否需要重置敲蛋次数
        this._bind_check_overdue();
        // 开启金蛋自动跳动
        this._bind_egg_auto_show();
        // 数据上报
        window._rlog = window._rlog || [];
        // 指定 product id
        window._rlog.push(["_setAccount", "ead_dynamic_landing"]);
        // 设置为 false，将不会自动发送 PV
        window._rlog.push(["_setAutoPageview", false]);
        // 增加一条自定义 'landing_pv'
        // window._rlog.push(["_trackEvent", `landing_pv|${this.landing_app}`]);
        window._hmt.push(['_trackEvent', 'page', 'enter', `landing_pv|${this.landing_app}`]);
    },
    destoryed: function destoryed() {
        clearInterval(this.timer);
    },
    methods: {
        // 测试小后门
        bind_clear_localstorage: function bind_clear_localstorage() {
            localStorage.removeItem('egg_updateTime');
        },
        // 过期更新鸡蛋次数的逻辑和已获得奖品
        _bind_check_overdue: function _bind_check_overdue() {
            var lastTime = localStorage.getItem('egg_updateTime');
            var currentM = new Date().getMonth();
            var currentD = new Date().getDate();
            if (lastTime && lastTime === currentM + '/' + currentD) {
                this.egg_count = localStorage.getItem('egg_count');
                this.egg_break = JSON.parse(localStorage.getItem('egg_break'));
                this.getPrizeLists = JSON.parse(localStorage.getItem('egg_prizelist'));
            } else {
                this.egg_count = this.egg_count_max;
                this.egg_break = [];
                localStorage.setItem('egg_count', this.egg_count_max);
                localStorage.setItem('egg_break', JSON.stringify([]));
                localStorage.setItem('egg_prizelist', JSON.stringify([]));
                localStorage.setItem('egg_updateTime', currentM + '/' + currentD);
            }
        },
        // 点击已获得奖品的跳转
        bind_getprize_jump: function bind_getprize_jump(item) {
            // 记录展示广告位下点击广告主的pv
            // window._rlog.push(["_trackEvent", `{${this.landing_app}|landing_adclick_pv: ${item.styleName}|${item.creativeid}}`]);
            window._hmt.push(["_trackEvent", 'ad', 'get', `landing_adclick_pv|${this.landing_app}|${item.styleName}|${item.creativeid}`]);
            // 记录点击广告位的pv
            // window._rlog.push(["_trackEvent", `{${this.landing_app}|landing_adclick_unique_pv:${item.creativeid}}`]);
            window._hmt.push(["_trackEvent", 'ad', 'get', `landing_adclick_unique_pv|${this.landing_app}|${item.creativeid}`]);
            window.open(item.to);
        },
        // 点击领取奖品的跳转
        bind_prize_jump: function bind_prize_jump() {
            // 跳转广告主，拿钱的逻辑
            // 记录展示广告位下点击广告主的pv
            // window._rlog.push(["_trackEvent", `{${this.landing_app}|landing_adclick_pv: ${this.prize.styleName}|${this.prize.creativeid}}`]);
            window._hmt.push(["_trackEvent", 'ad', 'get', `landing_adclick_pv|${this.landing_app}|${this.prize.styleName}|${this.prize.creativeid}`]);
            // 记录广告主的点击pvz
            // window._rlog.push(["_trackEvent", `{${this.landing_app}|landing_adclick_unique_pv:${this.prize.creativeid}}`]);            
            window._hmt.push(["_trackEvent", 'ad', 'get', `landing_adclick_unique_pv|${this.landing_app}|${this.prize.creativeid}`]);                        
            // 关闭弹窗
            this.show_prize = false;
            window.open(this.prize.clktracker);
        },
        // 展示获得奖品的列表
        bind_show_prizelist: function bind_show_prizelist() {
            this.show_prizelist = true;
        },
        bind_hide_prizelist: function bind_hide_prizelist() {
            this.show_prizelist = false;
        },
        // 展示规则
        bind_show_rule: function bind_show_rule() {
            this.show_rule = true;
        },
        // 隐藏规则
        bind_hide_rule: function bind_hide_rule() {
            this.show_rule = false;
        },
        // 隐藏红包
        bind_hide_redbag: function bind_hide_redbag() {
            this.show_prize = false;
        },
        // 点击金蛋事件
        bind_egg_tap: function bind_egg_tap(i, e) {
            var _this = this;
            this.active_egg = i;
            var move_left = e.target.offsetLeft + e.target.offsetWidth / 2;
            var move_top = e.target.offsetTop - e.target.offsetHeight / 2;
            var style = { transform: 'translate3d(-' + Math.abs(this.hammer_left - move_left) + 'px, ' + (move_top + this.hammer_offset) + 'px, 0)' };
            this.hammerStyle = style;
            this.hammer_lock = false;
            // 锤子归位
            setTimeout(function () {
                _this.hammer_lock = true;
                _this.hammerStyle = { transform: 'translate3d(0, 0, 0)' };
            }, 2000);
            // window._rlog.push(["_trackEvent", `${this.landing_app}|landing_eggclick_pv`]);
            window._hmt.push(["_trackEvent", 'ad', 'show', `landing_eggclick_pv|${this.landing_app}`]);
            // 请求广告位
            this._bind_request_ad(i);
        },
        bind_hammer_end: function bind_hammer_end() {
            var _this2 = this;

            if (!this.hammer_lock) {
                this.eggLists[this.active_egg].isstart = false;
                this.eggLists[this.active_egg].isbreak = true;
                // 1s后打破
                setTimeout(function () {
                    _this2.eggLists[_this2.active_egg].isbreak = false;
                    _this2.eggLists[_this2.active_egg].isend = true;
                    _this2.show_prize = true;
                }, 1000);
            }
        },

        /**
         * 请求广告的回调
         * adid 广告位id
         * total 请求的广告总数
         * real 实际返回的广告数
         */
        _bind_banner_notify: function _bind_banner_notify(ad) {
            // 在已获得奖品内插入广告奖品
            this.getPrizeLists.push({
                url: ad.mainimage || ad.iconimage,
                text: ad.title || ad.text,
                jump: ad.clktracker,
                title: ad.title,
                styleName: ad.styleName,
                clk: ad.clk
            });
            localStorage.setItem('egg_prizelist', JSON.stringify(this.getPrizeLists));
            /**
             * 更新剩余次数和已敲碎的蛋的id
             */
            this.egg_break.push(this.active_egg);
            this.egg_count = this.egg_count - 1;
            localStorage.setItem('egg_count', this.egg_count);
            localStorage.setItem('egg_break', JSON.stringify(this.egg_break));
        },
        /**
         * 获得比例区间
         */
        _bind_get_proportion: function _bind_get_proportion(addList) {
            return addList.reduce(function (pre, next) {
                pre.push(parseFloat(pre[pre.length - 1]) + next.id_proportion);
                return pre;
            }, [0]).slice(1);
        },
        // 检查出现广告主的重复性
        _bind_check_unique: function(ad) {
            var exit_prizeList = JSON.parse(localStorage.getItem('egg_prizelist'));
            for (var i=0; i<exit_prizeList.length; i++) {
                // 广告主clk一致,重新请求广告
                if (ad.clk == exit_prizeList[i].clk) {
                    return false;
                }
            }
            return true;
        },
        // 随机获取垫底广告
        _bind_get_backupAd: function() {
            let len = this.ad_backup.length;
            let random = Math.random()*len;
            return this.ad_backup[random];
        },
        /**
         * 请求广告
         */
        _bind_request_adcontent: function _bind_request_adcontent(adid) {
            var _this3 = this;
            //详细参数说明请参照说明文档
            this.yadk.config({
                id: adid,
                nt: '3G'
            });
            yadk.fetch((ad) => {
                var ad = ad[0];
                // 如果没有广告位出来 使用备用广告位
                if (!ad) {
                    ad = _this3.ad_backup;
                // 有广告位就判断广告位的唯一性
                } else if (!_this3._bind_check_unique(ad)) {
                    console.log(_this3.preq_count);
                    if (_this3.preq_count >= _this3.preq_count_max) {
                        // 超过最大请求次数,使用备用广告位
                        ad = _this3.ad_backup;
                        // 请求数清零
                        _this3.preq_count = 0;
                    } else {
                        // 重新请求广告位
                        _this3._bind_request_ad();
                        _this3.preq_count = _this3.preq_count + 1;
                        return;
                    }
                }
                // 记录展示广告位下展示广告主的pv
                // window._rlog.push(["_trackEvent", `{${this.landing_app}|landing_adshow_pv:${ad.styleName}|${ad.creativeid}}`]);
                // 记录展示广告主的pv
                window._hmt.push(["_trackEvent", `landing_adshow_unique_pv|${this.landing_app}|${ad.creativeid}`]);                
                _this3.prize = ad;
                _this3._bind_banner_notify(ad);
                yadk.showed(ad.imptracker);
                // 请求数清零
                _this3.preq_count = 0;
            });
        },

        /**
         *  广告位请求
         *  index 被打碎的蛋
         */
        _bind_request_ad: function _bind_request_ad(index) {
            var choose_id = void 0;
            var random = Math.random(1);
            var proportion = this._bind_get_proportion(this.ad_idlist);
            for (var i = 0; i < proportion.length; i++) {
                if (random > proportion[i]) {
                    continue;
                } else if (random < proportion[i]) {
                    choose_id = i;
                    break;
                }
            }
            this._bind_request_adcontent(this.ad_idlist[choose_id].id_name);
        },
        /**
         * 金蛋自动show，去掉已经打掉的金蛋
         */
        _bind_egg_auto_show: function _bind_egg_auto_show(e) {
            var _this4 = this;

            this.eggLists.forEach(function (item, index) {
                if (_this4.egg_break.indexOf(index) > -1) {
                    item.isshow = false;
                    item.isstart = false;
                    item.isend = true;
                    return;
                }
            });
            this.timer = setInterval(function () {
                var currentIndex = void 0;
                var firstIndex = void 0;
                try {
                    _this4.eggLists.forEach(function (item, index) {
                        if (item.isstart) {
                            // 定义第一个未破的蛋
                            if (!firstIndex && firstIndex != 0) {
                                firstIndex = index;
                            }
                            // currentIndex已经定义 然后证明这是下一个要show的
                            if (currentIndex) {
                                item.isshow = true;
                                throw index;
                            } else if (item.isshow) {
                                item.isshow = false;
                                currentIndex = true;
                            }
                        }
                    });
                    // 一个循环完了之后 
                    if (firstIndex || firstIndex == 0 && !currentIndex) {
                        _this4.eggLists[firstIndex].isshow = true;
                    } else if (!firstIndex && !currentIndex) {
                        // 如果蛋都被砸烂了 直接消除计时器
                        clearInterval(_this4.timer);
                    }
                } catch (e) {}
            }, 1000);
        },
        // 获得url参数
        _bind_get_querystring: function _bind_get_querystring(name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return unescape(r[2]);
            }
            return null;
        }
    }
});