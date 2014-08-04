(function() {
  var CompiledSystem, DefaultSystem, NullSystem, SystemCompiler, SystemManager;

  NullSystem = new LSystem({}, {}, {}, "", 1, "no system");

  DefaultSystem = new LSystem({
    size: {
      value: 12.27
    },
    angle: {
      value: 4187.5
    }
  }, {}, {
    size: {
      value: 9
    }
  }, "L : SS\nS : F->[F-Y[S(L]]\nY : [-|F-F+)Y]\n", 12, "click-and-drag-me!");

  CompiledSystem = (function() {
    function CompiledSystem(system, elements) {
      this.system = system;
      this.elements = elements;
    }

    return CompiledSystem;

  })();

  SystemCompiler = (function() {
    function SystemCompiler() {}

    SystemCompiler.prototype._halt = false;

    SystemCompiler.prototype.halt = function() {
      return this._halt = true;
    };

    SystemCompiler.prototype.compile = function(system) {
      var CHUNK_SIZE, def, expandChunk, removeNonInstructions, ruleMap, seed, textRules;
      this._halt = false;
      CHUNK_SIZE = 400000;
      def = $.Deferred();
      def.notify(0);
      textRules = system.rules.split("\n").map(function(r) {
        return (r.replace(/\ /g, '')).split(':');
      });
      ruleMap = Util.toObj(textRules);
      seed = textRules[0][0];
      removeNonInstructions = function(expr) {
        return expr.split('').filter(function(e) {
          if (Renderer.prototype.definitions[e]) {
            return true;
          }
        });
      };
      expandChunk = (function(_this) {
        return function(levelNum, levelExpr, acc, start, processed, count) {
          var end, i, reachesEndOfLevel, remaining, symbol;
          while (processed < count) {
            if (_this._halt) {
              def.reject();
              return;
            } else if (levelNum === 0) {
              def.resolve(removeNonInstructions(levelExpr));
              return;
            }
            remaining = count - processed;
            reachesEndOfLevel = remaining >= (levelExpr.length - start);
            if (reachesEndOfLevel) {
              remaining = levelExpr.length - start;
            }
            i = start;
            end = start + remaining;
            while (i < end) {
              symbol = levelExpr[i];
              acc += ruleMap[symbol] || symbol;
              i++;
            }
            processed += remaining;
            start += remaining;
            if (reachesEndOfLevel) {
              levelNum--;
              levelExpr = acc;
              acc = '';
              start = 0;
            }
          }
          def.notify((system.iterations - levelNum) / system.iterations);
          return setTimeout((function() {
            return expandChunk(levelNum, levelExpr, acc, start, 0, count);
          }), 0);
        };
      })(this);
      expandChunk(system.iterations, seed, '', 0, 0, CHUNK_SIZE);
      return def.promise();
    };

    return SystemCompiler;

  })();

  SystemManager = (function() {
    function SystemManager() {}

    SystemManager.prototype.compiler = new SystemCompiler;

    SystemManager.prototype.stagedSystem = null;

    SystemManager.prototype.activeSystem = NullSystem;

    SystemManager.prototype.compiledElements = null;

    SystemManager.prototype.activate = function(system) {
      var _ref, _ref1;
      if (this.promise && ((_ref = this.stagedSystem) != null ? _ref.isIsomorphicTo(system) : void 0)) {
        this.activeSystem.merge(system);
        return this.promise;
      } else if (((_ref1 = this.promise) != null ? _ref1.state() : void 0) === 'pending') {
        this.compiler.halt();
        return this.promise.fail((function(_this) {
          return function() {
            return _this._recompile(system);
          };
        })(this));
      } else {
        return this._recompile(system);
      }
    };

    SystemManager.prototype._recompile = function(system) {
      this.stagedSystem = system;
      this.promise = this.compiler.compile(system);
      this.promise.fail((function(_this) {
        return function() {
          return _this.stagedSystem = _this.activeSystem;
        };
      })(this));
      return this.promise.pipe((function(_this) {
        return function(elements) {
          _this.activeSystem = system;
          _this.compiledElements = elements;
          return elements;
        };
      })(this));
    };

    SystemManager.prototype.getInstructions = function() {
      return this.compiledElements;
    };

    return SystemManager;

  })();

}).call(this);

