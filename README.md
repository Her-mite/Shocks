# 试试用python和nodejs爬虫获取股票数据并生成图表
## 获取所有股票的涨跌信息

### 1. 分析url接口

* 获取接口url

http://quote.eastmoney.com/stocklist.html是东方财富展示股票信息的一个网址，可以展示所有股票的信息。

根据NetWork的请求记录找到对应访问具体数据的请求url。

![截屏2021-05-05 上午9.39.10](/Users/hujq/Desktop/截屏2021-05-05 上午9.39.10.png)

url路由格式为http://81.push2.eastmoney.com/api/qt/clist/get?cb=jQuery1124016292370522610478_1618149249396&pn=1&pz=10&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f4,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f23&_=1618149249401形式

* 接口url参数分析

观察其中各项的值，当跳转页面为223页时，发现pn的值也等于223， 所以得知pn为请求页数的参数。另外， 该路由每页仅展示20个数据结果，url中&pz值同样为20， 故pz可能是一次请求中股票数量的参数， 故可以尝试通过增大该值的方式单次获取更多数据来减少请求次数。

根据页面展示效果， 搜索某股票的数值在前端页面展示和后台数据相同的，依次来判断url请求参数代表的含义，筛除不需要的部分。结果如下

各项参数含义
f2: 最新价格
f3: 涨跌幅
f4: 涨跌额
f5: 成交量
f6: 成交额
f7: 振幅
f8: 换手率
f9: 市盈率(动态)
f10:量比
f12:股票代码
f13:股票类型 1-上证 0-深证
f14:股票名称
f15:最高值
f16:最低值
f17:今开
f18:昨收
f23:市净率

### 2. 开始获取数据

根据上述url修改参数获取数据

```javascript
// stocks_num为每次请求数量500， traverse_time为遍历次数，现在共有四千多支股票信息，所有遍历次数为9
exports.getStockName = function async(stocks_num, traverse_time) {
   
  	// 网页请求为异步， 通过promise.all的方式将结果同步汇总后返回
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
                      	// 返回结果解析为JSON {"rc":0,"rt":6,"svr":182993995,"lt":1,"full":1,"data":{"total":4457,"diff":[{"f1":2,"f2":21.95,"f3":-12.2,"f4":-3.05,"f5":153195,"f6":347539808.0,"f7":10.8,"f8":38.39,"f9":45.28,"f10":0.67,"f11":-0.45,"f12":"300978","f13":0,"f14":"C东箭","f15":24.6,"f16":21.9,"f17":24.0,"f18":25.0,"f20":9278325121,"f21":875910492,"f22":-0.14,"f23":5.58,"f24":160.69,"f25":160.69,"f62":-71936162.0,"f115":43.71,"f128":"-","f140":"-","f141":"-","f136":"-","f152":2},]
                        let result_json = JSON.parse(html);
                        if (result_json['data']) {
                          	// 具体报文在data属性下的diff属性里（对象嵌套）
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
    console.log("获取原始信息")
    for (let page = 1; page < traverse_time; page++) {
        let url = `http://81.push2.eastmoney.com/api/qt/clist/get?cb=&pn=${page}&pz=${stocks_num}&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f23&_=1618149249401`
        // console.log(url)
        getAllShock.push(getSingleData(url))  
    }

    let allArray =  Promise.all(getAllShock);
    
    // 最后股票信息数组
    return allArray;
    
}
```

### 3. 数据处理

网页请求结果里报文有很多f2，f3之类的参数， 具体值代表的含义不够直观。对于结果属性参数进行替换

```javascript
// data为上一步的股票信息数组数据， 作为本函数的入参
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
    console.log("替换标题")
    data.forEach(singleArray => {
        if(typeof(singleArray) == 'object'){
            singleArray.forEach(element => {
                replaceTable.forEach(paramName => {
                    element = JSON.parse(JSON.stringify(element).replace(`${paramName[0]}`, `${paramName[1]}`))

                })
                final_result.push(element)
            })
            
        }


    });

    return final_result;
}
```



### 4. 生成EXCEL表格

```javascript
// 生成excel,
exports.geneExcel = function(convert_data) {
    
    // console.log("conver:", convert_data)
    console.log("将数据写入excel表")
    let data = [['最新价格','涨跌幅','涨跌额','成交量','成交额','振幅','换手率','市盈率(动态)','量比','股票代码','股票类型 1-上证 0-深证','股票名称','最高值','最低值','今开','昨收','市净率']];
    convert_data.forEach(element => {
        // 筛除ST退市警告和已退市的股票
        if( (element['股票名称'].indexOf('ST') == -1) && (element['股票名称'].indexOf('退') == -1)){
            data.push(Object.values(element));
        }
    });

    let buffer = xlsx.build([
        {
            name: '今日股票统计',
            data: data
        }
    ])
    fs.writeFileSync('今日股票分析.xlsx', buffer, {'flag': 'w'})

}
```

### 5. 通过Python将统计EXCEL表格内当日上涨和下跌家数

```python
import xlrd
import matplotlib.pyplot as plt
import numpy as np

