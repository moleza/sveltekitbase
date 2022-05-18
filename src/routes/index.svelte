<script>
  import Login from "../lib/components/Login.svelte";
  import { userStore } from '../stores/user.js';

  let alert_error = "";
</script>

{#if $userStore.auth}
  <main class="form-signin border rounded mt-2">
      <img class="mb-4" src="/img/logo.png" alt="" style="width:100%;">
      {#if alert_error}
          <div class="alert alert-danger" role="alert">
              {alert_error}
          </div>
      {/if}

      <dl>
        <dt>Logged in as</dt>
        <dd>{$userStore.name} {$userStore.surname}</dd>
        <dt>Role</dt>
        <dd>{$userStore.roles}</dd>
      </dl>
    
  </main>

  <style>
  .form-signin {
  width: 100%;
  max-width: 500px;
  padding: 15px;
  margin: auto;
  }
  </style>
{:else}
  <Login/>
{/if}