(function() {
  var Control, Controls, Joystick, Key, KeyState, OffsetControl, ParamControl, Point, SensitivityControl,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    return Point;

  })();

  Key = (function() {
    function Key() {}

    Key.ctrl = 17;

    Key.meta = 91;

    Key.shift = 16;

    Key.alt = 18;

    Key.space = 32;

    Key.enter = 13;

    return Key;

  })();

  KeyState = (function() {
    KeyState.prototype.keys = {};

    KeyState.prototype.codeToKey = [];

    function KeyState() {
      var key, _fn;
      _fn = (function(_this) {
        return function() {
          _this[key] = false;
          return _this.codeToKey[Key[key]] = key;
        };
      })(this);
      for (key in Key) {
        _fn();
      }
      this.createBindings();
    }

    KeyState.prototype.createBindings = function() {
      var setDown;
      setDown = (function(_this) {
        return function(val) {
          return function(ev) {
            var keyname;
            keyname = _this.codeToKey[ev.keyCode];
            if (keyname) {
              return _this[keyname] = val;
            }
          };
        };
      })(this);
      document.addEventListener("keydown", setDown(true));
      document.addEventListener("keyup", setDown(false));
      return document.addEventListener("mousedown", (function(_this) {
        return function(evt) {
          var key, _results;
          _results = [];
          for (key in Key) {
            _results.push((function() {
              var pressed;
              pressed = evt[key + "Key"];
              if (pressed != null) {
                return _this[key] = pressed;
              }
            })());
          }
          return _results;
        };
      })(this));
    };

    return KeyState;

  })();

  Joystick = (function() {
    Joystick.prototype.enabled = true;

    Joystick.prototype.active = false;

    Joystick.prototype.start = new Point(0, 0);

    Joystick.prototype.now = new Point(0, 0);

    function Joystick(canvas) {
      this.canvas = canvas;
      this.g = canvas.getContext('2d');
      this.createBindings();
    }

    Joystick.prototype.enable = function() {
      return this.enabled = true;
    };

    Joystick.prototype.disable = function() {
      return this.enabled = false;
    };

    Joystick.prototype.onActivate = function() {};

    Joystick.prototype.onRelease = function() {};

    Joystick.prototype.dx = function(sensitivity) {
      return (this.now.x - this.start.x) * (sensitivity ? Math.pow(10, sensitivity - 10) : 1);
    };

    Joystick.prototype.dy = function(sensitivity) {
      return (this.now.y - this.start.y) * (sensitivity ? Math.pow(10, sensitivity - 10) : 1);
    };

    Joystick.prototype.clear = function() {};

    Joystick.prototype.draw = function() {};

    Joystick.prototype.center = function() {
      this.start.x = this.now.x;
      return this.start.y = this.now.y;
    };

    Joystick.prototype.createBindings = function() {
      this.canvas.onmousedown = (function(_this) {
        return function(ev) {
          if (ev.button === 0 && _this.enabled) {
            _this.onActivate();
            _this.active = true;
            return _this.start = new Point(ev.pageX, ev.pageY);
          }
        };
      })(this);
      document.onmouseup = (function(_this) {
        return function() {
          var wasActive;
          if (_this.enabled) {
            wasActive = _this.active;
            _this.active = false;
            if (wasActive) {
              return _this.onRelease();
            }
          }
        };
      })(this);
      document.onmousemove = (function(_this) {
        return function(ev) {
          if (_this.enabled) {
            _this.now.x = ev.pageX;
            return _this.now.y = ev.pageY;
          }
        };
      })(this);
      return document.addEventListener("keydown", (function(_this) {
        return function() {
          if (_this.enabled && _this.active) {
            _this.center();
            return _this.onActivate();
          }
        };
      })(this));
    };

    return Joystick;

  })();

  Control = (function() {
    function Control(controlkey) {
      this.controlkey = controlkey;
    }

    Control.prototype.tpl = function() {
      return "you need to override this";
    };

    Control.prototype.create = function(container) {
      this.el = $(this.tpl());
      $(container).append(this.el);
      return this.el;
    };

    Control.prototype.getInput = function(param) {
      return this.el.find("[data-param=" + param + "]");
    };

    Control.prototype.getVal = function(param) {
      return parseFloat(this.getInput(param).val());
    };

    Control.prototype.setVal = function(param, value) {
      var input;
      input = this.getInput(param);
      if (parseFloat(input.val()) !== value && !isNaN(parseFloat(value))) {
        return input.val(value);
      }
    };

    Control.prototype.toJson = function() {
      return this.update({});
    };

    Control.prototype.sync = function(setting) {
      _.chain(setting).omit("name").each((function(_this) {
        return function(v, k) {
          return _this.setVal(k, v);
        };
      })(this));
      return setting;
    };

    Control.prototype.update = function(setting) {
      _.each(this.el.find("[data-param]"), (function(_this) {
        return function(el) {
          var key, val;
          key = $(el).data("param");
          val = _this.getVal(key);
          if (!isNaN(val)) {
            return setting[key] = val;
          }
        };
      })(this));
      return setting;
    };

    return Control;

  })();

  OffsetControl = (function(_super) {
    __extends(OffsetControl, _super);

    function OffsetControl() {
      return OffsetControl.__super__.constructor.apply(this, arguments);
    }

    OffsetControl.prototype.tpl = function() {
      return "<ul class=\"control-row\">\n<li><input required data-param=\"x\" type=\"text\"></li><!--\n--><li><input required data-param=\"y\" type=\"text\"></li><!--\n--><li><input required data-param=\"rot\" type=\"text\"></li>\n</ul>";
    };

    return OffsetControl;

  })(Control);

  ParamControl = (function(_super) {
    __extends(ParamControl, _super);

    function ParamControl() {
      return ParamControl.__super__.constructor.apply(this, arguments);
    }

    ParamControl.prototype.tpl = function() {
      return "<ul class=\"control-row\">\n<li class=\"label\">" + this.controlkey + "</li><!--\n--><li><input required type=\"text\" data-param=\"value\"></li><!--\n--><li><input required type=\"text\" data-param=\"growth\"></li>\n</ul>";
    };

    ParamControl.prototype.toJson = function() {
      var dummy;
      dummy = new Param(this.controlkey, 0, 0);
      return this.update(dummy).toJson();
    };

    return ParamControl;

  })(Control);

  SensitivityControl = (function(_super) {
    __extends(SensitivityControl, _super);

    function SensitivityControl() {
      return SensitivityControl.__super__.constructor.apply(this, arguments);
    }

    SensitivityControl.prototype.toJson = function() {
      var dummy;
      dummy = new Sensitivity(this.controlkey, 0, 0);
      return this.update(dummy).toJson();
    };

    return SensitivityControl;

  })(ParamControl);

  Controls = (function() {
    function Controls(params, ControlType) {
      this.controls = Util.map(params, function(p, k) {
        return new ControlType(k);
      });
    }

    Controls.prototype.create = function(container) {
      return _.each(this.controls, function(c) {
        return c.create(container);
      });
    };

    Controls.prototype.sync = function(params) {
      return Util.map(params, (function(_this) {
        return function(p) {
          return _this.controls[p.name].sync(p);
        };
      })(this));
    };

    Controls.prototype.toJson = function() {
      return Util.map(this.controls, function(c) {
        return c.toJson();
      });
    };

    return Controls;

  })();

}).call(this);

