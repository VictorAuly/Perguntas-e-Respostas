const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const connection = require('./database/db')
const Pergunta = require('./database/pergunta')
const Resposta = require('./database/Resposta')
const { where } = require('sequelize')

//banco de dados
connection.authenticate().then(()=>{
    console.log('Conexao feita com o banco de dados')
}).catch((msgErro)=>{
    console.log(msgErro )
})

//estou dizendo para o express usar o ejs como view engine
app.set('view engine', 'ejs')
app.use(express.static('public'))

//body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//rotas
app.get('/', (req, res)=>{
    Pergunta.findAll({raw: true, order:[
        ['id','DESC']// filtro para ordenar de forma DECRESENTE(DESC)|| CRESCENTE(ASC)
    ]}).then(perguntas =>{
        res.render('index',{
            perguntas: perguntas
        })
    })
    
})
app.get('/perguntar', (req, res)=>{
    res.render('perguntar')
})
app.post('/salvarpergunta', (req, res)=>{
    console.log(req.body);

    
    var titulo = req.body.titulo
    var descricao = req.body.descricao// recebe os dados do formulario e armazena em uma variavel

    Pergunta.create({
        titulo: titulo,
        descricao: descricao
        //pega os dados da variavel e faz um insert na tabela
    }).then(()=>{
        res.redirect('/')
    })
})

app.get('/pergunta/:id',(req,res)=>{
    var id = req.params.id
    Pergunta.findOne({
        where: {id:id}//procura no banco de dados onde o id é igual ao id da busca
    }).then(pergunta =>{
        if(pergunta != undefined){

            Resposta.findAll({
                where: { perguntaId: pergunta.id },
                order: [['id', 'DESC']]
            }).then(respostas=>{
                res.render('pergunta',{
                    pergunta: pergunta,
                    respostas: respostas
                })
            })
        }else{
            res.redirect('/')
        }
    })
})

app.post('/responder', (req, res)=>{
    var corpo = req.body.corpo
    var perguntaId = req.body.pergunta

    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId.trim() // trim serve para retirar o espaço que vem junto no input
    }).then(()=>{
        res.redirect('/pergunta/'+perguntaId)
    })
})
app.listen(8080,()=>{
    console.log('Aplicação está rodando na porta 8080')
})
