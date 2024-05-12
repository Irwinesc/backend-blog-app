'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');
const params = require('../app');

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            curso: 'Master en Framework JS',
            autor: 'Irwin Escalante',
            url: 'irwin.escalante.com',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        //recoger parametros por post
        var params = req.body;

        //validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });

        }

        if (validate_title && validate_content) {
            //Crear objeto a guardar
            var article = new Article();
            //Asignar valores
            article.title = params.title;
            article.content = params.content;

            if (params.image) {
                article.image = params.image;
            } else {
                article.image = null;
            }

            //Guardar el articulo
            article.save()
                .then(() => {
                    return res.status(200).send({
                        status: 'success',
                        article: article
                    });
                }).catch(error => {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado.'
                    });
                });

        } else {
            return res.status(500).send({
                status: 'error',
                message: 'Los datos no son validos !!!'
            });
        }

    },

    getArticles: (req, res) => {
        var query = Article.find({});
        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        };
        //find
        query.sort('-_id').exec().then(articles => {
            if (articles) {
                return res.status(200).send({
                    status: 'success',
                    articles
                })
            } else /* !articles */ {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar !!!'
                })
            }
        }).catch(err => (res.status(500).send({
            status: 'error',
            message: 'Error al devolver los articulos !!!'
        })))

    },

    getArticle: (req, res) => {
        //Recoger el id de la url
        var articleId = req.params.id;
        //Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo !!!'
            });
        }
        //Buscar el articulo
        Article.findById(articleId).then(article => {
            if (article) {
                return res.status(200).send({
                    status: 'success',
                    article
                })
            } else /*!article */ {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo !!!'
                })
            }
        }).catch(err => res.status(500).send({
            status: 'error',
            message: 'Error al obtener el articulo !!!'
        }))
    },

    update: (req, res) => {
        //Recoger el id del articulo por la url
        var articleId = req.params.id;
        //Recoger los datos que llegan por put
        var params = req.body;
        //Validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content)
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        if (validate_title && validate_content) {
            //Buscar el articulo y actualizar
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true })
                .then(articleUpdated => {
                    if (articleUpdated) {
                        return res.status(200).send({
                            status: 'success',
                            article: articleUpdated
                        })
                    } else /* ! aarticleUpdated */ {
                        return res.status(404).send({
                            status: 'error',
                            message: 'No existe el articulo !!!'
                        })
                    }
                }).catch(err => res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar !!!'
                }));

        } else {
            //Devolver la respusta
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
            });

        };
    },

    delete: (req, res) => {
        //Recoger el id de la url
        var articleId = req.params.id;
        //Find and delete
        Article.findOneAndDelete({ _id: articleId })
            .then(articleRemoved => {
                if (articleRemoved) {
                    return res.status(200).send({
                        status: 'success',
                        article: articleRemoved
                    })
                } else /*(!articleRemoved)*/ {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se ha borrado el articulo, pude que no exista'
                    })
                }
            }).catch(err =>
                res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                }))
    },

    upload: (req, res) => {
        //Configurar el modulo connect multiparty router/article.js (hecho)

        //Recoger el fichero de la petición
        var file_name = 'Imagen no subida...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: 'file_name'
            });
        }

        //Conseguir nombre y la extensión del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // * ADVERTNECIA * EN LINUX O MAC
        // var file_split = file_path.split('/')'

        //Nombre del archivo
        file_name = file_split[2];

        //Extensión del archivo
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //Comprobar la extensión, solo imagenes, borrar archivo si no
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {

            //borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(422).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es valida !!!'
                });
            });

        } else {
            //Si todo es valido, sacando id de la url
            var articleId = req.params.id;

                    if(articleId){
                         //Buscar el archivo y asignarle el nombre de la imagen y actualizarlo
                    Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true})
                    .then(articleUpdated => {
                        if (articleUpdated){
                            return res.status(200).send({
                                status: 'success',
                                article: articleUpdated
                            })
                        } else { /*(!articleUpdated)*/
                            return res.status(404).send({
                                status: 'error',
                                message: 'Error al guardar la imagen del archivo'
                            })
                        }}).catch(err => res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar la imagen del archivo'
                        }))
                    }else {
                        return res.status(200).send({
                            status: 'success',
                            image: file_name
                        })
                    }

                }
            }, // end upload file

    uploadImage: (req, resp) => {
        if (!req.file) {
            return resp.status(404).send({
                status: status[404],
                message: "No se ha encontrado ninguna imagen para subir."
            });
        }
 
        var file_path = req.file.path;
        var file_split = file_path.split("\\");
        var file_name = file_split[2];
        var extension_split = file_name.split(".");
        var file_ext = extension_split[extension_split.length - 1];
 
        if (!file_ext.match(/(jpg|jpeg|png|gif)$/i)) {
            fs.unlink(file_path, (err) => {
                return resp.status(422).send({
                    status: status[422],
                    message: "El tipo de extension del archivo no es valido para esta solicitud."
                });
            });
        } else {
            var article_id = req.params.id;
 
            if (article_id) {
                Article.findOneAndUpdate({ _id: article_id }, { image: file_name }, { new: true })
                    .then((articleUpdated) => {
                        return resp.status(200).send({
                            status: status[200],
                            article: articleUpdated
                        });
                    })
                    .catch((err, article) => {
                        if (!article) {
                            return resp.status(404).send({
                                status: status[404],
                                message: "No existe el articulo especificado."
                            });
                        } else {
                            return resp.status(500).send({
                                status: status[500],
                                message: "Error al guardar la imagen del articulo."
                            });
                        }
                    });
            } else {
                return resp.status(200).send({
                    status: status[200],
                    image: file_name
                }); 
            }
        }
    },

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        });
    },

    search: (req, res) => {
        //sacar el string a buscar 
        var searchString = req.params.search;

        //find or
        Article.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        })
            .sort([['date', 'descending']])
            .exec()
            .then(articles => {
                if (articles && articles.length > 0) {
                    return res.status(200).send({
                        status: 'success',
                        articles
                    })
                } else {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay articulos que coincidan con tu busqueda !!!'
                    })
                }
            }).catch(err => res.status(500).send({
                status: 'error',
                message: 'Error en la petición',
                err
            }))
    },
}; // end controller

module.exports = controller;