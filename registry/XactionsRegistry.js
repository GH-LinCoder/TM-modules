// ./registry/actionsRegistry.js
console.log('actionsRegistry.js');
/*
receives a string read from html
such as 'data-list-task-headers-fully' 
returns an object that lists the table name and columns involved to be able to carry out that query of the database

'data-' is a key word that will have been used to differentiate the action from a call to load a module.
'fully may need to be treated as a key word meaning 'every column in the table'

I wonder whether this is a list (a long list) or whether it is a function that reads from the dbSchema

*/

export function actionsRegistry(){
    console.log('actionsRegistry()');

}