const Company = require('../models/compay.model');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'litterbox212@gmail.com',
    pass: 'rtpr yunf crkt daif' // Aquí deberías usar variables de entorno
  }
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    to: to,
    subject: subject,
    html: html // Usamos HTML en lugar de texto plano
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw error;
  }
};

const newCompanyService = async (companyData, pdfFile) => {
  companyData.estado = 'pendiente'; // Establecer estado predeterminado
  try {
    if (pdfFile) {
      // Si se proporciona un archivo adjunto, asigna la ruta del archivo al campo pdfRunt
      companyData.pdfRunt = pdfFile.path;
    }

    const newCompany = await Company.create(companyData);
    
    // Construir el mensaje HTML excluyendo estado e ID
    const messageHtml = `
    <p>Los datos de la nueva empresa son:</p>
    <ul>
      <li>Nombre: ${newCompany.nameCompany}</li>
      <li>Teléfono: ${newCompany.telephone}</li>
      <li>NIT: ${newCompany.tenantId}</li>
      <li>Email: ${newCompany.email}</li>
      <li>Dirección: ${newCompany.direction}</li>
    </ul>
    `;

    // Enviar el correo electrónico con el mensaje HTML
    await sendEmail({
      to: 'litterbox212@gmail.com',
      subject: 'Solicitud de nueva empresa ',
      html: messageHtml
    });
    return newCompany;
  } catch (error) {
    throw new Error("Error al crear la empresa: " + error.message);
  }
};

const approveCompany = async (companyId) => {
  try {
    const company = await Company.findByIdAndUpdate(companyId, { estado: 'aprobado' }, );

    // Construir el mensaje HTML excluyendo estado e ID
    const messageHtml = `
      <h1>¡Tu empresa ha sido aprobada!</h1>
      <p>Detalles:</p>
      <ul>
      <li>Nombre de la EMPRESA: ${company.nameCompany}</li>
      <li>Teléfono de la Empresa: ${company.telephone}</li>
      <li>NIT: ${company.tenantId}</li>
      <li>Email de la Empresa: ${company.email}</li>
      <li>Dirección de la Empresa: ${company.direction}</li>
      <li>Runt: ${company.pdfRunt }</li>
      <p>*************************************<p> 
      <h2>Datos de usuario para Gerente <h2>
      <li>Usuario de gerente: ${company.email}
      <li>Contrseña: ${company.passwordManager}
    </ul>
    `;

    // Enviar el correo electrónico con el mensaje HTML
    await sendEmail({
      to: company.email,
      subject: 'Empresa aprobada',
      html: messageHtml
    });
    return company;
  } catch (error) {
    throw new Error("Error al aprobar la empresa: " + error.message);
  }
};


const getCompanies = async () => {
  try {
    
    const approvedCompanies = await Company.find({ estado: 'aprobado' });
    return approvedCompanies;
  } catch (error) {
    throw new Error("Error al obtener las empresas aprobadas: " + error.message);
  }
};

const getCompaniesSuperUsuario = async () => {
  try {
    
    const approvedCompanies = await Company.find();
    return approvedCompanies;
  } catch (error) {
    throw new Error("Error al obtener las empresas aprobadas: " + error.message);
  }
};

const deleteCompany = async (id) => {
  try {
    const company = await Company.findOne({ _id: id });
    if (company) {
      await Company.findOneAndDelete({ _id: id });
      return "Empresa eliminada con éxito";
    } else {
      return "No se encontró esta empresa";
    }
  } catch (error) {
    return "Ocurrió un error eliminando la empresa";
  }
};

module.exports = {
  newCompanyService,
  getCompanies,
  deleteCompany,
  approveCompany,
  getCompaniesSuperUsuario
};
