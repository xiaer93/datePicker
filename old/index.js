/*
* completed by xiaer93
* */

require("./datamain.css");
const $=require("jquery");

//日期经过赋值，会转为对应的秒，纯数字！（如date=date.setDate(1)）

//返回选中日期Date对象
let DateSelect=function (contain,{date=new Date(),mulit=false}={}) {
    let container=contain;
    let mulitSelect=mulit;
   // let oriDate=date;
    let showDate=new Date(date);showDate.setDate(1);
    let getDateStart=null;
    let getDateEnd=null;

    //初始化函数，创建日历
    this.init=function () {
        //日历UI的标题
        let prevSpan=$("<span>&lt;&leftarrow;</span>").click(prevMonth);
        let nextSpan=$("<span>&gt;&rightarrow;</span>").click(nextMonth);
        let header=$("<div>").append($("<h2>")).append(prevSpan).append(nextSpan);
        $(container).append(header);
        //日历UI的日期
        let table=$("<table><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table>");
        $(container).append(table);

        //根据绘制日历（标题、月份）
        renderDate(showDate,getDateStart,getDateEnd,mulitSelect);
        //绑定单击事件
        bindClick();
    };
    let prevMonth=function () {
        showDate.setMonth(new Date(showDate).getMonth()-1);
        renderDate(showDate,getDateStart,getDateEnd,mulitSelect);
    };
    let nextMonth=function () {
        showDate.setMonth(new Date(showDate).getMonth()+1);
        renderDate(showDate,getDateStart,getDateEnd,mulitSelect);
    };
    //renderDate，根据信息绘制日历
    let renderDate=function (date, s, e, mulits=false) {
        //将s、e转为date对象。
        let dates=new Date(s);
        let datee=new Date(e);

        //获取当天时间
        let dnow=new Date();

        //设置header的年月
        let dshow=new Date(date);
        $("h2",container).text(dshow.getFullYear()+"年"+(dshow.getMonth()+1)+"月");

        //设置tbody
        //获取该月日历表中，第一行第一个元素的日期！
        let dbeg=new Date(date);
        dbeg.setDate(dbeg.getDate()-dbeg.getDay());

        let tbody=$("<tbody>");
        let i,
            j;
        for(i=0;i<6;++i){
            let tr=$("<tr>");
            for(j=0;j<7;++j){
                let td=$("<td>").text(dbeg.getDate());
                //非本月日期添加特殊样式
                if(dbeg.getMonth()!==dshow.getMonth()){
                    __notMonth(td);
                    //设置下月的date值，区分上一个月和下一个月！
                    if(i>=4){
                        td.data("nextMonth",true);
                    }else{
                        td.data("nextMonth",false);
                    }
                }
                //特殊标记当天。
                if(dbeg.getFullYear()===dnow.getFullYear() && dbeg.getMonth()===dnow.getMonth() && dbeg.getDate()===dnow.getDate()){
                    __oriDay(td);
                }
                //特殊标记被选中的日期getdataStart
                if(s!==null && dbeg.getMonth()===dates.getMonth() && dbeg.getDate()===dates.getDate()){
                    __selectDay(td);
                }
                //特殊标记被选中的日期getdataEnd
                else if(e!==null && mulits && dbeg.getMonth()===datee.getMonth() && dbeg.getDate()===datee.getDate()){
                    __selectDay(td);
                }
                tr.append(td);
                //日期递增！
                dbeg.setDate(dbeg.getDate()+1);
            }
            tbody.append(tr);
        }
        $("tbody",container).replaceWith(tbody);
    };
    //将click绑定在table上，事件委托
    let bindClick=function () {
        $("table",container).click(function (event) {
            //选中日期，刷新日历
            if(event.target.tagName.toLowerCase()==="td"){
                //判断选中日期的月份
                if($(event.target).hasClass("NotMonth")) {
                    if ($(event.target).data("nextMonth") === true) {
                        showDate.setMonth(showDate.getMonth() + 1);
                    } else {
                        showDate.setMonth(showDate.getMonth() - 1);
                    }
                }
                //判断是否为多选
                if(mulitSelect && getDateStart!==null){
                    getDateEnd=new Date(showDate);
                    getDateEnd.setDate($(event.target).text());
                    //如果结束日期早于开始日期，则开始日期等于结束日期
                    if(getDateStart>getDateEnd){
                        getDateStart=getDateEnd;
                    }
                }else{
                    getDateStart=new Date(showDate);
                    getDateStart.setDate($(event.target).text());
                }
                //刷新日期
                renderDate(showDate,getDateStart,getDateEnd,mulitSelect);
                //返回被选中的日期
                return {getDateStart,getDateEnd};
            }
        })
    };
    let __oriDay=function (element) {
        $(element).addClass("oriDay");
    };
    let __selectDay=function (element) {
        $(element).addClass("selectDay");
    };
    let __notMonth=function (element) {
        element.addClass("NotMonth");
    };
};

let d=new DateSelect("#dateSelect");
d.init();
