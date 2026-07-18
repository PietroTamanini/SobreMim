# Portfólio — Pietro Tamanini

Portfólio estático desenvolvido com HTML, CSS e JavaScript puros.

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

## Executar localmente

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Publicação

Envie todo o conteúdo desta pasta para a raiz pública de `pietro.tamanini.dev.br`.

O arquivo `.htaccess` configura segurança básica, cache, compressão e uma página 404 que mantém o status HTTP correto. Em hospedagens que não usam Apache, configure a página `404.html` no painel da plataforma.

## Validações aplicadas

- HTML, CSS, JavaScript, JSON e XML verificados;
- navegação mobile e por teclado testada;
- abas do editor, projetos expansíveis e cópia de e-mail testados;
- verificação de overflow em telas de 320 px a 1440 px;
- recursos locais e página 404 verificados.

## Antes de publicar

- confirme o endereço de e-mail profissional;
- confirme os links de GitHub e LinkedIn;
- mantenha `canonical`, `robots.txt` e `sitemap.xml` apontando para o domínio final;
- limpe o cache da CDN após substituir uma versão anterior.

## Currículo

Coloque o PDF nesta localização exata:

```text
docs/desenvolvedor back end.pdf
```

Os botões do hero, da seção de currículo e do contato já apontam para esse arquivo.
