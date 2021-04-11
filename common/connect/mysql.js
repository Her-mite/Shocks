const express = require('express')
const mysql = require('mysql')

//链接mysql数据库
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'reactbook',
    port:3306
})

module.exports = db;