import { Router } from "express";
import getPrismaInstance from "../utils/PrismaClient.js";
// import getPrismaInstance from "../utils/PrismaClient";

const router = Router();

// Generate a random profile picture URL
function generateRandomProfilePicture() {
  const avatarNumber = Math.floor(Math.random() * 10) + 1; // Random number between 1 and 9
  if (avatarNumber === 10) {
    return "/default_avatar.png";
  }
  return `/avatars/${avatarNumber}.png`;
}

// // Generate random user data using the uinames.com API
function generateRandomUserData(user) {
  const randomName = `${user.name.first} ${user.name.last}`;
  const randomEmail = `${user.email}`;
  const randomAbout = `About ${randomName}`;

  return {
    email: randomEmail,
    name: randomName,
    about: randomAbout,
    image: generateRandomProfilePicture(),
  };
}

async function getRandomUsersFromApi(numberOfUsers) {
  const data = await fetch(
    `https://randomuser.me/api/?results=${numberOfUsers}`,
  ).then((res) => res.json());

  const users = [];

  for (let i = 0; i < data.results.length; i++) {
    const user = generateRandomUserData(data.results[i]);
    users.push(user);
  }

  return users;
}

router.get("/seed", async (req, res, next) => {
  try {
    // const numberOfUsersToSeed = 10; // Change this to the desired number of users
    const users = await getRandomUsersFromApi(15);
    const prisma = getPrismaInstance();

    // const usersToCreate = [];

    // for (let i = 0; i < numberOfUsersToSeed; i++) {
    //   const userData = await generateRandomUserData();
    //   usersToCreate.push(userData);
    // }

    const createdUsers = [];

    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   const userExists = await prisma.user.findUnique({
    //     where: {
    //       email: user.email,
    //     },
    //   });

    //   if (userExists) {
    //     continue;
    //   }

    //   const cur = await prisma.user.create({
    //     data: {
    //       email: user.email,
    //       name: user.name,
    //       about: user.about,
    //       profilePicture: user.image,
    //     },
    //   });

    //   createdUsers.push(cur);
    // }

    res.json({ msg: "Seed completed", status: true, createdUsers });
  } catch (error) {
    next(error);
  }
});

export default router;
