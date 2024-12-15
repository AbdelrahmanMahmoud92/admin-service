const Admin = require("../models/Admin");


// Function have an argument with properties and return a new format
const toDTO = ({
    _id, name, email, password, status
}) => {
    return {
        id: _id.toString(),
        name,
        email,
        password,
        status
    }
}
const createAdmin = async(data) => {
    const admin = await Admin.create(data);
    return toDTO (admin);
}

const updateAdmin = async(id, data) => {
    const admin = await Admin.findByIdAndUpdate(id, data, {new: true});
    return admin ? toDTO (admin) : null;
}
const retrieveAdmin = async(id) => {
    const admin = await Admin.findById(id);
    return admin ? toDTO (admin) : null;
}

// const retrieveAdmins = async (filter, pagination) => {
//     const admins = await Admin.find(filter)
//       .skip(pagination.skip)
//       .limit(pagination.limit);
  
//     return clients.map(toDTO);
// };

module.exports = {
    createAdmin,
    updateAdmin,
    retrieveAdmin,
}