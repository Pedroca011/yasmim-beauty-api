import bcrypt from "bcrypt";

export default async function passwordHashed(password: string) {
  const saltRounds = 10;

  const hashed = await bcrypt.hash(password, saltRounds);

  if (!hashed) return null;

  return hashed;
}
