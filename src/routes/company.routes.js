const express = require('express');
const router = express.Router();
const pdfUpload = require('../middleware/pdfmulder');
const validarTokenMiddleware = require('../middleware/userAuthentication')
const checkRol = require('../middleware/roleAuth')

const {
    getCompanies,
    createCompany,
    deleteCompany,
    approveCompany,
    getCompaniesSuperU
} = require("../controlller/company.controller");

router.get("/getAllCompanies", getCompanies);
router.get('/GetCompaniesSuperU/',validarTokenMiddleware, checkRol(['SuperUsuario']) , getCompaniesSuperU)
router.post("/saveNewCompany", pdfUpload.single('pdfRunt'), createCompany);
router.put('/companies/:id/approve', approveCompany);
router.delete("/deleteCompany/:idCompany", deleteCompany);

module.exports = router;
