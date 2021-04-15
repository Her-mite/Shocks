# Shocks
## express脚手架搭建
```
npm install express --save -g
npm install express-generator --save -g
express projectName
```

## 接口说明
* 获取所有股票的交易代码和名称
http://quote.eastmoney.com/stocklist.html可以展示所有股票的信息， 但是该网站做了ajax分页展示，故需要分步进行获取信息和存储到redis， 方便后续直接拿到股票信息的数据进行匹配<br/>
观察到后端在切换页面时发送url路由为http://81.push2.eastmoney.com/api/qt/clist/get?cb=jQuery1124016292370522610478_1618149249396&pn=1&pz=10&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f4,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f23&_=1618149249401形式，
 其中&pn为页面搜索关键字，即保证其他值不变，仅修改pn的值从1-222进行遍历. 
 该路由每页仅展示20个数据结果，url中&pz值同样为20， 故pz可能是请求中股票数量的参数， 故可以通过增大该值的方式单次获取更多数据来减少请求次数<br/>
 页面请求为222页， 每页20支股票， 但是最后一页仅有4只，所有股票总数量为221*20 + 4=4424支
 每次遍历500条数据， 共请求9次<br/>

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


