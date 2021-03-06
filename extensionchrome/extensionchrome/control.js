//-----------------------------------------------
// Proxy to access current tab recorder instance
// ----------------------------------------------
function RecorderProxy() {
    this.active = null;
}

RecorderProxy.prototype.start = function(url) {
	chrome.tabs.getSelected(null, function(tab) {
	    chrome.runtime.sendMessage({action: "start", recorded_tab: tab.id, start_url: url});
	});
}

RecorderProxy.prototype.stop = function() {
    chrome.runtime.sendMessage({action: "stop"});
}

RecorderProxy.prototype.open = function(url, callback) {// funcion para abrir el script en otra pestaña??
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {action: "open", 'url': url}, callback);
    });
}


//-----------------------------------------------
// UI
//----------------------------------------------
function RecorderUI() {
	this.recorder = new RecorderProxy();
	chrome.runtime.sendMessage({action: "get_status"}, function(response) {
	    if (response.active) {
	    	ui.set_started();
	    } else {
	    	if (!response.empty) {
	            ui.set_stopped();
	        }
	        chrome.tabs.getSelected(null, function(tab) {
                  document.forms[0].elements["url"].value = tab.url;
            });
	    }
	});
  
}

RecorderUI.prototype.start = function() {
    var url = document.forms[0].elements["url"].value;
    if (url == "") {
        return false;
    }
    if ( (url.indexOf("http://") == -1) && (url.indexOf("https://")) ) {
        url = "http://" + url;
    }
    ui.set_started()
    ui.recorder.start(url);
  
    return false;
}

RecorderUI.prototype.set_started = function() {
  var e = document.getElementById("bstop");
  e.style.display = '';
  e.onclick = ui.stop;
  e.value = "stop";
  e = document.getElementById("bgo");
  e.style.display = 'none';
  e = document.getElementById("bexportxy");
  e.style.display = 'none';
}

RecorderUI.prototype.stop = function() {
  ui.set_stopped();
	ui.recorder.stop();
	return false;
}

RecorderUI.prototype.set_stopped = function() {
	var e = document.getElementById("bstop");
	e.style.display = 'none';
	e = document.getElementById("bgo");
  e.style.display = '';
  e = document.getElementById("bexportxy");
  e.style.display = '';
}


RecorderUI.prototype.export = function(options) {// me redirecciona a otra pestaña para la generacion el script
  if(options && options.xy) {
    chrome.tabs.create({url: "./casper.html?xy=true"});
  } else {
    chrome.tabs.create({url: "./casper.html"});
  }
}

var ui;

// bind events to ui elements
window.onload = function(){
    document.querySelector('input#bgo').onclick=function() {ui.start(); return false;};
    document.querySelector('input#bstop').onclick=function() {ui.stop(); return false;};
    document.querySelector('input#bexportxy').onclick=function() {ui.export({xy: true}); return false;};
    ui = new RecorderUI();
}