(function() {
  var Defaults, LSystem, Param, Sensitivity,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Param = (function() {
    Param.urlPrefix = "p";

    function Param(name, value, growth) {
      this.name = name;
      this.value = value;
      this.growth = growth;
    }

    Param.prototype.toUrlComponent = function() {
      return "" + this.constructor.urlPrefix + "." + this.name + "=" + this.value + "," + this.growth;
    };

    Param.fromUrlComponent = function(x) {
      var name, parts, vars;
      if ((x || "").indexOf("" + this.urlPrefix + ".") !== 0) {
        return void 0;
      }
      parts = x.split('=');
      name = parts[0].substring(2);
      vars = parts[1].split(',').map(function(v) {
        return parseFloat(v);
      });
      return new this(name, vars[0], vars[1]);
    };

    Param.fromJson = function(json) {
      return new this(json.name, json.value, json.growth);
    };

    Param.prototype.toJson = function() {
      return {
        name: this.name,
        value: this.value,
        growth: this.growth
      };
    };

    Param.prototype.clone = function() {
      return Param.fromJson(this.toJson());
    };

    return Param;

  })();

  Sensitivity = (function(_super) {
    __extends(Sensitivity, _super);

    Sensitivity.urlPrefix = "s";

    function Sensitivity(name, value, growth) {
      this.name = name;
      this.value = value;
      this.growth = growth;
    }

    return Sensitivity;

  })(Param);

  Defaults = (function() {
    function Defaults() {}

    Defaults.offsets = function(input) {
      return Util.merge({
        x: 0,
        y: 0,
        rot: 0
      }, input);
    };

    Defaults.params = function(input) {
      return Util.map(Util.merge(Defaults._params(), input), function(p, k) {
        return _.extend(p, {
          name: k
        });
      });
    };

    Defaults._params = function() {
      return {
        size: {
          value: 1,
          growth: 0.01
        },
        angle: {
          value: 1,
          growth: 0.05
        }
      };
    };

    Defaults.sensitivities = function(input) {
      return Util.map(Util.merge(Util.merge(Util.map(Defaults.params(), this._constrain(0, 10)), Defaults._sensitivites()), input), function(p, k) {
        return _.extend(p, {
          name: k
        });
      });
    };

    Defaults._constrain = function(min, max) {
      return function(val) {
        return Math.max(min, Math.min(max, val));
      };
    };

    Defaults._sensitivites = function() {
      return {
        size: {
          value: 7.7,
          growth: 7.53
        },
        angle: {
          value: 7.6,
          growth: 4
        }
      };
    };

    return Defaults;

  })();

  LSystem = (function() {
    function LSystem(params, offsets, sensitivities, rules, iterations, name) {
      this.rules = rules;
      this.iterations = iterations;
      this.name = name;
      this.params = Util.map(Defaults.params(params), function(c) {
        return Param.fromJson(c);
      });
      this.offsets = Defaults.offsets(offsets);
      this.sensitivities = Util.map(Defaults.sensitivities(sensitivities), function(s) {
        return Sensitivity.fromJson(s);
      });
    }

    LSystem.prototype.clone = function() {
      return LSystem.fromUrl(this.toUrl());
    };

    LSystem.prototype.toUrl = function() {
      var base, mkQueryString, name, offsets, params, sensitivities;
      base = "#?i=" + this.iterations + "&r=" + (encodeURIComponent(this.rules));
      mkQueryString = function(params) {
        return _.reduce(params, (function(acc, v) {
          return "" + acc + "&" + (v.toUrlComponent());
        }), "");
      };
      params = mkQueryString(this.params);
      sensitivities = mkQueryString(this.sensitivities);
      offsets = "&offsets=" + this.offsets.x + "," + this.offsets.y + "," + this.offsets.rot;
      name = "&name=" + (encodeURIComponent(this.name));
      return base + params + sensitivities + offsets + name;
    };

    LSystem.prototype.merge = function(system) {
      if (system) {
        return _.extend(this, system);
      }
    };

    LSystem.fromUrl = function(url) {
      var config, o, offsets, params, sensitivities;
      if (url == null) {
        url = location.hash;
      }
      if (url === "") {
        return null;
      }
      params = {};
      sensitivities = {};
      config = {};
      _.each(url.substring(2).split("&").map(function(x) {
        return x.split("=");
      }), function(_arg) {
        var k, param, sensitivity, v;
        k = _arg[0], v = _arg[1];
        param = Param.fromUrlComponent("" + k + "=" + v);
        sensitivity = Sensitivity.fromUrlComponent("" + k + "=" + v);
        if (param) {
          params[param.name] = param.toJson();
        } else if (sensitivity) {
          sensitivities[sensitivity.name] = sensitivity.toJson();
        } else {
          config[k] = v;
        }
        if (k === 'i') {
          return config[k] = parseInt(v) || 0;
        }
      });
      offsets = void 0;
      if (config.offsets) {
        o = config.offsets.split(',');
        offsets = {
          x: parseFloat(o[0]),
          y: parseFloat(o[1]),
          rot: parseFloat(o[2])
        };
      }
      return new LSystem(params, offsets, sensitivities, decodeURIComponent(config.r), config.i, decodeURIComponent(config.name) || "unnamed");
    };

    LSystem.prototype.isIsomorphicTo = function(system) {
      if (!system) {
        return false;
      } else {
        return this.rules === system.rules && this.iterations === system.iterations;
      }
    };

    return LSystem;

  })();

}).call(this);

