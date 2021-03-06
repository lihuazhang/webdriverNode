/*!
 * webdriverNode.js
 * @Neekey <ni184775761@gmail.com>
 * MIT Licensed
 *
 */


// Helpers.
var http = require( 'http' );
var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'underscore' );

// modules
var Communicate = require( './communicate' );
//var ErrorHandler = require( './errorHandler' );
var Log = require( './log' );
var CommandManager = require( './commandManager' );
var PluginManager = require( './pluginManager' );
var Base64ToFile = require( './base64ToFile' );
var ErrorConfig = require( './errorConfig' );

var ErrorCodes = ErrorConfig.codes;
var ErrorEnums = ErrorConfig.enums;


/**
 * WebdriverNode Constructor.
 *
 * @param options
 * @constructor
 */
var WebdriverNode = function ( options )
{
    options = options || {};

    var self = this;

    /**
     * Configuration for internal use.
     *
     * @type {Object}
     * @private
     */
    self._config = {};

    /**
     * Data for internal use.
     *
     * @type {Object}
     * @private
     */
    self._data = {};

    /**
     * Modules from external.
     *
     * @type {Object}
     * @private
     */
    self._mods = {};

    /**
     * Plugins from external.
     *
     * @type {Object}
     * @private
     */
    self._plugins = {};

    /**
     * 用户的设置(备份)
     *
     * @type {Object}
     * @private
     */
    self._config[ '_options' ] = _.clone( options );

    /**
     * Log level
     *
     * @type {String}
     * @private
     */
    self._config[ 'logLevel' ] = options.logLevel || 'verbose';

    /**
     * The path for screenshot to save.
     *
     * @type {String}
     * @private
     */
    self._config[ 'screenShotPath' ] = options.screenShotPath || __dirname;

    /**
     * A default Capabilities JSON Object sent by the client describing the capabilities a new session created by the server should possess.
     * Any omitted keys implicitly indicate the corresponding capability is irrelevant.
     *
     * @type {Object}
     * @private
     * @link http://code.google.com/p/selenium/wiki/JsonWireProtocol#Introduction - Capabilities JSON Object
     */
    self._config[ 'defaultDesiredCapabilities' ] = {
            browserName:"firefox",
            version:"",
            javascriptEnabled:true,
            platform:"ANY"
        };

    /**
     * An object describing the session's desired capabilities.
     *
     * @type {Object}
     * @private
     */
    self._config[ 'desiredCapabilities' ] = _.extend( self._config[ 'defaultDesiredCapabilities' ], options.desiredCapabilities );


    /**
     * Record all log info.
     *
     * @type {Array}
     * @private
     */
    self._data[ 'logInfo' ] = [];

    /**
     * For saving of the session Id that received from server
     *
     * @type {*}
     * @private
     */
    self._data[ 'sessionId' ] = options.sessionId;

    /**
     * Reading all commands.
     *
     * @type {CommandManager}
     */
    self._mods[ 'commandManager' ] = new CommandManager( self );

    /**
     * Communicate instance to communicate with the selenium server.
     *
     * @type {Communicate}
     * @private
     */
    var communicate = self._mods[ 'communicate' ] = new Communicate( self );

    /**
     * Logger to save and output all the data transmission.
     *
     * @type {Log}
     * @private
     */
    var log = self._mods[ 'log' ] = new Log;

//    var errorHandler = self._mods[ 'errorHandler' ] = ErrorHandler;


    // Bind events
    communicate.on( 'request', function( requestOption, options, data ){

        log.command( '%s', options.commandName );
        if( data ){
            log.data( data );
        }
    });

    communicate.on( 'requestError', function( err ){

        log.error( 'A error occurs when requesting command! ERR: %s', JSON.stringify( err ) );
    });

    communicate.on( 'resultParseError', function( err, data ){

        log.error( 'A error occurs when parsing the response data, DATA: %s.', data );
    });

    communicate.on( 'commandError', function( result, commandName ){

        var ifUnKnownError = false;
        var screenShotFilename;

        switch( result.status ){

            case ErrorEnums.NoSuchElement:
                break;
            case ErrorEnums.NoSuchFrame:
                break;
            case ErrorEnums.UnknownCommand:
                break;
            case ErrorEnums.StaleElementReference:
                break;
            case ErrorEnums.ElementNotVisible:
                break;
            case ErrorEnums.InvalidElementState:
                break;
            case ErrorEnums.UnknownError:
                ifUnKnownError = true;
                break;
            case ErrorEnums.ElementIsNotSelectable:
                break;
            case ErrorEnums.JavaScriptError:
                break;
            case ErrorEnums.XPathLookupError:
                break;
            case ErrorEnums.Timeout:
                break;
            case ErrorEnums.NoSuchWindow:
                break;
            case ErrorEnums.InvalidCookieDomain:
                break;
            case ErrorEnums.UnableToSetCookie:
                break;
            case ErrorEnums.UnexpectedAlertOpen:
                break;
            case ErrorEnums.NoAlertOpenError:
                break;
            case ErrorEnums.ScriptTimeout:
                break;
            case ErrorEnums.InvalidElementCoordinates:
                break;
            case ErrorEnums.IMENotAvailable:
                break;
            case ErrorEnums.IMEEngineActivationFailed:
                break;
            case ErrorEnums.InvalidSelector:
                break;
            default:
                ifUnKnownError = true;
                break;
        }

        var errorInfo = ErrorCodes[ result.status ];

        if( _.isObject( result.value ) ){
            // Prevent too much output.
            // Also, base64 string is unreadable,
            // and I think nodeJS user don't care about the JAVA stack trace very much.
            var screenData = result.value.screen;
            var stackTrace = result.value.stackTrace;
            result.value.screen = '**SCREEN IMAGE DATA**';
            result.value.stackTrace = '**STACK TRACE**';
        }

        log.error( 'A `%s` error occurs when executing command `%s`: %s.',
            errorInfo.id, commandName, JSON.stringify( result ) );

        // Don't saving screenShot if an unknown error occurs.
        if( ifUnKnownError === false && result.value && result.value.screen ){

            try{
                screenShotFilename = Base64ToFile({
                    data: screenData,
                    path: self._config[ 'screenShotPath' ],
                    // Add error info into filename, like: /screenShot/-ERROR[7:NoSuchElement]-randomString.png
                    extraInfo: '-ERROR[' + result.status + ':' + errorInfo.id + ']-'
                });

                log.other( 'The screenshot when error occurs is saving to: %s', screenShotFilename );
            }
            catch( e ){
                log.error( 'An error occurs when saving screen shot, filename: %s, ERR: %s',
                    screenShotFilename, JSON.stringify( e ) );
            }
        }
    });

    communicate.on( 'result', function( result ){

        if( result.value ){
            log.result( 'Data received from server: %s', result.value );
        }
    });


    // Run all the Plugins
    self._mods[ 'pluginManager' ] = new PluginManager( self );
};

/**
 * WebdriverNode factory.
 *
 * @param options
 * @return {*}
 */
exports.remote = function ( options ){

    // make sure we have a default options if none are provided
    options = options || {};

    return new WebdriverNode( options );
};

/**
 * 返回制定client的一个配置数据，之后可以通过webdriverNode.remote( option )
 * 来重新实例化一个具有同样效用的client
 * @param client
 * @return {Object}
 */

exports.toJSON = function( client ){
    // 获取用户配置
    var options = JSON.parse( JSON.stringify( client._config[ '_options' ] ));
    // 获取sessionId
    options.sessionId = client._data.sessionId;
    return options;
};

/**
 * 实例化，其实就是调用一下remote方法
 * @param option
 * @return {WebdriverNode}
 */

exports.instantiate = function( option ){
    return exports.remote( option );
};

