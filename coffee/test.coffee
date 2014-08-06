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
