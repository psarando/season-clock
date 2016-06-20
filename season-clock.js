/**
 * Copyright (C) 2016 Paul Sarando
 * Distributed under the Eclipse Public License (http://www.eclipse.org/legal/epl-v10.html).
 */

$(document).ready(function() {
    const MILLISEC_PER_DAY = 24*60*60*1000;
    const DAYS_PER_MOONTH = 29+82517/155520;
    const NEW_MOON_PHASE_START = new Date(Date.UTC(2013, 0, 11, 19,44));
    const DRACONIC_CYCLE_DAYS = 27.212220;
    const DRACONIC_CYCLE_START = new Date(Date.UTC(2013, 4, 10, 0,29));
    var hoursAngle = 0;
    var minutesAngle = 0;
    var secondsAngle = 0;
    var daysAngle = 0;
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
        }

        for (var i = 90; i < (daysPerYear - 90); i++, setNextDay(nextDate)) {
            $(".ticks-box").append(makeDayTick(nextDate));
        }

        for (var i = (daysPerYear - 90); i <= daysPerYear; i++, setNextDay(nextDate)) {
            $(".ticks-box").append(makeDayTick(nextDate));
        }
    }

    function makeDayTick(date) {
        var day_tick = $("<div>").addClass("day-tick-box")
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

        return $("<div>").addClass("day-tick-box")
                         .css({'transform':'rotate(' + (getYearDegree(date)+270) + 'deg)'})
                         .append(day_tick);
    }

    function setClock() {
        var now = new Date();
        var seconds = now.getSeconds();
        var minutes = now.getMinutes();
        var hours = now.getHours();

        var nextDaysAngle = getYearDegree(now) + 270 + daysBoost;
        while (nextDaysAngle < daysAngle) {
            nextDaysAngle += 360;
            daysBoost += 360;
        }
        daysAngle = nextDaysAngle;

        var phase = getMoonPhase(now);
        if (phase > 0.5) {
            phase -= 1;
        }
        var moonOrbit = 360*phase;

        $('.days').css({'transform': 'rotate(' + daysAngle + 'deg)'});
        $('.earth-apsis').css({'left': getEarthDistance(now) + 'px'});
        $('.earth').attr('title', now.toDateString());
        $('.moon-darkside').css({'top': (-60*phase) + 'px'});
        $('.moon-orbit').attr('title', now.toDateString())
                        .css({'transform':'rotate('+(-360*phase+90)+'deg)'});
        $('.moon-orbit-box').css({'transform': 'rotate(' + moonOrbit + 'deg)'});

        seconds++;
        var nextHoursAngle = 360 * (hours*60*60 + minutes*60 + seconds) / (24*60*60);
        var nextMinutesAngle = 360 * (minutes*60 + seconds) / (60*60);
        var nextSecondsAngle = 360 * seconds / 60;

        nextHoursAngle += 270 + hoursBoost;
        while (nextHoursAngle < hoursAngle) {
            nextHoursAngle += 360;
            hoursBoost += 360;
        }
        hoursAngle = nextHoursAngle;

        nextMinutesAngle += 270 + minutesBoost;
        while (nextMinutesAngle < minutesAngle) {
            nextMinutesAngle += 360;
            minutesBoost += 360;
        }
        minutesAngle = nextMinutesAngle;

        nextSecondsAngle += 270 + secondsBoost;
        while (nextSecondsAngle < secondsAngle) {
            nextSecondsAngle += 360;
            secondsBoost += 360;
        }
        secondsAngle = nextSecondsAngle;

        $('.you-are-here-box').css({'transform':'rotate('+hoursAngle+'deg)'});
        $('.hours').css({'transform':'rotate('+hoursAngle+'deg)'});
        $('.minutes').css({'transform':'rotate('+minutesAngle+'deg)'});
        $('.seconds').css({'transform':'rotate('+secondsAngle+'deg)'});
        $('.sun').attr('title', now.toLocaleTimeString());
        $('.sun-cap').attr('title', now.toLocaleTimeString());
        $('.moon-box').css({'transform': 'rotate(' + (hoursAngle - moonOrbit) + 'deg)'});
        $('.moon').attr('title', (Math.round(Math.abs(moonOrbit * 100 / 180))) + "%, "
                                 + (phase > 0 ? "waxing" : "waning"))
                  .css({'left': getMoonDraconicCycle(now) + 'px'});
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

        return 180 + (dayOfYear*2/daysPerYear) * 40;
    }

    function getMoonDraconicCycle(now) {
        var cycleMin = DRACONIC_CYCLE_DAYS * .25;
        var dayOfCycle = Math.abs((now - DRACONIC_CYCLE_START) / MILLISEC_PER_DAY - cycleMin) % DRACONIC_CYCLE_DAYS;

        if (dayOfCycle > DRACONIC_CYCLE_DAYS/2) {
            dayOfCycle = DRACONIC_CYCLE_DAYS - dayOfCycle;
        }

        return 295 + (dayOfCycle*2/DRACONIC_CYCLE_DAYS) * 30;
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
