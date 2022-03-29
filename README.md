About ARCS.js
-------------

ARCS.js is the javascript version of ARCS (Augmented Reality Component System),
a framework allowing to prototype augmented reality applications.

The aim of this project is to be able to do it using the recent HTML5 standard
in order to use the web browser as a platform to design and develop augmented
reality applications.

You can see more resources about ARCS on [its website](http://arcs.ibisc.fr)


How to build
------------
The first thing is to clone this repository.

ARCS.js is using three tools in order to be built: 
 - `npm`, the [Node.js](https://nodejs.org) package manager, 
 - `webpack`, a [module bundler](http://webpack.js.org/) used as a build tool,  
 - `eslint`, a [linter](https://eslint.org/) in order to check code consistency.

We suppose that npm is already installed. Then, you will have to setup your 
development environment by typing these commands, 
the last one being executed in the local sources repository:

`npm install -g webpack-cli`

`npm install -g eslint`

`npm install`

Copyright © 2013 Université d'Evry-Val d'Essonne.
