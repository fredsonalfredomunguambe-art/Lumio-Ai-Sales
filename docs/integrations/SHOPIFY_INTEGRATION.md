# Integração Shopify - Guia Completo

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
7. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral

A integração Shopify conecta sua loja online ao Lumio para:

- Sincronizar clientes como leads
- Importar pedidos e produtos
- Rastrear métricas de e-commerce
- Automatizar follow-ups pós-compra

### Benefícios

- 📊 **Analytics Unificado**: Veja métricas de e-commerce no dashboard
- 🎯 **Lead Scoring**: Pontue leads baseado em histórico de compras
- 🤖 **Automação**: Campanhas automáticas para abandoned carts
- 💰 **Revenue Tracking**: Acompanhe receita por canal

---

## ✨ Funcionalidades

### Dados Sincronizados

| Tipo                | Descrição                 | Frequência |
| ------------------- | ------------------------- | ---------- |
| Clientes            | Todos os clientes da loja | 30 min     |
| Pedidos             | Histórico de pedidos      | 15 min     |
| Produtos            | Catálogo de produtos      | 1 hora     |
| Carrinho Abandonado | Carrinhos não finalizados | 10 min     |
| Inventário          | Níveis de estoque         | 1 hora     |

### Métricas Disponíveis

- Revenue total e por período
- Average Order Value (AOV)
- Taxa de conversão
- Customer Lifetime Value (LTV)
- Taxa de abandoned cart

---

## 🚀 Configuração Rápida

### Pré-requisitos

1. Loja Shopify ativa
2. Plano Shopify Basic ou superior
3. Permissões de administrador

### Passo a Passo

#### 1. Instalar App Lumio no Shopify

```bash
# 1. Acesse o admin da sua loja
https://sua-loja.myshopify.com/admin

# 2. Vá em Apps → Customize your store

# 3. Procure por "Lumio" ou use o link direto:
https://apps.shopify.com/lumio-integration
```

#### 2. Conectar via OAuth

1. No Lumio, vá em **Configurações → Integrações**
2. Localize **Shopify**
3. Clique em **Conectar**
4. Você será redirecionado para o Shopify
5. Clique em **Instalar app**
6. Autorize as permissões solicitadas

#### 3. Configurar Sincronização

Escolha o que sincronizar:

- ✅ **Clientes**: Importar como leads
- ✅ **Pedidos**: Histórico de compras
- ✅ **Produtos**: Catálogo completo
- ⬜ **Inventário**: Níveis de estoque

---

## 🔐 Autenticação

### OAuth 2.0 (Recomendado)

```typescript
// Fluxo automático via button "Conectar"
const oauthUrl = await fetch("/api/integrations/shopify/oauth");
// Redireciona para autorização no Shopify
```

### API Key Manual (Legado)

```typescript
// Para lojas com apps customizados
{
  "shop": "sua-loja.myshopify.com",
  "accessToken": "shpat_xxxxxxxxxxxx",
  "apiVersion": "2024-01"
}
```

### Permissões Necessárias

- `read_customers` - Ler dados de clientes
- `read_orders` - Ler pedidos
- `read_products` - Ler produtos
- `write_customers` - Atualizar clientes (opcional)
- `read_inventory` - Ler inventário (opcional)

---

## 🔄 Sincronização de Dados

### Mapeamento de Dados

#### Shopify Customer → Lumio Lead

```typescript
{
  // Shopify Customer
  "id": 123456789,
  "email": "cliente@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "phone": "+5511999999999",
  "orders_count": 3,
  "total_spent": "450.00",

  // Mapeado para Lumio Lead
  "firstName": "João",
  "lastName": "Silva",
  "email": "cliente@example.com",
  "phone": "+5511999999999",
  "source": "shopify",
  "externalId": "123456789",
  "score": 85, // Baseado em orders_count e total_spent
  "status": "CONVERTED",
  "syncMetadata": {
    "ordersCount": 3,
    "totalSpent": 450.00,
    "tags": ["VIP", "Newsletter"]
  }
}
```

#### Shopify Order → Lumio Analytics

```typescript
{
  // Shopify Order
  "id": 987654321,
  "order_number": 1001,
  "total_price": "150.00",
  "financial_status": "paid",
  "fulfillment_status": "fulfilled",

  // Armazenado em Analytics
  "type": "REVENUE_FORECAST",
  "data": {
    "source": "shopify",
    "orderId": "987654321",
    "orderNumber": 1001,
    "amount": 150.00,
    "status": "completed",
    "date": "2025-01-10"
  }
}
```

