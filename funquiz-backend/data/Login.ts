import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { z } from 'zod';

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
    // profile_picture_url will default to null as per schema if not provided

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        // profile_picture_url is not explicitly set, so it uses schema default (null)
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
      select: { id: true, username: true, total_score: true, profile_picture_url: true }, // Added profile_picture_url
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

    if (userExists.profile_picture_url && userExists.profile_picture_url.includes('/uploads/')) {
        try {
            const oldFileName = path.basename(new URL(userExists.profile_picture_url).pathname);
            const oldFilePath = path.join(UPLOADS_DIR, oldFileName);
            if (oldFilePath.startsWith(UPLOADS_DIR)) {
                await fs.unlink(oldFilePath);
                console.log(`Old picture ${oldFileName} deleted.`);
            } else {
                 console.warn(`Skipped deletion of old picture outside UPLOADS_DIR: ${oldFilePath}`);
            }
        } catch (e: any) {
             if (e.code !== 'ENOENT') { // ENOENT means file not found, which is fine
                console.warn("Could not delete old profile picture:", e.message);
            }
        }
    }

    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${nanoid()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const serverPort = process.env.PORT || '3000'; // Get port from env or default
    const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${serverPort}`;
    const fileUrl = `${serverBaseUrl}/uploads/${uniqueFilename}`;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { profile_picture_url: fileUrl },
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
        message: 'Profile picture updated successfully',
        user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    return c.json({ error: 'Failed to update profile picture' }, 500);
  }
}

const UpdateUserProfileSchema = z.object({
  username: z.string().min(1, "Username cannot be empty").max(50, "Username is too long"),
});

export async function updateUserProfileData(c: Context) {
  try {
    const userId = parseInt(c.req.param('userId'), 10);
    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const body = await c.req.json();
    console.log('Request body received:', body); // Debug log
    
    const validationResult = UpdateUserProfileSchema.safeParse(body);
    console.log('Validation result:', validationResult); // Debug log

    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.flatten().fieldErrors);
      return c.json({ error: "Invalid input", details: validationResult.error.flatten().fieldErrors }, 400);
    }

    const { username } = validationResult.data;

    // Check if user exists before trying to update
    const userExists = await prisma.users.findUnique({ where: { id: userId } });
    if (!userExists) {
        return c.json({ error: 'User not found' }, 404);
    }

    // If username is being updated, check for uniqueness against other users
    if (username !== userExists.username) {
      const existingUserWithNewName = await prisma.users.findFirst({
        where: {
          username: username,
          id: { not: userId },
        },
      });
      if (existingUserWithNewName) {
        return c.json({ error: "Username already taken" }, 409);
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { username: username },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        total_score: true,
        profile_picture_url: true,
      },
    });

    console.log('User updated successfully:', updatedUser); // Debug log
    return c.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
}