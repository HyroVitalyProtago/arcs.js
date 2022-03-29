
/**
 * Bootstrap for the ARCS engine in a browser environment.
 * It relies on require.js to get the job done.
 * @fileaa
 * 
 */
"use strict";

// basically, here we start by importing the module ARCS
//import ARCS from './exports.js';
import ARCS from "./arcs.js";

console.log("[ARCS] Bootstrapping...");

let baseUrl, appDescription, requireMarkup, xhr;

requireMarkup = document.querySelector('[data-arcsapp]');
if (requireMarkup !== undefined) {
        baseUrl = requireMarkup.dataset.baseUrl ;
        appDescription = requireMarkup.dataset.arcsapp || "arcsapp.json";    
}


(async function toto() {
let description = await(fetch(appDescription));
let applicationObject = await(description.json());


console.log("[ARCS] Application description loaded");

let aap = new ARCS.Application();
await aap.import(applicationObject);
aap.start();
})();
