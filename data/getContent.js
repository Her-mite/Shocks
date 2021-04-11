const superagent = require('superagent')
const cheerio = require('cheerio')

// 获取文章具体内容
let getContent =(websiteURL)=>{
    console.log("获取文章内容");
    
    superagent.get(websiteURL).end((err, res) => {
        if (err) {
            console.log(err);
            return err;
        } else {
            // 获取到正文页面对数据进行处理
            let $ = cheerio.load(res.text);
            console.log($('h1').text()); // 书籍名称
            console.log($('span.content-wrap').text()); // 章节名称
            console.log($('div.read-content').text()); // 获取所有本章内容
            
            
            
        }
    })
}

getContent("https:"+"//read.qidian.com/chapter/HL-rJ1y9QMVrZK4x-CuJuw2/_jKB761VHq1p4rPq4Fd4KQ2")

