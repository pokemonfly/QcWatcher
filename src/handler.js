import utils from './utils'

export default function ( cpt ) {
    let i = null,
        elem = document.documentElement,
        s = {
            sr: screen.width + "x" + screen.height
        };

    function getPv( ) {
        var width = window.innerWidth || elem.clientWidth || document.body.clientWidth,
            height = window.innerHeight || elem.clientHeight || document.body.clientHeight,
            uid = utils.cookie( "_nk_" ) || utils.cookie( "_bl_uid" );
        uid || (uid = utils.uu( ), utils.cookie( "_bl_uid", uid, 15552e3 ));
        var obj = {
            uid: uid,
            dt: document.title,
            dl: location.href,
            dr: document.referrer,
            dpr: window.devicePixelRatio || 1,
            de: ( document.characterSet || document.defaultCharset || "" ).toLowerCase( ),
            ul: elem.lang,
            vp: width + "x" + height
        };
        s.vp = obj.vp
        return obj
    }
    function getPerf( ) {
        var perf = window.performance;
        if ( !perf || "object" != typeof perf ) {
            return null;
        }
        // http://javascript.ruanyifeng.com/bom/performance.html
        var keys = [
            "navigationStart",
            "fetchStart",
            "domainLookupStart",
            "domainLookupEnd",
            "connectStart",
            "connectEnd",
            "requestStart",
            "responseStart",
            "responseEnd",
            "domLoading",
            "domInteractive",
            "domContentLoadedEventStart",
            "domContentLoadedEventEnd",
            "domCompleted",
            "loadEventStart",
            "loadEventEnd",
            "msFirstPaint",
            "secureConnectionStart"
        ];
        var checkList = {
                dns: [
                    3, 2
                ],
                tcp: [
                    5, 4
                ],
                ssl: [
                    5, 17
                ],
                ttfb: [
                    7, 6
                ],
                trans: [
                    8, 7
                ],
                dom: [
                    10, 9
                ],
                res: [
                    14, 12
                ],
                firstbyte: [
                    7, 2
                ],
                fpt: [
                    9, 0, 1
                ],
                tti: [
                    10, 0, 1
                ],
                ready: [
                    12, 0, 1
                ],
                load: [ 14, 0, 1 ]
            },
            r = {},
            timing = perf.timing || {};
        utils.each( checkList, function ( e, t ) {
            var n = timing[keys[e[1]]],
                o = timing[keys[e[0]]];
            if (!n && e[2]) {
                n = timing[keys[e[2]]]
            }
            if ( n > 0 && o > 0 ) {
                var a = o - n;
                if ( a >= 0 && a < 36e5 ) {
                    r[t] = a
                }
            }
        });
        var nav = window.navigator,
            connection = nav.connection || nav.mozConnection || nav.webkitConnection,
            l = perf.navigation || {};
        r.ct = connection ? connection.type : "";
        var f = connection ? connection.downlink || connection.bandwidth || -1 : -1;
        f = f > 9999 ? 9999 : f
        r.bandwidth = f
        r.fs = timing[checkList[1]]
        r.navtype = 1 === l.type ? "Reload" : "Other"
        if ( "object" == typeof window.chrome ) {
            try {
                var p = chrome.loadTimes( ),
                    d = p.firstPaintTime,
                    h = p.requestTime;
                if ( d > 0 && h > 0 ) {
                    var v = Math.round(1e3 * ( d - h ));
                    if ( v >= 0 && v < 36e5 ) {
                        r.fpt = v
                    }
                }
                r.navtype = p.navigationType,
                r.protocol = p.connectionInfo
            } catch ( e ) {}
        } else {
            if ( timing[keys[16]] > 0 && timing[keys[1]] > 0 ) {
                r.fpt = timing[keys[16]] - timing[keys[1]];
            }
        }
        s.ct = r.ct
        return r
    }

    utils.on( window, "error", function ( e ) {
        i && i.errorHandler( e )
    }).on( window, "unhandledrejection", function ( e ) {
        i && i.errorHandler( e )
    })

    utils.ext(cpt.prototype, {
        activeErrHandler: function ( sw ) {
            if ( !i || sw ) {
                i = this
            }
            return this
        },
        errorHandler: function ( e ) {
            var _this = this;
            if ( !e ) {
                return _this;
            }
            var type = e.type;
            if ( "error" === type ) {
                _this.error( e.error || {
                    message: e.message
                }, e )
            } else if ( "unhandledrejection" === type ) {
                utils.checkType( e.reason, "Error" ) && _this.error( e.reason )
            }
            return _this
        },
        _sendPerf: function ( ) {
            var _this = this;
            _this.onReady( function ( ) {
                var t = getPerf( );
                if ( t ) {
                    t.page = _this.getPage( true )
                    _this._lg( "perf", t )
                }
            })
            return _this
        },
        _sendPv: function ( ) {
            var _this = this;
            _this.onReady( function ( ) {
                var t = getPv( );
                if ( t ) {
                    _this._lg( "pv", t )
                }
            })
            return _this
        },
        _commonInfo: function ( ) {
            return s
        },
        _handleUnload: function ( e ) {
            var _this = this,
                n = Date.now( );
            if ( n - _this._lastUnload < 200 ) {
                return _this;
            }
            _this._lastUnload = n
            _this._sendHealth( e )
            if ( _this._spChe ) {
                _this._lg( "speed", _this._spChe )
                _this._spChe = null
                clearTimeout( _this._spTmr )
            }
            _this._clear( )
        },
        _bindHashChange: function ( enableSPA ) {
            var _this = this;
            if ( !enableSPA ^ _this._hashHdr ) {
                return _this
            }
            if ( enableSPA ) {
                _this._hashHdr = function ( e ) {
                    var n = _this._conf.parseHash( location.hash );
                    _this.setPage( n, false !== e )
                }
                utils.on( window, "hashchange", _this._hashHdr )
                _this._hashHdr( false )
            } else {
                utils.off( n, "hashchange", _this._hashHdr )
                _this._hashHdr = null
            }
        },
        _initHandler: function ( ) {
            var _this = this;
            if ( _this._hasInitHandler ) {
                return _this;
            }
            var conf = _this._conf;
            utils.on( window, "beforeunload", function ( ) {
                _this._handleUnload( 0 )
            }),
            _this._bindHashChange( conf.enableSPA )
            _this.activeErrHandler( false )
            _this._hasInitHandler = true
            return _this
        }
    })
    return cpt
}
