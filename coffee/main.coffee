mySys = Lsys()
console.log(mySys.getPath())

# Initialize L-system (with default parameters)
sys = Lsys(params)

# Set parameters after initialization
sys = Lsys()
sys.setParams(params)

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

# Get plot data from system
sys.getDrawPath()


