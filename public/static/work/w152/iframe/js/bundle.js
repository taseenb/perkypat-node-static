(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

"use strict";

function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice(0);
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( var i=0; i < listeners.length; i++ ) {
    var listener = listeners[i]
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
};

return EvEmitter;

}));

},{}],2:[function(require,module,exports){
/*!
 * imagesLoaded v4.1.3
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

( function( window, factory ) { 'use strict';
  // universal module definition

  /*global define: false, module: false, require: false */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
      'ev-emitter/ev-emitter'
    ], function( EvEmitter ) {
      return factory( window, EvEmitter );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('ev-emitter')
    );
  } else {
    // browser global
    window.imagesLoaded = factory(
      window,
      window.EvEmitter
    );
  }

})( typeof window !== 'undefined' ? window : this,

// --------------------------  factory -------------------------- //

function factory( window, EvEmitter ) {

'use strict';

var $ = window.jQuery;
var console = window.console;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

// turn element or nodeList into an array
function makeArray( obj ) {
  var ary = [];
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0; i < obj.length; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
}

// -------------------------- imagesLoaded -------------------------- //

/**
 * @param {Array, Element, NodeList, String} elem
 * @param {Object or Function} options - if function, use as callback
 * @param {Function} onAlways - callback function
 */
function ImagesLoaded( elem, options, onAlways ) {
  // coerce ImagesLoaded() without new, to be new ImagesLoaded()
  if ( !( this instanceof ImagesLoaded ) ) {
    return new ImagesLoaded( elem, options, onAlways );
  }
  // use elem as selector string
  if ( typeof elem == 'string' ) {
    elem = document.querySelectorAll( elem );
  }

  this.elements = makeArray( elem );
  this.options = extend( {}, this.options );

  if ( typeof options == 'function' ) {
    onAlways = options;
  } else {
    extend( this.options, options );
  }

  if ( onAlways ) {
    this.on( 'always', onAlways );
  }

  this.getImages();

  if ( $ ) {
    // add jQuery Deferred object
    this.jqDeferred = new $.Deferred();
  }

  // HACK check async to allow time to bind listeners
  setTimeout( function() {
    this.check();
  }.bind( this ));
}

ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

ImagesLoaded.prototype.options = {};

ImagesLoaded.prototype.getImages = function() {
  this.images = [];

  // filter & find items if we have an item selector
  this.elements.forEach( this.addElementImages, this );
};

/**
 * @param {Node} element
 */
ImagesLoaded.prototype.addElementImages = function( elem ) {
  // filter siblings
  if ( elem.nodeName == 'IMG' ) {
    this.addImage( elem );
  }
  // get background image on element
  if ( this.options.background === true ) {
    this.addElementBackgroundImages( elem );
  }

  // find children
  // no non-element nodes, #143
  var nodeType = elem.nodeType;
  if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
    return;
  }
  var childImgs = elem.querySelectorAll('img');
  // concat childElems to filterFound array
  for ( var i=0; i < childImgs.length; i++ ) {
    var img = childImgs[i];
    this.addImage( img );
  }

  // get child background images
  if ( typeof this.options.background == 'string' ) {
    var children = elem.querySelectorAll( this.options.background );
    for ( i=0; i < children.length; i++ ) {
      var child = children[i];
      this.addElementBackgroundImages( child );
    }
  }
};

var elementNodeTypes = {
  1: true,
  9: true,
  11: true
};

ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
    return;
  }
  // get url inside url("...")
  var reURL = /url\((['"])?(.*?)\1\)/gi;
  var matches = reURL.exec( style.backgroundImage );
  while ( matches !== null ) {
    var url = matches && matches[2];
    if ( url ) {
      this.addBackground( url, elem );
    }
    matches = reURL.exec( style.backgroundImage );
  }
};

/**
 * @param {Image} img
 */
ImagesLoaded.prototype.addImage = function( img ) {
  var loadingImage = new LoadingImage( img );
  this.images.push( loadingImage );
};

ImagesLoaded.prototype.addBackground = function( url, elem ) {
  var background = new Background( url, elem );
  this.images.push( background );
};

ImagesLoaded.prototype.check = function() {
  var _this = this;
  this.progressedCount = 0;
  this.hasAnyBroken = false;
  // complete if no images
  if ( !this.images.length ) {
    this.complete();
    return;
  }

  function onProgress( image, elem, message ) {
    // HACK - Chrome triggers event before object properties have changed. #83
    setTimeout( function() {
      _this.progress( image, elem, message );
    });
  }

  this.images.forEach( function( loadingImage ) {
    loadingImage.once( 'progress', onProgress );
    loadingImage.check();
  });
};

ImagesLoaded.prototype.progress = function( image, elem, message ) {
  this.progressedCount++;
  this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
  // progress event
  this.emitEvent( 'progress', [ this, image, elem ] );
  if ( this.jqDeferred && this.jqDeferred.notify ) {
    this.jqDeferred.notify( this, image );
  }
  // check if completed
  if ( this.progressedCount == this.images.length ) {
    this.complete();
  }

  if ( this.options.debug && console ) {
    console.log( 'progress: ' + message, image, elem );
  }
};

ImagesLoaded.prototype.complete = function() {
  var eventName = this.hasAnyBroken ? 'fail' : 'done';
  this.isComplete = true;
  this.emitEvent( eventName, [ this ] );
  this.emitEvent( 'always', [ this ] );
  if ( this.jqDeferred ) {
    var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
    this.jqDeferred[ jqMethod ]( this );
  }
};

// --------------------------  -------------------------- //

function LoadingImage( img ) {
  this.img = img;
}

LoadingImage.prototype = Object.create( EvEmitter.prototype );

LoadingImage.prototype.check = function() {
  // If complete is true and browser supports natural sizes,
  // try to check for image status manually.
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    // report based on naturalWidth
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    return;
  }

  // If none of the checks above matched, simulate loading on detached element.
  this.proxyImage = new Image();
  this.proxyImage.addEventListener( 'load', this );
  this.proxyImage.addEventListener( 'error', this );
  // bind to image as well for Firefox. #191
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.proxyImage.src = this.img.src;
};

LoadingImage.prototype.getIsImageComplete = function() {
  return this.img.complete && this.img.naturalWidth !== undefined;
};

LoadingImage.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.img, message ] );
};

