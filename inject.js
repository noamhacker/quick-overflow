console.log("injects now")
console.trace()
document.onload = function(){
	window.onerror = function(error, url, line) {
		console.log(error + "\n" + url + "\n" + line)
		console.log("sup")
	}
}
console.log("done injecting")



var t = document.createTextNode("Hello World");
document.body.appendChild(t);

//at document_idle, the codeToInject function will be injected to run in webpage context
//create script element
var s = document.createElement('script');
//set the source to where codeToInject is defined
s.src = chrome.extension.getURL('error_reporter.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
//add the script to the user's webpage
(document.head||document.documentElement).appendChild(s);




//listen for a message from the injected code
document.addEventListener('ReportError', function(e) {
	//retrieve error
    console.log('CONTENT SCRIPT', e.detail.stack);
});

