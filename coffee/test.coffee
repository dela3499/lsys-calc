console.log("-----------------\n Running test \n-----------------")

# Create params object
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
}

# Initialize L-system with params
sys = new Lsys(params)
#console.log(sys.getPath())
path = sys.getPath()
console.log(["heres a path",path])
x = (e.x for e in path)
y = (e.y for e in path)

for data in path
    console.log(data.x)
console.log("")
for data in path
    console.log(data.y)
console.log("")
console.log(sys.compiledString)

# Set parameters after initialization
#sys = new Lsys()
#sys.setParams(params)

# Get plot data from system
#sys.setParams(params).getDrawPath()

# Get compiled rules
#compiledRules = sys.compileRules()
#console.log compiledRules
