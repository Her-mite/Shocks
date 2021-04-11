const db = require('../../common/connect/mysql')

const gameData = require('../../data/gamePic/gameData')
const historyData = require('../../data/historyPic/historyData')
const kehuanData = require('../../data/kehuanPic/kehuanData')
const lastUpdatedData = require('../../data/lastUpdatedPic/lastUpdatedData')
const newBookData = require('../../data/newBookPic/newBookData')
const suspenseData = require('../../data/suspensePic/suspenseData')
const urbanData = require('../../data/urbanPic/urbanData')

const logger = require('../../log/winston')
const utils = require('../../common/utils')

/**
 * 向mysql数据库插入数据
 * @method PUT
 * @param {bookType} 数据类型
 * @return {code:200,message:"插入数据库成功"}
 */
exports.insertBookinfo = async (req, res, next) => {      
    //请求方法校验
    if (req.method !== "PUT") {
        logger.error('请求方式错误，应为PUT');
        res.json({
            code: 500,
            message: "请求方式错误，应为PUT"
        })
        return
    }
    let { bookType } = req.body

    //获取所需插入书籍类型
    try {
        let sql
        switch (bookType) {
            case ("game"):
                sql = 'INSERT INTO `gameBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, gameData);
                break;
            case ("history"):
                sql = 'INSERT INTO `historyBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, historyData);
                break;
            case ("kehuan"):
                sql = 'INSERT INTO `kehuanBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, kehuanData);
                break;
            case ("lastUpdated"):
                sql = 'INSERT INTO `lastUpdatedBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, lastUpdatedData);
                break;
            case ("newBook"):
                sql = 'INSERT INTO `newBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, newBookData);
                break;
            case ("suspense"):
                sql = 'INSERT INTO `suspenseBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, suspenseData);
                break;
            case ("urban"):
                sql = 'INSERT INTO `urbanBook` (`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?)'
                insertToMysql(res, sql, bookType, urbanData);
                break;
            default:
                res.json({
                    code: 500,
                    message: "未找到对应数据类型，请确认后重试!"
                })
                return
        }
    } catch (error) {
        res.json({
            code:500,
            message:error
        })
        logger.error({error:error, interface:"insertBookinfo"})
        console.log(error);
        return
    }

}

/**
 * @method PUT
 * @param bookname
 * @param author
 * @param description
 * @param category
 * @param pictureUrl
 * @param {修改值类型:hasRead|hasCollection} type
 */
exports.addBookToHasRead= async(req, res, next)=>{
    if(req.method!=="PUT"){
        logger.error("请求方式出错，该接口应为PUT请求")
        res.json({
            code:500,
            message:"请求方式出错，该接口应为PUT请求"
        })
        return
    }
    let {bookname, author, description, category, pictureUrl, type} = req.body
    let param =[bookname, author, description, category, pictureUrl]
    console.log(param);
    
    let sql = "INSERT INTO "+type+"(`bookname`,`author`,`description`,`category`, `pictureUrl`) VALUES (?) "
    db.query(sql, [param], (err, data) => {
        if (err) {
            logger.error({error:err, detail:"数据库查询异常", interface:"addBookToHasRead"})
            res.json({
                code:500,
                message:err
            })
            return
        } else {
            logger.info("数据插入成功")
            res.json({
                code: 200,
                message: "数据插入成功"
            })
        }
    }) 

}


/**
 * @description 删除指定名称书籍
 * @method DELETE
 * @param {bookname} 要删除的书籍名称
 * @param {修改值类型:hasRead|hasCollection} type
 */
exports.deleteBookFromHasRead=async(req, res, next)=>{
    if(req.method!=="DELETE"){
        logger.error("请求方式出错，该接口应为DELETE请求")
        res.json({
            code:500,
            message:"请求方式出错，该接口应为DELETE请求"
        })
        return
    }

    let {bookname, type} = req.body
    console.log(bookname);
    console.log(type);
    
    
    if(!bookname||!type){
        logger.error("请求参数有误")
        res.json({
            code:500,
            message:"请求参数有误"
        })
        return
    }
    let sql = "DELETE FROM "+ type +" WHERE `bookname` = ?"
    db.query(sql, bookname, (err, data)=>{
        if(err){
            logger.error({error:err, interface:"deleteBookFromHasRead"});
            res.json({
                code:500,
                message:"数据库操作出错",
                data:err
            })
            return
        }else{
            if(data.affectedRows===0){
                logger.warn(`数据库中没有书名为${bookname}的书籍`)
                res.json({
                    code:500,
                    message:`数据库中没有书名为${bookname}的书籍`
                })
                return
            }else{
                let sqlSort="ALTER TABLE "+type+" AUTO_INCREMENT = 1;"
                db.query(sqlSort,(err,data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log("删除并处理成功");
                        
                    }
                })
                logger.info("删除并处理成功")
                res.json({
                    code:200,
                    message:`${bookname}书籍信息删除成功`
                })
            }
        }
    })
}

