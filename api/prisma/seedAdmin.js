const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    const email = 'admin@hospital.com';
    const password = 'admin123';
    const nombre = 'Super Admin';
    const rol = 'ADMIN';
    const passwordHash = await bcrypt.hash(password, 10);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
        await prisma.user.create({
            data: { nombre, email, password: passwordHash, rol }
        });
        console.log('✅ Usuario admin seed creado:', email);
    } else {
        console.log('ℹ️  Usuario admin seed ya existe:', email);
    }
}

if (require.main === module) {
    seedAdmin()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}

module.exports = { seedAdmin };
