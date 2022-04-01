
//Inicializações
const express = require ('express');
const res = require('express/lib/response');
const app = express ();
const gat = require('/home/lucas/WebServer/gateway/gateway.js');
const gatInit = require('/home/lucas/WebServer/gateway/gateway.js');
var http = require('http');
var path = require("path");
let ejs = require('ejs');
var bodyParser = require('body-parser');
const mariadb = require('mysql2');
const { json } = require('express/lib/response');
app.use(bodyParser.urlencoded({extended:true}));

var query;

//Configuração para conexão com o banco de dados
const config = mariadb.createConnection({
    host: "localhost",
    user: "lucas",
    password: "teste",
    database: "test"
});

// Inicializa o gateway Fabric SDK
gatInit.gatewayInit();

app.set('view engine', 'ejs');
app.set('views', '/home/lucas/WebServer/views');

//Página inicial web
app.get('/', function (req, res){
    res.sendFile (path.join(__dirname,'./index.html'));
    });

//Expõe o servidor na porta local 5000
const webserver = app.listen(5000, function(){
    console.log ('Servidor UP');
});

// Chama o form query, faz a busca no banco de dados local e chama o gateway do fabric
app.post('/query', function(req,res){
    query = req.body.query_text; // Recupera a string inserida pelo usuário e trata-a como uma query

    config.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        //Chama o gateway para registrar a transação
        gat.gatewayQuery(query)
        //Utiliza EJS para renderizar dinâmicamente os resultados retornados pelo banco em uma página web para o usuário. 
        res.render('home', {result: result});
        res.end();
        
    });
  });
  

  
// Roda um script e registra o tempo total da transação. 
app.post('/script_bd-ledger', async function(req,res){
    
    console.time('Tempo_BD+Ledger');
    await bd_ledger();
    res.redirect('/');
    console.timeEnd('Tempo_BD+Ledger');

});

// Roda um script e registra o tempo total da transação. 

app.post('/script_bd', async function(req,res){
    
    console.time('Tempo_BD');
    await bd();
    res.redirect('/');
    console.timeEnd('Tempo_BD');

});


// Roda um script que irá gerar N requisições ao banco de dados e transações no ledger da organização
function bd_ledger(){
    var reqs = 50;
    const promises = [];
    for (var i = 0; i<reqs; i++){  
        switch (Math.floor(Math.random() * 4)){
            case 0: 
                query = "SELECT genero FROM Dados_Cidadao";
            break;
            case 1: 
                query = "SELECT nome FROM Dados_Cidadao";
            break;
            case 2: 
                query = "SELECT cpf FROM Dados_Cidadao";
            break;
            case 3: 
                query = "SELECT * FROM Dados_Cidadao";
            break;
        }
        const result = config.execute(query);
        console.log(result);
        promises.push(result);
        promises.push(gat.gatewayQuery(query));   
    } 
    return Promise.all(promises);
}

//Roda um script que irá gerar N requisições ao banco de dados
function bd(){
    var reqs = 50;
    const promises = [];
    for (var i = 0; i<reqs; i++){  
        switch (Math.floor(Math.random() * 4)){
            case 0: 
                query = "SELECT genero FROM Dados_Cidadao";
            break;
            case 1: 
                query = "SELECT nome FROM Dados_Cidadao";
            break;
            case 2: 
                query = "SELECT cpf FROM Dados_Cidadao";
            break;
            case 3: 
                query = "SELECT * FROM Dados_Cidadao";
            break;
        }
        const result = config.execute(query);
        console.log(result);
        promises.push(result);
    } 
    return Promise.all(promises);
}


