# React Build Sitemap

## The new way to build your sitemap from React Router

This library **should** replace `react-router-sitemap`. While `react-router-sitemap` has been useful, it has been abandoned for over two years, and Typescript support is tedious at best.

This library aims to take out some of the added hassle of generating your sitemap, by only requiring a few arguments to be sent to it, as opposed to having to write an entire file that involves also configuring `babel` to work. This cuts down your development time on the sitemap considerably.

### Features

- Autodetection of TypeScript and JavaScript.
- Autodetection of functional or class components.
- Ignores locked routes.
- Generates a quick and efficient `sitemap.xml` file for your project based on
your router.
- Typesafe: Will work in a TypeScript project.


### Future additions

- Add the ability to check for dynamic routes, and return all.

### Installation

NPM:

```
npm install react-build-sitemap --save-dev
```

Yarn:

```
yarn add react-build-sitemap --dev
```

### Usage

In whatever file you need to import this in, do the following:

```
import buildSitemap from 'react-build-sitemap'

buildSitemap('./path/to/component/Component.jsx', './build/path/for/sitemap', 'http://yoururl.com')
```

**NOTE:** Do not put a `/` at the end of the buildPath or the url. These will be
handled by the library.
