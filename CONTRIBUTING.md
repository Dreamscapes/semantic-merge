# Contribution Guidelines

## Run the linter

Always check if your code passes current sanity / style checks: `make lint`

## Make use of .editorconfig

See [EditorConfig][editorconfig] for more details.

## Write tests

Seriously. No one will want to debug that super-awesome feature you wrote that broke in next release... If in doubt, as for help or guidance.

To run the tests: `make test`

## Include comments and docblocks

Undocumented code is only half the job done. Don't be lazy and write **helpful** comments!

## Try to match current code style

I'm not gonna bite you if you don't, but... give it a try. :)

Usually there's the following pattern that I try to adhere to whenever possible:

1. Initialise and normalise variables (i.e. `var value = input || 'default'`)
1. Validate input & check for known mistakes (i.e. `if (! input) return`), try to return/throw as soon as possible instead of `else` branches
1. Perform logic as necessary, follow previous points within this logic, too
1. Sanitise output as necessary and return

Better check the source files, maybe it will make more sense...!

## Final thoughts

- Try to keep it simple
- Try to keep it readable
- Use meaninfgul var/method names
- If in doubt, ask
- If you have suggestions how to improve the contributing guidelines, I'm all ears!

Thanks for reading! Looking forward to accept your awesome PR!

[editorconfig]: http://editorconfig.org
