var mongoose =require('mongoose')

mongoose.connect('mongodb://localhost/student',{ useNewUrlParser: true })

var Schema =mongoose.Schema

var userdata =new Schema ({
    data:{
        type: String,
        required: true
    },
    datatime:{
        type: Date,
        required: true
    },
    dataname:{
        type: String,
        required: true
    }
})

module.exports=mongoose.model('Tem',tem )


