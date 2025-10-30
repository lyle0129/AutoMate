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
