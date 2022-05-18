<script>
    let form_credentials = {
      name: '',
      surname: '',
      email: '',
      pass: '',
      loading: false
    };
    let alert_error = "";
    let alert_success = "";

    async function register() {
      try {
        form_credentials.loading = true;
        alert_error = "";
        alert_success = "";
        let checkEmail = await emailCheck();
        if (checkEmail) {
          const res = await fetch("/api/public/register", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(form_credentials)
          });

          if (res.ok) {
              // let json = await res.json();
              form_credentials = {
                name: '',
                surname: '',
                email: '',
                pass: '',
                loading: false
              };
              alert_success = "Registration Successful. Please activate your account on email address provided.";
          } else {
              alert_error = "Registration Failed!";
              form_credentials.loading = false;
          }
        } else {
          form_credentials.loading = false;
        }
      } catch(e) {
        // console.error(e);
        alert_error = "Server Error : Register";
        form_credentials.loading = false;
      }
    }

    async function emailCheck() {
      try {
        if (form_credentials.email.trim()) {
          alert_error = "";
          const response = await fetch("/api/public/register?email="+form_credentials.email);
          let json = await response.json();
          if (json.found === "false" || json.found === false) { 
            return true;
          } else {
            alert_error = "Email Address already in use!";
            return false;
          }
        } else {
          alert_error = "Please fill in email address!";
          return false;
        }
      } catch(e) {
        // console.error(e);
        alert_error = "Error Checking Email";
        return false;
      }
    }
</script>

<main class="form-signin border rounded mt-2">
    <form on:submit|preventDefault={() => register()}>
        <img class="mb-4" src="/img/logo.png" alt="" style="width:100%;">
        {#if alert_error}
            <div class="alert alert-danger" role="alert">
                {alert_error}
            </div>
        {/if}
        {#if alert_success}
            <div class="alert alert-success" role="alert">
                {alert_success}
            </div>
        {/if}
        <h1 class="h3 mb-3 fw-normal">Register</h1>
        <div class="mb-3">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" id="inputName" aria-describedby="inputNameHelp" disabled={form_credentials.loading} bind:value={form_credentials.name} required>
        </div>
        <div class="mb-3">
          <label for="inputSurname" class="form-label">Surname</label>
          <input type="text" class="form-control" id="inputSurname" aria-describedby="inputSurnameHelp" disabled={form_credentials.loading} bind:value={form_credentials.surname} required>
        </div>
        <div class="mb-3">
          <label for="inputEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="inputEmail" aria-describedby="inputEmailHelp" disabled={form_credentials.loading} bind:value={form_credentials.email} required>
        </div>
        <div class="mb-3">
          <label for="inputPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="inputPassword" aria-describedby="inputPasswordHelp" disabled={form_credentials.loading} bind:value={form_credentials.pass} required>
        </div>
        <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_credentials.loading}>Register</button>
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
