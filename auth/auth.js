const Authentication = require('./Authentication');
const path = require('path');

async function lol() {
    const auth = new Authentication(path.join(__dirname, 'auth.json'));
    let user = await auth.logIn('xjarlie2', 'lol');
    //const user = await auth.createAccount('xjarlie3', 'lol');
    console.log(await user.getToken());
    console.log(user);
}

lol();