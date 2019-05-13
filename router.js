/**
 * router.js路由模块
 * 职责
 *  处理路由
 *  根据不同请求响应url
 */


//加载文件
var fs = require('fs')
var calbulk= require('./public/js/cal.js')
//Express提供了一个更好的方式
//专门包装路由
var express = require('express')
//加载login.js
var Userinformation = require('./models/login')
//
// var Tem = require('./models/data')
//加载mongodbdata.js
var MongodbData = require('./models/mongodbdata')
//加载md5密码插件
var md5 = require('blueimp-md5')
//1.创建一个路由容器
var router = express.Router()


//2.把路由都挂在到router路由容器中


//主要界面
router.get('/', function (req, res) {
    //渲染页面
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    res.render('index_.html', {
        Userinformation: req.session.Userinformation
    })
})



//登陆页面
router.get('/login', function (req, res) {
    res.render('login.html')
})

//登陆请求
router.post('/login', function (req, res) {
    //获取请求体
    login = req.body

    //查询登陆账号和密码
    Userinformation.findOne({
        username: login.username,
        userpassword: md5(md5(login.userpassword))
    }, function (err, Userinformation) {
        //如果错误则显示报错信息
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: err.message
            })
        }

        // 如果账号和密码匹配，则 Userinformation 是查询到的用户对象，否则就是 null
        if (!Userinformation) {
            return res.status(200).json({
                //提供错误码
                err_code: 1,
                message: 'nickname or password is invalid.'
            })
        }

        req.session.Userinformation = Userinformation
        // 用户存在，登陆成功，通过 Session 记录登陆状态
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })

})

//注册页面
router.get('/register', function (req, res) {
    res.render('register.html')
})

//注册请求
router.post('/register', async function (req, res) {
    var body = req.body

    try {
        //查询登录名是否相同
        if (await Userinformation.findOne({
                username: body.username
            })) {
            return res.status(200).json({
                err_code: 1,
                message: '邮箱已存在'
            })
        }

        // 对密码进行 md5 重复加密
        body.userpassword = md5(md5(body.password))

        // 创建用户，执行注册
        await new Userinformation(body).save()
        //注册成功
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    } catch (err) {
        res.status(500).json({
            err_code: 500,
            message: err.message
        })
    }
})

//个人信息
router.get('/perinformation', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    console.log(req.session.Userinformation)
    res.render('personalinformation_.html', {
        Userinformation: req.session.Userinformation
    })
})

//查找历史数据
router.get('/historydata', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    MongodbData.find(({}), function (err, historydatas) {
        if (err) {
            return res.status(500).send('Server error')
        }
        res.render('historydata_.html', {
            historydata: historydatas,
            Userinformation: req.session.Userinformation
        })
    })
})


//删除历史数据
router.get('/historydata/delete', function (req, res) {
    MongodbData.findByIdAndRemove(req.query.id, function (err) {
        console.log(req.query.id)
        if (err) {
            return res.status(500).send('Server error')
        }
        res.redirect('/historydata')
    })
})


//数据分析页面
router.get('/dataanaly', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    res.render('analysedata_.html',{
        Userinformation: req.session.Userinformation
    })
})

//历史数据搜索页面
router.get('/dataanaly_data', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    res.render('dataanaly.html',{
        Userinformation: req.session.Userinformation
    })
 
})

router.post('/dataanaly_data', function (req, res) {
    analy = req.body
    MongodbData.find({
        "data": {
            "$gte": analy.min,
            "$lte": analy.max
        }
    }, function (err, analydata) {
        if (err) {
            return res.status(500).send('Server error')
        }
        if (analydata) {
            var mydata = new Array
            var mycaldata = new Array           
            var mydatetime = new Array
            var calreason =null
            for (var i = 0; i < analydata.length; i++) {
                mydata[i] = analydata[i].data
                mycaldata[i] = analydata[i].data
                mydatetime[i] = analydata[i].datatime
                mydatetime[i] = mydatetime[i].toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
            }
            return res.status(200).json({
                mydata: mydata,
                mydatetime: mydatetime,
                calreason:calbulk.cal(mycaldata)
            })
        }
    })
})


router.get('/dataanaly_time', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    res.render('dataanaly_time.html',{
        Userinformation: req.session.Userinformation
    })

})

