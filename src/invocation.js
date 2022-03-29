/******************************************************************************
 * Invocation implementation
 * ***************************************************************************/
/**
 * Defines an invocation
 * @param destination {object} component on which to perform invocation
 * @param slot {string} name of the slot 
 * @param value {mixed} value passed to the invoked slot
 * @constructor
 */
let Invocation = function (destination, slot, value) {
    /**
     * Returns the destination component of this invocation
     * @returns {object} destination component of this invocation
     */
    this.getDestination = function () {
        return destination;
    };
    
    /**
     * Returns the slot name of this invocation
     * @returns {String} slot name of this invocation
     */
    this.getSlot = function () {
        return slot;
    };
    
    /**
     * Returns the value used for this invocation
     * @returns {mixed} value used for this invocation
     */
    this.getValue = function () {
        return value;
    };
    
    /**
     * Performs the invocation
     */
    this.invoke = function () {
        var func = destination[slot];
        if (func === undefined) {
                console.error("Undefined slot %s of component %s", slot, destination);
                return;
        } 
        func.apply(destination, value);
    };
};
/**
 * Helper function that casts an invocation from a description 
 * @param obj {object} a raw description of the invocation
 * @param context {object} the context in which this invocation takes place.
 * @return an invocation
 */
Invocation.cast = function (obj, context) { 
    let component = context.getComponent(obj.destination);
    if (component === undefined) {
            console.error("[ARCS] Destination ",obj.destination, " is undefined");            
    }


    if (obj.value !== undefined) {
        return new Invocation(component, obj.slot, obj.value);
    } 
    
    // this one looks odd, seems there is a failure in the logic.
    if (obj.ref !== undefined) {
        return new Invocation(component, obj.slot, context.getConstant(obj.ref));        
    }    

    if (obj.storage !== undefined) {
        let data = null;
        if (typeof(localStorage) !== "undefined") {
            let item = localStorage.getItem(`ARCS.${storage.key}`);
            if (item === null) {
                if (typeof (obj.storage.default) !== "undefined") {
                    data = obj.storage.default;
                }
            }
        }

        return new Invocation(component, obj.slot, data);
    }
};

/*ARCS.Invocation.revert = function(obj, context) {
    return {
        destination: context
        
    };
    
};*/


Invocation.PRE_CONNECTION = 0;
Invocation.POST_CONNECTION = 1;
Invocation.CLEAN_UP = 2;

export default Invocation;
