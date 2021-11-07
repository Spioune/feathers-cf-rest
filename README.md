> ❗ This transport is very experimental. Use with caution.

# feathers-cf-rest

[![Download Status](https://img.shields.io/npm/dm/feathers-cf-rest.svg?style=flat-square)](https://www.npmjs.com/package/feathers-cf-rest)

[feathers-cf-rest](https://github.com/Spioune/feathers-cf-rest/) is a feathers transport for [Cloudflare Workers](https://developers.cloudflare.com/workers).  
It exposes your feathers services as a RESTful API.

```bash
$ npm i feathers-cf-rest
```

> **Important:** `feathers-cf-durable` implements the [Feathers Common database adapter API](https://docs.feathersjs.com/api/databases/common.html) and [querying syntax](https://docs.feathersjs.com/api/databases/querying.html).

## Example

Here is an example of a Feathers application running on Cloudflare Workers with a `messages` service:

```
$ npm i @feathersjs/feathers@pre feathers-cf-rest itty-router
```

In `index.mjs`:

```js
import { Router } from 'itty-router'

import app from './feathers.mjs'

const router = Router()

router.all('*', app.handle)

router.all('*', (request, env) => {
	return new Response('Not found', { status: 404 })
})

export default {
	fetch: router.handle,
}
```

In `feathers.mjs`:

```js
import feathers from '@feathersjs/feathers'
import rest from 'feathers-cf-rest'

const app = feathers()

app.configure(rest)

app.use('messages', {
  messages = [],
  find(){
    return this.messages
  },
  create(data){
    this.messages.push(data)
    return data
  }
})

export default app
```

To test your app in development, I recommend using [Miniflare](https://miniflare.dev/) since [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/) does not yet support Durable Objects.

```bash
$ miniflare --watch --debug
```

You should now be able to navigate to [http://localhost:8787/messages](http://localhost:8787/messages) to see the messages list.  
To create a new message, simply make a HTTP POST request to [http://localhost:8787/messages](http://localhost:8787/messages)

You can publish your app to Cloudflare Workers.

```bash
$ wrangler publish
```

## License

Copyright (c) 2021

Licensed under the [MIT license](LICENSE).
