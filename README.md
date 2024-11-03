# FBLA Project
## overveiw
This is a submision for the "Computer Game & Simulation Programming" event
## outline
This repo is structured such that if it was cloned, the directory could be run in an http-server, as such index.html not being in the html directory is necessary

### files
    
    index.html - the home page
    makefile - the makefile
    mime.types - used to specify mime types

### directories
note: this structure will likely be changed

html - all .html files besides index.html

    game.html - main game page
    settings.html - a page to edit game settings

js - all .js files

    main.js - this file acts as a main function
    factory.js - has the factories object in it
    compositeArray.js - has the compositeArray class

wasm - all .wasm files

    no files yet

css - all .css files

    styles.css - main css page

note: src stores the various files which are compiled to wasm

wasmSource - has the folowing directories:

  wat - all .wat files

    no files yet
  
  c -all .c files

    no files yet
  
  more will probably be added
