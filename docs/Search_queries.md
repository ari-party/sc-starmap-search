# Search queries

## Format

`(key):[options]value`

### Key

The key is what you see in the JSON. \
If it's the code, you enter `code`. If it's the first affiliation, you enter `affiliation.0.(key)`. If it's the name of the
parent, you enter `parent.name`.

#### Equals

The `:` can also be a `=`, it doesn't matter which you use.

### Options

The current available options are:

-   `~` (fuzzy) — Include \
    e.g. `name:~Stanton` looks for anything with `Stanton` in the name.

### Value

What you want to match. Capitalization does not matter. You can also wrap it in quotes, like:
`designation:"Stanton IV"`.

## Examples

-   `star_system.name:Stanton type:planet` — Planets in Stanton system.
-   `type:JUMPPOINT tunnel.size:L` — Large jump points.
