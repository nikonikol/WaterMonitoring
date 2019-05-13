var mongoose =require('mongoose')

mongoose.connect('mongodb://localhost/student',{ useNewUrlParser: true })

var Schema =mongoose.Schema

var onedata =new Schema ({
    data:{
        type: Number,
        required: true
    },
    datatime:{
        type: Date,
        required: true
    },
    dataname:{
        type: String,
        required: true
    },
    
})

module.exports=mongoose.model('Onedata',onedata)

