foundIn = (matches, array) ->
  " return true if any matches are found in array "
  for match in matches 
    if match in array
      return true
  return false # if no matches
    
a = [1, 2, 3]
b = [1]

c = ["bob","sarah","tom"]
d = ["bob", "a"]
e = ["a"]

console.log(foundIn(c,e))
    