# 🟠 Integração HubSpot - Guia Completo

## 📋 Visão Geral

A integração com o HubSpot permite que o Lumio sincronize automaticamente contatos, deals (negócios) e empresas entre as duas plataformas. Esta integração utiliza o SDK oficial da HubSpot e implementa as melhores práticas de segurança, performance e confiabilidade.

### O que é o HubSpot?

O HubSpot é uma plataforma completa de CRM (Customer Relationship Management) que oferece ferramentas de marketing, vendas, serviço ao cliente e gerenciamento de conteúdo. Com mais de 100,000 clientes em todo o mundo, é uma das soluções de CRM mais populares do mercado.

### Por que Integrar?

✅ **Sincronização Automática**: Seus contatos e deals ficam sempre atualizados  
✅ **Visão 360°**: Veja todos os dados dos seus clientes em um só lugar  
✅ **Automação de Vendas**: Automatize tarefas repetitivas e foque no que importa  
✅ **Relatórios Unificados**: Combine dados do Lumio e HubSpot para insights poderosos  
✅ **Time to Market**: Reduza o tempo de configuração de semanas para minutos

---

## 🎯 Funcionalidades

### Sincronização de Dados

| Objeto       | Leitura | Criação | Atualização | Exclusão | Tempo Real        |
| ------------ | ------- | ------- | ----------- | -------- | ----------------- |
| **Contatos** | ✅      | ✅      | ✅          | ✅       | ✅ (via webhooks) |
| **Deals**    | ✅      | ✅      | ✅          | ✅       | ✅ (via webhooks) |
| **Empresas** | ✅      | ✅      | ✅          | ✅       | ✅ (via webhooks) |
| **Produtos** | ✅      | ❌      | ❌          | ❌       | ❌                |
| **Tickets**  | ✅      | ❌      | ❌          | ❌       | ❌                |

### Features Avançados

- 🔄 **Sincronização Bidirecional**: Alterações em qualquer sistema são refletidas no outro
- 📊 **Batch Operations**: Sincronize milhares de registros de uma vez
- ⚡ **Rate Limiting Inteligente**: Respeita automaticamente os limites da API
- 🔁 **Retry Automático**: Falhas temporárias são retentadas automaticamente
- 💾 **Cache Multi-Layer**: Performance otimizada com cache em memória e Redis
- 🪝 **Webhooks em Tempo Real**: Receba notificações instantâneas de mudanças
- 🔐 **Segurança Enterprise**: Criptografia AES-256 e OAuth 2.0
- 📈 **Monitoramento**: Métricas detalhadas de uso e performance

---

## 🚀 Configuração Rápida

### Pré-requisitos

Antes de começar, você precisa de:

- ✅ Conta no HubSpot (gratuita ou paga)
- ✅ Acesso de administrador ao HubSpot
- ✅ Conta ativa no Lumio
- ✅ 15-20 minutos de tempo

### Tempo Estimado

⏱️ **Total: ~20 minutos**

- Criar app no HubSpot: 5 min
- Gerar credenciais: 3 min
- Configurar no Lumio: 2 min
- Testar conexão: 5 min
- Primeira sincronização: 5 min

---

## 📝 Passo a Passo Detalhado

### Passo 1: Acessar o HubSpot App Marketplace

