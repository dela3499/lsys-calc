# How L-systems work
If you haven't played around with L-systems much, then check out [Wikipedia](http://en.wikipedia.org/wiki/L-system) or a [beautiful visualizer](http://benvan.co.uk/lsys/).

The basic ideas is to generate a seed string, like 'AB', which will then be replaced by another string, according to rules you define. You could make a set of rules like {A->AB, B->C}, which would turn AB into ABC. You can perform string substitution again and again to generate ever longer strings. 

Once you've got a nice long string, you can associate a [turtle graphic](http://en.wikipedia.org/wiki/Turtle_graphics) command with each character and plot your string. They tend to form complex, self-similar shapes like fractals.

# Instructions
To begin generating your own L-systems, you'll need just a few commands: 

    params = {}                  # define system params
    sys = new Lsys(params)       # create new system (params argument is optional)
    sys.setParams(params)        # update system with params
    drawPath = sys.getDrawPath() # get data for plotting
    plot(drawPath.x,drawPath.y)  # plot the system    
    
The params object should look something more like this: 
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

As you can see, there 6 fields in the params object: 

1. seed *string* - starting string
2. rules *object* - key is a rule name, value is a rule
3. n *integer* - number of times to execute string replacement 
4. pose *object* - has x and y position properties along with orientation (in degrees)
5. size *object* - value is distance between points, change is used to vary this distance with each iteration
6. angle *object* - value is angle of turns in path, change is used to vary this angle with each iteration

The rules are the most complex and interested part of the params object. You can create as many rules as you like, and you can referene one rule from another. If, for instance, you have a rule "A": "B", then every occurence of "A" in a string will be replaced with a "B". 

Here's a list of the turtle graphics drawing commands you can include in your rules: 

F : Draw a line along current orientation
+ : Increase the orientation angle (counterclockwise)
- : Decrease the orientation angle (clockwise)
| : Flip the orientation angle into opposite direction
[ : Save current position and orientation (can do this multiple times)
] : Return to last saved position and orientation (do this multiple time to go to older saves)
! : Negate angle.value (begin turning in opposite direction)
( : Scale angle.value by (1 - angle.change)
) : Scale angle.value by (1 + angle.change)
< : Scale size.value by (1 + size.change)
> : Scale size.value by (1 - size.change)

