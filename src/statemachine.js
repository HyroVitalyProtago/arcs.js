/******************************************************************************
 * Statemachine implementation
 * ***************************************************************************/

import Component from './component.js';
import TransitionNetwork from './transitionnetwork.js';
import EventLogicParser from './eventlogicparser.js';

/**
 * Describes a statemachine
 * @param obj {object} an object describing a state machine. If obj is empty then the statemachine is empty
 * @param obj.initial {String} name of the initial state of the statemachine
 * @param obj.final {String} name of the final state of the statemachine
 * @param obj.transitions {Object} transition object. Each key of the object is named after 
 * the name of a state and its associated value is an object whose keys are tokens
 * and values the name of the state the transition should reach once activated
 * by the token
 * @class
 */
let StateMachine = Component.create(function (obj) {
    // dynamic construction: properties are initial state that have properties 
    // that are tokens and value that are the final state
    var initial = "", final = "", transitions = {}, currentState = "", self= this;
    
    // this part is not good with astTokens
    var astTokens = {}; // it keeps AST from event logic expressions 
    var tokenEvents = {}; // it keeps promises for tokens.
    var network = {};
    

    let resetTokens = function() {
        Object.keys(tokenEvents).forEach( (t) => tokenEvents[t] = false );      
    };
    
    var addToken = function(t) {   
        if ( self.slots.indexOf(t) < 0 ) {
            self.slot(t, function( s ) {
                return function() {
                    self.setToken(s);
                };
            } (t));
        }
    };
    
    /* this function aims at preparing transition networks for a given state*/    
    var setSheet = function(s) {
        // we build promise trees using ast
        var t;
        
        resetTokens();
        if (transitions.hasOwnProperty(s)) {
            tokenEvents = {};
            for (t in transitions[s]) {
                if (transitions[s].hasOwnProperty(t)) {
                    network[t] = TransitionNetwork.build(astTokens[s][t],tokenEvents);
                }
            }
        }
        
        currentState = s;
        self.emit('requestSheet', currentState);
        if (currentState === final) {
            self.emit('requestTermination');
        }
        
    };
    
    /**
     * Sets the initial state of the statemachine
     * @param string {string} name of the initial state
     */
    this.setInitialState = function (string) {
        initial = string;
        currentState = initial;
    };
    /**
     * Sets the final state of the statemachine
     * @param string {string} name of the final state
     */
    this.setFinalState = function (string) { final = string; };
    /**
     * Adds a transition to the state machine
     * @param start {string} name of the state at the beginning of the transition
     * @param token {string} name of the token triggering the transition
     * @param end {string} name of the state reached at the end of the transition
     */
    this.addTransition = function (start, token, end) {
        var re = /([A-Za-z_]\w*)/g;
        var t, tsd, ts, tsc;
        try {
            
            var tsd = EventLogicParser.parse(token);
            if (typeof tsd === "string") {
                addToken(tsd);
            } else {
                while( (t = re.exec(token)) !== null) {
                    addToken(t[0]);
                }                
            }

            // first fix on transitions
            astTokens[start] = astTokens[start] || {};
            astTokens[start][token] = tsd;
            
            if (transitions[start] === undefined) {
                transitions[start] = {};
            }
            transitions[start][token] = end;
        } catch (e) {  }
    };
    /**
     * Gives a token to the statemachine. According to its list of transitions
     * and the current state, it may trigger a transition
     * @param token {string} name of the token
     */
    this.setToken = function (token) {
        if (tokenEvents.hasOwnProperty(token)) {
            //tokenEvents[token].accept();
            tokenEvents[token] = true;
        }
        
        for (const [key, value] of Object.entries(network)) {
            if (value.eval()) {
                network = {};
                setSheet(transitions[currentState][key]);              
            }
        }
        
    };
    /**
     * Sets transitions from a list of transitions
     * @param obj {object[]} list of transitions
     */
    this.setTransitions = function (obj) {
        // this function is no longuer a simple affectation
        // transitions = obj;         
        var p, t, i;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                for (t in obj[p]) {
                    if (obj[p].hasOwnProperty(t)) {
                        this.addTransition(p, t, obj[p][t]);
                    }
                }
            }            
        }
    };

    /**
     * Initialize and starts the statemachine, setting its current state to 
     * the initial state (by default, it is the departure of the first transition
     */
    this.start = function () {
        //console.log("statemachine", this, initial,obj);
        setSheet(initial);
    };
    

    // INIT CODE
    if (obj !== undefined) {
        initial = obj.initial;
        final = obj.final;
        this.setTransitions(obj.transitions);
        currentState = "";
    }

},
['setToken'],
['requestSheet', 'requestTermination']
);
                                       
export default StateMachine;
