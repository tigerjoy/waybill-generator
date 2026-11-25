<script lang="ts">
  import StepHeading from './lib/components/StepHeading.svelte';
  import StepNavigation from './lib/components/StepNavigation.svelte';

  const STEP_KEYS = [
    'trip',
    'opening',
    'closing',
    'expenses',
    'final',
  ] as const;

  type Step = (typeof STEP_KEYS)[number];

  const STEPS = STEP_KEYS.reduce<Record<Step, number>>(
    (acc, curr, idx) => {
      acc[curr] = idx;
      return acc;
    },
    {} as Record<Step, number>,
  );

  const STEP_NAMES = {
    trip: 'Bus and Trip Details',
    opening: 'Daily Way Bill (Opening)',
    closing: 'Daily Way Bill (Closing)',
    expenses: 'Daily Expenses',
    final: 'Final Way Bill',
  } as const satisfies Record<Step, string>;

  let step: Step = $state('trip');

  const goNext = () => {
    const currentStepNumber = STEPS[step];
    const nextStepNumber = (currentStepNumber + 1) % STEP_KEYS.length;
    step = STEP_KEYS[nextStepNumber];
  };

  const goBack = () => {
    const currentStepNumber = STEPS[step];
    const nextStepNumber =
      (STEP_KEYS.length + (currentStepNumber - 1)) % STEP_KEYS.length;
    step = STEP_KEYS[nextStepNumber];
  };
</script>

<StepNavigation onBack={goBack} onNext={goNext} />

{#if step === 'trip'}
  <StepHeading title={STEP_NAMES[step]} />
  <p>Screen 1</p>
{:else if step === 'opening'}
  <StepHeading title={STEP_NAMES[step]} />
  <p>Screen 2</p>
{:else if step === 'closing'}
  <StepHeading title={STEP_NAMES[step]} />
  <p>Screen 3</p>
{:else if step === 'expenses'}
  <StepHeading title={STEP_NAMES[step]} />
  <p>Screen 4</p>
{:else if step === 'final'}
  <StepHeading title={STEP_NAMES[step]} />
  <p>Screen 5</p>
{:else}
  <StepHeading title="Invalid Step" />
{/if}
