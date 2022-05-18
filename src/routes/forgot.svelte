<script context="module">
    export async function load({ url, fetch }) {
        const id = url.searchParams.get("email");
        if (id) {
            const res = await fetch("/api/public/forgot?email="+id);
            const outcome = await res.json();
            return {props: {outcome,token:id}};
        } else {
            return {props: {}};
        }
    }
</script>
<script>
    import { onMount } from "svelte";

    let form_credentials = {
        email: '',
        option: 'new',
        token: '',
        loading: false
    };
    let alert_error = "";
    let alert_success = "";
    export let outcome;
    export let token;

    onMount(() => {
        if (outcome) {
            form_credentials.option = "update";
            form_credentials.email = outcome.email;
            form_credentials.token = token;
        }
    });

    async function forgot() {
        try {
            form_credentials.loading = true;
            alert_error = "";
            alert_success = "";
            const res = await fetch("/api/public/forgot", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(form_credentials)
            });

            if (res.ok) {
                let json = await res.json();
                if (json.status == "success") {
                    if (form_credentials.option == "update") {
                        alert_success = "Password Updated Successfully. Login in now with new password.";
                    } else {
                        alert_success = "Email reset password sent.";
                    }
                } else {
                    alert_error = "Email Not Found!";
                    form_credentials.loading = false;
                }
            } else {
                alert_error = "Forgot Password Failed!";
                form_credentials.loading = false;
            }
        } catch(e) {
            console.error(e);
            alert_error = "Sever Error : Forgot Password";
            form_credentials.loading = false;
        }
    }
</script>  

<main class="form-signin border rounded mt-2">
    <form on:submit|preventDefault={() => forgot()}>
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
        <h1 class="h3 mb-3 fw-normal">Forgot Password</h1>
        {#if outcome}
            {#if outcome.status == "expired"}
                <div class="alert alert-danger" role="alert">
                    Forgot Password attempt Expired.  Please try again.
                </div>
                <a href="/forgot" class="w-100 btn btn-outline-secondary mt-1">Forgot Password</a>
            {:else}
                <div class="alert alert-info" role="alert">
                    Please enter new password for account.
                </div>
                <div class="mb-3">
                    <label for="inputEmail" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp" bind:value={form_credentials.email} disabled>
                </div>
                <div class="mb-3">
                    <label for="inputPassword" class="form-label">Password</label>
                    <input type="password" class="form-control" id="inputPassword" aria-describedby="inputPasswordHelp" disabled={form_credentials.loading} bind:value={form_credentials.pass} required>
                </div>
                <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_credentials.loading}>Reset Password</button>
            {/if}
        {:else}
            <div class="mb-3">
                <label for="inputEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp" disabled={form_credentials.loading} bind:value={form_credentials.email} required>
            </div>
            <button class="w-100 btn btn-lg btn-primary" type="submit" disabled={form_credentials.loading}>Send Reset Link</button>
        {/if}
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