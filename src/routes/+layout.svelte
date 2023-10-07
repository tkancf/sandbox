<script lang="ts">
	import { page } from '$app/stores';
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/add">Add</a>
	<a href="/settings">Settings</a>
</nav>
<h1>
	{$page.data.title || ''}
</h1>

<slot />
