import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { readJson, writeJson } from './fileStore';
import { addLog } from './logManager';

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
};

const fileName = 'users.json';

const getUsers = async (): Promise<User[]> => readJson<User[]>(fileName, []);

export const findUserByEmailOrUsername = async (identifier: string) => {
  const users = await getUsers();
  return users.find(
    (user) => user.email.toLowerCase() === identifier.toLowerCase() || user.username.toLowerCase() === identifier.toLowerCase()
  );
};

export const registerUser = async (payload: { username: string; email: string; password: string }) => {
  const users = await getUsers();
  const exists = await findUserByEmailOrUsername(payload.email);
  if (exists) {
    throw new Error('User already exists');
  }
  const id = `usr_${Date.now()}`;
  const hash = await bcrypt.hash(payload.password, 10);
  const newUser: User = {
    id,
    username: payload.username,
    email: payload.email,
    password: hash,
    role: users.length === 0 ? 'admin' : 'user',
    createdAt: dayjs().toISOString()
  };
  users.push(newUser);
  await writeJson(fileName, users);
  await addLog({ type: 'user', message: `User ${payload.email} registered`, userId: id });
  return newUser;
};

export const validateCredentials = async (identifier: string, password: string) => {
  const user = await findUserByEmailOrUsername(identifier);
  if (!user) {
    throw new Error('User not found');
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Invalid password');
  }
  return user;
};

export const getUserById = async (userId: string) => {
  const users = await getUsers();
  return users.find((u) => u.id === userId) ?? null;
};
