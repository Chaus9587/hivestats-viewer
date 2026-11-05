<template>
  <section class="my-8 flex flex-col items-center justify-center px-10 py-8">
    <p class="text-center text-[1.25rem] font-light sm:text-[1.5rem]">
      View detailed player statistics on The Hive: A Minecraft Bedrock server
    </p>
    <RouterLink to="/stats">
      <button
        class="my-8 rounded-3xl bg-neutral-700 px-6 py-3 text-neutral-200 transition duration-150 ease-in-out hover:translate-y-1 hover:scale-105 hover:cursor-pointer hover:bg-neutral-800 dark:bg-neutral-200 dark:text-black dark:hover:bg-neutral-300"
      >
        Try it out
      </button>
    </RouterLink>
  </section>
</template>