(function() {
  var mySys;

  mySys = Lsys();

  console.log(mySys.getPath());

}).call(this);

(function() {
  var AppManager, InputHandler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  InputHandler = (function() {
    InputHandler.prototype.snapshot = null;

    function InputHandler(keystate, joystick) {
      this.keystate = keystate;
      this.joystick = joystick;
      this.update = __bind(this.update, this);
    }

    InputHandler.prototype.update = function(system) {
      if (!this.joystick.active) {
        return;
      }
      if (this.keystate.alt) {
        system.params.size.value = Util.round(this.snapshot.params.size.value + (this.joystick.dy(system.sensitivities.size.value)), 2);
        return system.params.size.growth = Util.round(this.snapshot.params.size.growth + this.joystick.dx(system.sensitivities.size.growth), 6);
      } else if (this.keystate.meta || this.keystate.ctrl) {
        system.offsets.x = this.snapshot.offsets.x + this.joystick.dx();
        return system.offsets.y = this.snapshot.offsets.y + this.joystick.dy();
      } else {
        system.params.angle.value = Util.round(system.params.angle.value + this.joystick.dx(system.sensitivities.angle.value), 4);
        return system.params.angle.growth = Util.round(system.params.angle.growth + this.joystick.dy(system.sensitivities.angle.growth), 9);
      }
    };

    return InputHandler;

  })();

  AppManager = (function() {
    AppManager.prototype.joystick = null;

    AppManager.prototype.keystate = null;

    AppManager.prototype.inputHandler = null;

    AppManager.prototype.renderer = null;

    AppManager.prototype.systemManager = null;

    function AppManager(canvas, controls) {
      this.canvas = canvas;
      this.controls = controls;
      this.draw = __bind(this.draw, this);
      this.run = __bind(this.run, this);
      this.joystick = new Joystick(canvas);
      this.keystate = new KeyState;
      this.inputHandler = new InputHandler(this.keystate, this.joystick);
      this.joystick.onRelease = (function(_this) {
        return function() {
          return _this.syncLocationQuiet();
        };
      })(this);
      this.joystick.onActivate = (function(_this) {
        return function() {
          return _this.inputHandler.snapshot = _this.systemManager.activeSystem.clone();
        };
      })(this);
      this.renderer = new Renderer(canvas);
      this.systemManager = new SystemManager;
      this.initControls();
      this.joystick.disable();
    }

    AppManager.prototype.initControls = function() {
      this.createBindings();
      return this.createControls();
    };

    AppManager.prototype.syncLocation = function() {
      return location.hash = this.systemManager.activeSystem.toUrl();
    };

    AppManager.prototype.syncLocationQuiet = function() {
      location.quietSync = true;
      return this.syncLocation();
    };

    AppManager.prototype.beforeRecalculate = function() {};

    AppManager.prototype.afterRecalculate = function() {};

    AppManager.prototype.onRecalculateFail = function() {};

    AppManager.prototype.onRecalculateProgress = function() {};

    AppManager.prototype.isRecalculating = function() {
      var _ref;
      return !this.recalculationPromise || ((_ref = this.recalculationPromise) != null ? _ref.state() : void 0) === 'pending';
    };

    AppManager.prototype.recalculate = function(system) {
      if (system == null) {
        system = this.lsystemFromControls();
      }
      this.beforeRecalculate();
      this.recalculationPromise = this.systemManager.activate(system).progress(this.onRecalculateProgress);
      this.recalculationPromise.done((function(_this) {
        return function() {
          _this.joystick.enable();
          _this.syncAll();
          _this.draw();
          return _this.afterRecalculate();
        };
      })(this));
      this.recalculationPromise.fail(this.onRecalculateFail);
      return this.recalculationPromise;
    };

    AppManager.prototype.lsystemFromControls = function() {
      return new LSystem(this.paramControls.toJson(), this.offsetControls.toJson(), this.sensitivityControls.toJson(), $(this.controls.rules).val(), parseInt($(this.controls.iterations).val()), $(this.controls.name).val());
    };

    AppManager.prototype.exportToPng = function(system) {
      var b, c, filename, r, x, y, _ref;
      if (system == null) {
        system = this.systemManager.activeSystem;
      }
      _ref = [(Util.canvasWidth(this.canvas) / 2) + system.offsets.x, (Util.canvasHeight(this.canvas) / 2) + system.offsets.y], x = _ref[0], y = _ref[1];
      b = this.renderer.context.bounding;
      c = $('<canvas></canvas>').attr({
        "width": b.width() + 30,
        "height": b.height() + 30
      })[0];
      r = new Renderer(c);
      r.reset = function(system) {
        r.context.reset(system);
        r.context.state.x = x - b.x1 + 15;
        return r.context.state.y = y - b.y1 + 15;
      };
      this.draw(r);
      filename = "lsys_" + system.name.replace(/[\ \/]/g, "_");
      return Util.openDataUrl(c.toDataURL("image/png"), filename);
    };

    AppManager.prototype.start = function() {
      var startingSystem;
      startingSystem = LSystem.fromUrl() || DefaultSystem;
      return this.recalculate(startingSystem).fail((function(_this) {
        return function() {
          return _this.syncAll(startingSystem);
        };
      })(this)).pipe((function(_this) {
        return function() {
          return _this.draw();
        };
      })(this)).always(this.run);
    };

    AppManager.prototype.run = function() {
      setTimeout(this.run, 10);
      this.inputHandler.update(this.systemManager.activeSystem);
      if (this.joystick.active && !this.renderer.isDrawing) {
        this.draw();
        this.joystick.draw();
        return this.syncControls();
      }
    };

    AppManager.prototype.draw = function(renderer) {
      var elems;
      if (renderer == null) {
        renderer = this.renderer;
      }
      elems = this.systemManager.getInstructions();
      if (elems) {
        return renderer.render(elems, this.systemManager.activeSystem);
      }
    };

    AppManager.prototype.createControls = function() {
      this.paramControls = new Controls(Defaults.params(), ParamControl);
      this.offsetControls = new OffsetControl(Defaults.offsets());
      this.sensitivityControls = new Controls(Defaults.sensitivities(), SensitivityControl);
      this.paramControls.create(this.controls.params);
      this.offsetControls.create(this.controls.offsets);
      return this.sensitivityControls.create(this.controls.sensitivities);
    };

    AppManager.prototype.syncAll = function(system) {
      if (system == null) {
        system = this.systemManager.activeSystem;
      }
      $(this.controls.name).val(system.name);
      this.syncControls(system);
      return this.syncRulesAndIterations(system);
    };

    AppManager.prototype.syncRulesAndIterations = function(system) {
      if (system == null) {
        system = this.systemManager.activeSystem;
      }
      $(this.controls.iterations).val(system.iterations);
      return $(this.controls.rules).val(system.rules);
    };

    AppManager.prototype.syncControls = function(system) {
      if (system == null) {
        system = this.systemManager.activeSystem;
      }
      this.paramControls.sync(system.params);
      this.offsetControls.sync(system.offsets);
      return this.sensitivityControls.sync(system.sensitivities);
    };

    AppManager.prototype.createBindings = function() {
      var setClassIf, updateCursorType;
      setClassIf = (function(_this) {
        return function(onOff, className) {
          var method;
          method = onOff ? 'add' : 'remove';
          return $(_this.canvas)["" + method + "Class"](className);
        };
      })(this);
      updateCursorType = (function(_this) {
        return function(ev) {
          setClassIf(ev.ctrlKey || ev.metaKey, "moving");
          return setClassIf(ev.altKey, "resizing");
        };
      })(this);
      document.addEventListener("keydown", (function(_this) {
        return function(ev) {
          updateCursorType(ev);
          if (ev.keyCode === Key.enter && ev.ctrlKey) {
            _this.recalculate();
            _this.syncLocation();
            return false;
          }
          if (ev.keyCode === Key.enter && ev.shiftKey) {
            return _this.exportToPng();
          }
        };
      })(this));
      document.addEventListener("keyup", updateCursorType);
      document.addEventListener("mousedown", updateCursorType);
      return window.onhashchange = (function(_this) {
        return function() {
          var quiet;
          quiet = location.quietSync;
          location.quietSync = false;
          if (location.hash !== "" && !quiet) {
            return _this.recalculate(LSystem.fromUrl());
          }
        };
      })(this);
    };

    return AppManager;

  })();

}).call(this);

