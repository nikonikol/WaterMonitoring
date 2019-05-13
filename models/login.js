var mongoose =require('mongoose')

mongoose.connect('mongodb://localhost/student',{ useNewUrlParser: true })

var Schema =mongoose.Schema

var userinformation =new Schema ({
    username:{
        type: String,
        required: true
    },
    userpassword:{
        type: String,
        required: true
    },
    name:{
        type: String,       
    },
    gender:{
        type: Number,
        enum:[0,1],
        default:0
    },
    age:{
        type: Number
    },
    phones:{
        type: Number
    }
})

module.exports=mongoose.model('Userinformation',userinformation)
