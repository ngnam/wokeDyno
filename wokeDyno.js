// This script will run every 20 minutes to keep a heroku dyno awake and running, thereby eliminating potentially very long wait time as sleeping server restarts
// Import into main file and invoke right after starting up server, passing in the heroku url
const fetch = require("node-fetch");

const wakeUpDyno = ({
    url, 
    interval = 1.5e6, 
    startNap = [5,0,0,0], 
    endNap = [10,0,0,0], 
    callback
}) => {
    const minutes = (interval / 60000).toFixed(2);
    const minuteString = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    console.log(`wokeDyno interval: ${minuteString}`);
    const runTimer = timerInterval => {
        const timeoutFn = () => {
            clearTimeout(timeoutId);
            timerInterval = interval;// reset to original interval, after nap
            const naptime = timeToNap(startNap, endNap); // if nap, will return length of nap in ms
            if (naptime){
                const napString = `${(naptime / 60000).toFixed(2)} ${Math.floor(minutes) > 1 ? "minutes" : "minute"}`;
                console.log(`It's naptime! Napping for ${napString}...`);
                return runTimer(naptime); // take a nap
            }
            fetch(url)
            .then(() => console.log(`Fetching ${url}. Dyno is woke. \nNext fetch request in ${minuteString}...`))
            .catch(error => console.log(`Error fetching ${url}: ${error.message}`));

            return runTimer(timerInterval); // run timer with original interval
            
        }
        const timeoutId = setTimeout(timeoutFn, timerInterval);
    }
    try {
        runTimer(interval);
    }
    catch (error){
        console.log("setTimeout error:", error.message);
    }
}
/*
If current time falls between startTime and endTime, returns length startTime and endTime are arrays of numbers representing the time of day. They follow this pattern: [Hours, Minutes, Seconds, Milliseconds]. If endTime is less than startTime time, endTime will be assumed to be on the following day. 

If current time is not between startTime and endTime, will return false */
const timeToNap = (startTime, endTime) => { 
    const now = new Date(Date.now());
    const todayArray = [
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ];
    const start = new Date(Date.UTC(...todayArray, ...startTime));
    const end = new Date(Date.UTC(...todayArray, ...endTime));
    const finish = start < end ? end : end.setDate(end.getDate() + 1);
    if (now >= start && now <= finish){
        
        return finish - now;
    }
    return false;
}

module.exports = wakeUpDyno;


wakeUpDyno({url:"https://google.com", interval: 7000, startNap: [16,1,40,0], endNap: [16,25,0,666]});

// wakeUpDyno({url: "https://dennis-hodges.com", interval: 60000});