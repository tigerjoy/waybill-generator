<script lang="ts">
  type SvelteHeadingPropType = {
    title: string;
  };

  let { title }: SvelteHeadingPropType = $props();
</script>

<h1>{title}</h1>
