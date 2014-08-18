var initConfig = {
    seed: "|-S!L!Y",
    rules: {
        "S": "[F[FF-YS]F)G]+",
        "Y": "--[F-)<F-FG]-",
        "G": "FGF[Y+>F]+Y"
    },
    n: 12,
    pose: {
        x: 0,
        y: 0,
        orientation: 0
    },
    size: {
        value: 14.11,
        change: -1.35
    },
    angle: {
        value: -3963.748,
        change: -0.138235
    }
};

var mySys = new Lsys (initConfig);
var initPathRaw = mySys.getPath();
var initPath = [initPathRaw.x,initPathRaw.y];

var config = clone(initConfig);

var change = 0.1;
var update = function () {
	config.angle.value += change;
	mySys.setParams(config);
	var rawPath = mySys.getPath();
	var path = [rawPath.x,rawPath.y];
	// e.ports.lsys.send(path);
	// Clean up variables
    change = null;
    rawPath = null;
    path = null;

    requestAnimationFrame(update);
};

requestAnimationFrame(update);
