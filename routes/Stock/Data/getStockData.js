const http = require('http');
const fs = require('fs')
const xlsx = require('node-xlsx');

exports.getStockName = function async(stocks_num, traverse_time) {
   
    function getSingleData(url){
        return new Promise(function(resolve, reject){
            try {
                // http获取所有股票代码和名称
                http.get(url, function (req, res) {
                    let html = '';
                    req.on('data', function (data) {
                        html += data;
                    });
                    req.on('end', function () {
                        let result_json = JSON.parse(html);
                        if (result_json['data']) {
                            let result_array = result_json['data']['diff'];
                            resolve(result_array);
                        }else {
                            resolve("unknown")
                        }
                    });
                });
            } catch (error) {
                console.log(error)
            }
        })
        
    }

    let getAllShock = [];

    for (let page = 1; page < traverse_time; page++) {
        let url = `http://81.push2.eastmoney.com/api/qt/clist/get?cb=&pn=${page}&pz=${stocks_num}&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f23&_=1618149249401`
        console.log(url)
        getAllShock.push(getSingleData(url))  
    }

    let allArray =  Promise.all(getAllShock);
    
   
    return allArray;
    
}

exports.convertData = function(data){
     // 结果名称替换表格
     let replaceTable = [
        ["f2", "最新价格"],
        ["f3", "涨跌幅"],
        ["f4", "涨跌额"],
        ["f5", "成交量"],
        ["f6", "成交额"],
        ["f7", "振幅"],
        ["f8", "换手率"],
        ["f9", "市盈率(动态)"],
        ["f10","量比"],
        ["f12","股票代码"],
        ["f13","股票类型 1-上证 0-深证"],
        ["f14","股票名称"],
        ["f15","最高值"],
        ["f16","最低值"],
        ["f17","今开"],
        ["f18","昨收"],
        ["f23","市净率"],
    ]

    // console.log(data)
    let final_result = [];
    data.forEach(singleArray => {
        if(typeof(singleArray) == 'object'){
            singleArray.forEach(element => {
                replaceTable.forEach(paramName => {
                   
                    // element = JSON.parse(JSON.stringify(element).replace(`${paramName[0]}`, `${paramName[1]}`))
                    element = JSON.parse(JSON.stringify(element).replace(`${paramName[0]}`, `${paramName[1]}`))

                })
                final_result.push(element)
            })
            
        }


        // this.newObj= JSON.parse(JSON.stringify(obj).replace(/age/g, 'nianl'));
    });
    // console.log("new",final_result)

    return final_result;
}

// 生成excel
exports.geneExcel = function(convert_data) {
    console.log("geneExcle")
    let data = [['最新价格','涨跌幅','涨跌额','成交量','成交额','振幅','换手率','市盈率(动态)','量比','股票代码','股票类型 1-上证 0-深证','股票名称','最高值','最低值','今开','昨收','市净率']];
    convert_data.forEach(element => {
        data.push(Object.values(element));
    });

    let buffer = xlsx.build([
        {
            name: '今日股票统计',
            data: data
        }
    ])
    fs.writeFileSync('今日股票分析.xlsx', buffer, {'flag': 'w'})

}