import utils from './utils'

export default function ( cpt ) {
    var now = Date.now( ),
        warn = window.console ? console.warn : utils.noop,
        apiReg = /^(error|api|speed|sum|avg|percent|custom|msg|setPage|setConfig)$/;

    function sendPic( _this, t ) {
        if ( "object" == typeof t ) {
            t = utils.serialize( t )
        };
        var url = _this.getConfig( "imgUrl" );
        url += t;
        var key = "__request_hold_" + ( now++ ).toString( 36 ),
            img = window[key] = new Image( );
        img.onload = img.onerror = function ( ) {
            window[key] = undefined
        }
        img.src = url
        img = null
    }
    function send( _this, obj ) {
        var n;
        if ( "error" === obj.t && (n = _this._reqQueue[0]) && "error" === n.t && obj.msg === n.msg ) {
            n.times++;
            return _this
        } else {
            _this._reqQueue.unshift( obj )
            _this.onReady( function ( ) {
                _this._reqTmr = utils.delay( function ( ) {
                    _this._clear( )
                }, "error" === obj.t ? 3e3 : -1)
            })
            return _this
        }
    }
    utils.ext(cpt.prototype, {
        _clear: function ( ) {
            var item,
                _this = this;
            clearTimeout( _this._reqTmr )
            _this._reqTmr = null
            for ( ; item = _this._reqQueue.pop( ); ) {
                sendPic( _this, item );
            }
            return _this
        },
        _sendPipe: function ( arr ) {
            var _this = this;
            if ( !arr || !arr.length ) {
                return _this
            }
            if ("Array" === utils.checkType(arr[0])) {
                return utils.each( arr, function ( item ) {
                    return t._sendPipe( item )
                });
            }
            var item = arr.shift( );
            if (!apiReg.test( item )) {
                return _this
            }
            try {
                _this[n].apply( _this, arr )
            } catch ( e ) {
                warn( "[BL] Error in sendPipe", e )
            }
        },
        _sendHealth: function ( ) {
            var _this = this,
                obj = utils.ext( {}, _this._health );
            obj.healthy = obj.errcount > 0 ? 0 : 1;
            var time = Date.now( ) - _this.sBegin;
            if ( time >= 2e3 ) {
                obj.stay = time
                _this._lg( "health", obj, 1 )
            }
            _this._health = {
                errcount: 0,
                apisucc: 0,
                apifail: 0
            }
        },
        _lg: function ( tag, obj, time ) {
            var _this = this,
                conf = _this._conf;
            time = time || conf.sample
            if (obj && !conf.disabled && conf.pid && _this.sampling( time )) {
                obj = utils.ext({
                    t: tag,
                    times: 1 / time,
                    page: _this.getPage( ),
                    tag: conf.tag || ""
                }, obj, _this._commonInfo( ), {
                    pid: conf.pid,
                    sid: _this.session,
                    z: ( now++ ).toString( 36 )
                })
                return send( _this, obj )
            } else {
                return _this
            }
        }
    })
    return cpt
}
