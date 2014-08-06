class Lsys
  constructor: (params = {}) ->
    @params = params
    @config = {
      timeout: 5 # timeout in seconds (if method times out, it will be noted in @errors)
    }

    # allow user to check if computations were allowed to complete
    @errors = {
      compilation: false,
      pathCreation: false
    }
    
    @compileRules(params)
    return this
  isomorphic: (a,b) -> 
    " return true if n, rules, or seed properties differ between objects a and b "
    foundIn(['n','rules','seed'], objectDiff(a, b))
  setParams: (params = @params) ->
    " Update parameters (and recompile rules if needed) "
    # don't recompile unless necessary (n, rules, or seed have changed)
    if not @isomorphic(params, @params)
      @compileRules(params)
    @params = params # update params
    return this # return object to allow method chaining (i.e. sys.setParams.getPath())
  getDrawPath: ->
    {
      x: [1,2,3],
      y: [1,2,3]
    }
  compileRules: (params)->
    " Execute text-replacement on seed according to rules (repeated n times) "
    string = params.seed
    startTime = new Date().getTime()
    
    # recompile string n times
    for i in [1..params.n]
      # Break out of computation if it's taking too long
      currentTime = new Date().getTime()
      if (currentTime - startTime)/1000 > @config.timeout 
        @compiledString = string # save partially-compiled string (rather than throw error)
        @errors.compilation = "timeout" # lets user see if compilation completed
        return # stop computation
      
      # replace each character in seed according to rules (or return original character, if no rules match)
      string = (params.rules[e] or e for e in string).join("")
    
    @compiledString = string # save fully-compiled string
    @errors.compilation = false # allows user to see compilation was successful
    
  getPath: ->
    " Generate path from compiled string and param values "
    path = [] 
    stack = [] # bookmarks a state to return to later in path definition
    state = clone(@params.pose)
    for e in @compiledString
      @turtle[e](state, params, path)
  turtle: (command) ->
    " return function to execute turtle graphics drawing command"
    commands = {
      "F": 1,
    }
    return commands[command]
      
      
#    "F": (state, params, g, context) ->
#
#      ang = ((state.orientation%360) / 180) * pi #todo - stop storing degrees?!
#      state.x += cos(ang)*state.stepSize
#      state.y += sin(ang)*state.stepSize
#
#      bounding = context.bounding
#
#      if (state.x < bounding.x1)
#        bounding.x1 = state.x
#      else if (state.x > bounding.x2)
#        bounding.x2 = state.x
#
#      if (state.y < bounding.y1)
#        bounding.y1 = state.y
#      else if (state.y > bounding.y2)
#        bounding.y2 = state.y
#
#      g.lineTo(state.x,state.y)
#
#    "+": (state) -> state.orientation += state.stepAngle
#    "-": (state) -> state.orientation -= state.stepAngle
#    "|": (state) -> state.orientation += 180
#    #todo: push stack changes into RenderingContext class
#    "[": (state, params, g, context) -> context.stack.push(cloneState state)
#    "]": (state, params, g, context) -> context.state = state = context.stack.pop(); g.moveTo(state.x,state.y)
#    "!": (state) -> state.stepAngle *= -1
#    "(": (state, params) -> state.stepAngle *= (1 - params.angle.growth)
#    ")": (state, params) -> state.stepAngle *= (1 + params.angle.growth)
#    "<": (state, params) -> state.stepSize *= (1 + params.size.growth)
#    ">": (state, params) -> state.stepSize *= (1 - params.size.growth)
#    }
    
    
    
    
    
      
  
  