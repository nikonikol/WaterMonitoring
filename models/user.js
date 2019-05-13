var mongoose =require('mongoose')

mongoose.connect('mongodb://localhost/student',{ useNewUrlParser: true })

var Schema =mongoose.Schema

var userSchema =new Schema({
    email:{
        type: String,
        required: true
    },
    nickname:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    create_time:{
        type: Date,
        default:Date.now,
        required: true
    },
    last_modified_time:{
        type: Date,
        default:Date.now,
        required: true
    },
    avatar:{
        type: String,
        default:'/public/img/avatar-default.png'
    },
    bio:{
        type: String,
        default:''
    },
    gender:{
        type: Number,
        enum:[-1,0,1],
        default:-1
    },
    birthday:{
        type: Date,
    },
    status:{
        type:Number,
        //0无权限
        //1禁止评论
        //2禁止登陆
        enum:[0,1,2],
        default:0
    }
})

module.exports =mongoose.model('Users',userSchema)