// ----- events ----- //

// trigger specified handler for event type
LoadingImage.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

LoadingImage.prototype.onload = function() {
  this.confirm( true, 'onload' );
  this.unbindEvents();
};

LoadingImage.prototype.onerror = function() {
  this.confirm( false, 'onerror' );
  this.unbindEvents();
};

LoadingImage.prototype.unbindEvents = function() {
  this.proxyImage.removeEventListener( 'load', this );
  this.proxyImage.removeEventListener( 'error', this );
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

// -------------------------- Background -------------------------- //

function Background( url, element ) {
  this.url = url;
  this.element = element;
  this.img = new Image();
}

// inherit LoadingImage prototype
Background.prototype = Object.create( LoadingImage.prototype );

Background.prototype.check = function() {
  this.img.addEventListener( 'load', this );
  this.img.addEventListener( 'error', this );
  this.img.src = this.url;
  // check if image is already complete
  var isComplete = this.getIsImageComplete();
  if ( isComplete ) {
    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
    this.unbindEvents();
  }
};

Background.prototype.unbindEvents = function() {
  this.img.removeEventListener( 'load', this );
  this.img.removeEventListener( 'error', this );
};

Background.prototype.confirm = function( isLoaded, message ) {
  this.isLoaded = isLoaded;
  this.emitEvent( 'progress', [ this, this.element, message ] );
};

// -------------------------- jQuery -------------------------- //

ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
  jQuery = jQuery || window.jQuery;
  if ( !jQuery ) {
    return;
  }
  // set local variable
  $ = jQuery;
  // $().imagesLoaded()
  $.fn.imagesLoaded = function( options, callback ) {
    var instance = new ImagesLoaded( this, options, callback );
    return instance.jqDeferred.promise( $(this) );
  };
};
// try making plugin
ImagesLoaded.makeJQueryPlugin();

// --------------------------  -------------------------- //

