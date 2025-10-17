#!/usr/bin/env node

/**
 * Script de Teste Automatizado - Marvin Training System
 * Execute: node test-marvin-training.js
 */

const BASE_URL = "http://localhost:3001";

// Cores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === expectedStatus) {
      log(`✅ ${url} - Status: ${response.status}`, "green");
      return { success: true, data };
    } else {
      log(
        `❌ ${url} - Expected: ${expectedStatus}, Got: ${response.status}`,
        "red"
      );
      return { success: false, error: data };
    }
  } catch (error) {
    log(`❌ ${url} - Error: ${error.message}`, "red");
    return { success: false, error: error.message };
  }
}

async function testTrainingAPIs() {
  log("\n🎯 Testando APIs do Sistema de Treinamento Marvin\n", "bold");

  // Teste 1: Módulos disponíveis
  log("1. Testando módulos disponíveis...", "blue");
  const modulesResult = await testEndpoint(
    `${BASE_URL}/api/training/premium?action=modules`
  );

  if (modulesResult.success) {
    const modules = modulesResult.data.modules;
    log(`   📚 Encontrados ${modules.length} módulos:`, "green");
    modules.forEach((module) => {
      log(
        `   - ${module.name} (${module.difficulty}, ${module.duration}min)`,
        "green"
      );
    });
  }

  // Teste 2: Progresso do usuário
  log("\n2. Testando progresso do usuário...", "blue");
  const progressResult = await testEndpoint(
    `${BASE_URL}/api/training/premium?action=progress`
  );

  if (progressResult.success) {
    const progress = progressResult.data.progress;
    log(`   📊 Progresso atual:`, "green");
    log(`   - Overall Score: ${progress.overallScore}%`, "green");
    log(`   - Modules Completed: ${progress.modulesCompleted}`, "green");
    log(`   - Skill Level: ${progress.skillLevel}`, "green");
    log(
      `   - Time Spent: ${Math.round(progress.totalTimeSpent / 60)}h`,
      "green"
    );
  }

  // Teste 3: Todos os módulos
  log("\n3. Testando todos os módulos...", "blue");
  const allModulesResult = await testEndpoint(
    `${BASE_URL}/api/training/premium?action=all-modules`
  );

  if (allModulesResult.success) {
    const allModules = allModulesResult.data.modules;
    log(`   📋 Total de módulos: ${allModules.length}`, "green");
  }

  // Teste 4: Iniciar sessão de treinamento
  log("\n4. Testando início de sessão de treinamento...", "blue");
  try {
    const sessionResponse = await fetch(`${BASE_URL}/api/training/premium`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "start-session",
        moduleId: "prospecting-mastery",
      }),
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      log(`   🚀 Sessão iniciada: ${sessionData.session.id}`, "green");
      log(`   📝 Módulo: ${sessionData.session.moduleId}`, "green");
      log(
        `   ⏰ Início: ${new Date(
          sessionData.session.startTime
        ).toLocaleString()}`,
        "green"
      );

      // Teste 5: Completar exercício
      log("\n5. Testando completar exercício...", "blue");
      const exerciseResponse = await fetch(`${BASE_URL}/api/training/premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "complete-exercise",
          sessionId: sessionData.session.id,
          exerciseId: "prospect-research-simulation",
          score: 85,
        }),
      });

      if (exerciseResponse.ok) {
        const exerciseData = await exerciseResponse.json();
        log(`   ✅ Exercício completado: ${exerciseData.success}`, "green");
      } else {
        log(
          `   ❌ Erro ao completar exercício: ${exerciseResponse.status}`,
          "red"
        );
      }
    } else {
      log(`   ❌ Erro ao iniciar sessão: ${sessionResponse.status}`, "red");
    }
  } catch (error) {
    log(`   ❌ Erro na requisição: ${error.message}`, "red");
  }
}

async function testUIEndpoints() {
  log("\n🎨 Testando endpoints da interface...\n", "bold");

  // Teste da página principal
  log("1. Testando página principal...", "blue");
  const mainPageResult = await testEndpoint(
    `${BASE_URL}/dashboard/marvin`,
    200
  );

  if (mainPageResult.success) {
    log("   ✅ Página principal carregada", "green");
  }

  // Teste de outros endpoints
  const endpoints = ["/api/training", "/api/onboarding", "/api/marvin"];

  for (const endpoint of endpoints) {
    log(`\n2. Testando ${endpoint}...`, "blue");
    await testEndpoint(`${BASE_URL}${endpoint}`, 200);
  }
}

async function runTests() {
  log("🚀 Iniciando testes do Sistema de Treinamento Marvin\n", "bold");
  log("=" * 50, "blue");

  // Verificar se o servidor está rodando
  try {
    const healthCheck = await fetch(
      `${BASE_URL}/api/training/premium?action=modules`
    );
    if (!healthCheck.ok) {
      log("❌ Servidor não está rodando ou não está acessível", "red");
      log("   Execute: npm run dev", "yellow");
      process.exit(1);
    }
  } catch (error) {
    log("❌ Não foi possível conectar ao servidor", "red");
    log(
      "   Verifique se o servidor está rodando em http://localhost:3001",
      "yellow"
    );
    process.exit(1);
  }

  // Executar testes
  await testTrainingAPIs();
  await testUIEndpoints();

  log("\n🎉 Testes concluídos!", "bold");
  log("\n📋 Próximos passos:", "blue");
  log("1. Acesse http://localhost:3001/dashboard/marvin", "yellow");
  log(
    "2. Navegue pelas abas (Chat, Insights, Suggestions, Training)",
    "yellow"
  );
  log("3. Teste o sistema de treinamento premium", "yellow");
  log("4. Verifique os charts na seção Insights", "yellow");
  log(
    "5. Consulte o GUIA_TESTE_MARVIN_TRAINING.md para mais detalhes",
    "yellow"
  );
}

// Executar testes
runTests().catch(console.error);
