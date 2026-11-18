# Zenith FinOps — Especificação de Requisitos & Arquitetura (Processo 1)

> **Equipe de Engenharia**: Processo 1 — Product Manager & FinOps Architecture Specialist  
> **Data**: Novembro de 2026  
> **Status**: Aprovado para Implementação (Processo 2)

---

## 1. Visão Geral do Produto
O **Zenith FinOps** é uma plataforma moderna e minimalista para governança, monitoramento, alocação e otimização de custos de infraestrutura multi-nuvem (AWS, Google Cloud Platform, Microsoft Azure e Kubernetes).

Inspirado nas principais referências globais do mercado (**Vantage.sh, Datadog Cloud Cost Management, Kubecost e AWS Cost Explorer**), o sistema adota uma estética monocromática refinada (Preto & Branco / Dark-Light Minimalist de alto contraste, nos moldes de Linear e Vercel) com micro-detalhes de acabamento, micro-interações, tipografia de alta precisão e componentes interativos.

---

## 2. Benchmark de Mercado & Funcionalidades-Chave

| Plataforma de Referência | Recursos Incorporados no Zenith FinOps |
| :--- | :--- |
| **Vantage.sh** | Design minimalista preto e branco, visão unificada multi-cloud, relatórios com filtros multidimensionais, catálogo de contas conectadas. |
| **Datadog Cloud Cost** | Detecção de anomalias com análise de causa-raiz (RCA), gráficos de tendências com burn rate, correlação entre picos e serviços. |
| **AWS Cost Explorer** | Projeção preditiva (Forecast MTD), limites de orçamento com múltiplos tiers de alerta (80%, 100%, 120%), análise de variação MoM. |
| **Kubecost & Cast AI** | Recomendações de rightsizing (instâncias ociosas, volumes órfãos), cálculo de economia potencial ($/mês) e ação de aplicação direta. |

---

## 3. Especificação dos Módulos Funcionais (CRUDs e Observabilidade)

### Módulo A: Executive Overview & KPI Dashboard
- **Cards Métricos:**
  - Spend Acumulado MTD (Month-to-Date) com delta percentual em relação ao mês anterior.
  - Projeção de Encerramento (Forecast de Fechamento do Mês).
  - Economia Mensal Identificada (Potential Monthly Savings).
  - Saúde Média dos Orçamentos (Burn Rate %).
  - Alertas Críticos de Anomalias Ativas.
- **Gráficos SVG Monocromáticos:**
  - Curva de Custo Diário Histórico + Projeção Pontilhada para os próximos dias.
  - Composição Percentual Multi-Cloud (AWS, GCP, Azure, K8s).
  - Top 5 Serviços com maior impacto financeiro.

### Módulo B: Cost Explorer Analítico
- Filtros interativos: Provedor, Serviço, Ambiente (`prod`, `staging`, `dev`), Região e Período temporal.
- Tabela analítica com cálculo automático de participação sobre o custo total, variação de tendência e ordenação.
- Exportação de relatórios em formato JSON e CSV.

### Módulo C: Gestão de Orçamentos & Alertas (CRUD Completo)
- **Criação (`Create`)**: Nome do orçamento, nuvem/escopo, teto limite ($), período (Mensal/Trimestral), e-mails/webhooks para notificação e limiares de alarme (80%, 100%).
- **Listagem (`Read`)**: Indicadores visuais de consumo com barra de progresso em escala de cinzas e badges dinâmicos (`Normal`, `Alerta 80%`, `Excedido >100%`).
- **Edição (`Update`)**: Modal com preenchimento reativo para ajuste de limites e parâmetros.
- **Exclusão (`Delete`)**: Confirmação com modal de segurança.
- **Filtros e busca**: Busca por texto e filtro por status de saúde do orçamento.

### Módulo D: Central de Otimização & Rightsizing (CRUD Completo)
- Identificação de oportunidades:
  - Instâncias EC2/VMs com CPU ociosa (< 5%).
  - Volumes de armazenamento (EBS/Discos) não anexados.
  - Bancos de dados sem conexões ativas.
  - Planos de economia (Savings Plans) aplicáveis.
- **Operações:**
  - Criação de recomendações customizadas pela equipe de FinOps.
  - Edição de prioridade, notas técnicas e estimativa de economia.
  - Aplicação imediata da economia (muda status e reflete na economia acumulada).
  - Descarte/Exclusão de recomendações irrelevantes.

### Módulo E: Conexões de Infraestrutura & Contas (CRUD Completo)
- **Contas suportadas**: AWS (Account ID / Role ARN), GCP (Project ID), Azure (Subscription ID), Kubernetes (Cluster ID).
- **Operações:**
  - Adição de nova conta com validação de formato e credenciais simuladas.
  - Listagem com status de sincronização (`Sincronizado`, `Sincronizando`, `Atenção`).
  - Edição de identificador e rótulos.
  - Ação de "Forçar Sincronização" com atualização imediata de timestamp.
  - Desconexão/Remoção de conta.

### Módulo F: Monitor de Anomalias de Custo
- Registro de picos anômalos de custos identificados por algoritmos preditivos.
- Causa-raiz diagnosticada (ex: loop de execução de serverless, dados transferidos cross-region).
- Ações para marcar como `Em Investigação`, `Resolvido` ou `Falso Positivo`.

---

## 4. Requisitos de Design System & UX (Preto & Branco Minimalista)

```
Palette Monocromática:
- Deep Black:       #000000 / #09090b (Background primário no Dark Mode)
- Surface Charcoal: #121214 / #18181b (Cards e painéis elevados)
- Subtle Borders:   #27272a / #3f3f46 (Bordas ultrafinas de 1px)
- Text Pure White:  #ffffff (Títulos, métricas primárias)
- Text Muted Gray:  #a1a1aa / #71717a (Subtítulos, legendas secundárias)
- Accent White:     #ffffff com hover suave em gradiente cinza
- Light Mode:       Fundo #ffffff, superfícies #f4f4f5, bordas #e4e4e7, texto #09090b
```

- **Tipografia**: Família moderna sans-serif (Inter / Geist) com mono-espaçada (Geist Mono / JetBrains Mono) para números e valores monetários.
- **Micro-detalhes**:
  - Bordas de 1px com raio sutil (6px a 10px).
  - Gráficos vetoriais SVG desenhados sob medida, com linhas nítidas e áreas monocromáticas sem borrões.
  - Toasts de notificação flutuantes no canto inferior direito.
  - Modais com efeito `backdrop-filter: blur(8px)` e transição suave.
  - Alternador Dark/Light Minimalist integrado.

---

## 5. Diretrizes de Engenharia (Processo 2 & 3)
1. **Framework**: Angular 22+ com Standalone Components (sem NgModules legados).
2. **Reatividade**: Angular Signals (`signal()`, `computed()`) para controle de estado previsível e de alta performance.
3. **Formulários**: Reactive Forms com validações estritas (números positivos, campos obrigatórios, formato de e-mail).
4. **Persistência**: `localStorage` com seed automático inteligente para que recargas de página mantenham os dados criados/editados.
5. **Zero Erros de Build**: Compilação sem warnings ou falhas de tipagem estrita no TypeScript.
