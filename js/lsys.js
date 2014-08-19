var clone, cloneFromPool, flatten, foundIn, getKeys, objectDiff, unique,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

flatten = function(array) {
  " return array of all values in array (without any subarrays) ";
  var e, out, _i, _len;
  out = [];
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    e = array[_i];
    if (e instanceof Array || e instanceof Object) {
      out = out.concat(flatten(e));
    } else {
      out.push(e);
    }
  }
  return out;
};

unique = function(array) {
  " Return array without duplicate elements ";
  var key, output, value, _i, _ref, _results;
  output = {};
  for (key = _i = 0, _ref = array.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
    output[array[key]] = array[key];
  }
  _results = [];
  for (key in output) {
    value = output[key];
    _results.push(value);
  }
  return _results;
};

getKeys = function(objects) {
  " Get all keys found in provided array of objects ";
  var key, keys, object, _i, _len;
  keys = [];
  for (_i = 0, _len = objects.length; _i < _len; _i++) {
    object = objects[_i];
    for (key in object) {
      keys.push(key);
    }
  }
  return unique(keys);
};

objectDiff = function(a, b) {
  " Return array of top-level properties which differ between objects a and b ";
  var diff, k, keys, _i, _len;
  diff = [];
  keys = getKeys([a, b]);
  for (_i = 0, _len = keys.length; _i < _len; _i++) {
    k = keys[_i];
    if (a[k] instanceof Object && b[k] instanceof Object) {
      if (objectDiff(a[k], b[k]).length > 0) {
        diff.push(k);
      }
    } else {
      if (a[k] !== b[k]) {
        diff.push(k);
      }
    }
  }
  return flatten(diff);
};

foundIn = function(matches, array) {
  " return true if any matches are found in array ";
  var match, _i, _len;
  for (_i = 0, _len = matches.length; _i < _len; _i++) {
    match = matches[_i];
    if (__indexOf.call(array, match) >= 0) {
      return true;
    }
  }
  return false;
};

clone = function(obj) {
  " Clone (deep copy) an object ";
  " http://coffeescriptcookbook.com/chapters/classes_and_objects/cloning ";
  var flags, key, newInstance;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    flags = '';
    if (obj.global != null) {
      flags += 'g';
    }
    if (obj.ignoreCase != null) {
      flags += 'i';
    }
    if (obj.multiline != null) {
      flags += 'm';
    }
    if (obj.sticky != null) {
      flags += 'y';
    }
    return new RegExp(obj.source, flags);
  }
  newInstance = new obj.constructor();
  for (key in obj) {
    newInstance[key] = clone(obj[key]);
  }
  return newInstance;
};

cloneFromPool = function(obj, pool) {
  var key, poolObj;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  poolObj = pool.pop();
  for (key in obj) {
    poolObj[key] = cloneFromPool(obj[key]);
  }
  return poolObj;
};

var Lsys;

