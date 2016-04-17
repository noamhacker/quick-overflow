// features to add:
	// reading files from external URLs (better for non-local)
	// smarter searching for errors on stack overflow
	// integration with Syntax Center, other APIs
	// explanation of the major types of errors, using a little popup


var is_enabled = ""

inject_listen_insert();

function inject_listen_insert(){
	// Inject code...
	// create script element
	var script = document.createElement('script');
	// specify function
	script.textContent = '(' + codeToInject + '())';
	// add the script to the user's webpage
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);

	// listen for a message from the injected code
	document.addEventListener('ReportError', function(e) {
		// retrieve error
	    // console.log('CONTENT SCRIPT', e.detail.stack, e.detail.filename, e.detail.lineNumber);
	    // format the error and insert into page - ONLY if extension is enabled
	    chrome.storage.local.get('enabled', function(result){
			is_enabled = result.enabled;
			if (is_enabled == 'true')
			{
				createDiv(e)
			}
		});
	    // alert(e)
	});
}

function createDiv(e){

	var div = document.createElement("div");
	div.setAttribute('class', "extension_module");
	div.style.fontFamily = 'Arial Bold,Arial,sans-serif'; 

	var stack = e.detail.stack;
	var badCode = "";
	if(e.detail.filename.indexOf("file://") == 0)
	{
		// read the local file
		var fullFile = readTextFile(e.detail.filename);
		if (fullFile == "00000") //returned from readTextFile if error
			badCode = "Error reading source code file."
		else {
			// split into individual lines
			var lines = fullFile.split('\n');
			badCode = lines[e.detail.lineNumber - 1]
			// alert (badCode)
		}
	}
	else if (e.detail.filename.endsWith(".html") || e.detail.filename.endsWith(".js"))
	{
		// read the file from the url
		var allText = ""
		var lines = ""
		var my_url = e.detail.filename.split("/").pop();
		// console.log(my_url)
		var text = httpGet(my_url)
		if (!(typeof text === 'undefined'))
		{
			// console.log(text)
			var lines = fullFile.split('\n');
			badCode = lines[e.detail.lineNumber - 1]
		}
		else
			badCode = "Source code file unreadable. For best results, develop locally within <script> tags."
	}
	else
	{
		badCode = "Source code file unreadable. For best results, develop locally within <script> tags."
	}
	var cause = "";
	if (!(typeof stack === 'undefined'))
	{
		cause = stack.substring(stack.indexOf(e.detail.message) + e.detail.message.length);
		if (cause.length > 0)
		{	
			cause = cause.substring(0, cause.indexOf('(file://') - 1)
		}
	}
	var url = "http://stackoverflow.com/search?q=Uncaught " + e.detail.title + ' ' + e.detail.message;
	url = url.split(' ').join('+');
	url += '+[javascript]';
	var fontString_monospace = "'Courier New', Courier, monospace;"
	div.innerHTML = '<table style="width:98%;"><tr><td style="width:50px;"><a href="' + url + '" target="_blank">'
			+ '<img src="http://noamhacker.com/SO-icon.png" style="width:40px;"></a></td>'
			+ '<td><a href="' + url + '" target="_blank"><q_o_title>Uncaught ' 
			+ e.detail.title + '</q_o_title><br>' 
			+ e.detail.message + '</a></td><td style="text-align:right"><button onclick="hideElement(this)">Dismiss</button></td></tr></table>' 
			+ "<p>Error caused by: </p>"
			+ '<div id="bad_code_here" style="font-family:' + fontString_monospace 
						+ ' color:red; font-size:18px; border:1px solid red; border-radius:10px; padding:10px;"></div><br>'
			+ cause + "<br>"
			+ '<table style="width:100%;"><tr><td>From: ' + e.detail.filename + '</td><td>Line: ' 
			+ e.detail.lineNumber + '</td></tr></table>';
	
	// create a function to hide the div
	var script = document.createElement("SCRIPT");
	var hideFunction = document.createTextNode("function hideElement(element){element.parentNode.parentNode.parentNode.parentNode.parentNode.remove()}");
	script.appendChild(hideFunction);

	// add a blank span to the head so we can append our module to the head (in case the head is empty)
	var empty_span = document.createElement("span")
	empty_span.setAttribute("class", "ignore_me")
	document.head.appendChild(empty_span)

	// document.body.appendChild(div); - this is not what we want
	// want to prepend instead of append... http://callmenick.com/post/prepend-child-javascript
	var body = document.querySelector("head");
	body.insertBefore(script, body.firstChild);
	body.insertBefore(div, body.firstChild);

	// we don't want to render the html that is in the bad code, just the text, so we must use textContent
	document.getElementById("bad_code_here").textContent = badCode;
	// function hideElement(){alert("yo")}
}


// not magic. this code is injected and run in the user's webpage
// http://stackoverflow.com/questions/20323600/how-to-get-errors-stack-trace-in-chrome-extension-content-script
// codeToInject definition:
function codeToInject(){
	// listen for an error
    window.addEventListener('error', function(e) {
    	// build an error object
    	// console.log(e)
        if (!(typeof e.error.stack === 'undefined')) //if it is one of the common errors
        {
	        var error = {
	        	title: (e.error.stack).substring(0, e.error.stack.indexOf(':')),
	        	message: e.error.message,
	            stack: e.error.stack,
	            filename: e.filename,
	            lineNumber: e.lineno
	            // Add here any other properties you need, like e.filename, etc...
	        }
	    }
	    else // it must be a thrown error
	    {
	    	var error = {
	    		title: e.error.name,
	        	message: e.error.message,
	            filename: e.filename,
	            lineNumber: e.lineno
	            // Add here any other properties you need, like e.filename, etc...
	        }
	    }
        // dispatch a message to a listener in the content script
        document.dispatchEvent(new CustomEvent('ReportError', {detail:error}));
    });
}


// thanks http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
function readTextFile(file){
	var allText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                // alert(allText);
            }
        }
    }
    rawFile.send(null);
    if (allText != "")
    {
    	return allText;
    }
    else
    	return "00000"
}

// thanks http://stackoverflow.com/questions/10642289/return-html-content-as-a-string-given-url-javascript-function
function httpGet(theUrl)
{
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            return xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", theUrl, false );
    xmlhttp.send();    
}
