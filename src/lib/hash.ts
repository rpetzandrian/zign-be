import bcrypt from 'bcrypt'

export const hashPassword = async (password: string): Promise<Promise<string>> => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export default hashPassword;
