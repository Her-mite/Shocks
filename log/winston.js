const winston = require('winston')

// 日志文件位置设置
const logConfiguration = {
    'transports': [
        new winston.transports.File({
            filename: './log/logs/backend.log'
        })
    ]
};
 
// 创建日志
const logger = winston.createLogger(logConfiguration);
 
module.exports=logger