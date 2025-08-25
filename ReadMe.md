folder structure at 10:31 25 Aug 2025

dash - js for the dashboards which display info from the database & receive user clicks to do actions

bd   - js reading from and writing to the database (Supabase through API)

htmlStubs - partial pages to be loaded into the DOM (also html elements such as statCard )

js    - anything else in js that doesn't fit into a process related category

services - don't know

ui     - infrastructue such as listeners rendering of data to the screen, button reactions

work     - ui where things are done, the useful reasons for the app. Many sub directories

xOld     - backups and copies that worked but have been superceded



These can be split conceptually into infrastructure needed for the webpage to function (dash, db, htmlStubs, js, ui) and the html & code for the user to do the things the website is designed to do (work & it's many subdirectories)  I am tempted to create two main folders

infrastructure 
        dash
        db
        htmlStubs
        js
        services
        ui

work
        approfile
        assignment
        hierarchy
        knowledge
        member
        relation
        task

404
favicon
flexload
flexmain
index
jsconfig.json
ReadMe
signup