import { writable } from "svelte/store";

import { constants } from "$lib/constants";

export const accessToken = writable(constants.devToken);

export const ghViewer = writable();

export const ghRepos = writable();
