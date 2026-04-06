// ./work/approfiles/getClipboardAppros.js

import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';



export function getClipboardAppros(){
  const allAppros = getClipboardItems({ type: 'app-human' })
  .concat(getClipboardItems({ type: 'app-task' }))
  .concat(getClipboardItems({ type: 'app-abstract' }))
  .concat(getClipboardItems({ type: 'app-survey' })) 

  .concat(getClipboardItems({ type: 'bundle' })) //

return allAppros;
}

//getClipBoardItems - collects a specific type, puts them in time order
//current code cannot identify if there are entries on clipboard that are of an unknown type
//That caused hours of pointless debug thinking that the clipboard update event messages were failing
//but they wre okay. What was the problem is that we had created a new type 'bundle' and none of the
//modules were asking for that type on the clipboard
//Therefore putting a 'bundle' on the clipboard should have been picked up by other modules, but they knew nothing
//of this type - so we thought the system was broken in some esoteric way
// 21:45 March 31 2026