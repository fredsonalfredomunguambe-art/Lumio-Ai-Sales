# Integração Slack - Guia Completo

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025

---

## 🎯 Visão Geral

Receba notificações e alertas do Lumio diretamente no Slack para manter sua equipe sempre informada.

### Benefícios

- 🔔 **Notificações em Tempo Real**: Novos leads, conversões, alertas
- 📊 **Daily Digests**: Resumo diário de métricas
- 🤖 **Comandos**: Interaja com Lumio via slash commands
- 👥 **Colaboração**: Compartilhe insights com o time

---

## ✨ Funcionalidades

| Funcionalidade | Descrição                  | Status      |
| -------------- | -------------------------- | ----------- |
| Notificações   | Alertas customizáveis      | ✅ Ativo    |
| Daily Digest   | Resumo diário 9h AM        | ✅ Ativo    |
| Slash Commands | /lumio stats, /lumio leads | 🚧 Em breve |
| Bot Interativo | Perguntas e respostas      | 🚧 Em breve |

---

## 🚀 Configuração Rápida

### Instalar App Slack

1. **Lumio**: Configurações → Integrações → Slack
2. Clique em **Add to Slack**
3. **Slack**: Selecione o workspace
4. **Autorizar**: Permita acesso aos canais
5. **Configurar**: Escolha canais para notificações

### Canais Recomendados

```typescript
{
  "channels": {
    "leads": "#vendas",          // Novos leads
    "conversions": "#sucesso",    // Conversões
    "alerts": "#alertas",         // Alertas importantes
    "daily": "#geral"             // Digest diário
  }
}
```

---

## 🔔 Tipos de Notificação

### 1. Novo Lead Qualificado

```
🎯 Novo Lead Qualificado!

👤 João Silva
🏢 TechCorp
📧 joao@techcorp.com
⭐ Score: 85

[Ver Detalhes] [Entrar em Contato]
```

### 2. Conversão

```
🎉 Conversão Confirmada!

Lead: Maria Santos
Valor: R$ 5.000,00
Pipeline: 45 dias

[Ver Pipeline]
```

### 3. Alerta de Performance

```
⚠️ Meta Diária: 60% Atingida

📊 Status às 15:00
Leads: 18/30
Conversões: 2/5
Revenue: R$ 8.500 / R$ 15.000

[Dashboard Completo]
```

### 4. Daily Digest

```
☀️ Bom dia! Resumo de Ontem

📈 Métricas
• 42 novos leads (+15%)
• 8 conversões (+2)
• R$ 32.000 em revenue

🎯 Top Performers
1. João Silva - 5 conversões
2. Maria Santos - 3 conversões

[Ver Relatório Completo]
```

---

## 🛠️ Configuração Avançada

### Filtros de Notificação

```typescript
{
  "notificationRules": {
    "newLead": {
      "enabled": true,
      "minScore": 70,
      "sources": ["linkedin", "website"],
      "channels": ["#vendas"]
    },
    "conversion": {
      "enabled": true,
      "minValue": 1000,
      "channels": ["#sucesso", "#geral"]
    },
    "alert": {
      "enabled": true,
      "severity": ["high", "critical"],
      "channels": ["#alertas"]
    }
  }
}
```

### Horários

```typescript
{
  "schedule": {
    "dailyDigest": {
      "time": "09:00",
      "timezone": "America/Sao_Paulo",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "quietHours": {
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

---

## 🤖 Slash Commands (Em Breve)

```bash
# Ver estatísticas rápidas
/lumio stats

# Listar leads recentes
/lumio leads recent

# Buscar lead
/lumio search email:joao@example.com

# Criar tarefa
/lumio task "Follow up com João Silva"
```

---

## 🔗 Integrações com Slack

### Buttons Interativos

```typescript
// Botões nas notificações
{
  "attachments": [{
    "actions": [
      {
        "type": "button",
        "text": "Ver Detalhes",
        "url": "https://lumio.com/leads/123"
      },
      {
        "type": "button",
        "text": "Atribuir a Mim",
        "name": "assign",
        "value": "lead_123"
      }
    ]
  }]
}
```

### Menções

```
@vendedor Novo lead qualificado para você!
```

---

## ⚙️ Gerenciar Notificações

### No Lumio

`Configurações → Integrações → Slack → Gerenciar Notificações`

### No Slack

```bash
# Silenciar temporariamente
/mute @Lumio 1 hour

# Sair de um canal
/leave #nome-canal

# Ajustar preferências
Preferências → Notificações → Por aplicativo
```

---

## 🐛 Solução de Problemas

### Notificações não chegam

1. Verifique se o bot está no canal:

   ```
   /invite @Lumio
   ```

2. Confirme permissões:

   ```bash
   GET /api/integrations/slack/permissions
   ```

3. Teste manual:
   ```bash
   POST /api/integrations/slack/test
   {
     "channel": "#vendas",
     "message": "Teste de conexão"
   }
   ```

### Bot não responde

- Reinstale o app Slack
- Verifique se há problemas no Slack Status
- Contate suporte se persistir

---

## 📊 Analytics de Slack

Métricas sobre uso do Slack:

- Notificações enviadas
- Taxa de cliques em botões
- Canais mais ativos
- Horários de pico

Acesse: `Dashboard → Integrações → Slack Analytics`

---

## 💡 Melhores Práticas

### 1. Evite Spam

- Configure filtros adequados (ex: score mínimo 70)
- Use quiet hours para fora do horário comercial
- Agrupe notificações similares

### 2. Organize Canais

```
#vendas-leads - Novos leads
#vendas-conversoes - Conversões
#vendas-alertas - Alertas críticos
#vendas-daily - Resumo diário
```

### 3. Engaje o Time

- Incentive uso de botões interativos
- Configure menções para responsáveis
- Compartilhe wins e celebrações

---

## 🔒 Segurança

- ✅ OAuth 2.0 seguro
- ✅ Dados sensíveis mascarados
- ✅ Logs de auditoria
- ✅ Revogação instantânea

---

## 🔗 Recursos

- [Slack API](https://api.slack.com/)
- [Block Kit Builder](https://api.slack.com/block-kit)
- [Slack App Directory](https://slack.com/apps)

---

**Suporte**: suporte@lumio.com  
**Versão**: 1.0.0
