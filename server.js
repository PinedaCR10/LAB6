"use strict";

/**
 * Server para Auth0 con express-openid-connect
 * - Usa vistas Swig (consolidate) en /views
 * - Rutas: / (index), /login, /logout, /callback (automáticas), /dashboard (protegida)
 */

require("dotenv").config();

const express = require("express");
const path = require("path");
const cons = require("consolidate");
const { auth, requiresAuth } = require("express-openid-connect");

const app = express();

/* =======================
   CONFIGURACIÓN AUTH0
   ======================= */
const config = {
  // Solo /dashboard estará protegido explícitamente
  authRequired: false,
  // Usa el logout de Auth0 (finaliza sesión en el IdP)
  auth0Logout: true,

  // Secret para firmar la cookie de sesión (NO subir a Git)
  secret: process.env.SECRET,

  // URL base de tu app (localhost en este lab)
  baseURL: process.env.BASE_URL || "http://localhost:3000",

  // Credenciales de tu aplicación en Auth0
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL, // p.ej. https://dev-xxxxx.us.auth0.com
  clientSecret: process.env.CLIENT_SECRET,     // necesario para Authorization Code

  // Forzamos Authorization Code + scopes estándar
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
};

// Monta /login, /logout y /callback automáticamente
app.use(auth(config));

/* =======================
   VISTAS Y ESTÁTICOS
   ======================= */
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

app.use("/static", express.static(path.join(__dirname, "static")));

/* =======================
   RUTAS
   ======================= */
app.get("/", (_req, res) => {
  // Muestra views/index.html (tu página con el link a /login)
  res.render("index");
});

app.get("/dashboard", requiresAuth(), (req, res) => {
  // Datos del usuario autenticado proporcionados por Auth0
  // Ej: { name, email, nickname, picture, sub, ... }
  const user = req.oidc.user || {};
  res.render("dashboard", { user });
});

/* =======================
   ARRANQUE
   ======================= */
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
  console.log(`[dotenv] .env cargado. Servidor en ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
