/* ugly hack in order to display data in web page instead of console */
import ARCS from '../build/arcs.js';

let Console;
/**
    * @class Console
    * @classdesc Redirects console messages to a given HTML element in the page.
    * @param id {string} id of the HTML element in which console messages will be added.
    */
Console = ARCS.Component.create(
    function (id) {
        if (id === undefined) {
            return ;
        }

        if (typeof document === "undefined") return;
        
        var output = document.getElementById(id);
        
        if (output) {
            window.console = {
                timeRef: new Date().getTime(),
                output : output,
                display: function(color,args) {
                    var s = document.createElement("span");
                    s.style.color=color;
                    var elapsed = (new Date().getTime() - this.timeRef);

                    s.innerHTML = '<span class="marker">' + (elapsed/1000).toFixed(3) + '</span> ' + Array.prototype.join.call(args, ' '); 
                    output.appendChild(s);
                    output.appendChild(document.createElement("br"));
                },
                log: function () {
                    this.display('green',arguments);
                },
                error: function () {
                    this.display('red',arguments);        
                },
                warn: function () {
                    this.display('orange',arguments);        
                }
            };
        }
    }
);


export default { Console: Console};
//export default {};
