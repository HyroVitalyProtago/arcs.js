/**
 * Example of component declarations inside a module. 
 * You may look at the definitions of the following components:
 * {@link Loop}
 * @file
 */

import ARCS from '../build/arcs.js';
/**
    * @class Loop
    * @classdesc loop component creation using a compact style.
    * This component iterates for a given number of times
    */
var Loop = ARCS.Component.create(
    function () {
    /**
        * Sets the number of times the component should iterate.
        * It starts the iterations. At each iteration, a signal newIteration is 
        * emitted, then, at the end of the iterations, a signal sendToken is 
        * eventually triggered.
        * @param n {numeric} number of iterations
        * @function Loop#setIterations
        * @slot
        * @emits newIteration
        * @emits sendToken
        */
        this.setIterations = function (n) {
            var i;
            for (i = 0; i < n; i++) {
                console.log("Loop : emitting ", i);
                this.emit("newIteration", i);
            }
            this.emit("endLoop");
        };
        
        /** @function Loop#newIteration
            * @signal
            * @param n {number} current iteration number.             
            */ 
        
        /** @function Loop#sendToken
            * @signal
            * @param s {string} token to emit.
            */
        
    },
    "setIterations", //slotList 
    ["endLoop", "newIteration"] // signalList
);


/** 
    * @class DisplayInt 
    * @classdesc displayInt component creation using a variation with defined slots
    * in the constructor (a slot is a function). DisplayInt will display an integer
    * received on its display slot.
    */
var DisplayInt = function () {
/**
    * @param n {numeric} number to display
    * @function DisplayInt#display
    * @slot
    */
    this.display = function (n) {
        console.log("  DisplayInt : " + n);
    };
};

ARCS.Component.create(DisplayInt);
DisplayInt.slot("display");


/**
    * @class Sum
    * @classdec Sum is a component summing integers passed to its slot "add" 
    * and the result is sent back by signal "sum".
    * This component is declared in two different phases: declaration of the 
    * constructor and declaration of the slot "add".
    */
var Sum = function () {
    this.total = 0;
};

ARCS.Component.create(Sum);
/**
    * This slot adds its parameter to its internal sum and send it back by using 
    * the signal "sum".
    * @param n {integer} add n to the internal sum of the component.
    * @function Sum#add
    * @slot
    */
Sum.slot("add", function (n) {
    this.total = this.total + n;
    this.emit("sum", this.total); //console.log("  Total : " + this.total);
});
Sum.signal("sum");

// the anonymous function must return the components in one object:
// keys are factory names, value are actual constructors modified by 
// ARCS.Component.create

export default {Loop: Loop, DisplayInt: DisplayInt, Sum: Sum};
