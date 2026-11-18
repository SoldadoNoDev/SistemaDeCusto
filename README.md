# ▲ Zenith FinOps — Cloud Cost Intelligence & Observability

> **Plataforma Moderna e Minimalista de Governança e Monitoramento de Custos Multi-Cloud (AWS, GCP, Azure e Kubernetes).**

Inspirado nas principais referências do mercado (**Vantage.sh, Datadog Cloud Cost Management, AWS Cost Explorer e Kubecost**), o **Zenith FinOps** foi desenvolvido com estética monocromática refinada (estilo Linear e Vercel), combinando alta precisão visual, micro-interações, tipografia moderna e três módulos completos de **CRUD**.

---

## 📸 Funcionalidades Principais

### 1. 📊 Executive Overview & KPI Dashboard
- **Métricas MTD (Month-to-Date)** consolidadas em tempo real com indicador de variação percentual mês a mês (MoM).
- **Projeção Preditiva (*Forecast*)** de encerramento do ciclo de faturamento baseado no *run-rate* diário.
- **Gráfico Vetorial SVG Interativo**: Linha contínua com gradiente para custos reais e linha tracejada para projeção futura, com *tooltips hover*.
- **Composição Multi-Cloud**: Visualizador de distribuição percentual entre AWS, GCP, Azure e clusters Kubernetes.

### 2. 👥 Gestão de Custos por Time & Showback Corporativo (CRUD 4)
- **Descentralização Orçamentária**: Gestão de esquadras como **Time de Desenvolvimento (Core Eng)**, **Time de Suporte & Ops (Customer Eng)**, **Time de Dados & IA** e **Time de SRE & Infra**.
- **Centros de Custo (Cost Center)**: Identificação e alocação financeira formal (ex: `CC-ENG-101`, `CC-OPS-202`).
- **Métricas de Unit Economics**: Cálculo automático de **Custo Médio por Integrante / Engenheiro** (`$/membro`), permitindo avaliar a eficiência financeira entre squads.
- **CRUD Completo de Times**: Criação, listagem com cartões detalhados, edição de integrantes/orçamento e exclusão com modal de confirmação.

### 3. 🔍 Cost Explorer Analítico & Showback
- **Filtro Granular por Time**: Seletor no toolbar e no cabeçalho para isolar custos atribuídos ao time de suporte, desenvolvimento, dados ou SRE.
- Filtros multidimensionais dinâmicos por **Nuvem (AWS, GCP, Azure, K8s)**, **Ambiente (Produção, Staging)** e busca por serviço.
- Ordenação por maior custo, menor custo ou maior aumento percentual MoM.
- **Exportação de Relatórios**: Geração e download direto em formatos **CSV** e **JSON** contendo o time responsável de cada recurso.

### 3. 💼 Gestão de Orçamentos & Alertas (CRUD 1)
- **Create**: Cadastro de novo teto orçamentário com limites em dólares, periodicidade, limiar de alarme (%), e-mail e webhook do Slack.
- **Read**: Acompanhamento de *burn rate* com barra de progresso e badges de status (`Normal`, `Alerta 80%`, `Excedido ≥100%`).
- **Update**: Modal reativo para ajuste de parâmetros e tetos.
- **Delete**: Exclusão segura com confirmação e notificação visual (*Toast*).

### 4. ⚡ Central de Otimização & Rightsizing (CRUD 2)
- Catálogo de oportunidades de redução de desperdício (instâncias subutilizadas, volumes órfãos EBS, migração gp2 para gp3, *Savings Plans*).
- **Ação "Aplicar Otimização" em 1 clique**: Consolida a economia diretamente no total de **Economia Realizada** da fatura.
- Criação, edição e exclusão de análises personalizadas com nível de risco operacional e esforço.

### 5. ☁️ Conexões de Nuvem & Clusters (CRUD 3)
- Conexão de contas AWS (Role ARN), GCP (Service Account), Azure e clusters K8s.
- **Ação "Sync Now" interativa**: Dispara a sincronização de telemetria com animação e atualização de timestamp.
- Edição de configurações e desconexão de contas.

### 6. 🚨 Central de Anomalias de Custo
- Detecção estatística de picos repentinos com **Diagnóstico de Causa Raiz (RCA)** automatizado.
- Gestão do ciclo de vida do incidente (*Investigando*, *Resolvido* e *Falso Positivo*).

### 7. 🎨 Design System Monocromático & Versatilidade
- **Modo Escuro (*Deep Black*)** e **Modo Claro de Alto Contraste** acessíveis com um clique no cabeçalho.
- Tipografia: **Inter** para interface e **JetBrains Mono** para cifras e métricas.
- Persistência total em `localStorage` para manter alterações e botão **"Restaurar Demo"** para reset instantâneo.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Angular 22 (Standalone Components & Signals)
- **Estilização**: SCSS modular, CSS Custom Properties, Design System Monocromático
- **Componentes Gráficos**: SVGs puros e nativos (zero dependências pesadas de terceiros)
- **Testes Unitários**: Vitest (21 testes automatizados com 100% de aprovação)
- **Build**: Angular CLI / Vite (Bundle de produção ultra-otimizado com ~105 kB)

---

## 📋 Metodologia de Desenvolvimento em 3 Processos

1. **Processo 1 (Engenharia de Requisitos & FinOps Benchmark)**:
   - Especificação inicial: [`docs/processo_1_requisitos.md`](docs/processo_1_requisitos.md)
   - Especificação de Gestão por Times & Showback: [`docs/processo_1_requisitos_times.md`](docs/processo_1_requisitos_times.md)
2. **Processo 2 (Desenvolvimento & Implementação)**:
   - Standalone Components, Angular Signals reativos, SCSS modular e 4 módulos CRUD completos.
3. **Processo 3 (QA, Testes & Auditoria Rigorosa)**:
   - Relatório de testes e garantia de qualidade: [`docs/processo_3_testes_e_qa.md`](docs/processo_3_testes_e_qa.md)
   - 21 testes unitários automatizados com 100% de aprovação no Vitest.

---

## 🌐 Deploy em Nuvem (GitHub Pages)

O repositório inclui automação via **GitHub Actions** (`.github/workflows/deploy.yml`) para build e publicação contínua.
Após habilitar o GitHub Pages nas configurações do repositório (*Settings > Pages > Build and deployment: GitHub Actions*), a aplicação fica disponível em:
👉 **`https://soldadonodev.github.io/SistemaDeCusto/`**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** >= 20.x
- **npm** >= 10.x

### Instalação
```bash
# Clone o repositório
git clone https://github.com/SoldadoNoDev/SistemaDeCusto.git

# Acesse a pasta do projeto
cd SistemaDeCusto

# Instale as dependências
npm install
```

### Executar em Desenvolvimento
```bash
npm start
# O sistema estará disponível em http://localhost:4200/
```

### Executar os Testes Unitários
```bash
npm test -- --watch=false
```

### Gerar Build de Produção
```bash
npm run build
```

---

## 📄 Licença
Distribuído sob a licença MIT.
