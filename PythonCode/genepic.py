import xlrd
import matplotlib.pyplot as plt
import numpy as np


print("start python")

# 定义各种涨跌幅股票数量， neg为-10~-8，-8~-6...， pos为0~2，2~4...
price_rank = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
zero = 0
stage=[-10, -8, -6, -4, -3, -2, -1, 0, 1, 2, 3, 4, 6, 8, 10]

# 获取excel文件的workbook对象
excel = xlrd.open_workbook('/Users/hujq/Documents/code/nodejs/react/Stocks/routes/Stock/今日股票分析.xlsx',encoding_override="utf-8")

# sheet表的list, 本excel只有一个sheet表， 取下标为0的sheet表即可
stock_data = excel.sheets()[0]

# excel表第二列为股票涨跌幅，下标为1
price = stock_data.col(1)
for price_data in price[1:]:
    if( not isinstance(price_data.value,float)):
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

plt.grid(axis="y", ls='--') # 设置横向虚线


# 在柱状图上显示具体数值, ha参数控制水平对齐方式, va控制垂直对齐方式
plt.xticks(fontsize=6)
plt.yticks(fontsize=8)

for x1, yy in zip(x, y):
    plt.text(x1, yy + 1, str(yy), ha='center', va='bottom', fontsize=8)
plt.title("今日股市涨跌分布情况", fontsize=12)

# 显示图例

plt.legend()

plt.savefig('./test2.jpg', dpi=300)
plt.show()
