/******************************************************************************
 * Component implementation
 * ***************************************************************************/


/** 
 * Defines main traits of components in a namespace regrouping important methods
 * 
 * @class Component 
 */
var Component = {
    /** Error message */
    SourceIsNotComponent : {message : "Source is not a component"},
    /** Error message */
    UndefinedSignal : {message : "Signal is not defined"},
    /** Error message */
    UndefinedSlot : {message : "Slot is not defined"},
    /**
     * External constructor: give component traits to any constructor.
     * 
     * Component traits are the following: 
     * <ul>
     * <li>Slot functions listed in an array;</li>
     * <li>A signal list described in an array;</li>
     * <li>A method returning the slot list;</li>
     * <li>A method returnung the signal list;</li>
     * <li>An emit method, to trigger signals by their names;</li>
     * <li>A slot method to cast an internal method to a slot;</li>
     * <li>A signal method to register a possible signal.</li>
     * </ul>
     * @param name {string} Class name to transform to a component
     * @param sltList {string[]} names of functions designated as slots, may be empty.
     * @param sgnList {string[]} names of functions designated as signals, may be empty.
     */
    create : function (name, sltList, sgnList) {
        if (name.prototype === undefined) {
            console.error("Cannot create such a component");
            return 0;
        }

        name.prototype.slots = [];
        name.prototype.signals = {};
        /**
         * Gives the list of global slot names for a given type of component
         * @returns {Array.String} list of global slot names
         * @function slotList
         * @memberof Component
         * @static
         */
        name.slotList = function () {
            return name.prototype.slots;
        };
        /**
         * Gives the list of local slot names for a given type of component
         * @returns {Array.String} list of global slot names
         * @function Component#slotList
         */
        name.prototype.slotList = function () {
            return this.slots;
        };

        /**
         * Gives the list of global slot names for a given type of component
         * @returns {Array.String} list of global slot names
         * @function slotList
         * @memberof Component
         * @static
         */
        name.prototype.signalList = function () {
            return Object.keys(this.signals);
        };
        /**
         * Gives the list of local slot names for a given type of component
         * @returns {Array.String} list of global slot names
         * @function Component#slotList
         */
        name.signalList = function () {
            return name.prototype.signalList();
        };
        
        
        /**
         * Emits a signal 
         * @param signal {String} name of the signal to emit
         * @param {...*} [params] zero or more params to pass to the signal 
         * @function Component#emit
         */
        name.prototype.emit = function (signal) {
            var slt, func, obj;
            var args = Array.prototype.slice.call(arguments,1);
            for (slt in this.signals[signal]) {
                func = this.signals[signal][slt].func;
                obj = this.signals[signal][slt].obj;
                func.apply(obj, args);
            }
        };
        
        /**
         * Creates a slot that is only owned by this component instance. 
         * You can see an example of such use in component {@link StateMachine}
         * Please notice, that when this method is called, the list of global
         * slots will be separated from the local one. Newer global slots will
         * then not be added to the component instance.
         * In case the slot is already existing, a call to this function will
         * replace the slot.
         * @param slot {String} name of the slot to create
         * @param func {Function} callback function that will be used as a slot
         * @function Component#slot
         */
        name.prototype.slot = function(slot, func) {
            if (!this.hasOwnProperty('slots')) {
                this.slots = name.prototype.slots.map(s => s);
            }
            if (!this.slots.includes(slot)) {
              this.slots.push(slot);
            }
            this[slot]= func;
        };
        
        /**
         * Creates a signal that is only owned by this component instance. 
         * Please notice, that when this method is called, the list of global
         * signals will be separated from the local one. Newer global signals will
         * then not be added to the component instance.
         * @param slot {String} name of the signal to create
         * @function Component#signal
         */
        name.prototype.signal = function(signal) {
            if (!this.hasOwnProperty('signals')) {
                this.signals = {};
                Object.assign(this.signals, name.prototype.signals);
            }            
            this.signals[signal]= [];            
        };

        
        /**
         * Adds one or more global slots. This method has two different 
         * behaviours. The first one is equivalent to {@link Component#slot}
         * except the defined slot is global. The second one tags some methods
         * of the components as slots just by giving their names.
         * 
         * @param slot {String|Array.String} name or names of the slots to create
         * @param [func] {Function} callback function that will be used as a slot
         * @function slot
         * @memberof Component
         * @static
         */        
        name.slot = function (slot, func) {
            var i;
            if (slot instanceof Array) {
                for (i = 0; i < slot.length; i++) {
                    if (!name.prototype.slots.includes(slot[i])) {
                      name.prototype.slots.push(slot[i]);
                    }
                }
            } else {
                if (!name.prototype.slots.includes(slot)) {
                  name.prototype.slots.push(slot);
                }
                if (func !== undefined) {
                    name.prototype[slot] = func;
                }
            }
        };

        /**
         * Adds one or more global signals. 
         * @param signal {String|Array.String} name or names of the signals to create
         * @function signal
         * @memberof Component
         * @static
         */        
        name.signal = function (signal) {
            var i;
            if (signal instanceof Array) {
                for (i = 0; i < signal.length; i++) {
                    name.prototype.signals[signal[i]] = [];
                }
            } else {
                name.prototype.signals[signal] = [];
            }
        };

        // code for returning component, and or completing its definition
        if (sltList !== undefined) {
            name.slot(sltList);
        }

        if (sgnList !== undefined) {
            name.signal(sgnList);
        }
        return name;
    },
    /** 
     * Checks if the given prototype has traits of a component
     * @param name {string} name of the prototype
     */
    check : function (name) {
        if (name.prototype === undefined) {
            return false;
        }
        if (name.prototype.signals === undefined ||
                name.prototype.slots === undefined) {
            return false;
        }
        return true;
    },
    /**
     * Connects two different components by using their signal and slots
     * @param source {object} component sending data
     * @param signal {string} name of the signal to connect
     * @param destination {object} component receiving data
     * @param slt {string} name of the slot to connect
     */
    connect : function (source, signal, destination, slt) {
        var orig, p;
        // here we can perform various checks.
        if (source.signals === undefined) {
            throw Component.SourceIsNotComponent;
        }
        if (source.signals[signal] === undefined) {
            let e = Object.assign({}, Component.UndefinedSignal);
            e.message = e.message + ": \"" + signal + "\"";            
            throw e;
        }
        if (destination[slt] === undefined) {
            let e = Object.assign({}, Component.UndefinedSlot);
            e.message = e.message + ": \"" + slt + "\"";
            throw e;
        }
        // we must also check if the signals dispose of their own implementation
        if (!source.hasOwnProperty('signals')) {
            // otherwise, we should clone it so that each component dispose of its 
            // own signal copy.
            orig = source.signals;
            source.signals = {};
            for (p in orig) {
                source.signals[p] = [];
            }
        }
        source.signals[signal].push({obj: destination, func: destination[slt]});
    },
    /**
     * Diconnects a signal/slot connection between two components
     * @param source {object} component sending data
     * @param signal {string} name of the signal to connect
     * @param destination {object} component receiving data
     * @param slt {string} name of the slot to connect
     */
    disconnect : function (source, signal, destination, slt) {
        var i;
        for (i = 0; i < source.signals[signal].length; i++) {
            if (source.signals[signal][i].obj === destination) {
                if (source.signals[signal][i].func === destination[slt]) {
                    source.signals[signal].splice(i, 1);
                    i--;
                }
            }
        }
    },
    /**
     * Invokes a specific slot of a given component
     * @param destination {object} component upon which invocation is performed
     * @param slt {string} name of the slot to invoke
     * @param value {mixed} value to input
     */
    invoke : function (destination, slt, value) {
        if (destination[slt] === undefined) {
            throw Component.UndefinedSlot;            
        }
                
        var func = destination[slt];
        func.apply(destination, value);
    },
    /** 
     * Specific hook that can be called when initializing a component
     * @param component {object} prototype of the component
     * @param obj {object} the actual object
     */
    config : function (component, obj) {
        if (typeof component.config === 'function') {
            component.config(obj);
        }
    }
};

export default Component;
