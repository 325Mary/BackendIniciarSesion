const Controller = {};

const {
  newCompanyService,
  getCompanies,
  deleteCompany,
  approveCompany,
  getCompaniesSuperUsuario
} = require("../services/company.service");

Controller.createCompany = async (req, res) => {
  try {
    const companyData = req.body;
    const pdfFile = req.file; // Obtener el archivo PDF subido
    const newCompany = await newCompanyService(companyData, pdfFile); // Pasar el archivo PDF a la función
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

Controller.approveCompany = async (req, res) => {
  const companyId = req.params.id;
  try {
    const approvedCompany = await approveCompany(companyId); // Corregir aquí
    res.status(200).json(approvedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

Controller.getCompanies = async (req, res) => {
  try {
    const companies = await getCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


Controller.deleteCompany = async (req, res) => {
  const idParam = req.params.idCompany;
  const response = await deleteCompany(idParam);
  res.send(response);
};

Controller.getCompaniesSuperU = async (req, res) => {
  const listCompanies = await getCompaniesSuperUsuario();
  res.json(listCompanies);
};


module.exports = Controller;
