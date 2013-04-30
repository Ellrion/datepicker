/**
 * JQuery плагин выбора даты и времени
 *
 * вешается только на элементы "input [type=text]"
 * для JQuery 1.4+ (c 1.7+ некоторые методы будут устаревшими)
 *
 * @author Maksim (EllRion) Platonov <ellrion@web-leaders.ru> <ellrion11@wgmail.com>
 * @version	0.2.4 [02.11.2012]
 **/
(function($) {
    var today = new Date();
    var months = ['Янв.', 'Февр.', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'];
    var monthLengths = [31,28,31,30,31,30,31,31,30,31,30,31];
    var days=['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
    var dateRegEx = /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4} \d{1,2}:\d{1,2}$/;
    var yearRegEx = /^\d{4,4}$/;

    $.fn.ellDatepicker = function(options) {
        /*заполняем опции из установок по умолчанию и переданных пораметров*/
        var opts = $.extend({}, $.fn.ellDatepicker.defaults, options);

        /*извлекаем из начальной и конечной дат календаря, начальный и конечный год*/
        function setupYearRange () {
            var startYear, endYear;
            // начальный год
            if (opts.startDate.constructor == Date) {
                startYear = opts.startDate.getFullYear();
            } else if (opts.startDate) {
                if (yearRegEx.test(opts.startDate)) {
                    startYear = opts.startDate;
                } else if (dateRegEx.test(opts.startDate)) {
                    opts.startDate = new Date(opts.startDate);
                    startYear = opts.startDate.getFullYear();
                } else {
                    startYear = today.getFullYear();
                }
            } else {
                startYear = today.getFullYear();
            }
            opts.startyear = startYear;
            // последний год
            if (opts.endDate.constructor == Date) {
                endYear = opts.endDate.getFullYear();
            } else if (opts.endDate) {
                if (yearRegEx.test(opts.endDate)) {
                    endYear = opts.endDate;
                } else if (dateRegEx.test(opts.endDate)) {
                    opts.endDate = new Date(opts.endDate);
                    endYear = opts.endDate.getFullYear();
                } else {
                    endYear = today.getFullYear();
                }
            } else {
                endYear = today.getFullYear();
            }
            opts.endyear = endYear;
        }

        setupYearRange();

        /*создание HTML datepicker'а в виде таблицы*/
        function newDatepickerHTML () {
            // создаём структуру таблицы календаря
            var table = $('<table class="elldatepicker" cellpadding="0" cellspacing="0"></table>');
            table.append('<thead></thead>');
            table.append('<tfoot></tfoot>');
            table.append('<tbody></tbody>');
            //шапка календая с дополнительными кнопками
            $('thead', table)
                .append(
                    '<tr><td colspan="2"><span class="elldtp-cancel elldtp-btn">Отмена</span></td>'+
                        '<td colspan="3"><span class="elldtp-now elldtp-btn">Сегодня</span></td>'+
                        '<td colspan="2"><span class="elldtp-clear elldtp-btn">Очистить</span></td></tr>'
                );
            // шапка календая с выбором меся, года, и стрелками
            // поле выбора месяца
            var monthselect = '<select name="elldtpMonth">';
            for (var i in months)
                monthselect += '<option value="'+i+'">'+months[i]+'</option>';
            monthselect += '</select>';
            // поле выбора года
            var years = [];// массив доступныго промежутка годов
            for (var i = 0; i <= opts.endyear - opts.startyear; i ++) // заполняем
                years[i] = opts.startyear + i;
            var yearselect = '<select name="elldtpYear">';
            for (var i in years)
                yearselect += '<option>'+years[i]+'</option>';
            yearselect += '</select>';
            //собираем вместе
            $('thead', table).append(
                '<tr class="elldtp-controls"><th colspan="7"><span class="elldtp-prevMonth elldtp-btn">&laquo;</span>&nbsp;'+
                    monthselect+
                    yearselect+
                    '&nbsp;<span class="elldtp-nextMonth elldtp-btn">&raquo;</span></th></tr>'
            );
            // шапка таблицы календая с днями недели
            var daysthead='<tr class="elldtp-days">';
            for (var i in days)
                daysthead+='<th>'+days[i]+'</th>';
            daysthead+='</tr>';
            $('thead', table).append(daysthead);
            // подвал календая с выбором времени и доп. функциональными кнопками
            var with_timepanel = '<td colspan="3">'+
                'ч:<input type="text" name="elldtpHour" style="width: 30px;"><span class="elldtp-controlsHour">'+
                '<span class="elldtp-nextHour elldtp-btn">&#9650;</span><span class="elldtp-prevHour elldtp-btn">&#9660;</span></span></td>'+
                '<td colspan="3">'+
                'м:<input type="text"  name="elldtpMinute" style="width: 30px;"><span class="elldtp-controlsMinute">'+
                '<span class="elldtp-nextMinute elldtp-btn">&#9650;</span><span class="elldtp-prevMinute elldtp-btn">&#9660;</span></span>'+
                '</td>'+
                '<td><span class="elldtp-ok elldtp-btn">Ок</span></td>';
            var without_timepanel = '<td colspan="7"><span class="elldtp-ok elldtp-btn">Ок</span></td>';
            $('tfoot', table).append('<tr>'+(opts.timePicker ? with_timepanel : without_timepanel)+'</tr>');
            if (!opts.btnOk && opts.chooseOneClick) {
                $('tfoot', table).hide();
            }
            // ячейки календаря (дни)
            for (var i = 0; i < 6; i++)
                $('tbody', table).append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
            return table;
        }

        /*отображение месяца*/
        // запускается при инициализации календаря (e = null)
        // или по кнопкам prevMonth/nextMonth
        // так же при выборе месяца/года в селекте и т.п.
        function loadMonth(e, el, datepicker, activeDate) {
            //если передана активная дата то устанавливаем год и месяц
            if (activeDate && activeDate.constructor==Date) {
                $('select[name=elldtpMonth]', datepicker).get(0).selectedIndex = activeDate.getMonth();
                $('select[name=elldtpYear]', datepicker).get(0).selectedIndex = Math.max(0, activeDate.getFullYear() - opts.startyear);
                if (opts.timePicker) {
                    var mm=activeDate.getMinutes()
                    var hh=activeDate.getHours();
                    if (opts.minuteInterval) {
                        mm=Math.ceil(mm/opts.minuteInterval)*opts.minuteInterval;
                        if (mm>=60) {
                            mm=0;
                            hh=hh+1==24?0:hh+1;
                        }
                    }
                    $('input[name=elldtpHour]').val(('0'+hh).substr(-2));
                    $('input[name=elldtpMinute]').val(('0'+mm).substr(-2));
                }
            }
            //узнаём какой месяц и год отрисовывать
            var month = $('select[name=elldtpMonth]', datepicker).get(0).selectedIndex;//номер, в списке, выбранного(текущего) месяца (0-11)
            var year = $('select[name=elldtpYear]', datepicker).val();//значение текущего года
            var yearNum = $('select[name=elldtpYear]', datepicker).get(0).selectedIndex;//номерв, в списке, выбранный года (с 0)
            var yearsCount = $('select[name=elldtpYear] option', datepicker).length;//кол-во годов в календаре
            // скрываем кнопки next(prev)Month если календарь "кончился" (крайние месяцы крайних годов)
            if (month==0 && yearNum==0)
                $('span.elldtp-prevMonth', datepicker).hide();
            else
                $('span.elldtp-prevMonth', datepicker).show();
            if (yearNum==yearsCount-1 && month==11)
                $('span.elldtp-nextMonth', datepicker).hide();
            else
                $('span.elldtp-nextMonth', datepicker).show();
            // первый день отображаемого месяца
            var d = new Date(year, month, 1);
            // с какой ячейки заполнять дни текущего месяца
            var startindex = d.getDay();
            startindex=startindex==0?6:startindex-1;
            // число дней в отображаемом месяце
            var numdays = monthLengths[month];
            // если февраль то делаем определение высокосного года http://en.wikipedia.org/wiki/Leap_year
            if (1 == month && ((year%4 == 0 && year%100 != 0) || year%400 == 0)) numdays = 29;
            // границы календаря
            if (opts.startDate.constructor == Date) {
                var startMonth = opts.startDate.getMonth();
                var startDate = opts.startDate.getDate();
            }
            if (opts.endDate.constructor == Date) {
                var endMonth = opts.endDate.getMonth();
                var endDate = opts.endDate.getDate();
            }
            //текущая выбранная дата
            chosendate = $.data(datepicker, 'ellDatepicker').chosenDate;
            // отчищаем прошлые значения ячеек календаря
            var cells = $('tbody td', datepicker).empty().removeClass('elldtp-date elldtp-date-prevmonth elldtp-date-nextmonth elldtp-chosen elldtp-today elldtp-disabled');
            // заполнение ячеек календаря датами текущего месяца
            for (var i = 0; i < numdays; i++) {
                var cell = $(cells.get(i+startindex));
                cell.addClass('elldtp-date').text(i+1);
                // выделение предыдущей выбранной даты
                if (chosendate && i+1 == chosendate.getDate() && month == chosendate.getMonth() && year == chosendate.getFullYear())
                    cell.addClass('elldtp-chosen');
                // выделение сегодняшней даты
                if (i+1 == today.getDate() && month == today.getMonth() && year == today.getFullYear())
                    cell.addClass('elldtp-today');
                // проверяем что дата попадает в доступный диапазон
                // if (
                // !(yearNum || ((!startDate && !startMonth) || ((i+1 >= startDate && month == startMonth) || month > startMonth))) ||
                // !(yearNum + 1 < yearsCount || ((!endDate && !endMonth) || ((i+1 <= endDate && month == endMonth) || month < endMonth)))
                // )
                // {
                // cell.addClass('elldtp-disabled');
                // }
            }
            var month_prev=month-1;
            if (month_prev==-1)
                month_prev=11;
            var numdays_prev = monthLengths[month_prev];
            // если февраль то делаем определение высокосного года http://en.wikipedia.org/wiki/Leap_year
            if (1 == month_prev && ((year%4 == 0 && year%100 != 0) || year%400 == 0)) numdays_prev = 29;
            // заполнение ячеек календаря датами прошлого месяца
            for (var i = 0; i < startindex; i++) {
                var cell = $(cells.get(i));
                cell.addClass('elldtp-date-prevmonth').text(numdays_prev-startindex+i+1);
            }
            // заполнение ячеек календаря датами следующего месяца
            for (var i = numdays+startindex; i < cells.length; i++) {
                var cell = $(cells.get(i));
                cell.addClass('elldtp-date-nextmonth').text(i-numdays-startindex+1);
            }
        }
        //--------------------------------------------

        /*"перемещение" по часам и минутам*/
        function nextHour(datepicker){
            var $that=$('input[name=elldtpHour]', datepicker);
            var hh=Number($that.val());
            hh=hh<22 && !isNaN(hh) ? ('0'+(hh+1)).substr(-2) : '23';
            $that.val(hh);
        }
        function nextMinute(datepicker){
            var $that=$('input[name=elldtpMinute]', datepicker);
            var mm=Number($that.val());
            if (isNaN(mm)) {
                mm='00';
            } else if (mm+opts.minuteInterval<59) {
                mm=mm+opts.minuteInterval;
            } else {
                mm='00';
                nextHour(datepicker);
            }
            $that.val(('0'+mm).substr(-2));
        }
        function prevHour(datepicker){
            var $that = $('input[name=elldtpHour]', datepicker);
            var hh = Number($that.val());
            hh = hh>1 && !isNaN(hh) ? ('0'+(hh-1)).substr(-2) : '00';
            $that.val(hh);
        }
        function prevMinute(datepicker,interval){
            var $that=$('input[name=elldtpMinute]', datepicker);
            var mm=Number($that.val());
            if (isNaN(mm)) {
                mm='59';
            } else if (mm-opts.minuteInterval>=0) {
                mm=mm-opts.minuteInterval;
            } else {
                mm=60-opts.minuteInterval;
                prevHour(datepicker);
            }
            $that.val(('0'+mm).substr(-2));
        }
        //--------------------------------------------

        /*действие по закрытию datepicker*/
        function closeIt (el, datepicker, dateObj) {
            //дата передана, значит устанавливаем её
            if (dateObj && dateObj.constructor == Date) {
                el.val($.fn.ellDatepicker.formatOutputDate(dateObj, opts.timePicker));
                $.data(el.get(0), 'ellDatepicker', { hasDatepicker : false, chosenDate: dateObj });
            }
            //дата задана как пустая строка, значит затераем пораметры (clear)
            else if (dateObj==='') {
                el.val('');
                $.data(el.get(0), 'ellDatepicker', { hasDatepicker : false });
            }
            //дата не передана или передана как null, означает не менять предыдущее установленное значение
            else if (dateObj==null) {
                $.data(el.get(0), 'ellDatepicker', $.extend($.data(el.get(0), 'ellDatepicker'), { hasDatepicker : false }));
            }
            //удаление календаря
            datepicker.remove();
            datepicker = null;
            $(document).unbind('click.ellDatepicker');
        }
        //--------------------------------------------

        /*инициализация плагина*/
        return this.each(function() { // перебераем все элементы на которые "навешивают" плагин
            if ($(this).is('input') && 'text'==$(this).attr('type')) {//плагин работает только для input[type="text"]
                var datePicker;
                $.data($(this).get(0), 'ellDatepicker', { hasDatepicker : false });
                // навешиваем обработчик клика. который будет открываться datapiker(если ещё не открыт)
                $(this).bind(opts.eventsActivate, function (e) {
                    var $this = $(e.target);//элемент вызвавший календарь
                    if ($.data($this.get(0), 'ellDatepicker').hasDatepicker == false) {
                        //закрываем если нужно ранее открытые календари
                        if (opts.onlyOne) {
                            var oldDP = $('body>table.elldatepicker');
                            if (oldDP.length) {
                                $('span.elldtp-cancel',oldDP).trigger('click');
                            }
                        }
                        var data=$.data($this.get(0), 'ellDatepicker');
                        // запоминаем что datePicker уже вызван
                        $.data($this.get(0), 'ellDatepicker', $.extend(data, { hasDatepicker : true}));
                        // генерация и вставка в DOM HTML кода календаря
                        datePicker = newDatepickerHTML();
                        $('body').append(datePicker);
                        // ранее выбранная дата выбирается по цепочке
                        //если написана в data секции вызывающего элемента
                        //или дата из строки вызывающего элемента
                        //или если передана в опциях
                        //или сегодняшняя дата
                        var chosenDate = null;
                        if (data.chosenDate) {
                            chosenDate = data.chosenDate;
                        } else {
                            var initialDate = $.fn.ellDatepicker.formatInputDate($this.val(), opts.timePicker);
                            if (initialDate && dateRegEx.test(initialDate)) {
                                chosenDate = new Date(initialDate);
                            } else if (opts.chosenDate && opts.chosenDate.constructor == Date) {
                                chosenDate = opts.chosenDate;
                            } else if (opts.chosenDate) {
                                chosenDate = new Date(opts.chosenDate);
                            }
                        }
                        $.data(datePicker, 'ellDatepicker', {'chosenDate': chosenDate} );
                        // нахождение и установка позиции календаря на странице
                        var x = (isNaN(parseInt(opts.offsetX,10)) ? 0 : parseInt(opts.offsetX,10)) + $this.offset().left;//+$this.outerWidth()
                        var y = (isNaN(parseInt(opts.offsetY,10)) ? 0 : parseInt(opts.offsetY,10)) + $this.offset().top;
                        $(datePicker).css({ position: 'absolute', 'left': x.toFixed()+'px', 'top': y.toFixed()+'px' });
                        // навешивание обработчиков
                        $('tbody td', datePicker).hover(
                            function () { $(this).addClass('elldtp-hover'); },
                            function () { $(this).removeClass('elldtp-hover');}
                        );
                        $('span.elldtp-cancel', datePicker).bind('click', function () { closeIt($this, datePicker); });
                        $('span.elldtp-now', datePicker).bind('click', function () { closeIt($this, datePicker, new Date()); });
                        $('span.elldtp-clear', datePicker).bind('click', function () { closeIt($this, datePicker, ''); });
                        $('select', datePicker).bind('change', function () { loadMonth(null, $this, datePicker); });
                        if (opts.timePicker) {
                            $('span.elldtp-nextHour', datePicker).bind('mousedown', function(){nextHour(datePicker); return false;});
                            $('span.elldtp-nextMinute', datePicker).bind('mousedown', function(){nextMinute(datePicker); return false;});
                            $('span.elldtp-prevHour', datePicker).bind('mousedown', function(){prevHour(datePicker); return false;});
                            $('span.elldtp-prevMinute', datePicker).bind('mousedown', function(){prevMinute(datePicker); return false;});
                            $('input[name=elldtpHour]', datePicker)
                                .bind('keydown', function(e){
                                    if (e.keyCode==38) {
                                        nextHour(datePicker);
                                        return false;
                                    } else if (e.keyCode==40) {
                                        prevHour(datePicker);
                                        return false;
                                    }
                                })
                                .bind('change', function(){
                                    var hh=parseInt($(this).val(),10);
                                    hh=isNaN(hh)?0:hh>23?23:(hh<0?0:hh);
                                    $(this).val(('0'+hh).substr(-2));
                                });
                            $('input[name=elldtpMinute]', datePicker)
                                .bind('keydown', function(e){
                                    if (e.keyCode==38) {
                                        nextMinute(datePicker);
                                        return false;
                                    } else if (e.keyCode==40) {
                                        prevMinute(datePicker);
                                        return false;
                                    }
                                })
                                .bind('change', function(){
                                    var mm=parseInt($(this).val(),10);
                                    mm=isNaN(mm)?0:mm;
                                    mm=Math.ceil(mm/opts.minuteInterval)*opts.minuteInterval;
                                    mm=mm>59?0:(mm<0?0:mm);
                                    $(this).val(('0'+mm).substr(-2));
                                });
                        }
                        $('span.elldtp-prevMonth', datePicker).bind('click',
                            function (e) {
                                var mo = $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex;//номер в списке выбранного(текущего) месяца (0-11)
                                var yr = $('select[name=elldtpYear]', datePicker).get(0).selectedIndex;//номерв в списке выбранный года (с 0)
                                var yrs = $('select[name=elldtpYear] option', datePicker).length;//кол-во годов в календаре
                                if ( mo==0 && yr>0) {
                                    yr--;
                                    mo = 11;
                                    $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex = 11;
                                    $('select[name=elldtpYear]', datePicker).get(0).selectedIndex = yr;
                                } else {
                                    mo--;
                                    $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex = mo;
                                }
                                loadMonth(e, $this, datePicker);
                            }
                        );
                        $('span.elldtp-nextMonth', datePicker).bind('click',
                            function (e) {
                                var mo = $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex;//номер в списке выбранного(текущего) месяца (0-11)
                                var yr = $('select[name=elldtpYear]', datePicker).get(0).selectedIndex;//номерв в списке выбранный года (с 0)
                                var yrs = $('select[name=elldtpYear] option', datePicker).length;//кол-во годов в календаре
                                if (11==mo && yr<yrs-1) {
                                    yr++;
                                    mo = 0;
                                    $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex = 0;
                                    $('select[name=elldtpYear]', datePicker).get(0).selectedIndex = yr;
                                } else {
                                    mo++;
                                    $('select[name=elldtpMonth]', datePicker).get(0).selectedIndex = mo;
                                }
                                loadMonth(e, $this, datePicker);
                            }
                        );
                        var setAndClose = function () {
                            var dt=$.data(datePicker, 'ellDatepicker').chosenDate;
                            if (dt) {
                                dt.setMinutes(
                                    opts.timePicker
                                        ? $('input[name=elldtpMinute]', datePicker).val()
                                        : 0
                                );
                                dt.setHours(
                                    opts.timePicker
                                        ? $('input[name=elldtpHour]', datePicker).val()
                                        : 0
                                );
                            }
                            closeIt($this, datePicker, dt);
                        }
                        $('span.elldtp-ok', datePicker).bind('click', setAndClose);
                        $('tbody', datePicker).delegate('td.elldtp-date', 'dblclick', setAndClose);
                        $(document).bind('click.ellDatepicker', function(e){
                                if (e.target!==$this.get(0) && !$(e.target).closest('table.elldatepicker').length)
                                    closeIt($this, datePicker);
                            }
                        );
                        $('tbody', datePicker).delegate('td.elldtp-date', 'click', function () {
                                $('td.elldtp-chosen', datePicker).removeClass('elldtp-chosen');
                                $(this).addClass('elldtp-chosen');
                                var chosenDateObj = new Date($('select[name=elldtpYear]', datePicker).val(), $('select[name=elldtpMonth]', datePicker).val(), $(this).text());
                                $.data(datePicker, 'ellDatepicker',{chosenDate:chosenDateObj});
                                if (opts.chooseOneClick) {
                                    setAndClose();
                                }
                            }
                        );
                        // заполнение календаря
                        loadMonth(null, $this, datePicker, chosenDate||today);
                    }
                });
            }
        });
    };

    /*формат ввода*/
    //преобразует текстовое представление по указанному формату к формату понятному JS
    $.fn.ellDatepicker.formatInputDate = function (dateStr, withTime) {
        var tmpDateStr = $.trim(dateStr);
        var dateExp = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
        var formatedStr = '$2/$1/$3';
        if (withTime){
            dateExp = /^(\d{1,2}):(\d{1,2}) (\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
            formatedStr = '$4/$3/$5 $1:$2:00';
        }
        if (dateExp.test(tmpDateStr)) {
            return tmpDateStr.replace(dateExp,formatedStr);
        } else
            return false;
    };

    /*формат вывода*/
    //преобразует объект даты в текстовое представление
    $.fn.ellDatepicker.formatOutputDate = function (dateObj, withTime) {
        var mm = (dateObj.getMonth()+1);
        mm = mm<10 ? '0'+mm : mm;
        var dd = dateObj.getDate();
        dd = dd<10 ? '0'+dd : dd;
        var yyyy = dateObj.getFullYear();
        yyyy = yyyy<100 ? '20'+yyyy : yyyy;
        var hr = dateObj.getHours();
        if (withTime) {
            hr = hr<10 ? '0'+hr : hr;
            var mi = dateObj.getMinutes();
            mi = mi<10 ? '0'+mi : mi;
            return hr + ':' + mi + ' ' + dd + "." + mm + '.' + yyyy;
        }
        else {
            return dd + "." + mm + '.' + yyyy;
        }
    };

    /*установки по умолчанию*/
    $.fn.ellDatepicker.defaults = {
        // выбранная дата - строка в формате /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
        chosenDate: null,
        // даты начала/конца календаря - строки в формате /^\d{1,2}\/\d{1,2}\/\d{2}|\d{4}$/
        startDate: today.getFullYear(),
        endDate: today.getFullYear() + 1,
        // сдвиг относительно элемента который вызывает датапикер в пикселах
        offsetX: 0,
        offsetY: 0,
        timePicker: true,
        minuteInterval: 5,
        //одновременно показывать только один календарь, а ранее открытый если есть закрывать как cancel
        onlyOne: true,
        //по каким событиям элемента показывается календарь
        eventsActivate: 'click focus',
        //eventsClose: true
        btnOk: true,
        chooseOneClick: false
    };
})(jQuery);