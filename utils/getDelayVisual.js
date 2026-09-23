//  ./utils/getDelayVisual.js

export function getDelayVisual(minutes, delayFactor) {
   // let delayOrgFactor =1; // to be a global set by each org. Is 1 hour delay regarded as short or long?
    // >1 allow longer delays before showing that things are late
    //<1 show things are late at shorter delays.
    // at =1 the first warning is at 60 mins delay

  console.log('getDelayVisual()');
  if (minutes === null) return '';
  //set limits to delaFactor and prevent division by zero.
  if(!delayFactor) delayFactor = 1;
  else if (delayFactor < 0.01) delayFactor = 0.1;
  else if(delayFactor > 100) delayFactor = 100;
  // Log scale: log(minutes + 1) keeps small delays visible, compresses large ones
  
  const logTime = Math.log(minutes/delayFactor + 1);
  
  // Map to border width (1-4px) and color
  let borderWidth = Math.round(logTime)-4; //4 is about 55 minutes, 5 is about 148m 2.5 hrs 6 is 403m = <7 hrs
//  console.log('borderWidth',borderWidth);
  if (borderWidth < 1) borderWidth = 1; else if (borderWidth > 11) borderWidth = 11;

  console.log('minutes', minutes, 'delayFactor', delayFactor, 'logTime',logTime, 'borderWidth',borderWidth );
  

  if (logTime < 4.09) return `border-green-300 border-[${borderWidth}px]`;       // < 60 minutes if delayOrgFactor = 1
  else if (logTime < 4.80) return `border-green-400 border-[${borderWidth}px]`;       // < 2 hrs
  else if (logTime < 5.19) return `border-green-500 border-[${borderWidth}px]`;       // < 3 hrs
  else if (logTime < 5.48) return `border-green-600 border-[${borderWidth}px]`;      // < 4 hrs
  
  else if (logTime < 5.70) return `border-yellow-400 border-[${borderWidth}px]`;      // < 5 hrs
  else if (logTime < 5.89) return `border-yellow-500 border-[${borderWidth}px]`;      // < 6 hrs
  else if (logTime < 6.04) return `border-yellow-600 border-[${borderWidth}px]`;      // < 7 hrs
  else if (logTime < 6.17) return `border-yellow-700 border-[${borderWidth}px]`;      // < 8 hrs

  else if (logTime < 7.27) return `border-orange-500 border-[${borderWidth}px]`;      // < 2 days
  else if (logTime < 8.37) return `border-orange-600 border-[${borderWidth}px]`;         // < 3 days
  else if (logTime < 9.22) return `border-orange-700 border-[${borderWidth}px]`;// 1 week
  else if (logTime < 9.91) return `border-orange-800 border-[${borderWidth}px]`;// 2 weeks
    
  else if (logTime < 10.32) return `border-red-600 border-[${borderWidth}px]`;// 3 weeks
  else if (logTime < 10.6)  return `border-red-700 border-[${borderWidth}px]`;// 4 weeks
  else if (logTime < 10.83)  return `border-red-700 border-[${borderWidth}px]`;// 5 weeks
  else if (logTime < 11.01)  return `border-red-700 border-[${borderWidth}px]`;// 6 weeks
  return `border-red-900 border-[${borderWidth}px] animate-pulse`;
}