(function() {
  var Bounding, Renderer, RenderingContext,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RenderingContext = (function() {
    RenderingContext.prototype.initialised = false;

    RenderingContext.prototype.state = null;

    RenderingContext.prototype.bounding = null;

    RenderingContext.prototype.stack = [];

    function RenderingContext(canvas) {
      this.canvas = canvas;
      this.reset = __bind(this.reset, this);
    }

    RenderingContext.prototype.reset = function(system) {
      this.initialised = true;
      this.state = {
        x: (Util.canvasWidth(this.canvas) / 2) + system.offsets.x,
        y: (Util.canvasHeight(this.canvas) / 2) + system.offsets.y,
        orientation: -90 + system.offsets.rot,
        stepAngle: system.params.angle.value,
        stepSize: system.params.size.value
      };
      this.bounding = new Bounding;
      return this.stack = [];
    };

    return RenderingContext;

  })();

  Bounding = (function() {
    function Bounding() {
      this.height = __bind(this.height, this);
      this.width = __bind(this.width, this);
    }

    Bounding.prototype.x1 = Infinity;

    Bounding.prototype.y1 = Infinity;

    Bounding.prototype.x2 = -Infinity;

    Bounding.prototype.y2 = -Infinity;

    Bounding.prototype.width = function() {
      return this.x2 - this.x1;
    };

    Bounding.prototype.height = function() {
      return this.y2 - this.y1;
    };

    Bounding.prototype.constrain = function(x, y) {
      this.x1 = Math.max(this.x1, 0);
      this.y1 = Math.max(this.y1, 0);
      this.x2 = Math.min(this.x2, x);
      return this.y2 = Math.min(this.y2, y);
    };

    return Bounding;

  })();

  Renderer = (function() {
    Renderer.prototype.context = null;

    Renderer.prototype.g = null;

    Renderer.prototype.stack = [];

    Renderer.prototype.isDrawing = false;

    function Renderer(canvas) {
      this.canvas = canvas;
      this.render = __bind(this.render, this);
      this.reset = __bind(this.reset, this);
      this.clearCanvas = __bind(this.clearCanvas, this);
      this.context = new RenderingContext(canvas);
      this.g = canvas.getContext("2d");
      enhanceContext(this.canvas, this.g);
    }

    Renderer.prototype.clearCanvas = function() {
      var b, p, padding;
      if (this.context.initialised) {
        b = this.context.bounding;
        p = padding = 5;
        b.constrain(Util.canvasWidth(this.canvas), Util.canvasHeight(this.canvas));
        return this.g.clearRect(b.x1 - p, b.y1 - p, b.width() + 2 * p, b.height() + 2 * p);
      }
    };

    Renderer.prototype.reset = function(system) {
      this.clearCanvas();
      return this.context.reset(system);
    };

    Renderer.prototype.render = function(elems, system) {
      var b, s, start, _ref, _ref1;
      this.isDrawing = true;
      start = new Date;
      this.reset(system);
      this.g.lineWidth = 0.118;
      this.g.strokeStyle = "#dbdee2";
      this.g.beginPath();
      this.g.moveTo(this.context.state.x, this.context.state.y);
      _ref = [this.context.state, this.context.bounding], s = _ref[0], b = _ref[1];
      _ref1 = [s.x, s.y], b.x2 = _ref1[0], b.y2 = _ref1[1];
      _.each(elems, (function(_this) {
        return function(e) {
          return _this.definitions[e](_this.context.state, system.params, _this.g, _this.context);
        };
      })(this));
      this.g.stroke();
      this.isDrawing = false;
      return new Date - start;
    };

    Renderer.prototype.definitions = (function() {
      var ang, c, cloneState, cos, len, max, min, pi, s, sin, _ref;
      _ref = [Math.cos, Math.sin, Math.PI, Math.min, Math.max], cos = _ref[0], sin = _ref[1], pi = _ref[2], min = _ref[3], max = _ref[4];
      len = ang = s = c = 0;
      cloneState = function(c) {
        return {
          x: c.x,
          y: c.y,
          orientation: c.orientation,
          stepAngle: c.stepAngle,
          stepSize: c.stepSize
        };
      };
      return {
        "F": function(state, params, g, context) {
          var bounding;
          ang = ((state.orientation % 360) / 180) * pi;
          state.x += cos(ang) * state.stepSize;
          state.y += sin(ang) * state.stepSize;
          bounding = context.bounding;
          if (state.x < bounding.x1) {
            bounding.x1 = state.x;
          } else if (state.x > bounding.x2) {
            bounding.x2 = state.x;
          }
          if (state.y < bounding.y1) {
            bounding.y1 = state.y;
          } else if (state.y > bounding.y2) {
            bounding.y2 = state.y;
          }
          return g.lineTo(state.x, state.y);
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
        "[": function(state, params, g, context) {
          return context.stack.push(cloneState(state));
        },
        "]": function(state, params, g, context) {
          context.state = state = context.stack.pop();
          return g.moveTo(state.x, state.y);
        },
        "!": function(state) {
          return state.stepAngle *= -1;
        },
        "(": function(state, params) {
          return state.stepAngle *= 1 - params.angle.growth;
        },
        ")": function(state, params) {
          return state.stepAngle *= 1 + params.angle.growth;
        },
        "<": function(state, params) {
          return state.stepSize *= 1 + params.size.growth;
        },
        ">": function(state, params) {
          return state.stepSize *= 1 - params.size.growth;
        }
      };
    })();

    return Renderer;

  })();

}).call(this);

(function() {
  var Util;

  Util = (function() {
    function Util() {}

    Util.log = function(x) {
      return console.log(x);
    };

    Util.control = function(name) {
      return document.getElementById(name);
    };

    Util.value = function(name) {
      return parseFloat(Util.stringvalue(name));
    };

    Util.stringvalue = function(name) {
      return Util.control(name).value;
    };

    Util.clone = function(x) {
      return JSON.parse(JSON.stringify(x));
    };

    Util.toObj = function(kvPairs) {
      var k, obj, v, _i, _len, _ref;
      obj = {};
      for (_i = 0, _len = kvPairs.length; _i < _len; _i++) {
        _ref = kvPairs[_i], k = _ref[0], v = _ref[1];
        obj[k] = v;
      }
      return obj;
    };

    Util.map = function(obj, fn) {
      var key, result, _fn;
      result = {};
      _fn = function() {
        return result[key] = fn(obj[key], key);
      };
      for (key in obj) {
        _fn();
      }
      return result;
    };

    Util.merge = function(a, b, c) {
      return $.extend(true, a, b, c);
    };

    Util.round = function(n, d) {
      var pow;
      pow = Math.pow(10, d);
      return Math.round(n * pow) / pow;
    };

    Util.time = function(n, f) {
      var s;
      if (n instanceof Function) {
        f = n;
      }
      s = new Date;
      f();
      return new Date - s;
    };

    Util.openDataUrl = function(data, filename) {
      var a, evt;
      a = document.createElement("a");
      a.href = data;
      a.download = filename;
      evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
      return a.dispatchEvent(evt);
    };

    Util.canvasWidth = function(canvas) {
      return canvas.width / (window.devicePixelRatio || 1);
    };

    Util.canvasHeight = function(canvas) {
      return canvas.height / (window.devicePixelRatio || 1);
    };

    return Util;

  })();

}).call(this);