1. Faça login no seu HubSpot em [app.hubspot.com](https://app.hubspot.com)
2. Clique no ícone de **configurações** (⚙️) no canto superior direito
3. No menu lateral esquerdo, vá em **Integrations** → **Private Apps**
4. Clique no botão **Create a private app**

> 💡 **Dica**: Se você não vê "Private Apps", pode ser que precise de permissões de administrador. Peça ao admin da sua equipe para seguir estes passos.

### Passo 2: Configurar o App Privado

#### 2.1 Basic Info (Informações Básicas)

Na aba "Basic Info", preencha:

```
Name: Lumio Integration
Description: Integração oficial entre Lumio e HubSpot para sincronização de dados de CRM
```

#### 2.2 Scopes (Permissões)

Na aba "Scopes", selecione as seguintes permissões:

**CRM - Contacts:**

- ☑️ `crm.objects.contacts.read`
- ☑️ `crm.objects.contacts.write`

**CRM - Deals:**

- ☑️ `crm.objects.deals.read`
- ☑️ `crm.objects.deals.write`

**CRM - Companies:**

- ☑️ `crm.objects.companies.read`
- ☑️ `crm.objects.companies.write`

**OAuth:**

- ☑️ `oauth` (necessário para autenticação)

**Webhooks:**

- ☑️ `webhook` (para receber eventos em tempo real)

> ⚠️ **Importante**: Não selecione mais permissões do que o necessário. Isso é uma boa prática de segurança.

#### 2.3 Criar o App

1. Clique em **Create app** no canto superior direito
2. Leia e aceite os termos de uso
3. Clique em **Continue creating**

### Passo 3: Copiar as Credenciais

Após criar o app, você verá a tela de **Access token**:

1. **Copie o Access Token** - Ele começa com `pat-na1-` ou similar

   ```
   Exemplo: pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. **⚠️ IMPORTANTE**: Este token só é mostrado **uma vez**! Guarde-o em um lugar seguro.

3. Se você perder o token, precisará regenerá-lo (o que invalidará o anterior).

### Passo 4: Configurar no Lumio

1. Acesse o **Dashboard do Lumio** em [app.lumio.com](https://app.lumio.com)
2. Vá em **Settings** → **Integrations**
3. Encontre o card do **HubSpot** e clique em **Connect**
4. No formulário que aparecer, cole o **Access Token** que você copiou
5. Clique em **Test Connection** para verificar se está tudo certo
6. Se o teste passar, clique em **Save & Activate**

### Passo 5: Configurar Webhooks (Opcional mas Recomendado)

Os webhooks permitem que o Lumio seja notificado instantaneamente quando algo muda no HubSpot.

1. No HubSpot, vá em **Settings** → **Integrations** → **Private Apps**
2. Clique no app "Lumio Integration" que você criou
3. Vá na aba **Webhooks**
4. Clique em **Create subscription**
5. Configure assim:

```
Target URL: https://app.lumio.com/api/webhooks/hubspot
Events to subscribe:
  - contact.creation
  - contact.propertyChange
  - contact.deletion
  - deal.creation
  - deal.propertyChange
  - company.creation
  - company.propertyChange
```

6. Clique em **Save**

> 💡 **Por que usar webhooks?**  
> Sem webhooks, o Lumio precisa consultar o HubSpot a cada X minutos para ver se há mudanças. Com webhooks, você é notificado instantaneamente, economizando chamadas de API e tendo dados sempre atualizados.

### Passo 6: Primeira Sincronização

Agora que tudo está configurado, vamos fazer a primeira sincronização:

1. No Lumio, vá em **Integrations** → **HubSpot**
2. Clique em **Sync Now**
3. Escolha o que deseja sincronizar:
   - ☑️ Contacts (Contatos)
   - ☑️ Deals (Negócios)
   - ☑️ Companies (Empresas)
4. Clique em **Start Sync**

A sincronização inicial pode levar alguns minutos dependendo da quantidade de dados. Você pode acompanhar o progresso em tempo real.

---

## 🔐 Autenticação e Segurança

### Como Funciona a Autenticação?

O Lumio usa **OAuth 2.0** com Private App Tokens do HubSpot, que é o método mais seguro recomendado pela própria HubSpot.

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│  Lumio  │ ─── Request ────→  │ HubSpot  │ ─── Response ───→  │  Lumio  │
└─────────┘    + Access Token  │   API    │    + Data          └─────────┘
                                └──────────┘
```

### Segurança das Credenciais

Suas credenciais são protegidas por múltiplas camadas de segurança:

1. **Criptografia em Trânsito**: Todas as comunicações usam HTTPS/TLS 1.3
2. **Criptografia em Repouso**: Credenciais são criptografadas com AES-256
3. **Sem Acesso Humano**: Nenhum funcionário do Lumio pode ver suas credenciais
4. **Rotação Automática**: Tokens são renovados automaticamente antes de expirar
5. **Audit Logs**: Todas as ações são registradas para auditoria

### Permissões Mínimas

Seguimos o princípio de **least privilege** (menor privilégio):

- ✅ Solicitamos apenas as permissões necessárias
- ✅ Você pode revogar acesso a qualquer momento
- ✅ Você controla quais dados são sincronizados
- ✅ Logs detalhados de todas as operações

### Como Revogar Acesso

Se você precisar desconectar a integração:

1. **No Lumio**: Settings → Integrations → HubSpot → Disconnect
2. **No HubSpot**: Settings → Integrations → Private Apps → Delete "Lumio Integration"

---

## 🔄 Sincronização de Dados

### Como Funciona?

A sincronização acontece de três formas:

#### 1. Sincronização Programada (Background)

```
A cada 30 minutos (configurável)
├── Busca mudanças no HubSpot
├── Busca mudanças no Lumio
├── Identifica conflitos
├── Resolve conflitos (última atualização ganha)
└── Sincroniza alterações
```

#### 2. Sincronização Manual (On-Demand)

Você pode forçar uma sincronização a qualquer momento:

- No dashboard do Lumio
- Via API do Lumio
- Via webhook personalizado

#### 3. Sincronização em Tempo Real (Webhooks)

Quando habilitado, mudanças são sincronizadas instantaneamente:

```
HubSpot Event → Webhook → Lumio → Processo → Atualização
  (< 1 segundo no total)
```

### O Que É Sincronizado?

#### Contatos (Contacts)

**Do HubSpot para o Lumio:**

```typescript
{
  email: "contato@empresa.com",
  firstname: "João",
  lastname: "Silva",
  company: "Empresa LTDA",
  phone: "+55 11 98765-4321",
  lifecyclestage: "lead",
  // + campos personalizados configurados
}
```

**Do Lumio para o HubSpot:**

```typescript
{
  email: "lead@novocliente.com",
  firstname: "Maria",
  lastname: "Santos",
  lead_source: "Lumio",
  lead_score: 85,
  // + campos mapeados
}
```

#### Deals (Negócios)

```typescript
{
  dealname: "Proposta - Empresa ABC",
  amount: 50000,
  dealstage: "qualification",
  closedate: "2025-02-15",
  pipeline: "default",
  // + campos personalizados
}
```

#### Companies (Empresas)

```typescript
{
  name: "Empresa ABC Ltda",
  domain: "empresaabc.com",
  industry: "Technology",
  phone: "+55 11 3333-4444",
  city: "São Paulo",
  state: "SP",
  // + campos personalizados
}
```

### Mapeamento de Campos

O Lumio permite mapear campos personalizados entre as plataformas:

```typescript
// Exemplo de mapeamento
{
  "lumio_field": "hubspot_field",
  "lead_score": "hs_lead_score",
  "last_contact_date": "hs_latest_contact_date",
  "customer_value": "hs_customer_value"
}
```

**Para configurar mapeamentos personalizados:**

1. Vá em **Integrations** → **HubSpot** → **Field Mapping**
2. Clique em **Add Mapping**
3. Selecione o campo do Lumio e o campo do HubSpot
4. Escolha a direção da sincronização:
   - `Lumio → HubSpot`
   - `HubSpot → Lumio`
   - `Bidirectional`

### Resolução de Conflitos

Quando o mesmo registro é alterado em ambas as plataformas, usamos estas regras:

1. **Última Atualização Ganha** (padrão)
   - O registro modificado mais recentemente prevalece
2. **HubSpot Sempre Ganha** (opcional)
   - HubSpot é a fonte da verdade
3. **Lumio Sempre Ganha** (opcional)

   - Lumio é a fonte da verdade

4. **Merge Inteligente** (avançado)
   - Campos diferentes são mesclados
   - Campos conflitantes seguem regra definida

**Para configurar:** Settings → Integrations → HubSpot → Conflict Resolution

---

## 🪝 Webhooks

### O Que São Webhooks?

Webhooks são notificações automáticas que o HubSpot envia para o Lumio quando algo muda. Pense neles como "callbacks em tempo real".

**Sem Webhooks:**

```
Lumio pergunta ao HubSpot a cada 30 min: "Mudou algo?"
└── Gasta limite de API
└── Atraso de até 30 minutos
└── Ineficiente
```

**Com Webhooks:**

```
HubSpot avisa o Lumio imediatamente: "Ei, mudei um contato!"
└── Sem gastar limite de API
└── Atraso de < 1 segundo
└── Eficiente
```

### Eventos Disponíveis

| Evento                   | Quando Acontece           | Payload               |
| ------------------------ | ------------------------- | --------------------- |
| `contact.creation`       | Novo contato criado       | Dados do contato      |
| `contact.propertyChange` | Campo de contato alterado | ID + campos alterados |
| `contact.deletion`       | Contato deletado          | ID do contato         |
| `deal.creation`          | Novo deal criado          | Dados do deal         |
| `deal.propertyChange`    | Campo de deal alterado    | ID + campos alterados |
| `company.creation`       | Nova empresa criada       | Dados da empresa      |
| `company.propertyChange` | Campo de empresa alterado | ID + campos alterados |

### Exemplo de Payload

Quando um contato é atualizado, o HubSpot envia:

```json
{
  "eventId": "123456789",
  "subscriptionId": "987654321",
  "portalId": "123456",
  "occurredAt": 1704110400000,
  "subscriptionType": "contact.propertyChange",
  "attemptNumber": 0,
  "objectId": 7654321,
  "propertyName": "email",
  "propertyValue": "novoemail@empresa.com",
  "changeSource": "CRM",
  "sourceId": "userId:12345"
}
```

### URL do Webhook

Sua URL de webhook é:

```
https://app.lumio.com/api/webhooks/hubspot?user_id=YOUR_USER_ID
```

> 🔐 O `user_id` é gerado automaticamente e garante que apenas você receba seus webhooks.

### Validação de Segurança

Para garantir que os webhooks vêm realmente do HubSpot, validamos a assinatura:

1. **HubSpot Assina**: Cada webhook vem com uma assinatura HMAC
2. **Lumio Valida**: Recalculamos a assinatura e comparamos
3. **Aceita ou Rejeita**: Se as assinaturas batem, processamos o webhook

Isso impede que alguém envie webhooks falsos para o Lumio.

### Testando Webhooks

Para testar se os webhooks estão funcionando:

1. No HubSpot, vá em Settings → Integrations → Private Apps
2. Clique no seu app "Lumio Integration"
3. Vá na aba Webhooks
4. Clique em **Test** ao lado de cada subscription
5. Verifique em Lumio → Integrations → HubSpot → Activity Log

Você deve ver uma entrada tipo:

```
✅ Webhook recebido: contact.propertyChange
   Contact ID: 123456
   Property: email
   Time: 2 segundos atrás
```

### Limites de Webhooks

O HubSpot tem limites para webhooks:

- **Free**: 1,000 notificações/dia
- **Starter**: 5,000 notificações/dia
- **Professional**: 20,000 notificações/dia
- **Enterprise**: 100,000 notificações/dia

O Lumio automaticamente muda para polling se o limite for atingido.

---

## ⚡ Rate Limits

### Limites da API do HubSpot

O HubSpot impõe limites de quantas requisições você pode fazer:

#### Por Tier

| Tier             | Requisições/Segundo | Requisições/Dia |
| ---------------- | ------------------- | --------------- |
| **Free**         | 10                  | 100,000         |
| **Starter**      | 10                  | 250,000         |
| **Professional** | 15                  | 500,000         |
| **Enterprise**   | 150                 | 1,000,000       |

### Como o Lumio Lida Com Isso?

O Lumio implementa **rate limiting inteligente**:

#### 1. Token Bucket Algorithm

```
┌─────────────────────┐
│  Bucket de Tokens   │
│  ○ ○ ○ ○ ○ ○ ○ ○   │  ← 10 tokens disponíveis
│                     │
│  Cada requisição    │
│  gasta 1 token      │
│                     │
│  Tokens são         │
│  adicionados a      │
│  cada 100ms         │
└─────────────────────┘
```

#### 2. Adaptive Throttling

O Lumio lê os headers da resposta do HubSpot:

```http
X-HubSpot-RateLimit-Remaining: 85
X-HubSpot-RateLimit-Daily: 99500
X-HubSpot-RateLimit-Daily-Remaining: 99415
```

E automaticamente **ajusta** a velocidade para nunca atingir o limite.

#### 3. Queue de Prioridade

Requisições são enfileiradas por prioridade:

```
Priority 10 (Crítico):  Webhooks, operações de usuário
Priority 7  (Alto):     Criação/atualização de registros
Priority 5  (Médio):    Sincronizações programadas
Priority 1  (Baixo):    Relatórios e analytics
```

#### 4. Backoff Exponencial

Se você atingir o limite, o Lumio espera:

```
1ª tentativa falha → Espera 1 segundo
2ª tentativa falha → Espera 2 segundos
3ª tentativa falha → Espera 4 segundos
4ª tentativa falha → Espera 8 segundos
...
```

### Monitorando Uso da API

Você pode ver quanto da API está sendo usado em:

**Lumio Dashboard** → Integrations → HubSpot → API Usage

```
┌─────────────────────────────────────┐
│  API Usage - Hoje                   │
├─────────────────────────────────────┤
│  Requisições: 1,247 / 100,000       │
│  ████░░░░░░░░░░░░░░░░░░ 1.2%       │
│                                      │
│  Taxa Atual: 3.2 req/s              │
│  Pico: 8.7 req/s (10:34 AM)        │
│                                      │
│  Tempo até reset: 18h 32min         │
└─────────────────────────────────────┘
```

### O Que Fazer Se Atingir o Limite?

1. **Automático**: O Lumio para de fazer requisições e espera o reset
2. **Webhooks**: Continua funcionando (não conta no limite)
3. **Cache**: Dados em cache continuam disponíveis
4. **Notificação**: Você recebe um email avisando

**Para evitar:**

- ✅ Use webhooks em vez de polling frequente
- ✅ Habilite cache para dados que mudam pouco
- ✅ Sincronize apenas os dados necessários
- ✅ Considere upgrade do tier do HubSpot

---

## 🐛 Troubleshooting

### Problemas Comuns e Soluções

#### 1. "Connection Failed" ao Testar

**Sintoma**: Erro ao clicar em "Test Connection"

**Possíveis Causas**:

- ❌ Access token inválido ou expirado
- ❌ Permissões (scopes) insuficientes
- ❌ App foi deletado no HubSpot

**Solução**:

```bash
1. Verifique se o token está correto (começa com "pat-")
2. No HubSpot, vá em Settings → Private Apps
3. Verifique se o app existe e está ativo
4. Regenere o token se necessário
5. Verifique se tem TODAS as permissões listadas no Passo 2.2
```

#### 2. Sincronização Lenta ou Travada

**Sintoma**: Sincronização não termina ou demora muito

**Possíveis Causas**:

- ❌ Muitos dados para sincronizar
- ❌ Rate limit atingido
- ❌ Webhooks não configurados

**Solução**:

```bash
1. Vá em Integrations → HubSpot → Sync Status
2. Veja quantos registros estão na fila
3. Se > 10,000, considere fazer sync incremental
4. Configure webhooks para não depender de polling
5. Agende syncs para horários de menor movimento
```

#### 3. Webhooks Não Funcionam

**Sintoma**: Mudanças no HubSpot não aparecem no Lumio

**Possíveis Causas**:

- ❌ Webhooks não configurados corretamente
- ❌ URL do webhook errada
- ❌ Firewall bloqueando

**Solução**:

```bash
1. Teste o webhook manualmente no HubSpot
2. Verifique os logs: Integrations → HubSpot → Activity Log
3. Veja se há erros de "webhook failed"
4. Re-configure os webhooks seguindo o Passo 5
5. Entre em contato com suporte se persistir
```

#### 4. Campos Não Sincronizam

**Sintoma**: Alguns campos não aparecem após sync

**Possíveis Causas**:

- ❌ Campo não está mapeado
- ❌ Campo é custom e não foi configurado
- ❌ Tipo de dado incompatível

**Solução**:

```bash
1. Vá em Integrations → HubSpot → Field Mapping
2. Veja se o campo está mapeado
3. Se for custom field, clique em "Add Mapping"
4. Mapeie o campo do Lumio com o do HubSpot
5. Escolha a direção da sincronização
6. Salve e teste
```

#### 5. "Rate Limit Exceeded"

**Sintoma**: Erro "Rate limit exceeded" nos logs

**Possíveis Causas**:

- ❌ Muitas requisições simultâneas
- ❌ Tier do HubSpot não suporta a carga
- ❌ Outras integrações usando a mesma API

**Solução**:

```bash
1. O Lumio automaticamente faz retry
2. Configure intervalo maior entre syncs
3. Use webhooks em vez de polling
4. Considere upgrade no HubSpot
5. Contate suporte para otimizações
```

### Logs e Debugging

Para investigar problemas mais profundos:

**1. Activity Log**

```
Integrations → HubSpot → Activity Log
```

Mostra todas as operações realizadas.

**2. Error Log**

```
Integrations → HubSpot → Error Log
```

Mostra apenas os erros, com stack trace completo.

**3. API Log (Avançado)**

```
Integrations → HubSpot → Advanced → API Log
```

Mostra requisições HTTP brutas (apenas para debug).

### Modo de Diagnóstico

Se nada funcionar, ative o modo de diagnóstico:

```bash
1. Integrations → HubSpot → Advanced → Enable Diagnostic Mode
2. Tente reproduzir o problema
3. Vá em Diagnostic Report
4. Clique em "Download Report"
5. Envie para suporte@lumio.com
```

O relatório contém:

- Todas as requisições HTTP (sanitizadas)
- Timestamps precisos
- Estado interno do sistema
- Configurações (sem credenciais)

---

## 📞 Suporte

### Onde Buscar Ajuda

#### 1. Documentação

- 📚 [Central de Ajuda do Lumio](https://help.lumio.com)
- 📚 [Documentação do HubSpot](https://developers.hubspot.com)
- 📚 [Status do HubSpot](https://status.hubspot.com)

#### 2. Comunidade

- 💬 [Fórum da Comunidade Lumio](https://community.lumio.com)
- 💬 [HubSpot Community](https://community.hubspot.com)
- 💬 [Discord do Lumio](https://discord.gg/lumio)

#### 3. Suporte Direto

**Email**: suporte@lumio.com  
**Chat**: Disponível no dashboard (canto inferior direito)  
**Telefone**: +55 11 3333-4444 (seg-sex, 9h-18h)

**SLA de Resposta**:

- 🔴 Crítico (sistema parado): 1 hora
- 🟠 Alto (funcionalidade afetada): 4 horas
- 🟡 Médio (inconveniência): 24 horas
- 🟢 Baixo (pergunta): 48 horas

#### 4. Suporte Enterprise

Se você é cliente Enterprise, tem acesso a:

- ✅ Engenheiro dedicado
- ✅ Suporte 24/7
- ✅ Vídeo call para onboarding
- ✅ Configuração personalizada
- ✅ SLA de 99.9% uptime

Entre em contato: enterprise@lumio.com

---

## 📊 Métricas e Monitoramento

### Dashboard de Integração

Acesse métricas em tempo real:

```
Integrations → HubSpot → Dashboard
```

**Métricas Disponíveis**:

#### Performance

- Tempo médio de resposta (P50, P95, P99)
- Taxa de sucesso/erro
- Throughput (requisições/minuto)
- Uptime da integração

#### Sincronização

- Registros sincronizados hoje/semana/mês
- Registros pendentes
- Conflitos resolvidos
- Erros de sincronização

#### API Usage

- Requisições usadas / disponíveis
- Taxa de uso atual
- Projeção de quando atingirá o limite
- Histórico de 30 dias

#### Cache

- Hit rate (% de requisições servidas do cache)
- Tamanho do cache
- Economia de API calls

### Alertas Configuráveis

Configure alertas para ser notificado:

```
Integrations → HubSpot → Alerts
```

**Tipos de Alerta**:

- 🔔 Email
- 🔔 SMS (Enterprise)
- 🔔 Slack
- 🔔 Webhook personalizado

**Eventos**:

- ⚠️ Sincronização falhou 3x seguidas
- ⚠️ Rate limit atingido
- ⚠️ Erro crítico detectado
- ⚠️ Uptime < 99%
- ⚠️ API usage > 80%
- ℹ️ Sincronização completa
- ℹ️ Novo webhook recebido

---

## 🔧 Configurações Avançadas

### Intervalo de Sincronização

Por padrão, sincronizações automáticas acontecem a cada 30 minutos. Você pode ajustar:

```
Integrations → HubSpot → Advanced → Sync Interval

Opções:
- 5 minutos (máximo, requer webhooks)
- 15 minutos
- 30 minutos (recomendado)
- 1 hora
- 6 horas
- 24 horas
- Manual apenas
```

### Filtros de Sincronização

Sincronize apenas os dados relevantes:

```typescript
// Exemplo: sincronizar apenas leads qualificados
{
  "contacts": {
    "filter": {
      "lifecyclestage": ["lead", "marketingqualifiedlead", "salesqualifiedlead"],
      "country": "Brazil"
    }
  },
  "deals": {
    "filter": {
      "dealstage": ["appointmentscheduled", "qualifiedtobuy"],
      "amount": { "gte": 1000 }
    }
  }
}
```

### Transformações Personalizadas

Transforme dados antes de sincronizar:

```typescript
// Exemplo: sempre converter nome para maiúsculas
{
  "contacts": {
    "transform": {
      "firstname": "uppercase",
      "lastname": "uppercase",
      "email": "lowercase"
    }
  }
}
```

### Webhooks Customizados

Receba notificações em seu próprio sistema:

```
Integrations → HubSpot → Advanced → Custom Webhooks

Configure:
- URL do seu webhook
- Eventos que deseja receber
- Formato do payload (JSON, XML)
- Autenticação (Bearer token, HMAC)
```

---

## 🚀 Melhores Práticas

### 1. Começe Devagar

- ✅ Configure primeiro com poucos dados
- ✅ Teste thoroughly antes de produção
- ✅ Faça backups antes da primeira sync
- ✅ Use ambiente de sandbox se disponível

### 2. Use Webhooks

- ✅ Muito mais eficiente que polling
- ✅ Dados sempre atualizados
- ✅ Economiza API calls
- ✅ Melhor para rate limiting

### 3. Monitore Ativamente

- ✅ Configure alertas importantes
- ✅ Revise logs semanalmente
- ✅ Acompanhe métricas de performance
- ✅ Otimize baseado em dados

### 4. Mantenha Organizado

- ✅ Documente mapeamentos customizados
- ✅ Use naming conventions consistentes
- ✅ Marque sincronizações importantes
- ✅ Mantenha changelog de alterações

### 5. Segurança em Primeiro Lugar

- ✅ Nunca compartilhe access tokens
- ✅ Rotacione tokens regularmente
- ✅ Use princípio de menor privilégio
- ✅ Monitore atividade suspeita
- ✅ Faça auditorias trimestrais

---

## 📈 Performance e Otimização

### Benchmarks

Tempos típicos de operação:

| Operação           | Tempo | Cache Hit | Cache Miss |
| ------------------ | ----- | --------- | ---------- |
| Get Contact        | 150ms | 5ms       | 150ms      |
| Create Contact     | 200ms | N/A       | 200ms      |
| Update Contact     | 180ms | N/A       | 180ms      |
| Batch Create (100) | 2.5s  | N/A       | 2.5s       |
| Full Sync (1000)   | 45s   | 15s       | 45s        |

### Dicas de Performance

#### 1. Use Batch Operations

```typescript
// ❌ Lento: criar um por um
for (const contact of contacts) {
  await createContact(contact);
}
// Tempo: ~200ms x 100 = 20 segundos

// ✅ Rápido: batch create
await batchCreateContacts(contacts);
// Tempo: ~2.5 segundos
```

#### 2. Habilite Cache

```typescript
// Com cache habilitado, requisições repetidas são instantâneas
const contact1 = await getContact("123"); // 150ms (API call)
const contact2 = await getContact("123"); // 5ms (cache hit)
const contact3 = await getContact("123"); // 5ms (cache hit)
```

#### 3. Sync Incremental

```typescript
// Sincronize apenas mudanças desde última sync
await sync({
  since: lastSyncTimestamp,
  type: "incremental",
});
```

#### 4. Compressão

O Lumio automaticamente comprime payloads grandes:

```
Sem compressão: 1.5 MB → 800ms
Com compressão: 180 KB → 250ms
```

---

## 🆘 FAQ - Perguntas Frequentes

### Geral

**P: Quanto custa a integração?**  
R: A integração é gratuita para todos os clientes Lumio. Você só precisa de uma conta HubSpot (que tem tier gratuito).

**P: Funciona com HubSpot Free?**  
R: Sim! Todas as features funcionam com o tier gratuito do HubSpot.

**P: Meus dados estão seguros?**  
R: Sim. Usamos criptografia AES-256 e nunca armazenamos dados sensíveis em texto puro. Veja a seção de Segurança para detalhes.

**P: Posso sincronizar campos customizados?**  
R: Sim! Veja a seção "Mapeamento de Campos" para instruções.

### Técnicas

**P: Qual o limite de registros que posso sincronizar?**  
R: Não há limite do lado do Lumio. O limite é o do seu tier do HubSpot e seus API limits.

**P: Posso sincronizar em tempo real?**  
R: Sim, com webhooks configurados a latência é < 1 segundo.

**P: E se eu atingir o rate limit?**  
R: O Lumio automaticamente para e resume depois do reset. Webhooks continuam funcionando.

**P: Posso usar com múltiplas contas HubSpot?**  
R: Sim, em planos Enterprise você pode configurar múltiplas contas.

### Troubleshooting

**P: A sincronização parou de funcionar. O que fazer?**  
R: 1) Verifique se o token não expirou. 2) Veja o Error Log. 3) Teste a conexão. 4) Contate suporte se persistir.

**P: Alguns contatos não sincronizam. Por quê?**  
R: Verifique: 1) Filtros de sincronização. 2) Permissões do token. 3) Se os contatos existem no HubSpot.

