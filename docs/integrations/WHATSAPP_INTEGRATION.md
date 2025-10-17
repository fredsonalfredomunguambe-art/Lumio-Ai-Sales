# Integração WhatsApp - Guia Completo

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025  
> **Status:** Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Configuração Rápida](#configuração-rápida)
4. [Autenticação](#autenticação)
5. [Sincronização de Dados](#sincronização-de-dados)
6. [Webhooks](#webhooks)
7. [Limites de Taxa](#limites-de-taxa)
8. [Solução de Problemas](#solução-de-problemas)
9. [Suporte](#suporte)

---

## 🎯 Visão Geral

A integração WhatsApp permite que você:

- Envie mensagens automatizadas para leads
- Receba mensagens de clientes em tempo real
- Sincronize histórico de conversas
- Gerencie contatos do WhatsApp Business

### Casos de Uso

- **Atendimento ao Cliente**: Responda automaticamente a perguntas frequentes
- **Notificações**: Envie atualizações de pedidos e lembretes
- **Conversão de Leads**: Alcance prospects via WhatsApp
- **Campanhas**: Execute campanhas de marketing via WhatsApp

---

## ✨ Funcionalidades

### Mensagens

| Funcionalidade     | Descrição                             | Status      |
| ------------------ | ------------------------------------- | ----------- |
| Enviar Texto       | Envio de mensagens de texto simples   | ✅ Ativo    |
| Enviar Imagens     | Compartilhamento de imagens           | ✅ Ativo    |
| Enviar Documentos  | Compartilhamento de PDFs e documentos | ✅ Ativo    |
| Templates          | Mensagens pré-aprovadas pelo WhatsApp | ✅ Ativo    |
| Mensagens de Grupo | Envio para grupos                     | 🚧 Em breve |
| Áudio/Vídeo        | Compartilhamento de mídia rica        | 🚧 Em breve |

### Automação

- ✅ Resposta automática
- ✅ Chatbot inteligente com Marvin
- ✅ Roteamento de conversas
- ✅ Horário comercial
- ✅ Mensagens de ausência

### Sincronização

- ✅ Histórico de mensagens (últimos 30 dias)
- ✅ Lista de contatos
- ✅ Status de entrega
- ✅ Indicadores de leitura

---

## 🚀 Configuração Rápida

### Pré-requisitos

1. **Conta WhatsApp Business**

   - Conta verificada do WhatsApp Business
   - Número de telefone comercial

2. **API do WhatsApp Cloud**
   - Acesso à Meta for Developers
   - App ID do Facebook
   - Business Account ID

### Passo a Passo

#### 1. Configurar API do WhatsApp Business

```bash
# 1. Acesse Meta for Developers
https://developers.facebook.com/

# 2. Crie um novo app (Tipo: Business)

# 3. Adicione o produto "WhatsApp"

# 4. Configure o número de telefone
```

#### 2. Obter Credenciais

```bash
# Informações necessárias:
- Phone Number ID (ID do número de telefone)
- Business Account ID
- Access Token (Token de acesso permanente)
- Webhook Verify Token (seu próprio token secreto)
```

#### 3. Conectar no Lumio

1. Acesse **Configurações → Integrações**
2. Localize **WhatsApp Business**
3. Clique em **Conectar**
4. Preencha as credenciais:
   - **Phone Number ID**: Seu Phone Number ID
   - **Business Account ID**: Seu Business Account ID
   - **Access Token**: Seu token de acesso
   - **Webhook Verify Token**: Token secreto para webhooks
5. Clique em **Salvar e Testar Conexão**

#### 4. Configurar Sincronização

Após conectar, selecione o que deseja sincronizar:

- ✅ **Histórico de Mensagens**: Importar conversas antigas
- ✅ **Contatos**: Sincronizar lista de contatos
- ⬜ **Mídias**: Importar imagens e documentos

---

## 🔐 Autenticação

### OAuth 2.0 (Recomendado)

```typescript
// Fluxo OAuth automático
const oauthUrl = await fetch("/api/integrations/whatsapp/oauth");
// Usuário é redirecionado para autorizar
```

### Token de Acesso Manual

```typescript
// Configuração com token manual
{
  "phoneNumberId": "123456789012345",
  "businessAccountId": "987654321098765",
  "accessToken": "EAAxxxxxxxxxxxx",
  "webhookVerifyToken": "seu_token_secreto_aqui"
}
```

### Segurança

- 🔒 Tokens criptografados em repouso
- 🔒 Comunicação via HTTPS
- 🔒 Validação de assinatura de webhook
- 🔒 Rotação automática de tokens (se OAuth)

---

## 🔄 Sincronização de Dados

### Sincronização Automática

A sincronização ocorre automaticamente:

- **Mensagens novas**: Tempo real via webhooks
- **Atualizações de status**: A cada 5 minutos
- **Contatos**: A cada 30 minutos
- **Sync completo**: Diariamente às 3h AM

### Sincronização Manual

```typescript
// Via API
POST /api/integrations/whatsapp/sync
{
  "syncOptions": {
    "messages": true,
    "contacts": true
  },
  "mode": "incremental" // ou "full"
}
```

### Mapeamento de Dados

#### WhatsApp Contact → Lumio Lead

```typescript
{
  // WhatsApp Contact
  "wa_id": "5511999999999",
  "profile": {
    "name": "João Silva"
  },

  // Mapeado para Lumio Lead
  "firstName": "João",
  "lastName": "Silva",
  "phone": "+55 11 99999-9999",
  "source": "whatsapp",
  "externalId": "5511999999999",
  "status": "NEW"
}
```

#### WhatsApp Message → Lumio Interaction

```typescript
{
  // WhatsApp Message
  "id": "wamid.xxxxx",
  "from": "5511999999999",
  "type": "text",
  "text": { "body": "Olá!" },
  "timestamp": "1640000000",

  // Mapeado para Lumio Interaction
  "leadId": "lead_xxx",
  "type": "MESSAGE_RECEIVED",
  "channel": "whatsapp",
  "content": "Olá!",
  "metadata": {
    "messageId": "wamid.xxxxx",
    "status": "delivered"
  }
}
```

---

## 🎣 Webhooks

### Configurar Webhook

1. Na Meta for Developers, vá para WhatsApp → Configuration
2. Configure o webhook URL:
   ```
   https://seu-dominio.com/api/integrations/whatsapp/webhook
   ```
3. Use o **Webhook Verify Token** configurado no Lumio
4. Inscreva-se nos seguintes eventos:
   - `messages`
   - `message_status`
   - `contacts`

### Eventos Suportados

| Evento           | Descrição                   | Ação no Lumio             |
| ---------------- | --------------------------- | ------------------------- |
| `messages`       | Nova mensagem recebida      | Criar interação no lead   |
| `message_status` | Status da mensagem alterado | Atualizar status de envio |
| `contacts`       | Contato atualizado          | Sincronizar dados do lead |

### Segurança do Webhook

```typescript
// Verificação automática de assinatura
import crypto from "crypto";

function verifyWebhook(signature: string, body: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
    .update(body)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}
```

### Exemplo de Payload

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "5511999999999",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [
              {
                "from": "5511888888888",
                "id": "wamid.xxxxx",
                "timestamp": "1640000000",
                "type": "text",
                "text": {
                  "body": "Olá, gostaria de mais informações"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

---

## ⚡ Limites de Taxa

### Limites da API WhatsApp

| Tipo                   | Limite     | Período     |
| ---------------------- | ---------- | ----------- |
| Mensagens de marketing | 1.000      | 24 horas    |
| Mensagens de serviço   | 10.000     | 24 horas    |
| Mensagens de template  | Variável\* | 24 horas    |
| Requisições API        | 80         | Por segundo |

\*Baseado na qualidade da sua conta (Low, Medium, High)

### Limites Lumio

| Operação           | Limite    | Período  |
| ------------------ | --------- | -------- |
| Sync manual        | 10        | Por hora |
| Envio de mensagens | 1.000     | Por hora |
| Webhooks recebidos | Ilimitado | -        |

### Tratamento de Limites

```typescript
// Retry automático com backoff exponencial
{
  "maxRetries": 3,
  "initialDelay": 1000, // ms
  "maxDelay": 30000,
  "backoffMultiplier": 2
}
```

---

## 🐛 Solução de Problemas

### Problemas Comuns

#### 1. Webhook não está recebendo mensagens

**Sintomas:**

- Mensagens não aparecem no Lumio
- Webhook não é chamado

**Soluções:**

```bash
# 1. Verifique se o webhook está configurado corretamente
curl -X GET "https://seu-dominio.com/api/integrations/whatsapp/webhook?hub.verify_token=SEU_TOKEN&hub.challenge=test"

# 2. Verifique os logs do webhook
GET /api/integrations/whatsapp/webhook/logs

# 3. Teste manualmente
POST /api/integrations/whatsapp/webhook/test
```

#### 2. Falha no envio de mensagens

**Sintomas:**

- Erro 403: Forbidden
- Erro 401: Unauthorized

**Soluções:**

1. Verifique se o Access Token é válido
2. Confirme se o número está verificado
3. Verifique se tem permissões corretas no Business Manager

#### 3. Sync lento ou incompleto

**Sintomas:**

- Mensagens antigas não sincronizam
- Sync trava em X%

**Soluções:**

```typescript
// 1. Cancele o sync atual
DELETE /api/integrations/whatsapp/sync?jobId=xxx

// 2. Limpe o cache
POST /api/integrations/whatsapp/cache/clear

// 3. Inicie um sync completo
POST /api/integrations/whatsapp/sync
{
  "mode": "full",
  "syncOptions": { "messages": true }
}
```

### Logs e Debugging

```typescript
// Ativar modo debug
PUT /api/integrations/whatsapp/settings
{
  "debug": true,
  "logLevel": "verbose"
}

// Ver logs
GET /api/integrations/whatsapp/logs?limit=100
```

### Erros da API WhatsApp

| Código | Descrição                    | Solução                           |
| ------ | ---------------------------- | --------------------------------- |
| 100    | Invalid parameter            | Verifique os dados enviados       |
| 130    | Rate limit exceeded          | Aguarde antes de tentar novamente |
| 131    | User rate limit exceeded     | Usuário excedeu limites           |
| 132    | Business rate limit exceeded | Empresa excedeu limites           |
| 190    | Access token expired         | Renove o token                    |

---

## 💡 Melhores Práticas

### 1. Gerenciamento de Templates

```typescript
// Sempre use templates aprovados para mensagens de marketing
const template = {
  name: "welcome_message",
  language: "pt_BR",
  components: [
    {
      type: "body",
      parameters: [{ type: "text", text: "João" }],
    },
  ],
};
```

### 2. Qualidade da Conta

- ✅ Responda rapidamente (< 24h)
- ✅ Mantenha baixa taxa de bloqueio (< 2%)
- ✅ Obtenha opt-in explícito antes de enviar
- ❌ Evite spam
- ❌ Não compre listas de números

### 3. Horários de Envio

```typescript
// Configure horários comerciais
{
  "businessHours": {
    "enabled": true,
    "timezone": "America/Sao_Paulo",
    "schedule": {
      "monday-friday": "09:00-18:00",
      "saturday": "09:00-12:00"
    }
  }
}
```

### 4. Mensagens Personalizadas

```typescript
// Use variáveis para personalização
const message = {
  to: "5511999999999",
  type: "template",
  template: {
    name: "order_update",
    language: "pt_BR",
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: customer.firstName },
          { type: "text", text: order.number },
          { type: "text", text: order.status },
        ],
      },
    ],
  },
};
```

---

## 📊 Métricas e Analytics

### KPIs Disponíveis

- **Taxa de Entrega**: % de mensagens entregues
- **Taxa de Leitura**: % de mensagens lidas
- **Tempo de Resposta**: Tempo médio para responder
- **Volume de Mensagens**: Total de mensagens enviadas/recebidas
- **Taxa de Conversão**: Leads convertidos via WhatsApp

### Dashboard

Acesse: `Dashboard → Insights → WhatsApp Analytics`

Métricas disponíveis:

- Conversas ativas
- Mensagens por dia
- Taxa de resposta
- Qualidade da conta WhatsApp

---

## 🔗 Recursos Adicionais

### Documentação Oficial

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Guide](https://developers.facebook.com/docs/whatsapp/webhooks)

### Exemplos de Código

```typescript
// Enviar mensagem de texto
POST /api/integrations/whatsapp/send
{
  "to": "5511999999999",
  "type": "text",
  "text": {
    "body": "Olá! Como podemos ajudar?"
  }
}

// Enviar imagem
POST /api/integrations/whatsapp/send
{
  "to": "5511999999999",
  "type": "image",
  "image": {
    "link": "https://example.com/image.jpg",
    "caption": "Nosso novo produto!"
  }
}

// Enviar template
POST /api/integrations/whatsapp/send
{
  "to": "5511999999999",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": { "code": "pt_BR" }
  }
}
```

---

## 🆘 Suporte

### Canais de Suporte

- **Email**: suporte@lumio.com
- **Chat**: Disponível no dashboard
- **Documentação**: docs.lumio.com
- **Status**: status.lumio.com

### Horários de Atendimento

- Segunda a Sexta: 9h às 18h (BRT)
- Sábado: 9h às 12h (BRT)
- Domingo: Fechado

### SLA

| Prioridade | Tempo de Resposta | Tempo de Resolução |
| ---------- | ----------------- | ------------------ |
| Crítico    | 1 hora            | 4 horas            |
| Alto       | 4 horas           | 1 dia útil         |
| Médio      | 1 dia útil        | 3 dias úteis       |
| Baixo      | 2 dias úteis      | 5 dias úteis       |

---

## 📝 Changelog

### v1.0.0 (Janeiro 2025)

- ✨ Lançamento inicial
- ✅ Envio de mensagens de texto, imagem e documento
- ✅ Templates do WhatsApp
- ✅ Webhooks em tempo real
- ✅ Sincronização de histórico
- ✅ Integração com Marvin AI

### Próximas Funcionalidades

- 🚧 Mensagens de áudio e vídeo
- 🚧 Botões interativos
- 🚧 Listas de opções
- 🚧 Catálogo de produtos
- 🚧 Pagamentos via WhatsApp

---

**Última atualização:** Janeiro 2025  
**Versão do documento:** 1.0.0  
**Mantido por:** Equipe Lumio
