/******************************************************************************
 * Sheet implementation
 * ***************************************************************************/
import Context from './context.js';
import Invocation from './invocation.js';
import Connection from './connection.js';

/**
 * Constructs a sheet
 * @param context {object} a context object
 * @class
 * @classdesc A Sheet is an operationnal configuration in an application. It 
 * contains many things: multiple sets of {@link ARCS.Invocation} 
 * performed at different times
 * and a set of {@link ARCS.Connection}. Sheets have two high level operations:
 * activation and deactivation. 
 */
let Sheet = function (ctx /*context*/) {
    var context = new Context();
    var preconnections = [], postconnections = [], cleanups = [], connections = [],
        invokePreconnections, invokePostconnections, invokeCleanups, 
        connect, disconnect, getComponentName,
        preCount = 0, postCount = 0, cleanCount = 0, connCount = 0;
        
    invokePreconnections = function () {
        var i;
        for (i = 0; i < preconnections.length; i++) {
            preconnections[i].invoke();
        }
    };
    invokePostconnections = function () {
        var i;
        for (i = 0; i < postconnections.length; i++) {
            postconnections[i].invoke();
        }
    };
    invokeCleanups = function () {
        var i;
        for (i = 0; i < cleanups.length; i++) {
            cleanups[i].invoke();
        }
    };
    connect = function () {
        var i;
        for (i = 0; i < connections.length; i++) {
            connections[i].connect();
        }
    };
    disconnect = function () {
        var i;
        for (i = 0; i < connections.length; i++) {
            connections[i].disconnect();
        }
    };
    
    this.setContext = function (ctx) {
        context = ctx;
    };
    /**
     * Activates this sheet. Pre-connection invocations are peformed, then 
     * connections are established and post-connection invocations are finally 
     * performed.
     */
    this.activate = function () {
        context.instanciate().then(function() {        
            invokePreconnections();
            connect();
            invokePostconnections();
        });
    };
    /**
     * Deactivates this sheet. Connections are removed and then cleanup invocations
     * are performed.
     */
    this.deactivate = function () {
        disconnect();
        invokeCleanups();
    };
    
    this.addPreConnection = function (obj) {
        var pre = Invocation.cast(obj, context);
        pre.id = preCount++;
        preconnections.push(pre);
        return pre.id;
    };
    
    this.addPostConnection = function (obj) {
        var post = Invocation.cast(obj, context);
        post.id = postCount++;
        postconnections.push(post);
        return post.id;
    };


    this.addCleanup = function (obj) {
        var cleanup = Invocation.cast(obj, context);
        cleanup.id = cleanCount++;
        cleanups.push(cleanup);
        return cleanup.id;
    };
    
    this.addConnection = function (obj) {
        var connection = Connection.cast(obj, context);
        connection.id = connCount++;
        connections.push(connection);
        return connection.id;
    };

    
    var removeItem = function(id, tab) {
        var i = tab.length;
        
        while ( i-- && tab[i].id !== id );
        
        if (i >= 0) {
            tab.splice(i,1);
        } else {
            console.warn("Could not remove data with id", id);
        }
    };
    
    this.removePreConnection = function (id) {
        removeItem(id, preconnections);
    };
    
    this.removePostConnection = function (id) {
        removeItem(id, postconnections);
    };
    
    this.removeCleanup = function (id) {
        removeItem(id, cleanups);
    };
    
    var changeItem = function(id, value, tab) {
        var i = tab.length;        
        while ( i-- && tab[i].id !== id );
        if (i >= 0) {
            tab[i].value = value;
        }
    };
    
    this.changePreConnection = function (id, value) {
        changeItem(id, value, preconnections);
    };
    
    this.changePostConnection = function (id, value) {
        changeItem(id, value, postconnections);
    };
    
    this.changeCleanup = function (id, value) {
        changeItem(id, value, cleanups);
    };
    
    this.removeConnection = function (id) {
        removeItem(id, connections);
    };
    
    
    var swapItems = function (id1, id2, tab) {
        var item;
        
        var i = tab.length, j = tab.length;
        
        while( i-- && tab[i].id !== id1 ) ;
        while( j-- && tab[j].id !== id2 ) ;

        if (i >= 0 && j >= 0) {
            item = tab[i];
            tab[i] = tab[j];
            tab[j] = item;
            tab[i].id = id1;
            tab[j].id = id2;
        }
    };
    
    this.swapConnections = function (id1, id2) {
        swapItems(id1, id2, connections);
    };
    
    this.swapCleanups = function (id1, id2) {
        swapItems(id1, id2, cleanups);
    };
    
    this.swapPreConnections = function (id1, id2) {
        swapItems(id1, id2, preconnections);
    };
    
    this.swapPostConnections = function (id1, id2) {
        swapItems(id1, id2, postconnections);
    };

    
    var cacheConnectionsInvocations = function(object) {
        var i = 0, castInvocation = Invocation.cast, castConnection = Connection.cast;
        for (i = 0; i < object.preconnections.length; i++) {
            preconnections.push(castInvocation(object.preconnections[i], context));            
        }
        for (i = 0; i < object.postconnections.length; i++) {
            postconnections.push(castInvocation(object.postconnections[i], context));
        }
        for (i = 0; i < object.cleanups.length; i++) {
            cleanups.push(castInvocation(object.cleanups[i], context));
        }
        for (i = 0; i < object.connections.length; i++) {
            connections.push(castConnection(object.connections[i], context));
        }        
    };
    
    /**
     * Imports a structure object describing the content of a sheet.
     * @param object {object} structured object describing sheet's content.
     */
    this.import = function (object) {
        if (object.hasOwnProperty("context")) {
            context = new Context(object.context);
            context.setParent(ctx);
        }
        
        // the caching system below should wait for the context to be proper initialized
        // todo: there may be a flow here if the instanciation is too long.
        context.instanciate().then( function() {
            cacheConnectionsInvocations(object);
        });
    };
    
    var revertInvocation = function (obj) { 
        return {
            destination: context.getComponentName(obj.getDestination()),
            slot: obj.getSlot(),
            value: obj.getValue()
         };
    };
    
    var revertConnection = function (obj) {
        return {
            source: context.getComponentName(obj.getSource()),
            signal: obj.getSignal(),
            destination: context.getComponentName(obj.getDestination()),
            slot: obj.getSlot()
        }; 
    };
    
    this.toJSON = function () {
        var preconns = [];
        var postconns = [];
        var conns = [];
        var cleans = [];
        
        var i;        
        for (i = 0; i < connections.length; i++) {
            conns.push(revertConnection(connections[i]))
        }
        for (i = 0; i < preconnections.length; i++) {
            preconns.push(revertInvocation(preconnections[i]))
        }
        for (i = 0; i < postconnections.length; i++) {
            postconns.push(revertInvocation(postconnections[i]))
        }
        for (i = 0; i < cleanups.length; i++) {
            cleans.push(revertInvocation(cleanups[i]))
        }
                
        return  {
            preconnections : preconns,
            postconnections : postconns,
            connections: conns,
            cleanups: cleans           
        };
    };
    
    //console.log("setting parent");
    context.setParent(ctx);
};

export default Sheet;
