/*
 * jQuery.minFocusScroll  v0.0.2
 * Copyright (c) 2014-11-06 11:29 Jensen
 * 功能：首页焦点图滑动效果，兼容PC和手机端android,ios
 * 修复：修复了窗口大小改变后图片的自适应问题  --v0.02
 */

var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return { //移动终端浏览器版本信息
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1 //是否iPad
        };
    }()
};

(function($){
    /* 图片轮换效果一无限左右移动切换(无线循环) ,右下角同步数字显示张数并左右翻页*/
    picsPageScrolling = function(options){
        var opts = $.extend({
            scrollId: options.scrollId,   //滑动字体父节点
            lMoveId: options.lMoveId,    //左边切换按钮
            rMoveId: options.rMoveId,    //右边切换按钮
            autoPlay: options.autoPlay || false,    //是否自动播放
            speed: options.speed || 300,   //播放速度/秒
            pageId: options.pageId || false,      //分页的父节点
            dotOnclassname: options.dotOnclassname || 'on'    //分页被选中样式
        },options);

        var len = $(opts.scrollId+' li').length;
        $(opts.scrollId+' li').css('width',$(document).width());
        var wid = $(opts.scrollId+' li').width();
        var _scrollTimeObj;
        var s = 0;     //记录自动播放时的页数
        if(len == 1) return false;    //只有一张图片的时候不做任何操作

        //页面大小变化需要刷新页面
        $(window).resize(function(){
            var _left = ($(document).width() - len * 20)/2 - 5;
            $(opts.scrollId+' li').css('width',$(document).width());
            $(opts.scrollId+' li img').css('width',$(document).width());
            $(opts.pageId).css('left',_left);
            wid = $(document).width();
        });

        if(opts.pageId){    //判断是否有分页
            var _left = (wid - len * 20)/2 - 5;  //定位切换的小圆点
            for(var i=0;i<len;i++){
                var pageSpan = $('<span></span>').attr('rel',i);    //创建分页子节点
                $(opts.pageId).append(pageSpan);
            };
            $(opts.pageId).css('left',_left).show();
            $(opts.pageId+' span').removeClass().eq(0).addClass(opts.dotOnclassname);
        };
        $(opts.scrollId+' li').each(function(i){
            $(this).attr('rel',i);
        })
        var cons = $(opts.scrollId).clone().html();
        $(opts.lMoveId).click(function(){    //左边按钮效果
            pageTo(-1);
        });
        $(opts.rMoveId).click(function(){    //右边按钮效果
            pageTo(1);
        });

        $(opts.scrollId).parent().hover(function(){
            $(opts.lMoveId).show();
            $(opts.rMoveId).show();
        },function(){
            $(opts.lMoveId).hide();
            $(opts.rMoveId).hide();
        });

        var pageTo = function(n){    //分页自动切换样式显示
            if($(opts.scrollId).is(":animated")==false){
                s += n;
                if(s != -1 && s != len){    //向右滑动
                    $(opts.scrollId).animate({'marginLeft':-wid*s+'px'},opts.speed*100);
                    var rel = $(opts.scrollId+' li').eq(s).attr('rel');
                    slide(rel);
                }else if(s == -1){   //向左滑动
                    s = len-1;
                    for(var i=len-1;i>0;i--){
                        $(opts.scrollId+' li:last').prependTo($(opts.scrollId));
                    }
                    $(opts.scrollId).css({'marginLeft':-wid*s+'px'});
                    $(opts.scrollId).animate({'marginLeft':-wid*(s-1)+'px'},opts.speed*100);
                    s = len-1-1;
                    var rel = $(opts.scrollId+' li').eq(s).attr('rel');
                    slide(rel);
                }else if(s == len){    //向左滑动到最大值时转变
                    s = 1;    //修复s的值
                    $(opts.scrollId).css({'marginLeft':0+'px'});    //将列表图片滑动到初始位置
                    for(var i=len-1;i>0;i--){    //将列表图片位置按图片rel切换0 1 2 3 （3为当前显示的图片） ==>3 0 1 2 （3为当前显示的图片）
                        $(opts.scrollId).append($(opts.scrollId+' li:first'));
                    }
                    $(opts.scrollId).animate({'marginLeft':-wid+'px'},opts.speed*100);
                    var rel = $(opts.scrollId+' li').eq(s).attr('rel');
                    slide(rel);
                }
            }
        };
        if(opts.pageId){
            function slide(m){
                $(opts.pageId+' span').removeClass().eq(m).addClass(opts.dotOnclassname);    //分页样式指定显示
            }
//            $(opts.pageId+' span').click(function(){
//                s = parseInt($(this).attr('rel'));    //转换字符串为数字类型
//               fade(s);
//               slide(s);
//            });
            function fade(j){
                $(opts.scrollId+' li').remove();
                $(opts.scrollId).append(cons);    //初始化图片列表
                $(opts.scrollId).css("marginLeft",-wid*j+"px");
                $(opts.scrollId).fadeOut(0,function(){
                    $(opts.scrollId).fadeIn(500);
                });
            }
        }
        var play = function(){    //播放
            _scrollTimeObj = setInterval(function(){
                pageTo(1);
            },opts.speed*1000);
        };
        var stop = function(){    //停止
            clearInterval(_scrollTimeObj);
        };

        if(opts.autoPlay){play();};  //是否自动播放

        //手机 wap左右滑动
        var startX = 0, startY = 0, endX = 0;
        var slideMove = '';
        function touchSatrtFunc(evt){
            try{
                var touch = evt.touches[0];
                var x = Number(touch.pageX);
                var y = Number(touch.pageY);
                startX = x;
                startY = y;
                //evt.stopPropagation();
                //evt.preventDefault();
                endX = startX;
            }catch(e){

            };
        };

        function touchMoveFunc(evt){
            try{
                var touch = evt.touches[0];
                var x = Number(touch.pageX);
                var y = Number(touch.pageY);
                if (browser.versions.android){
                    if(x - startX < -10){
                        slideMove = 'left';
                        pageTo(1);
                    }else if(x - startX > 10){
                        slideMove = 'right';
                        pageTo(-1);
                    };
                }else{
                    //alert(x - startX);
                    if(x - startX < -10){
                        slideMove = 'left';
                    }else if(x - startX > 10){
                        slideMove = 'right';
                    };
                    endX = startX -x;
                    stop();
                    //alert(slideMove);
                }
                evt.stopPropagation();
            }catch(e){

            };
        };

        function touchEndFunc(){
            try{
                if(startX == endX){    //判断是否点击还是左右拖动,点击直接跳转链接
                    var _href = $(opts.scrollId+' li').eq(m).find('a').attr('href');
                    window.location.href = _href;
                };
                if(slideMove == 'left'){
                    pageTo(1);play();
                }else if(slideMove == 'right'){
                    pageTo(-1);play();
                }else{
                    play();
                }
            }catch(e){

            };
        };

        function bindEvent(){
            document.getElementById('newx-pics-allpic').addEventListener('touchstart', touchSatrtFunc, false);
            document.getElementById('newx-pics-allpic').addEventListener('touchmove',touchMoveFunc, false);
            document.getElementById('newx-pics-allpic').addEventListener('touchend', touchEndFunc, false);
        };

        try{
            document.createEvent("TouchEvent");
            bindEvent();
        }catch(e){}
    };

})(jQuery);

function indexBigPic(){
    picsPageScrolling({
        scrollId: "#newx-pics-allpic",
        pageId: "#numInner",
        //lMoveId: ".newx-pics-allshow .prev",
        //rMoveId: ".newx-pics-allshow .next",
        autoPlay: true,
        speed: 4
    });
}