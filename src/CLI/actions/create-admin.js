const { adminService } = require ("../../BusinessLayer/services");

const createAdmin = async(name, email, password) => {
    const credentials = await adminService.createAdmin(name, email, password);

    console.log(credentials);
};

module.exports = createAdmin;