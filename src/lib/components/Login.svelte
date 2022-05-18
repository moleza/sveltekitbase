<script>
    import { userStore } from '../../stores/user.js';

    let form_credentials = {
      email: '',
      pass: '',
      loading: false
    };
    let alert_error = "";

    async function login() {
      try {
        form_credentials.loading = true;
        alert_error = "";
        const res = await fetch("/api/public/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(form_credentials)
        });

        if (res.ok) {
            let json = await res.json();
            // console.log("CLogin:",json);
            let user = { username: json.user.username, roles: json.user.roles, name: json.user.name, surname: json.user.surname, created: json.user.created, expires: json.user.expires_in, auth: true };
            if (json.status == "success") {
                $userStore = user;
                form_credentials = {
                  email: '',
                  pass: '',
                  loading: false
                };
            } else {
                alert_error = "Authentication Failure!";
                form_credentials.loading = false;
            }
            window.location.href = "/user";
        } else {
            alert_error = "Authentication Failed!";
            form_credentials.loading = false;
        }
      } catch(e) {
        // console.error(e);
        alert_error = "Server Error : Login";
        form_credentials.loading = false;
      }
    }
</script>

<main class="form-signin border rounded mt-2">
    <form on:submit|preventDefault={() => login()}>
        <img class="mb-4" src="/img/logo.png" alt="" style="width:100%;">
        {#if alert_error}
            <div class="alert alert-danger" role="alert">
                {alert_error}
            </div>
        {/if}
        <h1 class="h3 mb-3 fw-normal">Login</h1>
        <div class="mb-3">
          <label for="inputEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp" disabled={form_credentials.loading} bind:value={form_credentials.email} required>
        </div>
        <div class="mb-3">
          <label for="inputPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="inputPassword" aria-describedby="emailHelp" disabled={form_credentials.loading} bind:value={form_credentials.pass} required>
        </div>
        <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_credentials.loading}>Login</button>
        
        <a href="/forgot" class="w-100 btn btn-outline-secondary mt-1">Forgot Password</a>
        
    </form>
</main>

<style>
.form-signin {
  width: 100%;
  max-width: 500px;
  padding: 15px;
  margin: auto;
}
</style>