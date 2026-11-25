<script lang="ts">
  type StepNavigationPropsType = {
    onBack: () => void;
    onNext: () => void;
  };

  const { onBack, onNext }: StepNavigationPropsType = $props();
</script>

<button onclick={onBack}>Back</button>
<button onclick={onNext}>Next</button>