return ImagesLoaded;

});

},{"ev-emitter":1}],3:[function(require,module,exports){
/**
 * Return position and size of element to cover the entire space of the parent.
 * Emulates css background-size: cover (but works with images, video or any dom element)
 */
var createCover = function (parentW, parentH, w, h) {
  var parentRatio = parentW / parentH
  var ratio = w / h
  var zoomRatio
  var top, left, width, height

  if (parentRatio > ratio) {
    // fill width
    zoomRatio = parentW / w
    height = ~~(h * zoomRatio)
    top = ~~((parentH - height) / 2)
    left = 0
    width = parentW
  } else {
    // fill height
    zoomRatio = parentH / h
    width = ~~(w * zoomRatio)
    left = ~~((parentW - width) / 2)
    top = 0
    height = parentH
  }

  return {
    top: top,
    left: left,
    width: width,
    height: height
  }
}

module.exports = createCover

},{}],4:[function(require,module,exports){
var imagesLoaded = require('imagesloaded')
var createCover = require('./create-cover')
var PointerEvents = require('./pointer-events')

var w, h // window size
var images = []
var imagesWidth, imagesHeight
var ctx
var canvas
var totalImages = 130
var oneEvery = 2
var imagesAvailable
var imageX, imageY, fillX, fillY
var tween
var cursor
var slider
var cursorWidth = 60
var lastFrame

function updateCanvas (frame) {
  requestAnimationFrame(function () {
    if (frame === lastFrame) return
    lastFrame = frame
    // ctx.clearRect(0, 0, w, h)
    ctx.drawImage(images[frame].img, 0, 0, imagesWidth, imagesHeight, imageX, imageY, fillX, fillY)
  })
}

function preloadImages () {
  var hiddenEl = document.getElementById('hidden-images-preload')
  var imagesHtml = ''
  for (var i = 1; i < totalImages; i += oneEvery) {
    imagesHtml += '<img id="img_' + i + '" src="img/anim/frame_' + i + '.jpg">\n'
  }
  hiddenEl.innerHTML = imagesHtml

  // Load
  imagesLoaded(hiddenEl, onImagesLoaded)
}

function onImagesLoaded (e) {
  images = e.images
  imagesAvailable = images.length - 1
  imagesWidth = images[0].img.width
  imagesHeight = images[0].img.height

  // Set canvas bg with first frame
  var url = images[0].img.src
  canvas.style.backgroundImage = 'url(' + url + ')'

  // Update sizes
  onResize()

  // Init pointer events
  var pointer = new PointerEvents(slider, {
    onStart: onPointerMove,
    onMove: onPointerMove
  })

  // Resize event
  window.addEventListener('resize', onResize, false)

  // Tween
  tween = window.TweenMax.to({ value: 0 }, 4, {
    value: 1,
    ease: Linear.easeNone,
    onUpdate: function () {
      updateCanvas(Math.floor(imagesAvailable * this.target.value))
      updateCursor(this.target.value)
    }
  })
}

function onPointerMove (x, y) {
  if (tween) stopTween()
  var value = x / w
  var frame = Math.floor(imagesAvailable * value)
  updateCursorByX(x)
  updateCanvas(frame)
}

function updateCursor (value) {
  var dist = w - cursorWidth
  window.TweenMax.set(cursor, { x: dist * value })
}

function updateCursorByX (_x) {
  var maxW = w - cursorWidth
  var x = _x - cursorWidth / 2
  x = Math.min(Math.max(x, 0), maxW)
  window.TweenMax.set(cursor, { x: x })
}

function stopTween () {
  tween.pause().kill()
  tween = null

  // slider.removeEventListener('mousedown', stopTween)
}

function onResize () {
  w = window.innerWidth
  h = window.innerHeight
  canvas.width = w
  canvas.height = h
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'

  var cover = createCover(w, h, imagesWidth, imagesHeight)

  imageX = cover.left
  imageY = cover.top
  fillX = cover.width
  fillY = cover.height

  
}

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  slider = document.getElementById('slider')
  cursor = document.getElementById('cursor')

  preloadImages()
}

init()

},{"./create-cover":3,"./pointer-events":5,"imagesloaded":2}],5:[function(require,module,exports){
var PointerEvents = function (el, options) {
  // console.log( el );

  this.options = {
    onStart: options.onStart || function () {},
    onMove: options.onMove || function () {}
  }

  this.el = el || document
  this.pointerX = 0
  this.pointerY = 0

  this.initialize()
}

PointerEvents.prototype = {
  initialize: function () {
    // Touch
    this.el.addEventListener('touchstart', this.onDocumentTouchStart.bind(this), false)
    this.el.addEventListener('touchmove', this.onDocumentTouchMove.bind(this), false)

    // Mouse
    this.mouseMoveCallback = this.onDocumentMouseMove.bind(this)
    this.el.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    this.el.addEventListener('mouseup', this.onMouseUp.bind(this), false)
  },

  onMouseDown: function (e) {
    this.mouseMoveCallback(e)
    this.el.addEventListener('mousemove', this.mouseMoveCallback, false)
  },

  onMouseUp: function (e) {
    this.el.removeEventListener('mousemove', this.mouseMoveCallback, false)
  },

  onDocumentTouchStart: function (event) {
    if (event.touches.length === 1) {
      event.preventDefault()
      this.pointerX = event.touches[0].pageX
      this.pointerY = event.touches[0].pageY

      this.options.onStart(this.pointerX, this.pointerY)
    }
  },

  onDocumentTouchMove: function (event) {
    if (event.touches.length === 1) {
      event.preventDefault()
      this.pointerX = event.touches[0].pageX
      this.pointerY = event.touches[0].pageY
    }

    this.onPointerMove()
  },

  onDocumentMouseMove: function () {
    this.pointerX = event.clientX
    this.pointerY = event.clientY

    this.onPointerMove()
  },

  onPointerMove: function () {
    this.options.onMove(this.pointerX, this.pointerY)
  }
}

module.exports = PointerEvents

},{}]},{},[4]);
