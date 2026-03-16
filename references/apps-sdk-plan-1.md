# Research use cases

## Why start with use cases

Every successful Apps SDK app starts with a crisp understanding of what the user is trying to accomplish. Discovery in ChatGPT is model-driven: the assistant chooses your app when your tool metadata, descriptions, and past usage align with the user’s prompt and memories. That only works if you have already mapped the tasks the model should recognize and the outcomes you can deliver.

Use this page to capture your hypotheses, pressure-test them with prompts, and align your team on scope before you define tools or build components.

## Gather inputs

Begin with qualitative and quantitative research:

- **User interviews and support requests** – capture the jobs-to-be-done, terminology, and data sources users rely on today.
- **Prompt sampling** – list direct asks (e.g., “show my Jira board”) and indirect intents (“what am I blocked on for the launch?”) that should route to your app.
- **System constraints** – note any compliance requirements, offline data, or rate limits that will influence tool design later.

Document the user persona, the context they are in when they reach for ChatGPT, and what success looks like in a single sentence for each scenario.

## Define evaluation prompts

Decision boundary tuning is easier when you have a golden set to iterate against. For each use case:

1. **Author at least five direct prompts** that explicitly reference your data, product name, or verbs you expect the user to say.
2. **Draft five indirect prompts** where the user states a goal but not the tool (“I need to keep our launch tasks organized”).
3. **Add negative prompts** that should _not_ trigger your app so you can measure precision.

