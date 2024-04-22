<template>
    <div class="step-indicator">
        <button v-for="n in 4" :key="n" :class="{ 'active-step': currentStep === n }" @click="$emit('updateStep', n)">
            Step {{ n }}
        </button>
        <button @click="$emit('nextStep')">Next Step</button>
    </div>
</template>

<script setup lang="ts">
defineProps({
    currentStep: Number
});
</script>

<style scoped>
.active-step {
    color: red;
    /* Highlight the active step */
}
</style>