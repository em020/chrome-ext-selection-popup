/// <reference types="vite/client" />

// Augment the inline CSS import so TypeScript knows its type
declare module '*.css?inline' {
  const content: string
  export default content
}
