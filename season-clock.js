/**
 * Copyright (C) 2016 Paul Sarando
 * Distributed under the Eclipse Public License (http://www.eclipse.org/legal/epl-v10.html).
 */

const SeasonClock = () => {
    const MILLISEC_PER_DAY = 24*60*60*1000;
    const DAYS_PER_MOONTH = 29+82517/155520;
    const NEW_MOON_PHASE_START = new Date(Date.UTC(2013, 0, 11, 19,44));
    const DRACONIC_CYCLE_DAYS = 27.212220;
    const DRACONIC_CYCLE_START = new Date(Date.UTC(2013, 4, 10, 0,29));

    let hoursAngle   = 0;
    let minutesAngle = 0;
    let secondsAngle = 0;
    let daysAngle    = 0;
    let secondsBoost = 0;
    let minutesBoost = 0;
    let hoursBoost   = 0;
    let daysBoost    = 0;

    const daysElements    = document.querySelectorAll('.days');
    const hoursElements   = document.querySelectorAll('.hours');
    const minutesElements = document.querySelectorAll('.minutes');
    const secondsElements = document.querySelectorAll('.seconds');
    const sunCapElements  = document.querySelectorAll('.sun-cap');

    const earthApsis   = document.querySelector('.earth-apsis');
    const earth        = document.querySelector('.earth');
    const moonDarkside = document.querySelector('.moon-darkside');
    const moonOrbitEl  = document.querySelector('.moon-orbit');
    const moonOrbitBox = document.querySelector('.moon-orbit-box');
    const hereIsland   = document.querySelector('.you-are-here-box');
    const sun          = document.querySelector('.sun');
    const moon         = document.querySelector('.moon');
    const moonBox      = document.querySelector('.moon-box');
    const ticksBox     = document.querySelector('.ticks-box');

    const setNextDay = (date) => {
        date.setDate(date.getDate() + 1);
    };

    const getNewYear = (now) => {
        let startYear = now.getFullYear();
        let startMonth = -1;
        if (now.getMonth() == 11) {
            if (now.getDate() > 21 || (now.getDate() == 21 && now.getHours() >= 12)) {
                startMonth = 11;
            }
        }

        return new Date(startYear, startMonth, 21,12,0,0); // noon on Winter solstice
    };

    const getDaysPerYear = (newyear) => {
        let nextYear = new Date(newyear);
        nextYear.setFullYear(nextYear.getFullYear()+1);

        return (nextYear - newyear) / MILLISEC_PER_DAY;
    };

    const getYearDegree = (now) => {
        let newyear = getNewYear(now);
        let dayOfYear = (now - newyear) / MILLISEC_PER_DAY;
        let daysPerYear = getDaysPerYear(newyear);

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
    };

    const getMoonPhase = (now) => {
        let phase = ((now - NEW_MOON_PHASE_START) / MILLISEC_PER_DAY) % DAYS_PER_MOONTH;
        return phase/DAYS_PER_MOONTH;
    };

    const getEarthDistance = (now) => {
        let perihelion = new Date(now.getFullYear(), 0, 4, 12,0,0);
        let daysPerYear = getDaysPerYear(perihelion);
        let dayOfYear = Math.abs((now - perihelion) / MILLISEC_PER_DAY);

        if (dayOfYear > daysPerYear/2) {
            dayOfYear = daysPerYear - dayOfYear;
        }

        return 180 + (dayOfYear*2/daysPerYear) * 40;
    };

    const getMoonDraconicCycle = (now) => {
        let cycleMin = DRACONIC_CYCLE_DAYS * .25;
        let dayOfCycle = Math.abs((now - DRACONIC_CYCLE_START) / MILLISEC_PER_DAY - cycleMin) % DRACONIC_CYCLE_DAYS;

        if (dayOfCycle > DRACONIC_CYCLE_DAYS/2) {
            dayOfCycle = DRACONIC_CYCLE_DAYS - dayOfCycle;
        }

        return 295 + (dayOfCycle*2/DRACONIC_CYCLE_DAYS) * 30;
    };

    const setClock = () => {
        let now = new Date();
        let seconds = now.getSeconds();
        let minutes = now.getMinutes();
        let hours = now.getHours();

        let nextDaysAngle = getYearDegree(now) + 270 + daysBoost;
        while (nextDaysAngle < daysAngle) {
            nextDaysAngle += 360;
            daysBoost += 360;
        }
        daysAngle = nextDaysAngle;

        let phase = getMoonPhase(now);
        if (phase > 0.5) {
            phase -= 1;
        }
        let moonOrbit = 360*phase;

        daysElements.forEach((day) => (day.style.transform = `rotate(${ daysAngle }deg)`));

        earthApsis.style.left        = getEarthDistance(now) + 'px';
        earth.title                  = now.toDateString();
        moonDarkside.style.top       = (-60 * phase) + 'px';
        moonOrbitEl.title            = now.toDateString();
        moonOrbitEl.style.transform  = `rotate(${ -360 * phase + 90 }deg)`;
        moonOrbitBox.style.transform = `rotate(${ moonOrbit }deg)`;

        seconds++;
        let nextHoursAngle = 360 * (hours*60*60 + minutes*60 + seconds) / (24*60*60);
        let nextMinutesAngle = 360 * (minutes*60 + seconds) / (60*60);
        let nextSecondsAngle = 360 * seconds / 60;

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

        hereIsland.style.transform = `rotate(${ hoursAngle }deg)`;

        hoursElements.forEach((hourEl)     => (hourEl.style.transform   = `rotate(${ hoursAngle   }deg)`));
        minutesElements.forEach((minuteEl) => (minuteEl.style.transform = `rotate(${ minutesAngle }deg)`));
        secondsElements.forEach((secondEl) => (secondEl.style.transform = `rotate(${ secondsAngle }deg)`));

        sun.title = now.toLocaleTimeString();
        sunCapElements.forEach((sunCap) => (sunCap.title = now.toLocaleTimeString()));

        moonBox.style.transform = `rotate(${ hoursAngle - moonOrbit }deg)`;
        moon.title              = (Math.round(Math.abs(moonOrbit * 100 / 180)))
                                    + "%, "
                                    + (phase > 0 ? "waxing" : "waning");
        moon.style.left         = getMoonDraconicCycle(now) + 'px';
    };

    const makeDayTick = (date) => {
        let dayTickBox = document.createElement("div");

        dayTickBox.classList.add("day-tick-box");
        dayTickBox.style.transform = `rotate(${getYearDegree(date) + 270}deg)`;

        let dayTick = document.createElement("div");
        dayTickBox.appendChild(dayTick);

        dayTick.classList.add("day-tick-box");
        dayTick.classList.add("day-tick");
        dayTick.title = date.toDateString();

        if (date.getDate() == 1) {
            dayTick.classList.add("day-big-tick");
        }

        switch (date.getMonth()) {
            case 0:
                if (date.getDate() == 1) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 1:
                if (date.getDate() == 4 || date.getDate() == 14) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 2:
                if (date.getDate() == 17) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 4:
                if (date.getDate() == 6) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 6:
                if (date.getDate() == 4) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 7:
                if (date.getDate() == 7) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 9:
                if (date.getDate() == 31) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 10:
                if (date.getDate() == 6) {
                    dayTick.classList.add("holiday");
                }
                break;
            case 11:
                if (date.getDate() == 25) {
                    dayTick.classList.add("holiday");
                }
                break;
        }

        return dayTickBox;
    };

    const makeDayTicks = () => {
        var nextDate = getNewYear(new Date());
        var daysPerYear = getDaysPerYear(nextDate);

        for (let i = 1; i <= 89; i++, setNextDay(nextDate)) {
            ticksBox.appendChild(makeDayTick(nextDate));
        }

        for (let i = 90; i < (daysPerYear - 90); i++, setNextDay(nextDate)) {
            ticksBox.appendChild(makeDayTick(nextDate));
        }

        for (let i = (daysPerYear - 90); i <= daysPerYear; i++, setNextDay(nextDate)) {
            ticksBox.appendChild(makeDayTick(nextDate));
        }
    };

    makeDayTicks();
    setClock();
    setInterval(setClock, 1000);
};