/**
 * @description 查询书籍是否已存入收藏表
 * @method POST
 * @param bookname
 */

exports.queryHasStore= async(req, res, next)=>{
    if(req.method !== "POST"){
        logger.error("请求方式出错，该接口应为POST请求")
        res.json({
            code:500,
            message:"请求方式出错，该接口应为POST请求"
        })
        return
    }
    let {bookname} =req.body
    if(!bookname){
        logger.error("请求参数出错")
        res.json({
            code:500,
            message:"请求参数出错"
        })
        return
    }
    let sqlHasRead ='SELECT 1 FROM `hasRead` WHERE `bookname` = ? limit 1'
    let sqlCollection ='SELECT 1 FROM `collection` WHERE `bookname` = ? limit 1'

    let resParam={bookname:bookname}
    await db.query(sqlHasRead,bookname, (err,data)=>{
        if(err){
            logger.error({error:err,message:"数据库操作有误"});
            
            res.json({
                code:500,
                message:"数据库查询出错",
                data:err
            })
            return
        }else{
            if(utils.isEmpty(data)){
                resParam["hasRead"]=0
            }else{
                resParam["hasRead"]=1
            }
            
        }
    })
    await db.query(sqlCollection,bookname, (err,data)=>{
        if(err){
            res.json({
                code:500,
                message:"数据库查询出错",
                data:err
            })
            return
        }else{
            if(utils.isEmpty(data)){                
                resParam["collection"]=0
            }else{
                resParam["collection"]=1
            }
            res.json({
                code:200,
                data:resParam
            })
            logger.info("请求返回数据成功")
        }
    })
    
}
 
/**
 * @param 获取所有数据库信息
 * @method GET
 * @param {booktable} mysql中存储的数据库表名称
 */

exports.queryBookinfo = async (req, res, next)=>{
    logger.error("请求参数出错")
    if(req.method !== "GET"){
        res.json({
            code:500,
            message:"请求方式出错，该接口应为GET请求"
        })
        return
    }

    let booktable = req.query.booktable    
    if(!booktable){
        logger.error("booktable不能为空")
        res.json({
            code:500,
            message:"booktable不能为空"
        })
        return
    }
    
    db.query("select * from "+booktable,(error,data)=>{
        if(error){
            console.log(error);
            res.json({
                code:500,
                message:error
            })
            return
        }
        logger.info('查询书籍信息成功')
        res.json({
            code:200,
            message:"查询结果成功",
            data:data
        })
    })
}

/**
 * @method POST
 * @param {数据库表名称} booktable
 * @param {书籍名称} bookname
 * @param {修改值类型:hasRead|hasCollection} type
 */
exports.alterReadorCollect= async(req, res, next)=>{
    if(req.method !=="POST"){
        logger.error("请求方式出错， 应为POST请求")
        res.json({
            code:500,
            message:"请求方式出错， 应为POST请求"
        })
        return
    }
    let {booktable, bookname, type}=req.body
    let sql="update "+ booktable+" set "+type+" = ABS("+type+"-1) where `bookname` = ?" 
    db.query(sql,bookname,(err,data)=>{
        if(err){
            console.log(err);
            res.json({
                code:500,
                message:"sql语句有误",
                data:err
            })
            return
        }
        logger.info("修改成功")
        res.json({
            code:200,
            message:"修改成功",
            data:data
        })
    })
}

/**
 * @description 统一插入数据库表数据
 * @param {response}} res 
 * @param {查表语句} sql 
 * @param {书籍类型} bookType 
 * @param {书籍数据对象} bookdata 
 */

function insertToMysql(res, sql, bookType, bookdata) {
    //将图书信息对象取出放在数组中
    let dataValue = [], dataContent = []
    bookdata.forEach((element, index) => {
        let bookValue = [element.bookName, element.author, element.bookDescription, element.category, element.pictureUrl]
        let bookContent = [element.bookName, element.content, element.title]
        dataValue.push(bookValue)
        dataContent.push(bookContent)
    });

    try {
        //对新数组进行遍历，将所有数据存入数据库中
        dataValue.forEach(async (element, index) => {
            await db.query(sql, [element], (error) => {
                if (error) {
                    throw error
                } else {
                    logger.info(`第${index}条数据插入成功`)
                    console.log(`第${index}条数据插入成功`);
                }
            })
            
            await db.query('INSERT INTO `bookContent` (`bookname`,`content`,`title`) VALUES (?)',[dataContent[index]], (error)=>{
                if (error) {
                    throw error
                } else {
                    logger.info(`第${index}条文本插入成功`)
                    console.log(`第${index}条文本插入成功`);
                }
            })

        })
        
    } catch (error) {
        res.json({
            code: 500,
            message: error,
        })
        logger.error({error:error, interface:"insertToMysql"})
        console.log(error);
        return
    }

    logger.info(`将${bookType}类书籍存入mysql成功`)
    res.json({
        code: 200,
        message: `将${bookType}类书籍存入mysql成功`,
    })
}