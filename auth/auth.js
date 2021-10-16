const Authentication = require('./Authentication');
const path = require('path');

async function lol() {
    const auth = new Authentication(path.join(__dirname, 'auth.json'));
    const username = 'xjarlie';
    const password = 'lol';
    const userToken = await auth.logIn(username, password);
    //const user = await auth.createAccount(username, password, console.log);
    console.log(userToken);

}

lol();