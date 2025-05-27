import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// hash function using crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function signupData(c: Context) {
  try {
    const { username, email, password } = await c.req.json();

    // Basic validation
    if (!username || !email || !password) {
      return c.json(
        { error: "Username, email, and password are required" },
        400
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return c.json(
        { error: "Username or email already exists" },
        409
      );
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });

    return c.json({
      message: "Account created successfully",
      user: newUser
    }, 201);

  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
}

export async function loginData(c: Context) {
  try {
    const { username, password } = await c.req.json();

    // Basic validation
    if (!username || !password) {
      return c.json(
        { error: "Username and password are required" },
        400
      );
    }

    // Hash the provided password
    const passwordHash = hashPassword(password);

    // Find user by username or email
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ],
        password_hash: passwordHash
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      return c.json(
        { error: "Invalid username or password" },
        401
      );
    }

    return c.json({
      message: "Login successful",
      user: user
    });

  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
}