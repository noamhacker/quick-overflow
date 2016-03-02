
initialize();
listen();

function initialize() {
	//get the state of the extension... 
	//http://stackoverflow.com/questions/2153070/do-chrome-extensions-have-access-to-local-storage
	var isEnabled = "";
	chrome.storage.local.get('enabled', function(result){
		//alert(result);
		set_checkbox(result.enabled);
	});
}

function set_checkbox(isEnabled)
{
	//ensure checkbox matches what the local storage says
	if (isEnabled == 'true') {
		document.getElementById("state").checked = true;
	}
	else if (isEnabled == 'false'){
		document.getElementById("state").checked = false;
	}
	//when first installed, isEnabled won't have a value, so set it to true
	else if (typeof isEnabled === 'undefined')
	{
		isEnabled = true;
		chrome.storage.local.set({'enabled': 'true'}, function(){
			set_checkbox('true');
		});
	}
	listen();
}

function listen()
{
	//thanks http://stackoverflow.com/a/27096908/4926817
	document.addEventListener("DOMContentLoaded", function (event) {
	    var _selector = document.querySelector('input[id="state"]');
	    _selector.addEventListener('change', function (event) {
	        if (_selector.checked) {
	            //store the state
				chrome.storage.local.set({'enabled': 'true'}, function(){
					set_checkbox('true');
				});
	        } else {
	            //store the state
	     		chrome.storage.local.set({'enabled': 'false'}, function(){
	     			set_checkbox('false');
	     		});
	        }
	    });
	});
}

