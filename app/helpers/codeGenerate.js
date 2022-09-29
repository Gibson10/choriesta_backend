var rn = require('random-number');
export default function  randomGenerate(){
    var options = {
        min:  1000
      , max:  9999
      , integer: true
      }
     const code=rn(options)
     return code // example outputs → -187, 636

}
