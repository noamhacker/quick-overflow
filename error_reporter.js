//not magic
//http://stackoverflow.com/questions/20323600/how-to-get-errors-stack-trace-in-chrome-extension-content-script

//call codeToInject
codeToInject();

//codeToInject definition
function codeToInject() {
	//listen for an error
    window.addEventListener('error', function(e) {
    	//build an error object
        var error = {
            stack: e.error.stack
            // Add here any other properties you need, like e.filename, etc...
        };
        //dispatch a message to a listener in the content script
        document.dispatchEvent(new CustomEvent('ReportError', {detail:error}));
    });
}
