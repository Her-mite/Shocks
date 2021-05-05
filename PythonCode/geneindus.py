import xlrd
import matplotlib.pyplot as plt
import numpy as np


print("start python")

industry_price=[]
industry_name=[]
# 获取excel文件的workbook对象
excel = xlrd.open_workbook('/Users/hujq/Documents/code/nodejs/react/Stocks/板块详情.xls',encoding_override="utf-8")

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
