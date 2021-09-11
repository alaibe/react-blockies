'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// NOTE --  Majority of this code is referenced from: https://github.com/alexvandesande/blockies
//          Mostly to ensure congruence to Ethereum Mist's Identicons

// The random number is a js implementation of the Xorshift PRNG
function seedrand(seed) {
  var randseed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values

  for (var i = 0; i < randseed.length; i++) {
    randseed[i] = 0;
  }
  for (var _i = 0; _i < seed.length; _i++) {
    randseed[_i % 4] = (randseed[_i % 4] << 5) - randseed[_i % 4] + seed.charCodeAt(_i);
  }

  // based on Java's String.hashCode(), expanded to 4 32bit values
  return function random() {
    var t = randseed[0] ^ randseed[0] << 11;

    randseed[0] = randseed[1];
    randseed[1] = randseed[2];
    randseed[2] = randseed[3];
    randseed[3] = randseed[3] ^ randseed[3] >> 19 ^ t ^ t >> 8;

    return (randseed[3] >>> 0) / (1 << 31 >>> 0);
  };
}

function createColor(random) {
  // saturation is the whole color spectrum
  var h = Math.floor(random() * 360);
  // saturation goes from 40 to 100, it avoids greyish colors
  var s = random() * 60 + 40 + '%';
  // lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
  var l = (random() + random() + random() + random()) * 25 + '%';

  var color = 'hsl(' + h + ',' + s + ',' + l + ')';
  return color;
}

function createImageData(size, random) {
  var width = size; // Only support square icons for now
  var height = size;

  var dataWidth = Math.ceil(width / 2);
  var mirrorWidth = width - dataWidth;

  var data = [];
  for (var y = 0; y < height; y++) {
    var row = [];
    for (var x = 0; x < dataWidth; x++) {
      // this makes foreground and background color to have a 43% (1/2.3) probability
      // spot color has 13% chance
      row[x] = Math.floor(random() * 2.3);
    }
    var r = row.slice(0, mirrorWidth);
    r.reverse();
    row = row.concat(r);

    for (var i = 0; i < row.length; i++) {
      data.push(row[i]);
    }
  }

  return data;
}

function drawCanvas(canvas, scale, _ref) {
  var imageData = _ref.imageData,
      color = _ref.color,
      bgColor = _ref.bgColor,
      spotColor = _ref.spotColor;

  var width = Math.sqrt(imageData.length);
  var size = width * scale;

  canvas.width = size;
  canvas.style.width = size + 'px';

  canvas.height = size;
  canvas.style.height = size + 'px';

  var cc = canvas.getContext('2d');
  cc.fillStyle = bgColor;
  cc.fillRect(0, 0, canvas.width, canvas.height);
  cc.fillStyle = color;

  for (var i = 0; i < imageData.length; i++) {
    // if data is 2, choose spot color, if 1 choose foreground
    cc.fillStyle = imageData[i] === 1 ? color : spotColor;

    // if data is 0, leave the background
    if (imageData[i]) {
      var row = Math.floor(i / width);
      var col = i % width;

      cc.fillRect(col * scale, row * scale, scale, scale);
    }
  }
}

function generateIdenticon(_ref2) {
  var bgColor = _ref2.bgColor,
      color = _ref2.color,
      seed = _ref2.seed,
      size = _ref2.size,
      spotColor = _ref2.spotColor;

  var random = seedrand(seed);

  // order matters since we are using random()
  if (!color) color = createColor(random);
  if (!bgColor) bgColor = createColor(random);
  if (!spotColor) spotColor = createColor(random);

  return {
    bgColor: bgColor,
    color: color,
    imageData: createImageData(size, random),
    spotColor: spotColor
  };
}

var Identicon = _react2.default.memo(function Identicon(_ref3) {
  var bgColor = _ref3.bgColor,
      className = _ref3.className,
      color = _ref3.color,
      scale = _ref3.scale,
      seed = _ref3.seed,
      size = _ref3.size,
      spotColor = _ref3.spotColor,
      props = _objectWithoutProperties(_ref3, ['bgColor', 'className', 'color', 'scale', 'seed', 'size', 'spotColor']);

  var canvasRef = (0, _react.useRef)();

  // Cache identiconData so we can use it to trigger a redraw.
  var identiconData = (0, _react.useMemo)(function () {
    return generateIdenticon({
      bgColor: bgColor,
      color: color,
      seed: seed,
      size: size,
      spotColor: spotColor
    });
  }, [bgColor, color, seed, size, spotColor]);

  // Redraw when scale or identiconData updates.
  (0, _react.useEffect)(function () {
    if (canvasRef.current) {
      drawCanvas(canvasRef.current, scale, identiconData);
    }
  }, [identiconData, scale]);

  return _react2.default.createElement('canvas', _extends({
    ref: function ref(canvas) {
      canvasRef.current = canvas;

      // Redraw when the ref updates.
      if (canvas) {
        drawCanvas(canvas, scale, identiconData);
      }
    },
    className: className
  }, props));
});

Identicon.defaultProps = {
  className: 'identicon',
  scale: 4,
  seed: Math.floor(Math.random() * Math.pow(10, 16)).toString(16),
  size: 8
};

Identicon.propTypes = {
  bgColor: _propTypes2.default.string,
  className: _propTypes2.default.string,
  color: _propTypes2.default.string,
  scale: _propTypes2.default.number,
  seed: _propTypes2.default.string,
  size: _propTypes2.default.number,
  spotColor: _propTypes2.default.string
};

exports.default = Identicon;

