var is_enabled = ""

inject_listen_insert();

function inject_listen_insert()
{
	//Inject code...
	//create script element
	var script = document.createElement('script');
	//specify function
	script.textContent = '(' + codeToInject + '())';
	//add the script to the user's webpage
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);

	//listen for a message from the injected code
	document.addEventListener('ReportError', function(e) {
		//retrieve error
	    console.log('CONTENT SCRIPT', e.detail.stack, e.detail.filename, e.detail.lineNumber);
	    //format the error and insert into page - ONLY if extension is enabled
	    chrome.storage.local.get('enabled', function(result){
			is_enabled = result.enabled;
			if (is_enabled == 'true')
			{
				createDiv(e)
			}
		});
	    //alert(e)
	});
}

function createDiv(e){
	var div = document.createElement("div");
	div.style.width = "100%";
	div.style.height = "100px";
	div.style.background = "red";
	div.style.color = "white";
	//div.style.z-index = 
	div.innerHTML = '<h3>' + e.detail.title + '</h3>' + e.detail.message + '<br>' + e.detail.filename + '<br>Line: ' + e.detail.lineNumber;
	//document.body.appendChild(div);
	//want to prepend instead of append... http://callmenick.com/post/prepend-child-javascript
	var body = document.querySelector("body");
	body.insertBefore(div, body.firstChild);
}

//not magic. this code is injected and run in the user's webpage
//http://stackoverflow.com/questions/20323600/how-to-get-errors-stack-trace-in-chrome-extension-content-script
//codeToInject definition:
function codeToInject() {
	//listen for an error
    window.addEventListener('error', function(e) {
    	//build an error object
    	console.log(e)
        var error = {
        	title: (e.error.stack).substring(0, e.error.stack.indexOf(':')),
        	message: e.error.message,
            stack: e.error.stack,
            filename: e.filename,
            lineNumber: e.lineno
            // Add here any other properties you need, like e.filename, etc...
        };
        //dispatch a message to a listener in the content script
        document.dispatchEvent(new CustomEvent('ReportError', {detail:error}));
    });
}