router.post('/dataanaly_time', function (req, res) {
    analy = req.body
    //获取max
    var time_max=new Date(analy.max_time)
    time_max = time_max.getTime()/1000;
    var max=new Date()
    max.setTime(time_max * 1000)
    //获取min
    var time_min=new Date(analy.min_time)
    time_min = time_min.getTime()/1000;
    var min=new Date()
    min.setTime(time_min * 1000)

    MongodbData.find({
        "datatime": {
            "$gte": min,
            "$lte": max
        }
    }, function (err, analydata) {
        if (err) {
            return res.status(500).send('Server error')
        }
        if (analydata) {
            var mydata = new Array
            var mydatetime = new Array
            var mycaldata = new Array    
            for (var i = 0; i < analydata.length; i++) {
                mydata[i] = analydata[i].data
                mycaldata[i] = analydata[i].data
                mydatetime[i] = analydata[i].datatime
                
                mydatetime[i] = mydatetime[i].toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
            }
            return res.status(200).json({
                mydata: mydata,
                mydatetime: mydatetime,
                calreason:calbulk.cal(mycaldata)
            })
        }
    })
})



//地图页面
router.get('/getmap', function (req, res) {
    res.render('MainMap.html')

})


//检测页面
router.get('/jiance', function (req, res) {
    if (req.session.Userinformation === null || req.session.Userinformation === undefined) {
        return res.redirect('/login')
    }
    res.render('mapandchart.html',{
        Userinformation: req.session.Userinformation
    })

})







//渲染echart页面
router.get('/getchart', function (req, res) {
    res.render('mychart.html')
})
router.post('/getchart', function (req, res) {
    //获取现在的时间，并转化为ISO时间格式
    var d = new Date();
    d.setHours(d.getHours(), d.getMinutes() - d.getTimezoneOffset());
    //获取现在的时间戳，并减轻一分钟
    var time = Date.parse(new Date(d)) / 1000;
    time1 = time - 60
    //将我们减去的时间戳转化为ISO格式
    var newDate = new Date();
    newDate.setTime(time1 * 1000);

    MongodbData.find({
        "datatime": {
            "$gte": newDate,
            "$lte": d
        }
    }, function (err, mongodbDatas) {
        if (err) {
            return res.status(500).send('Server error')
        }
        if (mongodbDatas) {
            var mydata = new Array
            var mydatetime = new Array
            for (var i = 0; i < mongodbDatas.length; i++) {
                mydata[i] = mongodbDatas[i].data
                mydatetime[i] = mongodbDatas[i].datatime
                mydatetime[i] = mydatetime[i].toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
            }
            return res.status(200).json({
                mydata: mydata,
                mydatetime: mydatetime
            })
        }
    })
})










router.get('/logout', function (req, res) {
    // 清除登陆状态
    req.session.Userinformation = null
    // 重定向到登录页
    res.redirect('/login')
})






//未处理
router.get('/userinformation', function (req, res) {
    res.redirect('/students')

})


// router.get('/profit', function (req, res) {
//     res.render('container.html')
// })




router.get('/historychart', function (req, res) {
    MongodbData.find(({}), function (err, historydatas) {
        if (err) {
            return res.status(500).send('Server error')
        } 
        res.render('historychart_.html', {
            Userinformation: req.session.Userinformation,
            historydatas: historydatas
        })
    })
})

// router.get('/customer/edit', function (req, res) {
//     res.render('home.html')
// })


// router.post('/customer/edit', function (req, res) {

// })

//图表展示
router.get('/chartsdisplay', function (req, res) {
    res.render('chartsdisplay.html')

})
//图表展示,数据实时更新
router.post('/chartsdisplay', function (req, res) {
    //获取现在的时间，并转化为ISO时间格式
    // var d = new Date();
    // d.setHours(d.getHours(), d.getMinutes() - d.getTimezoneOffset());
    // //获取现在的时间戳，并减轻一分钟
    // var time = Date.parse(new Date(d)) / 1000;
    // time1 = time - 60
    // //将我们减去的时间戳转化为ISO格式
    // var newDate = new Date();
    // newDate.setTime(time1 * 1000);
    nowtime=localDate()
    thistime= localISODate()-30
    var newDate = new Date();
    newDate.setTime(thistime * 1000);
    MongodbData.find({
        "datatime": {
            "$gte": newDate,
            "$lte": nowtime
        },
        "dataname":"Tem"
    }, function (err, mongodbDatas) {
        if (err) {
            return res.status(500).send('Server error')
        }
        if (mongodbDatas) {
            //console.log(mongodbDatas)
            MongodbData.find({
                "datatime": {
                    "$gte": newDate,
                    "$lte": nowtime
                },
                "dataname":"Hum"
            },function(err,mongodbDatahums){
                if (err) {
                    return res.status(500).send('Server error')
                }
                if (mongodbDatahums) {
                    //console.log(mongodbDatahums)
                    var mydatatem = new Array
                    var mydatahum = new Array
                    var mydatetime = new Array
                    for (var i = 0; i < mongodbDatas.length; i++) {
                        mydatatem[i] = mongodbDatas[i].data
                        mydatetime[i] = mongodbDatas[i].datatime
                        mydatetime[i] = mongodate(mydatetime[i])
                    }
                    for (var j = 0; j < mongodbDatahums.length; j++) {
                        mydatahum[j] = mongodbDatahums[j].data
                    }
                    return res.status(200).json({
                        mydatatem: mydatatem,
                        mydatahum: mydatahum,
                        mydatetime: mydatetime
                    })
                }
            })
            
        }
    })
})


