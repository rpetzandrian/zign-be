import bcrypt from 'bcrypt'

const hashing = (data: any[]): string => {
    const value = data.join('+')

    return bcrypt.hashSync(value, 10)
}

export default hashing
