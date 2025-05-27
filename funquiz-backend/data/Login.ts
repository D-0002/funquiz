import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// hash function using crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Signup Function
export async function signupData(c: Context) {
  try {
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json(
        { error: "Username, email, and password are required" },
        400
      );
    }

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

    const passwordHash = hashPassword(password);

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        // total_score will default to 0 as per Prisma schema
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true, // MODIFIED: Include total_score
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

// Login Function
export async function loginData(c: Context) {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json(
        { error: "Username and password are required" },
        400
      );
    }

    const passwordHash = hashPassword(password);

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
        total_score: true, // MODIFIED: Include total_score
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

//  update user's total score
export async function updateUserScoreData(c: Context) {
  try {
    const { userId, scoreToAdd } = await c.req.json();

    if (userId === undefined || scoreToAdd === undefined) {
      return c.json({ error: "userId and scoreToAdd are required" }, 400);
    }

    if (typeof userId !== 'number' || typeof scoreToAdd !== 'number' || scoreToAdd < 0) {
      return c.json({ error: "Invalid userId or scoreToAdd (must be a non-negative number)" }, 400);
    }

    // Verify user exists
    const userExists = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update user's total score
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        total_score: {
          increment: scoreToAdd, 
        },
      },
      select: { 
        id: true,
        username: true,
        total_score: true,
      }
    });

    return c.json({
      message: "Score updated successfully",
      user: updatedUser 
    }, 200);

  } catch (error) {
    console.error("Error updating score:", error);
    return c.json({ error: "Failed to update score" }, 500);
  }
}

// fetch leaderboard data
export async function getLeaderboardData(c: Context) {
  try {
    const topPlayers = await prisma.users.findMany({
      take: 10, 
      orderBy: {
        total_score: 'desc', 
      },
      select: {
        id: true,
        username: true,
        total_score: true,
      },
    });

    const rankedPlayers = topPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    return c.json({
      message: "Top 10 players fetched successfully",
      leaderboard: rankedPlayers 
    }, 200);

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard data" }, 500);
  }
}