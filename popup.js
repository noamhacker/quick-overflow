initialize();

function initialize() {
	//get the state of the extension... 
	//http://stackoverflow.com/questions/2153070/do-chrome-extensions-have-access-to-local-storage
	var isEnabled = localStorage["enabled"];

	//when first installed, isEnabled won't have a value, so set it to true
	if (typeof isEnabled === 'undefined')
	{
		localStorage["enabled"] = true;
		isEnabled = localStorage["enabled"];
	}

	document.getElementById("test").innerHTML = isEnabled

	//ensure checkbox matches what the local storage says
	if (localStorage["enabled"] == true){
		document.getElementById("state").checked = true;
	}
	else {
		document.getElementById("state").checked = false;
		//document.getElementById("test").innerHTML = "what"
	}

}




//thanks http://stackoverflow.com/a/27096908/4926817
document.addEventListener("DOMContentLoaded", function (event) {
    var _selector = document.querySelector('input[id="state"]');
    _selector.addEventListener('change', function (event) {
        if (_selector.checked) {
            // do something if checked
            document.getElementById("test").innerHTML = "on"
            document.getElementById("state").checked = true;
            //store the state
            localStorage["enabled"] = true;
        } else {
            document.getElementById("test").innerHTML = "off"
            document.getElementById("state").checked = false;
            //store the state
            localStorage["enabled"] = false;
        }
    });
});
