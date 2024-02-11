const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public/pdfUploads");
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === "application/pdf") {
        callback(null, true);
    } else {
        callback(new Error("Solo se permite la carga de archivos PDF"), false);
    }
};

const pdfUpload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = pdfUpload;
