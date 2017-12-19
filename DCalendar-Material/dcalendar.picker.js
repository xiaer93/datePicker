/* -- DO NOT REMOVE --
 * jQuery DCalendar and DCalendar Picker 2.1 plugin
 * 
 * Author: Dionlee Uy
 * Email: dionleeuy@gmail.com
 *
 * Date: Thursday, May 12 2016
 *
 * @requires jQuery
 * -- DO NOT REMOVE --
 */
if (typeof jQuery === 'undefined') { throw new Error('DCalendar.Picker: This plugin requires jQuery'); }
+function ($) {

	Date.prototype.getDays = function() { return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate(); };

	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
		short_months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		daysofweek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
		short_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		ex_keys = [9,112,113,114,115,116,117,118,119,120,121,122,123],
		DCAL_DATA = 'dcalendar',

		DCalendar = function(elem, options) {
			this.elem = $(elem);
			this.options = options;
			this.calendar = null;		//calendar container
			this.today = new Date();	//current date

			//初始化时，reformatdate从输入框的value中读取日期，赋值给this.data
			this.date = this.elem.val() === '' ? new Date() : this.reformatDate(this.elem.val()).date;
			this.viewMode = 'days';
			this.minDate = this.elem.data('mindate');
			this.maxDate = this.elem.data('maxdate');
			this.rangeFromEl = this.elem.data('rangefrom');
			this.rangeToEl = this.elem.data('rangeto');
			
			this.selected = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
			
			var that = this;

			this.create(this.viewMode);

			this.calendar.find('.calendar-head-card .calendar-date-wrapper').click(function () {
				that.selected = new Date(that.today.getFullYear(), that.today.getMonth(), that.today.getDate());

				//Trigger select event
				that.selectDate();
				that.selectedView();
			});
			this.calendar.find('.calendar-prev').click(function () { that.getNewMonth('left', true); });
			this.calendar.find('.calendar-next').click(function () { that.getNewMonth('right', true); });
			this.calendar.find('.calendar-curr-month').click(function () { that.getMonths(); });
			//on绑定事件，取消为off；不再推荐使用live。一个选择器字符串，用于过滤出被选中的元素中能触发事件的后代元素。
			//on事件主要用于事件委托，第二选项可以使用子元素过滤器，满足条件则触发！
		    this.calendar.find('.calendar-date-holder').on('click', '.calendar-dates .date:not(.date.month) a', function () {
		    	//jq插件中this指向该元素的jq对象
		    	var span = $(this).parent(),
		    		day = parseInt($(this).text()),
					plus = span.hasClass('pm') ? -1 : span.hasClass('nm') ? 1 : 0,
					selectedDate = new Date(that.date.getFullYear(), that.date.getMonth() + plus, day);

				if(that.disabledDate(selectedDate)) return;

				that.selected = selectedDate;
				that.calendar.find('.calendar-dates .date').removeClass('selected');
				span.addClass('selected');

				//Trigger select event
				that.selectDate();
				//绑定月份的click事件
			}).on('click', '.calendar-dates .date.month a', function () {
				var selMonth = parseInt($(this).parent().attr('data-month'));
				that.viewMode = 'days';
				that.date.setMonth(selMonth);
				that.getNewMonth(null, false);
			});

			this.getNewMonth(null, false);
		};

	DCalendar.prototype = {
		constructor : DCalendar,
		/* Parses date string using default or specified format. */
		reformatDate : function (date, dateFormat) {
			var that = this,
				format = typeof dateFormat === 'undefined' ? that.options.format : dateFormat,
				dayLength = (format.match(/d/g) || []).length,
				monthLength = (format.match(/m/g) || []).length,
				yearLength = (format.match(/y/g) || []).length,
				isFullMonth = monthLength == 4,
				isMonthNoPadding = monthLength == 1,
				isDayNoPadding = dayLength == 1,
				lastIndex = date.length,
				firstM = format.indexOf('m'), firstD = format.indexOf('d'), firstY = format.indexOf('y'),
				month = '', day = '', year = '';

			// Get month on given date string using the format (default or specified)
			if(isFullMonth) {
				var monthIdx = -1;
				$.each(months, function (i, m) { if (date.indexOf(m) >= 0) monthIdx = i; });
				month = months[monthIdx];
				format = format.replace('mmmm', month);
				firstD = format.indexOf('d');
				firstY = firstY < firstM ? format.indexOf('y') : format.indexOf('y', format.indexOf(month) + month.length);
			} else if (!isDayNoPadding && !isMonthNoPadding || (isDayNoPadding && !isMonthNoPadding && firstM < firstD)) {
				month = date.substr(firstM, monthLength);
			} else {
				var lastIndexM = format.lastIndexOf('m'),
					before = format.substring(firstM - 1, firstM),
					after = format.substring(lastIndexM + 1, lastIndexM + 2);

				if (lastIndexM == format.length - 1) {
					month = date.substring(date.indexOf(before, firstM - 1) + 1, lastIndex);
				} else if (firstM == 0) {
					month = date.substring(0, date.indexOf(after, firstM));
				} else {
					month = date.substring(date.indexOf(before, firstM - 1) + 1, date.indexOf(after, firstM + 1));
				}
			}

			// Get date on given date string using the format (default or specified)
			if (!isDayNoPadding && !isMonthNoPadding || (!isDayNoPadding && isMonthNoPadding && firstD < firstM)) {
				day = date.substr(firstD, dayLength);
			} else {
				var lastIndexD = format.lastIndexOf('d');
					before = format.substring(firstD - 1, firstD),
					after = format.substring(lastIndexD + 1, lastIndexD + 2);

				if (lastIndexD == format.length - 1) {
					day = date.substring(date.indexOf(before, firstD - 1) + 1, lastIndex);
				} else if (firstD == 0) {
					day = date.substring(0, date.indexOf(after, firstD));
				} else {
					day = date.substring(date.indexOf(before, firstD - 1) + 1, date.indexOf(after, firstD + 1));
				}
			}

			// Get year on given date string using the format (default or specified)
			if (!isMonthNoPadding && !isDayNoPadding || (isMonthNoPadding && isDayNoPadding && firstY < firstM && firstY < firstD)
				|| (!isMonthNoPadding && isDayNoPadding && firstY < firstD) || (isMonthNoPadding && !isDayNoPadding && firstY < firstM)) {
				year = date.substr(firstY, yearLength);
			} else {
				var before = format.substring(firstY - 1, firstY);
				year = date.substr(date.indexOf(before, firstY - 1) + 1, yearLength);
			}

			return { m: month, d: day, y: year, date: isNaN(parseInt(month)) ? new Date(month + " " + day + ", " + year) : new Date(year, month - 1, day) };
		},
		/* Returns formatted string representation of selected date */
		formatDate : function (format) {
			var d = new Date(this.selected), day = d.getDate(), m = d.getMonth(), y = d.getFullYear();
			return format.replace(/(yyyy|yy|mmmm|mmm|mm|m|dd|d)/gi, function (e) {
				switch(e.toLowerCase()){
					case 'd': return day;
					case 'dd': return (day < 10 ? "0"+day: day);
					case 'm': return m+1;
					case 'mm': return (m+1 < 10 ? "0"+(m+1): (m+1));
					case 'mmm': return short_months[m];
					case 'mmmm': return months[m];
					case 'yy': return y.toString().substr(2,2);
					case 'yyyy': return y;
				}
			});
		},
		/* Selects date and trigger event (for other actions - if specified) */
		selectDate : function () {
			var that = this,
				newDate = that.formatDate(that.options.format),
				e = $.Event('dateselected', {date: newDate});
			//elem指向input元素
			that.elem.trigger(e);
		},
		/* Determines if date is disabled */
		disabledDate: function (date) {
			var that = this, rangeFrom = null, rangeTo = null, rangeMin = null, rangeMax = null, min = null, max = null,
				now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			if (that.minDate) min = that.minDate === "today" ? today : new Date(that.minDate);
			if (that.maxDate) max = that.maxDate === "today" ? today : new Date(that.maxDate);

			if (that.rangeFromEl) {
				var fromEl = $(that.rangeFromEl),
					fromData = fromEl.data(DCAL_DATA);//日历的数据
					fromFormat = fromData.options.format,
					fromVal = fromEl.val();
				//2个日期选择器，读取另外一个，根据他的格式进行解析
				rangeFrom = that.reformatDate(fromVal, fromFormat).date;
				rangeMin = fromData.minDate === "today" ? today : new Date(fromData.minDate);
			}

			if (that.rangeToEl) {
				var toEl = $(that.rangeToEl),
					toData = toEl.data(DCAL_DATA);
					toFormat = toData.options.format,
					toVal = toEl.val();

				rangeTo = that.reformatDate(toVal, toFormat).date;
				rangeMax = toData.maxDate === "today" ? today : new Date(toData.maxDate);
			}

			return (min && date < min) || (max && date > max) || (rangeFrom && date < rangeFrom) || (rangeTo && date > rangeTo) ||
				(rangeMin && date < rangeMin) || (rangeMax && date > rangeMax);
		},
		/* Gets list of months (for month view) */
		getMonths : function () {
			var that = this,
				currentYear = that.today.getFullYear(),
				currentMonth = that.today.getMonth();

			if(that.viewMode !== 'days') return;
			var cal = that.calendar;
				curr = cal.find('.calendar-dates'),
				dayLabel = cal.find('.calendar-labels'),
				currMonth = cal.find('.calendar-curr-month'),
				container = cal.find('.calendar-date-holder'),
				cElem = curr.clone(),
				rows = [], cells = [], count = 0;

			that.viewMode = 'months';
			currMonth.text(that.date.getFullYear());
			dayLabel.addClass('invis');
			for (var i = 1; i < 4; i++) {
				var row = [$("<span class='date month'></span>"), $("<span class='date month'></span>"), $("<span class='date month'></span>"), $("<span class='date month'></span>")];
				for (var a = 0; a < 4; a++) {
					row[a].html("<a href='javascript:void(0);'>" + short_months[count] + "</a>").attr('data-month', count);
					count++;
				}
				rows.push(row);
			}
			//向cells加入span
			$.each(rows, function(i, v){
			    var row = $('<span class="cal-row"></span>'), l = v.length;
				for(var i = 0; i < l; i++) { row.append(v[i]); }
				cells.push(row);
			});
			container.parent().height(container.parent().outerHeight(true));
			cElem.empty().append(cells).addClass('months load').appendTo(container);
			curr.addClass('hasmonths');
			setTimeout(function () { cElem.removeClass('load'); }, 10);
			setTimeout(function () { curr.remove(); }, 300);
		},
		/* Gets days for month of 'newDate'*/
		getDays : function (newDate, callback) {
		    var that = this,
				ndate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
				today = new Date(that.today.getFullYear(), that.today.getMonth(), that.today.getDate()),
				days = ndate.getDays(), day = 1,
		        d = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
				nmStartDay = 1, weeks = [], dates = [];

			for(var i = 1; i <= 6; i++){
				var week = [$('<span class="date"></span>'), $('<span class="date"></span>'), $('<span class="date"></span>'),
							$('<span class="date"></span>'), $('<span class="date"></span>'), $('<span class="date"></span>'),
							$('<span class="date"></span>')];

				while(day <= days) {
					d.setDate(day);
					var dayOfWeek = d.getDay();

					if (d.getTime() == today.getTime()) week[dayOfWeek].addClass('current');

                    if (that.disabledDate(d)) week[dayOfWeek].addClass('disabled');

					if(i === 1 && dayOfWeek === 0){
						break;
					} else if (dayOfWeek < 6) {
					    if (d.getTime() == that.selected.getTime()) week[dayOfWeek].addClass('selected');

						week[dayOfWeek].html('<a href="javascript:void(0);">' + (day++) + '</a>');
					} else {
					    if (d.getTime() == that.selected.getTime()) week[dayOfWeek].addClass('selected');

						week[dayOfWeek].html('<a href="javascript:void(0);">' + (day++) + '</a>');
						break;
					}
				}
				/* For days of previous and next month */
				if (i === 1 || i > 4) {
					// First week
				    if (i === 1) {
				        var pmDate = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1);
				        var pMonth = pmDate.getMonth(), pDays = 0;
				        pDays = pmDate.getDays();
						for (var a = 6; a >= 0; a--) {
						    if (week[a].text() !== '') continue;

						    pmDate.setDate(pDays);
						    week[a].html('<a href="javascript:void(0);">' + (pDays--) + '</a>').addClass('pm');

							if (that.disabledDate(pmDate)) week[a].addClass('disabled');

							if (pmDate.getTime() == that.selected.getTime()) week[a].addClass('selected');
							if (pmDate.getTime() == today.getTime()) week[a].addClass('current');
						}
					} 
					// Last week
					else if (i > 4) {
					    var nmDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
						for (var a = 0; a <= 6; a++) {
						    if (week[a].text() !== '') continue;

						    nmDate.setDate(nmStartDay);
						    week[a].html('<a href="javascript:void(0);">' + (nmStartDay++) + '</a>').addClass('nm');

							if (that.disabledDate(nmDate)) week[a].addClass('disabled');

							if (nmDate.getTime() == that.selected.getTime()) week[a].addClass('selected');
							if (nmDate.getTime() == today.getTime()) week[a].addClass('current');
						}
					}
				}
				weeks.push(week);
			}
			$.each(weeks, function(i, v){
				var row = $('<span class="cal-row"></span>'), l = v.length;
				for(var i = 0; i < l; i++) { row.append(v[i]); }
				dates.push(row);
			});
			callback(dates);
		},
		/* Sets current view based on user interaction (on arrows) */
		getNewMonth : function (dir, isTrigger) {
			var that = this,
				cal = that.calendar;
				curr = cal.find('.calendar-dates:not(.left):not(.right)'),
				lblTodayDay = cal.find('.calendar-dayofweek'),
				lblTodayMonth = cal.find('.calendar-month'),
				lblTodayDate = cal.find('.calendar-date'),
				lblTodayYear = cal.find('.calendar-year'),
				lblMonth = cal.find('.calendar-curr-month'),
				container = cal.find('.calendar-date-holder');

			if (that.viewMode === 'days') {
				if (isTrigger) {
					that.date.setDate(1);
					that.date.setMonth(that.date.getMonth() + ( dir === 'right' ? 1 : -1));
				}
				if(isTrigger || that.options.mode === 'calendar' || curr.hasClass('months')) {
					that.getDays(that.date, function (dates) {
						if (isTrigger) {
							//拷贝一份，添加进来，添加类执行动画，删除老版本
							var cElem = curr.clone();
							cElem.addClass(dir).empty().append(dates)[dir == 'left' ? 'prependTo' : 'appendTo'](container);
							setTimeout(function() {
								curr.addClass(dir == 'left' ? 'right' : 'left');
								cElem.removeClass(dir);
								setTimeout(function () { cal.find('.calendar-dates.'+(dir == 'left' ? 'right' : 'left')+'').remove(); }, 300);
							}, 10);
						} else {
							if (curr.hasClass('months')) {
								var cElem = curr.clone();
								$('.calendar-labels').removeClass('invis');
								cElem.empty().append(dates).addClass('hasmonths').appendTo(container);
								curr.addClass('load');
								setTimeout(function () { cElem.removeClass('hasmonths'); }, 10);
								container.parent().removeAttr('style');
								setTimeout(function () {
									cElem.removeClass('months');
									setTimeout(function () { cal.find('.calendar-dates.months').remove(); }, 300);
								}, 10);
							} else {
								curr.append(dates);
							}
						}
					});
				}
				
				lblMonth.text(months[that.date.getMonth()] + ' ' + that.date.getFullYear());
				
				if (!isTrigger && !curr.hasClass('months')) {
					lblTodayDay.text(short_days[that.today.getDay()]);
					lblTodayMonth.text(short_months[that.today.getMonth()]);
					lblTodayDate.text(that.today.getDate());
					lblTodayYear.text(that.today.getFullYear());
				}
			} else {
				that.date.setYear(that.date.getFullYear() + ( dir === 'right' ? 1 : -1))
				lblMonth.text(that.date.getFullYear());
			}
		},
		/* Sets current view to selected date */
		selectedView : function () {
			var that = this,
				cal = that.calendar;
				curr = cal.find('.calendar-dates:eq(0)'),
				lblMonth = cal.find('.calendar-curr-month'),
				lblDays = cal.find('.calendar-labels');

			that.getDays(that.selected, function (dates) {
				curr.html(dates);
			});

			lblMonth.text(months[that.selected.getMonth()] + ' ' + that.selected.getFullYear());
			lblDays.removeClass('invis');
			that.viewMode = 'days';
		},
		/* Creates components for the calendar */
		//创建组件
		create : function(){
			var that = this,
				mode = that.options.mode,
				theme = that.options.theme,
				overlay = $('<div class="calendar-overlay"></div>'),
				wrapper = $('<div class="calendar-wrapper load"></div>'),
				cardhead = $('<section class="calendar-head-card"><span class="calendar-year"></span><span class="calendar-date-wrapper" title="Select current date."><span class="calendar-dayofweek"></span>, <span class="calendar-month"></span> <span class="calendar-date"></span></span></section>'),
				container = $('<div class="calendar-container"></div>'),
				calhead = $('<section class="calendar-top-selector"><span class="calendar-prev">&lsaquo;</span><span class="calendar-curr-month"></span><span class="calendar-next">&rsaquo;</span></section>'),
				datesgrid = $('<section class="calendar-grid">'
							+ '<div class="calendar-labels"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>'
							+ '<div class="calendar-date-holder"><section class="calendar-dates"></section></div></section>');

			calhead.appendTo(container);
			datesgrid.appendTo(container);
			//单击遮罩层，关闭日历；单击日历上，阻止事件从日历中冒泡出去
			overlay.click(function (e) { that.hide(); });
			wrapper.click(function (e) { e.stopPropagation(); });

			wrapper.append(cardhead).append(container).appendTo(mode === 'calendar' ? that.elem : overlay);
			that.calendar = mode === 'calendar' ? that.elem : wrapper;

			//通过标签属性做主体样式
			switch(theme) {
				case 'red':
				case 'blue':
				case 'green':
				case 'purple':
				case 'indigo':
				case 'teal':
					wrapper.attr('data-theme', theme);
				break;
				default:
					wrapper.attr('data-theme', $.fn.dcalendar.defaults.theme);
				break;
			}

			if(mode !== 'calendar') { 
				wrapper.addClass('picker');
				overlay.appendTo('body');
			}
		},
		/* Shows the calendar (date picker) */
		show : function () {
			$('body').attr('datepicker-display', 'on');
			this.date = new Date(this.selected.getFullYear(), this.selected.getMonth(), this.selected.getDate());
			this.selectedView();
			this.calendar.parent().fadeIn('fast');
			this.calendar.removeClass('load');
		},
		/* Hides the calendar (date picker) */
		//load为样式动画，body为禁止滚动条？
		hide : function (callback) {
			var that = this;
			that.calendar.addClass('load');
			that.calendar.parent().fadeOut(function () {
				$('body').removeAttr('datepicker-display');
				if(callback) callback();
				if(that.elem.is('input')) that.elem.focus();
			});
		}
	};

	/* DEFINITION FOR DCALENDAR */
	$.fn.dcalendar = function(opts){
		return $(this).each(function(index, elem){
			var that = this;
 			var $this = $(that),
 				data = $(that).data(DCAL_DATA),
 				options = $.extend({}, $.fn.dcalendar.defaults, $this.data(), typeof opts === 'object' && opts);
 			if(!data){
 				$this.data(DCAL_DATA, (data = new DCalendar(this, options)));
 			}
 			//如果传入字符串，则执行对应的函数
 			if(typeof opts === 'string') data[opts]();
		});
	};

	$.fn.dcalendar.defaults = {
		mode : 'calendar',
		format: 'mm/dd/yyyy',
		theme: 'blue',
		readOnly: true
	};

	$.fn.dcalendar.Constructor = DCalendar;

	/* DEFINITION FOR DCALENDAR PICKER */
	$.fn.dcalendarpicker = function(opts){
		return $(this).each(function(){
			var that = $(this);

			if(opts){
				opts.mode = 'datepicker';
				that.dcalendar(opts);
			} else{
				that.dcalendar({mode: 'datepicker'});
			}

			that.on('click', function (e) {
				var cal = that.data(DCAL_DATA);
				cal.show();
				this.blur();
			}).on('dateselected', function (e) {
				var cal = that.data(DCAL_DATA);
				that.val(e.date).trigger('onchange');
				cal.hide(function () {
					that.trigger($.Event('datechanged', {date: e.date}));
				});				
			}).on('keydown', function(e){
				if(ex_keys.indexOf(e.which) < 0 && that.data(DCAL_DATA).options.readOnly) return false; 
			});
			//esc退出事件
			$(document).on('keydown', function (e) {
				if(e.keyCode != 27) return;
				that.data(DCAL_DATA).hide();
			});
		});
	};
}(jQuery);