### Sync em Tempo Real vs. Batch

| Método  | Dados                   | Latência  |
| ------- | ----------------------- | --------- |
| Webhook | Novos pedidos, clientes | < 1 min   |
| Batch   | Histórico, produtos     | 15-30 min |
| Manual  | Sob demanda             | Imediato  |

---

## 🎣 Webhooks

### Webhooks Configurados Automaticamente

```bash
# URL do webhook
https://seu-dominio.com/api/integrations/shopify/webhook

# Topics subscritos:
- orders/create
- orders/updated
- customers/create
- customers/updated
- products/create
- products/updated
```

### Eventos Suportados

| Topic               | Ação no Lumio                         |
| ------------------- | ------------------------------------- |
| `orders/create`     | Criar registro de pedido no analytics |
| `orders/updated`    | Atualizar status do pedido            |
| `customers/create`  | Criar novo lead                       |
| `customers/updated` | Atualizar dados do lead               |
| `products/create`   | Adicionar produto ao catálogo         |
| `products/updated`  | Atualizar informações do produto      |

### Verificação de Webhook

```typescript
// Verificação automática de HMAC
import crypto from "crypto";

function verifyShopifyWebhook(hmac: string, body: string): boolean {
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_CLIENT_SECRET!)
    .update(body, "utf8")
    .digest("base64");

  return hash === hmac;
}
```

---

## ⚡ Limites de Taxa

### Limites da API Shopify

| Plano    | Limite   | Cálculo       |
| -------- | -------- | ------------- |
| Basic    | 2 req/s  | Bucket de 40  |
| Shopify  | 2 req/s  | Bucket de 40  |
| Advanced | 4 req/s  | Bucket de 80  |
| Plus     | 10 req/s | Bucket de 200 |

### Tratamento no Lumio

```typescript
// Adaptive rate limiting
{
  "strategy": "leaky-bucket",
  "maxRequests": 40,
  "refillRate": 2, // por segundo
  "retryAfter": true, // Respeita header Retry-After
  "backoff": "exponential"
}
```

---

## 🐛 Solução de Problemas

### Problema: Clientes não sincronizam

**Solução:**

```bash
# 1. Verifique permissões
GET /api/integrations/shopify/permissions

# 2. Force um sync manual
POST /api/integrations/shopify/sync
{
  "syncOptions": { "customers": true },
  "mode": "full"
}

# 3. Verifique logs
GET /api/integrations/shopify/logs
```

### Problema: Webhooks não funcionam

**Solução:**

1. Verifique se o webhook está registrado no Shopify Admin
2. Teste o endpoint manualmente
3. Verifique se o HMAC está sendo validado corretamente

### Problema: Produtos duplicados

**Solução:**

```typescript
// Limpar duplicados
POST /api/integrations/shopify/deduplicate
{
  "type": "products"
}
```

---

## 💡 Melhores Práticas

### 1. Segmentação de Clientes

```typescript
// Crie segmentos baseados em comportamento de compra
const highValueCustomers = {
  criteria: {
    source: "shopify",
    totalSpent: { $gte: 1000 },
    ordersCount: { $gte: 3 },
  },
};
```

### 2. Abandoned Cart Recovery

```typescript
// Configure automação para carrinhos abandonados
const abandonedCartCampaign = {
  trigger: "abandoned_cart",
  delay: "1 hour",
  channel: "email",
  template: "abandoned_cart_reminder",
};
```

### 3. Product Recommendations

```typescript
// Use dados de pedidos para recomendações
const recommendations = {
  basedOn: "purchase_history",
  algorithm: "collaborative_filtering",
  maxItems: 5,
};
```

---

## 📊 Métricas no Dashboard

Acesse: `Dashboard → Insights → E-commerce`

### KPIs Disponíveis

- **Revenue**: Receita total do período
- **Orders**: Total de pedidos
- **AOV**: Valor médio do pedido
- **Conversion Rate**: Taxa de conversão
- **Top Products**: Produtos mais vendidos
- **Customer LTV**: Lifetime value médio

### Relatórios Personalizados

- Revenue por canal de marketing
- Performance de produtos
- Análise de coorte de clientes
- Previsão de vendas

---

## 🔗 Recursos Adicionais

- [Documentação Oficial Shopify](https://shopify.dev/docs)
- [API Reference](https://shopify.dev/api)
- [Webhook Guide](https://shopify.dev/api/admin-rest/webhooks)

---

## 🆘 Suporte

**Email**: suporte@lumio.com  
**Chat**: Disponível no dashboard  
**Docs**: docs.lumio.com

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe Lumio
