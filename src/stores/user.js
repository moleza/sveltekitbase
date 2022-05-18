import { writable } from 'svelte/store';
 
const defaultValue = {auth:false};
 
export const userStore = writable(defaultValue);

function resetUserStore() {
  userStore.set(defaultValue);
}

export { userStore as default, resetUserStore };