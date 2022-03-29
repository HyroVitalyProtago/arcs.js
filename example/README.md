This is an example of use of the ARCS.js engine. It comes in two flavours:

* A fully modular one (**loop.html**);
* A bundled one where webpack create a single script (**loop_bundle.html**).

The aim of this example is to show how components can interact together. 
In this case, we have a loop, parameterised by a number of iterations. 
For each iterations it triggers a signal with the current iteration index.
In return, it runs a slot in another component that displays the current 
iteration index. Once, the number of iteration has been reached, another signal
is triggered. It results in a change of the operational configuration of the 
application, therefore launching the loop anew and then ending the application.
In order to obtain something readable in the webpage, a **console** component
has been added, that redirects log operations from the actual console to the 
webpage.

Here is a description of all the files you encounter in this directory:

* **arcsapp.json** is an arcs application description in JSON format
* **console.js** and **loop.js** are component libraries
* **webpack.config.js** is a webpack config file to generate a bundle

Please notice that path for libraries in file **arcsapp.json** are relative to
the **arcs.js** engine script.
