/******************************************************************************
 * Application implementation
 * ***************************************************************************/
import Context from './context.js';
import Sheet from './sheet.js';
import Component from './component.js';

/**
 * Creates an application runnable by the ARCS engine.
 * @class Application
 * @classdesc The application is the master class of the ARCS engine. 
 * It is initialized using a structured object (possibly described in JSON, 
 * see {@link Application#import}) 
 * to load all external scripts describing components, instanciate
 * all components and then start the application
 */
let Application = function () {
    var context = new Context(),
        sheets = {},
        controller = {},
        dependencies = [],
        self = this,
        currentSheet = "",
        preProcess;
        

    /** 
     * Exports an object representing an application
     * @function Application#export
     */    
    this.export = function() {
        var i;
        var description = { 
            context: context, 
            controller: context.getComponentName(controller), 
            sheets: sheets            
        } ;
        
        // first problem: when loaded by the editor, libraries are not the good ones
        //description.context.libraries = libraries;        
        return description;
    };
    
    this.getContext = function () {
        return context;
    };
        
    this.getSheetList = function() {
        return Object.keys(sheets);
    };
        
    this.getSheet = function (sName) {
        return sheets[sName];
    };
            
    this.addSheet = function (sName, sheet) {
        sheets[sName] = sheet;
        sheet.setContext(context);
    };

    
    this.removeSheet = function (sName) {
        delete sheets[sName];
    };
        
    this.launch = function () {
        console.log("[ARCS] Starting application...");
        // first, we should instanciate components
        var i, temp, sheetList; 

        temp = context.getComponent(controller); //[controller].instance;
        controller = temp;
        
        if (controller === undefined) {
            console.error("[ARCS] undefined controller");
            return ;
        }
        // then we should work on sheets
        sheetList = Object.keys(sheets);
        for (i = 0; i < sheetList.length; i++) {
            temp = new Sheet(context);
            temp.import(sheets[sheetList[i]], context);
            sheets[sheetList[i]] = temp;
        }

        Component.connect(controller, "requestSheet", self, "setSheet");
        Component.connect(controller, "requestTermination", self, "finish");
        controller.start();
    };
    
    
    this.setController = function (ctrlName) {
        controller = context.getComponent(ctrlName); //[ctrlName].instance;
    };
    
    /**
     * Sets the current sheet of the application. This method is in fact designed
     * as a slot and may be triggered by a statemachine. If a sheet is already the
     * current one, then it is deactivated before activating this new sheet.
     * This method may warn that it is trying to activate a hollow sheet. It is 
     * not inherently an error by itself but it may indicate a problem in your
     * application.
     * @param sheetName {string} name of the sheet to set as a current sheet.
     * @function Application#setSheet
     */
    this.setSheet = function (sheetname) {
        if (sheets.hasOwnProperty(sheetname)) {
            if (currentSheet) {
                sheets[currentSheet].deactivate();
            }
        
            currentSheet = sheetname;
            sheets[currentSheet].activate();
        } else {
            console.warn('[ARCS] Tried to activate hollow sheet named: ' + sheetname);
        }
    };
    /**
     * This is the end my friend. This triggers the end of the application
     * @function Application#finish
     */
    this.finish = function () {
        if (currentSheet) {
            sheets[currentSheet].deactivate();
        }
    };
    
    
    
    /**
     * Imports a structured object describing the application. The structured object
     * may be described itself in a JSON format.
     * @param object {object} structured object describing an application.
     * @function Application#import  
     * @example
     * // JSON format of an application description
     * {
     *      context : {
     *              libraries : [ "library1", "library2"],
     *              components : [
     *                      // this could be also properties from context
     *                      name1: { type: "type", value: "value if needed" }
     *              ],
     *              constants : [
     *                      // the same observation applies here
     *                      name1: { representation : {JSON/objectRepresentation ? } }
     *              ]
     *      },
     *      controller : controllerId,
     *      sheets : {
     *              sheetId : {     
     *                      preconnections : [
     *                              { 
     *                                      destination: "id", 
     *                                      slot : "slot name",
     *                                      value : JSON/objectRepresentation ?
     *                              }, {...}, {...}
     *                      ],
     *                      postconnections : [
     *                              { 
     *                                      destination: "id", 
     *                                      slot : "slot name",
     *                                      value : JSON/objectRepresentation ?
     *                              }, {...}, {...}
     *                      ],
     *                      connections : [
     *                              {
     *                                      source: "id",
     *                                      destination: "id",
     *                                      slot: "slot name",
     *                                      signal: "signal name"
     *                              }, {...}, {...}
     *                      ],
     *                      cleanups : [
     *                              { 
     *                                      destination: "id", 
     *                                      slot : "slot name",
     *                                      value : JSON/objectRepresentation ?
     *                              }, {...}, {...}
     *                      ]
     *              },
     *              { ... }
     *      }
     * }
     * 
     */
    this.import = function (object) {
        context = new Context(object.context/*.components*/);
        sheets = object.sheets;
        controller = object.controller;
        if (controller === undefined) {
            console.error("[ARCS] Undefined controller. Cannot start application.");
        }
    };

    /**
     * Registers a factory using a key. If a factory was previously existing using 
     * the same key, then it is overridden.
     * @param key {string} name of the factory
     * @param factory {object} component factory to register.
     * @function Application#setFactory
     */
    this.setFactory = function (key, factory) {
        factories[key] = factory;
    };

    this.setDependency = function (key) {
        dependencies[key] = {};
    };
    
    /**
     * Starts the application
     * @function Application#start
     */
    this.start = async function () {
        console.log("[ARCS] Instanciating components...");
        await context.instanciate();
        this.launch();
    };
};


Application.setDependency = function (app, key) {
    app.setDependency(key);
};



Component.create(Application);
Application.slot("setSheet");
Application.slot("finish");

export default Application;
