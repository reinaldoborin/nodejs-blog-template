// Carregando Módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path') //Manipular Pastas
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")

// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())

    //Middleware
        app.use(function(req, res, next){
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            next()
        })

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp", {
        }).then(function(){
            console.log("Mongodb Conectado!")
        }).catch(function(err){
            console.log("Houve um erro ao se conectar ao mongodb: " + err )
        })

    // Public
    // Configura a pasta public no express
        app.use(express.static(path.join(__dirname, 'public'))) 

// Rotas
    app.get('/', function(req, res){
        Postagem.find().populate("categoria").sort({data: "desc"}).then(function(postagens){
            res.render("index", {postagens: postagens})
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", function(req, res){
        Postagem.findOne({slug: req.params.slug}).then(function(postagem){
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Essa postagem não existe!")
                req.redirect("/")
            }
        }).catch(function(err){
            req.flash("error_msg", "Houve um erro interno")
        })
    })

    app.get("/404", function(req, res){
        res.send("Erro 404!")
    })
    
    app.use('/admin', admin)

// Outros
    const PORT = 8081
    app.listen(PORT, function(){
    console.log("Servidor rodando na porta " + PORT)
    })  