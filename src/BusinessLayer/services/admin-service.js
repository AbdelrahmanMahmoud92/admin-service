const validator = require ("validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const adminRepository = require("../../DataLayer/repositories/admin-repository");
const { ADMIN_STATUS } = require("../../BusinessLayer/enums/admin-status");
const {
    ValidationError,
    NotExistError,
    InvalidStatusError
} = require("../errors/index");

const validateId = async(id)=> {
    if(!validator.isUUID(id)){
        throw new ValidationError("Invalid admin ID, it must be UUID");
    }
}

const validateName = async(name) => {
    if(!validator.isLength(name, {min: 2, max: 50})
    || typeof name !== "string"
    ){
        throw new ValidationError("Admin name must be between 2 and 50 characters");
    }
}

const validateStatus = async(status) => {
    if(!Object.values(ADMIN_STATUS).includes(status)){
        throw new InvalidStatusError("Invalid admin status");
    }
}


const createAdmin = async (name, email, password) => {
    await validateName(name);

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminRepository.createAdmin   ({
        name,
        email,
        status: ADMIN_STATUS.ACTIVE,
        password: hashedPassword,
    });

    return {
        email,
        password: password,
    };
};

// const updateAdmin = async (id, data) => {
//     if(data.id) await validateId(id);
//     if(data.name) await validateName(data.name);
//     if(data.status) await validateStatus(data.status);
    
//     const admin =  await adminRepository.updateAdmin(id, data);
//     if(!admin){
//         throw new NotExistError("Admin not found");
//     }
//     return admin
// }

module.exports = {
    createAdmin,
}