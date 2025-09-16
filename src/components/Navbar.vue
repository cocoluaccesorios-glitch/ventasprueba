<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img src="/vite.svg" alt="Logo" width="30" height="24" class="d-inline-block align-text-top">
        Cocolú Ventas
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-speedometer2"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ventas">
              <i class="bi bi-cart-plus-fill"></i> Nueva Venta
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/pedidos">
              <i class="bi bi-list-ul"></i> Ver Pedidos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/inventario">
              <i class="bi bi-box-seam"></i> Inventario
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/clientes">
              <i class="bi bi-people"></i> Clientes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/ingresos">
              <i class="bi bi-cash-stack"></i> Ingresos
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script setup></script>