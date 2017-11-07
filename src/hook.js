import utils from './utils'
// fetch 懒的改了
export default function ( cpt ) {
    var _hook = null,
        i = ["catch"],
        fetch = "fetch",
        _fetch = "__oFetch",
        _xhr = "__oXMLHttpRequest",
        xhr = "XMLHttpRequest";
    function removeFetch( ) {
        if (window[_fetch]) {
            window[fetch] = window[_fetch]
            delete window[_fetch]
        }
    }
    function removeXhr( ) {
        if (window[_xhr]) {
            window[xhr] = window[_xhr]
            delete window[_xhr]
        }
    }
    function initXHR( ) {
        if ("function" == typeof window[xhr]) {
            ( function ( xhrApi ) {
                window[_xhr] = xhrApi
                window[xhr] = function ( t ) {
                    var xhr = new xhrApi( t ),
                        i = _hook;
                    if ( !i || !i.api || !xhr.addEventListener ) {
                        return xhr;
                    }
                    var startTime,
                        s,
                        send = xhr.send,
                        open = xhr.open,
                        conf = i._conf;
                    xhr.open = function ( body, t ) {
                        var args = 1 === arguments.length ? [arguments[0]] : Array.apply( null, arguments );
                        open.apply( xhr, args ),
                        s = ( t || "" ).replace( /\?.*$/, "" ),
                        s = s ? utils.fbr( s, conf.ignoreApiPath ) : ""
                    }
                    xhr.send = function ( ) {
                        startTime = Date.now( );
                        var args = 1 === arguments.length ? [arguments[0]] : Array.apply( null, arguments );
                        send.apply( xhr, args )
                    }
                    utils.on( xhr, "readystatechange", function ( ) {
                        if ( s && 4 === xhr.readyState ) {
                            var costTime = Date.now( ) - startTime;
                            if ( xhr.status >= 200 && xhr.status <= 299 ) {
                                var t = xhr.status || 200;
                                if ( xhr.responseType && "text" !== xhr.responseType ) {
                                    i.api( s, true, costTime, t, "" );
                                } else {
                                    var json = utils.parseJson( xhr.responseText ) || null,
                                        u = utils.xcall(conf.parseResponse, [
                                            json, s
                                        ], { }),
                                        result = !( "success" in u ) || u.success;
                                    t = u.code || t,
                                    i.api( s, result, costTime, t, u.msg )
                                }
                            } else 
                                i.api( s, false, e, xhr.status || "FAILED", xhr.statusText )
                        }
                    })
                    return xhr
                }
                window[xhr].toString = function ( ) {
                    return xhr + "() { [native code] }"
                }
            })(window[xhr])
        }
    }
    function initFetch( ) {
        "function" == typeof window[fetch] && ( function ( e ) {
            window[_fetch] = e,
            window[fetch] = function ( t ) {
                var a = 1 === arguments.length ? [arguments[0]] : Array.apply( null, arguments ),
                    s = o;
                if ( !s || !s.api ) 
                    return e.apply( n, a );
                var u = Date.now( ),
                    c = s._conf,
                    l = ( t && "string" != typeof t ? t.url : t ) || "",
                    f = l;
                return l = l.replace( /\?.*$/, "" ),
                l = utils.fbr( l, c.ignoreApiPath ),
                e.apply( n, a ).then( function ( e ) {
                    if ( !s || !s.api ) 
                        return e;
                    var t = e.clone( ),
                        n = Date.now( ) - u;
                    return t.ok ? t.text( ).then( function ( e ) {
                        var o = utils.J( e ) || null,
                            i = utils.xcall(c.parseResponse, [
                                o, f
                            ], { });
                        i.code = i.code || t.status || 200,
                        i.success = !( "success" in i ) || i.success,
                        s.api( l, i.success, n, i.code, i.msg )
                    }) : s.api( l, !1, n, t.status || 404, t.statusText ),
                    e
                })[i[0]]( function ( e ) {
                    if ( !s || !s.api ) 
                        throw e;
                    var t = Date.now( ) - u;
                    throw s.api( l, !1, t, e.name || "Error", e.message ),
                    e
                })
            },
            window[fetch].toString = function ( ) {
                return a + "() { [native code] }"
            }
        })(window[fetch])
    }

    utils.ext(cpt.prototype, {
        removeHook: function ( e ) {
            if (_hook && ( e || this === _hook )) {
                removeXhr( )
                // removeFetch( )
                _hook = null
            }
            return this
        },
        addHook: function ( e ) {
            if ( e || !_hook ) {
                if ( !_hook ) {
                    initXHR( )
                    // initFetch( )
                }
                _hook = this
            }
            return this
        },
        _initHook: function ( ) {
            if ( !this._hasInitHook ) {
                this.getConfig( "disableHook" ) || this.addHook( )
                this._hasInitHook = true
            }
            return this
        }
    })
    return cpt
}
