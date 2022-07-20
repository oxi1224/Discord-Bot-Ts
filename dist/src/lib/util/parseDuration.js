import { TimeInMs, DurationString } from '#base';
export function parseDuration(duration, currentTime) {
    if (!duration)
        return null;
    const matchResult = duration.match(/\d+/);
    if (!matchResult)
        return null;
    const timeNumber = matchResult[0];
    const timeString = duration.split('').slice(timeNumber.length, duration.length).join('');
    return (parseInt(timeNumber) * TimeInMs[DurationString[timeString.toLowerCase()]]) + currentTime;
}
//# sourceMappingURL=parseDuration.js.map