//  ./utils/timeStampConversion.js

export function timeStampConversion(ts) {
    if (!ts) return '';
    const date = new Date(ts);
// the order of display is set by conventions  'en-GB' is day, month, year  time
// en_US is month day year time
//the definitions do not determine order
    return date.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'

    });
}
