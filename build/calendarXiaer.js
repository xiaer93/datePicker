/*
*   日期选择UI，快速构建日期选择功能
* */

"use strict";

(function ($) {
    //jq支持检测
    if(typeof $ ==="undefined"){
        throw new Error("当前浏览器不支持jQuery。");
    }
    /*
    *   function 日历类
    *   @param  [element]   element 日历的input元素
    *   @param  [element]   wrap    日历的包含块元素
    *   @param  [object]    options     传入用户参数
    * */
    var Daclendar=function (element,wrap,options) {
        this.elem=$(element);
        this.wrap=$(wrap);
        this.container=null;
        this.selected=undefined;
        this.today=new Date();
        this.current=this.today;
        this.modeView="day";
        //配置项
        this.rangeMin=options.rangeMin;
        this.rangeMax=options.rangeMax;
        this.theme=options.theme;
        this.format=options.format;

        //创建对象
        this.create();
        //设置配置
        this.init(options);

        //执行主体程序
        try{
            //绑定事件,直接使用container为私有变量
            var that=this;
            //事件委托
            this.container.on("click",".calendar_xr_panel",function (event) {
                //this指向对应的元素，如果为插件this为jq对象
                if($(event.target).hasClass("calendar_xr_panel_left")){
                    that.clickPA("left",false);
                }else if($(event.target).hasClass("calendar_xr_panel_right")){
                    that.clickPA("right",false);
                }else if($(event.target).hasClass("calendar_xr_panel_center")){
                    that.clickPA(undefined,true);
                }
            }).on("click",".calendar_xr_date_tbody",function (event) {
                that.clickBY(event,that.selectedResponse);
            }).on("click",".calendar_xr_wrapper",function () {
                that.container.hide();//单击遮罩隐藏日历
                that.viewSelected(that.selected);//意外退出时更新日历
                //debugger;
            }).on("click",function (event) {
                event.stopPropagation();//UI内部的click事件不再冒泡至上层
            })
        }catch(e) {
            console.log(e.message);
        }finally {
            this.current=new Date(this.selected);
        }
    };
    Daclendar.prototype={
        constructor:Daclendar,
        /*初始化参数配置*/
        init:function (options) {
            //修改wrap和elem标签属性
            this.wrap.css("position","relative");
            this.elem.attr("readonly","readonly");
        },
        /*
        *   日期有效性检查
        * */
        checkDate:function (date) {
            var d=new Date(date);
            if(this.rangeMin && this.rangeMin>d){
                return false;
            }
            if(this.rangeMax && this.rangeMax<d){
                return false;
            }
            return true;
        },
        /*
        *   格式化输出，被selectedResponse调用
        * */
        formatDate:function (date) {
            var f=this.format,//字面常量
                tmp;
            f=f.replace(/\w+/g,function (value) {
                switch (value){
                    case "yyyy":
                        tmp=date.getFullYear();
                        return tmp;
                    case "mm":
                        tmp=String(date.getMonth()+1);
                        return tmp.length===2?tmp:"0"+tmp;
                    case "dd":
                        tmp=String(date.getDate());
                        return tmp.length===2?tmp:"0"+tmp;
                }
            });
            return f;
        },
        /*
        *   构造基础界面
        * */
        //append的参数可以为数组！
        create:function () {
            //遮罩层
            var overWrap=$("<div>").addClass("calendar_xr_wrapper");

            var calendar=$("<section>").addClass("calendar_xr"),
                calendar_card=$("<div>").addClass("calendar_xr_card"),
                calendar_panel=$("<div>").addClass("calendar_xr_panel"),
                calendar_date=$("<div>").addClass("calendar_xr_date");
            calendar.append(calendar_card).append(calendar_panel).append(calendar_date).append(overWrap);

            var calendar_card_year=$("<span>").addClass("calendar_xr_card_year"),
                calendar_card_month=$("<span>").addClass("calendar_xr_card_month"),
                calendar_card_day=$("<span>").addClass("calendar_xr_card_day");
            calendar_card.append(calendar_card_year).append(calendar_card_month).append(calendar_card_day);

            var calendar_panel_left=$("<span>&lt;</span>").addClass("calendar_xr_panel_left"),
                calendar_panel_center=$("<span>").addClass("calendar_xr_panel_center"),
                calendar_panel_right=$("<span>&gt;</span>").addClass("calendar_xr_panel_right");
            calendar_panel.append(calendar_panel_left).append(calendar_panel_center).append(calendar_panel_right);

            var calendar_date_thead=$("<div>").addClass("calendar_xr_date_thead");

            calendar_date_thead.append($("<span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><tspan>五</tspan><span>六</span>"));
            calendar_date.append(calendar_date_thead);

            var calendar_date_tbody=$("<div>").addClass("calendar_xr_date_tbody");
            calendar_date.append(calendar_date_tbody);

            //主题，通过标签属性设置主题！
            calendar.attr("data-theme", this.theme);

            this.container=calendar;
            this.wrap.append(this.container);
            //添加日期信息
            if(typeof this.selected ==="undefined"){
                this.selected=new Date(this.today);
            }
            this.current=new Date(this.selected);
            this.viewSelected(this.selected);
        },
        /*
        *   创建日期文档片段，并且为this.selected添加selected类
        *   @param Date 所要显示日历的日期
        *   @return tbody
        * */
        createDays:function (date) {
            //是否为选中日期同年月！
            var flag=false;
            if(this.selected && this.selected.getFullYear()===date.getFullYear() && this.selected.getMonth()===date.getMonth()){
                flag=true;
            }
            //私有函数,获取指定日期当月的天数
            var getTotalDays=function (d) {
                return new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
            };
            var showDate=new Date(date);
            this.current.setFullYear(showDate.getFullYear());
            this.current.setMonth(showDate.getMonth());

            //返回的文档片段
            var tbody=$("<div>").addClass("calendar_xr_date_tbody");

            var sp=$("<span>");
            showDate.setDate(1);
            var day=showDate.getDay();
            var currentDays=getTotalDays(showDate);
            var lastDays=getTotalDays(new Date(showDate.getFullYear(),showDate.getMonth()-1,showDate.getDate()));

            //当前日历的上一个月，0代表星期天
            var beg=undefined;
            if(day!==0){
                beg=lastDays-day+1;
            }else{
                beg=lastDays-7+1;
            }
            for(;beg<=lastDays;++beg){
                sp.append($("<span><span>"+beg+"</span></span>").addClass("calendar_xr_date_tbody_date pdate"));
            }

            //当前日历，和下一个月
            var i,j;beg=1;
            for(i=0;i<6;++i){
                sp=(i===0)?sp:$("<span>");
                j=(i===0)?(sp.children("span").length):0;
                for(;j<7;++j){
                    if(beg<=currentDays){
                        //添加selected类
                        if(flag && date.getDate()===beg){
                            sp.append($("<span><span>"+beg+"</span></span>").addClass("calendar_xr_date_tbody_date cdate selected"));
                        }else{
                            sp.append($("<span><span>"+beg+"</span></span>").addClass("calendar_xr_date_tbody_date cdate"));
                        }
                    }else{
                        sp.append($("<span><span>"+(beg-currentDays)+"</span></span>").addClass("calendar_xr_date_tbody_date ndate"));
                    }
                    beg+=1;
                }
                tbody.append(sp);
            }
            return tbody;
        },
        /*
        *   创建月份文档片段
        *   @param  [Date]   Date
        *   @return [element]   tbody
        * */
        createMonth:function (date) {
            var showDate=new Date(date);

            var tbody=$("<div>").addClass("calendar_xr_date_tbody");

            var months=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",]
            var i,j;
            for(i=0;i<3;++i){
                var tr=$("<span>");
                for(j=0;j<4;++j){
                    tr.append($("<span><span>"+months[(i*4+j)]+"</span></span>").addClass("calendar_xr_date_tbody_date"));
                }
                tbody.append(tr);
            }
            return tbody.css("height","100%");
        },
        /*
        *   创建年份文档片段
        *   @param  [Date] date
        *   @return [element] tbody
        * */
        createYear:function (date) {
            var showDate=new Date(date);

            var tbody=$("<div>").addClass("calendar_xr_date_tbody");

            var currentYear=showDate.getFullYear();
            var beg=currentYear-4;

            var i,j;
            for(i=0;i<3;++i){
                var tr=$("<span>");
                for(j=0;j<4;++j){
                    tr.append($("<span><span>"+(beg++)+"</span></span>").addClass("calendar_xr_date_tbody_date"));
                }
                tbody.append(tr);
            }
            return tbody.css("height","100%");
        },
        /*
        *   tbody部分响应单击事件
        * */
        clickBY:function (event,callback) {

            //对状态进行判断
            if(this.modeView==="year"){
                var year=parseInt($(event.target).text());
                this.current.setFullYear(year);
                this.viewSelected(this.current);
                this.modeView="month";
            }else if(this.modeView==="month"){
                var months={"一月":1,"二月":2,"三月":3,"四月":4,"五月":5,"六月":6,"七月":7,"八月":8,"九月":9,"十月":10,"十一月":11,"十二月":12,};
                var month=months[$(event.target).text()];
                this.current.setMonth(month-1);
                this.viewSelected(this.current);
                this.modeView="day";
            }else if(this.modeView==="day"){
                if($(event.target).hasClass("pdate")){
                    this.current.setMonth(this.current.getMonth()-1);
                }
                if($(event.target).hasClass("ndate")){
                    this.current.setMonth(this.current.getMonth()+1);
                }
                var day=parseInt($(event.target).text());
                this.current.setDate(day);
                this.selected=new Date(this.current);
                this.viewSelected(this.selected);
                this.modeView="day";

                //响应回调函数
                if(callback){
                    callback.call(this,this.selected);//绑定执行环境！
                }
            }
        },
        /*
        *   panel部分响应单击事件
        * */
        clickPA:function (dir,changeMode) {
            var tbody=this.container.find(".calendar_xr_date_tbody");
            var caption=this.container.find(".calendar_xr_panel_center");
            var thead=this.container.find(".calendar_xr_date_thead");

            if(changeMode && changeMode===true){
                if(this.modeView==="day"){
                    var body=this.createMonth(this.current);
                    thead.css("display","none");
                    this.minAndMax(body,tbody,"min");
                    caption.text(this.current.getFullYear()+"年"+(this.current.getMonth()+1)+"月");
                    this.modeView="month";
                }else if(this.modeView==="month"){
                    var body=this.createYear(this.current);
                    thead.css("display","none");
                    this.minAndMax(body,tbody,"min");
                    caption.text(this.current.getFullYear()+"年");
                    this.modeView="year";
                }else{
                    return;
                }
            }else{
                var direction={"left":-1,"right":1};
                if(this.modeView==="day"){
                    this.current.setMonth(this.current.getMonth()+direction[dir]);
                    var body=this.createDays(this.current);
                    this.leftAndright(body,tbody,dir);
                    caption.text(this.current.getFullYear()+"年"+(this.current.getMonth()+1)+"月");
                }else if(this.modeView==="year"){
                    this.current.setFullYear((this.current.getFullYear()+direction[dir]*7));
                    var body=this.createYear(this.current);
                    this.leftAndright(body,tbody,dir);
                    caption.text(this.current.getFullYear()+"年");
                }else{
                    this.current.setFullYear((this.current.getFullYear()+1));
                    var body=tbody.clone(true);
                    this.leftAndright(body,tbody,dir);
                    caption.text(this.current.getFullYear()+"年");
                }
            }
        },
        /*
        *   选中日期后作为回调函数被执行
        * */
        selectedResponse:function (date) {
            //this.selected=new Date(date);//执行环境为clickBY，所以this指向undefined！！！
            //在调用此函数的时候通过call绑定了作用环境
            var d=this.formatDate(date);
            //jq的event对象才可以通过jq触发！
            var e=$.Event("dateChanged",{date:d});
            this.elem.trigger(e);
        },
        /*
        *   根据输入日期和对应的模式显示日历
        * */
        viewSelected:function (date) {
            var showDate=new Date(date);
            var tbody=this.container.find(".calendar_xr_date_tbody");
            var thead=this.container.find(".calendar_xr_date_thead");
            var card_year=this.container.find(".calendar_xr_card_year"),
                card_month=this.container.find(".calendar_xr_card_month"),
                card_day=this.container.find(".calendar_xr_card_day"),
                card=this.container.find(".calendar_xr_card"),
                caption=this.container.find(".calendar_xr_panel_center");

            var body=null;

            switch (this.modeView){
                case "year":
                    body=this.createMonth(showDate);
                    this.minAndMax(body,tbody,"max");
                    caption.text(showDate.getFullYear()+"年");
                    break;
                case "month":
                    body=this.createDays(showDate);
                    this.minAndMax(body,tbody,"max");
                    caption.text(showDate.getFullYear()+"年"+(showDate.getMonth()+1)+"月");
                    thead.css("display","flex");//显示星期天》星期六
                    break;
                case "day":
                    tbody.replaceWith(this.createDays(showDate,true));
                    caption.text(showDate.getFullYear()+"年"+(showDate.getMonth()+1)+"月");
                    card_day.text(showDate.getDate());
                    card_month.text(showDate.getMonth()+1);
                    card_year.text(showDate.getFullYear());
                    break;
            }
        },
        /*
        *   左右移动动画效果
        *   param   [element] body  替换tbody的新元素
        *   param   [element]   tbody   被替换的旧元素
        *   param   [boolean]   dir     缩小还是放大！
        * */
        leftAndright:function (body,tbody,dir) {
            var bodyWrap=tbody.parent(),
                that=this;
            bodyWrap.append(body.addClass(dir==="left"?"calendar_xr_transition_left":"calendar_xr_transition_right"));
            setTimeout(function () {
                tbody.addClass(dir==="left"?"calendar_xr_transition_right":"calendar_xr_transition_left");
                body.removeClass(dir==="left"?"calendar_xr_transition_left":"calendar_xr_transition_right");
                setTimeout(function () {
                    tbody.remove();//删除元素包括自身!
                },500);
            },4);
        },
        /*
        *   缩放动画效果
        *   param   [element] body  被替换的元素
        *   param   [element]   tbody   替换body的新元素
        *   param   [boolean]   dir     缩小还是放大！
        * */
        minAndMax:function (body,tbody,dir) {
            var that=this;
            tbody.replaceWith(body.addClass(dir==="min"?"calendar_xr_transition_min":"calendar_xr_transition_max"));
            setTimeout(function () {
                body.removeClass(dir==="min"?"calendar_xr_transition_min":"calendar_xr_transition_max");
            },4);
        },
        /*
        *   单击显示UI函数
        * */
        show:function () {
            this.container.fadeIn(200);
        },
        /*
        *   单击隐藏UI函数
        * */
        hide:function () {
            this.container.fadeOut(200);
        }
    };

    //配置jq插件
    $.fn.dcalendar=function (options) {
        return this.each(function () {
            var DCAL="dca",
                $this=$(this);
            options=$.extend($.fn.dcalendar.defaultOp,options);
            if(!$this.data(DCAL)){
                $this.data(DCAL,(new Daclendar(this,$this.next(),options)));
            }
            //监听dateVhange事件
            $this.on("dateChanged",function (event) {
                $(this).val(event.date);
                $(this).data(DCAL).hide();
            }).on("click",function (event) {
                $(this).data(DCAL).show();
            });

            //esc退出事件
            $(document).on('keydown', function (e) {
                if(e.keyCode != 27) return;
                $this.data(DCAL).hide();
            });
        });

    };
    $.fn.dcalendar.defaultOp={
        rangeMin:undefined,
        rangeMax:undefined,
        theme:"blue",
        format:"yyyy-mm-dd",
    };
})(jQuery);
