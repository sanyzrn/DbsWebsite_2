/**
 * The "nex" wordmark, with its blue stroke.
 *
 * Drawn from the brand file in the Nex repository (`docs/brand/nex_logo_type.svg`): the
 * outline takes `currentColor`, and the blue part `--nx-mark-accent`, so one
 * mark serves a light page, a dark one and the blue app tile alike.
 */
export default function NexWordmark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="0 0 900.0822 217.1348" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path fill="currentColor" d="M273.2514,198.0063c-27.9847,0-50.6708-22.6861-50.6708-50.6708v-52.0313c0-30.6064-8.5015-38.0879-41.1484-38.0879h-55.0918c-31.9668,0-41.1489,7.4814-41.1489,38.0879v102.7021h-50.6709v-104.4023c0-58.8325,20.0645-79.917,88.4189-79.917h61.5532c68.6948,0,88.7588,21.0845,88.7588,79.917v104.4023h0Z" />
      <path fill="currentColor" d="M361.3315,124.5507v8.5015c0,22.4448,6.8018,26.5259,30.6064,26.5259h59.853c0,21.2233-17.2049,38.4282-38.4282,38.4282h-21.4248c-58.4922,0-81.2773-21.0845-81.2773-70.0552v-42.5088c0-53.7314,18.7041-71.7554,83.6582-71.7554h89.0986c52.7114,0,67.3345,21.0845,67.3345,50.3306v60.5332h-189.4204ZM500.081,68.0985c0-12.2427-5.4409-15.3032-20.7441-15.3032h-84.3379c-25.5059,0-33.6675,2.7207-33.6675,29.2461v9.8623h138.7495v-23.8052Z" />
      <path fill="var(--nx-mark-accent, #0084f7)" d="M608.5122,198.0063s-62.7047-.6252-62.7047,0C706.3112,3.3623,890.5281,15.9327,890.5281,15.9327c0,0-143.038,7.1349-282.0159,182.0736Z" />
      <path fill="currentColor" d="M682.8498,139.6855l11.2852,12.0868c55.9391,55.9391,66.0732,46.2338,106.4205,46.234h0s-85.3818-86.3167-85.3818-86.3167c-10.6105,8.4734-21.4095,17.7771-32.3239,27.9958Z" />
      <path fill="currentColor" d="M666.0425,64.4799l-48.7862-50.7931h-60.873s75.4403,74.8124,75.4403,74.8124c11.3323-8.8257,22.7773-16.8059,34.2189-24.0193Z" />
    </svg>
  );
}