print("start python")

# 定义各种涨跌幅股票数量， neg为-10~-8，-8~-6...， pos为0~2，2~4...
price_rank = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
zero = 0
stage=[-10, -8, -6, -4, -3, -2, -1, 0, 1, 2, 3, 4, 6, 8, 10]

# 获取excel文件的workbook对象
excel = xlrd.open_workbook('/Users/Documents/code/nodejs/react/Stocks/routes/Stock/今日股票分析.xlsx',encoding_override="utf-8")

# sheet表的list, 本excel只有一个sheet表， 取下标为0的sheet表即可
stock_data = excel.sheets()[0]

# excel表第二列为股票涨跌幅，下标为1
price = stock_data.col(1)
# 统计涨跌幅度在对应范围内的股票数量
for price_data in price[1:]:
    if( not isinstance(price_data.value,float)): # 遍历数组元素，取出其值， 转化为浮点型
        continue
    if float(price_data.value) <= -10:
        price_rank[0] += 1
    elif float(price_data.value >= 10):
        price_rank[13] += 1
    else:
        for i in range(13):
            if float(price_data.value)>=stage[i] and float(price_data.value)<stage[i+1]:
                price_rank[i] += 1
                break

# 打印涨跌幅的家数的数组
print(price_rank)

pos_num=neg_num=0
for i in range(0, len(price_rank)):
    if(i < 7):
        neg_num += price_rank[i]
    else:
        pos_num += price_rank[i]
print('pos:', pos_num, 'neg', neg_num)

x = np.arange(14)
y = price_rank
all = np.append(np.array([0,0,0,0,0,0,0]),np.array(price_rank[7:14]))

labels_neg=['-8%~跌停','-8%~-6%','-6%~-4%','-4%~-3%','-3%~-2%','-2%~-1%','-1%~0']
labels_pos=['-8%~跌停','-8%~-6%','-6%~-4%','-4%~-3%','-3%~-2%','-2%~-1%','-1%~0', '0~1%','1%~2%','2%~3%','3%~4%','4%~6%','6%~8%','8%~涨停',]

barlist_neg = plt.bar(x=np.arange(7), height=y[0:7], label='下跌家数: %d'%neg_num,  width=0.5,)
barlist_pos = plt.bar(x=np.arange(14), height=all, label="上涨家数: %d"%pos_num, color='#E53935', width=0.5, tick_label=labels_pos)

# 上涨和下跌的股票划分为不同的颜色
for i in range( 0, 7):
    barlist_neg[i].set_color("#44855F")

for i in range(7, 14):
    barlist_pos[i].set_color("#E53935") # 设置柱状图颜色

# 取消边框显示
ax = plt.gca()
ax.spines['right'].set_color('none')
ax.spines['top'].set_color('none')
ax.spines['left'].set_color('none')
ax.set_axisbelow(True) #将网格线至于主图下方
plt.rcParams['font.sans-serif']=['SimHei'] #显示中文标签
plt.rcParams['axes.unicode_minus']=False
plt.grid(axis="y", ls='--') # 设置横向虚线


# 在柱状图上显示具体数值, ha参数控制水平对齐方式, va控制垂直对齐方式
plt.xticks(fontsize=6)
plt.yticks(fontsize=8)

for x1, yy in zip(x, y):
    plt.text(x1, yy + 1, str(yy), ha='center', va='bottom', fontsize=8)
plt.title("今日股市涨跌分布情况", fontsize=12)

# 显示图例
plt.legend()

plt.savefig('./今日股市涨跌分布情况.jpg', dpi=300)
plt.show()

