import core from './core'
Date.now = Date.now || function ( ) {
    return ( new Date ).getTime( )
};
export default( function ( win ) {
    let watcher = win.QcWatcher = core,
        key = "__qw";
    if ( win.__hasInitQc ) {
        return watcher;
    }
    let cfg = {},
        pipe = [ ];
    if ( key in win ) {
        cfg = win[key].config || {}
        pipe = win[key].pipe || [ ]
    }
    let app = win[key] = new watcher( cfg );
    app._sendPipe( pipe )
    if ( app._conf.autoSendPv !== false ) {
        setTimeout( function ( ) {
            app._sendPv( )
        }, 1500)
    }
    app._sendPerf( )
    win.__hasInitQc = true
    win.w = app
    return watcher;
})( window )
