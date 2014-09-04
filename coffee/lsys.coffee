class Lsys
  constructor: (params = {}) ->
    @initTurtleCommands() # generate all the turle drawing commands 
    @params = params
    @path = {x:[],y:[]}
    @config = {
      timeout: 5 # timeout in seconds (if method times out, it will be noted in @errors)
    }
    # allow user to check if computations were allowed to complete
    @errors = {
      compilation: false,
      pathCreation: false
    }
    @compileRules(params)
    # Initialize path-generation variable
    @state = clone(@params.pose)
    @state.stepSize = @params.size.value
    @state.stepAngle = @params.angle.value
    @stack = []
    
    # Initialize pool of objects (so new objects don't have to be created in while drawing the path)
    poolSize = 10000
    @pool = ({} for i in [0..poolSize])
    
    # Generate new path
    @calcPath()
    return this # allow method chaining
  isomorphic: (a,b) -> 
    " return true if n, rules, or seed properties differ between objects a and b "
    foundIn(['n','rules','seed'], objectDiff(a, b))
  setParams: (params = @params) ->
    " Update parameters (and recompile rules if needed) "
    # don't recompile unless necessary (n, rules, or seed have changed)
    #if not @isomorphic(params, @params)
    #  bob = 12
#      @compileRules(params)    //Commenting out for now (i.e. must setup rules and such in constructor, and can't update them later.) Need to fix this soon. 
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
    # Clear x and y arrays (instead of creating new ones, which requires more garbage collection)
#    @path.x.length = 0
#    @path.y.length = 0
    
    # Initialize x and y arrays
#    @path.x.push(@state.x)
#    @path.y.push(@state.y)
    
    # Clear stack, which bookmarks a state to return to later in path definition
    @stack.length = 0
    
    #startTime = new Date().getTime()
    # execute turtle graphics drawing command
#    argArray = []
    for e in @compiledString
      @turtle(e,[@state, @params, @stack, @pool])
    
    
#    @path = {x: pathX, y: pathY} # store path for later lookup with getPath()  
  getNextPoint: -> 
    " Calculate and return next point on path " 
    start = @currentPathPosition
    end = @compiledString.length - 1
    for i in [start..end]
      @turtle(@compiledString[i],[@state, @params, @stack, @pool])
      
  turtle: (command, args) ->
    if @turtleCommands[command]
      # True for any drawing command
      return @turtleCommands[command](args...)
    else 
      # This will be the case for any rule name, or random character
      return null # do nothing    
    
  initTurtleCommands: ->
    " initialize object with functions to execute turtle graphics drawing commands"
    @turtleCommands = {
      "F": (state, params) ->
        " Move forward (in whatever direction you're facing) "
        # update state
        # ang = (state.orientation % 360) * (Math.PI / 180) // try not to create any objects or values
        state.x += Math.cos((state.orientation % 360) * (Math.PI / 180))*state.stepSize
        state.y += Math.sin((state.orientation % 360) * (Math.PI / 180))*state.stepSize
        # add point to path
#        pathX.push(state.x)
#        pathY.push(state.y)
      "+": (state) -> state.orientation += state.stepAngle
      "-": (state) -> state.orientation -= state.stepAngle
      "|": (state) -> state.orientation += 180
      "[": (state, params, stack, pool) -> 
        " Save current state for a later return "
        stack.push(cloneFromPool(state, pool))
      "]": (state, params, stack, pool) -> 
        " Return to last saved state "
        
        # Update current state to match popped state
        # pop = stack.pop()
        pop = stack.pop()
        pool.push(pop) # return object to pool
        for key of pop
          state[key] = pop[key]
        # Add current state to path
#        pathX.push(state.x)
#        pathY.push(state.y)
      "!": (state) -> state.stepAngle *= -1
      "(": (state, params) -> state.stepAngle *= (1 - params.angle.change)
      ")": (state, params) -> state.stepAngle *= (1 + params.angle.change)
      "<": (state, params) -> state.stepSize *= (1 + params.size.change)
      ">": (state, params) -> state.stepSize *= (1 - params.size.change)
    }

