import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs/promises'; 
import path from 'path';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

(async () => {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log(`Uploads directory ensured at: ${UPLOADS_DIR}`);
    } catch (err) {
        console.error('Error creating uploads directory:', err);
    }
})();


function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function signupData(c: Context) {
  try {
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ error: "Username, email, and password are required" }, 400);
    }

    const existingUser = await prisma.users.findFirst({
      where: { OR: [{ username: username }, { email: email }] }
    });

    if (existingUser) {
      return c.json({ error: "Username or email already exists" }, 409);
    }

    const passwordHash = hashPassword(password);
    const defaultProfilePicture = null;

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        profile_picture_url: defaultProfilePicture,
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true,
        profile_picture_url: true,
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

    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.users.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
        password_hash: passwordHash
      },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true,
        profile_picture_url: true,
      },
    });

    if (!user) {
      return c.json({ error: "Invalid username or password" }, 401);
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

export async function updateUserScoreData(c: Context) {
  try {
    const { userId, scoreToAdd } = await c.req.json();
    if (userId === undefined || scoreToAdd === undefined) {
      return c.json({ error: "userId and scoreToAdd are required" }, 400);
    }
    if (typeof userId !== 'number' || typeof scoreToAdd !== 'number' || scoreToAdd < 0) {
      return c.json({ error: "Invalid userId or scoreToAdd" }, 400);
    }
    const userExists = await prisma.users.findUnique({ where: { id: userId } });
    if (!userExists) return c.json({ error: "User not found" }, 404);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { total_score: { increment: scoreToAdd } },
      select: { id: true, username: true, total_score: true }
    });
    return c.json({ message: "Score updated successfully", user: updatedUser }, 200);
  } catch (error) {
    console.error("Error updating score:", error);
    return c.json({ error: "Failed to update score" }, 500);
  }
}

export async function getLeaderboardData(c: Context) {
  try {
    const topPlayers = await prisma.users.findMany({
      take: 10,
      orderBy: { total_score: 'desc' },
      select: { id: true, username: true, total_score: true },
    });
    const rankedPlayers = topPlayers.map((player, index) => ({ ...player, rank: index + 1 }));
    return c.json({ message: "Top 10 players fetched successfully", leaderboard: rankedPlayers }, 200);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard data" }, 500);
  }
}


export async function getUserData(c: Context) {
  try {
    const userId = parseInt(c.req.param('userId'), 10);
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true,
        profile_picture_url: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
}

// New: Update Profile Picture
export async function updateProfilePictureData(c: Context) {
  try {
    const formData = await c.req.formData();
    const file = formData.get('profilePicture') as File | null;
    const userIdString = formData.get('userId') as string | null;

    if (!file) {
      return c.json({ error: 'No profile picture file provided' }, 400);
    }
    if (!userIdString) {
      return c.json({ error: 'User ID not provided' }, 400);
    }
    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
        return c.json({ error: 'Invalid User ID' }, 400);
    }

    const userExists = await prisma.users.findUnique({ where: { id: userId } });
    if (!userExists) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Optional: Delete old picture if it exists and is locally stored
    if (userExists.profile_picture_url) {
        try {
            const oldFileName = path.basename(new URL(userExists.profile_picture_url).pathname);
            const oldFilePath = path.join(UPLOADS_DIR, oldFileName);
            if (oldFilePath.startsWith(UPLOADS_DIR)) { // Security check
                await fs.unlink(oldFilePath);
                console.log(`Old picture ${oldFileName} deleted.`);
            }
        } catch (e) {
            console.warn("Could not delete old profile picture:", e);
        }
    }


    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${nanoid()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const fileUrl = `${serverBaseUrl}/uploads/${uniqueFilename}`;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { profile_picture_url: fileUrl },
      select: { // Return the full user object, similar to login
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true,
        profile_picture_url: true,
      },
    });

    return c.json({
        message: 'Profile picture updated successfully',
        user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    return c.json({ error: 'Failed to update profile picture' }, 500);
  }
}