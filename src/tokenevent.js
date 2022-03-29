// this class creates a promise that can be deferred as long as necessary.
// calls to accept or reject will solve the promise.

let TokenEvent = function() {
    var refResolve;
    var refReject;
    
    this.promise = new Promise(function(resolve, reject) {
        refResolve = resolve;
        refReject = reject;
    });
    
    this.accept = function() {
        refResolve();
    };
    
    this.abort = function() {
        refReject();
    };    
};

export default  TokenEvent;
