# Portfólio — Pietro Tamanini

Portfólio estático em HTML, CSS e JavaScript puros, com estética de terminal/editor e interações acessíveis.

## Executar localmente

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Interações

- editor com três arquivos e linhas que aceitam breakpoints;
- botão `run` e atalho `Ctrl + Enter`;
- terminal funcional com comandos como `help`, `whoami`, `projects`, `stack`, `contact` e `filter`;
- `/` ou `Ctrl + \`` abre o terminal;
- `Ctrl + K` abre a paleta de comandos;
- filtros de projetos por Python, PHP e Docker;
- detalhes dos projetos com abertura exclusiva e animação;
- navegação, abas, terminal e paleta utilizáveis por teclado;
- animações desativadas quando `prefers-reduced-motion` está ativo.

## Estrutura

```text
.
├── index.html
├── 404.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── img/
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── .htaccess
```

## Publicação

Envie todo o conteúdo da pasta para a raiz pública de `pietro.tamanini.dev.br`.

O `.htaccess` inclui cache, compressão, cabeçalhos básicos de segurança e página 404 com status HTTP correto. Em hospedagens sem Apache, configure `404.html` na plataforma.

## Validação

- JavaScript verificado com Node;
- interações testadas no Chromium em desktop e celular;
- editor, terminal, comandos, filtros, detalhes e atalhos verificados;
- ausência de overflow horizontal em 375 px e 1440 px;
- transição do mouse entre Zokyo e API sem alteração visual no card;
- referências locais verificadas.
