require('dotenv').config();
require('./database/db')();
const app = require('./index');




app.listen(process.env.PORT, process.env.IP, () => {
    console.log(`Listening on http://${process.env.IP}:${process.env.PORT}`);
})