<script>
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { goto } from "$app/navigation";
    import { onMount } from 'svelte';
    import { userStore, resetUserStore } from '../../stores/user.js';

    let appInstalled = false;
    let installPromptEvent;
    let route = "";
    let authenticated = false;

    $:route = $page.routeId;
    $:authenticated = $userStore.auth;

    onMount(async () => {
        if (window) {
            if ('getInstalledRelatedApps' in window.navigator) {
                let relatedApps = await navigator.getInstalledRelatedApps();
                if (relatedApps.length > 0){
                    appInstalled = true;
                    localStorage.setItem("hex_installed",true);
                }
            }
            if (!appInstalled) {
                if (localStorage.getItem("hex_installed")) {
                    appInstalled = true;
                }
                window.addEventListener('beforeinstallprompt', function(e) {
                    if (localStorage.getItem("hex_installed")) {
                        localStorage.removeItem("hex_installed");
                        appInstalled = false;
                    }
                    // Prevent the mini-infobar from appearing on mobile
                    e.preventDefault();
                    // Stash the event so it can be triggered later.
                    installPromptEvent = e;
                });
                window.addEventListener('appinstalled', function() {
                    appInstalled = true;
                    localStorage.setItem("hex_installed",true);
                });
                if (!('serviceWorker' in navigator)){
                    appInstalled = true;
                }
            }

            //check when the page is loaded if it matches one of the PWA display modes
            if (navigator.standalone || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: minimal-ui)').matches) {
                appInstalled = true;
            }

            //but also add a listener. After app installation on desktop, the app will open in their own window right away.
            window.addEventListener('DOMContentLoaded', function(){
                window.matchMedia('(display-mode: standalone)').addEventListener("change", (e) => {
                    if (e.matches) { appInstalled = true; }
                });
                window.matchMedia('(display-mode: fullscreen)').addEventListener("change", (e) => {
                    if (e.matches) { appInstalled = true; }
                });
                window.matchMedia('(display-mode: minimal-ui)').addEventListener("change", (e) => {
                    if (e.matches) { appInstalled = true; }
                });
            });

        }
    });

    function installPrompt() {
        if (!installPromptEvent) {
            appInstalled = true;
        } else {
            installPromptEvent.prompt();
        }
    }

    function logout() {
        if (browser) {
            resetUserStore();
            goto("/logout");
        }
    }
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <div class="d-flex flex-grow-1">
            <a class="navbar-brand" href="/">
                <img src="/img/logo.png" width="150px" alt="logo"/>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <i class="bi bi-list"></i>
            </button>
        </div>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mb-2 mb-lg-0" style="margin-left:auto;">
            {#if !appInstalled}
                <li class="nav-item">
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a href="#" type="button" class="btn btn-light blue ms-3" on:click={() => installPrompt()}>Install App</a> 
                </li>
            {/if}
            <li class="nav-item">
                <a class="nav-link{route==""?" active":""}" aria-current="page" href="/">Home</a>
            </li>
            <!-- <li class="nav-item">
                <a class="nav-link{route=="login"?" active":""}" href="/login">Login</a>
            </li> -->
            {#if authenticated}
                <!-- {#if name} -->
                <li class="nav-item">
                    <a href="/user" class="badge bg-secondary" style="margin-top:10px;">{$userStore.name + " " + $userStore.surname + " "}</a>
                </li>
                <!-- {/if} -->
                <li class="nav-item">
                    <!-- svelte-ignore a11y-invalid-attribute -->
                    <a class="nav-link{route=="register"?" active":""}" href="#" on:click={() => logout()}>Logout</a>
                </li>
            {:else}
                <li class="nav-item">
                    <a class="nav-link{route=="register"?" active":""}" href="/register">Register</a>
                </li>
            {/if}
            
            </ul>
        </div>
    </div>
  </nav>