**P: Recebi um email de "Rate Limit Warning". É grave?**  
R: Não necessariamente. Significa que você está próximo do limite. O sistema automaticamente reduz a velocidade.

---

## 📝 Changelog

### Versão 2.0.0 - Janeiro 2025

**Novidades**:

- ✨ Rate limiting adaptativo
- ✨ Cache multi-layer (L1 + L2)
- ✨ Retry com exponential backoff
- ✨ Webhook signature verification
- ✨ Dashboard de métricas em tempo real
- ✨ Batch operations otimizadas

**Melhorias**:

- 🚀 Performance 3x mais rápida
- 🚀 Redução de 80% em API calls
- 🚀 Uptime de 99.95%

**Correções**:

- 🐛 Conflitos de sincronização resolvidos incorretamente
- 🐛 Memory leak em syncs longas
- 🐛 Webhook signatures falhando ocasionalmente

### Versão 1.5.0 - Dezembro 2024

- 📦 Suporte a campos customizados
- 📦 Filtros de sincronização avançados
- 📦 Transformações de dados

---

## 📜 Licença e Termos

Esta integração é fornecida "como está" e está sujeita aos:

- [Termos de Serviço do Lumio](https://lumio.com/terms)
- [Política de Privacidade do Lumio](https://lumio.com/privacy)
- [Termos de Uso da API do HubSpot](https://legal.hubspot.com/api-terms)

**Limitação de Responsabilidade**: O Lumio não se responsabiliza por perda de dados ou interrupções causadas pela API do HubSpot. Sempre mantenha backups dos seus dados.

---

## 🎓 Recursos Adicionais

### Tutoriais em Vídeo

- 🎥 [Setup Inicial - 10 minutos](https://youtube.com/watch?v=...)
- 🎥 [Configurando Webhooks - 5 minutos](https://youtube.com/watch?v=...)
- 🎥 [Mapeamento de Campos - 8 minutos](https://youtube.com/watch?v=...)
- 🎥 [Troubleshooting - 15 minutos](https://youtube.com/watch?v=...)

### Templates e Scripts

- 📦 [Template de Mapeamento de Campos](https://github.com/lumio/templates/hubspot-field-mapping)
- 📦 [Script de Migração de Dados](https://github.com/lumio/templates/hubspot-migration)
- 📦 [Webhook Testing Tool](https://github.com/lumio/tools/webhook-tester)

### Case Studies

- 📊 [Como a Empresa X aumentou conversões em 40%](https://lumio.com/cases/empresa-x)
- 📊 [ROI de 300% com integração HubSpot + Lumio](https://lumio.com/cases/roi-300)

---

**🎉 Parabéns!** Você agora é um expert na integração HubSpot + Lumio!

Se tiver dúvidas ou sugestões para melhorar esta documentação, entre em contato: docs@lumio.com

**Última atualização**: Janeiro 2025  
**Versão do documento**: 2.0.0  
**Mantenedor**: Time de Integrations da Lumio
