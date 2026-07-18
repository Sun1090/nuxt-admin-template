<script setup>
import { X } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'default',
    validator: value => ['default', 'sm', 'lg', 'xl'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'cancel'])
const open = useVModel(props, 'modelValue', emit)

const sizeClass = computed(() => {
  const classes = {
    default: 'max-w-md',
    sm: 'max-w-sm',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }
  return classes[props.size]
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent :class="sizeClass">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <template #desc>
          <DialogDescription>
            <slot />
          </DialogDescription>
        </template>
        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          @click="close"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </button>
      </DialogHeader>
      <slot />
    </DialogContent>
  </Dialog>
</template>
