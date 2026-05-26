import { SampleText } from '../types';

export const SAMPLES: SampleText[] = [
  {
    id: 'contrato',
    title: 'Cláusula Contratual',
    category: 'Jurídico',
    description: 'Revisão de cláusula de confidencialidade e multas por descumprimento.',
    textA: `CLÁUSULA QUINTA - DA CONFIDENCIALIDADE
As Partes se comprometem a manter o mais absoluto sigilo sobre quaisquer informações técnicas, comerciais, financeiras, operacionais ou estratégicas que venham a ter acesso em decorrência deste contrato.

Parágrafo Único: O descumprimento do dever de confidencialidade sujeitará a parte infratora ao pagamento de multa de R$ 5.000,00 (cinco mil reais), sem prejuízo de eventuais perdas e danos apurados judicialmente. O prazo deste compromisso de sigilo será de 2 (dois) anos após o término deste contrato.`,
    textB: `CLÁUSULA QUINTA - DA CONFIDENCIALIDADE E PROTEÇÃO DE DADOS
As Partes comprometem-se a manter sob estrito e absoluto sigilo todas as informações técnicas, comerciais, de marketing, financeiras, operacionais ou estratégicas, bem como dados pessoais recebidos, em virtude do presente instrumento.

Parágrafo Primeiro: O descumprimento das obrigações de confidencialidade sujeitará a parte infratora à multa penal imediata de R$ 15.000,00 (quinze mil reais), cumulada com indenização integral por perdas e danos materiais e morais apurados.

Parágrafo Segundo: O prazo deste dever de confidencialidade sobreviverá pelo período de 5 (cinco) anos a contar do encerramento da vigência deste contrato.`
  },
  {
    id: 'redacao',
    title: 'Edição de Redação',
    category: 'Escrita',
    description: 'Melhorias de estilo, gramática e concordância em um ensaio sobre tecnologia.',
    textA: `No mundo de hoje em dia, as inteligências artificiais estão revolucionando tudo que é tipo de trabalho. Muitas pessoas tem receio que vão perder os seus empregos para os robôs, mas especialista diz que na verdade as IAs vão apenas automatizar tarefas que são repetitivas e chatas. Assim sobra mais tempo pro ser humano focar em pensamento crítico e criatividade pura. É preciso que as escolas e as faculdades preparem os jovens para essa nova realidade de mercado que mudo muito rápido.`,
    textB: `Na contemporaneidade, os sistemas de inteligência artificial estão transformando profundamente o mercado de trabalho global. Embora exista o receio generalizado sobre a substituição de postos de trabalho pela automação, especialistas indicam que essas tecnologias tendem a otimizar tarefas repetitivas e burocráticas. Por conseguinte, abre-se espaço para que os profissionais se concentrem em análise crítica, inovação e tomadas de decisão complexas. Diante disso, as instituições de ensino têm o papel crucial de capacitar os jovens para esse dinâmico cenário mercadológico.`
  },
  {
    id: 'config',
    title: 'Arquivo de Configuração (JSON)',
    category: 'Tecnologia',
    description: 'Comparação de parâmetros de desenvolvimento vs produção.',
    textA: `{
  "appName": "Text Diff Pro",
  "version": "1.2.0-beta",
  "debug": true,
  "features": {
    "enableHistory": false,
    "maxUploadSizeMb": 10,
    "supportedLanguages": ["pt", "en"]
  },
  "apiGateway": "http://localhost:8080/v1",
  "timeoutMs": 5000,
  "cache": {
    "enabled": false,
    "ttlSeconds": 0
  }
}`,
    textB: `{
  "appName": "Text Diff Pro Suite",
  "version": "1.2.0",
  "debug": false,
  "features": {
    "enableHistory": true,
    "maxUploadSizeMb": 50,
    "supportedLanguages": ["pt", "en", "es", "fr"]
  },
  "apiGateway": "https://api.diffpro.com/v1",
  "timeoutMs": 15000,
  "cache": {
    "enabled": true,
    "ttlSeconds": 3600
  }
}`
  }
];
