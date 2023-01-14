const request = require('request');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.initialize();

client.on('loading_screen', (percent) => {
    console.log('LOADING %i%', percent);
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    // console.log('DETAIL MESSAGE : ', message);
    console.log('====================================');
    console.log('FROM    : ', message.from);
    console.log('TO      : ', message.to);
    console.log('MESSAGE : ', message.body);
    // console.log('CONTACT : ', await client.getContacts());

    if (message.body === 'hi') {
        // Send a new message to the same chat
        client.sendMessage(message.from, 'hello');

    } else if (message.body.startsWith('!join ')) {
        const inviteCode = message.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            message.reply('Joined the group!');
        } catch (e) {
            message.reply('That invite code seems to be invalid.');
        }
    } else if (message.body.startsWith('!sendto ')) {
        let number = message.body.split(' ')[1];
        let textIndex = message.body.indexOf(number) + number.length;
        let text = message.body.slice(textIndex, message.body.length);
        if (number.slice(0, 1) == '0'){
            number = `62${number.slice(1)}`;
        }
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        const chat = await message.getChat();
        chat.sendSeen();
        client.sendMessage(number, text);
    } else if(message.body.startsWith('!broadcast ')) {
        let numbers = message.body.split(' ')[1];

    } else if(message.body.startsWith('!getContacts')) {
        let contacts = await client.getContacts();
        console.log("=====================")
        contacts.forEach(function (item, index) {
          console.log(item.id);
          console.log(item.number);
        });
        await client.sendMessage(message.from, contacts);

    } else if(message.body.startsWith('!check')) {

        var result = 'empty';
        function doRequest(url) {
          return new Promise(function (resolve, reject) {
            request({
                url: url,
                method: 'POST'
            }, function (error, res, body) {
              if (!error && res.statusCode === 200) {
                resolve(body);
              } else {
                reject(error);
              }
            });
          });
        }
        try{
            result = await doRequest('http://127.0.0.1:105/get_services/');
            result = JSON.parse(result);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
        await client.sendMessage(message.from, result.status);
        
    }

});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});
 


 