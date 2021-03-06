/**
 在当前鼠标位置双击鼠标左键（当前位置可由moveto设定）

 用法：this.doDoubleClick(function(ret){});

 其中ret.value为null
 */
var http = require("http");
exports.command = function(callback) 
{
	var commandOptions =  {
		path: "/session/:sessionId/doubleclick",
		method: "POST"
	};
	
	var requestOptions = commandOptions;

	var data = {};
		
	this._mods.communicate.request(
		requestOptions, 
		this.proxyResponseNoReturn(callback), 
		data
	);
};
