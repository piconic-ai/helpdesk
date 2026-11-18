# helpdesk development

Follow the [implementation plan](docs/plan/README.md), the feature acceptance criteria and the [verification requirements](docs/plan/05-verification.md). Keep decisions in pure functions. Validate data at boundaries and commit state, events and pending work together. Keep the core independent of bundled extensions.

Use English for code comments and polite Japanese for communication. Follow the plan's Japanese format for project specifications and stage reports. Prefer standard gh subcommands over direct GraphQL requests.

Before every production deployment, commit and push the deployment changes, then deploy from a clean checkout of that pushed commit. Verify and report the SHA, successful push, deployment result and final working-tree status. Obtain confirmation before deployment as required by the plan.

When creating or changing screens, read DESIGN.md first.
