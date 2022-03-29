/******************************************************************************
 * Connection implementation
 * ***************************************************************************/
import Component from './component.js';

/** 
 * Defines a connection between two components
 * @param source {object} component at the source
 * @param signal {string} name of the signal emitting data
 * @param destination {object} component at the destination 
 * @param slot {string} name of the signal receiving data
 * @class
 */
let Connection = function (source, signal, destination, slot) {
    /**
     * Connects two components as described in this object
     * @function ARCS.Connection#connect
     */
    this.connect = function () {
        try {
            Component.connect(source, signal, destination, slot);
        } catch(e) { console.log(e, source, signal, destination, slot); }
    };
    /**
     * Disconnects a signal/slot connection between the two components
     * described in this object.
     */
    this.disconnect = function () {
        Component.disconnect(source, signal, destination, slot);
    };
    
    
    /**
     * Returns the source of a connection
     * @returns {Component} source component of the connection
     */    
    this.getSource = function() {
        return source; 
    };
    
    /**
     * Returns the destination of a connection
     * @returns {Component} destination component of the connection
     */    
    this.getDestination = function () {
        return destination;
    };
    
    /** 
     * Returns the slot name of a connection
     * @returns {String} slot name
     */
    this.getSlot = function ()  {
        return slot;
    };
    
    /** 
     * Returns the signal name of a connection
     * @returns {String} signal name
     */
    this.getSignal = function () {
        return signal;
    };   
};
/**
 * Helper function that casts a connection from a description 
 * @param obj {object} a raw description of the connection
 * @param context {object} the context in which this connection takes place.
 * @return a connection
 */
Connection.cast = function (obj, context) {
    return new Connection(context.getComponent(obj.source)/*[obj.source].instance*/, obj.signal,
                                context.getComponent(obj.destination)/*[obj.destination].instance*/, obj.slot);
};


export default Connection;
