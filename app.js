// 出错是打印出错信息
process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
// 捕获async异常
process.on('unhandledRejection', (reason, p) => {
    console.error('Caught Unhandled Rejection at:' + p + 'reason:' + reason.stack);
});

const web = require('./app/server')
web.start();
