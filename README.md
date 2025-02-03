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
    display.js - renders the canvas
    upgrades.js - stores info about upgrades
    Shaders.js - stores shaders
    newReal.js - stores the scrolling text at the bottom of the screen

StyleSheet - all .css files and font files

    RETROTECH.ttf - a font file used for some of the ui
    styles.css - the main stylesheet

Sprites - all of the images that this project uses