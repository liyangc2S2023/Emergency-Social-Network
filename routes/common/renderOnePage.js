const messageController = require('../../controller/messageController');
const userController = require('../../controller/userController');
const date2Str = require('../../utils/dateUtil');
const pug = require('pug');

async function renderOnePage(req,res,pageView){
    // make user online
    await userController.login(req.username);

    // data preparation for chat page
    const statusMap = {
      undefined: 'circle outline icon',
      ok: '',
      help: '',
      emergency: '',
    };
    const messageList = await messageController.getAll();
    messageList.forEach((msg) => {
      msg.isSender = (req.username === msg.sender);
      msg.time = date2Str(new Date(msg.timestamp));
      msg.statusStyle = statusMap[msg.status];
    });

    // data preparation for directory page
    const userList = await userController.getAll();

    // render main page with all data
    res.render('mainPage', { pageView: pageView, users: userList , messages: messageList }); 

    const userListHTML = pug.renderFile('./views/directory.pug', { users: userList });
    req.io.emit('userlistChange', userListHTML);
}

module.exports=renderOnePage;