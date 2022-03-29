// no longer needed with the use of imports

import Component from './component.js';
import StateMachine from './statemachine.js';
import isInNode from './isinnode.js';
import Context from './context.js';
import Invocation from './invocation.js';
import Connection from './connection.js';
import Sheet from './sheet.js';
import Application from './application.js';

let ARCS = {
    Component: Component,
    isInNode : isInNode,
    StateMachine: StateMachine,
    Context: Context,
    Invocation: Invocation,
    Connection: Connection,
    Sheet: Sheet,
    Application: Application
};

export default ARCS;
