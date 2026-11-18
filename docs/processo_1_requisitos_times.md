# Zenith FinOps — Especificação: Gestão por Times, Showback & Unit Economics (Processo 1)

> **Equipe de Engenharia**: Processo 1 — Product Manager & FinOps Specialist  
> **Requisito Adicional**: Gerenciamento por Time (Suporte, Desenvolvimento, Dados, SRE) & Filtros Cruzados  
> **Data**: Novembro de 2026  
> **Status**: Aprovado para Implementação (Processo 2)

---

## 1. Visão do Requisito & Expansão de Negócio
No ecossistema de FinOps corporativo (conforme o framework da *FinOps Foundation*, adotado por empresas como Netflix, Spotify e Nubank), os custos de nuvem precisam ser descentralizados e atribuídos aos donos reais dos serviços através de **Showback** (visibilidade de quem gasta o quê) e **Chargeback** (responsabilização orçamentária direta).

Além do que foi solicitado (gerenciamento e filtro por times), expandimos a solução com recursos corporativos avançados:
1. **CRUD Completo de Times de Engenharia e Operações**:
   - Criação de times com nome, centro de custo (`Cost Center`), líder responsável, integrantes, teto orçamentário específico e canais de contato.
2. **Alocação de Custos Multidimensional (Showback)**:
   - Associação de cada serviço de infraestrutura e conta ao seu time proprietário.
3. **Métricas de Economia Unitária (Unit Economics)**:
   - **Custo Médio por Engenheiro/Membro** (`Cost per Engineer`), permitindo comparar a eficiência financeira entre squads.
4. **Filtro Global e Granular por Time**:
   - Capacidade de filtrar os relatórios analíticos do *Cost Explorer*, orçamentos e oportunidades de redução por time específico.
5. **Score de Eficiência e Desperdício por Time**:
   - Indicador de quantas oportunidades de otimização em aberto pertencem a cada time.

---

## 2. Modelagem de Dados

### Entidade `Team`
```typescript
export interface Team {
  id: string;
  name: string;
  slug: string;
  costCenter: string; // ex: 'CC-ENG-401'
  leader: string;
  contactEmail: string;
  slackChannel: string;
  allocatedMonthlyBudget: number; // Teto orçado exclusivo para o time ($)
  currentMonthlySpend: number;    // Spend atual MTD consolidado
  memberCount: number;            // Quantidade de membros/engenheiros
  costPerMember: number;          // Métrica calculada ($/membro)
  costSharePercentage: number;    // % em relação ao spend total da empresa
  tags: string[];                 // ex: ['Backend', 'Core', 'Production']
  description: string;
  createdAt: string;
}
```

### Relacionamentos Estendidos
- `CostExplorerItem`: possui `teamId` e `teamName`.
- `Budget`: pode ser atribuído a um `teamId` ou `All` (Global).
- `SavingsRecommendation`: possui `teamId` e `teamName` do time responsável por aplicar a melhoria.

---

## 3. Matriz de Times Iniciais de Demonstração

| Time | Centro de Custo | Líder | Integrantes | Orçamento Alocado | Serviços Atribuídos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Time de Desenvolvimento (Core Eng)** | `CC-ENG-101` | Lucas Albuquerque | 18 engenheiros | \$32.000/mês | EC2 Instances, RDS Aurora, EKS, Sandboxes |
| **Time de Suporte & Ops (Customer Eng)** | `CC-OPS-202` | Mariana Rios | 12 analistas | \$8.000/mês | Egress Data Transfer, S3 Storage, App Services |
| **Time de Dados & IA (Data Platform)** | `CC-DATA-303` | Rodrigo Takahashi | 9 engenheiros | \$18.000/mês | Google BigQuery, GKE Autopilot, Cloud SQL |
| **Time de SRE, Segurança & Infra** | `CC-SRE-404` | Fernanda Lima | 6 especialistas | \$10.000/mês | Kubernetes Nodes, CloudTrail, WAF, EBS Backup |

---

## 4. Próximos Passos (Processo 2 & Processo 3)
- **Processo 2**: Implementação dos modelos, enriquecimento dos serviços, criação da view de Times, integração de filtros no Cost Explorer e na navegação.
- **Processo 3**: Testes unitários com Vitest cobrindo cálculos de Unit Economics e operações de CRUD dos times, compilação de produção sem avisos e publicação no GitHub.
