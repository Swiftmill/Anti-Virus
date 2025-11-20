import { readJson, writeJson } from './fileStore';

export type Session = {
  userId: string | null;
  remember: boolean;
};

const fileName = 'session.json';

export const getSession = async () => readJson<Session>(fileName, { userId: null, remember: false });

export const updateSession = async (session: Session) => {
  await writeJson(fileName, session);
  return session;
};
