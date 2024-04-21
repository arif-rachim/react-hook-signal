import { signal, computed } from "../../../src";

export const count = signal(0);
export const plusOne = computed(() => count.value + 1);
export const plusOneWritable = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1;
  },
});
