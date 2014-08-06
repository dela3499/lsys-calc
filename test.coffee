class Lsys
  constructor: (params = {}) ->
    @setParams(params)
  setParams: (@params = @params) -> this
  getDrawPath: ->
    {
      x: [1,2,3],
      y: [1,2,3]
    }
  
console.log("-----------------\n Running test \n-----------------")

# Create params object
params = {
    rules: [
        "H": "ABC",
        "A": "HBC"
    ],
    levels: 10,
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