import axios from "axios";

class UserService{
  static BASE_URL = "http://localhost:8080"

  static async login(email, password){

    try{

      const response = await axios.post(`${UserService.BASE_URL}/auth/login`, {email,password})
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async register(userData, token){

    try{

      const response = await axios.post(`${UserService.BASE_URL}/auth/register`, userData,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async getAllUsers(token){

    try{

      const response = await axios.get(`${UserService.BASE_URL}/admin/get-all-users`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async getYourProfile(token){

    try{

      const response = await axios.get(`${UserService.BASE_URL}/adminuser/get-profile`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async getUserById(userId, token){

    try{

      const response = await axios.get(`${UserService.BASE_URL}/admin/get-users/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async DeleteUser(userId, token){

    try{

      const response = await axios.delete(`${UserService.BASE_URL}/admin/delete/${userId}`,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }

  static async UpdateUser(userId, userData, token){

    try{

      const response = await axios.put(`${UserService.BASE_URL}/admin/update/${userId}`, userData,
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      )
      return response.data;

    }catch(err){
      throw err;
    }

  }



  //MEDICINE RELATED SERVICES
  // Create a new medicine
static async createMedicine(medicineData) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${UserService.BASE_URL}/api/medicines`,
      medicineData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}


// INVENTORY RELATED SERVICES
static async addInventoryItem(inventoryData) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${UserService.BASE_URL}/api/inventory`,
      inventoryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}





  // AUTHENTICATION CHECKER

  static logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  
  }

  static isAuthenticated(){
    const token = localStorage.getItem("token");
    return !!token
  }

  static isDoctor(){
    const role = localStorage.getItem("role");
    return role === "DOCTOR"
  }

  static isDispenser(){
    const role = localStorage.getItem("role");
    return role === "DISPENSER"
  }

  static doctorOnly(){
    return this.isAuthenticated() && this.isDoctor();
  }


  // Patient registration
  static async registerPatient(patientData) {
    try {
      const response = await axios.post(`${UserService.BASE_URL}/api/patients/register`, patientData);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Register patient by doctor
  static async doctorRegisterPatient(patientData) {
    try {
      const token = localStorage.getItem("token"); 
  
      const response = await axios.post(
        `${UserService.BASE_URL}/api/patients/doctor-register`,
        patientData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      return response.data;
    } catch (err) {
      if (err.response) {
        throw new Error(
          err.response.data.message ||
            err.response.data.error ||
            "Registration failed"
        );
      } else if (err.request) {
        throw new Error("No response from server");
      } else {
        throw new Error("Request setup error");
      }
    }
  }


  // Patient Login
static async patientLogin(email, password) {
  try {
    const response = await axios.post(`${UserService.BASE_URL}/api/patients/login`, {
      email,
      password
    });

    // Save token and role to localStorage
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", "PATIENT"); 

    return response.data;
  } catch (err) {
    throw err;
  }
}


static isCustomer() {
  const role = localStorage.getItem("role");
  return role === "PATIENT";
}


// Fetch patient profile info
static async getPatientProfile() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${UserService.BASE_URL}/api/patients/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; 
  } catch (err) {
    throw err;
  }
}


//Patient Profile Update
// Get patient's full profile
static async getPatientFullProfile() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${UserService.BASE_URL}/api/patients/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
}

// Update patient profile
static async updatePatientProfile(profileData) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${UserService.BASE_URL}/api/patients/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

// Change patient password
static async changePatientPassword(passwordData) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${UserService.BASE_URL}/api/patients/change-password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}


}

export default UserService;