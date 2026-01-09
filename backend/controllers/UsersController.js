import UserRepository from '../repo/users.js';

class UsersController {
  async getAllUsers(req, res) {
    try {
      const users = await UserRepository.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await UserRepository.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async createUser(req, res) {
    try {
      const newUser = await UserRepository.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async updateUser(req, res) {
    try {
      const updatedUser = await UserRepository.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req, res) {
    try {
      const rowsDeleted = await UserRepository.deleteUser(req.params.id);
      if (!rowsDeleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export default new UsersController();
