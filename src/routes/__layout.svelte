<script context="module">
    export async function load({ session }) {
        if (session.authenticated && session.user) {
    	   return { props: { user:session.user, auth:true } }
        } else {
           return { props: '' }
        }
    }
</script>
  
<script>
    import Navbar from "../lib/components/Navbar.svelte";
    import { onMount } from "svelte";
    import { userStore } from '../stores/user.js';

    export let user;
    export let auth;

    onMount(() => {
        if (user) {
            let userBody = { username: user.username, roles: user.roles, name: user.name, surname: user.surname, created: user.created, expires: user.expires_in, auth: auth };
            $userStore = userBody;
        }
    });
    
</script>

<Navbar />

<main>
	<slot />
</main>
