const { adminService } = require ("../../BusinessLayer/services");

const createSuperAdmin = async(name, email, password) => {
    const credentials = await adminService.createSuperAdmin(name, email, password);

    console.log(credentials);
};

module.exports = createSuperAdmin;