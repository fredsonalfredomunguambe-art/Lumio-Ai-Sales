# Guia Completo: Fluxo OAuth nas Integrações Lumio

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025  
> **Audiência:** Desenvolvedores e Usuários Técnicos

---

## 📋 Índice

1. [O que é OAuth](#o-que-é-oauth)
2. [Fluxo de Conexão](#fluxo-de-conexão)
3. [Passo a Passo Técnico](#passo-a-passo-técnico)
4. [Segurança](#segurança)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 O que é OAuth?

OAuth 2.0 é um protocolo de autorização que permite que o Lumio acesse dados de outros serviços (como HubSpot, Salesforce, etc.) sem precisar da sua senha.

### Por que usar OAuth?

- ✅ **Segurança**: Suas credenciais nunca são compartilhadas
- ✅ **Controle**: Você pode revogar acesso a qualquer momento
- ✅ **Escopo Limitado**: O Lumio só acessa o que você autorizar
- ✅ **Padrão**: Usado por Google, Facebook, Microsoft, etc.

---

## 🔄 Fluxo de Conexão

### Visão Geral

```
┌─────────┐                 ┌──────────┐                 ┌────────────┐
│  Você   │                 │  Lumio   │                 │ HubSpot    │
│ (User)  │                 │ (Client) │                 │ (Provider) │
└────┬────┘                 └─────┬────┘                 └──────┬─────┘
     │                            │                              │
     │  1. Clica "Conectar"       │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │  2. Redireciona para OAuth │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
     │  3. Login no HubSpot       │                              │
     ├────────────────────────────┼──────────────────────────────>│
     │                            │                              │
     │  4. Autoriza Acesso        │                              │
     ├────────────────────────────┼──────────────────────────────>│
     │                            │                              │
     │  5. Código de Autorização  │                              │
     │<───────────────────────────┼──────────────────────────────┤
     │                            │                              │
     │  6. Envia código           │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  7. Troca código por token   │
     │                            ├──────────────────────────────>│
     │                            │                              │
     │                            │  8. Access Token             │
     │                            │<──────────────────────────────┤
     │                            │                              │
     │  9. Conexão Estabelecida   │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
```

### Componentes Principais

1. **Client (Lumio)**: Aplicação que precisa de acesso
2. **Resource Owner (Você)**: Dono dos dados
3. **Authorization Server**: Servidor que autoriza (ex: HubSpot OAuth)
4. **Resource Server**: Servidor com os dados (ex: HubSpot API)

---

## 🛠️ Passo a Passo Técnico

### Passo 1: Usuário Inicia Conexão

**Interface**:

```tsx
// Em WorldClassIntegrationManager.tsx
<button onClick={() => handleConnect("hubspot")}>Conectar HubSpot</button>
```

**Fluxo**:

```typescript
const handleConnect = async (integrationId: string) => {
  // 1. Solicita URL OAuth ao backend
  const response = await fetch(`/api/integrations/${integrationId}/oauth`);
  const { oauthUrl } = await response.json();

  // 2. Abre janela popup para OAuth
  const oauthWindow = window.open(oauthUrl, "oauth", "width=600,height=700");

  // 3. Aguarda conclusão
  monitorOAuthWindow(oauthWindow);
};
```

### Passo 2: Gerar URL OAuth

**Backend (`/api/integrations/hubspot/oauth/route.ts`)**:

```typescript
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  // 1. Obter configuração OAuth
  const oauthConfig = OAUTH_INTEGRATIONS["hubspot"];

  // 2. Gerar state único (segurança CSRF)
  const state = crypto.randomBytes(16).toString("hex");

  // 3. Salvar state no Redis
  await redis.set(`oauth:state:${state}`, userId, "EX", 600);

  // 4. Construir URL OAuth
  const oauthUrl = new URL(oauthConfig.authUrl);
  oauthUrl.searchParams.set("client_id", process.env.HUBSPOT_CLIENT_ID!);
  oauthUrl.searchParams.set("redirect_uri", oauthConfig.redirectUri);
  oauthUrl.searchParams.set("scope", oauthConfig.scopes.join(" "));
  oauthUrl.searchParams.set("state", state);

  return NextResponse.json({
    success: true,
    data: { oauthUrl: oauthUrl.toString() },
  });
}
```

### Passo 3: Usuário Autoriza

O usuário é levado para a página do provider (HubSpot, Salesforce, etc.) onde:

1. Faz login (se necessário)
2. Vê os escopos solicitados:
   - Read contacts
   - Read deals
   - Write contacts
3. Clica em "Authorize"/"Allow"

### Passo 4: Callback com Código

Provider redireciona para:

```
https://lumio.com/api/integrations/hubspot/oauth/callback?code=ABC123&state=xyz789
```

**Handler do Callback**:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // 1. Validar state (segurança CSRF)
  const userId = await redis.get(`oauth:state:${state}`);
  if (!userId) {
    return new Response("Invalid state", { status: 400 });
  }

  // 2. Trocar código por token
  const tokens = await exchangeCodeForToken("hubspot", code);

  // 3. Salvar tokens (criptografados)
  await saveOAuthConnection(userId, "hubspot", tokens);

  // 4. Redirecionar usuário
  return Response.redirect("/settings/integrations?success=hubspot");
}
```

### Passo 5: Trocar Código por Token

```typescript
async function exchangeCodeForToken(
  provider: string,
  code: string
): Promise<OAuthTokens> {
  const config = OAUTH_INTEGRATIONS[provider];

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
      client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]!,
      redirect_uri: config.redirectUri,
      code: code,
    }),
  });

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}
```

### Passo 6: Salvar Conexão

```typescript
async function saveOAuthConnection(
  userId: string,
  integrationId: string,
  tokens: OAuthTokens
) {
  // 1. Criptografar tokens
  const encryptedTokens = encrypt(JSON.stringify(tokens));

  // 2. Salvar no banco
  await prisma.integrationConnection.upsert({
    where: {
      userId_integrationId: { userId, integrationId },
    },
    update: {
      credentials: encryptedTokens,
      status: "connected",
      connectedAt: new Date(),
    },
    create: {
      userId,
      integrationId,
      credentials: encryptedTokens,
      status: "connected",
      connectedAt: new Date(),
    },
  });

  // 3. Notificar frontend via webhook ou polling
  await notifyConnectionSuccess(userId, integrationId);
}
```

---

## 🔄 Refresh Token

Access tokens expiram (geralmente 1-24 horas). Refresh tokens permitem obter novos access tokens sem re-autorização.

### Quando Renovar

```typescript
async function getValidAccessToken(
  userId: string,
  integrationId: string
): Promise<string> {
  // 1. Buscar conexão
  const connection = await prisma.integrationConnection.findUnique({
    where: { userId_integrationId: { userId, integrationId } },
  });

  // 2. Descriptografar tokens
  const tokens = JSON.parse(decrypt(connection.credentials));

  // 3. Verificar se expirou
  if (Date.now() >= tokens.expiresAt - 60000) {
    // 1 min antes
    // Token expirou, renovar
    const newTokens = await refreshAccessToken(
      integrationId,
      tokens.refreshToken
    );

    // Atualizar no banco
    await saveOAuthConnection(userId, integrationId, newTokens);

    return newTokens.accessToken;
  }

  return tokens.accessToken;
}
```

### Renovar Token

```typescript
async function refreshAccessToken(
  provider: string,
  refreshToken: string
): Promise<OAuthTokens> {
  const config = OAUTH_INTEGRATIONS[provider];

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`]!,
      client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]!,
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Alguns providers não retornam novo
    expiresIn: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}
```

---

## 🔒 Segurança

### 1. State Parameter (CSRF Protection)

```typescript
// Gerar state único
const state = crypto.randomBytes(16).toString("hex");

// Salvar temporariamente (10 min TTL)
await redis.set(`oauth:state:${state}`, userId, "EX", 600);

// Validar no callback
const savedUserId = await redis.get(`oauth:state:${state}`);
if (!savedUserId || savedUserId !== userId) {
  throw new Error("Invalid or expired state");
}
```

### 2. Criptografia de Tokens

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY, "hex"),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

