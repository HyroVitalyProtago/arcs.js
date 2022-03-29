/** The aim of this part is to provide a bundler for the arcsapp so that less files are downloaded at runtime
 *
 */

const path=require('path');

module.exports = function arcsappToJs(options, loaderContext, content) {
    // content is here our file arcsapp.json
    
    let descr = JSON.parse(content);
    
    let enginePath = options.enginePath || '';
    
    
    let code = `import ARCS from '${enginePath}/arcs.js';\n`;
    let libs = [];
    
    
    let libCnt = 0;
    descr.context.libraries.forEach( e => {
        let libPath = path.resolve(__dirname, '../build', e);        
        code += `import __obj${libCnt} from '${libPath}';\n`; 
        libs.push(`__obj${libCnt}`);
        libCnt ++;
    });
        
    code += `let descr=${content};\n`;
    code += `let aap = new ARCS.Application();\n`;
    code += `aap.import(descr);\n`;
    
    libs.forEach( l => {
        code += `aap.getContext().addFactories(${l});\n`;
    });
    code += `aap.start();\n`;

    return {
        cacheable : true,
        code : code
    }; 

};


