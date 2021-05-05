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
        if(industry.select('span')):
            detailArray.append(industry.select('span')[0].string)
            detailArray.append(industry.select('span')[1].string)
        else:
            industryDetail = industry.string
            detailArray.append(industryDetail)
    
    industry_info.append(detailArray)
    # print(industry_info)
    return industry_info



def write_excel_xls(industry_info):
    print("jnew", industry_info)
    file_name = "板块详情3.xls"
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
for i in range(61,67): # 共66个板块
    url = 'http://q.10jqka.com.cn/thshy/detail/code/8811' +  str(i).zfill(2)        # 板块url 最后参数为编码， 前4位一致， 后两位从01-66
    industry_info = get_url_message(url, industry_info) # 获取每个板块的信息存入数组

# 生成excel表格
write_excel_xls(industry_info)

