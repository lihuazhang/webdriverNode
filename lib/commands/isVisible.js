/**
 获取指定元素的可见性

 用法：this.getVisible(cssSelector, function(ret){});

 例如：
 <input id="id" style="display: none;" value="t1234" />

 this.getVisible('#id', function(ret){
    ret === false
 })

 注意：此处支持所有的css选择器，可以多级使用，如（#id .class:first）
 */
exports.command = function(cssSelector, callback)
{
	var self = this;

	self.element("css selector", cssSelector,
		function(result)
		{
			if (result.status == 0)
			{
				self.elementIdDisplayed(result.value.ELEMENT, 
					function(result)
					{
						if (typeof callback === "function")
						{
							callback(result.value);
						}
					}
				);
			}
			else
			{
				if (typeof callback === "function")
				{
					callback(result);
				}
			}
		}
	);
	
};

