const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@hospital.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const nombre = process.env.ADMIN_NAME || 'Super Admin';
  const rol = 'ADMIN';
  const passwordHash = await bcrypt.hash(password, 10);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    await prisma.user.create({
      data: { nombre, email, password: passwordHash, rol },
    });
    console.log('✅ Usuario admin seed creado:', email);
  } else {
    console.log('ℹ️  Usuario admin seed ya existe:', email);
  }

  // Asegurar configuración por defecto
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({
      data: {
        maxGuardiasTotales: 3,
        medicosPorDia: 1,
      },
    });
    console.log('✅ Configuración por defecto creada');
  } else {
    console.log('ℹ️  Configuración ya existe');
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