Lsys = (function() {
  function Lsys(params) {
    var i, poolSize;
    if (params == null) {
      params = {};
    }
    this.initTurtleCommands();
    this.params = params;
    this.path = {
      x: [],
      y: []
    };
    this.config = {
      timeout: 5
    };
    this.errors = {
      compilation: false,
      pathCreation: false
    };
    this.compileRules(params);
    this.state = clone(this.params.pose);
    this.state.stepSize = this.params.size.value;
    this.state.stepAngle = this.params.angle.value;
    this.stack = [];
    poolSize = 10000;
    this.pool = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= poolSize ? _i <= poolSize : _i >= poolSize; i = 0 <= poolSize ? ++_i : --_i) {
        _results.push({});
      }
      return _results;
    })();
    this.calcPath();
    return this;
  }

  Lsys.prototype.isomorphic = function(a, b) {
    " return true if n, rules, or seed properties differ between objects a and b ";
    return foundIn(['n', 'rules', 'seed'], objectDiff(a, b));
  };

  Lsys.prototype.setParams = function(params) {
    if (params == null) {
      params = this.params;
    }
    " Update parameters (and recompile rules if needed) ";
    this.params = params;
    this.calcPath();
    return this;
  };

  Lsys.prototype.compileRules = function(params) {
    " Execute text-replacement on seed according to rules (repeated n times) ";
    var currentTime, e, i, startTime, string, _i, _ref;
    string = params.seed;
    startTime = new Date().getTime();
    for (i = _i = 1, _ref = params.n; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
      currentTime = new Date().getTime();
      if ((currentTime - startTime) / 1000 > this.config.timeout) {
        this.compiledString = string;
        this.errors.compilation = "timeout";
        return;
      }
      string = ((function() {
        var _j, _len, _results;
        _results = [];
        for (_j = 0, _len = string.length; _j < _len; _j++) {
          e = string[_j];
          _results.push(params.rules[e] || e);
        }
        return _results;
      })()).join("");
    }
    this.compiledString = string;
    return this.errors.compilation = false;
  };

  Lsys.prototype.getPath = function() {
    return this.path;
  };

  Lsys.prototype.calcPath = function() {
    " Generate path from compiled string and param values ";
    var e, _i, _len, _ref, _results;
    this.stack.length = 0;
    _ref = this.compiledString;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      e = _ref[_i];
      _results.push(this.turtle(e, [this.state, this.params, this.stack, this.pool]));
    }
    return _results;
  };

  Lsys.prototype.turtle = function(command, args) {
    var _ref;
    if (this.turtleCommands[command]) {
      return (_ref = this.turtleCommands)[command].apply(_ref, args);
    } else {
      return null;
    }
  };

  Lsys.prototype.initTurtleCommands = function() {
    " initialize object with functions to execute turtle graphics drawing commands";
    return this.turtleCommands = {
      "F": function(state, params) {
        " Move forward (in whatever direction you're facing) ";
        state.x += Math.cos((state.orientation % 360) * (Math.PI / 180)) * state.stepSize;
        return state.y += Math.sin((state.orientation % 360) * (Math.PI / 180)) * state.stepSize;
      },
      "+": function(state) {
        return state.orientation += state.stepAngle;
      },
      "-": function(state) {
        return state.orientation -= state.stepAngle;
      },
      "|": function(state) {
        return state.orientation += 180;
      },
      "[": function(state, params, stack, pool) {
        " Save current state for a later return ";
        return stack.push(cloneFromPool(state, pool));
      },
      "]": function(state, params, stack, pool) {
        " Return to last saved state ";
        var key, pop, _results;
        pop = stack.pop();
        pool.push(pop);
        _results = [];
        for (key in pop) {
          _results.push(state[key] = pop[key]);
        }
        return _results;
      },
      "!": function(state) {
        return state.stepAngle *= -1;
      },
      "(": function(state, params) {
        return state.stepAngle *= 1 - params.angle.change;
      },
      ")": function(state, params) {
        return state.stepAngle *= 1 + params.angle.change;
      },
      "<": function(state, params) {
        return state.stepSize *= 1 + params.size.change;
      },
      ">": function(state, params) {
        return state.stepSize *= 1 - params.size.change;
      }
    };
  };

  return Lsys;

})();

var data, e, params, path, sys, x, y, _i, _j, _len, _len1;

console.log("-----------------\n Running test \n-----------------");

params = {
  seed: "A",
  rules: {
    "A": "F[+F]F",
    "B": "ABF-F",
    "C": "CABF[+F>+F]F"
  },
  n: 1,
  pose: {
    x: 0,
    y: 0,
    orientation: 0
  },
  size: {
    value: 10,
    change: 1.0
  },
  angle: {
    value: 10,
    change: 1
  }
};

sys = new Lsys(params);

path = sys.getPath();

console.log(["heres a path", path]);

x = (function() {
  var _i, _len, _results;
  _results = [];
  for (_i = 0, _len = path.length; _i < _len; _i++) {
    e = path[_i];
    _results.push(e.x);
  }
  return _results;
})();

y = (function() {
  var _i, _len, _results;
  _results = [];
  for (_i = 0, _len = path.length; _i < _len; _i++) {
    e = path[_i];
    _results.push(e.y);
  }
  return _results;
})();

for (_i = 0, _len = path.length; _i < _len; _i++) {
  data = path[_i];
  console.log(data.x);
}

console.log("");

for (_j = 0, _len1 = path.length; _j < _len1; _j++) {
  data = path[_j];
  console.log(data.y);
}

console.log("");

console.log(sys.compiledString);
