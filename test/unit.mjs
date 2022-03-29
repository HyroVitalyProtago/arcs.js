import chai from 'chai';
import ARCS from '../build/arcs.js';

const expect = chai.expect;

let signalHandler = function(chai, utils) {
    const MODULE = 'signalHandler';
    const FLAG_EXPECTED_SIGNALS = MODULE + "#expectedSignals";
    
    let isComponent = function(obj) {
        return  Array.isArray(obj.slots) && 
            typeof obj.signals === 'object' &&
            typeof obj.emit === 'function';
    };
        
    chai.Assertion.addProperty('component', function() {
        this.assert(
            isComponent(this._obj),
            "expected #{this} to have signals and slots",
            "expected #{this} no to have signals and slots"
        );
    });
    
    chai.Assertion.addMethod('emit', function(signal, options = {}) {
         const registeredSignals = utils.flag(this, FLAG_EXPECTED_SIGNALS)
            ?? utils.flag(this, FLAG_EXPECTED_SIGNALS, [])
            ?? utils.flag(this, FLAG_EXPECTED_SIGNALS);
            
         options.withArgs = options.withArgs ?? [];
         options.count = options.count ?? 0;
                 
        registeredSignals.push({ name: signal,options: options });
    });
     
     
     chai.Assertion.addMethod('when',function(slot) {
         const self = this;
         const expectedSignals = utils.flag(this, FLAG_EXPECTED_SIGNALS);
         if (!expectedSignals || !expectedSignals.length) {
            throw new AssertionError("No signals registered. Use '.emit' before calling '.when'");
         }
         
         let obj = this._obj;
         
         expectedSignals.forEach( function(signal) {
            let Handler = new ARCS.Component.create(            
                function() {
                    this.triggered = false;
                    this.data = [];
                    this.callCount = 0;
                    this.trigger = function() {
                        this.triggered = true;
                        this.callCount++;
                        this.data = arguments;
                    };
                }, ['trigger']
            );
           let handler = new Handler();
            ARCS.Component.connect(obj, signal.name, handler, "trigger");
            if (Array.isArray(slot)) {
                slot.forEach( s => obj[s].call(obj) );
            } else {
                obj[slot].call(obj);
            }
            self.assert(
                handler.triggered,
                "expected #{this} to emit signal "+signal.name,
                "expected #{this} not to emit signal "+signal.name
            );
            
            signal.options = signal.options ?? {};
            if (signal.options.hasOwnProperty("count") && signal.options.count > 0) {
                let count = signal.options.count;
                self.assert(
                    handler.callCount === count,
                    "expected #{this}." + signal.name +" to be emitted " + count + " times",
                    "expected #{this}." + signal.name +" not to emit signal " +count + " times"
                );
            }
            if (signal.options.hasOwnProperty("withArgs") && signal.options.withArgs.length > 0) {
                let args = signal.options.withArgs;
                self.assert(
                    args.length === handler.data.length,
                    "expected #{this} to have " + args.length + " arguments",
                    "expected #{this} not to have " + args.length + " arguments"
                );
                
                for(let i=0; i < args.length; i++) {
                    new chai.Assertion(handler.data[i]).to.deep.equal(
                        args[i],
                        "expected #{this} to equal \"" + args[i] +"\""
                    );
                }                                
            }
         });
    });
};

chai.use(signalHandler);

describe('components', function() {
    it('should have property slots', function() {    
        let C = ARCS.Component.create(function() {});
        let c = new C();
        expect(c).to.have.property('slots');       
    });

    it('should have property signals', function() {    
        let C = ARCS.Component.create(function() {});
        let c = new C();
        expect(c).to.have.property('signals');       
    });
        
    it ('should return correct slot list', function() {
        let C = ARCS.Component.create(function() {
            this.mySlot= ()=>{};
        }, ['mySlot']);
        let c = new C();
        expect(c.slotList()).to.deep.equal(["mySlot"]);
    });

    it ('should return correct signal list', function() {
        let C = ARCS.Component.create(function() {}, [], ['mySignal']);
        let c = new C();
        expect(c.signalList()).to.deep.equal(["mySignal"]);
    });
    
    it ('should accept creating local slots', function() {
        let C = ARCS.Component.create(function() {});
        let c = new C();
        c.slot('mySlot', () => {});
        expect(C.prototype.slots).to.deep.equal([]);
        expect(c.slots).to.deep.equal(['mySlot']);
    });

    it ('should accept creating local signals', function() {
        let C = ARCS.Component.create(function() {});
        let c = new C();
        c.signal('mySignal');
        expect(C.prototype.signals).to.deep.equal({});
        expect(c.signals).to.have.property('mySignal');
    });

    it ('should be a component', function() {
        let C = ARCS.Component.create(function() {});
        let c = new C();
        expect(c).to.be.a.component;
    });

    it ('should emit signal', function() {
        let A = ARCS.Component.create(function() {
                const self = this;
                this.slotA = function() {
                    self.emit('signalA');
                }
            },['slotA'],['signalA']
        );
        let a = new A();
        expect(a).to.emit('signalA').when('slotA');                
    });
    
});



describe('statemachine', function() {
    
    it ('should create slots for tokens', function() {
        let sm = new ARCS.StateMachine();
        sm.setTransitions({
            start: {next:"end"}            
        });
        
        expect(ARCS.StateMachine.prototype.slots).to.deep.equal(['setToken']);
        expect(sm.slots).to.deep.equal(['setToken', 'next']);        
    });
    
    it ('should trigger a single transition', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: {next:"end"}            
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["end"]}).when('next');
    });
    
    it ('should trigger the right transition when faning out with the first token', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: { token1: "state1", token2: "state2" }
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["state1"]}).when("token1");        
    });

    it ('should trigger the right transition when faning out with the second token', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: { token1: "state1", token2: "state2" }
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["state2"]}).when("token2");        
    });
    
    it ('should trigger a transition when at least one event of two is fired (version a)', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: { "a|b" :"end"}            
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["end"]}).when('a');
    });

    it ('should trigger a transition when at least one event of two is fired (version b)', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: { "a|b" :"end"}            
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["end"]}).when('b');
    });
    
    it ('should trigger a transition when two events are fired', function() {
        let sm = new ARCS.StateMachine({
            initial: "start",
            transitions: {
                start: { "a&b" :"end"}            
            }
        });
        sm.start();
        expect(sm).to.emit('requestSheet', { withArgs: ["end"]}).when(['a','b']);
    });
    
});