```

结果如下：

<img src="/Users/hujq/Documents/code/nodejs/react/Stocks/今日股市涨跌分布情况.jpg" alt="今日股市涨跌分布情况" style="zoom:25%;" />

## 获取板块涨跌情况（Python）

### 1. url接口分析

http://q.10jqka.com.cn/thshy/这回使用的是同花顺行情中心的url。选择任意一个板块点开， 跳转页面的路由为http://q.10jqka.com.cn/thshy/detail/code/8811xx （共有66个板块， 最后两位值为1-66的板块对应值，可以通过elements的所有板块路由url的结果直观看出）

### 2. 数据获取

```python
# python爬虫获取网页数据
import requests
import xlwt
from fake_useragent import UserAgent
from bs4 import BeautifulSoup

# 增加浏览器请求头
ua = UserAgent()
headers = {'User-Agent': ua.chrome}

def get_url_message(url, industry_info):
    print("url", url)
    response = requests.get(url, headers=headers).text

    # 将源码转换为xpath可以识别的HTML格式
    soup = BeautifulSoup(response, 'lxml')
    # print("soup", soup)


    # 元素选择器：.class ,   #id

    # 获取板块名称信息
    industry_name = soup.h3.contents[0]
    print(industry_name)

    industryArray =  soup.select('.board-infos dl dd')
    detailArray = [industry_name]
    for industry in industryArray:
        if(industry.select('span')): # 上涨/下跌家数
            detailArray.append(industry.select('span')[0].string)
            detailArray.append(industry.select('span')[1].string)
        else: # 其他板块信息
            industryDetail = industry.string
            detailArray.append(industryDetail)
    
    industry_info.append(detailArray)
    # print(industry_info)
    return industry_info



def write_excel_xls(industry_info):
    print("jnew", industry_info)
    file_name = "板块详情.xls"
    sheet_name = "sheet"

    index = len(industry_info)  # 获取需要写入的列数
    workbook = xlwt.Workbook()  # 新建一个工作簿
    sheet = workbook.add_sheet(sheet_name)  # 新建一个工作表
 
    for i in range(0, index):
        for j in range(0, len(industry_info[i])):
            sheet.write(i, j, industry_info[i][j])  # 像表格中写入数据（对应的行和列）
    workbook.save(file_name)  # 保存工作簿
 
    print("xls格式表格写入数据成功！")
 




industry_info=[['板块', '今开', '昨收', '最低', '最高', '成交量(万手)', '板块涨幅', '涨幅排名', '上涨家数','下跌家数', '资金净流入(亿)','成交额(亿)' ]]
for i in range(1,67): # 共66个板块
    url = 'http://q.10jqka.com.cn/thshy/detail/code/8811' +  str(i).zfill(2)        # 板块url 最后参数为编码， 前4位一致， 后两位从01-66
    industry_info = get_url_message(url, industry_info) # 获取每个板块的信息存入数组

# 生成excel表格
write_excel_xls(industry_info)


```

### 3. 生成图像信息

```python
import xlrd
import matplotlib.pyplot as plt
import numpy as np


print("start python")

industry_price=[]
industry_name=[]
# 获取excel文件的workbook对象
excel = xlrd.open_workbook('/Users/Documents/code/nodejs/react/Stocks/板块详情.xls',encoding_override="utf-8")

# sheet表的list, 本excel只有一个sheet表， 取下标为0的sheet表即可
stock_data = excel.sheets()[0]

# 获取第1,7列数组(板块名和涨跌幅)
industry = stock_data.col(0)
price = stock_data.col(6)

# 存储板块名数组
for industry_data in industry[1:]:
    industry_name.append(industry_data.value)

# 存储涨跌幅数组
for price_data in price[1:]:
    industry_price.append(float(price_data.value[0:-1])) #  剪切掉最后的% ，再转化为浮点型，将结果存入数组



print(industry_price)
print(industry_name)

x = industry_name
y = industry_price

barlist_pos = plt.bar(x=x, height=y, color= '#E53935', width=0.5)

for x1, yy in zip(x, y):
    plt.text(x1, yy , str(yy), ha='center', va='bottom', fontsize=6)
plt.title("今日板块涨跌分布情况", fontsize=12)

plt.xticks(rotation=60,fontsize=6)




#显示中文标签
plt.rcParams['font.sans-serif']=['SimHei']
plt.rcParams['axes.unicode_minus']=False

for i in range(0, 66):
    if(industry_price[i] > 0):
        barlist_pos[i].set_color("#E53935") # 设置柱状图颜色
    else:
        barlist_pos[i].set_color("#44855F") # 设置柱状图颜色



plt.savefig('./今日板块涨跌分布情况.jpg', dpi=300)
plt.show()

```

结果展示

<img src="/Users/hujq/Documents/今日板块涨跌分布情况.png" alt="今日板块涨跌分布情况" style="zoom:25%;" />