import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log('User already exists');
        return;
    }

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            role: UserRole.MEMBER,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            profile: {
                create: {
                    fullName: 'Test User',
                    languagePreference: 'en'
                }
            }
        },
    });

    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
