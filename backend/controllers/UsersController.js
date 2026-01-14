import UserRepository from "../repo/users.js";
import bcrypt from "bcrypt";

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

  async getMentors(req, res) {
    try {
      const mentors = await UserRepository.getMentors();
      res.json(mentors);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch mentors" });
    }
  }

  async createUser(req, res) {
    try {
      const newUser = await UserRepository.createUser(req.body);
      if (newUser && newUser.password) delete newUser.password;
      res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async updateUser(req, res) {
    try {
      const updatedUser = await UserRepository.updateUser(
        req.params.id,
        req.body
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      if (updatedUser && updatedUser.password) delete updatedUser.password;
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

  async getMe(req, res) {
    try {
      const user = await UserRepository.getUserById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (user.password) delete user.password;
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch current user" });
    }
  }

  async updateMe(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword)
        return res.status(400).json({ error: "Current password is required" });
      if (!newPassword)
        return res.status(400).json({ error: "New password is required" });

      const user = await UserRepository.getUserById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid)
        return res.status(401).json({ error: "Current password is incorrect" });

      // Updatepassword
      const updatedUser = await UserRepository.updateUser(req.user.id, {
        password: newPassword,
      });
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res.json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update password" });
    }
  }
}

export default new UsersController();
