//permitted.js
console.log("permitted.js loaded");

export function permitted(query) {
    console.log('permitted(', query,')');
    
    // placeholder. Eventually the permission logic will read the database & have rules, then check if db permits & flag if differenc of opinion
//need parse the query object to determine what is being requested, by whom, and for what purpose.
    if (query ) {
        console.log("Access permitted");
        return true;
    } else {
        console.log("Access denied-no query provided");
        return false;
    }
}

//how to use: This is needed before any CRUD action with the database.  
// if (permitted(query)) { ... do something ... } else { ... access denied ... }

//currently only checks if query is provided. 
// 
//  Future: check permissions database table for each relevant table column.
//  
// the database schema (as at 16:21 Sept 2 2025 has a row for each table column, with a permission level for each column.
//  The permission levels are:
//  c = create
//  r = read
//  u = update
//  d = delete
// granted_at = timestamp of when permission was granted
// granted_by = user who granted permission
// revoked_at = timestamp of when permission was revoked  <--- not currently implemented
// revoked_by = user who revoked permission <--- not currently implemented 