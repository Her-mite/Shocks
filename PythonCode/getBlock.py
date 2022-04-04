# -*- coding: utf-8 -*-
# 获取板块信息
# 读取excel数据
# 遍历数组查询股票对应板块并计数
import requests
import os
import sys
from requests.api import head
import xlrd
import xlwt
from fake_useragent import UserAgent
from bs4 import BeautifulSoup


# 读取excel数据
def get_excel_data():
    # abs_path = os.path.dirname(os.path.realpath(sys.executable))#os.path.abspath(os.path.dirname(__file__))
    file_path =sys.path[0] + "/待统计股票.xlsx"
    print("file_path", file_path)
    excel_data = xlrd.open_workbook(file_path,encoding_override="utf-8")
    # excel_data = xlrd.open_workbook(abs_path + '/待统计股票.xlsx',encoding_override="utf-8")

    # sheet表的list, 本excel只有一个sheet表， 取下标为0的sheet表即可
    print(excel_data.sheets())
    stock_data = excel_data.sheets()[0]
    
    stock_nums = stock_data.col(0) # 股票编码
    # stock_flags = stock_data.col(1) # 是否选择

    stocks = [] # 待遍历股票
    # 获取第0,1列数组(板块名和涨跌幅)
    for index in range(len(stock_nums)):
        # if(stock_flags[index].value==1.0):
        stocks.append(stock_nums[index].value)

    return stocks

# 请求股票数据
def query_stock_data(stocks):
    ua= UserAgent()
    headers = {'User-Agent': ua.chrome}
    url_pre = 'http://stockpage.10jqka.com.cn/'
    url_job_pre = 'http://basic.10jqka.com.cn/' # 300261/field.html
    
    plate_dict = {} # 板块出现结果统计
    for stock in stocks:
        # jobs='三级行业分类:机械设备 -- 通用设备 -- 其他通用设备 （共35家）'
        # plates = '芯片概念，新能源汽车，科创次新股，新股与次新股，特斯拉，汽车电子，融资融券'
        # area = 'eeee'
        # print(jobs, plates, area)

        # 获取板块信息
        url=url_pre+stock[2:]
        response = requests.get(url, headers=headers).text
        soup = BeautifulSoup(response, 'lxml')
        plates = soup.select('.company_details dd')[1].attrs["title"] # 单个板块名称数组
        area = soup.select('.company_details dd')[0].text # 地区

        # url获取二级板块
        url_job= url_job_pre+stock[2:]+'/field.html'
        response_job = requests.get(url_job, headers=headers)
        response_job.encoding = 'GBK'
        soup_job =BeautifulSoup(response_job.text,'lxml')
        jobs = soup_job.select('.bd.pr > .field_wraper > .threecate.fl')[0].text
        job_array = jobs.split(' -- ')
        job_array[0] = job_array[0].split('：')[1]

        # 未找到板块信息
        if('--' in plates ):
            continue
        # 整合板块、地区、行业数据
        plates_array = plates.split('，') # 拆分字符串为数组 
        plates_array.append(area) # 加上地区
        plates_array.append(job_array[0]) # 一级行业
        plates_array.append(job_array[1]) # 二级行业
        print(plates_array)
        
        for plate in plates_array:
            if(plate in plate_dict):    # 若存在则将其值加1
                plate_dict[plate] = plate_dict[plate] + 1
            else:                       # 若字典中不存在则加入并赋值为1
                plate_dict[plate] = 1

    print("plate_dict:", plate_dict)
    # 降序排序
    sorted_plate_dict= sorted(plate_dict.items(), key=lambda d:d[1], reverse = True)
    print(sorted_plate_dict)
    # 写入到excel表
    file_name = '板块结果统计.xls'
    sheet_name = '统计详情'
    workbook = xlwt.Workbook()  # 新建一个工作簿
    sheet = workbook.add_sheet(sheet_name) # 新建一个工作表
    
    for i in range(0, len(sorted_plate_dict)):
        for j in range(0, 2):
            sheet.write(i, j, sorted_plate_dict[i][j])
    workbook.save(file_name)

    print('数据写入成功')



if __name__ == '__main__':
    # main()
    stocks = get_excel_data() # 获取需要请求的股票数组
    query_stock_data(stocks)