router.get('/yibiao', function (req, res) {
    res.render('gauge.html')
})

router.post('/yibiao', function (req, res) {
    nowtime=localDate()
    thistime= localISODate()-30
    var newDate = new Date();
    newDate.setTime(thistime * 1000);
    MongodbData.find({
        "datatime": {
            "$gte": newDate,
            "$lte": nowtime
        },
        "dataname":"Tem"
    }, function (err, mongodbDatas) {
        if (err) {
            return res.status(500).send('Server error')
        }
        if (mongodbDatas) {
            //console.log(mongodbDatas)
            MongodbData.find({
                "datatime": {
                    "$gte": newDate,
                    "$lte": nowtime
                },
                "dataname":"Hum"
            },function(err,mongodbDatahums){
                if (err) {
                    return res.status(500).send('Server error')
                }
                if (mongodbDatahums) {
                    //console.log(mongodbDatahums)
                    var mydatatem = new Array
                    var mydatahum = new Array
                    var mydatetime = new Array
                    for (var i = 0; i < mongodbDatas.length; i++) {
                        mydatatem[i] = mongodbDatas[i].data
                        mydatetime[i] = mongodbDatas[i].datatime
                        mydatetime[i] = mongodate(mydatetime[i])
                    }
                    for (var j = 0; j < mongodbDatahums.length; j++) {
                        mydatahum[j] = mongodbDatahums[j].data
                    }
                    return res.status(200).json({
                        mydatatem: mydatatem,
                        mydatahum: mydatahum,
                        mydatetime: mydatetime
                    })
                }
            })
            
        }
    })
})

// router.get('/6', function (req, res) {
//     res.render('6.html')
// })

// router.post('/6', function (req, res) {
//     //获取现在的时间，并转化为ISO时间格式
//     var d = new Date();
//     d.setHours(d.getHours(), d.getMinutes() - d.getTimezoneOffset());
//     //获取现在的时间戳，并减轻一分钟
//     var time = Date.parse(new Date(d)) / 1000;
//     time1 = time - 60
//     //将我们减去的时间戳转化为ISO格式
//     var newDate = new Date();
//     newDate.setTime(time1 * 1000);

//     MongodbData.find({
//         "datatime": {
//             "$gte": newDate,
//             "$lte": d
//         }
//     }, function (err, mongodbDatas) {
//         if (err) {
//             return res.status(500).send('Server error')
//         }
//         if (mongodbDatas) {
//             var mydata = new Array
//             var mydatetime = new Array
//             for (var i = 0; i < mongodbDatas.length; i++) {
//                 mydata[i] = mongodbDatas[i].data
//             }
//             return res.status(200).json({
//                 mydata: mydata,
//             })
//         }
//     })
// })



/*时间格式化*/ 

function localISODate() {
    var d = new Date();
    d.setHours(d.getHours(), d.getMinutes() - d.getTimezoneOffset());
    //获取现在的时间戳，并减轻八小时
    var time = Date.parse(new Date(d)) / 1000;
    time1 = time -28800;
    return time1;
}

function localDate(){
    var d = new Date();
    d.setHours(d.getHours(), d.getMinutes() - d.getTimezoneOffset());
    //获取现在的时间戳，并减轻八小时
    var time = Date.parse(new Date(d)) / 1000;
    time1 = time -28800
    //将我们减去的时间戳转化为ISO格式
    var newDate = new Date();
    newDate.setTime(time1 * 1000);
    return newDate;
}

function mongodate(d){
    var time = Date.parse(new Date(d)) / 1000;
    time1 = time + 28800
    var newDate = new Date();
    newDate.setTime(time1 * 1000);
    return newDate.toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}



//把router导出
module.exports = router