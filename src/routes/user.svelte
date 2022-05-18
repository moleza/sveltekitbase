<script context="module">
    export async function load({ session, fetch }) {
        if (session.authenticated && session.user) {
            const res = await fetch("/api/private/user/"+session.user.token);
            if (res.ok) {
                const outcome = await res.json();
                return {props: {outcome:outcome, token:session.user.token, email:session.user.username}};
            } else {
                return {
                    status: 302,
                    redirect: "/"
                };
            }
        } else {
            return {
                status: 302,
                redirect: "/"
            };
        }
    }
</script>

<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    export let outcome;
    export let token;
    export let email;

    onMount(() => {
        form_credentials.name = outcome.user.name;
        form_credentials.surname = outcome.user.surname;
        form_credentials.email = email;
        form_credentials.mobile = outcome.user.mobile;
        form_credentials.gender = outcome.user.gender;
        form_credentials.birthdate = outcome.user.birthdate;
    });

    let form_credentials = {
      name: '',
      surname: '',
      email: '',
      mobile: '',
      gender: '',
      birthdate: '',
      loading: false
    };

    let form_password = {
      current: '',
      password: '',
      retype: '',
      loading: false
    };

    let alert_error = "";
    let alert_success = "";
    let option = "display";

    async function update() {
      try {
        form_credentials.loading = true;
        alert_error = "";
        alert_success = "";
        let checkEmail = false;
        if (email == form_credentials.email) {
            checkEmail = true;
        } else {
            checkEmail = await emailCheck();
        }
        if (checkEmail) {
          const res = await fetch("/api/private/user/"+token, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify(form_credentials)
          });

          if (res.ok) {
              form_credentials.loading = false;
              option = 'display';
              alert_success = "Profile Updated Successfully.";
          } else {
              if (res.status === 401) {
                goto("/logout");
              } else {
                alert_error = "Update Failed!";
                form_credentials.loading = false;
              }
          }
        } else {
          form_credentials.loading = false;
        }
      } catch(e) {
        // console.error(e);
        alert_error = "Server Error : Update";
        form_credentials.loading = false;
      }
    }

    async function updatePassword() {
      alert_error = "";
      alert_success = "";
      if (form_password.password != form_password.retype) {
        alert_error = "Passwords do not match!";
      } else {
        form_password.loading = true;
        const res = await fetch("/api/private/user/"+token, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(form_password)
        });

        if (res.ok) {
            let json = await res.json();
            form_password = {
              current: '',
              password: '',
              retype: '',
              loading: false
            };
            option = 'display';
            alert_success = "Password Updated Successfully.";
        } else {
            if (res.status === 401) {
              goto("/logout");
            } else {
              alert_error = "Update Failed!";
              form_password.loading = false;
            }
        }
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

<main class="form-signin border rounded mt-2 mb-2">
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
  <h1 class="h3 mb-3 fw-normal">User Profile <span class="fw-lighter fs-6">({option.toUpperCase()})</span></h1>
  {#if option == 'password'}
    <form on:submit|preventDefault={() => updatePassword()}>
      <div class="mb-3">
        <label for="inputCurrentPassword" class="form-label">Current Password</label>
        <input type="password" class="form-control" id="inputCurrentPassword" aria-describedby="inputCurrentPasswordHelp" disabled={form_password.loading || option == "display"} bind:value={form_password.current} required>
      </div>
      <div class="mb-3">
        <label for="inputNewPassword" class="form-label">New Password</label>
        <input type="password" class="form-control" id="inputNewPassword" aria-describedby="inputNewPasswordHelp" disabled={form_password.loading || option == "display"} bind:value={form_password.password} minlength="6" required>
      </div>
      <div class="mb-3">
        <label for="inputComparePassword" class="form-label">Re-Type New Password</label>
        <input type="password" class="form-control" id="inputComparePassword" aria-describedby="inputComparePasswordHelp" disabled={form_password.loading || option == "display"} bind:value={form_password.retype} minlength="6" required>
      </div>
      <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_password.loading}>Update</button>
      <button class="w-100 btn btn-lg btn-warning my-1" type="submit" disabled={form_password.loading} on:click={() => option = 'display'}>Cancel</button>
    </form>  
  {:else}
    <form on:submit|preventDefault={() => update()}>
      <div class="mb-3">
        <label for="inputName" class="form-label">Name</label>
        <input type="text" class="form-control" id="inputName" aria-describedby="inputNameHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.name} required>
      </div>
      <div class="mb-3">
        <label for="inputSurname" class="form-label">Surname</label>
        <input type="text" class="form-control" id="inputSurname" aria-describedby="inputSurnameHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.surname} required>
      </div>
      <div class="mb-3">
        <label for="inputEmail" class="form-label">Email address</label>
        <input type="email" class="form-control" id="inputEmail" aria-describedby="inputEmailHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.email} required>
      </div>
      <div class="mb-3">
          <label for="inputMobile" class="form-label">Mobile Number</label>
          <input type="number" class="form-control" id="inputMobile" aria-describedby="inputMobileHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.mobile}>
      </div>
      <div class="mb-3">
          <label for="inputGender" class="form-label">Gender</label>
          <select class="form-select" id="inputGender" aria-describedby="inputGenderHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.gender}>
              {#if form_credentials.gender == ""}
                  <option selected>Please select</option>
              {/if}
              <option value="Female">Female</option>
              <option value="Male">Male</option>
          </select>
      </div>
      <div class="mb-3">
          <label for="inputBirthdate" class="form-label">Birthdate</label>
          <input type="date" class="form-control" id="inputBirthdate" aria-describedby="inputBirthdateHelp" disabled={form_credentials.loading || option == "display"} bind:value={form_credentials.birthdate}>
      </div>
      {#if option == 'edit'}
        <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_credentials.loading}>Update</button>
        <button class="w-100 btn btn-lg btn-warning my-1" type="submit" disabled={form_credentials.loading} on:click={() => option = 'display'}>Cancel</button>
      {:else}
        <button class="w-100 btn btn-lg btn-primary" type="button" on:click={() => option = 'edit'}>Edit</button>
        <button class="w-100 btn btn-lg btn-secondary mt-1" type="button" on:click={() => option = 'password'}>Update Password</button>
      {/if}
    </form>
  {/if}
        
    
</main>

<style>
.form-signin {
  width: 100%;
  max-width: 500px;
  padding: 15px;
  margin: auto;
}
</style>
