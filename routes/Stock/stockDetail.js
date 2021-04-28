const db = require('../../common/connect/mysql');
const logger = require('../../log/winston');
const getData = require('./Data/getStockData');

// 获取所有股票代码和名称
let GetAllShockName = async (req, res)=>{
    // if (req.method !== "GET") throw "method error";

    // logger.info("请求");
    let stocks_num = 500, stocks_sum = 4424; // 单次遍历股票数量和股票总数
    let traverse_time = stocks_sum/stocks_num + 1; // 遍历次数
    let result, convert_result
    console.log("遍历次数", traverse_time);
    
    try {
        result = await getData.getStockName(stocks_num, traverse_time); // 获取到初始数据
        convert_result = getData.convertData(result);   // 对初始数据进行处理(替换标题为具体含义)
        getData.geneExcel(convert_result);              // 对数据生成excel表
    } catch (error) {
        console.log(error)
    }

    // console.log(convert_result)
    // res.json({
    //     code:200,
    //     message:"数据返回成功",
    //     result: convert_result
    // })
}
GetAllShockName()