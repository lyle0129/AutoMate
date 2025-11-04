import { sql } from "../config/db.js";

export const createUser = async (user_name, password_hash, role, owner_id) => {
  try {
    const result = await sql`
      INSERT INTO users (user_name, password_hash, role, owner_id)
      VALUES (${user_name}, ${password_hash}, ${role}, ${owner_id})
      RETURNING *
    `;
    return result[0]; // Neon (Postgres.js-style) returns an array
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const findUserByUsername = async (user_name) => {
  try {
    const result = await sql`
      SELECT * FROM users WHERE user_name = ${user_name}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const result = await sql`
      SELECT id, user_name, role, owner_id, created_at FROM users
      ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

export const findUserById = async (id) => {
  try {
    const result = await sql`
      SELECT id, user_name, role, owner_id, created_at FROM users 
      WHERE id = ${id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const { user_name, role, owner_id } = updates;
    const result = await sql`
      UPDATE users 
      SET user_name = ${user_name}, role = ${role}, owner_id = ${owner_id}
      WHERE id = ${id}
      RETURNING id, user_name, role, owner_id, created_at
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const result = await sql`
      DELETE FROM users WHERE id = ${id}
      RETURNING id, user_name, role
    `;
    return result[0];
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};