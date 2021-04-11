const db = require('../../common/connect/mysql')

exports.queryBookContent = async (req, res)=>{
    if (req.method !== "GET") {
        logger.error('GET');
        res.json({
            code: 500,
            message: "GET"
        })
        return
    }
    let bookname = req.query.bookname;
    
    let sql ="select * from bookContent where `bookname` = ? "
    db.query(sql, bookname, (err,data)=>{
        if(err){
            console.log(err)
            return
        }else{
            console.log(data);
            res.json({
                code:200,
                message:"数据返回成功",
                data:data
            })
        }
    })
}