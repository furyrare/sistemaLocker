const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Testar conexão ao iniciar
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Testar conexão
testConnection();

// Fechar conexão ao encerrar o processo
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

const { Prisma } = require('@prisma/client');

module.exports = { prisma, Prisma };
