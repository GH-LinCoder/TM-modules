// ./work/approfiles/getClipboardAppros.js

import { getClipboardItems, onClipboardUpdate } from '../../utils/clipboardUtils.js';



export function getClipboardAppros(){
  const allAppros = getClipboardItems({ type: 'app-human' })
  .concat(getClipboardItems({ type: 'app-task' }))
  .concat(getClipboardItems({ type: 'app-abstract' }))
  .concat(getClipboardItems({ type: 'app-survey' })) 

return allAppros;
}

