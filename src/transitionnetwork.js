/* the aim of the transition network is to build a network of promises */
import TokenEvent from './tokenevent.js';

const Leaf = function(tokenEvents,nodeName) {        
    this.eval = function() {
        return tokenEvents[nodeName];
    };      
};

const OrNode = function(tokenEvents, left, right) {
    this.eval = function() {
        return left.eval(tokenEvents) || right.eval(tokenEvents);          
    };              
};

const AndNode = function(tokenEvents, left, right) {
    this.eval = function(tokenEvents) {
        return left.eval(tokenEvents) && left.eval(tokenEvents);
    };
};

let TransitionNetwork = {};

//let TransitionNetwork = function() {
    // object storing token events (that is to say references to promises)
  
    /*this.promise = {};
        
    this.and = function(tn) {
        this.promise = Promise.all([this.promise, tn.promise]);
        return this;
    };
    
    this.or = function(tn) {
        this.promise = Promise.race([this.promise, tn.promise]);
        return this;
    };*/

//};

TransitionNetwork.build = function(tree, tokenEvents) {    
    var res;
    var tmpTN;
    var rightTN;
    
    if (typeof tree === "string") {
        tokenEvents[tree] = tokenEvents[tree] ?? false;
        return new Leaf(tokenEvents, tree);
    }
    
    res = TransitionNetwork.build(tree[0],tokenEvents);
    var i;
    
    for (i=1; i < tree.length; i++) {
        if (tree[i].hasOwnProperty('and')) {
            rightTN = TransitionNetwork.build(tree[i]['and'], tokenEvents); 
            tmpTN = new AndNode(tokenEvents, res, rightTN);
        } else {
            if (tree[i].hasOwnProperty('or')) {
                rightTN = TransitionNetwork.build(tree[i]['or'], tokenEvents);
                tmpTN = new OrNode(tokenEvents, res, rightTN);
            } else {
                console.warn('[ARCS] Illegal tree');
            }
        }
        res = tmpTN;        
    }    
    
    

    /*if (typeof tree === "string") {
        // here we have a terminal string i.e. a token event
        var tokenEvent;
        if (tokenEvents.hasOwnProperty(tree)) {
            tokenEvent = tokenEvents[tree]; 
        } else {
            tokenEvents[tree] = tokenEvent = new TokenEvent();            
        }
        var tn = new TransitionNetwork();
        tn.promise = tokenEvent.promise;
        return tn;
    }
    
    res = TransitionNetwork.build(tree[0],tokenEvents);
    var i;
    for (i=1; i < tree.length; i++) {
        if (tree[i].hasOwnProperty('and')) {
            rightTN = TransitionNetwork.build(tree[i]['and'], tokenEvents); 
            tmpTN = res.and(rightTN);
        } else {
            if (tree[i].hasOwnProperty('or')) {
                rightTN = TransitionNetwork.build(tree[i]['or'], tokenEvents);
                tmpTN = res.or(rightTN);
            } else {
                console.warn('[ARCS] Illegal tree');
            }
        }
        res = tmpTN;        
    }*/    
    
    return res;
};

export default TransitionNetwork;
