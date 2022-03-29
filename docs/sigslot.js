exports.defineTags = function(dictionary) {
	dictionary.defineTag('signal', {
		onTagged: function(doclet, tag) {
			doclet.signal = true;
        },
        mustNotHaveValue : true,
        mustNotHaveDescription: true
	});
	dictionary.defineTag('slot', {
		onTagged: function(doclet, tag) {
			doclet.slot = true;
		},
        mustNotHaveValue : true,
        mustNotHaveDescription: true
	});
    dictionary.defineTag('emits', {
        onTagged: function(doclet, tag) {
            doclet.emits = doclet.emits || [];
            doclet.emits.push(tag.value);
        },
        mustHaveValue: true
    });
};


exports.handlers = {
    newDoclet : function(e) {
        var doclet = e.doclet;
        if (doclet.kind === 'function') {
            doclet.signal = doclet.signal || false;
            doclet.slot = doclet.slot || false;
        }
    } 
};