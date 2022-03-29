import StateMachine from './statemachine.js';
import isInNode from './arcs.js';

/**
 * @classdesc Class representing a context containing libraries and components
 * used by different parts of the framework.
 * @param ctx {object} an object representing data for the context.
 * @class Context
 */
let Context = function( ctx ) { 
    let components = {};
    let constants = {};
    let factories = {};
    let libraries = [];
    //var depLibPromises=[];
    let self = this;
    var loadLibraries;
    var loadDataFile;
    var promiseLibrary;
    var instanciateComponents;
    let preInit = false;
    
    
    factories.StateMachine = StateMachine;

    
    if (ctx !== undefined) {
        libraries = ctx.libraries;
    
        var p;
        for (p in ctx.components) {
            if (ctx.components.hasOwnProperty(p)) {
                components[p] = ctx.components[p];
            }
        }
        
        if (ctx.constants !== undefined) {
            for (p in ctx.constants) {
                if (ctx.constants.hasOwnProperty(p)) {
                    constants[p] = ctx.constants[p];
                }                
            }            
        }
        
    }

    var loadDataFile = async function(fileName) {
        var dataPromise ;
                
        if (isInNode()) {
            return new Promise(function (resolve, reject) {
                var dep = require(/* webpackIgnore: true */fileName);
                if (dep !== undefined) {
                    resolve(dep);
                } else {
                    reject("[ARCS] File not found");
                }
            });
        } else {
            var client = await fetch(fileName);
            return client.json();
        }
    };
        
    var loadLibraries = function () {
        var i;
        // we will use different instances of require either the one of node 
        // or the one from require.js
        Context.currentContext = self;
        
        var res=[];
        for(i=0; i < libraries.length; i++) {
            res.push(self.loadLibrary(libraries[i]));
        }
        return Promise.all(res);        
    };
    
    var instanciateComponents = async function() {
        var p, promises=[];
        for (p in components) {
           if (components.hasOwnProperty(p)) {
                if (factories[components[p].type] === undefined) {
                    console.error("[ARCS] Factory " + components[p].type + " not found.");
                    console.error("[ARCS] Context dump follows: ", libraries, components, constants);
                    return ;
                }                    
                var factory = factories[components[p].type];
                //console.log("instanciating ", p);
                try {
                if (components[p].value !== undefined || components[p].url !== undefined || components[p].ref !== undefined) {                
                    if (components[p].value !== undefined) {
                        components[p].instance = new factory(components[p].value);
                    }
                    if (components[p].url !== undefined) {
                        // we need currying here !
                        var delayInstanciation = function(p,factory) {
                            return function(obj) { 
                                console.log("instanciating from data file");
                                components[p].instance = new factory(obj);
                                return Promise.resolve();                                
                            }
                        };
                        console.log("loading data file", components[p].url);
                        promises.push(
                            loadDataFile(components[p].url).then(delayInstanciation(p,factory))
                        );
                    }
                    if (components[p].ref !== undefined) {
                        if (constants[components[p].ref] !== undefined) {
                                components[p].instance = new factory(constants[components[p].ref]);
                        }                        
                    }
                } else {
                    components[p].instance = new factory();
                }
                } catch(e) { console.error("[ARCS] Component of type ", p, " not instanciated.", e);}
            }
        }        
        return Promise.all(promises);
    };
    
    /**
     * loads a given library and, if necessary, launches a call back function
     * when the library is loaded.
     * @param libName {string} name of the library to load
     * @param cbFunction {function} callback function to call when library is loaded
     * @function Context#loadLibrary
     */
    this.loadLibrary = function (libName, cbFunction) {
        var libUrl = libName, libActualName = libName;
        
        Context.currentContext = self;
        if (typeof libName !== "string") {
            libActualName = libName.name;
            libUrl = libName.url;
        }

        if (libraries.indexOf(libActualName) < 0) {
            libraries.push(libActualName);
        }
        // TODO promisify call to cbFunction
        return import(/* webpackIgnore: true */libUrl).then( function(module) {
            // TODO insert here component factories
            
            for (p in module.default) {
                if (module.default.hasOwnProperty(p)) {
                    Context.currentContext.setFactory(p,module.default[p]);
                }
            }

            if (cbFunction !== undefined) {
                cbFunction();
            }
        }).catch( function(msg) { console.error("[ARCS] Trouble loading '",libUrl,"' with reason -", {msg}) });
    };
    
    /**
     * @return the component list stored inside context
     * @function Context#getComponentList
     */    
    this.getComponentList = function () {
        var list = Object.keys(components);
        var i;
            
        for (i = 0; i < list.length; i++) {
            if ( ! components.hasOwnProperty(list[i])) {
                list.splice(i--,1);
            }
        }
        return list;
    };

    /**
     * @return a constant value stored by the engine given its name
     * @param cName {String} name of the constant
     * @function Context#getConstant
     */
    this.getConstant = function(cName) {
        return constants[cName];
    };
    
    
    // to determine if really needed
    this.getComponentType = function(cName) {
        if (components[cName] === undefined) return undefined;
        return components[cName].type;        
    };
    
    // to determine if really needed
    this.getComponentValue = function(cName) {
        if (components[cName] === undefined) return undefined;
        return components[cName].value;
    };
    
    // to determine if really needed
    this.getComponent = function (cName) {
        if (components[cName] === undefined) return undefined;
        return components[cName].instance;
    };


    // to determine if really needed
    this.getComponentName = function (cmp) {
        var i, keys;
        keys = components.getComponentList();
           
        for(i = 0; i < keys.length; i++) {
            if (components[keys[i]].instance === cmp) {
                return keys[i];
            }
        }
        
        return undefined;
    };

    
    this.addFactories = function(obj) {
        preInit = true;        
        for(p in obj) {
            if( obj.hasOwnProperty(p))
                factories[p] = obj[p];
        }
    };
    
    this.setFactory = function(key, factory ) {
        factories[key] = factory;
    };
    
    this.toJSON = function () {
        var res = {}, p;
        
        for (p in components) {
            if (components.hasOwnProperty(p)) {
                res[p] = { type: components[p].type, value: components[p].value };
            }
        }
        return res;
    };
    
    
    // functions used with editor
    this.setComponentValue = function (cName, cValue) {
        components[cName].value = cValue; // to modifiy       
    };
        
    this.addComponent = function (cName, cType, cValue) {
        var component;
        components[cName] = {};
        components[cName].type = cType;
        components[cName].value = cValue;
        
        var factory = factories[cType];
        if (factory !== undefined) {
            component = new factory(cValue);
        }
        components[cName].instance = component;        
    };

    this.removeComponent = function (cName) {
        delete components[cName];
    };
    
    
        // see if it is needed
    this.getFactory = function (fName) {
        return factories[fName];
    };

    // see if it is needed 
    this.getFactoryList = function() {
        return Object.keys(factories);
    };

    // this should return a promise  !
    this.instanciate = async function () {
        //! TODO
        try {
            if (!preInit) 
                await loadLibraries();
            await instanciateComponents();
        } catch(e) {
            console.error("[ARCS] Trouble instanciating context", e);             
        };        
    };
    
    
    var chainPrototype = function (obj, proto) {
        // this stunt seems better than using 
        // Object.setPrototypeOf or using [object].__proto__
        // due to javascript engine optimizations
        var newObj = Object.create(proto);
        var p ;
        
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                newObj[p] = obj[p];
            }
        }
        return newObj;           
    };
    
    this.chain = function (cmp,cst,fct) {
        // cmp and cst are the children context elements
        // we need to chain contexts properly. 
        return [ chainPrototype(cmp, components), 
                 chainPrototype(cst, constants),
                 chainPrototype(fct, factories)
               ];
    };
            
    
    this.setParent = function (ctx) {
        // chaining factories is also important if contexts are repeating 
        // the same things
        if (ctx === undefined) return;
        var v = ctx.chain(components, constants, factories);
        components = v[0];
        constants = v[1];
        factories = v[2];
    };
    
};


/** pseudo-singleton to current context being used */
Context.currentContext = null;

export default Context;

