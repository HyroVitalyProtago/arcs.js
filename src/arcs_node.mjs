#!/usr/bin/env -S node --experimental-modules --experimental-json-modules

import ARCS from './arcs.js';
import process from 'process';
import path from 'path';
import fs from 'fs';
//import application from './appli.json';

function usage() {
    let sp = process.argv[1].lastIndexOf(path.delimiter);
    console.log("usage:");
    console.log("\t",
        process.argv[1],
        "description.json"
    );
}

if (process.argv.length < 3) {
    usage();
    process.exit(1);
}


var appDescription = fs.readFileSync(process.argv[2]);
if (appDescription === '') {
    console.error("File '"+process.argv[2]+"' is empty.");
    process.exit(2);
}

var application = JSON.parse(appDescription);

var aap = new ARCS.Application();
aap.import(application);
aap.start();
