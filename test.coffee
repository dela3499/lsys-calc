flatten = (array) ->
  " return array of all values in array (without any subarrays) "
  out = []
  for e in array
    if e instanceof Array or e instanceof Object
      out = out.concat(flatten(e))
    else
      out.push(e)
  return out
  
unique = (array) -> 
  " Return array without duplicate elements "  
  output = {}
  output[array[key]] = array[key] for key in [0...array.length]
  value for key, value of output

getKeys = (objects) ->
  " Get all keys found in provided array of objects "
  keys = []
  for object in objects
    keys.push(key) for key of object
  return unique(keys)
    
objectDiff = (a, b) ->
  " Return array of top-level properties which differ between objects a and b "
  diff = []
  keys = getKeys([a,b])
  console.log('ObjectDiff')
  for k in keys
    console.log('ObjectDiff',[a,b])
    if a[k] instanceof Object and b[k] instanceof Object
      console.log('ObjectDiff')
      diff.push k if objectDiff(a[k],b[k]).length > 0
    else
      diff.push(k) if a[k] != b[k]
  return flatten(diff)

foundIn = (matches, array) ->
  " return true if any matches are found in array "
  for match in matches 
    if match in array
      return true
  return false # if no matches

clone = (obj) ->
  " Clone (deep copy) an object "
  " http://coffeescriptcookbook.com/chapters/classes_and_objects/cloning "
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime()) 

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags) 

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = clone obj[key]

  return newInstance
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
    
    
    
    
    
      
  
  
console.log("-----------------\n Running test \n-----------------")

# Create params object
params = {
    seed: "A-BC",
    rules: {
        "A": "A-B",
        "B": "BB",
        "C": "AB>C"
    },
    n: 5,
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
console.log(sys)


# Set parameters after initialization
#sys = new Lsys()
#sys.setParams(params)

# Get plot data from system
#sys.setParams(params).getDrawPath()

# Get compiled rules
#compiledRules = sys.compileRules()
#console.log compiledRules
