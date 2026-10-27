# NexaChatAI widget (demo copy)

`chatbot.js` and `chatbot.css` are copied unchanged from the NexaChatAI plugin
(`assets/js/chatbot.js`, `assets/css/chatbot.css`), version **1.7.9**. They power the live demo
on `/nexachat`, where a scripted backend (`src/lib/nexachat/demo.ts`) answers instead of an AI provider.
`src/lib/nexachat/widget-config.json` is the plugin's own `build_config()` output for a demo business.

To update: copy the two files from a newer plugin release, regenerate the config with the plugin
(see the comment in `demo.ts`), and bump the version above.
