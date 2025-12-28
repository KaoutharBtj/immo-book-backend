const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) =>  {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter= (req, file, cb) => {
        const allowedTypes = /jpg|jpeg|png/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimtype = allowedTypes.test(file.mimetype);

        if(extname && mimtype) {
            cb(null, true);
        }else{
            cb(new Error('Seules les images sont autorisées!'));
        }
    };

    const upload= multer({
        storage: storage,
        limits: {fileSize: 5 * 1024 * 1024},
        fileFilter: fileFilter
    });


    module.exports = upload;