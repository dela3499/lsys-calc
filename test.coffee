class Lsys
  constructor: (params = null) ->
    @setParams(params)
    @config = {
      timeout: 5 # timeout in seconds - functions will return null on timeout
    }
    
    # allow user to check if computations were allowed to complete
    @errors = {
      compilation: false,
      pathCreation: false
    }
  objectDiff: (a,b) ->
    " Report which which fields differ between objects "
    for key in a
      if
    
  setParams: (params = @params) ->
    " Update parameters (and recompile rules if needed) "
    if 
    @compileRules(params) # will only recompile if n, rules, or seed have changed
    @params = params 
    this # return object to allow method chaining (i.e. sys.setParams.getPath())
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
    
    for e in @compiled string
    "+": (state) -> state.orientation += state.stepAngle
    "-": (state) -> state.orientation -= state.stepAngle
    "|": (state) -> state.orientation += 180
    #todo: push stack changes into RenderingContext class
    "[": (state, params, g, context) -> context.stack.push(cloneState state)
    "]": (state, params, g, context) -> context.state = state = context.stack.pop(); g.moveTo(state.x,state.y)
    "!": (state) -> state.stepAngle *= -1
    "(": (state, params) -> state.stepAngle *= (1 - params.angle.growth)
    ")": (state, params) -> state.stepAngle *= (1 + params.angle.growth)
    "<": (state, params) -> state.stepSize *= (1 + params.size.growth)
    ">": (state, params) -> state.stepSize *= (1 - params.size.growth)    
    
    
    
    
    
    
      
  
  
console.log("-----------------\n Running test \n-----------------")

# Create params object
params = {
    seed: "A-B",
    rules: {
        "A": "A-B",
        "B": "B-B"
    },
    n: 1,
    pose: {
        x: 0,
        y: 0,
        theta: 0
    },
    size: {
        value: 10,
        change: 1.0
    },
    angle: {
        value: 10,
        change: 1
    }
}

# Initialize L-system with params
sys = new Lsys(params)

# Set parameters after initialization
sys = new Lsys()
sys.setParams(params)

# Get plot data from system
sys.setParams(params).getDrawPath()

# Get compiled rules
compiledRules = sys.compileRules()
console.log compiledRules
