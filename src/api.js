import utils from './utils'

export default function ( cpt ) {
    var startTime,
        _cacheLog = null,
        warn = window.console ? console.warn : utils.noop,
        apiKeys = [
            "api",
            "success",
            "time",
            "code",
            "msg",
            "trace",
            "traceId"
        ];
    try {
        startTime = window.performance.timing.responseStart || Date.now( )
    } catch ( e ) {
        startTime = Date.now( )
    }

    utils.ext(cpt.prototype, {
        error: function ( obj, event ) {
            var _this = this;
            if ( "object" != typeof obj || "string" != typeof obj.message ) {
                return _this;
            }
            var cate = obj.name || "CustomError",
                message = obj.message,
                stack = obj.stack || "",
                str = cate + message + stack + ( Date.now( ) / 1e3 | 1 );
            if ( str === _cacheLog ) {
                return this
            } else {
                _cacheLog = str
                event = event || {}
                stack = stack ? stack.substring( 0, 1e3 ) : undefined
                _this._health.errcount++;
                return this._lg( "error", {
                    cate,
                    msg: message.substring( 0, 1e3 ),
                    stack,
                    file: event.filename,
                    line: event.lineno,
                    col: event.colno
                }, 1 )
            }
        },
        api: function ( obj, isSuccess, time, code, msg, len ) {
            var _this = this;
            obj = "string" == typeof obj ? {
                api: obj,
                success: isSuccess,
                time,
                code,
                msg,
                len
            } : utils.sub( obj, apiKeys )
            obj = utils.ext( {
                code: "",
                msg: ""
            }, obj )
            obj.success = obj.success ? 1 : 0
            obj.time = +obj.time
            if (!obj.api || isNaN( obj.time )) {
                warn( "Invalid time or api" )
                return _this
            } else {
                _this._health[obj.success ? "apisucc" : "apifail"]++;
                return _this._lg( "api", obj )
            }
        },
        speed: function ( key, val, n ) {
            var _this = this,
                st = this.getConfig( "startTime" ) || startTime;
            if (/^s(\d|1[0])$/.test( key )) {
                val = "number" != typeof val ? Date.now( ) - st : val >= st ? val - st : val,
                _this._spChe = _this._spChe || {}
                _this._spChe[key] = val
                clearTimeout( _this._spTmr )
                _this._spTmr = setTimeout( function ( ) {
                    n || (_this._spChe.page = _this.getPage( !0 ))
                    _this._lg( "speed", _this._spChe )
                    _this._spChe = null
                }, 5e3)
            } else {
                warn( "[BL] Invalid point: " + key )
            }
            return _this
        },
        sum: function ( key, val = 1, time ) {
            return this._lg( "sum", {
                key,
                val
            }, time )
        },
        avg: function ( key, val = 0, time ) {
            return this._lg( "avg", {
                key,
                val
            }, time )
        },
        percent: function ( key, subkey, val = 0, time ) {
            return this._lg( "percent", {
                key,
                subkey,
                val
            }, time )
        },
        custom: function ( e, time ) {
            if ( !e || "object" != typeof e ) {
                return this;
            }
            var n = false,
                obj = {};
            utils.each( e, function ( elem, t ) {
                if (!( n = t && t.length <= 20 )) {
                    warn( "[BL] Invalid key: " + t )
                }
                obj["x-" + t] = elem
                return n
            })
            return n ? this._lg( "custom", obj, time || 1 ) : this
        },

        msg: function ( msg, time ) {
            if (msg && !( msg.length > 130 )) {
                return this._lg( "custom", {
                    "x-msg": msg
                }, time )
            }
        },

        track: function ( name, obj ) {
            if ( obj && 'object' == typeof obj.state ) {
                obj.state = JSON.stringify( obj.state )
            }
            return this._lg('track', {
                name,
                ...obj
            });
        },
        trackStart: function ( name ) {
            this._tkChe = this._tkChe || {}
            this._tkChe[name] = Date.now( )
            return this
        },
        trackEnd: function ( name, obj ) {
            var st = this.getConfig( "startTime" ) || startTime,
                tt;
            if (this._tkChe && this._tkChe[name]) {
                st = this._tkChe[name]
                delete this._tkChe[name]
            }
            obj = obj || {}
            obj.time = Date.now( ) - st;
            obj.tt = st
            return this.track( name, obj )
        }
    })
    return cpt
}