Use these prompts later in [Optimize metadata](https://developers.openai.com/apps-sdk/guides/optimize-metadata) to hill-climb on recall and precision without overfitting to a single request.

## Scope the minimum lovable feature

For each use case decide:

- **What information must be visible inline** to answer the question or let the user act.
- **Which actions require write access** and whether they should be gated behind confirmation in developer mode.
- **What state needs to persist** between turns—for example, filters, selected rows, or draft content.

Rank the use cases based on user impact and implementation effort. A common pattern is to ship one P0 scenario with a high-confidence component, then expand to P1 scenarios once discovery data confirms engagement.

## Translate use cases into tooling

Once a scenario is in scope, draft the tool contract:

- Inputs: the parameters the model can safely provide. Keep them explicit, use enums when the set is constrained, and document defaults.
- Outputs: the structured content you will return. Add fields the model can reason about (IDs, timestamps, status) in addition to what your UI renders.
- Component intent: whether you need a read-only viewer, an editor, or a multiturn workspace. This influences the [component planning](https://developers.openai.com/apps-sdk/plan/components) and storage model later.

Review these drafts with stakeholders—especially legal or compliance teams—before you invest in implementation. Many integrations require PII reviews or data processing agreements before they can ship to production.

## Prepare for iteration

Even with solid planning, expect to revise prompts and metadata after your first dogfood. Build time into your schedule for:

- Rotating through the golden prompt set weekly and logging tool selection accuracy.
- Collecting qualitative feedback from early testers in ChatGPT developer mode.
- Capturing analytics (tool calls, component interactions) so you can measure adoption.

These research artifacts become the backbone for your roadmap, changelog, and success metrics once the app is live.

# Define tools

## Tool-first thinking

In Apps SDK, tools are the contract between your MCP server and the model. They describe what the connector can do, how to call it, and what data comes back. Good tool design makes discovery accurate, invocation reliable, and downstream UX predictable.

Use the checklist below to turn your use cases into well-scoped tools before you touch the SDK.

## Draft the tool surface area

Start from the user journey defined in your [use case research](https://developers.openai.com/apps-sdk/plan/use-case):

- **One job per tool** – keep each tool focused on a single read or write action ("fetch_board", "create_ticket"), rather than a kitchen-sink endpoint. This helps the model decide between alternatives.
- **Explicit inputs** – define the shape of `inputSchema` now, including parameter names, data types, and enums. Document defaults and nullable fields so the model knows what is optional.
- **Predictable outputs** – enumerate the structured fields you will return, including machine-readable identifiers that the model can reuse in follow-up calls.

If you need both read and write behavior, create separate tools so ChatGPT can respect confirmation flows for write actions.

## Capture metadata for discovery

Discovery is driven almost entirely by metadata. For each tool, draft:

- **Name** – action oriented and unique inside your connector (`kanban.move_task`).
- **Description** – one or two sentences that start with "Use this when…" so the model knows exactly when to pick the tool.
- **Parameter annotations** – describe each argument and call out safe ranges or enumerations. This context prevents malformed calls when the user prompt is ambiguous.
- **Global metadata** – confirm you have app-level name, icon, and descriptions ready for the directory and launcher.

Later, plug these into your MCP server and iterate using the [Optimize metadata](https://developers.openai.com/apps-sdk/guides/optimize-metadata) workflow.

## Model-side guardrails

Think through how the model should behave once a tool is linked:

- **Prelinked vs. link-required** – if your app can work anonymously, mark tools as available without auth. Otherwise, make sure your connector enforces linking via the onboarding flow described in [Authentication](https://developers.openai.com/apps-sdk/build/auth).
- **Read-only hints** – set the [`readOnlyHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations) to specify tools which cannot mutate state.
- **Destructive hints** – set the [`destructiveHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations) to specify which tools do delete or overwrite user data.
- **Open-world hints** – set the [`openWorldHint` annotation](https://modelcontextprotocol.io/specification/2025-11-25/schema#toolannotations) to specify which tools publish content or reach outside the user's account.

- **Result components** – decide whether each tool should render a component, return JSON only, or both. Set `_meta.ui.resourceUri` on the tool descriptor to advertise the UI template so the same UI can run across MCP Apps hosts (ChatGPT honors `_meta["openai/outputTemplate"]` as an optional compatibility alias).

## Golden prompt rehearsal

Before you implement, sanity-check your tool set against the prompt list you captured earlier:

1. For every direct prompt, confirm you have exactly one tool that clearly addresses the request.
2. For indirect prompts, ensure the tool descriptions give the model enough context to select your connector instead of a built-in alternative.
3. For negative prompts, verify your metadata will keep the tool hidden unless the user explicitly opts in (e.g., by naming your product).

Capture any gaps or ambiguities now and adjust the plan—changing metadata before launch is much cheaper than refactoring code later.

## Handoff to implementation

When you are ready to implement, compile the following into a handoff document:

- Tool name, description, input schema, and expected output schema.
- Whether the tool should return a component, and if so which UI component should render it.
- Auth requirements, rate limits, and error handling expectations.
- Test prompts that should succeed (and ones that should fail).

Bring this plan into the [Set up your server](https://developers.openai.com/apps-sdk/build/mcp-server) guide to translate it into code with the MCP SDK of your choice.

# Design components

## Why components matter

UI components are the human-visible half of your connector. They let users view or edit data inline, switch to fullscreen when needed, and keep context synchronized between typed prompts and UI actions. Planning them early ensures your MCP server returns the right structured data and component metadata from day one.

Because ChatGPT implements the MCP Apps UI standard, a well-designed component
and data contract can be portable across MCP Apps-compatible hosts.

## Explore sample components

We publish reusable examples in [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) so you can see common patterns before you build your own. The pizzaz gallery covers every default surface we provide today:

### List

Renders dynamic collections with empty-state handling. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-list).

![Screenshot of the Pizzaz list component](https://developers.openai.com/images/apps-sdk/pizzaz-list.png)

### Map

Plots geo data with marker clustering and detail panes. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz).

![Screenshot of the Pizzaz map component](https://developers.openai.com/images/apps-sdk/pizzaz-map.png)

### Album

Showcases media grids with fullscreen transitions. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-albums).

![Screenshot of the Pizzaz album component](https://developers.openai.com/images/apps-sdk/pizzaz-album.png)

### Carousel

Highlights featured content with swipe gestures. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-carousel).

![Screenshot of the Pizzaz carousel component](https://developers.openai.com/images/apps-sdk/pizzaz-carousel.png)

### Shop

Demonstrates product browsing with checkout affordances. [View the code](https://github.com/openai/openai-apps-sdk-examples/tree/main/src/pizzaz-shop).

![Screenshot of the Pizzaz shop component in grid view](https://developers.openai.com/images/apps-sdk/pizzaz-shop-view.png)
![Screenshot of the Pizzaz shop component in modal view](https://developers.openai.com/images/apps-sdk/pizzaz-shop-modal.png)

## Clarify the user interaction

For each use case, decide what the user needs to see and manipulate:

- **Viewer vs. editor** – is the component read-only (a chart, a dashboard) or should it support editing and writebacks (forms, kanban boards)?
- **Single-shot vs. multiturn** – will the user accomplish the task in one invocation, or should state persist across turns as they iterate?
- **Inline vs. fullscreen** – some tasks are comfortable in the default inline card, while others benefit from fullscreen or picture-in-picture modes. Sketch these states before you implement.

Write down the fields, affordances, and empty states you need so you can validate them with design partners and reviewers.

## Map data requirements

Components should receive everything they need in the tool response. When planning:

- **Structured content** – define the JSON payload that the component will parse.
- **Initial component state** – render from the latest `structuredContent` delivered over the MCP Apps bridge (for example, `ui/notifications/tool-result`). On UI-initiated tool calls (`tools/call`), render from the returned tool result. To keep the model in sync with UI state, use `ui/update-model-context`.
- **Auth context** – note whether the component should display linked-account information, or whether the model must prompt the user to connect first.

Feeding this data through the MCP response is simpler than adding ad-hoc APIs later.

## Design for responsive layouts

Components run inside an iframe on both desktop and mobile. Plan for:

- **Adaptive breakpoints** – set a max width and design layouts that collapse gracefully on small screens.
- **Accessible color and motion** – respect system dark mode (match color-scheme) and provide focus states for keyboard navigation.
- **Launcher transitions** – if the user opens your component from the launcher or expands to fullscreen, make sure navigation elements stay visible.

Document CSS variables, font stacks, and iconography up front so they are consistent across components.

## Define the state contract

Because components and the chat surface share conversation state, be explicit about what is stored where:

- **Component state** – use `ui/update-model-context` for model-visible UI state. If you want ChatGPT to persist UI-only state across widget re-renders (optional), you can also use `window.openai.setWidgetState` (selected record, scroll position, staged form data).
- **Server state** – store authoritative data in your backend or the built-in storage layer. Decide how to merge server changes back into component state after follow-up tool calls.
- **Model messages** – think about what human-readable updates the component should send back via `ui/message` so the transcript stays meaningful.

Capturing this state diagram early prevents hard-to-debug sync issues later.

## Plan telemetry and debugging hooks

Inline experiences are hardest to debug without instrumentation. Decide in advance how you will:

- Emit analytics events for component loads, button clicks, and validation errors.
- Log tool-call IDs alongside component telemetry so you can trace issues end to end.
- Provide fallbacks when the component fails to load (e.g., show the structured JSON and prompt the user to retry).

Once these plans are in place you are ready to move on to the implementation details in [Build a ChatGPT UI](https://developers.openai.com/apps-sdk/build/chatgpt-ui).