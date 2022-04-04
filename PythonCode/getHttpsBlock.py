# -*- coding: utf-8 -*-
# 获取板块信息
# 读取excel数据
# 遍历数组查询股票对应板块并计数
from cmath import log
import requests
import sys
from requests.api import head
import xlrd
import xlwt
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import json
import time


# 读取excel数据
def get_excel_data():
    file_path = sys.path[0] + "/待统计股票.xlsx"
    excel_data = xlrd.open_workbook(file_path, encoding_override="utf-8")

    # sheet表的list, 本excel只有一个sheet表， 取下标为0的sheet表即可
    stock_data = excel_data.sheets()[0]

    stock_nums = stock_data.col(0)  # 股票编码

    stocks = []  # 待遍历股票
    # 获取第0,1列数组(板块名和涨跌幅)
    for index in range(len(stock_nums)):
        stocks.append(stock_nums[index].value)

    return stocks


# 请求https数据
def query_https_data(stocks, timestamp):
    plate_dict = {}  # 板块出现结果统计
    timestamp = str(int(time.time())) # 时间戳
    number_map = {'6': '1', '3': '0', '0': '4'} # 4.0xxxxx 0.6xxxxx 1.3xxxxx

    ua = UserAgent()
    headers = {
        # 'Host': 'd.10jqka.com.cn',
        "User-Agent": ua.chrome
        # "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit 537.36 (KHTML, like Gecko) Chrome"
    }
    # headers = {"User-Agent": ua.chrome}
    # http://d.10jqka.com.cn/v4/stockblock/hs_300487/last.js
    # https://push2.eastmoney.com/api/qt/slist/get?cb=jQuery183001964927708371267_1642519066432&pn=1&pz=24&po=1&spt=3&fields=f14&secid=0.300059
    # url = 'http://push2.eastmoney.com/api/qt/slist/get?cb=jQuery183001964927708371267_1641399337432&pn=1&pz=6&po=1&fid=f3&spt=3&fields=f14&secid=0.300059&invt=2&fltt=2&_=1641399337891'
    # url = f'https://push2.eastmoney.com/api/qt/slist/get?cb=jQuery183001964927708371267_1642519066432&pn=1&pz=24&po=1&spt=3&fields=f14&secid=0.300059'

    for stock in stocks:
        first_number = stock[2:3]
        # print('first_number', first_number, number_map[first_number])
        stock_num = stock[2:]
        stock_pre = number_map[first_number]

        # 开始请求
        # url = 'http://d.10jqka.com.cn/v4/stockblock/hs_300487/last.js'
        # response = '<html><body><p>quotebridge_v4_stockblock_hs_300487_last({"items":[{"10":"2921.789","264648":"24.168","199112":"0.834","name":"\u9655\u897f","id":882025},{"10":"1563.632","264648":"23.870","199112":"1.550","name":"\u9502\u7535\u6c60","id":885710},{"10":"3270.478","264648":"52.513","199112":"1.632","name":"\u65b0\u6750\u6599\u6982\u5ff5","id":885544},{"10":"4701.158","264648":"60.290","199112":"1.299","name":"\u5316\u5de5\u5408\u6210\u6750\u6599","id":881110},{"10":"1711.160","264648":"5.439","199112":"0.319","name":"\u76d0\u6e56\u63d0\u9502","id":885922},{"10":"1098.976","264648":"23.322","199112":"2.168","name":"\u4e13\u7cbe\u7279\u65b0","id":885929},{"10":"2240.052","264648":"8.534","199112":"0.382","name":"\u5c0f\u91d1\u5c5e\u6982\u5ff5","id":885552},{"10":"1338.616","264648":"20.941","199112":"1.589","name":"\u540c\u82b1\u987a\u5168A","id":883957},{"10":"2067.647","264648":"29.187","199112":"1.432","name":"\u767e\u5143\u80a1","id":883916},{"10":"1160.949","264648":"18.469","199112":"1.617","name":"\u6df1\u80a1\u901a","id":885694},{"name":"\u5408\u6210\u6811\u8102","id":884212},{"10":"1896.214","264648":"25.199","199112":"1.347","name":"QFII\u91cd\u4ed3","id":883924},{"10":"1686.395","264648":"25.779","199112":"1.552","name":"\u542b\u53ef\u8f6c\u503a","id":883980},{"10":"1498.118","264648":"4.697","199112":"0.315","name":"\u5de5\u4e1a\u5927\u9ebb","id":885818},{"10":"1682.832","264648":"20.979","199112":"1.262","name":"\u793e\u4fdd\u91cd\u4ed3","id":883922},{"10":"1841.423","264648":"16.567","199112":"0.908","name":"\u56fa\u5e9f\u5904\u7406","id":885410}]})</p></body></html>'
        url = f'http://push2.eastmoney.com/api/qt/slist/get?cb=jQuery183001964927708371267_{timestamp}432&pn=1&pz=20&po=1&fid=f3&spt=3&fields=f14&secid={stock_pre}.{stock_num}&invt=2&fltt=2&_=1641399337891'
        # print('url', url)
        response = requests.get(url, headers=headers).text
        # response = '<html><body><p>jQuery183001964927708371267_1643125453432({"rc":0,"rt":18,"svr":182995003,"lt":1,"full":1,"data":{"total":24,"diff":{"0":{"f14":"茅指数"},"1":{"f14":"基金重仓"},"2":{"f14":"深证100R"},"3":{"f14":"HS300_"},"4":{"f14":"MSCI中国"},"5":{"f14":"证金持股"},"6":{"f14":"券商概念"},"7":{"f14":"创业成份"},"8":{"f14":"深成500"},"9":{"f14":"富时罗素"},"10":{"f14":"预盈预增"},"11":{"f14":"深股通"},"12":{"f14":"参股期货"},"13":{"f14":"转债标的"},"14":{"f14":"融资融券"},"15":{"f14":"互联金融"},"16":{"f14":"长江三角"},"17":{"f14":"上海板块"},"18":{"f14":"创业板综"},"19":{"f14":"网红直播"}}}});</p></body></html>'

        soup = BeautifulSoup(response, 'lxml')  # 格式化返回报文
        # print(soup)
        spans = soup.select('p')[0].text
        # print(spans)
        items = spans.split('(')[1].split(')')[0]
        # print(items)
        json_items = json.loads(items)
        # 获取到对象
        print(stock_num, json_items['data']['diff'].values())
        plates_array = []
        for item in json_items['data']['diff'].values():  # 遍历二维数组
            plates_array.append(item['f14'])
        for plate in plates_array:
            if (plate in plate_dict):  # 若存在则将其值加1
                plate_dict[plate] = plate_dict[plate] + 1
            else:  # 若字典中不存在则加入并赋值为1
                plate_dict[plate] = 1
    sorted_plate_dict = sorted(plate_dict.items(),
                               key=lambda d: d[1],
                               reverse=True)
    # print(sorted_plate_dict)

    # 写入到excel表
    file_name = '板块结果统计.xls'
    sheet_name = '统计详情'
    workbook = xlwt.Workbook()  # 新建一个工作簿
    sheet = workbook.add_sheet(sheet_name)  # 新建一个工作表

    for i in range(0, len(sorted_plate_dict)):
        for j in range(0, 2):
            sheet.write(i, j, sorted_plate_dict[i][j])
    workbook.save(file_name)

    print('数据写入成功')


if __name__ == '__main__':
    stocks = get_excel_data()  # 获取需要请求的股票数组
    timestamp = str(int(time.time()))

    query_https_data(stocks, timestamp)
