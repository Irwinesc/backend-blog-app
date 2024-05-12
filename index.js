'use stirct'

var mongoose = require('mongoose');

var app = require('./app');
var port = 3900;

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/api_rest_blog')
mongoose.connect('mongodb+srv://irwinescalante:k1rsvAWjCN9LZhRb@cluster0.aomktxm.mongodb.net/api_rest_blog?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => {
            console.log("La conexión a la base de datos se ha realizado correctamente")

            //crear servidor
            app.listen(port, () => {
                console.log('Servidor corriendo en http://localhost:'+port);
            })
});