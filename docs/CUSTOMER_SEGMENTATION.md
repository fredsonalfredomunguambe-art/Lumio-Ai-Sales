# Customer Segmentation System

## Visão Geral

O sistema de Customer Segmentation permite organizar e analisar leads de forma inteligente, criando segmentos baseados em critérios demográficos, comportamentais e de métricas de vendas.

## Funcionalidades Principais

### 1. Criação de Segmentos

- **Critérios Demográficos**: Tamanho da empresa, indústria, localização
- **Critérios Comportamentais**: Fonte do lead, nível de engajamento, atividade recente
- **Métricas de Vendas**: Score do lead, frequência de reuniões, tamanho do deal
- **Campos Personalizados**: Critérios customizáveis para necessidades específicas

### 2. Gerenciamento de Segmentos

- Visualização em grid ou lista
- Busca e filtros avançados
- Edição e exclusão de segmentos
- Cores personalizadas para identificação visual

### 3. Analytics e Insights

- **Métricas Principais**: Total de leads, reuniões agendadas, receita total
- **Taxas de Conversão**: Lead para reunião, reunião para deal, lead para deal
- **Insights Inteligentes**: Recomendações baseadas em performance
- **Indicadores de Performance**: Tempo para fechamento, receita por lead

## Arquitetura Técnica

### Frontend

- **React + TypeScript**: Componentes tipados e reutilizáveis
- **Zustand**: Gerenciamento de estado global
- **React Query**: Cache e sincronização de dados
- **Framer Motion**: Animações suaves
- **Tailwind CSS**: Estilização responsiva

### Backend

- **Next.js API Routes**: Endpoints RESTful
- **Prisma ORM**: Gerenciamento de banco de dados
- **SQLite/PostgreSQL**: Armazenamento persistente
- **Clerk**: Autenticação e autorização

### Banco de Dados

```sql
-- Modelo Segment
model Segment {
  id              String   @id @default(cuid())
  name            String
  description     String
  color           String   @default("#3B82F6")
  criteria        Json     -- Critérios de segmentação
  averageDealSize Float    @default(0)
  totalRevenue    Float    @default(0)
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
  leads Lead[]
  meetings Meeting[]
}
```

## Como Usar

### 1. Criando um Segmento

```typescript
// Exemplo de critérios de segmentação
const criteria = {
  companySize: { min: 50, max: 500 },
  industry: ["technology", "healthcare"],
  leadSource: ["linkedin", "referral"],
  engagementLevel: "HIGH",
  leadScore: { min: 70, max: 100 },
};

const segmentData = {
  name: "High-Value Tech Leads",
  description: "Leads de empresas de tecnologia com alto potencial",
  color: "#3B82F6",
  criteria,
};
```

### 2. Aplicando Segmento a Leads

```typescript
// Aplicar segmento a leads específicos
const applySegment = async (segmentId: string, leadIds: string[]) => {
  await fetch(`/api/segments/${segmentId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadIds }),
  });
};
```

### 3. Obtendo Analytics

```typescript
// Buscar analytics de um segmento
const analytics = await fetch(`/api/segments/${segmentId}/analytics`);
const insights = await fetch(`/api/segments/${segmentId}/insights`);
```

## Componentes Principais

### SegmentCard

- Exibe informações resumidas do segmento
- Métricas principais (leads, reuniões, conversão)
- Ações rápidas (visualizar, editar, excluir)

### SegmentFormModal

- Formulário para criação/edição de segmentos
- Validação de critérios
- Interface intuitiva para seleção de critérios

### SegmentAnalytics

- Dashboard de métricas detalhadas
- Gráficos de conversão
- Indicadores de performance

### SegmentInsights

- Insights inteligentes baseados em dados
- Recomendações de melhoria
- Alertas e oportunidades

## APIs Disponíveis

### GET /api/segments

Lista todos os segmentos do usuário

### POST /api/segments

Cria um novo segmento

### GET /api/segments/[id]

Obtém um segmento específico

### PUT /api/segments/[id]

Atualiza um segmento

### DELETE /api/segments/[id]

Remove um segmento

### GET /api/segments/[id]/analytics

Obtém analytics de um segmento

### GET /api/segments/[id]/insights

Obtém insights de um segmento

### POST /api/segments/[id]/apply

Aplica segmento a leads específicos

## Exemplos de Uso

### 1. Segmento por Tamanho da Empresa

```typescript
const enterpriseSegment = {
  name: "Enterprise Clients",
  description: "Empresas com mais de 1000 funcionários",
  criteria: {
    companySize: { min: 1000 },
  },
};
```

### 2. Segmento por Fonte de Lead

```typescript
const linkedinSegment = {
  name: "LinkedIn Leads",
  description: "Leads originados do LinkedIn",
  criteria: {
    leadSource: ["linkedin"],
  },
};
```

### 3. Segmento por Score de Lead

```typescript
const hotLeadsSegment = {
  name: "Hot Leads",
  description: "Leads com score alto e engajamento elevado",
  criteria: {
    leadScore: { min: 80 },
    engagementLevel: "HIGH",
  },
};
```

## Benefícios

1. **Organização**: Agrupa leads por características similares
2. **Análise**: Identifica padrões e oportunidades
3. **Personalização**: Estratégias específicas por segmento
4. **Eficiência**: Foco em segmentos de maior valor
5. **Insights**: Recomendações baseadas em dados

## Próximos Passos

1. **Integração com Automações**: Aplicar ações automáticas por segmento
2. **Relatórios Avançados**: Dashboards mais detalhados
3. **Machine Learning**: Segmentação automática baseada em IA
4. **Integrações**: Conectar com ferramentas externas
5. **Notificações**: Alertas de mudanças de performance

## Troubleshooting

### Problemas Comuns

1. **Segmento não aparece**: Verificar se o usuário está autenticado
2. **Critérios não funcionam**: Validar formato dos critérios
3. **Analytics vazios**: Verificar se há leads associados ao segmento
4. **Performance lenta**: Considerar paginação para muitos segmentos

### Logs e Debugging

```typescript
// Habilitar logs detalhados
console.log("Segment criteria:", segment.criteria);
console.log("Analytics data:", analytics);
console.log("Insights:", insights);
```

## Contribuição

Para contribuir com melhorias no sistema de segmentação:

1. Crie uma branch para sua feature
2. Implemente testes para novas funcionalidades
3. Atualize a documentação
4. Submeta um pull request

## Suporte

Para dúvidas ou problemas:

- Verifique a documentação da API
- Consulte os logs do console
- Abra uma issue no repositório
