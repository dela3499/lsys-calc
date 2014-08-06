class Lsys
  constructor: (params = {}) ->
    @params = params
    @path = []
    @config = {
      timeout: 5 # timeout in seconds (if method times out, it will be noted in @errors)
    }

    # allow user to check if computations were allowed to complete
    @errors = {
      compilation: false,
      pathCreation: false
    }
    
    @compileRules(params)
    @calcPath()
    return this
  isomorphic: (a,b) -> 
    " return true if n, rules, or seed properties differ between objects a and b "
    foundIn(['n','rules','seed'], objectDiff(a, b))
  setParams: (params = @params) ->
    " Update parameters (and recompile rules if needed) "
    # don't recompile unless necessary (n, rules, or seed have changed)
    if not @isomorphic(params, @params)
      @compileRules(params)    
    @params = params # update params (after original params have been compared to new ones above)
    @calcPath() # with newly-set params
    return this # return object to allow method chaining (i.e. sys.setParams.getPath())
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
  getPath: -> return @path
  calcPath: ->
    " Generate path from compiled string and param values "
    state = clone(@params.pose)
    state.stepSize = @params.size.value
    state.stepAngle = @params.angle.value
    path = [{x: state.x, y: state.y}] 
    stack = [] # bookmarks a state to return to later in path definition
    # execute turtle graphics drawing command
    for e in @compiledString
      @turtle(e,[state, params, path, stack])
    
    @path = path # store path for later lookup with getPath()
    
  turtle: (command, args) ->
    " return function to execute turtle graphics drawing command"
    commands = {
      "F": (state, params, path) ->
        " Move forward (in whatever direction you're facing) "
        # update state
        ang = (state.orientation % 360) * (Math.PI / 180)
        state.x += Math.cos(ang)*state.stepSize
        state.y += Math.sin(ang)*state.stepSize
        # add point to path
        path.push({x: state.x, y: state.y})
      "+": (state) -> state.orientation += state.stepAngle
      "-": (state) -> state.orientation -= state.stepAngle
      "|": (state) -> state.orientation += 180
      "[": (state, params, path, stack) -> 
        " Save current state for a later return "
        stack.push(clone(state))
      "]": (state, params, path, stack) -> 
        " Return to last saved state "
        state = stack.pop()
        path.push({x: state.x, y: state.y})
      "!": (state) -> state.stepAngle *= -1
      "(": (state, params) -> state.stepAngle *= (1 - params.angle.change)
      ")": (state, params) -> state.stepAngle *= (1 + params.angle.change)
      "<": (state, params) -> state.stepSize *= (1 + params.size.change)
      ">": (state, params) -> state.stepSize *= (1 - params.size.change)
    }

    if commands[command]
      # True for any drawing command
      return commands[command](args...)
    else 
      # This will be the case for any rule name, or random character
      return null # do nothing