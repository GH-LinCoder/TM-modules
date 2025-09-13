// ./state/petitionSchema.js   // a definition of what this object should contain

export const petition = {  // note uppercase first letters in the parts of the structure

    /* 
    @ The system will crash if the parts are not found. 
    @ The listener hears a click.
    @ It hands over the task to readPetition()
    @ which looks at the closest element 
    @ Should find both data-action=  and data-destination=
    @ it then climbs up the DOM
    @ It should find data-section=
    @ and then find data-module=
    @ If any of those is not found the system crashes.
    @
    @ this collection is placed in a 'petition'
    @ this petition is then stored in appState.query.petitioner
    @ that triggers a change of state
    
    @ note the importance of a keyword in the names of Actions... 
    */


"Module": { "source":"read from the html",
            "required": true,
            "method":"reading up the DOM from the source of click",
            "number": "There could be more than one data-module= open, but the first encountered is used",
            "keyWord":"",
            "description":"The name of the module (the software) that has been loaded. This helps identify where the request came from.",
            "example": "adminDash",

        },

"Section":{ "source":"read from the html",
            "required": true,    
            "method":"reading up the DOM from the source of click", 
            "number":"There may be many examples of data-section in a module. The first encountered is used",
            "keyWord":"",
            "description":"If the html is split into divs one or more can be designated as a Section. This helps to identify where the request cam from. ",
            "example": "quick-stats",
        },


"Action":{"source":"read from html",
          "required": true,
          "method": "This is data-action and is probably in the element that has been clicked or very close",
          "number":"There may be many examples of data-action in a module. The first encountered is used",
          "keyWord":" 'data' if the .Action first 4 chars are data this changes the type of change of state applied & is listened for by databaceCentral",
          "description":"Any element in the html can contain a data-action= 'some-action'.  This indicates what is being requested to be done.",
          "example": "create-task",
        },


"Destination":{"source":"read from html",
               "required": true,
                "method":"This is data-destination and is probably in the element that has been clicked or very close",
                "number":"There may be many examples of data-destination in a module. The first encountered is used",
                "keyWord":"",
                "description":"If an element in the html has an Action it should also have a data-destination=  . This indicates where to put the action.",
                "example": "new-panel",                
            },

"Validation": {"requiredFields": ["Module", "Section", "Action", "Destination"],
             "rules": {
                "Module": "must be non-empty string",
                "Action": "must be unique and match a registry key",
                "Destination": "must correspond to a renderable target"
            }
},


"example": {  // after a CLICK on the member stats card // (It is possible for petition to be constructed by code without an html click)
    Module: "adminDash",
    Section: "quick-stats",
    Action: "members-count",
    Destination: "quick-stats-panel"
  },
  

"TypeOfPetition": {
  "source": "derived from Action",
  "method": "If Action starts with 'data', it's a DATA_REQUEST" ,
  "description": "Used by DatabaseCentral to determine how to handle the petition"
}



        }