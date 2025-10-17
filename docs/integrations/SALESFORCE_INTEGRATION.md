# Integração Salesforce - Guia Completo

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2025

---

## 🎯 Visão Geral

Integre o Salesforce CRM com Lumio para sincronização bidirecional de leads, contacts, opportunities e accounts.

### Benefícios

- 📊 **Sync Bidirecional**: Dados fluem entre Salesforce e Lumio
- 🎯 **Lead Management**: Gerencie leads em ambas as plataformas
- 💰 **Pipeline Tracking**: Acompanhe opportunities no dashboard
- 🤖 **Automação**: Workflows automáticos entre sistemas

---

## ✨ Funcionalidades

| Objeto Salesforce | Lumio Equivalente   | Sync            |
| ----------------- | ------------------- | --------------- |
| Lead              | Lead                | ✅ Bidirecional |
| Contact           | Lead                | ✅ Bidirecional |
| Opportunity       | Analytics (Deal)    | ✅ SF → Lumio   |
| Account           | Analytics (Company) | ✅ SF → Lumio   |
| Campaign          | Campaign            | 🚧 Em breve     |

---

## 🚀 Configuração Rápida

### Pré-requisitos

- Salesforce Edition: Professional ou superior
- API habilitada
- Permissões de administrador

### Conectar via OAuth

1. **Lumio**: Configurações → Integrações → Salesforce
2. Clique em **Conectar**
3. **Salesforce Login**: Faça login com suas credenciais
4. **Autorizar**: Permita acesso ao Lumio
5. **Sync**: Escolha o que sincronizar

### Objetos para Sincronizar

- ✅ Leads e Contacts
- ✅ Opportunities
- ⬜ Accounts
- ⬜ Tasks e Events

---

## 🔄 Sincronização de Dados

### Salesforce Lead → Lumio Lead

```typescript
{
  // Salesforce
  "FirstName": "João",
  "LastName": "Silva",
  "Email": "joao@example.com",
  "Company": "TechCorp",
  "Status": "Open - Not Contacted",

  // Lumio
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "company": "TechCorp",
  "source": "salesforce",
  "status": "NEW"
}
```

### Mapeamento de Status

| Salesforce           | Lumio       |
| -------------------- | ----------- |
| Open - Not Contacted | NEW         |
| Working - Contacted  | CONTACTED   |
| Qualified            | QUALIFIED   |
| Unqualified          | UNQUALIFIED |
| Converted            | CONVERTED   |

---

## 🎣 Webhooks

Lumio usa **Platform Events** do Salesforce para atualizações em tempo real:

- `LeadChangeEvent`
- `ContactChangeEvent`
- `OpportunityChangeEvent`

---

## ⚡ Limites de Taxa

- Salesforce API: 15.000 chamadas/24h (Developer Edition)
- Enterprise: 100.000 chamadas/24h
- Lumio usa Bulk API para grandes volumes

---

## 💡 Melhores Práticas

1. **Use Custom Fields**: Mapeie campos customizados nas configurações
2. **Field Mapping**: Configure mapeamento bidirecional cuidadosamente
3. **Conflict Resolution**: Defina qual sistema tem prioridade em conflitos
4. **Sync Schedule**: Configure horários de baixo tráfego

---

## 🐛 Solução de Problemas

### Leads não sincronizam

```bash
# Verificar conexão
GET /api/integrations/salesforce/status

# Force sync
POST /api/integrations/salesforce/sync
{
  "syncOptions": { "leads": true, "contacts": true },
  "mode": "full"
}
```

### Erros de permissão

- Verifique se o usuário tem acesso aos objetos
- Confirme que a API está habilitada
- Reautorize a integração

---

## 📊 Métricas

Acesse: `Dashboard → Insights → Salesforce`

- Total de Leads sincronizados
- Opportunities em andamento
- Taxa de conversão
- Pipeline value

---

## 🔗 Recursos

- [Salesforce API Docs](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/)
- [OAuth 2.0 Guide](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm)

---

**Suporte**: suporte@lumio.com  
**Versão**: 1.0.0
