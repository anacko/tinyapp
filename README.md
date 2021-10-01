# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

It facilitates sharing links, by providing a short random-generated code, a short URL, that will redirect to its original link, the long URL. It also serves as storage, as it keeps links information in the user account. Popularity is measured, by how many times the short URL was visited and it's creation date.

## Some Relevant Screens

Storage for short URLS and where they redirect to. Keeps track of how many times the Short URL was visited and its creation date. The Edit button leads to the Tiny URL page. The Delete button removes the item.
!["MyURLs: The Collection"](https://github.com/anacko/tinyapp/blob/master/docs/MyURLs.png)

The Tiny URL page also allows for editing the long URL address. In doing so, it will reset the visit counter.
!["Visit and Edit each TinyURL"](https://github.com/anacko/tinyapp/blob/master/docs/TinyURL.png)

To create Tiny URLs, registration and login are required.
!["Register-Login-Create"](https://github.com/anacko/tinyapp/blob/master/docs/Register-Login-Create.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

- Note: urls handling, such as display, creation, editing and deleting are under '/urls' path. They require user registration and login. The use of a shared link does not require registration, and works under '/u' path, such as /u/randomcode.