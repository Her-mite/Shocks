var express = require('express');
var router = express.Router();

// 后端交易入口
let allModule = {
  Stock:require('./Shock/shockDetail'),
  BookInfo: require('./Book/bookInfo'),
  BookContent: require('./Book/bookContent')
}

// 配置同一请求处理规则
router.all('/api/:module/:action', async (req, res, next) => {
  // 未找到接口报错
  if( !allModule[req.params.module][req.params.action] ){
    res.json({
      code:'404',
      message: `${allModule[req.params.module]}模块的${allModule[req.params.action]}接口未找到`
    })
    return;
  }

  //访问对应模块下接口，如果出错则在catch中返回对应出错信息
  try {
		await allModule[req.params.module][req.params.action](req, res, next);
	} catch (error) {
		console.log(error);
		let responseBody = {
			code: 500,
			message: "接口调用方式出错，未取到正确参数！",
			data:error
		}
    res.json(responseBody);
	}
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
