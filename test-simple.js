// Teste simples das APIs
const BASE_URL = "http://localhost:3001";

async function testAPI() {
  console.log("🧪 Testando APIs do Marvin Training...\n");

  try {
    // Teste 1: Módulos de treinamento
    console.log("1. Testando módulos de treinamento...");
    const modulesResponse = await fetch(
      `${BASE_URL}/api/training/premium?action=modules`
    );
    const modulesData = await modulesResponse.json();

    if (modulesResponse.ok) {
      console.log("✅ Módulos carregados:", modulesData.modules?.length || 0);
      if (modulesData.modules?.length > 0) {
        modulesData.modules.forEach((module) => {
          console.log(`   - ${module.name} (${module.difficulty})`);
        });
      }
    } else {
      console.log("❌ Erro ao carregar módulos:", modulesData);
    }

    // Teste 2: Progresso
    console.log("\n2. Testando progresso...");
    const progressResponse = await fetch(
      `${BASE_URL}/api/training/premium?action=progress`
    );
    const progressData = await progressResponse.json();

    if (progressResponse.ok) {
      console.log("✅ Progresso carregado:", progressData.progress);
    } else {
      console.log("❌ Erro ao carregar progresso:", progressData);
    }

    // Teste 3: Página principal
    console.log("\n3. Testando página principal...");
    const pageResponse = await fetch(`${BASE_URL}/dashboard/marvin`);

    if (pageResponse.ok) {
      console.log("✅ Página principal carregada");
    } else {
      console.log("❌ Erro ao carregar página:", pageResponse.status);
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error.message);
    console.log("   Verifique se o servidor está rodando: npm run dev");
  }
}

testAPI();
