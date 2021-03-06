var _ = require( 'underscore' );
var Compress = require( '../core/compress' );

/**
 * 同步执行方法
 *
 * @param {Function} exeFunc 需要在浏览器中执行的方法，通过return返回的值将作为 `ret.value` 返回给服务器
 * @param {Array} args 需要传递给exeFunc的参数, 必须，因为SyncRun机制的限制，无法只传递一个function（会被当做回调函数）
 * @param {Function} [callback] 脚本执行完毕的回调
 */

exports.command = function( exeFunc, args )
{
    // 后面三个参数都是可选
    var callback;
    var self = this;
    var _arguments = Array.prototype.slice.call( arguments, 1 );

    _arguments.forEach(function( arg ){

        if(_.isArray( arg )){
            args = arg;
        }

        if(_.isFunction(arg)){
            callback = arg;
        }
    });

    // 构造脚本
    var script = '(' + exeFunc.toString() + ').apply( this, Array.prototype.slice.call( arguments, 0 ) );';

    /**
     * 注意此处script中不能以return开头，不然语法要报错...
     * 对script进行 NON-ASCII --> Unicode 处理
     */

    script = 'return ' + Compress( script, function( msg ){ self._mods.log.error( msg  ) });

    // 执行脚本
    this.protocol.execute( script, args || [], function( result ){

            if (typeof callback === "function"){
                callback( result );
            }
        }
    );
};