### 3. HTTPS Only

- Todos os endpoints OAuth usam HTTPS
- Cookies com flag `Secure`
- Redirect URIs devem ser HTTPS

### 4. Scope Mínimo

```typescript
// Solicite apenas os escopos necessários
const scopes = {
  hubspot: ["crm.objects.contacts.read", "crm.objects.deals.read"],
  // NÃO: ['crm.*'] (muito amplo)
};
```

---

## 🐛 Troubleshooting

### Erro: "Invalid State"

**Causa**: State parameter inválido ou expirado

**Solução**:

1. Certifique-se de que Redis está rodando
2. Verifique se o TTL não é muito curto (mínimo 5 min)
3. Tente novamente o fluxo OAuth

### Erro: "Invalid Redirect URI"

**Causa**: Redirect URI não cadastrada no provider

**Solução**:

1. Acesse configurações do app no provider
2. Adicione a URL exata: `https://seu-dominio.com/api/integrations/hubspot/oauth/callback`
3. Salve e aguarde alguns minutos

### Erro: "Access Token Expired"

**Causa**: Token expirou e refresh falhou

**Solução**:

```typescript
// Forçar reconexão
await disconnectIntegration(userId, integrationId);
// Usuário precisará conectar novamente
```

### Erro: "Insufficient Scopes"

