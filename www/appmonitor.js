var exec = require("cordova/exec");

/*
 * HUD and logger
 */

var hud = null;
var loggger = null;

function enableHUD() {
	if (hud) {
		return;
	}
	
	var mainDiv = document.createElement("DIV");
	mainDiv.style.position = "fixed";
	mainDiv.style.top = 0;
	mainDiv.style.left = 0;
	mainDiv.style.right = 0;
	mainDiv.style.width = "auto";
	mainDiv.style.backgroundColor = "black";
	mainDiv.style.color = "white";
	mainDiv.style.opacity = .7;
	
	function addField(label) {
		var containerDiv = document.createElement("DIV");
		
		var labelSpan = document.createElement("SPAN");
		labelSpan.style.display = "inline-block";
		labelSpan.style.width = "30%";
		labelSpan.textContent = label + ":";
		containerDiv.appendChild(labelSpan);
		
		var valueSpan = document.createElement("SPAN");
		valueSpan.style.display = "inline-block";
		valueSpan.style.width = "20%";
		valueSpan.style.textAlign = "right";
		valueSpan.style.fontWeight = "bold";
		valueSpan.textContent = "...";
		containerDiv.appendChild(valueSpan);
		
		mainDiv.appendChild(containerDiv);
		
		return valueSpan;
	}
	
	var usedMemorySpan = addField("Mem Used");
	var limitMemorySpan = addField("Mem Limit");
	
	function refresh(info) {
		usedMemorySpan.textContent = formatBytesValue(info.usedMemory);
		limitMemorySpan.textContent = formatBytesValue(info.limitMemory);
	}
	
	hud = {
		mainDiv: mainDiv,
		callback: refresh
	};
	
	document.body.appendChild(hud.mainDiv);
	installCallback(hud.callback);
	
	console.log("App Monitor HUD enabled");
}

function disableHUD() {
	if (!hud) {
		return;
	}
	uninstallCallback(hud.callback);
	hud.mainDiv.parentNode.removeChild(hud.mainDiv);
	hud = null;
	console.log("App Monitor HUD diabled");
}

function enableLogger() {
	if (loggger) {
		return;
	}
	
	function log(info) {
		var s = "APP MONITOR";
		s += "\r\nMemory Used: " + formatBytesValue(info.usedMemory);
		s += "\r\nMemory Limit: " + formatBytesValue(info.limitMemory);
		console.log(s);
	}
	
	logger = {
		callback: log
	};
	
	installCallback(logger.callback);
	
	console.log("App Monitor logger enabled");
}

function disableLogger() {
	if (!logger) {
		return;
	}
	uninstallCallback(logger.callback);
	console.log("App Monitor logger diabled");
}

function formatBytesValue(num) {
	if (typeof num !== "number") {
		return "n/a";
	}
	if (num > 1000000000) {
		return (num / 1073741824).toFixed(2) + " GB";
	} else if (num > 1000000) {
		return (num / 1048576).toFixed(2) + " MB";
	} else if (num > 1000) {
		return (num / 1024).toFixed(2) + " KB";
	}
	return (num) + " B";
}

/*
 * Polling
 */

var POLLING_INTERVAL = 10000;

var timer = null;
var callbacks = [];

function installCallback(fn) {
	callbacks.push(fn);
	if (callbacks.length === 1) {
		invokeCallbacks();
	}
}

function uninstallCallback(fn) {
	var index = callbacks.indexOf(fn);
	if (index >= 0) {
		callbacks.splice(index, 1);
		if (callbacks.length === 0) {
			clearTimeout(timer);
			timer = null;
		}
	}
}

function invokeCallbacks() {
	getMemoryInfo(function (info) {
		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i](info);
		}
		timer = setTimeout(invokeCallbacks, POLLING_INTERVAL); // recurse async
	}, function (e) {
		console.error("Error retrieving memory info", e);
		timer = setTimeout(invokeCallbacks, POLLING_INTERVAL); // recurse async
	});
}

/* 
 * Low-level placeholder functions
 */

function supportsMemoryInfo(successCallback) {
	exec(function(result) {
		successCallback(result === "true");
	}, function() {
		successCallback(false);
	}, "AppMonitor", "supportsMemoryInfo", []);
}

function getMemoryInfo(successCallback, errorCallback) {
	exec(function(result) {
		if (successCallback) {
			successCallback({
				limitMemory: result["limit"],
				usedMemory: result["used"]
			});
		}
	}, _adaptError(errorCallback), "AppMonitor", "getMemoryInfo", []);
};

function _adaptError(errorCallback) {
	if (errorCallback) {
		return function(msg) {
			errorCallback(new Error(msg));
		};
	}
	return errorCallback;
};



module.exports = {
	enableHUD: enableHUD,
	disableHUD: disableHUD,
	enableLogger: enableLogger,
	disableLogger: disableLogger,
	supportsMemoryInfo: supportsMemoryInfo,
	getMemoryInfo: getMemoryInfo
};
