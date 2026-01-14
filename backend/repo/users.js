import User from "../models/User.js";

class UserRepository {
  async getAllUsers() {
    return User.query();
  }

  async getUserById(id) {
    return User.query().findById(id);
  }

  async getMentors() {
    return User.query()
      .where("role", "mentor")
      .select("id", "firstname", "lastname", "email");
  }

  async createUser(userData) {
    return User.query().insert(userData);
  }

  async updateUser(id, userData) {
    return User.query().patchAndFetchById(id, userData);
  }

  async deleteUser(id) {
    return User.query().deleteById(id);
  }

  async getUserByEmail(email) {
    return User.query().findOne({ email });
  }

  async getFilteredUsers(filters) {
    return User.query().where(filters);
  }

  async countUsers() {
    return User.query().count();
  }
}

export default new UserRepository();
