/**
 * Copyright (C) 2014 Paul Sarando
 * Distributed under the Eclipse Public License (http://www.eclipse.org/legal/epl-v10.html).
 */

$(document).ready(function() {
    var MILLISEC_PER_DAY = 24*60*60*1000;
    var DAYS_PER_MOONTH = 29.530588853;
    var NEW_MOON_PHASE_START = new Date(Date.UTC(2013, 0, 11, 19,44));
    var secondsBoost = 0;
    var minutesBoost = 0;
    var hoursBoost = 0;
    var daysBoost = 0;

    makeDayTicks();
    setClock();
    setInterval(setClock, 1000);

    function makeDayTicks() {
        var nextDate = getNewYear(new Date());
        var daysPerYear = getDaysPerYear(nextDate);

        for (var i = 1; i <= 89; i++, setNextDay(nextDate)) {
            $(".ticks-box").append(makeDayTick(nextDate));
        };

        for (var i = 90; i < (daysPerYear - 90); i++, setNextDay(nextDate)) {
            $(".ticks-box").append(makeDayTick(nextDate));
        };

        for (var i = (daysPerYear - 90); i <= daysPerYear; i++, setNextDay(nextDate)) {
            $(".ticks-box").append(makeDayTick(nextDate));
        };
    }

    function makeDayTick(date) {
        var day_tick =
            $("<div>").addClass("day-tick-box")
                      .addClass("day-tick")
                      .attr('title', date.toDateString());

        if (date.getDate() == 1) {
            day_tick.addClass("day-big-tick");
        }

        switch (date.getMonth()) {
            case 0:
                if (date.getDate() == 1) {
                    day_tick.addClass("holiday");
                }
                break;
            case 1:
                if (date.getDate() == 4 || date.getDate() == 14) {
                    day_tick.addClass("holiday");
                }
                break;
            case 2:
                if (date.getDate() == 17) {
                    day_tick.addClass("holiday");
                }
                break;
            case 4:
                if (date.getDate() == 6) {
                    day_tick.addClass("holiday");
                }
                break;
            case 6:
                if (date.getDate() == 4) {
                    day_tick.addClass("holiday");
                }
                break;
            case 7:
                if (date.getDate() == 7) {
                    day_tick.addClass("holiday");
                }
                break;
            case 9:
                if (date.getDate() == 31) {
                    day_tick.addClass("holiday");
                }
                break;
            case 10:
                if (date.getDate() == 6) {
                    day_tick.addClass("holiday");
                }
                break;
            case 11:
                if (date.getDate() == 25) {
                    day_tick.addClass("holiday");
                }
                break;
        }

        return $("<div>")
            .addClass("day-tick-box")
            .css({'transform':'rotate(' + (getYearDegree(date)+270) + 'deg)'})
            .append(day_tick);
    }

    function setClock() {
        var now = new Date();
        var seconds = now.getSeconds();
        var minutes = now.getMinutes();
        var hours = now.getHours();

        if (seconds === 0) {
            secondsBoost += 360;

            if (minutes === 0) {
                minutesBoost += 360;

                if (hours === 0) {
                    hoursBoost += 360;
                } else if (hours == 12 && now.getMonth() == 11 && now.getDate() == 21) {
                    daysBoost += 360;
                }
            }
        }

        var daysAngle = getYearDegree(now) + 270 + daysBoost;
        var phase = getMoonPhase(now) * -60;
        if (phase < -30) {
            phase = 60 + phase;
        }

        $('.days').css({'transform': 'rotate(' + daysAngle + 'deg)'});
        $('.earth-apsis').css({'left': getEarthDistance(now) + 'px'});
        $('.earth').attr('title', now.toDateString());
        $('.moon').attr('title', now.toDateString());
        $('.moon-darkside').css({'top': phase + 'px'});

        seconds++;
        var hoursAngle = 360 * (hours*60*60 + minutes*60 + seconds) / (24*60*60);
        var minutesAngle = 360 * (minutes*60 + seconds) / (60*60);
        var secondsAngle = 360 * seconds / 60;
        hoursAngle += 270 + hoursBoost;
        minutesAngle += 270 + minutesBoost;
        secondsAngle += 270 + secondsBoost;
        $('.hours').css({'transform':'rotate('+hoursAngle+'deg)'});
        $('.minutes').css({'transform':'rotate('+minutesAngle+'deg)'});
        $('.seconds').css({'transform':'rotate('+secondsAngle+'deg)'});
        $('.sun').attr('title', now.toLocaleTimeString());
        $('.sun-cap').attr('title', now.toLocaleTimeString());
    }

    function getYearDegree(now) {
        var newyear = getNewYear(now);
        var dayOfYear = (now - newyear) / MILLISEC_PER_DAY;
        var daysPerYear = getDaysPerYear(newyear);

        if (dayOfYear <= 89) {
            // first quarter
            return (dayOfYear/89)*90;
        }

        if (dayOfYear >= (daysPerYear - 90)) {
            // last quarter
            return 270 + dayOfYear - (daysPerYear - 90);
        }

        // 1/2 the year around summer solstice
        return 90 + ((dayOfYear-89) / (daysPerYear-179)) * 180;
    }

    function getMoonPhase(now) {
        var phase = ((now - NEW_MOON_PHASE_START) / MILLISEC_PER_DAY) % DAYS_PER_MOONTH;
        return phase/DAYS_PER_MOONTH;
    }

    function getEarthDistance(now) {
        var perihelion = new Date(now.getFullYear(), 0, 4, 12,0,0);
        var daysPerYear = getDaysPerYear(perihelion);
        var dayOfYear = Math.abs((now - perihelion) / MILLISEC_PER_DAY);

        if (dayOfYear > daysPerYear/2) {
            dayOfYear = daysPerYear - dayOfYear;
        }

        return 150 + (dayOfYear*2/daysPerYear) * 50;
    }

    function getNewYear(now) {
        var startYear = now.getFullYear();
        var startMonth = -1;
        if (now.getMonth() == 11) {
            if (now.getDate() > 21 || (now.getDate() == 21 && now.getHours() >= 12)) {
                startMonth = 11;
            }
        }

        return new Date(startYear, startMonth, 21,12,0,0); // noon on Winter solstice
    }

    function getDaysPerYear(newyear) {
        var nextYear = new Date(newyear);
        nextYear.setFullYear(nextYear.getFullYear()+1);

        return (nextYear - newyear) / MILLISEC_PER_DAY;
    }

    function setNextDay(date) {
        date.setDate(date.getDate() + 1);
    }
});
