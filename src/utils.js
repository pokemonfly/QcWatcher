var cookieObj = {}
const utils = {
    noop: function ( ) {},
    uu: function ( ) {
        for ( var e, t, n = 20, r = new Array( n ), o = Date.now( ).toString( 36 ).split( "" ); n-- > 0; )
            t = ( e = 36 * Math.random( ) | 0 ).toString( 36 ),
            r[n] = e % 3 ? t : t.toUpperCase( );
        for ( var i = 0; i < 8; i++ )
            r.splice(3 * i + 2, 0, o[i]);
        return r.join( "" )
    },
    checkType: function ( e, t ) {
        var n = Object.prototype.toString.call( e ).substring( 8 ).replace( "]", "" );
        return t ? n === t : n
    },
    each: function ( e, t ) {
        var n = 0,
            r = e.length;
        if (this.checkType( e, "Array" )) {
            for ( ; n < r && !1 !== t.call( e[n], e[n], n ); n++ ) {}
        } else {
            for ( n in e ) {
                if (!1 === t.call( e[n], e[n], n ))
                    break;
                }
            }
        return e
    },
    pick: function ( e ) {
        return 1 === e || 1 === Math.ceil( Math.random( ) / e )
    },
    parseJson: function ( e ) {
        if ( !e || "string" != typeof e )
            return e;
        var t = null;
        try {
            t = JSON.parse( e )
        } catch ( n ) {}
        return t
    },
    on: function ( target, event, callback, once ) {
        if ( target.addEventListener ) {
            target.addEventListener( event, function handler( e ) {
                once && target.removeEventListener( event, handler, false )
                callback && callback.call( this, e )
            }, false)
        } else {
            target.attachEvent && target.attachEvent( "on" + event, function handler( e ) {
                once && target.detachEvent( "on" + event, handler )
                callback && callback.call( this, e )
            })
        }
        return this
    },
    off: function ( target, event, handler ) {
        if ( handler ) {
            if ( target.removeEventListener ) {
                return target.removeEventListener( event, handler )
            } else {
                target.detachEvent && target.detachEvent( event, handler );
                return this
            }
        }
        return this
    },
    delay: function ( e, t ) {
        return -1 === t ? ( e( ), null ) : setTimeout( e, t || 0 )
    },
    cookie: function ( key, value, age, domain, path ) {
        if ( value === undefined ) {
            var s;
            cookieObj[key] || (s = new RegExp( key + "=([^;]+)" ).exec( document.cookie )) && (cookieObj[key] = s[1])
            return cookieObj[key]
        }
        var str = key + "=" + value;
        domain && ( str += "; domain=" + domain )
        path && ( str += "; path=" + path )
        age && ( str += "; max-age=" + age )
        document.cookie = str
        return str
    },
    ext: function ( e ) {
        for ( var t = 1, n = arguments.length; t < n; t++ ) {
            var r = arguments[t];
            for ( var o in r ) {
                if (Object.prototype.hasOwnProperty.call( r, o )) {
                    e[o] = r[o]
                }
            }
        }
        return e
    },
    fbr: function ( path, ignore ) {
        if ( !path ) {
            return "";
        }
        if ( !ignore ) {
            return path;
        }
        var _this = this,
            type = _this.checkType( ignore );
        if ( "Function" === type ) {
            return _this.xcall( ignore, [path], path )
        } else if ( "Array" === type ) {
            utils.each( ignore, function ( ignoreItem ) {
                path = _this.fbr( path, ignoreItem )
            })
            return path
        } else if ( "Object" === type ) {
            return path.replace( ignore.rule, ignore.target || "" )
        } else {
            return path.replace( ignore, "" )
        }
    },
    xcall: function ( fn, args, r ) {
        if ( "function" != typeof fn ) {
            return r;
        }
        try {
            return fn.apply( window, args )
        } catch ( e ) {
            return r
        }
    },
    sub: function ( e, t ) {
        var n = {};
        this.each( e, function ( e, r ) {
            -1 !== t.indexOf( r ) && ( n[r] = e )
        })
        return n
    },
    encode: function ( str ) {
        try {
            str = encodeURIComponent( str )
        } catch ( t ) {}
        return str
    },
    serialize: function ( e ) {
        e = e || {};
        var t = [ ];
        for ( var n in e ) {
            if ( Object.prototype.hasOwnProperty.call( e, n ) && e[n] !== undefined ) {
                t.push(n + "=" + this.encode(e[n]));
            }
        }
        return t.join( "&" )
    }
};

export default utils;
