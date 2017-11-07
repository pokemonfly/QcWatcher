import utils from './utils'
import serv from './serv'
import api from './api'
import handler from './handler'
import hook from './hook'

const CFG = {
    pid: 'default',
    page: null,
    ignoreUrlPath: [
        {
            rule: /(([\w\.-]+){2,6})(\:\d{4,5})?((\/[\w\.%-]+){2})\/.*$/,
            target: "$1$3$4"
        }, {
            rule: /\/([a-z\-_]+)?\d{2,20}/g,
            target: "/$1**"
        },
        /\/$/
    ],
    ignoreApiPath: {
        rule: /(\w+)\/\d{2,}/g,
        target: "$1"
    },
    imgUrl: "http://127.0.0.1/www/images/logo.png?",
    sample: 1,
    disabled: false,
    tag: "",
    disableHook: true,
    startTime: null,
    enableSPA: true,
    parseHash: function ( e ) {
        return ( e ? e.replace( /^#\/?/, "" ).replace( /\?.*$/, "" ) : "" ) || "[index]"
    },
    parseResponse: function ( e ) {
        if ( !e || "object" != typeof e )
            return { };
        var t = e.code,
            n = e.msg || e.message || e.subMsg || e.errorMsg || e.ret || e.errorResponse || "";
        return "object" == typeof n && (t = t || n.code, n = n.msg || n.message || n.info || n.ret || JSON.stringify( n )), {
            msg: n,
            code: t,
            success: true
        }
    }
}
const NOW = Date.now( )

@api
@handler
@hook
@serv
class Core {
    constructor( args ) {
        const _hash = NOW.toString( 16 );
        this.session = utils.uu( )
        this.sBegin = Date.now( )
        this._conf = utils.ext( {}, CFG )
        this._samps = {}
        this._reqQueue = [ ]
        this._reqTmr = undefined
        this._spChe = null
        this._spTmr = null;
        this._health = {
            errcount: 0,
            apisucc: 0,
            apifail: 0
        }
        this.hash = function ( ) {
            return _hash
        }
        this.setConfig( args, true )
        this._initHandler( )
        this._initHook( )
        if ( Object.defineProperty && window.addEventListener ) {
            Object.defineProperty(this, "pipe", { set: this._sendPipe })
        }
    }
    getConfig( key ) {
        return key ? this._conf[key] : utils.ext( {}, this._conf )
    }
    setConfig( obj, bl ) {
        if ( obj && "object" == typeof obj ) {
            if ( "sample" in obj ) {
                var sample = obj.sample,
                    num = parseFloat( sample );
                if (/^\d+(\.\d+)?%$/.test( sample )) {
                    num /= 100
                }
                if ( num > 0 && num <= 1 ) {
                    obj.sample = num
                } else {
                    delete obj.sample
                }
            }
            var _this = this,
                conf = this._conf;
            this._conf = utils.ext( {}, conf, obj )
            if ( bl ) {
                return this;
            }
            var s = "disableHook";
            if (s in obj && conf[s] !== obj[s]) {
                obj.key ? _this.removeHook( ) : _this.addHook( )
            }
            s = "enableSPA"
            if (s in obj && conf[s] !== obj[s]) {
                _this._bindHashChange(obj[s])
            }
            return this
        }
    }
    getPage( bl ) {
        var conf = this._conf,
            page = conf.page,
            loc = location;
        if ( page && !bl ) {
            return utils.xcall( page, [], page + "" )
        } else {
            return utils.fbr( loc.host + loc.pathname, conf.ignoreUrlPath )
        }
    }
    setPage( page, bl ) {
        var _this = this,
            prev = _this._prevPage;
        if ( false !== bl ) {
            if ( !page || page === prev ) {
                return _this;
            }
            _this._prevPage = page
            clearTimeout( _this._sendPvTmr )
            _this._handleUnload( 1 )
            _this.session = utils.uu( )
            _this.sBegin = Date.now( )
            _this._sendPvTmr = setTimeout( function ( ) {
                _this._sendPv( )
            }, 2e3)
        }
        _this._conf.page = page
        return _this
    }
    sampling( e ) {
        if ( 1 === e ) {
            return true
        }
        if ("boolean" == typeof this._samps[e]) {
            return this._samps[e];
        } else {
            this._samps[e] = utils.pick( e )
            return this._samps[e]
        }
    }
    onReady( cb ) {
        var _this = this;
        if ( _this.hasLoad ) {
            return cb( );
        }
        if ( "complete" === document.readyState ) {
            _this.hasLoad = true
            cb( )
        } else {
            utils.on( window, "load", function ( ) {
                _this.hasLoad = true
                cb( )
            }, true)
        }
    }
    createInstance( cfg ) {
        cfg = utils.ext( {
            pid: this.getConfig( "pid" )
        }, cfg );
        var app = new Core( cfg );
        cfg.page && app._sendPv( )
        return app
    }
}

export default Core;
