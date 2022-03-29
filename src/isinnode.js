// ARCS.js : 27/6/2014 16:00
// handling dependencies


//"use strict";




/** 
 * Main source: describes all the methods needed by the ARCS engine
 * @file
 */


/******************************************************************************
 * Helper functions to determine environment
 * ***************************************************************************/

/**
 * @return {boolean} true if ARCS is run in a node.js environment
 */     

export default function isInNode() {
    return  (typeof process !== 'undefined') &&
        (process.release.name.search(/node|io.js/) !== -1);
    
    // return (typeof require === 'function' && require.resolve);
};

