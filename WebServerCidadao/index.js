
//Inicializações
const express = require ('express');
const res = require('express/lib/response');
const app = express ();
const gat = require('/home/lucas/WebServerCidadao/gateway/gateway.js');
var http = require('http');
var path = require("path");
let ejs = require('ejs');
var bodyParser = require('body-parser');
const mariadb = require('mysql');
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
gat.gatewayInit();

app.set('view engine', 'ejs');
app.set('views', '/home/lucas/WebServerCidadao/views');

//Página inicial web
app.get('/', function (req, res){
    res.sendFile (path.join(__dirname,'./index.html'));
    });

//Expõe o servidor na porta local 5000
const webserver = app.listen(5003, function(){
    console.log ('Servidor UP');
});

//Botão que recupera todos os resultados do ledger
app.post('/allResults', function(req,res){
    gat.gatewaySearch();
    res.redirect('/');
})

app.get('/download', function(req,res){
    const file = '/home/lucas/WebServerCidadao/Dados_Consultados.txt'
    res.download(file);  
})

