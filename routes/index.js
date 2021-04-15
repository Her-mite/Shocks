var express = require('express');
var router = express.Router();

// 后端交易入口
let allModule = {
  Stock:require('./Stock/stockDetail'),
  BookInfo: require('./Book/bookInfo'),
  BookContent: require('./Book/bookContent')
}

// 配置同一请求处理规则
router.all('/api/:module/:action', async (req, res, next) => {
  // 未找到接口报错
  if( !allModule[req.params.module][req.params.action] ){
    res.json({
      code:'404',
      message: `${req.params.module}模块的${req.params.action}接口未找到`
    })
    return;
  }

  //访问对应模块下接口，如果出错则在catch中返回对应出错信息
  try {
		await allModule[req.params.module][req.params.action](req, res, next);
	} catch (error) {
    if( error === 'method error'){
      res.json({
        code: 502,
        message: "接口请求方式出错, 请确认接口请求方式"
      });
      return;
    }
		console.log(error);
    res.json({
			code: 500,
			message: "接口调用方式出错，未取到正确参数！",
			data:error
		});
	}
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