**Causa**: Escopos OAuth insuficientes

**Solução**:

1. Desconectar integração
2. Atualizar escopos em `oauth-integrations.ts`
3. Reconectar

---

## 📊 Monitoramento

### Métricas Importantes

- Taxa de sucesso OAuth (meta: >95%)
- Tempo médio do fluxo (meta: <30s)
- Taxa de refresh bem-sucedido (meta: >99%)
- Tokens expirados

### Logs

```typescript
// Estrutura de log OAuth
{
  event: 'oauth_started',
  userId: 'user_123',
  integrationId: 'hubspot',
  timestamp: '2025-01-10T10:00:00Z'
}

{
  event: 'oauth_completed',
  userId: 'user_123',
  integrationId: 'hubspot',
  duration: 15000, // ms
  timestamp: '2025-01-10T10:00:15Z'
}

{
  event: 'oauth_failed',
  userId: 'user_123',
  integrationId: 'hubspot',
  error: 'Invalid state',
  timestamp: '2025-01-10T10:00:15Z'
}
```

---

## 💡 Melhores Práticas

### 1. UX do OAuth

- ✅ Use popup em vez de redirect completo
- ✅ Mostre loading durante o processo
- ✅ Feedback claro de sucesso/erro
- ✅ Permita reconexão fácil

### 2. Tratamento de Erros

```typescript
try {
  const accessToken = await getValidAccessToken(userId, "hubspot");
} catch (error) {
  if (error.code === "INVALID_REFRESH_TOKEN") {
    // Token refresh falhou, notificar usuário para reconectar
    await notifyReconnectRequired(userId, "hubspot");
  } else {
    // Outro erro, tentar novamente
    throw error;
  }
}
```

### 3. Auditoria

```typescript
// Registrar todas as ações OAuth
await prisma.auditLog.create({
  data: {
    userId,
    action: "oauth_connected",
    resource: "integration",
    resourceId: integrationId,
    metadata: {
      scopes: tokens.scope,
      expiresAt: tokens.expiresAt,
    },
  },
});
```

---

## 🔗 Recursos

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)
- [OWASP OAuth Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

---

**Versão**: 1.0.0  
**Mantido por**: Equipe Lumio  
**Contato**: dev@lumio.com
